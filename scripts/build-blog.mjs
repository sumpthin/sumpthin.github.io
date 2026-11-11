import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(rootDir, "dist");
const postsDir = path.join(rootDir, "content", "blog");
const excludedDirectories = new Set([
  ".git",
  ".vscode",
  ".parcel-cache",
  "content",
  "dist",
  "node_modules",
  "scripts",
]);
const excludedRootFiles = new Set([
  "netlify.toml",
  "package-lock.json",
  "package.json",
]);

function shouldCopy(source) {
  const relativePath = path.relative(rootDir, source);
  if (!relativePath) return true;

  const segments = relativePath.split(path.sep);
  if (segments.some((segment) => excludedDirectories.has(segment))) return false;
  if (segments.length === 1 && excludedRootFiles.has(segments[0])) return false;
  if (relativePath === path.join("blog", "template.html")) return false;
  if (segments[0] === "blog" && segments[1] === "posts") return false;
  return true;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function requireText(value, field, fileName) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${fileName}: "${field}" must be a non-empty string.`);
  }
  return value.trim();
}

function validateDate(value, fileName) {
  const date = value instanceof Date && !Number.isNaN(value.getTime())
    ? value.toISOString().slice(0, 10)
    : requireText(value, "date", fileName);
  const parsedDate = new Date(`${date}T00:00:00.000Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== date) {
    throw new Error(`${fileName}: "date" must be a valid YYYY-MM-DD date.`);
  }
  return date;
}

function renderMarkdown(markdown) {
  const html = marked.parse(markdown);
  return sanitizeHtml(html, {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, "img", "figure", "figcaption"],
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "alt", "title", "width", "height"],
    },
    allowProtocolRelative: false,
  });
}

async function loadPosts() {
  let fileNames;
  try {
    fileNames = await readdir(postsDir);
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }

  const posts = [];
  for (const fileName of fileNames.filter((name) => name.endsWith(".md"))) {
    const slug = path.basename(fileName, ".md");
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      throw new Error(`${fileName}: filename must use lowercase letters, numbers, and hyphens.`);
    }

    const filePath = path.join(postsDir, fileName);
    const parsed = matter(await readFile(filePath, "utf8"));
    posts.push({
      slug,
      title: requireText(parsed.data.title, "title", fileName),
      date: validateDate(parsed.data.date, fileName),
      description: requireText(parsed.data.description, "description", fileName),
      body: parsed.content,
    });
  }
  return posts.sort((first, second) => second.date.localeCompare(first.date));
}

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });
for (const entry of await readdir(rootDir)) {
  const source = path.join(rootDir, entry);
  if (!shouldCopy(source)) continue;
  await cp(source, path.join(distDir, entry), { recursive: true, filter: shouldCopy });
}

const posts = await loadPosts();
const template = await readFile(path.join(rootDir, "blog", "template.html"), "utf8");
const postOutputDir = path.join(distDir, "blog", "posts");
await mkdir(postOutputDir, { recursive: true });

for (const post of posts) {
  const page = template
    .replaceAll("{{TITLE}}", escapeHtml(post.title))
    .replace("{{DATE}}", escapeHtml(post.date))
    .replace("{{BODY}}", renderMarkdown(post.body));
  await writeFile(path.join(postOutputDir, `${post.slug}.html`), page);
}

const publicPosts = posts.map(({ body, ...post }) => post);
await writeFile(
  path.join(distDir, "blog", "posts.json"),
  `${JSON.stringify(publicPosts, null, 2)}\n`,
);
