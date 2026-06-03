"use client";

import Link from "next/link";
import { BookOpen, Sparkles, Image, Mic, Share2 } from "lucide-react";
import { useEffect, useState } from "react";

const features = [
  {
    icon: Sparkles,
    title: "AI Story Generation",
    description: "Create unique, engaging stories tailored to any age group with advanced AI.",
  },
  {
    icon: Image,
    title: "Beautiful Illustrations",
    description: "Each page comes with stunning AI-generated artwork in your chosen style.",
  },
  {
    icon: Mic,
    title: "Audio Narration",
    description: "Professional-quality text-to-speech narration brings stories to life.",
  },
  {
    icon: Share2,
    title: "Easy to Share",
    description: "Export as PDF or share your stories with family and friends.",
  },
];

function FloatingBooks() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-float"
          style={{
            left: `${15 + i * 18}%`,
            top: `${20 + (i % 3) * 25}%`,
            animationDelay: `${i * 0.7}s`,
            animationDuration: `${4 + i * 0.5}s`,
            opacity: 0.15,
          }}
        >
          <BookOpen className="w-12 h-12 text-purple-400" />
        </div>
      ))}
    </div>
  );
}

export default function LandingHero() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#1e1e1e] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-[#1e1e1e] to-pink-900/40" />
      <FloatingBooks />

      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-24 pb-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm mb-6">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Story Creation</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
              AI Story Book
            </span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Create magical stories for kids with the power of AI
          </p>

          <Link
            href="/sign-in"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-lg hover:from-purple-500 hover:to-pink-500 transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
          >
            <Sparkles className="w-5 h-5" />
            Get Started Free
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl bg-[#252526] border border-[#3c3c3c] hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-200 mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
