import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { t } from "../i18n";
import type { ToolbarPosition, ToolbarStyle } from "../toolbarPreference";

export function ToolbarSettings({ style, position, onStyleChange, onPositionChange, onShowTextGuide }: {
  style: ToolbarStyle;
  position: ToolbarPosition;
  onStyleChange: (style: ToolbarStyle) => void;
  onPositionChange: (position: ToolbarPosition) => void;
  onShowTextGuide: () => void;
}) {
  const id = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const dismiss = () => panelRef.current?.hidePopover();
    const handleKeyDown = (event: KeyboardEvent) => {
      const panel = panelRef.current;
      if (!panel?.matches(":popover-open")) return;
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopImmediatePropagation();
        panel.hidePopover();
        buttonRef.current?.focus();
      } else if (event.target instanceof Node && panel.contains(event.target)) {
        // Keep native radio and Tab navigation out of the viewer shortcuts.
        event.stopImmediatePropagation();
      }
    };
    const handleFocus = (event: FocusEvent) => {
      if (event.target instanceof Node && !panelRef.current?.contains(event.target) && event.target !== buttonRef.current) {
        dismiss();
      }
    };
    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("resize", dismiss);
    document.addEventListener("focusin", handleFocus);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("resize", dismiss);
      document.removeEventListener("focusin", handleFocus);
    };
  }, []);

  const positionPanel = () => {
    const button = buttonRef.current;
    const panel = panelRef.current;
    if (!button || !panel) return;
    const rect = button.getBoundingClientRect();
    panel.style.left = `${Math.max(12, Math.min(window.innerWidth - panel.offsetWidth - 12, rect.right - panel.offsetWidth))}px`;
    panel.style.top = `${Math.max(12, Math.min(window.innerHeight - panel.offsetHeight - 12,
      position === "top" ? rect.bottom + 20 : rect.top - panel.offsetHeight - 20))}px`;
  };

  useLayoutEffect(() => {
    if (open) positionPanel();
  }, [open, position]);

  const handleToggle = (newState: string) => {
    setOpen(newState === "open");
    if (newState !== "open") return;
    positionPanel();
    const panel = panelRef.current;
    if (!panel) return;
    panel.querySelector<HTMLInputElement>("input:checked")?.focus({ preventScroll: true });
  };

  return <>
    <button ref={buttonRef} type="button" className="xpe-button xpe-icon-button"
      popoverTarget={id} data-tooltip={open ? undefined : t("toolbarSettings")} aria-label={t("toolbarSettings")}
      aria-haspopup="dialog" aria-expanded={open} aria-controls={id}>
      <svg className="xpe-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="m9.5 4 .6-2h3.8l.6 2 1.5.9 2-.5 1.9 3.2-1.4 1.5v1.8l1.4 1.5-1.9 3.2-2-.5-1.5.9-.6 2h-3.8l-.6-2-1.5-.9-2 .5-1.9-3.2 1.4-1.5V9.1L4.1 7.6 6 4.4l2 .5z" transform="translate(0 2)" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    </button>
    <div ref={panelRef} id={id} popover="auto" role="dialog" aria-labelledby={`${id}-title`}
      className="xpe-toolbar-settings" onToggle={event => handleToggle(event.newState)}>
      <h2 id={`${id}-title`} className="xpe-toolbar-settings__title">{t("toolbarSettings")}</h2>
      <fieldset className="xpe-toolbar-settings__options xpe-toolbar-settings__options--position" aria-describedby={`${id}-hint`}>
        <legend>{t("toolbarPosition")}</legend>
        {(["top", "bottom"] as const).map(value => <label key={value}
          className="xpe-toolbar-settings__option xpe-toolbar-settings__option--position">
          <input type="radio" name={`${id}-position`} value={value} checked={position === value}
            onChange={() => onPositionChange(value)} />
          <span>{t(value === "top" ? "toolbarPositionTop" : "toolbarPositionBottom")}</span>
        </label>)}
      </fieldset>
      <fieldset className="xpe-toolbar-settings__options" aria-describedby={`${id}-hint`}>
        <legend>{t("toolbarStyle")}</legend>
        {(["classic", "liquid-glass"] as const).map(value => <label key={value} className="xpe-toolbar-settings__option">
          <input type="radio" name={`${id}-style`} value={value} checked={style === value}
            onChange={() => onStyleChange(value)} />
          <span>{t(value === "classic" ? "toolbarStyleClassic" : "toolbarStyleLiquidGlass")}</span>
          <span className={`xpe-toolbar-settings__preview xpe-toolbar-settings__preview--${value}`} aria-hidden="true">
            <span /><span /><span />
          </span>
        </label>)}
      </fieldset>
      <p id={`${id}-hint`} className="xpe-toolbar-settings__hint">{t("toolbarStyleHint")}</p>
      <div className="xpe-toolbar-settings__help">
        <button type="button" aria-haspopup="dialog" onClick={() => {
          panelRef.current?.hidePopover();
          onShowTextGuide();
        }}>{t("textGuideHelp")}<span aria-hidden="true">?</span></button>
      </div>
    </div>
  </>;
}
