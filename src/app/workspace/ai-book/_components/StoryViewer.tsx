"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  Download,
  BookOpen,
  Trash2,
} from "lucide-react";

interface Page {
  text: string;
  imageUrl: string;
}

interface StoryViewerProps {
  story: {
    id: number;
    title: string;
    content: Page[];
    ageGroup: string;
    genre: string;
    artStyle: string;
    audioUrl?: string;
  };
  onBack: () => void;
  onDelete?: (id: number) => void;
}

export default function StoryViewer({ story, onBack, onDelete }: StoryViewerProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isReadAloud, setIsReadAloud] = useState(false);
  const [imageError, setImageError] = useState<Record<number, boolean>>({});
  const [isNarrating, setIsNarrating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const pages = story.content || [];
  const totalPages = pages.length;

  const speakPage = useCallback((text: string) => {
    const synth = synthRef.current;
    if (!synth) return;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.onend = () => {
      if (isNarrating && currentPage < totalPages - 1) {
        setCurrentPage((p) => p + 1);
      } else if (isNarrating) {
        setIsNarrating(false);
      }
    };
    synth.speak(utterance);
  }, [isNarrating, currentPage, totalPages]);

  useEffect(() => {
    if (isReadAloud && pages[currentPage]) {
      speakPage(pages[currentPage].text);
    }
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [currentPage, isReadAloud, pages, speakPage]);

  const toggleNarrate = () => {
    if (isNarrating) {
      if (synthRef.current) synthRef.current.cancel();
      setIsNarrating(false);
    } else {
      setIsNarrating(true);
      setIsReadAloud(true);
    }
  };

  useEffect(() => {
    if (isNarrating && pages[currentPage]) {
      speakPage(pages[currentPage].text);
    }
  }, [currentPage, isNarrating, pages, speakPage]);

  const goToPage = (index: number) => {
    if (index >= 0 && index < totalPages) {
      setCurrentPage(index);
      if (synthRef.current) synthRef.current.cancel();
    }
  };

  const handleDownloadPDF = async () => {
    const content = pages.map((p, i) => `Page ${i + 1}:\n${p.text}`).join("\n\n");
    const blob = new Blob([`${story.title}\n\n${content}`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${story.title.replace(/\s+/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (totalPages === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-400">
          <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No pages found in this story.</p>
          <button onClick={onBack} className="mt-4 text-purple-400 hover:text-purple-300 transition-colors">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const page = pages[currentPage];

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      <div className="flex items-center justify-between px-6 py-3 border-b border-[#3c3c3c] bg-[#252526]">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setIsReadAloud(!isReadAloud);
              if (isReadAloud && synthRef.current) synthRef.current.cancel();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
              isReadAloud
                ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                : "bg-[#3c3c3c] text-gray-400 hover:text-white"
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            {isReadAloud ? "Reading" : "Read to Me"}
          </button>

          <button
            onClick={toggleNarrate}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
              isNarrating
                ? "bg-pink-500/20 text-pink-400 border border-pink-500/30"
                : "bg-[#3c3c3c] text-gray-400 hover:text-white"
            }`}
          >
            {isNarrating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isNarrating ? "Stop" : "Narrate All"}
          </button>

          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3c3c3c] text-gray-400 hover:text-white transition-all text-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </button>
          {onDelete && (
            <button
              onClick={async () => {
                if (isDeleting) return;
                setIsDeleting(true);
                try {
                  const res = await fetch(`/api/ai-book?id=${story.id}`, { method: "DELETE" });
                  if (res.ok) {
                    onDelete(story.id);
                  }
                } finally {
                  setIsDeleting(false);
                }
              }}
              disabled={isDeleting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all text-xs border border-red-500/20"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-4xl w-full">
          <div className="relative group perspective-1000">
            <div className="relative bg-[#252526] rounded-2xl border border-[#3c3c3c] overflow-hidden shadow-2xl transform transition-transform duration-500 hover:shadow-purple-500/10">
              <div className="flex flex-col lg:flex-row">
                <div className="lg:w-1/2 bg-[#1e1e1e] flex items-center justify-center p-4 min-h-[300px]">
                  {page.imageUrl && !imageError[currentPage] ? (
                    <img
                      src={page.imageUrl}
                      alt={`Page ${currentPage + 1}`}
                      className="w-full h-auto max-h-[400px] object-contain rounded-lg"
                      onError={() => setImageError((prev) => ({ ...prev, [currentPage]: true }))}
                    />
                  ) : (
                    <div className="w-full h-[300px] bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-purple-500/30" />
                    </div>
                  )}
                </div>
                <div className="lg:w-1/2 p-8 flex flex-col justify-center">
                  <div className="text-xs text-purple-400 mb-4 font-medium uppercase tracking-wider">
                    {story.genre} &middot; {story.artStyle}
                  </div>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-gray-200 leading-relaxed text-lg whitespace-pre-line">
                      {page.text}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-6 py-4 border-t border-[#3c3c3c] bg-[#252526]">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed enabled:hover:bg-[#3c3c3c] text-gray-300"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        <div className="text-sm text-gray-400">
          Page <span className="text-purple-400 font-semibold">{currentPage + 1}</span> of {totalPages}
        </div>

        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages - 1}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed enabled:hover:bg-[#3c3c3c] text-gray-300"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
