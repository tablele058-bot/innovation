"use client";

import { useState, useCallback } from "react";
import { BookOpen, Sparkles, Image, Mic, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface StoryFormProps {
  onStoryCreated: (story: any) => void;
  credits: number;
}

const ageGroups = [
  { value: "toddler", label: "Toddler (1-3)" },
  { value: "kids", label: "Kids (4-7)" },
  { value: "preteens", label: "Pre-teens (8-12)" },
  { value: "teens", label: "Teens (13+)" },
];

const genres = [
  "Fantasy",
  "Science Fiction",
  "Adventure",
  "Fairy Tale",
  "Educational",
  "Mythology",
  "Animal Stories",
  "Comedy",
];

const artStyles = [
  "Oil Painting",
  "Watercolor",
  "Comic",
  "Anime",
  "3D Render",
  "Sketch",
  "Paper Cut",
  "Pixel Art",
];

const storyLengths = [
  { value: "short", label: "Short (1 min)" },
  { value: "medium", label: "Medium (3 min)" },
  { value: "long", label: "Long (5 min)" },
];

export default function StoryForm({ onStoryCreated, credits }: StoryFormProps) {
  const [subject, setSubject] = useState("");
  const [ageGroup, setAgeGroup] = useState("kids");
  const [genre, setGenre] = useState("Fantasy");
  const [artStyle, setArtStyle] = useState("Watercolor");
  const [storyLength, setStoryLength] = useState("medium");
  const [characterName, setCharacterName] = useState("");
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState("");

  const handleGenerate = async () => {
    if (!subject.trim()) {
      toast.error("Please enter a story subject or theme");
      return;
    }
    if (credits < 1) {
      toast.error("You don't have enough credits. Please purchase more.");
      return;
    }

    setLoading(true);
    setStage("Generating story...");
    try {
      const res = await fetch("/api/ai-book/generate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim(),
          ageGroup,
          genre,
          artStyle,
          storyLength,
          characterName: characterName.trim(),
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to generate story");
      }

      const story = await res.json();
      const pages = story.pages || [];

      setStage("Generating illustrations...");
      const pagesWithImages = (
        await Promise.allSettled(
          pages.map(async (page: any, idx: number) => {
            const imgRes = await fetch("/api/ai-book/generate-image", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                prompt: page.imagePrompt || `${story.title} page ${idx + 1}`,
                artStyle,
                genre,
              }),
            });
            const imgData = await imgRes.json();
            return {
              text: page.content,
              imageUrl: imgData.imageUrl || "",
            };
          })
        )
      ).map((r) =>
        r.status === "fulfilled"
          ? r.value
          : { text: "", imageUrl: "" }
      );

      const finalPages = pagesWithImages.map((p, i) => ({
        text: p.text || pages[i]?.content || "",
        imageUrl: p.imageUrl || "",
      }));

      const storyId = Date.now();
      let savedStory: any = {
        id: storyId,
        title: story.title,
        content: finalPages,
        ageGroup,
        genre,
        artStyle,
        characterName: characterName.trim(),
        coverImageUrl: finalPages[0]?.imageUrl || "",
        audioUrl: "",
        isPublic: "false",
        creditsUsed: 1,
        createdAt: new Date().toISOString(),
      };

      setStage("Saving...");
      try {
        const saveRes = await fetch("/api/ai-book", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: story.title,
            content: finalPages,
            ageGroup,
            genre,
            artStyle,
            characterName: characterName.trim(),
            coverImageUrl: finalPages[0]?.imageUrl || "",
            audioUrl: "",
            isPublic: false,
          }),
        });

        if (saveRes.ok) {
          savedStory = await saveRes.json();
        } else {
          console.warn("Save failed, using local story");
        }
      } catch (saveErr) {
        console.warn("Save error, using local story:", saveErr);
      }

      toast.success("Story generated successfully!");
      onStoryCreated(savedStory);
      setSubject("");
      setCharacterName("");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
      setStage("");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Create New Story
        </h2>
        <p className="text-gray-400 mt-2">
          Fill in the details below and let AI create a magical story
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <BookOpen className="w-4 h-4 inline mr-1.5 text-purple-400" />
            Subject / Theme
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g., A brave little dragon learning to fly"
            className="w-full px-4 py-3 rounded-xl bg-[#252526] border border-[#3c3c3c] text-gray-200 placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Age Group</label>
            <select
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#252526] border border-[#3c3c3c] text-gray-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
            >
              {ageGroups.map((ag) => (
                <option key={ag.value} value={ag.value}>{ag.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Sparkles className="w-4 h-4 inline mr-1.5 text-amber-400" />
              Genre
            </label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#252526] border border-[#3c3c3c] text-gray-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
            >
              {genres.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Image className="w-4 h-4 inline mr-1.5 text-pink-400" />
              Art Style
            </label>
            <select
              value={artStyle}
              onChange={(e) => setArtStyle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#252526] border border-[#3c3c3c] text-gray-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
            >
              {artStyles.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Mic className="w-4 h-4 inline mr-1.5 text-purple-400" />
              Story Length
            </label>
            <select
              value={storyLength}
              onChange={(e) => setStoryLength(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#252526] border border-[#3c3c3c] text-gray-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
            >
              {storyLengths.map((sl) => (
                <option key={sl.value} value={sl.value}>{sl.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Plus className="w-4 h-4 inline mr-1.5 text-amber-400" />
            Main Character Name (optional)
          </label>
          <input
            type="text"
            value={characterName}
            onChange={(e) => setCharacterName(e.target.value)}
            placeholder="e.g., Sparky the Dragon"
            className="w-full px-4 py-3 rounded-xl bg-[#252526] border border-[#3c3c3c] text-gray-200 placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-lg hover:from-purple-500 hover:to-pink-500 disabled:from-purple-800 disabled:to-pink-800 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {stage || "Generating..."}
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Story
            </>
          )}
        </button>
      </div>
    </div>
  );
}
