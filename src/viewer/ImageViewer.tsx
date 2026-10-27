import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { recognizeImage, type OcrResult } from "../ocr/client";
import { TextLayer } from "../ocr/TextLayer";
import { Toolbar } from "./Toolbar";
import { preloadImage } from "../imageLoader";
import { t } from "../i18n";
import {
  readNavigatorPosition,
  writeNavigatorPosition,
  type NavigatorPosition
} from "../navigatorPreference";
import {
  deferRatingPrompt,
  declineRatingPrompt,
  markRatingPromptAccepted,
  recordViewerOpenAndGetRatingPrompt,
  type RatingPromptState
} from "../ratingPrompt";
import { readToolbarPosition, writeToolbarPosition, type ToolbarPosition } from "../toolbarPreference";

type ImageViewerProps = {
  images: ViewerImage[];
  initialIndex: number;
  onClose: () => void;
};

type ViewerImage = {
  url: string;
  previewUrl: string;
  alt: string;
};

type Point = {
  x: number;
  y: number;
};

type NavigatorViewport = Point & {
  width: number;
  height: number;
};

const MIN_SCALE = 0.2;
const MIN_FIT_SCALE = 0.01;
const MAX_SCALE = 6;
const SCALE_STEP = 1.2;
const NAVIGATOR_MAX_WIDTH = 180;
const NAVIGATOR_MAX_HEIGHT = 120;
const NAVIGATOR_OVERFLOW_THRESHOLD = 1.1;
const ZOOM_ANIMATION_DURATION = 220;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function formatScale(scale: number): string {
  return `${Math.round(scale * 100)}%`;
}

function calculateFitScale(imageWidth: number, imageHeight: number, viewportWidth: number, viewportHeight: number): number {
  const isNarrowViewport = viewportWidth <= 560;
  const horizontalPadding = isNarrowViewport ? 48 : 96;
  const verticalPadding = isNarrowViewport ? 128 : 160;
  const widthScale = (viewportWidth - horizontalPadding) / imageWidth;
  const heightScale = (viewportHeight - verticalPadding) / imageHeight;

  return clamp(Math.min(widthScale, heightScale), MIN_FIT_SCALE, 1);
}

