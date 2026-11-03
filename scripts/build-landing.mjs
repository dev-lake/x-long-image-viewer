import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../landing/', import.meta.url));
const origin = 'https://x-image-viewer.devlake.app';
const { version } = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const locales = ['zh-CN', 'en', 'ja', 'pt-BR'];
const dictionaries = await Promise.all(['main-locales.json', 'privacy-locales.json'].map(async name => JSON.parse(await readFile(`${root}source/${name}`, 'utf8'))));
const messages = Object.fromEntries(locales.map(locale => [locale, Object.assign({}, ...dictionaries.map(dictionary => dictionary[locale]))]));
const templates = Object.fromEntries(await Promise.all(['index', 'privacy', '404'].map(async name => [name, await readFile(`${root}source/${name}.html`, 'utf8')])));

const escapeAttribute = value => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
const localePath = (locale, page) => `/${locale}/${page === 'privacy' ? 'privacy/' : ''}`;

function translate(locale, key) {
  const value = messages[locale][key];
  if (typeof value !== 'string') throw new Error(`Missing ${locale} translation: ${key}`);
  return value.replaceAll('{version}', version).replaceAll('{percent}', '100').replaceAll('{number}', '1');
}

// Validate every locale against the full key set, so missing copy cannot silently ship.
const expectedKeys = Object.keys(messages['zh-CN']).sort();
for (const locale of locales) {
  const keys = Object.keys(messages[locale]).sort();
  if (JSON.stringify(keys) !== JSON.stringify(expectedKeys)) throw new Error(`Translation keys differ for ${locale}`);
}

function render(template, locale, page, fallback = false) {
  let html = template.replace(/<html\b[^>]*>/, `<html lang="${locale}" data-page="${page}"${fallback ? ' data-language-entry="true"' : ''}>`);
  html = html.replace(/<([a-z][\w:-]*)\b([^>]*\bdata-i18n="([^"]+)"[^>]*)>([\s\S]*?)<\/\1>/gi,
    (_, tag, attributes, key) => `<${tag}${attributes}>${translate(locale, key)}</${tag}>`);
  html = html.replace(/<([a-z][\w:-]*)\b([^>]*\bdata-i18n-attr="([^"]+)"[^>]*)>/gi, (_, tag, attributes, declarations) => {
    for (const declaration of declarations.split(';')) {
      const [attribute, key] = declaration.split(':');
      const translated = escapeAttribute(translate(locale, key));
      const pattern = new RegExp(`(?<=\\s)${attribute}="[^"]*"`, 'g');
      if (pattern.test(attributes)) attributes = attributes.replace(pattern, `${attribute}="${translated}"`);
      else attributes += ` ${attribute}="${translated}"`;
    }
    return `<${tag}${attributes}>`;
  });
  html = html.replace(/<a\b([^>]*\bdata-local-link="(home|privacy)"[^>]*)>/g, (_, attributes, target) => `<a${attributes.replace(/href="[^"]*"/, `href="${localePath(locale, target)}"`)}>`);
  html = html.replace(/<option value="([^"]+)"([^>]*)>/g, (_, value, attributes) => `<option value="${value}"${attributes}${value === locale ? ' selected' : ''}>`);
  if (page !== 'error') {
    const url = `${origin}${localePath(locale, page)}`;
    html = html.replace(/(<link rel="canonical" href=")[^"]+/, `$1${url}`);
    html = html.replace(/(<meta property="og:url" content=")[^"]+/, `$1${url}`);
    html = html.replace(/(<meta property="og:locale" content=")[^"]+/, `$1${({ 'zh-CN': 'zh_CN', en: 'en_US', ja: 'ja_JP', 'pt-BR': 'pt_BR' })[locale]}`);
    const alternates = locales.map(language => `<link rel="alternate" hreflang="${language}" href="${origin}${localePath(language, page)}">`).join('\n    ');
    const entry = `${origin}${page === 'privacy' ? '/privacy' : '/'}`;
    html = html.replace('</head>', `    ${alternates}\n    <link rel="alternate" hreflang="x-default" href="${entry}">\n  </head>`);
  }
  // The small runtime payload keeps controls functional even when fetch is unavailable.
  const runtimeMessages = Object.fromEntries(Object.entries(messages[locale]).filter(([key]) => /^(demo\.|toast\.|error\.|language\.)/.test(key)));
  const payload = JSON.stringify(runtimeMessages).replaceAll('<', '\\u003c');
  html = html.replace('</body>', `<script id="locale-messages" type="application/json" data-locale="${locale}">${payload}</script>\n  </body>`);
  return html;
}

for (const locale of locales) {
  await mkdir(`${root}${locale}/privacy`, { recursive: true });
  await writeFile(`${root}${locale}/index.html`, render(templates.index, locale, 'home'));
  await writeFile(`${root}${locale}/privacy/index.html`, render(templates.privacy, locale, 'privacy'));
  const runtimeMessages = Object.fromEntries(Object.entries(messages[locale]).filter(([key]) => /^(demo\.|toast\.|error\.|language\.)/.test(key)));
  await writeFile(`${root}${locale}/messages.json`, `${JSON.stringify(runtimeMessages)}\n`);
}
await writeFile(`${root}index.html`, render(templates.index, 'zh-CN', 'home', true));
await writeFile(`${root}privacy.html`, render(templates.privacy, 'zh-CN', 'privacy', true));
await writeFile(`${root}404.html`, render(templates['404'], 'zh-CN', 'error'));

const urls = locales.flatMap(locale => ['home', 'privacy'].map(page => {
  const alternates = locales.map(language => `    <xhtml:link rel="alternate" hreflang="${language}" href="${origin}${localePath(language, page)}"/>`).join('\n');
  return `  <url>\n    <loc>${origin}${localePath(locale, page)}</loc>\n${alternates}\n  </url>`;
}));
await writeFile(`${root}sitemap.xml`, `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`);
console.log(`Built landing page and privacy policy in ${locales.length} languages.`);
