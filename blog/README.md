# Blog publishing

The public blog is generated from Markdown posts in `content/blog/`. To write
or edit a post, open `/admin/` on the Netlify-hosted site and sign in with your
invited Netlify Identity account. Publishing a post saves it to GitHub and
starts a Netlify deploy; the post appears publicly when that deploy completes.

## One-time Netlify setup

1. Import this GitHub repository into Netlify and deploy the `main` branch.
   The included `netlify.toml` builds the site into `dist/`.
2. In Netlify, enable **Identity** for the site. Keep registration
   **Invite only**; do not enable open registration.
3. Invite your own email address under Identity, then enable **Git Gateway**
   in the site's Identity settings.
4. Open `/admin/` on the Netlify site and sign in using the invitation.
5. Use the Netlify site URL, or connect a custom domain that you own and point
   its DNS to Netlify. The default `*.github.io` address cannot be moved to
   Netlify. GitHub Pages does not run the authenticated CMS or blog build, so
   the Netlify deployment must serve the public site.

Netlify Identity and Git Gateway keep publishing credentials out of the
repository and browser source. Never add a password or access token to this
project.

## Local build

Run `npm install` once, then `npm run build`. The generated site is written to
`dist/`; generated files are not meant to be edited directly.
