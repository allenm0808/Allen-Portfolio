const fs = require('fs');
const path = require('path');

const root = __dirname;
const out = path.join(root, 'dist');
const contentDir = path.join(root, 'content');
const projectsDir = path.join(contentDir, 'projects');
const staticDir = path.join(root, 'static');

function cleanOut() {
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });
}
function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    entry.isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d);
  }
}
function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function esc(value = '') {
  return String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
}
function slugify(value) {
  return String(value).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
function linkedinIcon() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M5.37 3.5A2.18 2.18 0 1 1 1 3.5a2.18 2.18 0 0 1 4.37 0ZM1.31 7.06h3.82V19H1.31V7.06Zm6.18 0h3.67v1.63h.05c.51-.97 1.76-1.99 3.63-1.99 3.88 0 4.6 2.55 4.6 5.87V19h-3.82v-5.7c0-1.36-.03-3.11-1.9-3.11-1.9 0-2.19 1.48-2.19 3.01V19H7.49V7.06Z"/></svg>`;
}
function mailIcon() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="14" rx="1"/><path d="m4 7 8 6 8-6"/></svg>`;
}
function documentShell(site, title, body, description='') {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description || site.title)}">
  <link rel="stylesheet" href="/styles.css">
  <style>:root{--background:${esc(site.background || '#ffffff')};--text:${esc(site.text_color || '#000000')};--highlight:${esc(site.highlight_color || '#ff0000')};}</style>
</head>
<body>${body}</body>
</html>`;
}

cleanOut();
copyDir(staticDir, out);

const site = readJson(path.join(contentDir, 'site.json'));
const projects = fs.readdirSync(projectsDir)
  .filter(name => name.endsWith('.json'))
  .map(name => {
    const p = readJson(path.join(projectsDir, name));
    p.slug = p.slug || slugify(p.title || path.basename(name, '.json'));
    return p;
  })
  .filter(p => p.published !== false)
  .sort((a,b) => (a.order ?? 999) - (b.order ?? 999) || a.title.localeCompare(b.title));

const menu = projects.map(p => `      <a class="project-link" href="/projects/${esc(p.slug)}/">${esc(p.homepage_label || p.title)}</a>`).join('\n');
const linkedIn = site.linkedin_url ? `<a class="social-link" href="${esc(site.linkedin_url)}" target="_blank" rel="noreferrer" aria-label="LinkedIn">${linkedinIcon()}</a>` : '';
const email = site.email ? `<a class="social-link" href="mailto:${esc(site.email)}" aria-label="Email">${mailIcon()}</a>` : '';

const home = `
<main class="portfolio-home">
  <section class="home-center" aria-labelledby="portfolio-title">
    <h1 class="site-title" id="portfolio-title">${esc(site.title)}</h1>
    <nav class="project-menu" aria-label="Projects">
${menu}
    </nav>
  </section>
  <footer class="social-footer">${linkedIn}${email}</footer>
</main>`;
fs.writeFileSync(path.join(out, 'index.html'), documentShell(site, site.title, home));

for (const p of projects) {
  const sections = Array.isArray(p.sections) ? p.sections.map(s => `
    <section class="project-section">
      ${s.title ? `<h2>${esc(s.title)}</h2>` : ''}
      ${s.body ? `<p>${esc(s.body)}</p>` : ''}
    </section>`).join('') : '';
  const gallery = Array.isArray(p.gallery) && p.gallery.length ? `
    <div class="project-gallery">
      ${p.gallery.map(img => `<img src="${esc(typeof img === 'string' ? img : img.image || '')}" alt="${esc(typeof img === 'string' ? p.title : img.alt || p.title)}" loading="lazy">`).join('\n')}
    </div>` : '';
  const external = p.external_link ? `<a class="external-link" href="${esc(p.external_link)}" target="_blank" rel="noreferrer">View project file ↗</a>` : '';
  const page = `
<main class="project-page">
  <a class="back-link" href="/">← Portfolio</a>
  <header class="project-header">
    <h1 class="project-title">${esc(p.title)}</h1>
    ${p.subtitle ? `<p class="project-subtitle">${esc(p.subtitle)}</p>` : ''}
    ${p.summary ? `<p class="project-summary">${esc(p.summary)}</p>` : ''}
  </header>
  ${sections}
  ${gallery}
  ${external}
</main>`;
  const dir = path.join(out, 'projects', p.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), documentShell(site, `${p.title} — ${site.title}`, page, p.summary));
}
console.log(`Built ${projects.length} project pages into dist/`);
