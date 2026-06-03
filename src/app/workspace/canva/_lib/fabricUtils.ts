import * as fabric from "fabric";

export function createShape(type: string, options?: any): fabric.FabricObject | null {
  const defaults = {
    left: 100 + Math.random() * 200,
    top: 100 + Math.random() * 200,
    fill: "#3b82f6",
    stroke: "#1e40af",
    strokeWidth: 2,
    ...options,
  };

  switch (type) {
    case "rect":
      return new fabric.Rect({ width: 120, height: 90, rx: 0, ry: 0, ...defaults });
    case "circle":
      return new fabric.Ellipse({ rx: 50, ry: 50, ...defaults });
    case "triangle":
      return new fabric.Triangle({ width: 100, height: 90, ...defaults });
    case "star":
      return createStarPolygon(5, 50, 25, defaults);
    case "diamond":
      return new fabric.Polygon([
        { x: 50, y: 0 }, { x: 100, y: 50 },
        { x: 50, y: 100 }, { x: 0, y: 50 },
      ], defaults);
    case "hexagon":
      return createRegularPolygon(6, 50, defaults);
    case "pentagon":
      return createRegularPolygon(5, 50, defaults);
    case "cross":
      return createCrossShape(defaults);
    case "arrow-right":
      return createArrow(defaults);
    case "line":
      return new fabric.Line([0, 0, 200, 0], { stroke: "#1e1e1e", strokeWidth: 3, left: 100, top: 100 });
    default:
      return null;
  }
}

function createStarPolygon(points: number, outerR: number, innerR: number, opts: any) {
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (Math.PI * i) / points - Math.PI / 2;
    pts.push({ x: r * Math.cos(angle) + outerR, y: r * Math.sin(angle) + outerR });
  }
  return new fabric.Polygon(pts, opts);
}

function createRegularPolygon(sides: number, radius: number, opts: any) {
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
    pts.push({ x: radius * Math.cos(angle) + radius, y: radius * Math.sin(angle) + radius });
  }
  return new fabric.Polygon(pts, opts);
}

function createCrossShape(opts: any) {
  const w = 40, h = 120, thickness = 30;
  const path = `M ${(w - thickness) / 2} 0 L ${(w + thickness) / 2} 0 L ${(w + thickness) / 2} ${(h - thickness) / 2} L ${w} ${(h - thickness) / 2} L ${w} ${(h + thickness) / 2} L ${(w + thickness) / 2} ${(h + thickness) / 2} L ${(w + thickness) / 2} ${h} L ${(w - thickness) / 2} ${h} L ${(w - thickness) / 2} ${(h + thickness) / 2} L 0 ${(h + thickness) / 2} L 0 ${(h - thickness) / 2} L ${(w - thickness) / 2} ${(h - thickness) / 2} Z`;
  return new fabric.Path(path, opts);
}

function createArrow(opts: any) {
  const path = "M 0 50 L 140 50 L 120 20 L 160 50 L 120 80 L 140 50";
  return new fabric.Path(path, { ...opts, fill: null, stroke: "#1e1e1e", strokeWidth: 4 });
}

export function createTextElement(type: string, options?: any) {
  const baseText = type === "heading" ? "Heading" : type === "subheading" ? "Subheading" : "Body text";
  const fontSize = type === "heading" ? 48 : type === "subheading" ? 32 : 18;
  return new fabric.IText(baseText, {
    left: 100 + Math.random() * 200,
    top: 100 + Math.random() * 200,
    fontSize,
    fontFamily: "Arial",
    fill: "#1e1e1e",
    fontWeight: type === "heading" ? 700 : type === "subheading" ? 600 : 400,
    ...options,
  });
}

export function applyFilter(canvas: fabric.Canvas, filterName: string, value?: number) {
  const active = canvas.getActiveObject() as fabric.Image;
  if (!active || active.type !== "image") return;
  let filter: any = null;
  switch (filterName) {
    case "grayscale":
      filter = new fabric.filters.Grayscale();
      break;
    case "sepia":
      filter = new fabric.filters.Sepia();
      break;
    case "blur":
      filter = new fabric.filters.Blur({ blur: (value || 0.5) / 10 });
      break;
    case "brightness":
      filter = new fabric.filters.Brightness({ brightness: (value || 50) / 100 });
      break;
    case "contrast":
      filter = new fabric.filters.Contrast({ contrast: (value || 50) / 100 });
      break;
    case "saturation":
      filter = new fabric.filters.Saturation({ saturation: (value || 50) / 100 });
      break;
    case "vintage":
      filter = new fabric.filters.Composed([
        new fabric.filters.Sepia(),
        new fabric.filters.Brightness({ brightness: 0.1 }),
        new fabric.filters.Contrast({ contrast: 0.2 }),
      ]);
      break;
    case "warm":
      filter = new fabric.filters.Composed([
        new fabric.filters.Brightness({ brightness: 0.05 }),
        new fabric.filters.Saturation({ saturation: 0.2 }),
      ]);
      break;
    case "cool":
      filter = new fabric.filters.Composed([
        new fabric.filters.Brightness({ brightness: 0.1 }),
        new fabric.filters.Saturation({ saturation: 0.3 }),
      ]);
      break;
    case "dramatic":
      filter = new fabric.filters.Composed([
        new fabric.filters.Contrast({ contrast: 0.4 }),
        new fabric.filters.Brightness({ brightness: -0.1 }),
      ]);
      break;
    case "fade":
      filter = new fabric.filters.Composed([
        new fabric.filters.Brightness({ brightness: 0.1 }),
        new fabric.filters.Contrast({ contrast: -0.2 }),
      ]);
      break;
    default:
      active.filters = [];
      active.applyFilters();
      canvas.renderAll();
      return;
  }
  active.filters = filter instanceof fabric.filters.Composed ? filter.subFilters : [filter];
  active.applyFilters();
  canvas.renderAll();
}

export function getCanvasAsBlob(canvas: fabric.Canvas, format: string = "png"): Promise<Blob> {
  return new Promise((resolve) => {
    const mime = format === "png" ? "image/png" : format === "jpeg" ? "image/jpeg" : "image/svg+xml";
    canvas.getElement().toBlob((blob) => resolve(blob!), mime, 1);
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