function OpenIcon() {
  return (
    <svg className="xpe-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14 5h5v5" />
      <path d="M10 14 19 5" />
      <path d="M19 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="xpe-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function PreviousIcon() {
  return (
    <svg className="xpe-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function NextIcon() {
  return (
    <svg className="xpe-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function ToolbarPositionIcon({ position }: { position: ToolbarPosition }) {
  const isAtTop = position === "top";

  return (
    <svg className="xpe-icon" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d={isAtTop ? "M4 9h16" : "M4 15h16"} />
      <path d={isAtTop ? "m9 14 3 3 3-3M12 11v6" : "m9 10 3-3 3 3M12 7v6"} />
    </svg>
  );
}

function CopyIcon({ copied }: { copied: boolean }) {
  return (
    <svg className="xpe-icon" viewBox="0 0 24 24" aria-hidden="true">
      {copied ? <path d="m5 12 4 4L19 6" /> : <>
        <rect x="8" y="8" width="12" height="12" rx="2" />
        <path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" />
      </>}
    </svg>
  );
}

function SelectTextIcon() {
  return (
    <svg className="xpe-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 4H5a1 1 0 0 0-1 1v3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3" />
      <path d="M8 9V8h8v1M12 8v8M10 16h4" />
    </svg>
  );
}

function ResetIcon() {
  return (
    <svg className="xpe-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 4H5a1 1 0 0 0-1 1v3" />
      <path d="M16 4h3a1 1 0 0 1 1 1v3" />
      <path d="M20 16v3a1 1 0 0 1-1 1h-3" />
      <path d="M8 20H5a1 1 0 0 1-1-1v-3" />
      <path d="M10 10h4v4h-4z" />
    </svg>
  );
}

function NavigatorPositionIcon({ position }: { position: NavigatorPosition }) {
  const moveRight = position === "left";

  return (
    <svg className="xpe-icon" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <rect x={moveRight ? "5" : "15"} y="13" width="4" height="4" rx="0.5" />
      <path d={moveRight ? "M11 15h7m-2-2 2 2-2 2" : "M13 15H6m2-2-2 2 2 2"} />
    </svg>
  );
}

export function ImageViewer({ images, initialIndex, onClose }: ImageViewerProps) {
  const [textMode, setTextMode] = useState(false);
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
  const [ocrStatus, setOcrStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const navigatorRef = useRef<HTMLDivElement | null>(null);
  const dragStartRef = useRef<Point | null>(null);
  const didDragRef = useRef(false);
  const suppressNextClickRef = useRef(false);
  const translateStartRef = useRef<Point>({ x: 0, y: 0 });
  const hasLoadedRef = useRef(false);
  const naturalSizeRef = useRef({ width: 0, height: 0 });
  const scaleRef = useRef(1);

  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const [viewportSize, setViewportSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState<Point>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isNavigatorDragging, setIsNavigatorDragging] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [ratingPrompt, setRatingPrompt] = useState<RatingPromptState | null>(null);
  const [toolbarPosition, setToolbarPosition] = useState<ToolbarPosition>("bottom");
  const [navigatorPosition, setNavigatorPosition] = useState<NavigatorPosition>("left");
  const [currentIndex, setCurrentIndex] = useState(() => clamp(initialIndex, 0, Math.max(images.length - 1, 0)));
  const [imageSource, setImageSource] = useState(() => ({
    imageUrl: images[currentIndex]?.url ?? "",
    src: images[currentIndex]?.previewUrl || images[currentIndex]?.url || ""
  }));
  const [navigatorViewport, setNavigatorViewport] = useState<NavigatorViewport>({
    x: 0,
    y: 0,
    width: 0,
    height: 0
  });

  const currentImage = images[currentIndex] ?? images[0];
  const hasMultipleImages = images.length > 1;

  useEffect(() => {
    setTextMode(false);
    setOcrResult(null);
    setOcrStatus("idle");
    setCopyStatus("idle");
  }, [currentImage.url]);

  useEffect(() => {
    if (!textMode || ocrResult) return;
    let active = true;
    setOcrStatus("loading");
    recognizeImage(currentImage.url).then(result => {
      if (!active) return;
      setOcrResult(result);
      setOcrStatus("ready");
    }, () => { if (active) setOcrStatus("error"); });
    return () => { active = false; };
  }, [textMode, currentImage.url, ocrResult]);

  const isRecognizing = textMode && ocrStatus === "loading";

  const copyAllText = async () => {
    if (!ocrResult?.text) return;
    try {
      await navigator.clipboard.writeText(ocrResult.text);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
  };

  const displayedSrc =
    imageSource.imageUrl === currentImage?.url ? imageSource.src : currentImage?.previewUrl || currentImage?.url || "";

  const fitScale = useMemo(() => {
    if (!naturalSize.width || !naturalSize.height) {
      return 1;
    }

    return calculateFitScale(naturalSize.width, naturalSize.height, viewportSize.width, viewportSize.height);
  }, [naturalSize.height, naturalSize.width, viewportSize.height, viewportSize.width]);

  const renderedSize = useMemo(
    () => ({
      width: naturalSize.width * scale,
      height: naturalSize.height * scale
    }),
    [naturalSize.height, naturalSize.width, scale]
  );

  const showNavigator = hasLoaded && (
    renderedSize.width > viewportSize.width * NAVIGATOR_OVERFLOW_THRESHOLD ||
    renderedSize.height > viewportSize.height * NAVIGATOR_OVERFLOW_THRESHOLD
  );

  useEffect(() => {
    if (!showNavigator) setIsNavigatorDragging(false);
  }, [showNavigator]);

  const navigatorSize = useMemo(() => {
    if (!naturalSize.width || !naturalSize.height) {
      return { width: 0, height: 0 };
    }

    const maxWidth = viewportSize.width <= 560 ? 122 : NAVIGATOR_MAX_WIDTH;
    const navigatorScale = Math.min(
      maxWidth / naturalSize.width,
      NAVIGATOR_MAX_HEIGHT / naturalSize.height
    );

    return {
      width: naturalSize.width * navigatorScale,
      height: naturalSize.height * navigatorScale
    };
  }, [naturalSize.height, naturalSize.width, viewportSize.width]);

  const updateNavigatorViewport = useCallback(() => {
    const viewport = viewportRef.current;
    const image = imageRef.current;

    if (!viewport || !image || !navigatorSize.width || !navigatorSize.height) {
      return;
    }

    const viewportRect = viewport.getBoundingClientRect();
    const imageRect = image.getBoundingClientRect();

    if (!imageRect.width || !imageRect.height) {
      return;
    }

    const visibleLeft = clamp(viewportRect.left - imageRect.left, 0, imageRect.width);
    const visibleTop = clamp(viewportRect.top - imageRect.top, 0, imageRect.height);
    const visibleRight = clamp(viewportRect.right - imageRect.left, 0, imageRect.width);
    const visibleBottom = clamp(viewportRect.bottom - imageRect.top, 0, imageRect.height);
    const width = Math.max((visibleRight - visibleLeft) * (navigatorSize.width / imageRect.width), 0);
    const height = Math.max((visibleBottom - visibleTop) * (navigatorSize.height / imageRect.height), 0);

    setNavigatorViewport({
      x: visibleLeft * (navigatorSize.width / imageRect.width),
      y: visibleTop * (navigatorSize.height / imageRect.height),
      width,
      height
    });
  }, [navigatorSize.height, navigatorSize.width]);

  const centerViewport = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    viewport.scrollTo({
      left: Math.max((viewport.scrollWidth - viewport.clientWidth) / 2, 0),
      top: Math.max((viewport.scrollHeight - viewport.clientHeight) / 2, 0)
    });
  }, []);

  const resetView = useCallback(() => {
    scaleRef.current = fitScale;
    setScale(fitScale);
    setTranslate({ x: 0, y: 0 });
    requestAnimationFrame(centerViewport);
  }, [centerViewport, fitScale]);

  const resetImageState = useCallback(() => {
    dragStartRef.current = null;
    didDragRef.current = false;
    suppressNextClickRef.current = false;
    translateStartRef.current = { x: 0, y: 0 };
    hasLoadedRef.current = false;
    naturalSizeRef.current = { width: 0, height: 0 };
    scaleRef.current = 1;
    setNaturalSize({ width: 0, height: 0 });
    setScale(1);
    setTranslate({ x: 0, y: 0 });
    setIsDragging(false);
    setHasLoaded(false);
    viewportRef.current?.scrollTo({ top: 0, left: 0 });
  }, []);

  const showImageAt = useCallback(
    (nextIndex: number) => {
      const clampedIndex = clamp(nextIndex, 0, images.length - 1);
      if (clampedIndex === currentIndex) {
        return;
      }

      resetImageState();
      setCurrentIndex(clampedIndex);
    },
    [currentIndex, images.length, resetImageState]
  );

  const zoomAt = useCallback((nextScale: number, origin?: Point) => {
    const clampedScale = clamp(nextScale, Math.min(MIN_SCALE, fitScale), MAX_SCALE);
    scaleRef.current = clampedScale;

    setScale((currentScale) => {
      if (!origin || currentScale === clampedScale) {
        return clampedScale;
      }

      const rect = viewportRef.current?.getBoundingClientRect();
      if (!rect) {
        return clampedScale;
      }

      const centerX = origin.x - rect.left - rect.width / 2;
      const centerY = origin.y - rect.top - rect.height / 2;
      const ratio = clampedScale / currentScale;

      setTranslate((currentTranslate) => ({
        x: centerX - (centerX - currentTranslate.x) * ratio,
        y: centerY - (centerY - currentTranslate.y) * ratio
      }));

      return clampedScale;
    });
  }, [fitScale]);

  const zoomBy = useCallback(
    (factor: number, origin?: Point) => {
      zoomAt(scaleRef.current * factor, origin);
    },
    [zoomAt]
  );

  const zoomToActualSize = useCallback(() => {
    const rect = viewportRef.current?.getBoundingClientRect();
    const origin = rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : undefined;
    zoomAt(1, origin);
  }, [zoomAt]);

  useEffect(() => {
    const handleResize = () => {
      const nextViewportSize = { width: window.innerWidth, height: window.innerHeight };
      setViewportSize(nextViewportSize);

      if (hasLoadedRef.current && naturalSizeRef.current.width && naturalSizeRef.current.height) {
        const nextScale = calculateFitScale(
            naturalSizeRef.current.width,
            naturalSizeRef.current.height,
            nextViewportSize.width,
            nextViewportSize.height
          );
        scaleRef.current = nextScale;
        setScale(nextScale);
        setTranslate({ x: 0, y: 0 });
        requestAnimationFrame(centerViewport);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [centerViewport]);

  useLayoutEffect(() => {
    if (hasLoaded) {
      centerViewport();
      updateNavigatorViewport();
    }
  }, [centerViewport, hasLoaded, updateNavigatorViewport]);

  useEffect(() => {
    if (!hasLoaded) {
      return;
    }

    let animationFrameId = 0;
    const startedAt = performance.now();
    const trackAnimation = () => {
      updateNavigatorViewport();
      if (performance.now() - startedAt < ZOOM_ANIMATION_DURATION + 40) {
        animationFrameId = requestAnimationFrame(trackAnimation);
      }
    };

    animationFrameId = requestAnimationFrame(trackAnimation);
    return () => cancelAnimationFrame(animationFrameId);
  }, [hasLoaded, scale, translate, updateNavigatorViewport, viewportSize]);

  useEffect(() => {
    setCurrentIndex((index) => clamp(index, 0, Math.max(images.length - 1, 0)));
  }, [images.length]);

  useEffect(() => {
    if (!currentImage) {
      return;
    }

    let isActive = true;
    let idleCallbackId: number | undefined;
    let timeoutId: number | undefined;
    const previewUrl = currentImage.previewUrl || currentImage.url;

    setImageSource({ imageUrl: currentImage.url, src: previewUrl });

    void preloadImage(currentImage.url, "high")
      .then(() => {
        if (!isActive) {
          return;
        }

        setImageSource({ imageUrl: currentImage.url, src: currentImage.url });

        const preloadAdjacentImages = () => {
          [images[currentIndex - 1], images[currentIndex + 1]].forEach((image) => {
            if (image) {
              void preloadImage(image.url, "low").catch(() => undefined);
            }
          });
        };

        if ("requestIdleCallback" in window) {
          idleCallbackId = window.requestIdleCallback(preloadAdjacentImages, { timeout: 1500 });
        } else {
          timeoutId = globalThis.setTimeout(preloadAdjacentImages, 250);
        }
      })
      .catch(() => {
        // Keep the cached preview visible if the original request fails.
      });

    return () => {
      isActive = false;
      if (idleCallbackId !== undefined) {
        window.cancelIdleCallback(idleCallbackId);
      }
      if (timeoutId !== undefined) {
        globalThis.clearTimeout(timeoutId);
      }
    };
  }, [currentImage, currentIndex, images]);

  useEffect(() => {
    let isMounted = true;

    recordViewerOpenAndGetRatingPrompt().then((nextRatingPrompt) => {
      if (isMounted && nextRatingPrompt.shouldShow) {
        setRatingPrompt(nextRatingPrompt);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    void readNavigatorPosition().then((position) => {
      if (isMounted) {
        setNavigatorPosition(position);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    void readToolbarPosition().then((position) => {
      if (isMounted) {
        setToolbarPosition(position);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    const handleWheel = (event: WheelEvent) => {
      event.stopImmediatePropagation();

      if (!event.ctrlKey && !event.metaKey) {
        return;
      }

      event.preventDefault();

      const normalizedDelta = clamp(event.deltaY, -120, 120);
      const factor = Math.exp(-normalizedDelta * 0.0025);
      zoomBy(factor, { x: event.clientX, y: event.clientY });
    };

    viewport.addEventListener("wheel", handleWheel, { capture: true, passive: false });
    return () => viewport.removeEventListener("wheel", handleWheel, { capture: true });
  }, [zoomBy]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.ctrlKey || event.metaKey) return;

      if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        zoomBy(SCALE_STEP);
        return;
      }

      if (event.key === "-") {
        event.preventDefault();
        zoomBy(1 / SCALE_STEP);
        return;
      }

      if (event.key === "0") {
        event.preventDefault();
        resetView();
        return;
      }

      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
        event.preventDefault();
        const delta = event.shiftKey ? 80 : 32;
        const x = event.key === "ArrowLeft" ? delta : event.key === "ArrowRight" ? -delta : 0;
        const y = event.key === "ArrowUp" ? delta : event.key === "ArrowDown" ? -delta : 0;
        setTranslate((current) => ({ x: current.x + x, y: current.y + y }));
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [onClose, resetView, zoomBy]);

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget;
    const nextNaturalSize = { width: image.naturalWidth, height: image.naturalHeight };

    if (hasLoadedRef.current && naturalSizeRef.current.width > 0) {
      const sizeRatio = naturalSizeRef.current.width / nextNaturalSize.width;
      naturalSizeRef.current = nextNaturalSize;
      setNaturalSize(nextNaturalSize);
      setScale((currentScale) => {
        const nextScale = currentScale * sizeRatio;
        scaleRef.current = nextScale;
        return nextScale;
      });
      return;
    }

    naturalSizeRef.current = nextNaturalSize;
    hasLoadedRef.current = true;
    setNaturalSize(nextNaturalSize);
    const nextScale = calculateFitScale(nextNaturalSize.width, nextNaturalSize.height, viewportSize.width, viewportSize.height);
    scaleRef.current = nextScale;
    setScale(nextScale);
    setTranslate({ x: 0, y: 0 });
    setHasLoaded(true);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (textMode || event.button !== 0 || !hasLoaded) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    dragStartRef.current = { x: event.clientX, y: event.clientY };
    didDragRef.current = false;
    translateStartRef.current = translate;
    setIsDragging(true);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStartRef.current) {
      return;
    }

    const dx = event.clientX - dragStartRef.current.x;
    const dy = event.clientY - dragStartRef.current.y;

    if (Math.hypot(dx, dy) > 4) {
      didDragRef.current = true;
    }

    setTranslate({
      x: translateStartRef.current.x + dx,
      y: translateStartRef.current.y + dy
    });
  };

  const stopDragging = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    dragStartRef.current = null;
    suppressNextClickRef.current = didDragRef.current;
    setIsDragging(false);
  };

  const handleSurfaceClick = (event: React.MouseEvent<HTMLElement>) => {
    if (suppressNextClickRef.current) {
      event.preventDefault();
      event.stopPropagation();
      suppressNextClickRef.current = false;
      return;
    }

    if (event.target === event.currentTarget) {
      event.stopPropagation();
      onClose();
    }
  };

  const handleDoubleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (textMode || !hasLoaded) {
      return;
    }

    const nextScale = Math.abs(scale - fitScale) < 0.03 ? Math.max(1, fitScale * 1.8) : fitScale;
    zoomAt(nextScale, { x: event.clientX, y: event.clientY });
  };

  const moveFromNavigator = (clientX: number, clientY: number) => {
    const navigator = navigatorRef.current;
    const viewport = viewportRef.current;
    const image = imageRef.current;

    if (!navigator || !viewport || !image) {
      return;
    }

    const navigatorRect = navigator.getBoundingClientRect();
    const viewportRect = viewport.getBoundingClientRect();
    const imageRect = image.getBoundingClientRect();
    const relativeX = clamp((clientX - navigatorRect.left) / navigatorRect.width, 0, 1);
    const relativeY = clamp((clientY - navigatorRect.top) / navigatorRect.height, 0, 1);
    const targetX = imageRect.left + imageRect.width * relativeX;
    const targetY = imageRect.top + imageRect.height * relativeY;
    const canPanHorizontally = imageRect.width > viewport.clientWidth;

    setTranslate((current) => ({
      x: canPanHorizontally
        ? current.x + viewportRect.left + viewport.clientWidth / 2 - targetX
        : current.x,
      y: current.y + viewportRect.top + viewportRect.height / 2 - targetY
    }));
  };

  const handleNavigatorPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsNavigatorDragging(true);
    moveFromNavigator(event.clientX, event.clientY);
  };

  const handleNavigatorPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    moveFromNavigator(event.clientX, event.clientY);
  };

  const handleNavigatorPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setIsNavigatorDragging(false);
  };

  const handleRateClick = () => {
    if (!ratingPrompt?.storeUrl) {
      return;
    }

    window.open(ratingPrompt.storeUrl, "_blank", "noopener,noreferrer");
    setRatingPrompt(null);
    void markRatingPromptAccepted();
  };

  const handleRemindLaterClick = () => {
    setRatingPrompt(null);
    void deferRatingPrompt();
  };

  const handleNoThanksClick = () => {
    setRatingPrompt(null);
    void declineRatingPrompt();
  };

  const handleToolbarPositionClick = () => {
    const nextPosition: ToolbarPosition = toolbarPosition === "bottom" ? "top" : "bottom";
    setToolbarPosition(nextPosition);
    void writeToolbarPosition(nextPosition);
  };

  const handleNavigatorPositionClick = () => {
    const nextPosition: NavigatorPosition = navigatorPosition === "left" ? "right" : "left";
    setNavigatorPosition(nextPosition);
    void writeNavigatorPosition(nextPosition);
  };

  if (!currentImage) {
    return null;
  }

  const imageStyle = {
    width: renderedSize.width ? `${renderedSize.width}px` : "auto",
    height: renderedSize.height ? `${renderedSize.height}px` : "auto",
    transform: `translate3d(${translate.x}px, ${translate.y}px, 0)`
  };

  return (
    <div
      className={`xpe-viewer${isNavigatorDragging ? " xpe-viewer--navigator-dragging" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={t("dialogLabel")}
    >
      <Toolbar position={toolbarPosition}>
        <div className="xpe-toolbar-controls">
          <div className="xpe-toolbar-group xpe-zoom-controls">
            <button type="button" className="xpe-button xpe-icon-button" onClick={() => zoomBy(1 / SCALE_STEP)} data-tooltip={t("zoomOut")} aria-label={t("zoomOut")}>
              <svg className="xpe-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12" /></svg>
            </button>
            <button type="button" className="xpe-button xpe-scale" onClick={zoomToActualSize}
              data-tooltip={t("actualSize")} aria-label={`${t("currentZoom")} ${formatScale(scale)}. ${t("actualSize")}`}>
              {formatScale(scale)}
            </button>
            <button type="button" className="xpe-button xpe-icon-button" onClick={() => zoomBy(SCALE_STEP)} data-tooltip={t("zoomIn")} aria-label={t("zoomIn")}>
              <svg className="xpe-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12M12 6v12" /></svg>
            </button>
            <button
              type="button"
              className="xpe-button xpe-icon-button"
              onClick={resetView}
              data-tooltip={t("resetView")}
              aria-label={t("resetView")}
            >
              <ResetIcon />
            </button>
          </div>
          <div className="xpe-toolbar-group">
            <button type="button" className="xpe-button xpe-icon-button" disabled={!hasLoaded}
              data-tooltip={textMode ? t("exitTextMode") : t("selectText")}
              aria-label={textMode ? t("exitTextMode") : t("selectText")}
              aria-busy={isRecognizing}
              aria-pressed={textMode} onClick={() => { setTextMode(value => !value); setCopyStatus("idle"); }}>
              {isRecognizing ? <span className="xpe-ocr-spinner xpe-ocr-spinner--button" aria-hidden="true" /> : <SelectTextIcon />}
            </button>
            {textMode && ocrResult?.text.trim() && <button type="button" className="xpe-button xpe-icon-button" onClick={copyAllText}
              data-tooltip={copyStatus === "copied" ? t("textCopied") : t("copyAllText")}
              aria-label={copyStatus === "copied" ? t("textCopied") : t("copyAllText")}>
              <CopyIcon copied={copyStatus === "copied"} />
            </button>}
          </div>
          {hasMultipleImages && (
            <div className="xpe-toolbar-group xpe-gallery-controls" aria-label={t("imagePosition")}>
              <button
                type="button"
                className="xpe-button xpe-gallery-button"
                onClick={() => showImageAt(currentIndex - 1)}
                data-tooltip={t("previousImage")}
                aria-label={t("previousImage")}
                disabled={currentIndex === 0}
              >
                <PreviousIcon />
              </button>
              <span className="xpe-image-position" aria-label={`${t("imagePosition")} ${currentIndex + 1} / ${images.length}`}>
                {currentIndex + 1} / {images.length}
              </span>
              <button
                type="button"
                className="xpe-button xpe-gallery-button"
                onClick={() => showImageAt(currentIndex + 1)}
                data-tooltip={t("nextImage")}
                aria-label={t("nextImage")}
                disabled={currentIndex === images.length - 1}
              >
                <NextIcon />
              </button>
            </div>
          )}
        </div>
        <div className="xpe-toolbar-group">
          <button
            type="button"
            className="xpe-button xpe-icon-button"
            onClick={handleToolbarPositionClick}
            data-tooltip={toolbarPosition === "bottom" ? t("moveToolbarToTop") : t("moveToolbarToBottom")}
            aria-label={toolbarPosition === "bottom" ? t("moveToolbarToTop") : t("moveToolbarToBottom")}
          >
            <ToolbarPositionIcon position={toolbarPosition} />
          </button>
          <a
            className="xpe-button xpe-icon-button xpe-link"
            href={currentImage.url}
            target="_blank"
            rel="noreferrer"
            data-tooltip={t("openOriginal")}
            aria-label={t("openOriginal")}
          >
            <OpenIcon />
          </a>
          <button
            type="button"
            className="xpe-button xpe-icon-button xpe-close"
            onClick={onClose}
            data-tooltip={t("close")}
            aria-label={t("close")}
          >
            <CloseIcon />
          </button>
        </div>
      </Toolbar>

      {ratingPrompt?.shouldShow && (
        <div className="xpe-rating" role="status" onClick={(event) => event.stopPropagation()}>
          <div className="xpe-rating__copy">
            <strong>{t("rateTitle")}</strong>
            <span>{t("ratePrompt")}</span>
          </div>
          <div className="xpe-rating__actions">
            <button type="button" className="xpe-button xpe-rating__primary" onClick={handleRateClick}>
              {t("rate")}
            </button>
            <button type="button" className="xpe-button" onClick={handleRemindLaterClick}>
              {t("remindLater")}
            </button>
            <button type="button" className="xpe-button" onClick={handleNoThanksClick}>
              {t("noThanks")}
            </button>
          </div>
        </div>
      )}

      {hasMultipleImages && (
        <div className="xpe-side-navigation" aria-label={t("imagePosition")}>
          <button
            type="button"
            className="xpe-side-navigation__button xpe-side-navigation__button--previous"
            onClick={() => showImageAt(currentIndex - 1)}
            title={t("previousImage")}
            aria-label={t("previousImage")}
            disabled={currentIndex === 0}
          >
            <PreviousIcon />
          </button>
          <button
            type="button"
            className="xpe-side-navigation__button xpe-side-navigation__button--next"
            onClick={() => showImageAt(currentIndex + 1)}
            title={t("nextImage")}
            aria-label={t("nextImage")}
            disabled={currentIndex === images.length - 1}
          >
            <NextIcon />
          </button>
        </div>
      )}

      {showNavigator && navigatorSize.width > 0 && navigatorSize.height > 0 && (
        <div
          className={`xpe-navigator xpe-navigator--${navigatorPosition}`}
          onClick={(event) => event.stopPropagation()}
        >
          <div
            ref={navigatorRef}
            className="xpe-navigator__map"
            style={{ width: `${navigatorSize.width}px`, height: `${navigatorSize.height}px` }}
            role="img"
            aria-label={t("imageOverview")}
            onPointerDown={handleNavigatorPointerDown}
            onPointerMove={handleNavigatorPointerMove}
            onPointerUp={handleNavigatorPointerUp}
            onPointerCancel={handleNavigatorPointerUp}
          >
            <img className="xpe-navigator__image" src={displayedSrc} alt="" draggable={false} />
            <span
              className="xpe-navigator__viewport"
              style={{
                left: `${navigatorViewport.x}px`,
                top: `${navigatorViewport.y}px`,
                width: `${navigatorViewport.width}px`,
                height: `${navigatorViewport.height}px`
              }}
            />
          </div>
          <div className="xpe-navigator__footer">
            <span className="xpe-navigator__scale">{formatScale(scale)}</span>
            <button
              type="button"
              className="xpe-navigator__position-button"
              onClick={handleNavigatorPositionClick}
              title={navigatorPosition === "left" ? t("moveOverviewToRight") : t("moveOverviewToLeft")}
              aria-label={navigatorPosition === "left" ? t("moveOverviewToRight") : t("moveOverviewToLeft")}
            >
              <NavigatorPositionIcon position={navigatorPosition} />
            </button>
          </div>
        </div>
      )}

      {isRecognizing && <div className={`xpe-ocr-loading xpe-ocr-status--${toolbarPosition}`} role="status" aria-live="polite" aria-atomic="true">
        <span className="xpe-ocr-spinner" aria-hidden="true" />
        <span>{t("recognizingText")}</span>
      </div>}
      {textMode && !isRecognizing && <div className={`xpe-ocr-status xpe-ocr-status--${toolbarPosition}`} role="status" aria-live="polite">
        {ocrStatus === "error" ? t("recognitionFailed") :
          copyStatus === "error" ? t("copyTextFailed") : ocrResult ? (ocrResult.lines.length ? t("selectTextHint") : t("noTextFound")) : ""}
        {ocrStatus === "error" && <button type="button" className="xpe-button" onClick={() => { setTextMode(false); }}>
          {t("exitTextMode")}
        </button>}
      </div>}
      <div
        ref={viewportRef}
        className={`xpe-canvas${textMode ? " xpe-canvas--text" : ""}${isDragging ? " xpe-canvas--dragging" : ""}`}
        onClick={handleSurfaceClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
        onDoubleClick={handleDoubleClick}
        onScroll={updateNavigatorViewport}
      >
        <div
          className="xpe-stage"
          style={{ minWidth: `${renderedSize.width}px` }}
          onClick={handleSurfaceClick}
        >
          {!hasLoaded && <div className="xpe-loading">{t("loadingImage")}</div>}
          <div className="xpe-image-frame" style={imageStyle} onClick={event => event.stopPropagation()}>
            <img
              ref={imageRef}
              key={currentImage.url}
              className={`xpe-image${hasLoaded ? " xpe-image--loaded" : ""}`}
              src={displayedSrc}
              alt={currentImage.alt}
              draggable={false}
              decoding="async"
              fetchPriority="high"
              style={{ width: "100%", height: "100%" }}
              onLoad={handleImageLoad}
              onClick={(event) => event.stopPropagation()}
            />
            {textMode && ocrResult && <div className="xpe-text-scale" style={{ width: ocrResult.width, height: ocrResult.height,
              transform: `scale(${renderedSize.width / ocrResult.width}, ${renderedSize.height / ocrResult.height})` }}>
              <TextLayer result={ocrResult} />
            </div>}
          </div>
        </div>
      </div>
    </div>
  );
}
