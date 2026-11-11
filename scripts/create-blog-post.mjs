import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const postsDir = path.join(rootDir, "content", "blog");

function requiredText(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} must not be empty.`);
  }
  return value;
}

function oneLine(value, name) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (!normalized) {
    throw new Error(`${name} must not be empty.`);
  }
  return normalized;
}

function postSlug(title) {
  const asciiTitle = title.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  const slug = asciiTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (!slug) {
    throw new Error("Title must include a letter or number for the post URL.");
  }
  return slug;
}

const title = oneLine(requiredText("BLOG_TITLE"), "Title");
const date = requiredText("BLOG_DATE");
const summary = oneLine(requiredText("BLOG_SUMMARY"), "Summary");
const body = requiredText("BLOG_BODY").replace(/\r\n/g, "\n");
const outputFile = process.env.GITHUB_OUTPUT;
if (!outputFile) {
  throw new Error("GITHUB_OUTPUT is not set; cannot report the created post path.");
}
const parsedDate = new Date(`${date}T00:00:00.000Z`);

if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== date) {
  throw new Error("Publish date must be a valid YYYY-MM-DD date.");
}

const slug = postSlug(title);
const postPath = path.join(postsDir, `${slug}.md`);

try {
  await access(postPath);
  throw new Error(`A post named "${slug}" already exists. Choose a different title.`);
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

await mkdir(postsDir, { recursive: true });
await writeFile(
  postPath,
  [
    "---",
    `title: ${JSON.stringify(title)}`,
    `date: ${JSON.stringify(date)}`,
    `description: ${JSON.stringify(summary)}`,
    "---",
    "",
    body,
    "",
  ].join("\n"),
  { encoding: "utf8", flag: "wx" },
);

await writeFile(outputFile, `path=content/blog/${slug}.md\n`, {
  encoding: "utf8",
  flag: "a",
});
