"use client";

import { useState, useEffect, useRef } from "react";
import { X, Type, ImageIcon, Code, ChevronRight } from "lucide-react";
import type { ElementInfo } from "./WebsiteDesign";

type Props = {
  element: ElementInfo | null;
  onClose: () => void;
  onUpdate: (html: string) => void;
  onCollapse?: () => void;
};

export default function ElementEditor({ element, onClose, onUpdate, onCollapse }: Props) {
  const [text, setText] = useState("");
  const [src, setSrc] = useState("");
  const [alt, setAlt] = useState("");
  const [rawHtml, setRawHtml] = useState("");
  const [tab, setTab] = useState<"content" | "image" | "code">("content");

  useEffect(() => {
    if (element) {
      setText(element.text || "");
      setSrc(element.src || "");
      setAlt(element.alt || "");
      setRawHtml(element.outerHTML || "");
    }
  }, [element]);

  if (!element) return null;

  const isImg = element.tag === "img";

  const applyText = () => {
    const iframeDoc = document.querySelector("iframe")?.contentDocument;
    if (!iframeDoc) return;
    const all = iframeDoc.body.getElementsByTagName("*");
    for (const el of all) {
      if (el.outerHTML === element.outerHTML) {
        el.textContent = text;
        onUpdate(iframeDoc.body.innerHTML);
        return;
      }
    }
  };

  const applySrc = () => {
    const iframeDoc = document.querySelector("iframe")?.contentDocument;
    if (!iframeDoc) return;
    const all = iframeDoc.body.getElementsByTagName("*");
    for (const el of all) {
      if (el.outerHTML === element.outerHTML && el.tagName === "IMG") {
        el.setAttribute("src", src);
        if (alt) el.setAttribute("alt", alt);
        onUpdate(iframeDoc.body.innerHTML);
        return;
      }
    }
  };

  const applyHtml = () => {
    const iframeDoc = document.querySelector("iframe")?.contentDocument;
    if (!iframeDoc) return;
    const template = iframeDoc.createElement("template");
    template.innerHTML = rawHtml.trim();
    const newNode = template.content.firstChild as HTMLElement;
    if (!newNode) return;
    const all = iframeDoc.body.getElementsByTagName("*");
    for (const el of all) {
      if (el.outerHTML === element.outerHTML) {
        el.replaceWith(newNode);
        onUpdate(iframeDoc.body.innerHTML);
        return;
      }
    }
  };

  return (
    <div className="w-72 bg-[#252526] border-l border-[#3c3c3c] flex flex-col shadow-2xl animate-slide-in">
      {/* Header */}
      <div className="h-10 border-b border-[#3c3c3c] flex items-center justify-between px-3 flex-shrink-0">
        <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">
          Element &lt;{element.tag}&gt;
        </span>
        <div className="flex items-center gap-1">
          {onCollapse && (
            <button onClick={onCollapse} className="text-gray-500 hover:text-white transition-colors p-1 rounded hover:bg-[#3c3c3c]" title="Collapse panel">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-1 rounded hover:bg-[#3c3c3c]" title="Close">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#3c3c3c]">
        {!isImg && (
          <button onClick={() => setTab("content")} className={`flex-1 py-2 text-[11px] font-medium transition-colors ${tab === "content" ? "text-orange-400 border-b-2 border-orange-400" : "text-gray-500 hover:text-gray-300"}`}>
            <Type className="w-3 h-3 inline mr-1" /> Text
          </button>
        )}
        {isImg && (
          <button onClick={() => setTab("image")} className={`flex-1 py-2 text-[11px] font-medium transition-colors ${tab === "image" ? "text-orange-400 border-b-2 border-orange-400" : "text-gray-500 hover:text-gray-300"}`}>
            <ImageIcon className="w-3 h-3 inline mr-1" /> Image
          </button>
        )}
        <button onClick={() => setTab("code")} className={`flex-1 py-2 text-[11px] font-medium transition-colors ${tab === "code" ? "text-orange-400 border-b-2 border-orange-400" : "text-gray-500 hover:text-gray-300"}`}>
          <Code className="w-3 h-3 inline mr-1" /> Code
        </button>
      </div>

      <div className="p-3 space-y-3 overflow-y-auto flex-1">
        {tab === "content" && !isImg && (
          <>
            <label className="block">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">Text Content</span>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                className="w-full mt-1 bg-[#1e1e1e] border border-[#3c3c3c] rounded px-2 py-1.5 text-xs text-gray-300 resize-none focus:outline-none focus:border-orange-500/50"
              />
            </label>
            <button onClick={applyText} className="w-full py-1.5 bg-orange-500/20 text-orange-400 rounded text-[11px] font-medium hover:bg-orange-500/30 transition-colors">
              Apply Text
            </button>
          </>
        )}

        {tab === "image" && isImg && (
          <>
            <label className="block">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">Image URL</span>
              <input
                value={src}
                onChange={(e) => setSrc(e.target.value)}
                className="w-full mt-1 bg-[#1e1e1e] border border-[#3c3c3c] rounded px-2 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-orange-500/50"
              />
            </label>
            <label className="block">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">Alt Text</span>
              <input
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                className="w-full mt-1 bg-[#1e1e1e] border border-[#3c3c3c] rounded px-2 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-orange-500/50"
              />
            </label>
            <button onClick={applySrc} className="w-full py-1.5 bg-orange-500/20 text-orange-400 rounded text-[11px] font-medium hover:bg-orange-500/30 transition-colors">
              Apply
            </button>
            {src && (
              <img src={src} alt={alt} className="max-w-full h-24 object-cover rounded border border-[#3c3c3c]" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            )}
          </>
        )}

        {tab === "code" && (
          <>
            <label className="block">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">Raw HTML</span>
              <textarea
                value={rawHtml}
                onChange={(e) => setRawHtml(e.target.value)}
                rows={8}
                className="w-full mt-1 bg-[#1e1e1e] border border-[#3c3c3c] rounded px-2 py-1.5 text-[10px] text-gray-300 font-mono resize-none focus:outline-none focus:border-orange-500/50"
              />
            </label>
            <button onClick={applyHtml} className="w-full py-1.5 bg-orange-500/20 text-orange-400 rounded text-[11px] font-medium hover:bg-orange-500/30 transition-colors">
              Apply HTML
            </button>
          </>
        )}
      </div>
    </div>
  );
}
