"use client";

import {
  MousePointer2, Square, Circle, Triangle, Star, Diamond, Hexagon,
  ArrowRight, Minus, Type, Image, Video, Heart,
  Layout, Shapes, Upload, Palette, ImagePlus,
} from "lucide-react";

const tools = [
  { id: "select", icon: MousePointer2, label: "Select" },
  { id: "rect", icon: Square, label: "Rectangle" },
  { id: "circle", icon: Circle, label: "Circle" },
  { id: "triangle", icon: Triangle, label: "Triangle" },
  { id: "star", icon: Star, label: "Star" },
  { id: "diamond", icon: Diamond, label: "Diamond" },
  { id: "hexagon", icon: Hexagon, label: "Hexagon" },
  { id: "arrow", icon: ArrowRight, label: "Arrow" },
  { id: "line", icon: Minus, label: "Line" },
  { id: "text", icon: Type, label: "Text" },
  { id: "image", icon: Image, label: "Image" },
  { id: "video", icon: Video, label: "Video" },
  { id: "heart", icon: Heart, label: "Heart" },
];

const bottomActions = [
  { id: "templates", icon: Layout, label: "Templates" },
  { id: "elements", icon: Shapes, label: "Elements" },
  { id: "uploads", icon: Upload, label: "Uploads" },
  { id: "brand-kit", icon: Palette, label: "Brand Kit" },
  { id: "unsplash", icon: ImagePlus, label: "Unsplash" },
];

interface LeftSidebarProps {
  activeTool: string;
  onToolSelect: (tool: string) => void;
  onAction: (action: string) => void;
}

export default function LeftSidebar({ activeTool, onToolSelect, onAction }: LeftSidebarProps) {
  return (
    <div className="w-[48px] flex-shrink-0 bg-[#2b2b2b] border-r border-[#3c3c3c] flex flex-col items-center justify-between py-4">
      <div className="flex flex-col items-center gap-1">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => onToolSelect(tool.id)}
              className={`p-1.5 rounded-md transition-colors ${
                activeTool === tool.id
                  ? "bg-orange-500/20 text-orange-400"
                  : "text-gray-500 hover:text-white hover:bg-[#3c3c3c]"
              }`}
              title={tool.label}
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="w-6 h-px bg-[#3c3c3c] mb-1" />
        {bottomActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => onAction(action.id)}
              className="p-1.5 rounded-md text-gray-500 hover:text-white hover:bg-[#3c3c3c] transition-colors"
              title={action.label}
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
