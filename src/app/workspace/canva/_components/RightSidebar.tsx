"use client";

import {
  PanelRightClose, Plus, Trash2, Copy,
  Lock, Unlock, Eye, EyeOff, GripVertical,
} from "lucide-react";
import { FONT_LIST, COLOR_PALETTES } from "../_lib/constants";

interface Layer {
  id: string;
  name: string;
  locked: boolean;
  visible: boolean;
  type: string;
}

interface Page {
  id: string;
  name: string;
  thumbnail?: string;
}

interface RightSidebarProps {
  open: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pages: Page[];
  currentPage: number;
  onAddPage: () => void;
  onDeletePage: (index: number) => void;
  onDuplicatePage: (index: number) => void;
  onReorderPages: (from: number, to: number) => void;
  onSelectPage: (index: number) => void;
  layers: Layer[];
  onReorderLayers: (from: number, to: number) => void;
  onToggleLock: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onDeleteLayer: (id: string) => void;
  onSelectLayer: (id: string) => void;
  selectedLayerId: string | null;
  fillColor: string;
  onFillChange: (color: string) => void;
  strokeColor: string;
  onStrokeChange: (color: string) => void;
  strokeWidth: number;
  onStrokeWidthChange: (width: number) => void;
  opacity: number;
  onOpacityChange: (opacity: number) => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  fontFamily: string;
  onFontFamilyChange: (family: string) => void;
  fontWeight: string | number;
  onFontWeightChange: (weight: string | number) => void;
  letterSpacing: number;
  onLetterSpacingChange: (spacing: number) => void;
  lineHeight: number;
  onLineHeightChange: (height: number) => void;
}

