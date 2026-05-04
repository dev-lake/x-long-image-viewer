import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type ImageViewerProps = {
  imageUrl: string;
  sourceAlt: string;
  onClose: () => void;
};

type Point = {
  x: number;
  y: number;
};

const MIN_SCALE = 0.2;
const MAX_SCALE = 6;
const SCALE_STEP = 1.2;
const LONG_IMAGE_RATIO = 1.8;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function formatScale(scale: number): string {
  return `${Math.round(scale * 100)}%`;
}

export function ImageViewer({ imageUrl, sourceAlt, onClose }: ImageViewerProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const dragStartRef = useRef<Point | null>(null);
  const didDragRef = useRef(false);
  const suppressNextClickRef = useRef(false);
  const translateStartRef = useRef<Point>({ x: 0, y: 0 });

  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const [viewportSize, setViewportSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState<Point>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const isLongImage = naturalSize.width > 0 && naturalSize.height / naturalSize.width >= LONG_IMAGE_RATIO;

  const fitScale = useMemo(() => {
    if (!naturalSize.width || !naturalSize.height) {
      return 1;
    }

    const horizontalPadding = 48;
    const verticalPadding = 112;
    const widthScale = Math.max((viewportSize.width - horizontalPadding) / naturalSize.width, MIN_SCALE);
    const heightScale = Math.max((viewportSize.height - verticalPadding) / naturalSize.height, MIN_SCALE);

    return clamp(isLongImage ? widthScale : Math.min(widthScale, heightScale), MIN_SCALE, 1);
  }, [isLongImage, naturalSize.height, naturalSize.width, viewportSize.height, viewportSize.width]);

  const renderedSize = useMemo(
    () => ({
      width: naturalSize.width * scale,
      height: naturalSize.height * scale
    }),
    [naturalSize.height, naturalSize.width, scale]
  );

  const resetView = useCallback(() => {
    setScale(fitScale);
    setTranslate({ x: 0, y: 0 });
    viewportRef.current?.scrollTo({ top: 0, left: 0 });
  }, [fitScale]);

  const zoomAt = useCallback((nextScale: number, origin?: Point) => {
    setScale((currentScale) => {
      const clampedScale = clamp(nextScale, MIN_SCALE, MAX_SCALE);

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
  }, []);

  const zoomBy = useCallback(
    (factor: number, origin?: Point) => {
      zoomAt(scale * factor, origin);
    },
    [scale, zoomAt]
  );

  useEffect(() => {
    const handleResize = () => {
      setViewportSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (hasLoaded) {
      resetView();
    }
  }, [hasLoaded, resetView]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    const handleWheelScroll = (event: WheelEvent) => {
      event.preventDefault();
      event.stopImmediatePropagation();

      viewport.scrollBy({
        top: event.deltaY,
        left: event.shiftKey ? event.deltaY : event.deltaX,
        behavior: "instant"
      });
    };

    viewport.addEventListener("wheel", handleWheelScroll, { capture: true, passive: false });
    return () => viewport.removeEventListener("wheel", handleWheelScroll, { capture: true });
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

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

  const handleImageLoad = () => {
    const image = imageRef.current;
    if (!image) {
      return;
    }

    setNaturalSize({
      width: image.naturalWidth,
      height: image.naturalHeight
    });
    setHasLoaded(true);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || !hasLoaded) {
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
    if (!hasLoaded) {
      return;
    }

    const nextScale = Math.abs(scale - fitScale) < 0.03 ? Math.max(1, fitScale * 1.8) : fitScale;
    zoomAt(nextScale, { x: event.clientX, y: event.clientY });
  };

  const imageStyle = {
    width: renderedSize.width ? `${renderedSize.width}px` : "auto",
    height: renderedSize.height ? `${renderedSize.height}px` : "auto",
    transform: `translate3d(${translate.x}px, ${translate.y}px, 0)`
  };

  return (
    <div className="xpe-viewer" role="dialog" aria-modal="true" aria-label="Enhanced X image viewer">
      <div className="xpe-toolbar" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="xpe-button" onClick={() => zoomBy(1 / SCALE_STEP)} title="Zoom out">
          -
        </button>
        <span className="xpe-scale" aria-label="Current zoom">
          {formatScale(scale)}
        </span>
        <button type="button" className="xpe-button" onClick={() => zoomBy(SCALE_STEP)} title="Zoom in">
          +
        </button>
        <button type="button" className="xpe-button" onClick={resetView} title="Reset view">
          0
        </button>
        <a className="xpe-button xpe-link" href={imageUrl} target="_blank" rel="noreferrer" title="Open original image">
          Open
        </a>
        <button type="button" className="xpe-button xpe-close" onClick={onClose} title="Close">
          Close
        </button>
      </div>

      <div
        ref={viewportRef}
        className={`xpe-canvas${isDragging ? " xpe-canvas--dragging" : ""}`}
        onClick={handleSurfaceClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
        onDoubleClick={handleDoubleClick}
      >
        <div
          className="xpe-stage"
          style={{ minWidth: `${Math.max(renderedSize.width + 96, viewportSize.width)}px` }}
          onClick={handleSurfaceClick}
        >
          {!hasLoaded && <div className="xpe-loading">Loading image...</div>}
          <img
            ref={imageRef}
            className="xpe-image"
            src={imageUrl}
            alt={sourceAlt}
            draggable={false}
            style={imageStyle}
            onLoad={handleImageLoad}
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      </div>
    </div>
  );
}
