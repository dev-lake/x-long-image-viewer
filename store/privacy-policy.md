# Privacy Policy

Effective date: 2026-10-27

X Long Image Viewer is a browser extension for viewing long images on X/Twitter.

## Data Collection

The extension does not send personal information or page content to the developer, sell it, or use it for analytics.

The extension does not collect:
- Personally identifiable information
- Authentication information
- Browsing history
- Website content for analytics or transmission to the developer
- Location data
- User activity analytics

## How The Extension Works

The extension runs a content script only on x.com and twitter.com. When the user clicks an X/Twitter media image, the extension reads that image URL from the current page and opens it in a local viewer inside the browser tab.

The selected image URL is used for the viewer and, when requested, text recognition. The browser requests the selected image from X/Twitter’s image host; the URL is not sent to the extension developer or an OCR service.

The extension stores non-personal viewer preferences and rating prompt state locally in the browser. This includes the selected toolbar position, how many times the viewer has opened, and whether the user dismissed the prompt. These values are used only to preserve the selected interface layout and avoid showing repeated prompts.

When the user chooses Select text, the extension downloads the selected image from X/Twitter’s image host and recognizes English and Simplified Chinese on the device. Recognized text is cached temporarily in page memory (up to eight images), is cleared when the page reloads, and is copied to the clipboard only at the user’s request. Images and recognized text are not uploaded to an OCR service.

## Permissions

The extension requests host access for:
- https://x.com/*
- https://twitter.com/*
- https://pbs.twimg.com/*

This access is required so the extension can detect clicked media images and display the enhanced viewer on those websites.

Access to pbs.twimg.com lets the extension fetch only the selected media image for local recognition. The offscreen permission runs the bundled OCR worker in a local extension document.

The extension also requests the Chrome storage permission to save the toolbar position preference and local rating prompt state. Stored values stay in the browser and are not transmitted.

## Remote Services

The extension does not operate a backend server, does not use analytics, and does not include remote code.

## Contact

For privacy questions, contact the extension publisher through the support contact listed in the browser extension store.
