import { useEffect, useCallback } from "react";

interface ShortcutMap {
  [key: string]: () => void;
}

export function useKeyboardShortcuts(shortcuts: ShortcutMap) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const ctrl = e.ctrlKey || e.metaKey;
    const shift = e.shiftKey;
    const key = e.key.toLowerCase();

    if (ctrl && shift && key === "z") {
      e.preventDefault();
      shortcuts["ctrl+shift+z"]?.();
    } else if (ctrl && key === "z") {
      e.preventDefault();
      shortcuts["ctrl+z"]?.();
    } else if (ctrl && key === "c") {
      e.preventDefault();
      shortcuts["ctrl+c"]?.();
    } else if (ctrl && key === "v") {
      e.preventDefault();
      shortcuts["ctrl+v"]?.();
    } else if (ctrl && key === "d") {
      e.preventDefault();
      shortcuts["ctrl+d"]?.();
    } else if (ctrl && key === "a") {
      e.preventDefault();
      shortcuts["ctrl+a"]?.();
    } else if (ctrl && key === "g" && !shift) {
      e.preventDefault();
      shortcuts["ctrl+g"]?.();
    } else if (ctrl && shift && key === "g") {
      e.preventDefault();
      shortcuts["ctrl+shift+g"]?.();
    } else if (ctrl && key === "s") {
      e.preventDefault();
      shortcuts["ctrl+s"]?.();
    } else if (ctrl && key === "e") {
      e.preventDefault();
      shortcuts["ctrl+e"]?.();
    } else if (ctrl && key === "p") {
      e.preventDefault();
      shortcuts["ctrl+p"]?.();
    } else if (key === "delete" || key === "backspace") {
      const activeEl = document.activeElement?.tagName?.toLowerCase();
      if (activeEl !== "input" && activeEl !== "textarea") {
        e.preventDefault();
        shortcuts["delete"]?.();
      }
    } else if (key === "escape") {
      shortcuts["escape"]?.();
    } else if (key === "+" || key === "=") {
      shortcuts["zoom-in"]?.();
    } else if (key === "-" || key === "_") {
      shortcuts["zoom-out"]?.();
    }
  }, [shortcuts]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
