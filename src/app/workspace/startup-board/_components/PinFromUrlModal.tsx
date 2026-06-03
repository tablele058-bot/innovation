"use client";

import { useState, useEffect } from "react";
import { X, Link, Loader2, ExternalLink, Check } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = [
  "Startup Ideas",
  "Tools & Resources",
  "Funding & Investors",
  "Learning",
  "News & Articles",
  "Templates",
];

interface PinFromUrlModalProps {
  open: boolean;
  initialUrl?: string;
  onClose: () => void;
  onCreated: () => void;
}

export default function PinFromUrlModal({ open, initialUrl, onClose, onCreated }: PinFromUrlModalProps) {
  const [url, setUrl] = useState(initialUrl || "");
  const [loading, setLoading] = useState(false);
  const [scraped, setScraped] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [tags, setTags] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && initialUrl) {
      setUrl(initialUrl);
      const timer = setTimeout(() => handleScrape(), 300);
      return () => clearTimeout(timer);
    }
  }, [open, initialUrl]);

  if (!open) return null;

  const handleScrape = async () => {
    if (!url.trim()) {
      toast.error("Enter a URL");
      return;
    }
    setLoading(true);
    setScraped(null);
    try {
      const res = await fetch("/api/startup-board/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setScraped(data);
      setTitle(data.title || "");
      setDescription(data.description || "");
      setSelectedImage(data.image || data.images?.[0] || "");
    } catch {
      toast.error("Could not fetch page data. Try entering details manually.");
      setScraped({ title: "", description: "", images: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/startup-board", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          url: url.trim(),
          imageUrl: selectedImage,
          category,
          tags: tags.trim(),
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success("Pinned!");
      setUrl("");
      setScraped(null);
      setTitle("");
      setDescription("");
      setSelectedImage("");
      setTags("");
      setCategory(CATEGORIES[0]);
      onCreated();
      onClose();
    } catch {
      toast.error("Failed to save pin");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="bg-[#252526] rounded-2xl border border-[#3c3c3c] w-full max-w-2xl mx-4 shadow-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-[#3c3c3c]">
          <div className="flex items-center gap-2">
            <Link className="w-4 h-4 text-purple-400" />
            <h2 className="text-lg font-semibold text-gray-200">Pin from URL</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-[#3c3c3c] text-gray-400 hover:text-white transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto">
          <div className="flex gap-2">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste any URL to pin from..."
              className="flex-1 px-3 py-2 rounded-lg bg-[#1e1e1e] border border-[#3c3c3c] text-gray-200 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
              onKeyDown={(e) => e.key === "Enter" && handleScrape()}
            />
            <button
              onClick={handleScrape}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 transition-all flex items-center gap-1.5"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
              Fetch
            </button>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
              <span className="ml-2 text-sm text-gray-400">Fetching page data...</span>
            </div>
          )}

          {scraped && !loading && (
            <div className="space-y-4">
              {scraped.images && scraped.images.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-2">Pick an image</label>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {scraped.images.map((img: string, i: number) => (
                      <button
                        key={i}
                        onClick={() => setSelectedImage(img)}
                        className={`relative aspect-[3/2] rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImage === img
                            ? "border-purple-500 ring-2 ring-purple-500/30"
                            : "border-[#3c3c3c] hover:border-purple-500/50"
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                        {selectedImage === img && (
                          <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-400 mb-1">Title</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#1e1e1e] border border-[#3c3c3c] text-gray-200 text-sm focus:border-purple-500 outline-none transition-all"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-400 mb-1">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg bg-[#1e1e1e] border border-[#3c3c3c] text-gray-200 text-sm focus:border-purple-500 outline-none transition-all resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#1e1e1e] border border-[#3c3c3c] text-gray-200 text-sm focus:border-purple-500 outline-none transition-all"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Tags</label>
                  <input
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#1e1e1e] border border-[#3c3c3c] text-gray-200 text-sm focus:border-purple-500 outline-none transition-all"
                    placeholder="comma, separated"
                  />
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium text-sm hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {saving ? "Pinning..." : "Pin It"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
