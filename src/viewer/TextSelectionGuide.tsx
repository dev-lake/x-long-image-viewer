import { useEffect, useId, useLayoutEffect, useRef, type RefObject } from "react";
import { t } from "../i18n";
import type { ToolbarPosition } from "../toolbarPreference";

export function TextSelectionGuide({ anchorRef, position, textMode, onDismiss, onStart }: {
  anchorRef: RefObject<HTMLButtonElement | null>;
  position: ToolbarPosition;
  textMode: boolean;
  onDismiss: () => void;
  onStart: () => void;
}) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    const root = rootRef.current;
    if (!anchor || !root) return;
    const controls = anchor.closest(".xpe-toolbar-controls");
    const toolbar = anchor.closest(".xpe-toolbar");
    if (controls) {
      const buttonRect = anchor.getBoundingClientRect();
      const controlsRect = controls.getBoundingClientRect();
      if (buttonRect.left < controlsRect.left) controls.scrollLeft += buttonRect.left - controlsRect.left - 4;
      else if (buttonRect.right > controlsRect.right) controls.scrollLeft += buttonRect.right - controlsRect.right + 4;
    }
    const align = () => {
      const buttonRect = anchor.getBoundingClientRect();
      const rect = root.getBoundingClientRect();
      const above = buttonRect.top - rect.height - 14;
      const below = buttonRect.bottom + 14;
      let top = position === "top" ? below : above;
      if (top < 12 && below + rect.height <= innerHeight - 12) top = below;
      if (top + rect.height > innerHeight - 12 && above >= 12) top = above;
      top = Math.max(12, Math.min(innerHeight - rect.height - 12, top));
      const center = buttonRect.left + buttonRect.width / 2;
      const left = Math.max(12, Math.min(innerWidth - rect.width - 12, center - rect.width / 2));
      root.style.top = `${top}px`;
      root.style.left = `${left}px`;
      root.style.setProperty("--xpe-guide-arrow", `${Math.max(20, Math.min(rect.width - 20, center - left))}px`);
      root.dataset.placement = top >= buttonRect.bottom ? "below" : top + rect.height <= buttonRect.top ? "above" : "overlap";
    };
    anchor.classList.add("xpe-text-guide-anchor");
    align();
    startRef.current?.focus({ preventScroll: true });
    const observer = new ResizeObserver(align);
    observer.observe(root);
    if (toolbar) observer.observe(toolbar);
    window.addEventListener("resize", align);
    window.addEventListener("scroll", align, true);
    return () => {
      anchor.classList.remove("xpe-text-guide-anchor");
      observer.disconnect();
      window.removeEventListener("resize", align);
      window.removeEventListener("scroll", align, true);
    };
  }, [anchorRef, position]);

  useEffect(() => {
    const dismissOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target) && !anchorRef.current?.contains(event.target)) {
        onDismiss();
      }
    };
    document.addEventListener("pointerdown", dismissOutside, true);
    return () => document.removeEventListener("pointerdown", dismissOutside, true);
  }, [anchorRef, onDismiss]);

  const restoreFocus = () => anchorRef.current?.focus({ preventScroll: true });

  return <div ref={rootRef} className="xpe-text-guide" role="dialog"
    aria-labelledby={`${id}-title`} aria-describedby={`${id}-intro`}
    onClick={event => event.stopPropagation()}>
    <div className="xpe-text-guide__content">
      <h2 id={`${id}-title`}>{t("textGuideTitle")}</h2>
      <p id={`${id}-intro`} className="xpe-text-guide__intro">{t("textGuideIntro")}</p>
      <ol>
        <li>{t("textGuideRecognize")}</li>
        <li>{t("textGuideSelect")}</li>
        <li>{t("textGuideCopyAll")}</li>
      </ol>
      <p className="xpe-text-guide__hint">{t("textGuideExit")}</p>
      <div className="xpe-text-guide__actions">
        <button ref={startRef} type="button" className="xpe-button xpe-text-guide__start"
          onClick={() => { restoreFocus(); onStart(); }}>{t(textMode ? "textGuideContinue" : "textGuideStart")}</button>
        <button type="button" className="xpe-button"
          onClick={() => { restoreFocus(); onDismiss(); }}>{t("textGuideDismiss")}</button>
      </div>
    </div>
  </div>;
}
