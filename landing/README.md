# Product landing page

Public URL: https://x-image-viewer.devlake.app

The page is a static website, kept separate from the browser extension. Edit the templates and four-language dictionaries in `source/`, and the shared `styles.css`, `language.css`, `app.js`, and `language.js`. Product images and the existing extension icon are in `assets/`. Run `npm run site:build` after source edits; generated HTML files should not be edited directly.

## Languages

Complete pages are generated for Simplified Chinese (`/zh-CN/`), English (`/en/`), Japanese (`/ja/`), and Brazilian Portuguese (`/pt-BR/`). Each includes a localized `/privacy/` page, metadata, canonical URL, and alternate-language links. The sitemap includes all eight URLs.

The `/` and legacy `/privacy` entry URLs select a language using a saved manual preference, then the first supported browser language, then English. Explicit localized URLs always take precedence. The language menu remembers the selected language in browser local storage and preserves the current page, query parameters, and section anchor. Browsing still works when local storage is blocked.

Error pages keep their 404 status and original URL while translating their content to match the URL language or preference. Runtime copy and demo text use the selected language; the screenshot uses the English interface of the current extension in a local preview with an authored sample image.

Translation source and templates are excluded from public assets. There are no translation-service requests or added runtime dependencies.

The interactive viewer uses authored example content to demonstrate scrolling, zooming, gallery navigation, and text selection. It does not run OCR on the website. The text-recognition section shows the current viewer component in a local preview; its screenshot is copied from `store/assets/screenshot-2.1-text-selection.png`. See `store/assets/README.md` for how release assets are captured.

The viewer demo also offers Classic / Liquid Glass styling, top / bottom placement, and a text-selection guide. These are page-local illustrative controls; they do not change installed extension preferences. The website uses CSS glass for the illustration, while the screenshots show the current extension's own components and rendering. Settings and guide images are copied from `store/assets/screenshot-2.1-toolbar-settings.png` and `store/assets/screenshot-2.1-text-guide.png`.

The version badge announces the published 2.1.0 release; the install buttons continue to use the existing Chrome Web Store listing.

## Preview

With Wrangler 4 installed and authenticated (builds before starting):

```sh
npm run site:dev
```

For a quick layout preview without Wrangler:

```sh
python3 -m http.server 4173 --directory landing
```

Run `npm run site:build` first when using the simple Python server. It serves the generated language directories, but does not implement Cloudflare's legacy extensionless HTML routes, custom 404 handling, or `_headers`; use Wrangler or the deployed site for those checks.

## Check

```sh
npm run site:test
```

Tests cover language detection, preferences, URL precedence, missing-page behavior, localized metadata, and translation completeness.

## Deploy

```sh
npm run site:deploy
```

The deploy command regenerates all four languages. `wrangler.jsonc` publishes only this directory through Cloudflare Workers static assets, and binds `x-image-viewer.devlake.app` as a custom domain. Cloudflare manages the DNS record and TLS certificate. `.assetsignore` excludes source templates, dictionaries, deployment configuration, and documentation from public assets.

The install links point to the published listing:
https://chromewebstore.google.com/detail/kfgjonhfdgkjebiabmnipfpjeocffnoi

The page uses no external fonts, trackers, analytics, or runtime packages. The version badge reads `package.json` during `site:build`. Update feature copy, privacy details, and the current viewer screenshot when preparing a new release. The website zoom percentage demo cycles through 50%, 80%, and 100%, matching version 2.1.0.

`_headers` sends `Cache-Control: no-transform` to prevent automatic analytics-beacon injection by the Cloudflare zone, alongside a same-origin content security policy.
