"use client";

import { useState, useCallback } from "react";
import { X, Search, Loader2, ImageOff } from "lucide-react";

interface UnsplashImage {
  id: string;
  urls: {
    small: string;
    regular: string;
  };
  alt_description: string | null;
}

interface UnsplashPanelProps {
  open: boolean;
  onClose: () => void;
  onAddImage: (url: string) => void;
}

export default function UnsplashPanel({ open, onClose, onAddImage }: UnsplashPanelProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UnsplashImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const searchImages = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=20`,
        {
          headers: {
            Authorization: `Client-ID ${process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || ""}`,
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
      } else {
        setResults([]);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    searchImages(query);
  }, [query, searchImages]);

  return (
    <div
      className={`w-[320px] flex-shrink-0 bg-[#252526] border-r border-[#3c3c3c] shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
        open ? "max-w-[320px] opacity-100" : "max-w-0 opacity-0 border-r-0"
      }`}
    >
      {open && (
        <>
          <div className="h-10 border-b border-[#3c3c3c] flex items-center justify-between px-4 flex-shrink-0">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">Unsplash</span>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-white p-1 rounded hover:bg-[#3c3c3c] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-3 border-b border-[#3c3c3c]">
            <form onSubmit={handleSubmit} className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search stock photos..."
                className="w-full bg-[#1e1e1e] border border-[#3c3c3c] rounded-lg pl-8 pr-3 py-2 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-colors"
              />
            </form>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />
              </div>
            )}

            {!loading && !searched && (
              <div className="flex flex-col items-center justify-center py-12 text-gray-600">
                <Search className="w-8 h-8 mb-2" />
                <p className="text-xs">Search millions of free photos</p>
              </div>
            )}

            {!loading && searched && results.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-gray-600">
                <ImageOff className="w-8 h-8 mb-2" />
                <p className="text-xs">No results found</p>
              </div>
            )}

            {!loading && results.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {results.map((img: UnsplashImage) => (
                  <button
                    key={img.id}
                    onClick={() => onAddImage(img.urls?.regular || img.urls?.small)}
                    className="group relative rounded-lg overflow-hidden border border-[#3c3c3c] hover:border-orange-500/50 transition-colors aspect-[4/3]"
                  >
                    <img
                      src={img.urls?.small}
                      alt={img.alt_description || "Unsplash image"}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-[10px] text-white font-medium bg-orange-500 px-2 py-1 rounded">
                        Add to canvas
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
