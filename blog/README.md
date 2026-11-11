# Blog publishing

The public blog is generated from Markdown posts in `content/blog/`. To publish,
sign in to GitHub with an account that has write access to this repository, then
[create a Markdown file in `content/blog/`](https://github.com/sumpthin/sumpthin.github.io/new/main/content/blog).
Use a lowercase, hyphen-separated filename such as `my-first-post.md` and this
front matter:

```markdown
---
title: "My first post"
date: "2026-11-11"
description: "A short summary shown on the blog page."
---

Write the post here using Markdown.
```

Commit the file to `main`. GitHub Actions builds and deploys the updated site;
the post appears publicly after deployment finishes.

## One-time GitHub Pages setup

In the repository settings, open **Pages** and set **Build and deployment →
Source** to **GitHub Actions**. The included workflow then builds and deploys
the site on pushes to `main`.

No separate password, personal access token, or third-party identity service is
needed. GitHub checks whether the signed-in account has repository write
access. Do not put credentials in the repository.

## Local build

Run `npm ci`, then `npm run build`. The generated site is written to `dist/`;
generated files are not meant to be edited directly.
