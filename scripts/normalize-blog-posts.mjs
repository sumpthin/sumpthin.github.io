import { access, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const postsDir = path.join(rootDir, "content", "blog");

function titleFromFileName(fileName) {
  const words = path.parse(fileName).name
    .replace(/[_-]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    throw new Error(`${fileName}: filename must contain a title.`);
  }

  return words
    .map((word) => `${word[0].toLocaleUpperCase()}${word.slice(1).toLocaleLowerCase()}`)
    .join(" ");
}

function slugFromTitle(title) {
  const asciiTitle = title.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  const slug = asciiTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (!slug) {
    throw new Error(`"${title}" must include a letter or number for the post URL.`);
  }
  return slug;
}

function summaryFromBody(body, title) {
  const firstLine = body.split(/\r?\n/).find((line) => line.trim() !== "");
  if (!firstLine) {
    return `A new post by Shyam Sundar.`;
  }

  const summary = firstLine
    .replace(/^\s{0,3}(?:#{1,6}\s+|>\s*|[-*+]\s+)/, "")
    .replace(/[*_`~]/g, "")
    .trim();
  return summary.slice(0, 157) + (summary.length > 157 ? "..." : "") || title;
}

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

let entries;
try {
  entries = await readdir(postsDir, { withFileTypes: true });
} catch (error) {
  if (error.code === "ENOENT") {
    process.exit(0);
  }
  throw error;
}

for (const entry of entries) {
  if (!entry.isFile() || entry.name.startsWith(".") || entry.name.endsWith(".md")) {
    continue;
  }

  const extension = path.extname(entry.name).toLowerCase();
  if (extension && extension !== ".txt") {
    throw new Error(
      `${entry.name}: use a plain text file with no extension or .txt, or write a .md post. ` +
      "Upload images to blog/images/ instead.",
    );
  }

  const title = titleFromFileName(entry.name);
  const slug = slugFromTitle(title);
  const markdownPath = path.join(postsDir, `${slug}.md`);
  const sourcePath = path.join(postsDir, entry.name);
  if (await exists(markdownPath)) {
    throw new Error(
      `${entry.name}: "${slug}.md" already exists. Rename the file to avoid a duplicate post.`,
    );
  }

  const body = (await readFile(sourcePath, "utf8")).trim();
  const date = new Date().toISOString().slice(0, 10);
  const description = summaryFromBody(body, title);
  await mkdir(postsDir, { recursive: true });
  await writeFile(
    markdownPath,
    [
      "---",
      `title: ${JSON.stringify(title)}`,
      `date: ${JSON.stringify(date)}`,
      `description: ${JSON.stringify(description)}`,
      "---",
      "",
      body,
      "",
    ].join("\n"),
    { encoding: "utf8", flag: "wx" },
  );
  await rm(sourcePath);
  console.log(`Converted ${entry.name} to content/blog/${slug}.md`);
}
