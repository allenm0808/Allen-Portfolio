# Allen Mitchell Portfolio

A minimal static portfolio inspired by the Plain Jane Shopify center-menu layout.

## How content works

- Edit `content/site.json` for title, LinkedIn, email, and colors.
- Each file in `content/projects/` is one project.
- Adding/removing a project file automatically adds/removes it from the homepage on the next build.
- Pages CMS uses `.pages.yml` to provide a friendly browser editor.

## Local preview

1. Install Node.js.
2. Run `npm run build`.
3. Open `dist/index.html` or serve the `dist/` directory with any local static server.

## Cloudflare Pages settings

Connect this repository to Cloudflare Pages.

- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: leave blank

Every commit to the production branch triggers a new deployment.

## Pages CMS

1. Go to https://app.pagescms.org
2. Sign in with GitHub and authorize this repository.
3. Pages CMS will detect `.pages.yml`.
4. Use **Projects** to create/edit/delete projects and **Site settings** to update the title/social links.

## Before publishing

Replace the placeholder LinkedIn URL and email in `content/site.json` (or via Pages CMS).
