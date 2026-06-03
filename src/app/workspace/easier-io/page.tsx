"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast, Toaster } from "sonner";
import Link from "next/link";
import { ArrowLeft, Download, Save, Share2, ZoomIn, ZoomOut, RotateCcw, Trash2, PanelRightOpen, PanelRightClose, Layers, Type, Square, Circle, Diamond, ArrowRight, Minus, MousePointer2, Pencil, Image } from "lucide-react";
import dynamic from "next/dynamic";

const ExcalidrawWrapper = dynamic(
  () => import("./_components/DiagramCanvas"),
  { ssr: false }
);

import type { ExcalidrawElement } from "./_components/DiagramCanvas";

type Diagram = {
  projectId: string;
  name: string;
  elements: any;
  appState: any;
};

export default function EasierIOPage() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();

  const [projectId] = useState(() => uuidv4());
  const [diagramName, setDiagramName] = useState("Untitled Diagram");
  const [elements, setElements] = useState<readonly ExcalidrawElement[]>([]);
  const [appState, setAppState] = useState<any>(null);
  const [selectedElementIds, setSelectedElementIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [propertiesOpen, setPropertiesOpen] = useState(false);
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const [diagrams, setDiagrams] = useState<any[]>([]);
  const [showDiagrams, setShowDiagrams] = useState(false);
  const loadedRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (isLoaded && !userId) router.push("/");
  }, [isLoaded, userId, router]);

  useEffect(() => {
    if (!userId || loadedRef.current) return;
    loadedRef.current = true;
    loadDiagrams();
  }, [userId]);

  const loadDiagrams = async () => {
    try {
      const res = await fetch("/api/easier-io");
      if (res.ok) {
        const data = await res.json();
        setDiagrams(data);
      }
    } catch (err) {
      console.error("Failed to load diagrams", err);
    }
  };

  const saveDiagram = useCallback(async () => {
    if (!elements.length) return;
    setSaving(true);
    try {
      const res = await fetch("/api/easier-io", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          name: diagramName,
          elements: JSON.parse(JSON.stringify(elements)),
          appState: appState ? JSON.parse(JSON.stringify(appState)) : null,
        }),
      });
      if (res.ok) {
        toast.success("Diagram saved!");
        loadDiagrams();
      }
    } catch (err) {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }, [projectId, diagramName, elements, appState]);

  useEffect(() => {
    if (elements.length > 0) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(saveDiagram, 3000);
    }
    return () => clearTimeout(saveTimerRef.current);
  }, [elements, saveDiagram]);

  const loadDiagram = async (id: string) => {
    try {
      const res = await fetch(`/api/easier-io/${id}`);
      if (res.ok) {
        const data = await res.json();
        setDiagramName(data.name);
        if (excalidrawAPI && data.elements) {
          excalidrawAPI.updateScene({
            elements: data.elements,
            appState: data.appState || {},
          });
        }
        setShowDiagrams(false);
        toast.success("Diagram loaded!");
      }
    } catch (err) {
      toast.error("Failed to load diagram");
    }
  };

  const deleteDiagram = async (id: string) => {
    try {
      const res = await fetch(`/api/easier-io/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Diagram deleted");
        loadDiagrams();
      }
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const handleExport = () => {
    if (!excalidrawAPI) return;
    try {
      const { exportToCanvas, exportToSvg } = require("@excalidraw/excalidraw");
      const svg = exportToSvg({
        elements: elements as any,
        appState: { exportBackground: false, viewBackgroundColor: "#ffffff" },
        files: null,
      });
      const blob = new Blob([svg.outerHTML], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${diagramName.replace(/\s+/g, "-").toLowerCase()}.svg`;
      a.click();
      toast.success("Exported as SVG");
    } catch (err) {
      toast.error("Export failed");
    }
  };

  const handleZoomIn = () => excalidrawAPI?.zoomIn();
  const handleZoomOut = () => excalidrawAPI?.zoomOut();
  const handleZoomReset = () => excalidrawAPI?.resetScene();

  const handleNewDiagram = () => {
    if (excalidrawAPI) {
      excalidrawAPI.updateScene({ elements: [], appState: {} });
    }
    setElements([]);
    setDiagramName("Untitled Diagram");
  };

  const handleChange = (els: readonly ExcalidrawElement[], state: any) => {
    setElements(els);
    setAppState(state);
  };

  const handlePointerUpdate = (payload: { pointer: any; button: any; pointersMap: any }) => {
    const selected = excalidrawAPI?.getAppState()?.selectedElementIds;
    if (selected) {
      setSelectedElementIds(new Set(Object.keys(selected).filter((k) => selected[k])));
    }
  };

  if (!isLoaded || !userId) return null;

  const selectedCount = selectedElementIds.size;

  return (
    <div className="h-full w-full flex flex-col bg-[#1e1e1e]">
      <Toaster position="top-center" />
      {/* Top Bar */}
      <div className="h-11 bg-[#2b2b2b] border-b border-[#3c3c3c] flex items-center justify-between px-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/workspace" className="text-gray-500 hover:text-gray-300 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-violet-500 to-cyan-400 rounded flex items-center justify-center">
              <Layers className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-200">easier.io</span>
            <span className="text-gray-600 mx-1">/</span>
            <input
              value={diagramName}
              onChange={(e) => setDiagramName(e.target.value)}
              className="bg-transparent text-xs text-gray-400 border-b border-transparent hover:border-gray-600 focus:border-orange-400 focus:outline-none px-1 py-0.5 w-40"
            />
          </div>
        </div>

        <div className="flex items-center gap-1">
          <div className="flex items-center bg-[#3c3c3c] rounded-md overflow-hidden">
            <button onClick={handleZoomOut} className="p-1.5 text-gray-400 hover:text-white hover:bg-[#4a4a4a] transition-colors" title="Zoom out">
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-[11px] text-gray-400 font-mono select-none">
              {Math.round((appState?.zoom?.value || 1) * 100)}%
            </span>
            <button onClick={handleZoomIn} className="p-1.5 text-gray-400 hover:text-white hover:bg-[#4a4a4a] transition-colors" title="Zoom in">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
          <button onClick={handleZoomReset} className="p-1.5 text-gray-500 hover:text-white hover:bg-[#3c3c3c] rounded-md transition-colors" title="Reset zoom">
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-5 bg-[#3c3c3c] mx-2" />
          <button onClick={handleExport} className="flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-md text-gray-400 hover:text-white hover:bg-[#3c3c3c] transition-colors">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
          <button
            onClick={saveDiagram}
            disabled={saving}
            className="flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-md bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-colors disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" /> {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Floating vertical toolbar - dedicated flex child */}
        <div className="w-[48px] flex-shrink-0 bg-[#2b2b2b] border-r border-[#3c3c3c] flex items-start justify-center py-5">
          <div className="flex flex-col items-center gap-1">
            <ToolButton icon={<MousePointer2 className="w-4 h-4" />} label="Select" active={false} onClick={() => excalidrawAPI?.setActiveTool({ type: "selection" })} />
            <ToolButton icon={<Square className="w-4 h-4" />} label="Rectangle" onClick={() => excalidrawAPI?.setActiveTool({ type: "rectangle" })} />
            <ToolButton icon={<Circle className="w-4 h-4" />} label="Ellipse" onClick={() => excalidrawAPI?.setActiveTool({ type: "ellipse" })} />
            <ToolButton icon={<Diamond className="w-4 h-4" />} label="Diamond" onClick={() => excalidrawAPI?.setActiveTool({ type: "diamond" })} />
            <ToolButton icon={<ArrowRight className="w-4 h-4" />} label="Arrow" onClick={() => excalidrawAPI?.setActiveTool({ type: "arrow" })} />
            <ToolButton icon={<Minus className="w-4 h-4" />} label="Line" onClick={() => excalidrawAPI?.setActiveTool({ type: "line" })} />
            <ToolButton icon={<Type className="w-4 h-4" />} label="Text" onClick={() => excalidrawAPI?.setActiveTool({ type: "text" })} />
            <ToolButton icon={<Pencil className="w-4 h-4" />} label="Draw" onClick={() => excalidrawAPI?.setActiveTool({ type: "freedraw" })} />
            <div className="w-full h-px bg-[#3c3c3c] my-1" />
            <ToolButton icon={<Image className="w-4 h-4" />} label="Image" onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = "image/*";
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file && excalidrawAPI) {
                  const reader = new FileReader();
                  reader.onload = () => excalidrawAPI?.addFiles([{ id: uuidv4(), mimeType: file.type, dataURL: reader.result }]);
                  reader.readAsDataURL(file);
                }
              };
              input.click();
            }} />
          </div>
        </div>

        {/* Canvas area - shrinks when panel is open */}
        <div className="flex-1 relative overflow-hidden bg-[#1a1a1a] min-w-0">
          <ExcalidrawWrapper
            excalidrawAPI={setExcalidrawAPI}
            onChange={handleChange}
            onPointerUpdate={handlePointerUpdate}
          />

          {/* Properties toggle button */}
          {selectedCount > 0 && !propertiesOpen && (
            <button
              onClick={() => setPropertiesOpen(true)}
              className="absolute right-3 top-3 z-10 p-2 bg-[#2b2b2b] border border-[#3c3c3c] rounded-lg text-gray-400 hover:text-white hover:bg-[#3c3c3c] transition-colors shadow-lg"
              title="Open properties"
            >
              <PanelRightOpen className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Properties Panel - in flex flow, pushes canvas */}
        {selectedCount > 0 && propertiesOpen && (
          <div className="w-[360px] min-w-[320px] flex-shrink-0 bg-[#252526] border-l border-[#3c3c3c] shadow-2xl flex flex-col overflow-hidden">
            <div className="h-10 border-b border-[#3c3c3c] flex items-center justify-between px-4 flex-shrink-0">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">Properties</span>
              <button onClick={() => setPropertiesOpen(false)} className="text-gray-500 hover:text-white p-1 rounded hover:bg-[#3c3c3c] transition-colors">
                <PanelRightClose className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex-1 px-4 py-3 space-y-4 overflow-y-auto overflow-x-hidden">
              <div className="text-xs text-gray-500 font-medium">{selectedCount} element{selectedCount > 1 ? 's' : ''} selected</div>
              <div className="space-y-4">
                <label className="block w-full">
                  <span className="text-[10px] text-gray-600 uppercase tracking-wider">Stroke Color</span>
                  <div className="flex gap-1.5 mt-1.5 flex-wrap">
                    {["#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff", "#ff8800", "#8800ff"].map((c) => (
                      <button
                        key={c}
                        onClick={() => excalidrawAPI?.updateScene({ appState: { currentItemStrokeColor: c } })}
                        className="w-[18px] h-[18px] rounded border border-[#3c3c3c] hover:scale-110 transition-transform shrink-0"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </label>
                <label className="block w-full">
                  <span className="text-[10px] text-gray-600 uppercase tracking-wider">Background Color</span>
                  <div className="flex gap-1.5 mt-1.5 flex-wrap">
                    {["transparent", "#ffffff", "#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff", "#ff8800", "#8800ff", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"].map((c) => (
                      <button
                        key={c}
                        onClick={() => excalidrawAPI?.updateScene({ appState: { currentItemBackgroundColor: c } })}
                        className="w-[18px] h-[18px] rounded border border-[#3c3c3c] hover:scale-110 transition-transform shrink-0"
                        style={{ backgroundColor: c === "transparent" ? "transparent" : c, border: c === "#ffffff" ? "1px solid #666" : undefined }}
                      />
                    ))}
                  </div>
                </label>
                <label className="block w-full">
                  <span className="text-[10px] text-gray-600 uppercase tracking-wider">Stroke Width</span>
                  <select
                    onChange={(e) => excalidrawAPI?.updateScene({ appState: { currentItemStrokeWidth: parseInt(e.target.value) } })}
                    className="w-full mt-1.5 bg-[#1e1e1e] border border-[#3c3c3c] rounded px-2.5 py-2 text-xs text-gray-300 focus:outline-none focus:border-orange-500/50"
                  >
                    <option value={1}>Thin</option>
                    <option value={2}>Regular</option>
                    <option value={4}>Bold</option>
                    <option value={6}>Extra Bold</option>
                  </select>
                </label>
                <label className="block w-full">
                  <span className="text-[10px] text-gray-600 uppercase tracking-wider">Opacity</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    defaultValue={100}
                    onChange={(e) => excalidrawAPI?.updateScene({ appState: { currentItemOpacity: parseInt(e.target.value) / 100 } })}
                    className="w-full mt-1.5 accent-orange-500"
                  />
                </label>
                <label className="block w-full">
                  <span className="text-[10px] text-gray-600 uppercase tracking-wider">Border Style</span>
                  <select
                    onChange={(e) => excalidrawAPI?.updateScene({ appState: { currentItemStrokeStyle: e.target.value } })}
                    className="w-full mt-1.5 bg-[#1e1e1e] border border-[#3c3c3c] rounded px-2.5 py-2 text-xs text-gray-300 focus:outline-none focus:border-orange-500/50"
                  >
                    <option value="solid">Solid</option>
                    <option value="dashed">Dashed</option>
                    <option value="dotted">Dotted</option>
                  </select>
                </label>
              </div>
              <button
                onClick={() => {
                  if (excalidrawAPI) {
                    const toDelete = Array.from(selectedElementIds);
                    excalidrawAPI.deleteSelectedElements();
                    setSelectedElementIds(new Set());
                  }
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2 bg-red-500/10 text-red-400 rounded text-[11px] font-medium hover:bg-red-500/20 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Selected
              </button>
            </div>
          </div>
        )}

        {/* Diagrams list panel */}
        {showDiagrams && (
          <div className="absolute inset-0 z-30 bg-black/50 flex items-center justify-center">
            <div className="w-[480px] max-h-[70vh] bg-[#252526] border border-[#3c3c3c] rounded-xl shadow-2xl flex flex-col overflow-hidden">
              <div className="h-11 border-b border-[#3c3c3c] flex items-center justify-between px-4">
                <span className="text-sm font-semibold text-gray-200">Your Diagrams</span>
                <button onClick={() => setShowDiagrams(false)} className="text-gray-500 hover:text-white transition-colors">
                  <span className="text-lg">&times;</span>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {diagrams.length === 0 ? (
                  <p className="text-gray-500 text-xs text-center py-8">No saved diagrams yet</p>
                ) : (
                  diagrams.map((d: any) => (
                    <div key={d.projectId} className="flex items-center justify-between p-3 rounded-lg bg-[#1e1e1e] border border-[#333] hover:border-orange-500/30 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-violet-500/20 to-cyan-400/20 rounded flex items-center justify-center">
                          <Layers className="w-4 h-4 text-violet-400" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-300">{d.name}</p>
                          <p className="text-[10px] text-gray-600">{new Date(d.updatedAt || d.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => loadDiagram(d.projectId)} className="px-2.5 py-1 text-[10px] bg-orange-500/20 text-orange-400 rounded hover:bg-orange-500/30 transition-colors">Open</button>
                        <button onClick={() => deleteDiagram(d.projectId)} className="p-1 text-gray-500 hover:text-red-400 transition-colors">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom status bar */}
      <div className="h-6 bg-[#2b2b2b] border-t border-[#3c3c3c] flex items-center justify-between px-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => setShowDiagrams(true)} className="text-[10px] text-gray-500 hover:text-gray-300 transition-colors">My Diagrams</button>
          <button onClick={handleNewDiagram} className="text-[10px] text-gray-500 hover:text-gray-300 transition-colors">New Diagram</button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-gray-600">{elements.length} elements</span>
          <button
            onClick={() => setPropertiesOpen((v) => !v)}
            className={`text-[10px] transition-colors ${propertiesOpen ? 'text-orange-400' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Properties {propertiesOpen ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ToolButton({ icon, label, onClick, active }: { icon: React.ReactNode; label: string; onClick?: () => void; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`p-1.5 rounded-md transition-colors ${active ? 'bg-orange-500/20 text-orange-400' : 'text-gray-500 hover:text-white hover:bg-[#3c3c3c]'}`}
      title={label}
    >
      {icon}
    </button>
  );
}
