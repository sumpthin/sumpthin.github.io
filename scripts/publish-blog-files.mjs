import { cp, mkdir, readdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = path.join(rootDir, "dist", "blog", "posts");
const publicDir = path.join(rootDir, "blog", "posts");
const generatedListing = path.join(rootDir, "dist", "blog", "posts.json");
const publicListing = path.join(rootDir, "blog", "posts.json");

await mkdir(publicDir, { recursive: true });

for (const fileName of await readdir(publicDir)) {
  if (fileName.endsWith(".html")) {
    await rm(path.join(publicDir, fileName));
  }
}

for (const fileName of await readdir(sourceDir)) {
  if (fileName.endsWith(".html")) {
    await cp(path.join(sourceDir, fileName), path.join(publicDir, fileName));
  }
}

await cp(generatedListing, publicListing);
