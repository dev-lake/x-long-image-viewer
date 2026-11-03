# Version 2.1.0 store assets

Prepared 2026-11-01. Use these files for the current release:

| File | Size | Content |
| --- | --- | --- |
| `screenshot-2.1-toolbar-settings.png` | 1280 × 800 | Liquid Glass style, toolbar placement settings, and current controls |
| `screenshot-2.1-text-guide.png` | 1280 × 800 | First-use text selection guide |
| `screenshot-2.1-text-selection.png` | 1280 × 800 | Selected image text and Copy all |
| `small-promo-440x280.png` | 440 × 280 | Current promotional tile |
| `top-promo-1400x560.png` | 1400 × 560 | Current wide promotional tile |

The screenshots render the current React viewer components in a local browser preview with the English interface and the authored image in `source/demo-image.svg`. They are examples, not captures of private X posts. Recognition results in `source/recognition-result.json` are produced with the bundled Tesseract engine and English/Simplified Chinese models from the rasterized sample image; the preview substitutes the extension messaging and storage bridge. The guide capture is taken before recognition starts. The screenshots preserve the actual toolbar, guide, settings, and selectable text layer.

`source/promo.html` lays out the promotional tiles with the current settings screenshot and existing extension icon. Render it at 1400 × 560, or append `?small` and render at 440 × 280. Keep the browser at device pixel ratio 1 and wait for images and fonts before capturing. The assets use system fonts and locally bundled files only.

The landing page uses a copy of `screenshot-2.1-text-selection.png` at `landing/assets/text-selection.png`. Its caption identifies the image as a local preview.

Older screenshots, source images, and earlier release captures are retained for reference. Do not mix them with the current 2.1.0 screenshots in a new submission.