export default function RightSidebar({
  onClose, activeTab, setActiveTab,
  pages, currentPage, onAddPage, onDeletePage, onDuplicatePage,
  onSelectPage,
  layers, onToggleLock, onToggleVisibility,
  onDeleteLayer, onSelectLayer, selectedLayerId,
  onFillChange, onStrokeChange,
  strokeWidth, onStrokeWidthChange, opacity, onOpacityChange,
  fontSize, onFontSizeChange, fontFamily, onFontFamilyChange,
  fontWeight, onFontWeightChange, letterSpacing, onLetterSpacingChange,
  lineHeight, onLineHeightChange,
}: RightSidebarProps) {
  const tabs = [
    { id: "properties", label: "Properties" },
    { id: "pages", label: "Pages" },
    { id: "layers", label: "Layers" },
  ];

  return (
    <div className="w-[300px] flex-shrink-0 bg-[#252526] border-l border-[#3c3c3c] shadow-2xl flex flex-col overflow-hidden">
      <div className="h-10 border-b border-[#3c3c3c] flex items-center justify-between px-3 flex-shrink-0">
        <div className="flex items-center gap-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-[11px] font-medium px-3 py-2.5 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "text-orange-400 border-orange-400"
                  : "text-gray-500 border-transparent hover:text-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-white p-1 rounded hover:bg-[#3c3c3c] transition-colors"
        >
          <PanelRightClose className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {activeTab === "properties" && (
          <div className="px-4 py-3 space-y-4">
            <label className="block w-full">
              <span className="text-[10px] text-gray-600 uppercase tracking-wider">Fill Color</span>
              <div className="flex gap-1.5 mt-1.5 flex-wrap">
                {COLOR_PALETTES.default.map((c) => (
                  <button
                    key={c}
                    onClick={() => onFillChange(c)}
                    className="w-[18px] h-[18px] rounded border border-[#3c3c3c] hover:scale-110 transition-transform shrink-0"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </label>

            <label className="block w-full">
              <span className="text-[10px] text-gray-600 uppercase tracking-wider">Stroke Color</span>
              <div className="flex gap-1.5 mt-1.5 flex-wrap">
                {COLOR_PALETTES.vibrant.map((c) => (
                  <button
                    key={c}
                    onClick={() => onStrokeChange(c)}
                    className="w-[18px] h-[18px] rounded border border-[#3c3c3c] hover:scale-110 transition-transform shrink-0"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </label>

            <label className="block w-full">
              <span className="text-[10px] text-gray-600 uppercase tracking-wider">Stroke Width</span>
              <select
                value={strokeWidth}
                onChange={(e) => onStrokeWidthChange(parseInt(e.target.value))}
                className="w-full mt-1.5 bg-[#1e1e1e] border border-[#3c3c3c] rounded px-2.5 py-2 text-xs text-gray-300 focus:outline-none focus:border-orange-500/50"
              >
                <option value={0}>None</option>
                <option value={1}>Thin</option>
                <option value={2}>Regular</option>
                <option value={4}>Bold</option>
                <option value={6}>Extra Bold</option>
                <option value={8}>Thick</option>
              </select>
            </label>

            <label className="block w-full">
              <span className="text-[10px] text-gray-600 uppercase tracking-wider">Opacity</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={opacity}
                onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
                className="w-full mt-1.5 accent-orange-500"
              />
              <span className="text-[10px] text-gray-600 mt-0.5 block text-right">{Math.round(opacity * 100)}%</span>
            </label>

            <div className="w-full h-px bg-[#3c3c3c]" />

            <label className="block w-full">
              <span className="text-[10px] text-gray-600 uppercase tracking-wider">Font Size</span>
              <input
                type="number"
                value={fontSize}
                onChange={(e) => onFontSizeChange(parseInt(e.target.value) || 16)}
                className="w-full mt-1.5 bg-[#1e1e1e] border border-[#3c3c3c] rounded px-2.5 py-2 text-xs text-gray-300 focus:outline-none focus:border-orange-500/50"
                min="8"
                max="200"
              />
            </label>

            <label className="block w-full">
              <span className="text-[10px] text-gray-600 uppercase tracking-wider">Font Family</span>
              <select
                value={fontFamily}
                onChange={(e) => onFontFamilyChange(e.target.value)}
                className="w-full mt-1.5 bg-[#1e1e1e] border border-[#3c3c3c] rounded px-2.5 py-2 text-xs text-gray-300 focus:outline-none focus:border-orange-500/50"
              >
                {FONT_LIST.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </label>

            <label className="block w-full">
              <span className="text-[10px] text-gray-600 uppercase tracking-wider">Font Weight</span>
              <select
                value={fontWeight}
                onChange={(e) => onFontWeightChange(e.target.value)}
                className="w-full mt-1.5 bg-[#1e1e1e] border border-[#3c3c3c] rounded px-2.5 py-2 text-xs text-gray-300 focus:outline-none focus:border-orange-500/50"
              >
                <option value="100">Thin</option>
                <option value="300">Light</option>
                <option value="400">Regular</option>
                <option value="500">Medium</option>
                <option value="600">Semi Bold</option>
                <option value="700">Bold</option>
                <option value="900">Black</option>
              </select>
            </label>

            <label className="block w-full">
              <span className="text-[10px] text-gray-600 uppercase tracking-wider">Letter Spacing</span>
              <input
                type="range"
                min="-100"
                max="500"
                step="10"
                value={letterSpacing}
                onChange={(e) => onLetterSpacingChange(parseInt(e.target.value))}
                className="w-full mt-1.5 accent-orange-500"
              />
            </label>

            <label className="block w-full">
              <span className="text-[10px] text-gray-600 uppercase tracking-wider">Line Height</span>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={lineHeight}
                onChange={(e) => onLineHeightChange(parseFloat(e.target.value))}
                className="w-full mt-1.5 accent-orange-500"
              />
            </label>
          </div>
        )}

        {activeTab === "pages" && (
          <div className="px-4 py-3 space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-gray-600 uppercase tracking-wider">
                {pages.length} page{pages.length !== 1 ? "s" : ""}
              </span>
              <button
                onClick={onAddPage}
                className="p-1 rounded text-gray-500 hover:text-white hover:bg-[#3c3c3c] transition-colors"
                title="Add page"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            {pages.map((page, idx) => (
              <div
                key={page.id}
                onClick={() => onSelectPage(idx)}
                className={`group flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                  idx === currentPage
                    ? "bg-orange-500/10 border-orange-500/30"
                    : "bg-[#1e1e1e] border-[#333] hover:border-gray-600"
                }`}
              >
                <div className="w-12 h-16 rounded bg-white border border-[#3c3c3c] flex-shrink-0 flex items-center justify-center overflow-hidden">
                  {page.thumbnail ? (
                    <img src={page.thumbnail} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[18px] font-bold text-gray-400">{idx + 1}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-300 truncate">{page.name}</p>
                  <p className="text-[10px] text-gray-600">Page {idx + 1}</p>
                </div>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); onDuplicatePage(idx); }}
                    className="p-1 rounded text-gray-500 hover:text-white hover:bg-[#3c3c3c]"
                    title="Duplicate"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeletePage(idx); }}
                    className="p-1 rounded text-gray-500 hover:text-red-400 hover:bg-[#3c3c3c]"
                    title="Delete"
                    disabled={pages.length <= 1}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "layers" && (
          <div className="px-4 py-3 space-y-1">
            <span className="text-[10px] text-gray-600 uppercase tracking-wider block mb-2">
              {layers.length} object{layers.length !== 1 ? "s" : ""}
            </span>
            {layers.length === 0 && (
              <p className="text-xs text-gray-600 text-center py-8">No objects on this page</p>
            )}
            {layers.map((layer) => (
              <div
                key={layer.id}
                onClick={() => onSelectLayer(layer.id)}
                className={`group flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                  selectedLayerId === layer.id
                    ? "bg-orange-500/10 border-orange-500/30"
                    : "bg-[#1e1e1e] border-[#333] hover:border-gray-600"
                }`}
              >
                <GripVertical className="w-3 h-3 text-gray-600 cursor-grab shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-300 truncate">{layer.name}</p>
                  <p className="text-[10px] text-gray-600 capitalize">{layer.type}</p>
                </div>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); onToggleVisibility(layer.id); }}
                    className="p-1 rounded text-gray-500 hover:text-white hover:bg-[#3c3c3c]"
                    title={layer.visible ? "Hide" : "Show"}
                  >
                    {layer.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onToggleLock(layer.id); }}
                    className="p-1 rounded text-gray-500 hover:text-white hover:bg-[#3c3c3c]"
                    title={layer.locked ? "Unlock" : "Lock"}
                  >
                    {layer.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteLayer(layer.id); }}
                    className="p-1 rounded text-gray-500 hover:text-red-400 hover:bg-[#3c3c3c]"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
