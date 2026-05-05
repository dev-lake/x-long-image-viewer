# X Long Image Viewer

A Chrome/Edge Manifest V3 extension for viewing long images on X/Twitter with full-page scrolling, zoom, and drag-to-pan controls.

## Development

```bash
npm install
npm run dev
```

`npm run dev` watches the content script bundle and writes extension files to `dist`.

## Build

```bash
npm run build
```

Load the generated `dist` directory from Chrome/Edge:

1. Open `chrome://extensions` or `edge://extensions`.
2. Enable developer mode.
3. Choose "Load unpacked".
4. Select this project's `dist` directory.

## Store package

```bash
npm run package
```

The store upload archive is generated in `release/`. Store listing copy, privacy policy text, and the release checklist are in `store/`.

## Controls

- Click an X/Twitter media image to open the enhanced viewer.
- Mouse wheel scrolls the viewer.
- Drag pans the image.
- Double-click toggles between fitted and enlarged view.
- `Esc` closes the viewer.
- `+`, `-`, and `0` zoom or reset.
- Arrow keys nudge the image position.
