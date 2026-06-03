import { useState, useCallback, useRef } from "react";

export function useHistory() {
  const [history, setHistory] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const skipNextRef = useRef(false);

  const pushState = useCallback((state: string) => {
    if (skipNextRef.current) {
      skipNextRef.current = false;
      return;
    }
    setHistory((prev) => {
      const newHistory = prev.slice(0, currentIndex + 1);
      newHistory.push(state);
      if (newHistory.length > 50) newHistory.shift();
      return newHistory;
    });
    setCurrentIndex((prev) => Math.min(prev + 1, 49));
  }, [currentIndex]);

  const undo = useCallback(() => {
    if (currentIndex <= 0) return null;
    const newIndex = currentIndex - 1;
    setCurrentIndex(newIndex);
    skipNextRef.current = true;
    return history[newIndex];
  }, [currentIndex, history]);

  const redo = useCallback(() => {
    if (currentIndex >= history.length - 1) return null;
    const newIndex = currentIndex + 1;
    setCurrentIndex(newIndex);
    skipNextRef.current = true;
    return history[newIndex];
  }, [currentIndex, history]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  const reset = useCallback((initialState: string) => {
    setHistory([initialState]);
    setCurrentIndex(0);
    skipNextRef.current = false;
  }, []);

  return { pushState, undo, redo, canUndo, canRedo, reset, history, currentIndex };
}
