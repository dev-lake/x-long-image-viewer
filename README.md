# X Long Image Viewer

A Chrome/Edge Manifest V3 extension for viewing long images on X/Twitter with full-page scrolling, zoom, and drag-to-pan controls.

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
- `_locales/` for Chrome extension localization
- `icons/`

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

`npm run package` runs a fresh production build, removes the source map from the upload bundle, validates required files, and writes the store upload archive to `release/`.

When creating a store package with the rating prompt enabled, pass the same environment variable:

```bash
VITE_CHROME_WEB_STORE_EXTENSION_ID=abcdefghijklmnopabcdefghijklmnop npm run package
```

Store listing copy, privacy policy text, and the release checklist are in `store/`.

## Controls

- Click an X/Twitter media image to open the enhanced viewer.
- Mouse wheel scrolls the viewer.
- Drag pans the image.
- Double-click toggles between fitted and enlarged view.
- `Esc` closes the viewer.
- `+`, `-`, and `0` zoom or reset.
- Arrow keys nudge the image position.
