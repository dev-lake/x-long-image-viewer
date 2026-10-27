import { useEffect, useId, useRef, useState, type ReactNode } from "react";

type Hint = { text: string; x: number; y: number; below: boolean };

export function Toolbar({ position, children }: { position: "top" | "bottom"; children: ReactNode }) {
  const tooltipId = useId();
  const [hint, setHint] = useState<Hint | null>(null);
  const anchor = useRef<HTMLElement | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const root = useRef<HTMLDivElement>(null);

  const hide = () => {
    clearTimeout(timer.current);
    anchor.current?.removeAttribute("aria-describedby");
    anchor.current = null;
    setHint(null);
  };

  const show = (target: EventTarget | null, immediate = false) => {
    const button = target instanceof Element ? target.closest<HTMLElement>("[data-tooltip]") : null;
    if (!button || !root.current?.contains(button) || anchor.current === button) return;
    hide();
    anchor.current = button;
    const reveal = () => {
      if (anchor.current !== button) return;
      button.setAttribute("aria-describedby", tooltipId);
      const rect = button.getBoundingClientRect();
      const margin = Math.min(130, window.innerWidth / 2);
      setHint({
        text: button.dataset.tooltip || "",
        x: Math.max(margin, Math.min(window.innerWidth - margin, rect.left + rect.width / 2)),
        y: position === "top" ? rect.bottom + 14 : rect.top - 14,
        below: position === "top"
      });
    };
    if (immediate) reveal();
    else timer.current = setTimeout(reveal, 220);
  };

  useEffect(() => {
    const dismissOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && anchor.current) {
        event.preventDefault();
        event.stopImmediatePropagation();
        hide();
      }
    };
    window.addEventListener("resize", hide);
    window.addEventListener("scroll", hide, true);
    window.addEventListener("keydown", dismissOnEscape, true);
    return () => {
      clearTimeout(timer.current);
      window.removeEventListener("resize", hide);
      window.removeEventListener("scroll", hide, true);
      window.removeEventListener("keydown", dismissOnEscape, true);
    };
  }, []);

  return <>
    <div ref={root} className={`xpe-toolbar xpe-toolbar--${position}`}
      onClick={event => { hide(); event.stopPropagation(); }}
      onPointerOver={event => { if (event.pointerType !== "touch") show(event.target); }}
      onPointerOut={event => {
        if (!(event.relatedTarget instanceof Node) || !anchor.current?.contains(event.relatedTarget)) hide();
      }}
      onFocus={event => show(event.target, true)} onBlur={hide} onPointerDown={hide}>
      {children}
    </div>
    {hint && <div className={`xpe-tooltip${hint.below ? " xpe-tooltip--below" : ""}`}
      id={tooltipId} role="tooltip" style={{ left: hint.x, top: hint.y }}>{hint.text}</div>}
  </>;
}
