# X Long Image Viewer

A Chrome/Edge Manifest V3 extension for viewing X/Twitter images in a focused viewer with automatic viewport fitting, gallery navigation, zoom, and drag-to-pan controls.

## What's new in 2.0.0

- Select and copy English and Simplified Chinese text directly from images, or copy all recognized text.
- Use the redesigned toolbar and hover or focus on its controls for hints.
- See the image overview only when the image extends beyond the viewport; horizontal overview navigation is limited when the image fits.
- Handle extension reloads more gracefully when an existing X/Twitter tab still has an older content script.

## Development

```bash
npm install
npm run dev
```

`npm run dev` runs `vite build --watch` and writes extension files to `dist`.

After each rebuild, reload the unpacked extension from `chrome://extensions` or `edge://extensions`. Content scripts already injected into X/Twitter tabs keep the old bundle until the tab is refreshed.

## Build

```bash
npm run build
```

`npm run build` runs TypeScript checks and creates a production extension in `dist`. The generated directory includes:

- `manifest.json`
- `assets/content.js`
- `assets/content.css`
- `background.js` and `ocr/` for image text recognition
- `_locales/` for Chrome extension localization
- `icons/`

Only `package.json` needs to be edited for version changes. During build, `dist/manifest.json` is generated with the `package.json` version; `public/manifest.json` keeps a template version.

Load the generated `dist` directory from Chrome/Edge:

1. Open `chrome://extensions` or `edge://extensions`.
2. Enable developer mode.
3. Choose "Load unpacked".
4. Select this project's `dist` directory.
5. After rebuilding, click the extension reload button and refresh any open X/Twitter tabs.

To test the rating prompt during development, set `VITE_CHROME_WEB_STORE_EXTENSION_ID`, rebuild, reload the unpacked extension, then open the viewer at least five times. If the prompt was dismissed or deferred, clear the extension's local storage before testing again.

The rating prompt is disabled until the Chrome Web Store extension ID is configured. Set `VITE_CHROME_WEB_STORE_EXTENSION_ID` to the final ID segment from the published Chrome Web Store URL:

```bash
VITE_CHROME_WEB_STORE_EXTENSION_ID=abcdefghijklmnopabcdefghijklmnop npm run build
```

For a URL like `https://chromewebstore.google.com/detail/x-long-image-viewer/abcdefghijklmnopabcdefghijklmnop`, use only the final ID segment. You can also put the value in a local `.env` file based on `.env.example`. After changing the value, run `npm run build`, reload the unpacked extension, and refresh open X/Twitter tabs.

## Store package

```bash
npm run package
```

`npm run package` runs a fresh production build, removes the source map from the upload bundle, validates required files and locales, checks the rating prompt store ID configuration, and writes the store upload archive to `release/`.

When creating a store package with the rating prompt enabled, pass the same environment variable:

```bash
VITE_CHROME_WEB_STORE_EXTENSION_ID=abcdefghijklmnopabcdefghijklmnop npm run package
```

Store listing copy, privacy policy text, and the release checklist are in `store/`.

## Versioning

Update only `package.json`:

```json
"version": "2.0.0"
```

Then run `npm run build` or `npm run package`. The build script writes that version into `dist/manifest.json`, and the package script verifies the generated manifest version matches `package.json`.

## Controls

- Click an X/Twitter media image to open the enhanced viewer.
- Images automatically fit and center within the available viewport when opened.
- Use the previous and next buttons to browse every image in a multi-image post.
- On windows at least 900px wide, use the previous and next buttons at the left and right edges of the viewer.
- Click the zoom percentage in the toolbar to show the image at 100% size.
- Use the toolbar position button to move the toolbar to the top or bottom; the choice is saved for future viewer sessions.
- Mouse wheel scrolls vertically; hold `Ctrl` (or `Command` on macOS) while scrolling to zoom toward the pointer position.
- Drag pans the image.
- When the image exceeds 110% of the viewport in either dimension, use the overview in either lower corner to see and navigate the current viewport.
- Double-click toggles between fitted and enlarged view.
- Open the original image in a new tab from the toolbar.
- `Esc` closes the viewer.
- `+`, `-`, and `0` zoom or reset.
- Arrow keys nudge the image position.

## Image text selection

Click **Select text** in the viewer to recognize English and Simplified Chinese locally. Drag over the image text and press Ctrl+C / Command+C, or choose **Copy all**. Exit text mode to resume drag-to-pan. Scrolling, zooming and the overview remain available in text mode.

Recognition starts only on request. Results for up to eight images are kept in memory until the page reloads; images and recognized text are not uploaded. Models and the OCR engine are bundled, adding approximately 53 MB to the unpacked extension.

Requires Chrome/Edge 116 or newer. Reload the extension and refresh X/Twitter tabs after building; the new offscreen permission and pbs.twimg.com access support local recognition. Very large images (over 40 million pixels) are rejected to bound memory use. Small, rotated, handwritten or complex layouts may be inaccurate; reading order and selection alignment depend on OCR results.

Validation: `node --test scripts/test-ocr.mjs scripts/test-extension-context.mjs` checks message routing, allowed image URLs, concurrent offscreen creation and recovery. `npm run build` checks TypeScript and bundles all OCR assets. Before release, test the unpacked extension on X/Twitter, including reload, multi-image navigation, image loading failures and long-image performance.
