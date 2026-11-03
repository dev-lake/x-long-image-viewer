# Release Checklist — 2.1.0

## Before Packaging

- Confirm `package.json` and both root entries in `package-lock.json` have release version `2.1.0`. `public/manifest.json` uses a template version; the build writes the package version into `dist/manifest.json`.
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
- Open toolbar settings and switch between top/bottom positions. Confirm the open panel follows the toolbar, remains on screen, and both the style and position persist after reopening.
- Switch between Classic and iOS Liquid Glass. Test light/dark image areas, dragging, zooming, a narrow window, GPU/context failure, and cross-origin sampling failure; the fallback must remain usable.
- Click the zoom percentage four times and confirm 50% → 80% → 100% → 50%, including keyboard activation.
- With `xpeTextSelectionGuideSeen` absent, confirm the guide highlights Select text, stays on screen with either toolbar position, and does not start recognition by itself. Confirm Start selecting begins recognition, dismissal persists, Escape closes the guide first, and settings can reopen it.
- Confirm ordinary mouse wheel input scrolls vertically and Ctrl/Command + mouse wheel zooms smoothly toward the pointer.
- Confirm toolbar, keyboard, and double-click zoom changes animate smoothly.
- Confirm the overview appears only when the image exceeds 110% of the viewport width or height, marks the current viewport, supports click-and-drag navigation, and remembers its corner. When image width fits, confirm overview dragging cannot move it sideways.
- Confirm no horizontal scrollbar appears at any zoom level and wide images remain horizontally navigable by dragging, arrow keys, and the overview.
- Confirm `dist/manifest.json` includes `default_locale`, `permissions: ["storage", "offscreen"]`, and localized `__MSG_...__` fields.
- Confirm `dist/manifest.json` has version `2.1.0` and matches `package.json`; Chrome/Edge 116 or newer is required.
- Confirm `dist/_locales` contains `en`, `ja`, `pt_BR`, and `zh_CN`.
- Test the rating prompt after at least five viewer opens. Clear extension local storage if a previous test selected later, no thanks, or rate.
- Confirm the rating review URL behavior: set `VITE_CHROME_WEB_STORE_EXTENSION_ID` to the final Chrome Web Store extension ID before publishing. Leave the variable unset only if the rating prompt should stay disabled.

## Package

```bash
VITE_CHROME_WEB_STORE_EXTENSION_ID=<chrome-web-store-extension-id> npm run package
```

The upload zip is written to `release/x-long-image-viewer-2.1.0.zip`. Omit `VITE_CHROME_WEB_STORE_EXTENSION_ID` only when intentionally packaging with the rating prompt disabled.

## Store Upload Fields

- Use `store/chrome-web-store.md` for the store listing text.
- Use `store/privacy-policy.md` as the privacy policy source. If the store requires a public URL, publish this content on a stable website and provide that URL.
- Upload promotional assets:
  - Small promotional tile: `store/assets/small-promo-440x280.png`
  - Top promotional tile: `store/assets/top-promo-1400x560.png`
- Upload the current 1280×800 screenshots from `store/assets/`:
  - `screenshot-2.1-toolbar-settings.png`: Liquid Glass, layout settings, and current controls.
  - `screenshot-2.1-text-guide.png`: first-use text selection guidance.
  - `screenshot-2.1-text-selection.png`: selected text and Copy all in the current toolbar.
- The screenshots use an authored sample image rendered with the current viewer in a local preview; they do not show private X posts. See `store/assets/README.md` for provenance.
- Replace legacy 1.x screenshots with current captures before publishing. Capture additional screenshots that show:
  - An image automatically fitted and centered in the full-page viewer.
  - Multi-image navigation controls.
  - Wide-screen edge navigation and the toolbar settings panel.
  - The redesigned toolbar and its button hints.
  - Text selection and copy-all controls on an English or Simplified Chinese image.
  - Smooth zoom controls and the viewport overview.
  - Drag or scroll behavior if the store supports promotional screenshots.

## Website and Documentation

- Run `npm run site:test` to regenerate and validate all four landing-page and privacy-policy locales.
- Confirm the generated version badge matches `package.json`, the zoom demo cycles through 50% / 80% / 100%, and the current screenshot is visible.
- Copy the release notes for the matching language from `store/release-notes-2.1.0.md`.
- Submit the extension and deploy the website only as explicit publishing steps after reviewing the prepared materials.

## Final Checks

- The zip should contain `manifest.json` at the package root.
- The zip should contain `assets/content.js`, `assets/content.css`, `_locales`, icons, and `LIQUID-GL-NOTICE.txt`.
- Do not upload the repository root, `node_modules`, or the `dist` folder wrapper itself.

- Verify local English/Chinese OCR, cross-line selection, Copy all, cache reuse, retry, zoom alignment, narrow windows, and image switching on X/Twitter.
- Confirm OCR scripts, WASM, language models, and licenses are present in the package; no remote OCR code is loaded.
