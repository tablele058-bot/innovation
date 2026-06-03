"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { TEMPLATES, TEMPLATE_CATEGORIES } from "../_lib/constants";

const gradientBg = (name: string) => {
  const colors = [
    "from-pink-500 to-purple-600",
    "from-blue-500 to-cyan-500",
    "from-green-500 to-emerald-600",
    "from-orange-500 to-red-500",
    "from-purple-500 to-indigo-600",
    "from-yellow-500 to-orange-500",
    "from-teal-500 to-green-500",
    "from-rose-500 to-pink-600",
    "from-sky-500 to-blue-600",
    "from-violet-500 to-purple-600",
    "from-fuchsia-500 to-pink-500",
    "from-amber-500 to-yellow-500",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

interface TemplateItem {
  name: string;
  preset: string;
  thumbnail: string;
  elements: unknown[];
}

interface TemplatesPanelProps {
  open: boolean;
  onClose: () => void;
  onSelectTemplate: (template: TemplateItem) => void;
}

export default function TemplatesPanel({ open, onClose, onSelectTemplate }: TemplatesPanelProps) {
  const [activeCategory, setActiveCategory] = useState(TEMPLATE_CATEGORIES[0]?.id || "instagram-post");

  const templates = TEMPLATES[activeCategory] || [];

  return (
    <div
      className={`w-[320px] flex-shrink-0 bg-[#252526] border-r border-[#3c3c3c] shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
        open ? "max-w-[320px] opacity-100" : "max-w-0 opacity-0 border-r-0"
      }`}
    >
      {open && (
        <>
          <div className="h-10 border-b border-[#3c3c3c] flex items-center justify-between px-4 flex-shrink-0">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">Templates</span>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-white p-1 rounded hover:bg-[#3c3c3c] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-shrink-0 overflow-x-auto border-b border-[#3c3c3c]">
            <div className="flex gap-0 px-2">
              {TEMPLATE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex-shrink-0 text-[10px] px-2.5 py-2 border-b-2 transition-colors whitespace-nowrap ${
                    activeCategory === cat.id
                      ? "text-orange-400 border-orange-400"
                      : "text-gray-500 border-transparent hover:text-gray-300"
                  }`}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {templates.length === 0 ? (
              <p className="text-xs text-gray-600 text-center py-8">No templates in this category</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {templates.map((tpl, idx) => (
                  <div
                    key={idx}
                    className="group relative rounded-lg overflow-hidden border border-[#3c3c3c] hover:border-orange-500/50 transition-colors cursor-pointer"
                    onClick={() => onSelectTemplate(tpl)}
                  >
                    <div className={`w-full aspect-[4/3] bg-gradient-to-br ${gradientBg(tpl.name)} flex items-center justify-center`}>
                      <span className="text-white text-xs font-semibold text-center px-2">{tpl.name}</span>
                    </div>
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="px-3 py-1.5 text-[10px] bg-orange-500 text-white rounded-md font-medium hover:bg-orange-600 transition-colors">
                        Use Template
                      </button>
                    </div>
                    <div className="p-2 bg-[#1e1e1e]">
                      <p className="text-[10px] text-gray-400 truncate">{tpl.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
