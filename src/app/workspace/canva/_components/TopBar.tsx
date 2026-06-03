"use client";

import { ArrowLeft, Download, Save, Undo2, Redo2, Monitor, FileImage, ZoomIn, ZoomOut, Sparkles, Presentation,PanelRightClose,PanelRightOpen } from "lucide-react";
import Link from "next/link";

interface TopBarProps {
  designName: string;
  onNameChange: (name: string) => void;
  onSave: () => void;
  saving: boolean;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  zoom: number;
  onExport: () => void;
  onPresentation: () => void;
  onShowDesigns: () => void;
  propertiesOpen: boolean;
  onToggleProperties: () => void;
}

export default function TopBar({
  designName, onNameChange, onSave, saving,
  onUndo, onRedo, canUndo, canRedo,
  onZoomIn, onZoomOut, zoom,
  onExport, onPresentation, onShowDesigns,
  propertiesOpen, onToggleProperties,
}: TopBarProps) {
  return (
    <div className="h-11 bg-[#2b2b2b] border-b border-[#3c3c3c] flex items-center justify-between px-2 flex-shrink-0">
      <div className="flex items-center gap-2">
        <Link href="/workspace" className="text-gray-500 hover:text-gray-300 transition-colors p-1">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="w-px h-5 bg-[#3c3c3c]" />
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-pink-500 to-purple-600 rounded flex items-center justify-center">
            <FileImage className="w-3.5 h-3.5 text-white" />
          </div>
          <input
            value={designName}
            onChange={(e) => onNameChange(e.target.value)}
            className="bg-transparent text-xs text-gray-300 border-b border-transparent hover:border-gray-600 focus:border-orange-400 focus:outline-none px-1 py-0.5 w-40 font-medium"
          />
        </div>
        <div className="w-px h-5 bg-[#3c3c3c] ml-1" />
        <button onClick={onUndo} disabled={!canUndo} className="p-1.5 rounded text-gray-500 hover:text-white hover:bg-[#3c3c3c] transition-colors disabled:opacity-30 disabled:cursor-not-allowed" title="Undo (Ctrl+Z)">
          <Undo2 className="w-3.5 h-3.5" />
        </button>
        <button onClick={onRedo} disabled={!canRedo} className="p-1.5 rounded text-gray-500 hover:text-white hover:bg-[#3c3c3c] transition-colors disabled:opacity-30 disabled:cursor-not-allowed" title="Redo (Ctrl+Shift+Z)">
          <Redo2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-1">
        <button onClick={onShowDesigns} className="flex items-center gap-1 text-[11px] px-2 py-1.5 rounded text-gray-400 hover:text-white hover:bg-[#3c3c3c] transition-colors">
          <FileImage className="w-3.5 h-3.5" /> Designs
        </button>
        <button onClick={() => {}} className="flex items-center gap-1 text-[11px] px-2 py-1.5 rounded text-gray-400 hover:text-white hover:bg-[#3c3c3c] transition-colors">
          <Monitor className="w-3.5 h-3.5" /> Resize
        </button>
        <div className="flex items-center gap-0.5 px-1">
          <button onClick={onZoomOut} className="p-1 rounded text-gray-500 hover:text-white hover:bg-[#3c3c3c]" title="Zoom Out">
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] text-gray-400 w-10 text-center font-mono">{Math.round(zoom)}%</span>
          <button onClick={onZoomIn} className="p-1 rounded text-gray-500 hover:text-white hover:bg-[#3c3c3c]" title="Zoom In">
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
        <button onClick={onPresentation} className="flex items-center gap-1 text-[11px] px-2 py-1.5 rounded text-gray-400 hover:text-white hover:bg-[#3c3c3c] transition-colors" title="Presentation Mode">
          <Presentation className="w-3.5 h-3.5" /> Present
        </button>
        <div className="w-px h-5 bg-[#3c3c3c]" />
        <button onClick={onExport} className="flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded text-gray-400 hover:text-white hover:bg-[#3c3c3c] transition-colors">
          <Download className="w-3.5 h-3.5" /> Export
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-colors disabled:opacity-50 font-medium"
        >
          <Save className="w-3.5 h-3.5" /> {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
