"use client";

import { useState } from "react";
import { X, Sun, Contrast, Palette } from "lucide-react";
import { IMAGE_FILTERS } from "../_lib/constants";

interface ImagePanelProps {
  open: boolean;
  onClose: () => void;
  onApplyFilter: (filter: string) => void;
  activeFilters: string[];
  brightness: number;
  contrast: number;
  saturation: number;
  onBrightnessChange: (value: number) => void;
  onContrastChange: (value: number) => void;
  onSaturationChange: (value: number) => void;
}

export default function ImagePanel({
  open, onClose, onApplyFilter, activeFilters,
  brightness, contrast, saturation,
  onBrightnessChange, onContrastChange, onSaturationChange,
}: ImagePanelProps) {
  const [activeTab, setActiveTab] = useState("adjust");

  return (
    <div
      className={`w-[300px] flex-shrink-0 bg-[#252526] border-l border-[#3c3c3c] shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
        open ? "max-w-[300px] opacity-100" : "max-w-0 opacity-0 border-l-0"
      }`}
    >
      {open && (
        <>
          <div className="h-10 border-b border-[#3c3c3c] flex items-center justify-between px-4 flex-shrink-0">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">Image</span>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-white p-1 rounded hover:bg-[#3c3c3c] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-shrink-0 border-b border-[#3c3c3c]">
            <div className="flex gap-0">
              {["adjust", "filters", "crop"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 text-[10px] py-2.5 border-b-2 transition-colors capitalize ${
                    activeTab === tab
                      ? "text-orange-400 border-orange-400"
                      : "text-gray-500 border-transparent hover:text-gray-300"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {activeTab === "adjust" && (
              <>
                <label className="block w-full">
                  <span className="flex items-center gap-1.5 text-[10px] text-gray-600 uppercase tracking-wider">
                    <Sun className="w-3 h-3" /> Brightness
                  </span>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={brightness}
                    onChange={(e) => onBrightnessChange(parseInt(e.target.value))}
                    className="w-full mt-2 accent-orange-500"
                  />
                  <span className="text-[10px] text-gray-600 mt-0.5 block text-right">{brightness}</span>
                </label>

                <label className="block w-full">
                  <span className="flex items-center gap-1.5 text-[10px] text-gray-600 uppercase tracking-wider">
                    <Contrast className="w-3 h-3" /> Contrast
                  </span>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={contrast}
                    onChange={(e) => onContrastChange(parseInt(e.target.value))}
                    className="w-full mt-2 accent-orange-500"
                  />
                  <span className="text-[10px] text-gray-600 mt-0.5 block text-right">{contrast}</span>
                </label>

                <label className="block w-full">
                  <span className="flex items-center gap-1.5 text-[10px] text-gray-600 uppercase tracking-wider">
                    <Palette className="w-3 h-3" /> Saturation
                  </span>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={saturation}
                    onChange={(e) => onSaturationChange(parseInt(e.target.value))}
                    className="w-full mt-2 accent-orange-500"
                  />
                  <span className="text-[10px] text-gray-600 mt-0.5 block text-right">{saturation}</span>
                </label>
              </>
            )}

            {activeTab === "filters" && (
              <div className="grid grid-cols-3 gap-2">
                {IMAGE_FILTERS.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => onApplyFilter(filter.value)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-colors ${
                      activeFilters.includes(filter.value)
                        ? "bg-orange-500/20 border-orange-500/50"
                        : "bg-[#1e1e1e] border-[#3c3c3c] hover:border-orange-500/30"
                    }`}
                  >
                    <div
                      className={`w-full aspect-square rounded bg-gradient-to-br ${
                        filter.value === "none" ? "from-gray-400 to-gray-500" :
                        filter.value === "grayscale" ? "from-gray-300 to-gray-600" :
                        filter.value === "sepia" ? "from-amber-300 to-amber-700" :
                        filter.value === "vintage" ? "from-yellow-200 to-amber-800" :
                        filter.value === "warm" ? "from-orange-200 to-red-600" :
                        filter.value === "cool" ? "from-blue-200 to-blue-800" :
                        filter.value === "dramatic" ? "from-gray-700 to-black" :
                        filter.value === "fade" ? "from-gray-300 to-white" :
                        filter.value === "blur" ? "from-gray-400 to-gray-500" :
                        "from-gray-400 to-gray-500"
                      }`}
                    />
                    <span className="text-[10px] text-gray-400">{filter.name}</span>
                  </button>
                ))}
              </div>
            )}

            {activeTab === "crop" && (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <p className="text-xs text-gray-600">Crop tool coming soon</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
