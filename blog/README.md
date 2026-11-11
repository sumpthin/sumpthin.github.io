# Blog publishing

The public blog is generated from Markdown posts in `content/blog/`. To publish,
sign in to GitHub with an account that has write access to this repository,
open [Publish a blog post](https://github.com/sumpthin/sumpthin.github.io/actions/workflows/publish-blog.yml),
select **Run workflow**, and fill in the title, date, summary, and article. The
workflow creates the Markdown file, builds the blog page, and publishes it.

You can also create a plain text file directly in `content/blog/` and commit it
to `main`. Every commit to `main` automatically runs the publishing workflow.
For a plain text file such as `Test 3`, the filename becomes the post title,
the first non-empty line becomes its summary, and the remaining text is the
article. The workflow converts it to a Markdown post and publishes it.

For more control, create a Markdown file with a lowercase, hyphen-separated
filename such as `my-first-post.md` and include all required front matter:

```markdown
---
title: "My first post"
date: "2026-11-11"
description: "A short summary shown on the blog page."
---

Write the post here using Markdown.
```

Commit the file or plain text post to `main`. GitHub Actions builds and
publishes it automatically.

## Add images

Upload image files to [`blog/images/`](https://github.com/sumpthin/sumpthin.github.io/upload/main/blog/images).
In your Markdown post, refer to each image relative to the generated post page:

```markdown
![A description of the image](../images/my-photo.jpg)
```

Commit the image and post to `main`; the automatic workflow publishes both.

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
