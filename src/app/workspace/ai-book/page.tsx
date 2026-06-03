"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { BookOpen, Sparkles, Plus, Loader2, Compass, LayoutDashboard, Trash2 } from "lucide-react";
import { toast } from "sonner";
import LandingHero from "./_components/LandingHero";
import StoryForm from "./_components/StoryForm";
import StoryViewer from "./_components/StoryViewer";

interface Story {
  id: number;
  title: string;
  content: { text: string; imageUrl: string }[];
  ageGroup: string;
  genre: string;
  artStyle: string;
  characterName: string;
  coverImageUrl: string;
  audioUrl: string;
  isPublic: string;
  creditsUsed: number;
  createdAt: string;
}

type ViewTab = "dashboard" | "explore" | "create" | "view";

export default function AIBookPage() {
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<ViewTab>("dashboard");
  const [stories, setStories] = useState<Story[]>([]);
  const [publicStories, setPublicStories] = useState<Story[]>([]);
  const [credits, setCredits] = useState(10);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const fetchStories = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch("/api/ai-book");
      if (res.ok) {
        const data = await res.json();
        setStories(data.stories || []);
        setCredits(typeof data.credits === "number" ? data.credits : 10);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const fetchPublicStories = useCallback(async () => {
    try {
      const res = await fetch("/api/ai-book?public=true");
      if (res.ok) {
        const data = await res.json();
        setPublicStories(data.stories || []);
      }
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    if (isLoaded && !userId) {
      setLoading(false);
      return;
    }
    if (userId) {
      fetchStories();
      fetchPublicStories();
    }
  }, [isLoaded, userId, fetchStories, fetchPublicStories]);

  const handleStoryCreated = (story: Story) => {
    setStories((prev) => [story, ...prev]);
    setSelectedStory(story);
    setActiveTab("view");
    setCredits((c) => Math.max(0, c - 1));
  };

  const handleViewStory = (story: Story) => {
    setSelectedStory(story);
    setActiveTab("view");
  };

  const handleDeleteStory = (id: number) => {
    setStories((prev) => prev.filter((s) => s.id !== id));
    setSelectedStory(null);
    setActiveTab("dashboard");
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const getAgeGroupLabel = (ag: string) => {
    const map: Record<string, string> = {
      toddler: "Toddler",
      kids: "Kids",
      preteens: "Pre-teens",
      teens: "Teens",
    };
    return map[ag] || ag;
  };

  if (!mounted) return null;

  if (!isLoaded || loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#1e1e1e]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-gray-400">Loading your stories...</p>
        </div>
      </div>
    );
  }

  if (!userId) {
    return <LandingHero />;
  }

  const StoryCard = ({ story, isPublic }: { story: Story; isPublic?: boolean }) => (
    <div className="group text-left bg-[#252526] rounded-xl border border-[#3c3c3c] overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 relative">
      <button onClick={() => handleViewStory(story)} className="w-full text-left">
        <div className="h-40 bg-gradient-to-br from-purple-900/40 to-pink-900/40 flex items-center justify-center relative overflow-hidden">
          {story.coverImageUrl ? (
            <img
              src={story.coverImageUrl}
              alt={story.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <BookOpen className="w-12 h-12 text-purple-500/30 group-hover:scale-110 transition-transform duration-300" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#252526] to-transparent opacity-0 group-hover:opacity-60 transition-opacity" />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-200 truncate group-hover:text-purple-400 transition-colors">
            {story.title}
          </h3>
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
            <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400">
              {getAgeGroupLabel(story.ageGroup)}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-400">
              {story.genre}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2">{formatDate(story.createdAt)}</p>
        </div>
      </button>
      <button
        onClick={async (e) => {
          e.stopPropagation();
          await fetch(`/api/ai-book?id=${story.id}`, { method: "DELETE" });
          setStories((prev) => prev.filter((s) => s.id !== story.id));
        }}
        className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/10 text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition-all border border-red-500/20"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col bg-[#1e1e1e]">
      {activeTab === "view" && selectedStory ? (
        <StoryViewer
          story={selectedStory}
          onBack={() => {
            setSelectedStory(null);
            setActiveTab("dashboard");
            fetchStories();
          }}
          onDelete={handleDeleteStory}
        />
      ) : (
        <>
          <div className="border-b border-[#3c3c3c] bg-[#252526]">
            <div className="flex items-center px-6">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`flex items-center gap-2 px-4 py-3 text-sm border-b-2 transition-all ${
                  activeTab === "dashboard"
                    ? "border-purple-500 text-purple-400"
                    : "border-transparent text-gray-400 hover:text-gray-300"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab("explore")}
                className={`flex items-center gap-2 px-4 py-3 text-sm border-b-2 transition-all ${
                  activeTab === "explore"
                    ? "border-purple-500 text-purple-400"
                    : "border-transparent text-gray-400 hover:text-gray-300"
                }`}
              >
                <Compass className="w-4 h-4" />
                Explore
              </button>
              <button
                onClick={() => setActiveTab("create")}
                className={`flex items-center gap-2 px-4 py-3 text-sm border-b-2 transition-all ${
                  activeTab === "create"
                    ? "border-purple-500 text-purple-400"
                    : "border-transparent text-gray-400 hover:text-gray-300"
                }`}
              >
                <Plus className="w-4 h-4" />
                Create Story
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {activeTab === "dashboard" && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-200">My Stories</h2>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span className="text-sm text-gray-300">
                        <span className="text-amber-400 font-semibold">{credits}</span> credits
                      </span>
                    </div>
                    <button
                      onClick={() => setActiveTab("create")}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium hover:from-purple-500 hover:to-pink-500 transition-all"
                    >
                      <Sparkles className="w-4 h-4" />
                      Create New Story
                    </button>
                  </div>
                </div>

                {stories.length === 0 ? (
                  <div className="text-center py-16">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <h3 className="text-lg font-medium text-gray-400 mb-2">No stories yet</h3>
                    <p className="text-gray-500 mb-4">Create your first AI-powered story!</p>
                    <button
                      onClick={() => setActiveTab("create")}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:from-purple-500 hover:to-pink-500 transition-all"
                    >
                      <Sparkles className="w-4 h-4" />
                      Create New Story
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {stories.map((story) => (
                      <StoryCard key={story.id} story={story} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "explore" && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-200 mb-6">Explore Stories</h2>
                {publicStories.length === 0 ? (
                  <div className="text-center py-16">
                    <Compass className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <h3 className="text-lg font-medium text-gray-400 mb-2">No public stories yet</h3>
                    <p className="text-gray-500">Stories shared by the community will appear here.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {publicStories.map((story) => (
                      <StoryCard key={story.id} story={story} isPublic />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "create" && (
              <div className="p-6">
                <StoryForm onStoryCreated={handleStoryCreated} credits={credits} />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
