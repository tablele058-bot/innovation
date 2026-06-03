"use client";

import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from "react";
import * as fabric from "fabric";
import { createShape, applyFilter as fabricApplyFilter } from "../_lib/fabricUtils";

interface DesignCanvasProps {
  onReady?: (canvas: fabric.Canvas) => void;
  pushHistory?: (state: string) => void;
}

export interface DesignCanvasHandle {
  getCanvasJSON: () => string;
  loadCanvasJSON: (json: string) => void;
  clearCanvas: () => void;
  addShape: (type: string) => void;
  handleImageUpload: () => void;
  deleteSelected: () => void;
  updateFill: (color: string) => void;
  updateStroke: (color: string) => void;
  updateStrokeWidth: (width: number) => void;
  updateOpacity: (opacity: number) => void;
  updateFontSize: (size: number) => void;
  updateFontFamily: (family: string) => void;
  updateFontWeight: (weight: string | number) => void;
  updateLetterSpacing: (spacing: number) => void;
  updateLineHeight: (height: number) => void;
  bringForward: () => void;
  sendBackward: () => void;
  alignObjects: (align: string) => void;
  duplicateSelected: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  setZoom: (zoom: number) => void;
  getZoom: () => number;
  getActiveObject: () => fabric.FabricObject | null;
  selectAll: () => void;
  groupSelected: () => void;
  ungroupSelected: () => void;
  setCanvasSize: (width: number, height: number) => void;
  exportToDataURL: (format?: string, quality?: number) => string;
  getPageCount: () => number;
  getPageStates: () => string[];
  setPageStates: (states: string[]) => void;
  saveCurrentPage: () => void;
  loadPage: (index: number) => void;
  addPage: () => void;
  deletePage: (index: number) => void;
  duplicatePage: (index: number) => void;
  reorderPages: (from: number, to: number) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  setHistoryPush: (fn: (state: string) => void) => void;
  addText: (type: string) => void;
  addImageFromUrl: (url: string) => void;
  applyFilterToActive: (filter: string) => void;
}

