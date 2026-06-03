"use client";

import { useState } from "react";
import { X, Palette, Type } from "lucide-react";
import { COLOR_PALETTES, FONT_LIST } from "../_lib/constants";

interface BrandKitPanelProps {
  open: boolean;
  onClose: () => void;
  onSelectColor: (color: string) => void;
  onSelectFont: (font: string) => void;
}

const paletteNames: Record<string, string> = {
  default: "Default",
  pastel: "Pastel",
  vibrant: "Vibrant",
  dark: "Dark",
};

export default function BrandKitPanel({ open, onClose, onSelectColor, onSelectFont }: BrandKitPanelProps) {
  const [activePalette, setActivePalette] = useState("default");
  const [selectedFont, setSelectedFont] = useState("Arial");

  const colors = COLOR_PALETTES[activePalette as keyof typeof COLOR_PALETTES] || COLOR_PALETTES.default;

  return (
    <div
      className={`w-[300px] flex-shrink-0 bg-[#252526] border-r border-[#3c3c3c] shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
        open ? "max-w-[300px] opacity-100" : "max-w-0 opacity-0 border-r-0"
      }`}
    >
      {open && (
        <>
          <div className="h-10 border-b border-[#3c3c3c] flex items-center justify-between px-4 flex-shrink-0">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">Brand Kit</span>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-white p-1 rounded hover:bg-[#3c3c3c] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div>
              <span className="flex items-center gap-1.5 text-[10px] text-gray-600 uppercase tracking-wider mb-3">
                <Palette className="w-3 h-3" /> Brand Colors
              </span>
              <div className="flex gap-1 mb-3 flex-wrap">
                {Object.keys(COLOR_PALETTES).map((key) => (
                  <button
                    key={key}
                    onClick={() => setActivePalette(key)}
                    className={`text-[10px] px-2.5 py-1 rounded-full border transition-colors ${
                      activePalette === key
                        ? "bg-orange-500/20 border-orange-500/50 text-orange-400"
                        : "border-[#3c3c3c] text-gray-500 hover:text-gray-300 hover:border-gray-600"
                    }`}
                  >
                    {paletteNames[key] || key}
                  </button>
                ))}
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {colors.map((c: string) => (
                  <button
                    key={c}
                    onClick={() => onSelectColor(c)}
                    className="w-[28px] h-[28px] rounded-lg border border-[#3c3c3c] hover:scale-110 transition-transform shrink-0"
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
              </div>
            </div>

            <div className="w-full h-px bg-[#3c3c3c]" />

            <div>
              <span className="flex items-center gap-1.5 text-[10px] text-gray-600 uppercase tracking-wider mb-3">
                <Type className="w-3 h-3" /> Brand Fonts
              </span>
              <div className="space-y-1">
                {FONT_LIST.map((font) => (
                  <button
                    key={font}
                    onClick={() => { setSelectedFont(font); onSelectFont(font); }}
                    className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                      selectedFont === font
                        ? "bg-orange-500/10 border-orange-500/30 text-orange-400"
                        : "bg-[#1e1e1e] border-[#333] text-gray-400 hover:border-gray-600 hover:text-gray-300"
                    }`}
                  >
                    <span className="text-sm" style={{ fontFamily: font }}>{font}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
