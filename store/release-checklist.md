# Release Checklist

## Before Packaging

- Confirm `public/manifest.json` has the correct `name`, `description`, and `version`.
- Confirm all required icons exist:
  - `public/icons/icon-16.png`
  - `public/icons/icon-32.png`
  - `public/icons/icon-48.png`
  - `public/icons/icon-128.png`
- Run `npm install` if dependencies are missing.
- Run `npm run build`.
- Load `dist` as an unpacked extension in Chrome or Edge.
- Test on `https://x.com/` and `https://twitter.com/`.

## Package

```bash
npm run package
```

The upload zip is written to `release/`.

## Store Upload Fields

- Use `store/chrome-web-store.md` for the store listing text.
- Use `store/privacy-policy.md` as the privacy policy source. If the store requires a public URL, publish this content on a stable website and provide that URL.
- Upload promotional assets:
  - Small promotional tile: `store/assets/small-promo-440x280.png`
  - Top promotional tile: `store/assets/top-promo-1400x560.png`
- Upload screenshots that show:
  - A long image opened in the full-page viewer.
  - Zoom controls.
  - Drag or scroll behavior if the store supports promotional screenshots.

## Final Checks

- The zip should contain `manifest.json` at the package root.
- The zip should contain `assets/content.js`, `assets/content.css`, and icons.
- Do not upload the repository root, `node_modules`, or the `dist` folder wrapper itself.
