"use client";

import { useEffect, useCallback, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface PresentationViewPage {
  id?: string;
  name?: string;
  thumbnail?: string;
}

interface PresentationViewProps {
  pages: PresentationViewPage[];
  currentPage: number;
  onClose: () => void;
}

export default function PresentationView({ pages, currentPage: initialPage, onClose }: PresentationViewProps) {
  const [pageIndex, setPageIndex] = useState(initialPage);

  const goNext = useCallback(() => {
    setPageIndex((prev) => Math.min(prev + 1, pages.length - 1));
  }, [pages.length]);

  const goPrev = useCallback(() => {
    setPageIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        goPrev();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, goNext, goPrev]);

  return (
    <div className="absolute inset-0 z-50 bg-black flex flex-col">
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title="Exit (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
          <span className="text-xs text-white/60 font-mono">
            {pageIndex + 1} / {pages.length}
          </span>
        </div>
        <span className="text-[10px] text-white/40">Presentation Mode</span>
      </div>

      <div className="flex-1 flex items-center justify-center relative">
        <button
          onClick={goPrev}
          disabled={pageIndex <= 0}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-colors disabled:opacity-20 disabled:cursor-not-allowed z-10"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="w-full h-full flex items-center justify-center p-16">
          <div className="w-full max-w-5xl aspect-video bg-white rounded-lg shadow-2xl flex items-center justify-center overflow-hidden">
            {pages[pageIndex]?.thumbnail ? (
              <img
                src={pages[pageIndex].thumbnail}
                alt={`Page ${pageIndex + 1}`}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center gap-3">
                <span className="text-6xl font-bold text-gray-200">{pageIndex + 1}</span>
                <span className="text-sm text-gray-400">{pages[pageIndex]?.name || `Page ${pageIndex + 1}`}</span>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={goNext}
          disabled={pageIndex >= pages.length - 1}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-colors disabled:opacity-20 disabled:cursor-not-allowed z-10"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-1.5 py-4 bg-gradient-to-t from-black/60 to-transparent">
        {pages.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setPageIndex(idx)}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === pageIndex
                ? "bg-white w-6"
                : "bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
