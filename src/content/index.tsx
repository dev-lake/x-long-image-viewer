import React from "react";
import { createRoot, type Root } from "react-dom/client";
import { preloadImage } from "../imageLoader";
import { t } from "../i18n";
import { ImageViewer } from "../viewer/ImageViewer";
import "../styles/viewer.css";

const TWITTER_MEDIA_HOST = "pbs.twimg.com";
const TWITTER_MEDIA_PATH = "/media/";
const ROOT_ID = "x-pic-enhance-root";

type ViewerState = {
  images: ViewerImage[];
  initialIndex: number;
};

type ViewerImage = {
  url: string;
  previewUrl: string;
  alt: string;
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

function findTweetContainer(image: HTMLImageElement): Element | null {
  return image.closest('article[data-testid="tweet"]') ?? image.closest("article");
}

function collectTweetImages(clickedImage: HTMLImageElement): ViewerImage[] {
  const tweetContainer = findTweetContainer(clickedImage);
  if (!tweetContainer) {
    return [];
  }

  const seenUrls = new Set<string>();
  const images: ViewerImage[] = [];

  tweetContainer.querySelectorAll("img").forEach((image) => {
    if (!(image instanceof HTMLImageElement)) {
      return;
    }

    if (image.closest("article") !== tweetContainer) {
      return;
    }

    const imageUrl = normalizeMediaUrl(image.currentSrc || image.src || "");
    if (!imageUrl || seenUrls.has(imageUrl)) {
      return;
    }

    seenUrls.add(imageUrl);
    images.push({
      url: imageUrl,
      previewUrl: image.currentSrc || image.src || imageUrl,
      alt: image.alt || t("defaultImageAlt")
    });
  });

  return images;
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
  root.render(<ImageViewer images={state.images} initialIndex={state.initialIndex} onClose={closeViewer} />);
}

function handleDocumentClick(event: MouseEvent): void {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return;
  }

  if (event.target instanceof Element && event.target.closest(`#${ROOT_ID}`)) {
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

  // Start the original request before React mounts; the already-rendered X image
  // remains available as an instant preview while this request completes.
  void preloadImage(imageUrl, "high").catch(() => undefined);

  const tweetImages = collectTweetImages(image);
  const images =
    tweetImages.length > 0
      ? tweetImages
      : [{ url: imageUrl, previewUrl: image.currentSrc || image.src || imageUrl, alt: image.alt || t("defaultImageAlt") }];
  const initialIndex = Math.max(
    0,
    images.findIndex((tweetImage) => tweetImage.url === imageUrl)
  );

  openViewer({
    images,
    initialIndex
  });
}

document.addEventListener("click", handleDocumentClick, true);
