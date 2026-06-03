"use client";

import { ExternalLink, Trash2, Tag } from "lucide-react";

interface Pin {
  id: number;
  title: string;
  description?: string;
  url?: string;
  imageUrl?: string;
  category: string;
  tags?: string;
  createdAt: string;
}

export default function PinCard({ pin, onDelete }: { pin: Pin; onDelete: (id: number) => void }) {
  return (
    <div className="group break-inside-avoid mb-4 bg-[#252526] rounded-xl border border-[#3c3c3c] overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
      <div className="relative">
        {pin.imageUrl ? (
          <img
            src={pin.imageUrl}
            alt={pin.title}
            className="w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="h-32 bg-gradient-to-br from-purple-900/30 to-pink-900/30 flex items-center justify-center">
            <span className="text-4xl">📌</span>
          </div>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(pin.id);
          }}
          className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/10 text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition-all border border-red-500/20"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="p-3 space-y-2">
        <h3 className="text-sm font-semibold text-gray-200 line-clamp-2">{pin.title}</h3>
        {pin.description && (
          <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{pin.description}</p>
        )}
        {pin.tags && (
          <div className="flex flex-wrap gap-1">
            {pin.tags.split(",").slice(0, 3).map((tag) => (
              <span key={tag} className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-purple-500/10 text-[10px] text-purple-400">
                <Tag className="w-2.5 h-2.5" />
                {tag.trim()}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between pt-1">
          <span className="px-2 py-0.5 rounded-full bg-pink-500/10 text-[10px] text-pink-400">
            {pin.category}
          </span>
          {pin.url && (
            <a
              href={pin.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1 rounded-md text-gray-500 hover:text-purple-400 hover:bg-purple-500/10 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
