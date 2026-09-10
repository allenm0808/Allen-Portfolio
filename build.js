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
    const source = path.join(src, entry.name);
    const target = path.join(dest, entry.name);
    entry.isDirectory() ? copyDir(source, target) : fs.copyFileSync(source, target);
  }
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function esc(value = '') {
  return String(value).replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[ch]));
}

function safeUrl(value = '') {
  const url = String(value).trim();
  if (!url || /YOUR-LINKEDIN/i.test(url)) return '';
  return url;
}

function safeEmail(value = '') {
  const email = String(value).trim();
  if (!email || /YOUR-EMAIL/i.test(email)) return '';
  return email;
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function linkedinIcon() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M5.21 3.36A2.2 2.2 0 1 1 .81 3.36a2.2 2.2 0 0 1 4.4 0ZM1.16 7.02h4.1V20h-4.1V7.02Zm6.74 0h3.93v1.77h.06c.55-1.04 1.89-2.14 3.89-2.14 4.16 0 4.93 2.74 4.93 6.3V20h-4.1v-6.25c0-1.49-.03-3.4-2.07-3.4-2.08 0-2.4 1.62-2.4 3.3V20H7.9V7.02Z"/></svg>`;
}

function mailIcon() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2.8" y="5" width="18.4" height="14"/><path d="m3.6 6.4 8.4 6.2 8.4-6.2"/></svg>`;
}

function socialLinks(site, className = 'social-links') {
  const linkedin = safeUrl(site.linkedin_url);
  const email = safeEmail(site.email);
  if (!linkedin && !email) return '';

  return `<div class="${className}" aria-label="Contact links">
    ${linkedin ? `<a class="social-link" href="${esc(linkedin)}" target="_blank" rel="noreferrer" aria-label="LinkedIn">${linkedinIcon()}</a>` : ''}
    ${email ? `<a class="social-link" href="mailto:${esc(email)}" aria-label="Email">${mailIcon()}</a>` : ''}
  </div>`;
}

function brand(site, linkHome = false) {
  const wordmark = String(site.wordmark || 'Allen Mitchell').trim() || 'Allen Mitchell';
  const header = String(site.portfolio_header || 'Finance Portfolio').trim() || 'Finance Portfolio';
  const inner = `<span class="brand-text">${esc(wordmark)}</span>`;
  const mark = linkHome
    ? `<a class="brand-mark" href="/" aria-label="Back to portfolio">${inner}</a>`
    : `<div class="brand-mark">${inner}</div>`;
  return `<div class="brand-lockup">${mark}<div class="brand-title">${esc(header)}</div></div>`;
}

function colors(site) {
  return {
    homeBackground: site.home_background || site.background || '#000000',
    homeText: site.home_text_color || site.text_color || '#ffffff',
    pageBackground: site.page_background || '#ffffff',
    pageText: site.page_text_color || '#000000',
    accent: site.accent_color || site.highlight_color || '#FE0100'
  };
}

function documentShell(site, title, body, pageClass, description = '') {
  const c = colors(site);
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="${esc(pageClass === 'home-theme' ? c.homeBackground : c.pageBackground)}">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description || site.title)}">
  <link rel="stylesheet" href="/styles.css">
  <style>:root{--home-bg:${esc(c.homeBackground)};--home-text:${esc(c.homeText)};--page-bg:${esc(c.pageBackground)};--page-text:${esc(c.pageText)};--accent:${esc(c.accent)};}</style>
</head>
<body class="${pageClass}">
${body}
</body>
</html>`;
}

cleanOut();
copyDir(staticDir, out);

if (!fs.existsSync(path.join(contentDir, 'site.json'))) throw new Error('Missing content/site.json');
if (!fs.existsSync(projectsDir)) throw new Error('Missing content/projects directory');

const site = readJson(path.join(contentDir, 'site.json'));
const projects = fs.readdirSync(projectsDir)
  .filter(name => name.endsWith('.json'))
  .map(name => {
    const project = readJson(path.join(projectsDir, name));
    project.slug = project.slug || slugify(project.title || path.basename(name, '.json'));
    return project;
  })
  .filter(project => project.published !== false)
  .sort((a, b) => (a.order ?? 999) - (b.order ?? 999) || a.title.localeCompare(b.title));

const menu = projects.map(project => {
  const label = project.homepage_label && project.homepage_label.trim() ? project.homepage_label : project.title;
  return `<a class="project-link" href="/projects/${esc(project.slug)}/">${esc(label)}</a>`;
}).join('\n');

const home = `<main class="portfolio-home">
  <header class="home-brand">
    ${brand(site, false)}
  </header>

  <nav class="project-menu" aria-label="Finance projects">
    ${menu}
  </nav>

  <footer class="home-footer">
    ${socialLinks(site)}
  </footer>
</main>`;

fs.writeFileSync(path.join(out, 'index.html'), documentShell(site, site.title, home, 'home-theme'));

for (const project of projects) {
  const sections = Array.isArray(project.sections)
    ? project.sections.map(section => `<section class="project-section">
        ${section.title ? `<h2>${esc(section.title)}</h2>` : ''}
        ${section.body ? `<p>${esc(section.body)}</p>` : ''}
      </section>`).join('\n')
    : '';

  const galleryItems = Array.isArray(project.gallery)
    ? project.gallery.filter(item => typeof item === 'string' ? item : item && item.image)
    : [];

  const gallery = galleryItems.length
    ? `<div class="project-gallery">
        ${galleryItems.map(item => {
          const image = typeof item === 'string' ? item : item.image;
          const alt = typeof item === 'string' ? project.title : (item.alt || project.title);
          return `<figure><img src="${esc(image)}" alt="${esc(alt)}" loading="lazy"></figure>`;
        }).join('\n')}
      </div>`
    : '';

  const external = project.external_link
    ? `<p class="project-external"><a class="text-highlight-link" href="${esc(project.external_link)}" target="_blank" rel="noreferrer">${esc(project.external_link_label || 'View Project File')} ↗</a></p>`
    : '';

  const page = `<main class="project-page">
    <header class="project-brand">
      ${brand(site, true)}
    </header>

    <article class="project-content">
      <header class="project-header">
        <h1>${esc(project.title)}</h1>
        ${project.subtitle ? `<p class="project-subtitle">${esc(project.subtitle)}</p>` : ''}
      </header>
      ${project.summary ? `<p class="project-summary">${esc(project.summary)}</p>` : ''}
      ${sections}
      ${gallery}
      ${external}
    </article>

    <footer class="project-footer">
      ${socialLinks(site, 'project-social-links')}
    </footer>
  </main>`;

  const dir = path.join(out, 'projects', project.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), documentShell(site, `${project.title} — ${site.title}`, page, 'project-theme', project.summary));
}

console.log(`Built ${projects.length} project pages into dist/`);
