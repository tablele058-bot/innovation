"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { Plus, Sparkles, Search, Loader2, LayoutDashboard, Compass, Link, BookmarkPlus } from "lucide-react";
import { toast } from "sonner";
import PinCard from "./_components/PinCard";
import AddPinModal from "./_components/AddPinModal";
import PinFromUrlModal from "./_components/PinFromUrlModal";

interface Pin {
  id: number;
  title: string;
  description?: string;
  url?: string;
  imageUrl?: string;
  category: string;
  tags?: string;
  isAiGenerated?: string;
  createdAt: string;
}

const CATEGORIES = [
  "All",
  "Startup Ideas",
  "Tools & Resources",
  "Funding & Investors",
  "Learning",
  "News & Articles",
  "Templates",
];

export default function StartupBoardPage() {
  const { userId, isLoaded } = useAuth();
  const [pins, setPins] = useState<Pin[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPinUrlModal, setShowPinUrlModal] = useState(false);
  const [pendingPinUrl, setPendingPinUrl] = useState("");
  const [showBookmarklet, setShowBookmarklet] = useState(false);
  const [generating, setGenerating] = useState(false);

  const fetchPins = useCallback(async () => {
    const params = new URLSearchParams();
    if (activeCategory !== "All") params.set("category", activeCategory);
    if (search) params.set("search", search);
    try {
      const res = await fetch(`/api/startup-board?${params}`);
      if (res.ok) {
        const data = await res.json();
        setPins(data.pins || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [activeCategory, search]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const pinUrl = params.get("pin");
      if (pinUrl) {
        setPendingPinUrl(pinUrl);
        setShowPinUrlModal(true);
      }
    }
  }, []);

  useEffect(() => {
    if (isLoaded && userId) fetchPins();
    else if (isLoaded) setLoading(false);
  }, [isLoaded, userId, fetchPins]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/startup-board/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          count: 6,
          category: activeCategory !== "All" ? activeCategory : undefined,
        }),
      });
      if (!res.ok) throw new Error("Generation failed");
      const data = await res.json();

      let saved = 0;
      for (const pin of data.pins) {
        const saveRes = await fetch("/api/startup-board", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pin),
        });
        if (saveRes.ok) saved++;
      }
      toast.success(`Added ${saved} AI-generated pins!`);
      fetchPins();
    } catch {
      toast.error("Failed to generate pins");
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/startup-board?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setPins((prev) => prev.filter((p) => p.id !== id));
        toast.success("Pin deleted");
      }
    } catch {
      toast.error("Failed to delete pin");
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#1e1e1e]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#1e1e1e]">
        <p className="text-gray-400">Sign in to use Startup Board</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#1e1e1e] overflow-hidden">
      <div className="border-b border-[#3c3c3c] bg-[#252526]">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <LayoutDashboard className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-semibold text-gray-200">Startup Board</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBookmarklet(!showBookmarklet)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-xs border ${
                showBookmarklet
                  ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                  : "bg-[#1e1e1e] text-gray-400 hover:text-gray-300 border-[#3c3c3c]"
              }`}
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              Pin Button
            </button>
            <button
              onClick={() => setShowPinUrlModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1e1e1e] text-gray-400 hover:text-gray-300 transition-all text-xs border border-[#3c3c3c]"
            >
              <Link className="w-3.5 h-3.5" />
              Pin from URL
            </button>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-all text-xs border border-amber-500/20 disabled:opacity-50"
            >
              {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              {generating ? "Generating..." : "AI Generate"}
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-medium hover:from-purple-500 hover:to-pink-500 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Pin
            </button>
          </div>
        </div>

        {showBookmarklet && (
          <div className="px-6 pb-3">
            <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
              <p className="text-xs text-purple-300 mb-2">
                Drag this button to your bookmarks bar. Then click it on any webpage to pin content to your Startup Board.
              </p>
              <a
                href={`javascript:(()=>{location.href='${typeof window !== "undefined" ? window.location.origin : ""}/workspace/startup-board?pin='+encodeURIComponent(location.href)})()`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-medium hover:from-purple-500 hover:to-pink-500 transition-all cursor-grab active:cursor-grabbing"
                onClick={(e) => e.preventDefault()}
              >
                <BookmarkPlus className="w-3 h-3" />
                Pin to Startup Board
              </a>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2 px-6 pb-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search pins..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#1e1e1e] border border-[#3c3c3c] text-gray-200 text-xs focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all placeholder-gray-500"
            />
          </div>
          <div className="flex gap-1 overflow-x-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                    : "bg-[#1e1e1e] text-gray-400 hover:text-gray-300 border border-transparent"
                }`}
              >
                {cat === "All" ? <Compass className="w-3 h-3 inline mr-1" /> : null}
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
          </div>
        ) : pins.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <LayoutDashboard className="w-16 h-16 text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">No pins yet</h3>
            <p className="text-gray-500 text-sm mb-4">
              {activeCategory !== "All"
                ? `No pins in "${activeCategory}" category`
                : "Add your first startup resource or generate with AI"}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium hover:from-purple-500 hover:to-pink-500 transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Pin
              </button>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-all text-sm border border-amber-500/20"
              >
                <Sparkles className="w-4 h-4" />
                AI Generate
              </button>
            </div>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
            {pins.map((pin) => (
              <PinCard key={pin.id} pin={pin} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      <AddPinModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCreated={fetchPins}
      />
      <PinFromUrlModal
        open={showPinUrlModal}
        initialUrl={pendingPinUrl}
        onClose={() => {
          setShowPinUrlModal(false);
          setPendingPinUrl("");
        }}
        onCreated={fetchPins}
      />
    </div>
  );
}
