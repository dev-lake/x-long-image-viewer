import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { createGlassRenderer } from "./glassRenderer";

type Props = { imageRef: RefObject<HTMLImageElement | null>; source: string };
const SOLID_GLASS = "(forced-colors: active), (prefers-contrast: more), (prefers-reduced-transparency: reduce)";

export function LiquidGlass({ imageRef, source }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const invalidateRef = useRef<(duration?: number) => void>(() => {});
  const uploadRef = useRef<(source: HTMLCanvasElement) => boolean>(() => false);
  const resetRef = useRef<() => void>(() => {});
  const textureRef = useRef<HTMLCanvasElement | null>(null);
  const [solid, setSolid] = useState(() => window.matchMedia(SOLID_GLASS).matches);

  useEffect(() => {
    const preference = window.matchMedia(SOLID_GLASS);
    const update = () => setSolid(preference.matches);
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const toolbar = canvas?.parentElement;
    if (!canvas || !toolbar || solid) return;
    const renderer = createGlassRenderer(canvas);
    if (!renderer) return;
    const motion = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    const toneCanvas = document.createElement("canvas");
    toneCanvas.width = 48;
    toneCanvas.height = 6;
    const tone = toneCanvas.getContext("2d", { willReadFrequently: true });
    let frame = 0;
    let animateUntil = 0;
    let failed = false;
    let ready = false;
    const pointer = { x: 0.3, y: 0.1, active: false };
    const clearSurface = () => {
      toolbar.removeAttribute("data-glass-renderer");
      for (const control of toolbar.querySelectorAll("[data-glass-tone]")) control.removeAttribute("data-glass-tone");
    };

    const draw = () => {
      frame = 0;
      const image = imageRef.current;
      if (failed || !ready || !image || document.hidden) return;
      const lens = canvas.getBoundingClientRect();
      const bounds = image.getBoundingClientRect();
      if (!lens.width || !lens.height) return;
      if (!renderer.draw({ lens, image: bounds, viewport: { width: innerWidth, height: innerHeight }, pointer })) {
        failed = true;
        clearSurface();
        return;
      }
      if (toolbar.dataset.glassRenderer !== "webgl") toolbar.dataset.glassRenderer = "webgl";
      // Sample only the image under the lens, without capturing the X page.
      if (tone && textureRef.current) {
        tone.fillStyle = "#080c10";
        tone.fillRect(0, 0, 48, 6);
        tone.drawImage(textureRef.current, (bounds.left - lens.left) / lens.width * 48,
          (bounds.top - lens.top) / lens.height * 6, bounds.width / lens.width * 48, bounds.height / lens.height * 6);
        const pixels = tone.getImageData(0, 0, 48, 6).data;
        // Choose each control's foreground locally, including mixed light/dark pictures.
        for (const control of toolbar.querySelectorAll<HTMLElement>(".xpe-button, .xpe-image-position")) {
          const rect = control.getBoundingClientRect();
          const x0 = Math.max(0, Math.floor((rect.left - lens.left) / lens.width * 48));
          const x1 = Math.min(48, Math.ceil((rect.right - lens.left) / lens.width * 48));
          const y0 = Math.max(0, Math.floor((rect.top - lens.top) / lens.height * 6));
          const y1 = Math.min(6, Math.ceil((rect.bottom - lens.top) / lens.height * 6));
          let luminance = 0;
          let count = 0;
          for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
            const i = (y * 48 + x) * 4;
            luminance += pixels[i] * 0.2126 + pixels[i + 1] * 0.7152 + pixels[i + 2] * 0.0722;
            count++;
          }
          const threshold = control.dataset.glassTone === "light" ? 135 : 150;
          const nextTone = count && luminance / count > threshold ? "light" : "dark";
          if (control.dataset.glassTone !== nextTone) control.dataset.glassTone = nextTone;
        }
      }
      if (performance.now() < animateUntil) frame = requestAnimationFrame(draw);
    };
    const invalidate = (duration = 0) => {
      animateUntil = Math.max(animateUntil, performance.now() + duration);
      if (!frame && !failed && ready && !document.hidden) frame = requestAnimationFrame(draw);
    };
    invalidateRef.current = invalidate;
    uploadRef.current = texture => {
      ready = renderer.setImage(texture);
      failed = !ready;
      if (ready) invalidate(280);
      return ready;
    };
    resetRef.current = () => {
      ready = false;
      cancelAnimationFrame(frame);
      frame = 0;
      clearSurface();
    };
    if (textureRef.current) uploadRef.current(textureRef.current);
    const move = (event: PointerEvent) => {
      if (!motion.matches || event.pointerType === "touch" ||
        (event.target instanceof Element && event.target.closest(".xpe-toolbar-settings"))) return;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
      invalidate();
    };
    const reset = () => { pointer.active = false; invalidate(); };
    const update = () => invalidate(280);
    const onScroll = () => invalidate();
    const lost = (event: Event) => {
      event.preventDefault();
      failed = true;
      cancelAnimationFrame(frame);
      frame = 0;
      clearSurface();
    };
    const observer = new ResizeObserver(update);
    observer.observe(toolbar);
    toolbar.addEventListener("pointermove", move);
    toolbar.addEventListener("pointerleave", reset);
    canvas.addEventListener("webglcontextlost", lost);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", onScroll, true);
    document.addEventListener("visibilitychange", update);
    motion.addEventListener("change", reset);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      toolbar.removeEventListener("pointermove", move);
      toolbar.removeEventListener("pointerleave", reset);
      canvas.removeEventListener("webglcontextlost", lost);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", onScroll, true);
      document.removeEventListener("visibilitychange", update);
      motion.removeEventListener("change", reset);
      clearSurface();
      invalidateRef.current = () => {};
      uploadRef.current = () => false;
      resetRef.current = () => {};
      renderer.dispose();
    };
  }, [imageRef, solid]);

  useEffect(() => {
    const toolbar = canvasRef.current?.parentElement;
    resetRef.current();
    toolbar?.removeAttribute("data-glass-renderer");
    toolbar?.removeAttribute("data-glass-tone");
    textureRef.current = null;
    if (solid || !source) return;
    let active = true;
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.decoding = "async";
    image.onload = () => {
      if (!active) return;
      try {
        // Keep the GPU copy bounded even for very large or very long images.
        const scale = Math.min(1, 2048 / Math.max(image.naturalWidth, image.naturalHeight));
        const texture = document.createElement("canvas");
        texture.width = Math.max(1, Math.round(image.naturalWidth * scale));
        texture.height = Math.max(1, Math.round(image.naturalHeight * scale));
        const context = texture.getContext("2d");
        if (!context) return;
        context.drawImage(image, 0, 0, texture.width, texture.height);
        // CORS or a disabled GPU leaves the ordinary CSS glass available.
        if (uploadRef.current(texture)) textureRef.current = texture;
      } catch {
        toolbar?.removeAttribute("data-glass-renderer");
      } finally {
        image.onload = null;
        image.removeAttribute("src");
      }
    };
    image.src = source;
    return () => {
      active = false;
      image.onload = null;
      image.onerror = null;
      image.removeAttribute("src");
    };
  }, [source, solid]);

  // Follow the viewer's 220ms zoom/pan transition, then stop rendering at rest.
  useLayoutEffect(() => { invalidateRef.current(280); });

  return <canvas key={solid ? "solid" : "lens"} ref={canvasRef} className="xpe-glass-canvas" aria-hidden="true" />;
}
