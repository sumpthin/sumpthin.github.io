# Blog publishing

Edit Markdown posts directly in [`content/blog/`](https://github.com/sumpthin/sumpthin.github.io/tree/main/content/blog),
or [create a new Markdown post](https://github.com/sumpthin/sumpthin.github.io/new/main/content/blog).
Commit changes to `main`; GitHub Actions automatically builds and publishes the
blog. Open an existing `.md` file and choose the pencil icon to edit it. To add
a post, create a new `.md` file with a lowercase, hyphen-separated filename,
such as `my-first-post.md`.

Each Markdown file starts with this front matter, followed by the post text:

```markdown
---
title: "My first post"
date: "2026-11-11"
description: "A short summary shown on the blog page."
---

Write the post here using Markdown.
```

Save and commit the Markdown file to `main`. The generated post will appear on
the public blog after the automatic build completes.

## Add images

Upload images to [`blog/images/`](https://github.com/sumpthin/sumpthin.github.io/upload/main/blog/images).
In the Markdown file, insert the image between paragraphs using a path relative
to the generated post page:

```markdown
![A description of the image](../images/my-photo.jpg)
```

For example, for `blog/images/lab-notes.jpg`, add
`![Lab notes](../images/lab-notes.jpg)` to your post. Commit the image and
Markdown file to `main`; the automatic workflow publishes both.

If you prefer a form instead of editing Markdown, use the
[guided publisher](https://github.com/sumpthin/sumpthin.github.io/actions/workflows/publish-blog.yml)
and select **Run workflow**.

## One-time GitHub Pages setup

In the repository settings, open **Pages** and set **Build and deployment →
Source** to **Deploy from a branch**, select `main` and `/(root)`. The included
GitHub Actions workflow builds each post and commits the generated public
listing and post pages to `blog/`. GitHub Pages serves those files from the
branch.

No separate password, personal access token, or third-party identity service is
needed. GitHub checks whether the signed-in account has repository write
access. Do not put credentials in the repository.

## Local build

Run `npm ci`, then `npm run build`. The generated site is written to `dist/`;
generated files are not meant to be edited directly.
