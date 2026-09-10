# Allen Mitchell Finance Portfolio — V3.2 FULL

This is a complete replacement repo. V3.2 fixes the homepage alignment:

- Full `ALLEN MITCHELL` wordmark fits inside the white nameplate without clipping.
- Nameplate, `Finance Portfolio`, project links, and footer icons share the same horizontal center axis.
- Project links are centered individually.
- Project detail page body copy remains left-aligned intentionally, matching the compact editorial reference layout.

Cloudflare settings:

```text
Build command: npm run build
Build output directory: dist
Root directory: blank
```


This is the complete replacement repository for the Cloudflare Pages site.

## Deploy
1. Delete the old files/folders from the GitHub repository.
2. Upload **everything inside this package** to the repository root.
3. Keep Cloudflare Pages configured with:
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: blank (or `/`)
4. Commit the files. Cloudflare should deploy automatically.

## Editing
Use Pages CMS to edit `Site Settings` and `Projects`.

The homepage uses:
- White ALLEN MITCHELL nameplate with black serif lettering
- Small typewriter-style `Finance Portfolio` heading
- Typewriter-style project links
- Black homepage / white project pages
- Red hover highlight

## Required repository root structure

```
content/
static/
dist/
.pages.yml
.gitignore
build.js
package.json
README.md
```