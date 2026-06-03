"use client";

import { useState } from "react";
import {
  X, Square, Circle, Triangle, Star, Diamond, Hexagon,
  ArrowRight, Minus, Heart, Cross, Ban, Check,
  ArrowUp, ArrowDown, ArrowLeft, Home, Settings, User,
} from "lucide-react";

const shapes = [
  { type: "rect", icon: Square, label: "Rectangle" },
  { type: "circle", icon: Circle, label: "Circle" },
  { type: "triangle", icon: Triangle, label: "Triangle" },
  { type: "star", icon: Star, label: "Star" },
  { type: "diamond", icon: Diamond, label: "Diamond" },
  { type: "hexagon", icon: Hexagon, label: "Hexagon" },
  { type: "arrow", icon: ArrowRight, label: "Arrow" },
  { type: "line", icon: Minus, label: "Line" },
  { type: "heart", icon: Heart, label: "Heart" },
  { type: "cross", icon: Cross, label: "Cross" },
];

const iconCategories = [
  {
    name: "General",
    icons: [
      { name: "Heart", icon: Heart },
      { name: "Star", icon: Star },
      { name: "Check", icon: Check },
      { name: "Cross", icon: Cross },
      { name: "Ban", icon: Ban },
    ],
  },
  {
    name: "Arrows",
    icons: [
      { name: "Arrow Up", icon: ArrowUp },
      { name: "Arrow Down", icon: ArrowDown },
      { name: "Arrow Left", icon: ArrowLeft },
      { name: "Arrow Right", icon: ArrowRight },
    ],
  },
  {
    name: "UI",
    icons: [
      { name: "Home", icon: Home },
      { name: "Settings", icon: Settings },
    ],
  },
  {
    name: "People",
    icons: [
      { name: "User", icon: User },
    ],
  },
];

interface ElementsPanelProps {
  open: boolean;
  onClose: () => void;
  onAddElement: (type: string, subtype?: string) => void;
}

export default function ElementsPanel({ open, onClose, onAddElement }: ElementsPanelProps) {
  const [activeTab, setActiveTab] = useState("shapes");

  return (
    <div
      className={`w-[300px] flex-shrink-0 bg-[#252526] border-r border-[#3c3c3c] shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
        open ? "max-w-[300px] opacity-100" : "max-w-0 opacity-0 border-r-0"
      }`}
    >
      {open && (
        <>
          <div className="h-10 border-b border-[#3c3c3c] flex items-center justify-between px-4 flex-shrink-0">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">Elements</span>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-white p-1 rounded hover:bg-[#3c3c3c] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-shrink-0 border-b border-[#3c3c3c]">
            <div className="flex gap-0">
              {["shapes", "icons", "lines"].map((tab) => (
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

          <div className="flex-1 overflow-y-auto p-3">
            {activeTab === "shapes" && (
              <div className="grid grid-cols-4 gap-2">
                {shapes.map((shape) => {
                  const Icon = shape.icon;
                  return (
                    <button
                      key={shape.type}
                      onClick={() => onAddElement("shape", shape.type)}
                      className="flex flex-col items-center gap-1 p-2.5 rounded-lg border border-[#3c3c3c] bg-[#1e1e1e] hover:border-orange-500/50 hover:bg-[#2b2b2b] transition-colors"
                      title={shape.label}
                    >
                      <Icon className="w-5 h-5 text-gray-300" />
                      <span className="text-[9px] text-gray-500 truncate w-full text-center">{shape.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {activeTab === "icons" && (
              <div className="space-y-4">
                {iconCategories.map((cat) => (
                  <div key={cat.name}>
                    <span className="text-[10px] text-gray-600 uppercase tracking-wider block mb-2">{cat.name}</span>
                    <div className="grid grid-cols-4 gap-2">
                      {cat.icons.map((ic) => {
                        const Icon = ic.icon;
                        return (
                          <button
                            key={ic.name}
                            onClick={() => onAddElement("icon", ic.name)}
                            className="flex flex-col items-center gap-1 p-2.5 rounded-lg border border-[#3c3c3c] bg-[#1e1e1e] hover:border-orange-500/50 hover:bg-[#2b2b2b] transition-colors"
                            title={ic.name}
                          >
                            <Icon className="w-5 h-5 text-gray-300" />
                            <span className="text-[9px] text-gray-500 truncate w-full text-center">{ic.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "lines" && (
              <div className="space-y-2">
                {[
                  { type: "line", label: "Straight Line", thickness: 2 },
                  { type: "line", label: "Medium Line", thickness: 4 },
                  { type: "line", label: "Thick Line", thickness: 8 },
                  { type: "dashed", label: "Dashed Line", thickness: 2 },
                  { type: "dotted", label: "Dotted Line", thickness: 2 },
                ].map((line) => (
                  <button
                    key={line.label}
                    onClick={() => onAddElement("line", line.type)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-lg border border-[#3c3c3c] bg-[#1e1e1e] hover:border-orange-500/50 hover:bg-[#2b2b2b] transition-colors"
                  >
                    <div className="flex-1">
                      <div
                        className="bg-gray-400 rounded-full"
                        style={{ height: line.thickness, opacity: line.type === "dashed" ? 0.6 : 1 }}
                      />
                    </div>
                    <span className="text-[11px] text-gray-400">{line.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
