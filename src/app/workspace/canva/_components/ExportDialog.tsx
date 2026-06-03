"use client";

import { useState } from "react";
import { X, Download, FileImage, FileType, FileJson } from "lucide-react";

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  onExport: (format: string, quality: number, transparent: boolean, multiPage: boolean) => void;
}

export default function ExportDialog({ open, onClose, onExport }: ExportDialogProps) {
  const [format, setFormat] = useState("png");
  const [quality, setQuality] = useState(90);
  const [transparent, setTransparent] = useState(false);
  const [multiPage, setMultiPage] = useState(false);

  if (!open) return null;

  const formats = [
    { id: "png", label: "PNG", icon: FileImage, desc: "High quality" },
    { id: "jpg", label: "JPG", icon: FileImage, desc: "Smaller file" },
    { id: "svg", label: "SVG", icon: FileType, desc: "Vector" },
    { id: "pdf", label: "PDF", icon: FileJson, desc: "Document" },
  ];

  return (
    <div className="absolute inset-0 z-40 bg-black/60 flex items-center justify-center" onClick={onClose}>
      <div
        className="w-[400px] bg-[#252526] border border-[#3c3c3c] rounded-xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-11 border-b border-[#3c3c3c] flex items-center justify-between px-4">
          <span className="text-sm font-semibold text-gray-200">Export Design</span>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white p-1 rounded hover:bg-[#3c3c3c] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div>
            <span className="text-[10px] text-gray-600 uppercase tracking-wider block mb-3">File Format</span>
            <div className="grid grid-cols-4 gap-2">
              {formats.map((f) => {
                const Icon = f.icon;
                return (
                  <button
                    key={f.id}
                    onClick={() => setFormat(f.id)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-colors ${
                      format === f.id
                        ? "bg-orange-500/20 border-orange-500/50"
                        : "bg-[#1e1e1e] border-[#3c3c3c] hover:border-gray-600"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${format === f.id ? "text-orange-400" : "text-gray-400"}`} />
                    <span className={`text-xs font-medium ${format === f.id ? "text-orange-400" : "text-gray-300"}`}>
                      {f.label}
                    </span>
                    <span className="text-[9px] text-gray-600">{f.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {(format === "jpg" || format === "jpeg") && (
            <div>
              <span className="text-[10px] text-gray-600 uppercase tracking-wider block mb-2">Quality</span>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(parseInt(e.target.value))}
                  className="flex-1 accent-orange-500"
                />
                <span className="text-xs text-gray-400 w-8 text-right font-mono">{quality}%</span>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={transparent}
                onChange={(e) => setTransparent(e.target.checked)}
                className="accent-orange-500"
                disabled={format === "jpg"}
              />
              <span className="text-xs text-gray-300">Transparent background</span>
              {(format === "jpg" || format === "jpeg") && (
                <span className="text-[10px] text-gray-600">(not available for JPG)</span>
              )}
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={multiPage}
                onChange={(e) => setMultiPage(e.target.checked)}
                className="accent-orange-500"
                disabled={format !== "pdf"}
              />
              <span className="text-xs text-gray-300">Export all pages (PDF only)</span>
            </label>
          </div>

          <button
            onClick={() => onExport(format, quality / 100, transparent, multiPage)}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            Export as {format.toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  );
}