const DesignCanvas = forwardRef<DesignCanvasHandle, DesignCanvasProps>(function DesignCanvas({ onReady, pushHistory: externalPushHistory }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const pageStatesRef = useRef<string[]>([""]);
  const currentPageRef = useRef(0);
  const historyStackRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);
  const skipNextRef = useRef(false);
  const pushHistoryRef = useRef<((state: string) => void) | undefined>(externalPushHistory);

  const getCanvasJSON = useCallback((): string => {
    if (!fabricRef.current) return "";
    return JSON.stringify(fabricRef.current.toJSON());
  }, []);

  const saveCurrentPage = useCallback(() => {
    const json = getCanvasJSON();
    pageStatesRef.current[currentPageRef.current] = json;
  }, [getCanvasJSON]);

  const pushToHistory = useCallback((state: string) => {
    if (skipNextRef.current) {
      skipNextRef.current = false;
      return;
    }
    historyStackRef.current = historyStackRef.current.slice(0, historyIndexRef.current + 1);
    historyStackRef.current.push(state);
    if (historyStackRef.current.length > 50) historyStackRef.current.shift();
    historyIndexRef.current = Math.min(historyIndexRef.current + 1, 49);
    if (pushHistoryRef.current) pushHistoryRef.current(state);
  }, []);

  const internalPushState = useCallback(() => {
    const json = getCanvasJSON();
    pageStatesRef.current[currentPageRef.current] = json;
    pushToHistory(json);
  }, [getCanvasJSON, pushToHistory]);

  useEffect(() => {
    if (!canvasRef.current || fabricRef.current) return;
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: "#ffffff",
      preserveObjectStacking: true,
      stopContextMenu: true,
    });
    fabricRef.current = canvas;

    const handleMod = () => {
      saveCurrentPage();
      const json = getCanvasJSON();
      pushToHistory(json);
    };

    canvas.on("object:modified", handleMod);
    canvas.on("object:added", handleMod);
    canvas.on("object:removed", handleMod);

    const initialJson = JSON.stringify(canvas.toJSON());
    historyStackRef.current = [initialJson];
    historyIndexRef.current = 0;
    pageStatesRef.current[0] = initialJson;

    if (onReady) onReady(canvas);

    return () => {
      canvas.off("object:modified", handleMod);
      canvas.off("object:added", handleMod);
      canvas.off("object:removed", handleMod);
      canvas.dispose();
      fabricRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadCanvasJSON = useCallback((json: string) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    try {
      const parsed = JSON.parse(json);
      canvas.loadFromJSON(parsed).then(() => {
        canvas.renderAll();
        pageStatesRef.current[currentPageRef.current] = json;
        const stateJson = JSON.stringify(canvas.toJSON());
        historyStackRef.current = [stateJson];
        historyIndexRef.current = 0;
      });
    } catch (e) {
      console.error("Failed to load canvas JSON", e);
    }
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.clear();
    canvas.backgroundColor = "#ffffff";
    canvas.renderAll();
    internalPushState();
  }, [internalPushState]);

  const addShape = useCallback((type: string) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const obj = createShape(type);
    if (obj) {
      canvas.add(obj);
      canvas.setActiveObject(obj);
      canvas.renderAll();
      internalPushState();
    }
  }, [internalPushState]);

  const handleImageUpload = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !fabricRef.current) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const imgUrl = ev.target?.result as string;
        fabric.Image.fromURL(imgUrl, { crossOrigin: "anonymous" }).then((img) => {
          img.set({
            left: 100 + Math.random() * 200,
            top: 100 + Math.random() * 200,
            scaleX: 0.3,
            scaleY: 0.3,
          });
          fabricRef.current?.add(img);
          fabricRef.current?.setActiveObject(img);
          fabricRef.current?.renderAll();
          internalPushState();
        });
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }, [internalPushState]);

  const deleteSelected = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active) {
      if (active.type === "activeSelection") {
        const sel = active as fabric.ActiveSelection;
        sel.forEachObject((obj) => canvas.remove(obj));
      } else {
        canvas.remove(active);
      }
      canvas.discardActiveObject();
      canvas.renderAll();
      internalPushState();
    }
  }, [internalPushState]);

  const updateFill = useCallback((color: string) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active) {
      if (active.type === "activeSelection") {
        (active as fabric.ActiveSelection).forEachObject((obj) => {
          obj.set("fill", color);
        });
      } else {
        active.set("fill", color);
      }
      active.setCoords();
      canvas.renderAll();
      internalPushState();
    }
  }, [internalPushState]);

  const updateStroke = useCallback((color: string) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active) {
      if (active.type === "activeSelection") {
        (active as fabric.ActiveSelection).forEachObject((obj) => {
          obj.set("stroke", color);
        });
      } else {
        active.set("stroke", color);
      }
      active.setCoords();
      canvas.renderAll();
      internalPushState();
    }
  }, [internalPushState]);

  const updateStrokeWidth = useCallback((width: number) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active) {
      if (active.type === "activeSelection") {
        (active as fabric.ActiveSelection).forEachObject((obj) => {
          obj.set("strokeWidth", width);
        });
      } else {
        active.set("strokeWidth", width);
      }
      active.setCoords();
      canvas.renderAll();
      internalPushState();
    }
  }, [internalPushState]);

  const updateOpacity = useCallback((opacity: number) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active) {
      if (active.type === "activeSelection") {
        (active as fabric.ActiveSelection).forEachObject((obj) => {
          obj.set("opacity", opacity);
        });
      } else {
        active.set("opacity", opacity);
      }
      canvas.renderAll();
      internalPushState();
    }
  }, [internalPushState]);

  const updateFontSize = useCallback((size: number) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active && active instanceof fabric.IText) {
      active.set("fontSize", size);
      active.setCoords();
      canvas.renderAll();
      internalPushState();
    }
  }, [internalPushState]);

  const updateFontFamily = useCallback((family: string) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active && active instanceof fabric.IText) {
      active.set("fontFamily", family);
      active.setCoords();
      canvas.renderAll();
      internalPushState();
    }
  }, [internalPushState]);

  const updateFontWeight = useCallback((weight: string | number) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active && active instanceof fabric.IText) {
      active.set("fontWeight", weight);
      active.setCoords();
      canvas.renderAll();
      internalPushState();
    }
  }, [internalPushState]);

  const updateLetterSpacing = useCallback((spacing: number) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active && active instanceof fabric.IText) {
      active.set("charSpacing", spacing);
      active.setCoords();
      canvas.renderAll();
      internalPushState();
    }
  }, [internalPushState]);

  const updateLineHeight = useCallback((height: number) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active && active instanceof fabric.IText) {
      active.set("lineHeight", height);
      active.setCoords();
      canvas.renderAll();
      internalPushState();
    }
  }, [internalPushState]);

  const bringForward = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active) {
      canvas.bringObjectForward(active);
      canvas.renderAll();
      internalPushState();
    }
  }, [internalPushState]);

  const sendBackward = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active) {
      canvas.sendObjectBackwards(active);
      canvas.renderAll();
      internalPushState();
    }
  }, [internalPushState]);

  const alignObjects = useCallback((align: string) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject() as fabric.ActiveSelection;
    if (!active || active.type !== "activeSelection") return;
    const objects = active.getObjects();
    if (objects.length < 2) return;
    const bounds = active.getBoundingRect();
    objects.forEach((obj) => {
      const ow = obj.getScaledWidth?.() || 0;
      const oh = obj.getScaledHeight?.() || 0;
      switch (align) {
        case "left":
          obj.set("left", bounds.left);
          break;
        case "center":
          obj.set("left", bounds.left + bounds.width / 2 - ow / 2);
          break;
        case "right":
          obj.set("left", bounds.left + bounds.width - ow);
          break;
        case "top":
          obj.set("top", bounds.top);
          break;
        case "middle":
          obj.set("top", bounds.top + bounds.height / 2 - oh / 2);
          break;
        case "bottom":
          obj.set("top", bounds.top + bounds.height - oh);
          break;
      }
      obj.setCoords();
    });
    canvas.renderAll();
    internalPushState();
  }, [internalPushState]);

  const duplicateSelected = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active) return;
    active.clone().then((cloned: fabric.FabricObject) => {
      cloned.set({
        left: (cloned.left || 0) + 20,
        top: (cloned.top || 0) + 20,
      });
      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      canvas.renderAll();
      internalPushState();
    });
  }, [internalPushState]);

  const zoomIn = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const z = canvas.getZoom();
    canvas.setZoom(Math.min(z + 0.1, 5));
    canvas.renderAll();
  }, []);

  const zoomOut = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const z = canvas.getZoom();
    canvas.setZoom(Math.max(z - 0.1, 0.1));
    canvas.renderAll();
  }, []);

  const setZoom = useCallback((zoom: number) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.setZoom(Math.max(0.1, Math.min(zoom, 5)));
    canvas.renderAll();
  }, []);

  const getZoom = useCallback((): number => {
    return fabricRef.current?.getZoom() || 1;
  }, []);

  const getActiveObject = useCallback((): fabric.FabricObject | null => {
    return fabricRef.current?.getActiveObject() || null;
  }, []);

  const selectAll = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const objs = canvas.getObjects();
    if (objs.length === 0) return;
    const sel = new fabric.ActiveSelection(objs, { canvas });
    canvas.setActiveObject(sel);
    canvas.renderAll();
  }, []);

  const groupSelected = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject() as fabric.ActiveSelection;
    if (!active || active.type !== "activeSelection") return;
    const objs = active.getObjects();
    const group = new fabric.Group(objs, { canvas });
    canvas.add(group);
    objs.forEach((obj) => canvas.remove(obj));
    canvas.setActiveObject(group);
    canvas.renderAll();
    internalPushState();
  }, [internalPushState]);

  const ungroupSelected = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject() as fabric.Group;
    if (!active || active.type !== "group") return;
    const objs = active.getObjects();
    const sel = new fabric.ActiveSelection(objs, { canvas });
    canvas.remove(active);
    sel.forEachObject((obj) => canvas.add(obj));
    canvas.setActiveObject(sel);
    canvas.renderAll();
    internalPushState();
  }, [internalPushState]);

  const setCanvasSize = useCallback((width: number, height: number) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.setDimensions({ width, height });
    canvas.renderAll();
    internalPushState();
  }, [internalPushState]);

  const exportToDataURL = useCallback((format: string = "png", quality: number = 1): string => {
    const canvas = fabricRef.current;
    if (!canvas) return "";
    const fmt = format === "jpg" || format === "jpeg" ? "jpeg" : "png";
    return canvas.toDataURL({ format: fmt as "jpeg" | "png", quality, multiplier: 2 });
  }, []);

  const undo = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas || historyIndexRef.current <= 0) return;
    saveCurrentPage();
    historyIndexRef.current -= 1;
    const state = historyStackRef.current[historyIndexRef.current];
    if (!state) return;
    skipNextRef.current = true;
    try {
      const parsed = JSON.parse(state);
      canvas.loadFromJSON(parsed).then(() => {
        canvas.renderAll();
      });
    } catch (e) {
      console.error("Undo failed", e);
    }
  }, [saveCurrentPage]);

  const redo = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas || historyIndexRef.current >= historyStackRef.current.length - 1) return;
    saveCurrentPage();
    historyIndexRef.current += 1;
    const state = historyStackRef.current[historyIndexRef.current];
    if (!state) return;
    skipNextRef.current = true;
    try {
      const parsed = JSON.parse(state);
      canvas.loadFromJSON(parsed).then(() => {
        canvas.renderAll();
      });
    } catch (e) {
      console.error("Redo failed", e);
    }
  }, [saveCurrentPage]);

  const canUndo = useCallback((): boolean => {
    return historyIndexRef.current > 0;
  }, []);

  const canRedo = useCallback((): boolean => {
    return historyIndexRef.current < historyStackRef.current.length - 1;
  }, []);

  const setHistoryPush = useCallback((fn: (state: string) => void) => {
    pushHistoryRef.current = fn;
  }, []);

  const getPageCount = useCallback((): number => {
    return pageStatesRef.current.length;
  }, []);

  const getPageStates = useCallback((): string[] => {
    return [...pageStatesRef.current];
  }, []);

  const loadPage = useCallback((index: number) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    if (index < 0 || index >= pageStatesRef.current.length) return;
    saveCurrentPage();
    currentPageRef.current = index;
    const state = pageStatesRef.current[index];
    if (state) {
      try {
        const parsed = JSON.parse(state);
        canvas.loadFromJSON(parsed).then(() => {
          canvas.renderAll();
          const json = JSON.stringify(canvas.toJSON());
          historyStackRef.current = [json];
          historyIndexRef.current = 0;
        });
      } catch (e) {
        console.error("Failed to load page", e);
      }
    } else {
      canvas.clear();
      canvas.backgroundColor = "#ffffff";
      canvas.renderAll();
      const json = JSON.stringify(canvas.toJSON());
      historyStackRef.current = [json];
      historyIndexRef.current = 0;
    }
  }, [saveCurrentPage]);

  const setPageStates = useCallback((states: string[]) => {
    pageStatesRef.current = [...states];
    if (currentPageRef.current >= states.length) {
      currentPageRef.current = 0;
    }
    loadPage(currentPageRef.current);
  }, [loadPage]);

  const addPage = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    saveCurrentPage();
    const emptyJson = JSON.stringify({ version: fabric.version || "5.3.0", objects: [], background: "#ffffff" });
    pageStatesRef.current.push(emptyJson);
    currentPageRef.current = pageStatesRef.current.length - 1;
    loadPage(currentPageRef.current);
  }, [saveCurrentPage, loadPage]);

  const deletePage = useCallback((index: number) => {
    if (pageStatesRef.current.length <= 1) return;
    if (index < 0 || index >= pageStatesRef.current.length) return;
    pageStatesRef.current.splice(index, 1);
    if (currentPageRef.current >= pageStatesRef.current.length) {
      currentPageRef.current = pageStatesRef.current.length - 1;
    }
    if (index <= currentPageRef.current && currentPageRef.current > 0) {
      currentPageRef.current -= 1;
    }
    loadPage(currentPageRef.current);
  }, [loadPage]);

  const duplicatePage = useCallback((index: number) => {
    if (index < 0 || index >= pageStatesRef.current.length) return;
    const state = pageStatesRef.current[index];
    pageStatesRef.current.splice(index + 1, 0, state);
    currentPageRef.current = index + 1;
    loadPage(currentPageRef.current);
  }, [loadPage]);

  const reorderPages = useCallback((from: number, to: number) => {
    if (from < 0 || from >= pageStatesRef.current.length) return;
    if (to < 0 || to >= pageStatesRef.current.length) return;
    const [moved] = pageStatesRef.current.splice(from, 1);
    pageStatesRef.current.splice(to, 0, moved);
    if (currentPageRef.current === from) {
      currentPageRef.current = to;
    }
  }, []);

  const addText = useCallback((type: string) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const fontSize = type === "heading" ? 48 : type === "subheading" ? 32 : 18;
    const fontWeight = type === "heading" ? 700 : type === "subheading" ? 600 : 400;
    const text = new fabric.IText("Double-click to edit", {
      left: 100 + Math.random() * 200,
      top: 100 + Math.random() * 200,
      fontSize,
      fontFamily: "Arial",
      fill: "#1e1e1e",
      fontWeight,
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
    internalPushState();
  }, [internalPushState]);

  const applyFilterToActive = useCallback((filter: string) => {
    if (!fabricRef.current) return;
    fabricApplyFilter(fabricRef.current, filter);
  }, []);

  const addImageFromUrl = useCallback((url: string) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    fabric.Image.fromURL(url, { crossOrigin: "anonymous" }).then((img) => {
      img.set({ left: 100, top: 100, scaleX: 0.3, scaleY: 0.3 });
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
      internalPushState();
    });
  }, [internalPushState]);

  useImperativeHandle(ref, () => ({
    getCanvasJSON,
    loadCanvasJSON,
    clearCanvas,
    addShape,
    handleImageUpload,
    deleteSelected,
    updateFill,
    updateStroke,
    updateStrokeWidth,
    updateOpacity,
    updateFontSize,
    updateFontFamily,
    updateFontWeight,
    updateLetterSpacing,
    updateLineHeight,
    bringForward,
    sendBackward,
    alignObjects,
    duplicateSelected,
    zoomIn,
    zoomOut,
    setZoom,
    getZoom,
    getActiveObject,
    selectAll,
    groupSelected,
    ungroupSelected,
    setCanvasSize,
    exportToDataURL,
    getPageCount,
    getPageStates,
    setPageStates,
    saveCurrentPage,
    loadPage,
    addPage,
    deletePage,
    duplicatePage,
    reorderPages,
    undo,
    redo,
    canUndo,
    canRedo,
    setHistoryPush,
    addText,
    addImageFromUrl,
    applyFilterToActive,
  }));

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (!files || files.length === 0 || !fabricRef.current) return;
    const file = files[0];
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const imgUrl = ev.target?.result as string;
      const rect = containerRef.current?.getBoundingClientRect();
      const canvas = fabricRef.current!;
      fabric.Image.fromURL(imgUrl, { crossOrigin: "anonymous" }).then((img) => {
        const zoom = canvas.getZoom();
        const left = (e.clientX - (rect?.left || 0)) / zoom - 50;
        const top = (e.clientY - (rect?.top || 0)) / zoom - 50;
        img.set({
          left: Math.max(0, left),
          top: Math.max(0, top),
          scaleX: 0.3,
          scaleY: 0.3,
        });
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
        internalPushState();
      });
    };
    reader.readAsDataURL(file);
  }, [internalPushState]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center bg-[#e5e5e5]"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <canvas ref={canvasRef} className="shadow-xl" id="design-canvas" />
    </div>
  );
});

export default DesignCanvas;
