# Privacy Policy

Effective date: 2026-08-04

X Long Image Viewer is a browser extension for viewing long images on X/Twitter.

## Data Collection

The extension does not collect, sell, or transmit personal information.

The extension does not collect:
- Personally identifiable information
- Authentication information
- Browsing history
- Website content
- Location data
- User activity analytics

## How The Extension Works

The extension runs a content script only on x.com and twitter.com. When the user clicks an X/Twitter media image, the extension reads that image URL from the current page and opens it in a local viewer inside the browser tab.

The selected image URL is used only for the viewer. It is not sent to the extension developer or to any third-party service.

The extension stores non-personal viewer preferences and rating prompt state locally in the browser. This includes the selected toolbar position, how many times the viewer has opened, and whether the user dismissed the prompt. These values are used only to preserve the selected interface layout and avoid showing repeated prompts.

## Permissions

The extension requests host access for:
- https://x.com/*
- https://twitter.com/*

This access is required so the extension can detect clicked media images and display the enhanced viewer on those websites.

The extension also requests the Chrome storage permission to save the toolbar position preference and local rating prompt state. Stored values stay in the browser and are not transmitted.

## Remote Services

The extension does not operate a backend server, does not use analytics, and does not include remote code.

## Contact

For privacy questions, contact the extension publisher through the support contact listed in the browser extension store.
