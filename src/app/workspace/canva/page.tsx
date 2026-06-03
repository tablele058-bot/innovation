"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast, Toaster } from "sonner";
import { Trash2, Square as SquareIcon } from "lucide-react";
import dynamic from "next/dynamic";

import TopBar from "./_components/TopBar";
import LeftSidebar from "./_components/LeftSidebar";
import RightSidebar from "./_components/RightSidebar";
import TemplatesPanel from "./_components/TemplatesPanel";
import ElementsPanel from "./_components/ElementsPanel";
import ImagePanel from "./_components/ImagePanel";
import ExportDialog from "./_components/ExportDialog";
import UnsplashPanel from "./_components/UnsplashPanel";
import BrandKitPanel from "./_components/BrandKitPanel";
import PresentationView from "./_components/PresentationView";
import { DESIGN_PRESETS } from "./_lib/constants";
import type { DesignCanvasHandle } from "./_components/DesignCanvas";

const DesignCanvas = dynamic(
  () => import("./_components/DesignCanvas"),
  { ssr: false }
);

interface Layer {
  id: string;
  name: string;
  locked: boolean;
  visible: boolean;
  type: string;
}

interface PageEntry {
  id: string;
  name: string;
  thumbnail?: string;
}

export default function CanvaPage() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  const canvasRef = useRef<DesignCanvasHandle>(null);

  const [projectId] = useState(() => uuidv4());
  const [designName, setDesignName] = useState("Untitled Design");
  const [saving, setSaving] = useState(false);
  const [propertiesOpen, setPropertiesOpen] = useState(true);
  const [designs, setDesigns] = useState<any[]>([]);
  const [showDesigns, setShowDesigns] = useState(false);
  const loadedRef = useRef(false);

  const [activeTool, setActiveTool] = useState("select");

  const [fillColor, setFillColor] = useState("#3b82f6");
  const [strokeColor, setStrokeColor] = useState("#1e1e1e");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [opacity, setOpacity] = useState(1);
  const [fontSize, setFontSize] = useState(28);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontWeight, setFontWeight] = useState<number | string>(400);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [lineHeight, setLineHeight] = useState(1.2);
  const [zoom, setZoom] = useState(100);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const [activeSidebarTab, setActiveSidebarTab] = useState("properties");

  const [templatesPanelOpen, setTemplatesPanelOpen] = useState(false);
  const [elementsPanelOpen, setElementsPanelOpen] = useState(false);
  const [unsplashPanelOpen, setUnsplashPanelOpen] = useState(false);
  const [brandKitPanelOpen, setBrandKitPanelOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [imagePanelOpen, setImagePanelOpen] = useState(false);
  const [presentationMode, setPresentationMode] = useState(false);

  const [pages, setPages] = useState<PageEntry[]>([{ id: uuidv4(), name: "Page 1" }]);
  const [currentPage, setCurrentPage] = useState(0);

  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

  const [brightness, setBrightness] = useState(50);
  const [contrast, setContrast] = useState(50);
  const [saturation, setSaturation] = useState(50);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  useEffect(() => {
    if (isLoaded && !userId) router.push("/");
  }, [isLoaded, userId, router]);

  useEffect(() => {
    if (!userId || loadedRef.current) return;
    loadedRef.current = true;
    loadDesigns();
  }, [userId]);

  const loadDesigns = async () => {
    try {
      const res = await fetch("/api/canva");
      if (res.ok) {
        const data = await res.json();
        setDesigns(data);
      }
    } catch (err) {
      console.error("Failed to load designs", err);
    }
  };

  const saveDesign = useCallback(async () => {
    if (!canvasRef.current) return;
    setSaving(true);
    try {
      canvasRef.current.saveCurrentPage();
      const allPages = canvasRef.current.getPageStates();
      const json = JSON.stringify(allPages);
      const res = await fetch("/api/canva", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, name: designName, canvasJson: json }),
      });
      if (res.ok) {
        toast.success("Design saved!");
        loadDesigns();
      }
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }, [projectId, designName]);

  const loadDesign = async (id: string) => {
    try {
      const res = await fetch(`/api/canva/${id}`);
      if (res.ok) {
        const data = await res.json();
        setDesignName(data.name);
        if (canvasRef.current && data.canvasJson) {
          const parsed = typeof data.canvasJson === "string" ? JSON.parse(data.canvasJson) : data.canvasJson;
          const pageStates = Array.isArray(parsed) ? parsed : [JSON.stringify(parsed)];
          canvasRef.current.setPageStates(pageStates);
          setPages(pageStates.map((_: any, i: number) => ({ id: uuidv4(), name: `Page ${i + 1}` })));
          setCurrentPage(0);
        }
        setShowDesigns(false);
        toast.success("Design loaded!");
      }
    } catch {
      toast.error("Failed to load design");
    }
  };

  const deleteDesign = async (id: string) => {
    try {
      const res = await fetch(`/api/canva/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Design deleted");
        loadDesigns();
      }
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleExport = (format: string, quality: number, transparent: boolean, multiPage: boolean) => {
    if (!canvasRef.current) return;
    if (multiPage) {
      const count = canvasRef.current.getPageCount();
      canvasRef.current.saveCurrentPage();
      for (let i = 0; i < count; i++) {
        canvasRef.current.loadPage(i);
        setTimeout(() => {
          const dataUrl = canvasRef.current!.exportToDataURL(format, quality / 100);
          const link = document.createElement("a");
          link.download = `${designName.replace(/\s+/g, "-").toLowerCase()}-page-${i + 1}.${format === "jpg" ? "jpg" : "png"}`;
          link.href = dataUrl;
          link.click();
        }, i * 100);
      }
      setTimeout(() => {
        canvasRef.current?.loadPage(0);
        toast.success("Pages exported!");
      }, count * 100 + 100);
    } else {
      const dataUrl = canvasRef.current.exportToDataURL(format, quality / 100);
      const link = document.createElement("a");
      link.download = `${designName.replace(/\s+/g, "-").toLowerCase()}.${format === "jpg" ? "jpg" : "png"}`;
      link.href = dataUrl;
      link.click();
      toast.success("Exported successfully!");
    }
    setExportDialogOpen(false);
  };

  const handleNewDesign = () => {
    if (canvasRef.current) {
      canvasRef.current.clearCanvas();
      canvasRef.current.setPageStates([""]);
    }
    setPages([{ id: uuidv4(), name: "Page 1" }]);
    setCurrentPage(0);
    setDesignName("Untitled Design");
  };

  const handleToolSelect = (tool: string) => {
    setActiveTool(tool);
    if (!canvasRef.current) return;
    switch (tool) {
      case "select":
        break;
      case "text":
        addTextToCanvas("body");
        break;
      case "image":
        canvasRef.current.handleImageUpload();
        break;
      case "video":
        toast.info("Video upload coming soon");
        break;
      default:
        canvasRef.current.addShape(tool);
    }
  };

  const addTextToCanvas = (type: string) => {
    canvasRef.current?.addText(type);
  };

  const handleLeftAction = (action: string) => {
    switch (action) {
      case "templates":
        setTemplatesPanelOpen((v) => !v);
        setElementsPanelOpen(false);
        setUnsplashPanelOpen(false);
        setBrandKitPanelOpen(false);
        break;
      case "elements":
        setElementsPanelOpen((v) => !v);
        setTemplatesPanelOpen(false);
        setUnsplashPanelOpen(false);
        setBrandKitPanelOpen(false);
        break;
      case "uploads":
        canvasRef.current?.handleImageUpload();
        break;
      case "brand-kit":
        setBrandKitPanelOpen((v) => !v);
        setTemplatesPanelOpen(false);
        setElementsPanelOpen(false);
        setUnsplashPanelOpen(false);
        break;
      case "unsplash":
        setUnsplashPanelOpen((v) => !v);
        setTemplatesPanelOpen(false);
        setElementsPanelOpen(false);
        setBrandKitPanelOpen(false);
        break;
    }
  };

  const handleSelectTemplate = (template: any) => {
    const preset = DESIGN_PRESETS[template.preset as keyof typeof DESIGN_PRESETS];
    if (preset && canvasRef.current) {
      canvasRef.current.setCanvasSize(preset.width, preset.height);
    }
    setDesignName(template.name);
    setTemplatesPanelOpen(false);
    toast.success(`Template "${template.name}" applied!`);
  };

  const handleAddElement = (type: string) => {
    canvasRef.current?.addShape(type);
  };

  const handleAddImageFromUrl = (url: string) => {
    canvasRef.current?.addImageFromUrl(url);
  };

  const updateLayersFromCanvas = useCallback(() => {
    const canvasEl = document.querySelector("#design-canvas") as HTMLCanvasElement;
    if (!canvasEl) { setLayers([]); return; }
    try {
      const json = JSON.parse(
        (canvasEl as any).__fabricCanvas
          ? JSON.stringify((canvasEl as any).__fabricCanvas.toJSON())
          : "{}"
      );
      const objs = json.objects || [];
      const newLayers: Layer[] = objs.map((obj: any, i: number) => ({
        id: `layer_${i}`,
        name: obj.type === "i-text" ? ((obj.text as string)?.slice(0, 20) || "Text") : obj.type.charAt(0).toUpperCase() + obj.type.slice(1),
        locked: !!obj.lockMovementX,
        visible: obj.visible !== false,
        type: obj.type,
      }));
      setLayers(newLayers.reverse());
    } catch {
      setLayers([]);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(updateLayersFromCanvas, 2000);
    return () => clearInterval(interval);
  }, [updateLayersFromCanvas]);

  const handleAddPage = () => {
    canvasRef.current?.addPage();
    const newPages = [...pages, { id: uuidv4(), name: `Page ${pages.length + 1}` }];
    setPages(newPages);
    setCurrentPage(newPages.length - 1);
  };

  const handleDeletePage = (index: number) => {
    if (pages.length <= 1) return;
    canvasRef.current?.deletePage(index);
    const newPages = pages.filter((_, i) => i !== index);
    setPages(newPages);
    if (currentPage >= newPages.length) {
      setCurrentPage(newPages.length - 1);
    }
  };

  const handleDuplicatePage = (index: number) => {
    canvasRef.current?.duplicatePage(index);
    const newPage: PageEntry = { id: uuidv4(), name: `Page ${pages.length + 1}` };
    const newPages = [...pages];
    newPages.splice(index + 1, 0, newPage);
    setPages(newPages);
    setCurrentPage(index + 1);
  };

  const handleSelectPage = (index: number) => {
    canvasRef.current?.loadPage(index);
    setCurrentPage(index);
  };

  const handleToggleLock = (id: string) => {
    const canvas = (document.querySelector("#design-canvas") as any)?._canvas;
    if (!canvas) return;
    const objs = canvas.getObjects();
    const obj = [...objs].reverse().find((o: any) => (o.__uniqueId || `obj_${objs.indexOf(o)}`) === id);
    if (obj) {
      obj.set("lockMovementX", !obj.lockMovementX);
      obj.set("lockMovementY", !obj.lockMovementY);
      obj.set("lockRotation", !obj.lockRotation);
      obj.set("lockScalingX", !obj.lockScalingX);
      obj.set("lockScalingY", !obj.lockScalingY);
      canvas.renderAll();
      updateLayersFromCanvas();
    }
  };

  const handleToggleVisibility = (id: string) => {
    const canvas = (document.querySelector("#design-canvas") as any)?._canvas;
    if (!canvas) return;
    const objs = canvas.getObjects();
    const obj = [...objs].reverse().find((o: any) => (o.__uniqueId || `obj_${objs.indexOf(o)}`) === id);
    if (obj) {
      obj.set("visible", !obj.visible);
      canvas.renderAll();
      updateLayersFromCanvas();
    }
  };

  const handleDeleteLayer = (id: string) => {
    const canvas = (document.querySelector("#design-canvas") as any)?._canvas;
    if (!canvas) return;
    const objs = canvas.getObjects();
    const obj = [...objs].reverse().find((o: any) => (o.__uniqueId || `obj_${objs.indexOf(o)}`) === id);
    if (obj) {
      canvas.remove(obj);
      canvas.renderAll();
      updateLayersFromCanvas();
    }
  };

  const handleSelectLayer = (id: string) => {
    setSelectedLayerId(id);
    const canvas = (document.querySelector("#design-canvas") as any)?._canvas;
    if (!canvas) return;
    const objs = canvas.getObjects();
    const obj = [...objs].reverse().find((o: any) => (o.__uniqueId || `obj_${objs.indexOf(o)}`) === id);
    if (obj) {
      canvas.setActiveObject(obj);
      canvas.renderAll();
    }
  };

  const handleApplyFilter = (filter: string) => {
    canvasRef.current?.applyFilterToActive(filter);
    setActiveFilters((prev) => prev.includes(filter) ? prev : [...prev, filter]);
  };

  const handleZoomChange = (newZoom: number) => {
    setZoom(newZoom);
  };

  const handleUndo = () => {
    canvasRef.current?.undo();
    setTimeout(() => {
      setCanUndo(canvasRef.current?.canUndo() || false);
      setCanRedo(canvasRef.current?.canRedo() || false);
    }, 50);
  };

  const handleRedo = () => {
    canvasRef.current?.redo();
    setTimeout(() => {
      setCanUndo(canvasRef.current?.canUndo() || false);
      setCanRedo(canvasRef.current?.canRedo() || false);
    }, 50);
  };

  const handleHistoryUpdate = useCallback(() => {
    setTimeout(() => {
      setCanUndo(canvasRef.current?.canUndo() || false);
      setCanRedo(canvasRef.current?.canRedo() || false);
    }, 50);
  }, []);

  const handleCanvasReady = useCallback((fabricCanvas: any) => {
    canvasRef.current?.setHistoryPush(handleHistoryUpdate);
  }, [handleHistoryUpdate]);

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.setHistoryPush(handleHistoryUpdate);
    }
  }, [handleHistoryUpdate]);

  if (!isLoaded || !userId) return null;

  const sidebarPanelOpen = templatesPanelOpen || elementsPanelOpen || unsplashPanelOpen || brandKitPanelOpen;
  const anyPanelOpen = propertiesOpen || sidebarPanelOpen || imagePanelOpen;

  return (
    <div className="h-full w-full flex flex-col bg-[#1e1e1e]">
      <Toaster position="top-center" />
      <TopBar
        designName={designName}
        onNameChange={setDesignName}
        onSave={saveDesign}
        saving={saving}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        onZoomIn={() => { canvasRef.current?.zoomIn(); setZoom((canvasRef.current?.getZoom() || 1) * 100); }}
        onZoomOut={() => { canvasRef.current?.zoomOut(); setZoom((canvasRef.current?.getZoom() || 1) * 100); }}
        zoom={zoom}
        onExport={() => setExportDialogOpen(true)}
        onPresentation={() => setPresentationMode(true)}
        onShowDesigns={() => setShowDesigns(true)}
        propertiesOpen={propertiesOpen}
        onToggleProperties={() => setPropertiesOpen((v) => !v)}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left vertical toolbar */}
        <LeftSidebar activeTool={activeTool} onToolSelect={handleToolSelect} onAction={handleLeftAction} />

        {/* Slide-out panels from left */}
        {templatesPanelOpen && (
          <TemplatesPanel open={templatesPanelOpen} onClose={() => setTemplatesPanelOpen(false)} onSelectTemplate={handleSelectTemplate} />
        )}
        {elementsPanelOpen && (
          <ElementsPanel open={elementsPanelOpen} onClose={() => setElementsPanelOpen(false)} onAddElement={handleAddElement} />
        )}
        {brandKitPanelOpen && (
          <BrandKitPanel open={brandKitPanelOpen} onClose={() => setBrandKitPanelOpen(false)} onSelectColor={(c) => { setFillColor(c); canvasRef.current?.updateFill(c); }} onSelectFont={(f) => { setFontFamily(f); canvasRef.current?.updateFontFamily(f); }} />
        )}
        {unsplashPanelOpen && (
          <UnsplashPanel open={unsplashPanelOpen} onClose={() => setUnsplashPanelOpen(false)} onAddImage={handleAddImageFromUrl} />
        )}

        {/* Canvas area */}
        <div className="flex-1 relative overflow-hidden min-w-0">
          <DesignCanvas ref={canvasRef} onReady={handleCanvasReady} />
        </div>

        {/* Image Panel (appears when editing an image) */}
        <ImagePanel
          open={imagePanelOpen}
          onClose={() => setImagePanelOpen(false)}
          onApplyFilter={handleApplyFilter}
          activeFilters={activeFilters}
          brightness={brightness}
          contrast={contrast}
          saturation={saturation}
          onBrightnessChange={(v) => setBrightness(v)}
          onContrastChange={(v) => setContrast(v)}
          onSaturationChange={(v) => setSaturation(v)}
        />

        {/* Right sidebar (Properties/Pages/Layers) */}
        {propertiesOpen && (
          <RightSidebar
            open={propertiesOpen}
            onClose={() => setPropertiesOpen(false)}
            activeTab={activeSidebarTab}
            setActiveTab={setActiveSidebarTab}
            pages={pages}
            currentPage={currentPage}
            onAddPage={handleAddPage}
            onDeletePage={handleDeletePage}
            onDuplicatePage={handleDuplicatePage}
            onReorderPages={(from, to) => {}}
            onSelectPage={handleSelectPage}
            layers={layers}
            onReorderLayers={(from, to) => {}}
            onToggleLock={handleToggleLock}
            onToggleVisibility={handleToggleVisibility}
            onDeleteLayer={handleDeleteLayer}
            onSelectLayer={handleSelectLayer}
            selectedLayerId={selectedLayerId}
            fillColor={fillColor}
            onFillChange={(c) => { setFillColor(c); canvasRef.current?.updateFill(c); }}
            strokeColor={strokeColor}
            onStrokeChange={(c) => { setStrokeColor(c); canvasRef.current?.updateStroke(c); }}
            strokeWidth={strokeWidth}
            onStrokeWidthChange={(w) => { setStrokeWidth(w); canvasRef.current?.updateStrokeWidth(w); }}
            opacity={opacity}
            onOpacityChange={(o) => { setOpacity(o); canvasRef.current?.updateOpacity(o); }}
            fontSize={fontSize}
            onFontSizeChange={(s) => { setFontSize(s); canvasRef.current?.updateFontSize(s); }}
            fontFamily={fontFamily}
            onFontFamilyChange={(f) => { setFontFamily(f); canvasRef.current?.updateFontFamily(f); }}
            fontWeight={fontWeight}
            onFontWeightChange={(w) => { setFontWeight(w); canvasRef.current?.updateFontWeight(w); }}
            letterSpacing={letterSpacing}
            onLetterSpacingChange={(s) => { setLetterSpacing(s); canvasRef.current?.updateLetterSpacing(s); }}
            lineHeight={lineHeight}
            onLineHeightChange={(h) => { setLineHeight(h); canvasRef.current?.updateLineHeight(h); }}
          />
        )}
      </div>

      {/* Bottom status bar */}
      <div className="h-6 bg-[#2b2b2b] border-t border-[#3c3c3c] flex items-center justify-between px-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => setShowDesigns(true)} className="text-[10px] text-gray-500 hover:text-gray-300 transition-colors">My Designs</button>
          <button onClick={handleNewDesign} className="text-[10px] text-gray-500 hover:text-gray-300 transition-colors">New Design</button>
          <span className="text-[10px] text-gray-600">|</span>
          <span className="text-[10px] text-gray-600">{canvasRef.current?.getPageCount() || 1} pages</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-gray-600">{Math.round(zoom)}%</span>
          <button
            onClick={() => setPropertiesOpen((v) => !v)}
            className={`text-[10px] transition-colors ${propertiesOpen ? "text-orange-400" : "text-gray-500 hover:text-gray-300"}`}
          >
            Properties
          </button>
        </div>
      </div>

      {/* Designs list modal */}
      {showDesigns && (
        <div className="absolute inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="w-[480px] max-h-[70vh] bg-[#252526] border border-[#3c3c3c] rounded-xl shadow-2xl flex flex-col overflow-hidden">
            <div className="h-11 border-b border-[#3c3c3c] flex items-center justify-between px-4">
              <span className="text-sm font-semibold text-gray-200">Your Designs</span>
              <button onClick={() => setShowDesigns(false)} className="text-gray-500 hover:text-white transition-colors text-lg leading-none">&times;</button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {designs.length === 0 ? (
                <p className="text-gray-500 text-xs text-center py-8">No saved designs yet</p>
              ) : (
                designs.map((d: any) => (
                  <div key={d.projectId} className="flex items-center justify-between p-3 rounded-lg bg-[#1e1e1e] border border-[#333] hover:border-orange-500/30 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-pink-500/20 to-purple-600/20 rounded flex items-center justify-center">
                        <SquareIcon className="w-4 h-4 text-pink-400" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-300">{d.name}</p>
                        <p className="text-[10px] text-gray-600">{new Date(d.updatedAt || d.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => loadDesign(d.projectId)} className="px-2.5 py-1 text-[10px] bg-orange-500/20 text-orange-400 rounded hover:bg-orange-500/30 transition-colors">Open</button>
                      <button onClick={() => deleteDesign(d.projectId)} className="p-1 text-gray-500 hover:text-red-400 transition-colors">
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

      {/* Export Dialog */}
      <ExportDialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)} onExport={handleExport} />

      {/* Presentation Mode */}
      {presentationMode && (
        <PresentationView pages={pages} currentPage={currentPage} onClose={() => setPresentationMode(false)} />
      )}
    </div>
  );
}
