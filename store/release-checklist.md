# Release Checklist

## Before Packaging

- Confirm `package.json` has the release `version`. `public/manifest.json` uses a template version; the build writes the package version into `dist/manifest.json`.
- Confirm `public/_locales/en`, `public/_locales/ja`, `public/_locales/pt_BR`, and `public/_locales/zh_CN` all include `messages.json`.
- Confirm all required icons exist:
  - `public/icons/icon-16.png`
  - `public/icons/icon-32.png`
  - `public/icons/icon-48.png`
  - `public/icons/icon-128.png`
- Run `npm install` if dependencies are missing.
- Run `node --test scripts/test-ocr.mjs scripts/test-extension-context.mjs`.
- Run `VITE_CHROME_WEB_STORE_EXTENSION_ID=<chrome-web-store-extension-id> npm run build` if the rating prompt should be enabled. Run `npm run build` without the variable only if the prompt should stay disabled.
- Load `dist` as an unpacked extension in Chrome or Edge.
- Reload the unpacked extension after every rebuild and refresh open X/Twitter tabs so the latest content script is injected.
- Test on `https://x.com/` and `https://twitter.com/`.
- Confirm newly opened images fit the available viewport and are centered vertically and horizontally.
- Confirm the cached page preview appears immediately while the original image loads, without a blank or enlarged-image flash.
- Confirm multi-image navigation works and Open/Close remain visible in narrow windows.
- At 900px or wider, confirm previous and next buttons appear at the left and right edges and disable correctly on the first and last images.
- Confirm the toolbar position button moves the toolbar between the top and bottom, persists after reopening the viewer, and does not overlap the rating prompt.
- Confirm ordinary mouse wheel input scrolls vertically and Ctrl/Command + mouse wheel zooms smoothly toward the pointer.
- Confirm toolbar, keyboard, and double-click zoom changes animate smoothly.
- Confirm the overview appears only when the image exceeds 110% of the viewport width or height, marks the current viewport, supports click-and-drag navigation, and remembers its corner. When image width fits, confirm overview dragging cannot move it sideways.
- Confirm no horizontal scrollbar appears at any zoom level and wide images remain horizontally navigable by dragging, arrow keys, and the overview.
- Confirm `dist/manifest.json` includes `default_locale`, `permissions: ["storage", "offscreen"]`, and localized `__MSG_...__` fields.
- Confirm `dist/manifest.json` has version `2.0.0` and matches `package.json`; Chrome/Edge 116 or newer is required.
- Confirm `dist/_locales` contains `en`, `ja`, `pt_BR`, and `zh_CN`.
- Test the rating prompt after at least five viewer opens. Clear extension local storage if a previous test selected later, no thanks, or rate.
- Confirm the rating review URL behavior: set `VITE_CHROME_WEB_STORE_EXTENSION_ID` to the final Chrome Web Store extension ID before publishing. Leave the variable unset only if the rating prompt should stay disabled.

## Package

```bash
VITE_CHROME_WEB_STORE_EXTENSION_ID=<chrome-web-store-extension-id> npm run package
```

The upload zip is written to `release/`. Omit `VITE_CHROME_WEB_STORE_EXTENSION_ID` only when intentionally packaging with the rating prompt disabled.

## Store Upload Fields

- Use `store/chrome-web-store.md` for the store listing text.
- Use `store/privacy-policy.md` as the privacy policy source. If the store requires a public URL, publish this content on a stable website and provide that URL.
- Upload promotional assets:
  - Small promotional tile: `store/assets/small-promo-440x280.png`
  - Top promotional tile: `store/assets/top-promo-1400x560.png`
- Upload `store/assets/screenshot-2.0-text-selection.png` for the 2.0 interface and image text selection. It uses a sample image rendered in a local preview.
- Replace legacy 1.x screenshots with current captures before publishing. Capture additional screenshots that show:
  - An image automatically fitted and centered in the full-page viewer.
  - Multi-image navigation controls.
  - Wide-screen edge navigation and the toolbar position control.
  - The redesigned toolbar and its button hints.
  - Text selection and copy-all controls on an English or Simplified Chinese image.
  - Smooth zoom controls and the viewport overview.
  - Drag or scroll behavior if the store supports promotional screenshots.

## Final Checks

- The zip should contain `manifest.json` at the package root.
- The zip should contain `assets/content.js`, `assets/content.css`, `_locales`, and icons.
- Do not upload the repository root, `node_modules`, or the `dist` folder wrapper itself.

- Verify local English/Chinese OCR, cross-line selection, Copy all, cache reuse, retry, zoom alignment, narrow windows, and image switching on X/Twitter.
- Confirm OCR scripts, WASM, language models, and licenses are present in the package; no remote OCR code is loaded.
