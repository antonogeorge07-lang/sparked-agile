import { useEffect, useState, useCallback } from "react";

export type UIMode = "simple" | "advanced";

const STORAGE_KEY = "spark-agile.ui_mode";
const EVENT = "spark-agile:ui_mode_change";

function read(): UIMode {
  if (typeof window === "undefined") return "simple";
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v === "advanced" ? "advanced" : "simple";
}

/**
 * UI mode toggle. "simple" = Apple-mode shell (Briefing / Connect / Settings only).
 * "advanced" = full surface area for power users.
 * Defaults to "simple" — the briefing is the product.
 */
export function useUIMode() {
  const [mode, setModeState] = useState<UIMode>(() => read());

  useEffect(() => {
    const onChange = () => setModeState(read());
    window.addEventListener(EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const setMode = useCallback((next: UIMode) => {
    window.localStorage.setItem(STORAGE_KEY, next);
    window.dispatchEvent(new Event(EVENT));
    setModeState(next);
  }, []);

  const toggle = useCallback(() => {
    setMode(mode === "simple" ? "advanced" : "simple");
  }, [mode, setMode]);

  return { mode, setMode, toggle, isSimple: mode === "simple" };
}
