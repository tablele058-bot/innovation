"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = [
  "Startup Ideas",
  "Tools & Resources",
  "Funding & Investors",
  "Learning",
  "News & Articles",
  "Templates",
];

interface AddPinModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function AddPinModal({ open, onClose, onCreated }: AddPinModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [tags, setTags] = useState("");
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
          imageUrl: imageUrl.trim(),
          category,
          tags: tags.trim(),
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success("Pin added!");
      setTitle("");
      setDescription("");
      setUrl("");
      setImageUrl("");
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
      <div className="bg-[#252526] rounded-2xl border border-[#3c3c3c] p-6 w-full max-w-lg mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-200">Add Pin</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-[#3c3c3c] text-gray-400 hover:text-white transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Title *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#1e1e1e] border border-[#3c3c3c] text-gray-200 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
              placeholder="e.g., YC Startup School"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-lg bg-[#1e1e1e] border border-[#3c3c3c] text-gray-200 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all resize-none"
              placeholder="Brief description of this resource"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">URL</label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#1e1e1e] border border-[#3c3c3c] text-gray-200 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Image URL (optional)</label>
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#1e1e1e] border border-[#3c3c3c] text-gray-200 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
              placeholder="https://... or data:image/..."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#1e1e1e] border border-[#3c3c3c] text-gray-200 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
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
                className="w-full px-3 py-2 rounded-lg bg-[#1e1e1e] border border-[#3c3c3c] text-gray-200 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                placeholder="comma, separated"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium text-sm hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {saving ? "Saving..." : "Add Pin"}
          </button>
        </form>
      </div>
    </div>
  );
}
