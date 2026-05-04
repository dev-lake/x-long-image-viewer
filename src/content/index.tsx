import React from "react";
import { createRoot, type Root } from "react-dom/client";
import { ImageViewer } from "../viewer/ImageViewer";
import "../styles/viewer.css";

const TWITTER_MEDIA_HOST = "pbs.twimg.com";
const TWITTER_MEDIA_PATH = "/media/";
const ROOT_ID = "x-pic-enhance-root";

type ViewerState = {
  imageUrl: string;
  sourceAlt: string;
};

let root: Root | null = null;
let mountNode: HTMLDivElement | null = null;
let restoreOverflow = "";

function getMountNode(): HTMLDivElement {
  const existing = document.getElementById(ROOT_ID);
  if (existing instanceof HTMLDivElement) {
    return existing;
  }

  const node = document.createElement("div");
  node.id = ROOT_ID;
  document.documentElement.appendChild(node);
  return node;
}

function normalizeMediaUrl(src: string): string | null {
  let url: URL;

  try {
    url = new URL(src, window.location.href);
  } catch {
    return null;
  }

  if (url.hostname !== TWITTER_MEDIA_HOST || !url.pathname.startsWith(TWITTER_MEDIA_PATH)) {
    return null;
  }

  url.searchParams.set("name", "orig");

  if (!url.searchParams.has("format")) {
    const extension = url.pathname.split(".").pop();
    if (extension && extension !== url.pathname) {
      url.searchParams.set("format", extension);
    }
  }

  return url.toString();
}

function findMediaImage(target: EventTarget | null): HTMLImageElement | null {
  if (!(target instanceof Element)) {
    return null;
  }

  const directImage = target.closest("img");
  if (directImage instanceof HTMLImageElement && normalizeMediaUrl(directImage.currentSrc || directImage.src)) {
    return directImage;
  }

  const mediaContainer = target.closest('[data-testid="tweetPhoto"], [data-testid="card.layoutLarge.media"], [data-testid="previewInterstitial"]');
  const nestedImage = mediaContainer?.querySelector("img");

  if (nestedImage instanceof HTMLImageElement && normalizeMediaUrl(nestedImage.currentSrc || nestedImage.src)) {
    return nestedImage;
  }

  return null;
}

function closeViewer(): void {
  root?.unmount();
  root = null;

  if (mountNode) {
    mountNode.remove();
    mountNode = null;
  }

  document.documentElement.style.overflow = restoreOverflow;
}

function openViewer(state: ViewerState): void {
  closeViewer();

  restoreOverflow = document.documentElement.style.overflow;
  document.documentElement.style.overflow = "hidden";

  mountNode = getMountNode();
  root = createRoot(mountNode);
  root.render(<ImageViewer imageUrl={state.imageUrl} sourceAlt={state.sourceAlt} onClose={closeViewer} />);
}

function handleDocumentClick(event: MouseEvent): void {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return;
  }

  const image = findMediaImage(event.target);
  const imageUrl = normalizeMediaUrl(image?.currentSrc || image?.src || "");

  if (!image || !imageUrl) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();

  openViewer({
    imageUrl,
    sourceAlt: image.alt || "X image"
  });
}

document.addEventListener("click", handleDocumentClick, true);
