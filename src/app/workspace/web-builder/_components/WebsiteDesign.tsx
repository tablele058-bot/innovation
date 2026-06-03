"use client";

import { useEffect, useRef, useState } from "react";
import { Monitor, Tablet, Smartphone, Maximize2 } from "lucide-react";

type Props = {
  generatedCode: string;
  onElementSelect?: (info: ElementInfo | null) => void;
};

export type ElementInfo = {
  tag: string;
  text: string;
  src?: string;
  alt?: string;
  selector: string;
  outerHTML: string;
};

type ResponsiveMode = "desktop" | "tablet" | "mobile";

const RESPONSIVE_WIDTHS: Record<ResponsiveMode, number> = {
  desktop: 1440,
  tablet: 768,
  mobile: 375,
};

export default function WebsiteDesign({ generatedCode, onElementSelect }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [srcDoc, setSrcDoc] = useState("");
  const [responsiveMode, setResponsiveMode] = useState<ResponsiveMode>("desktop");
  const [contentHeight, setContentHeight] = useState(900);
  const [containerWidth, setContainerWidth] = useState(1200);
  const [scale, setScale] = useState(1);

  const viewportWidth = RESPONSIVE_WIDTHS[responsiveMode];

  useEffect(() => {
    if (!generatedCode) {
      setSrcDoc("");
      return;
    }
    setSrcDoc(buildHtml(generatedCode));
  }, [generatedCode]);

  function buildHtml(code: string) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=${viewportWidth}, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.css" rel="stylesheet" />
  <script src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.js"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" crossorigin="anonymous" referrerpolicy="no-referrer" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.css" />
  <script src="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body { margin: 0; padding: 0; overflow-x: hidden; width: ${viewportWidth}px; }
    .wb-highlight { outline: 3px solid #3b82f6 !important; outline-offset: 2px !important; cursor: pointer; }
  </style>
</head>
<body>
  ${code}
  <script>
    (function() {
      var sel = null;
      document.body.addEventListener('click', function(e) {
        e.stopPropagation();
        if (sel) sel.classList.remove('wb-highlight');
        sel = e.target;
        sel.classList.add('wb-highlight');
        var info = {
          tag: sel.tagName.toLowerCase(),
          text: (sel.innerText || '').substring(0, 200),
          src: sel.getAttribute('src') || '',
          alt: sel.getAttribute('alt') || '',
          selector: sel.tagName.toLowerCase() + (sel.id ? '#' + sel.id : '') + (sel.className && typeof sel.className === 'string' ? '.' + sel.className.trim().split(/\\s+/).join('.') : ''),
          outerHTML: (sel.outerHTML || '').substring(0, 2000)
        };
        window.parent.postMessage({ type: 'wb-element-select', info: info }, '*');
      });
      document.body.addEventListener('dblclick', function(e) {
        var el = e.target;
        if (el) { var r = document.createRange(); r.selectNodeContents(el); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); }
      });
    })();
  </script>
</body>
</html>`;
  }

  // Track iframe content height
  useEffect(() => {
    if (!iframeRef.current || !srcDoc) return;
    const check = () => {
      try {
        const doc = iframeRef.current?.contentDocument || iframeRef.current?.contentWindow?.document;
        if (doc) {
          const h = Math.max(doc.documentElement.scrollHeight, doc.body.scrollHeight, 600);
          setContentHeight(h);
        }
      } catch {}
    };
    const t = setTimeout(check, 600);
    const iframe = iframeRef.current;
    iframe?.addEventListener("load", check);
    return () => {
      clearTimeout(t);
      iframe?.removeEventListener("load", check);
    };
  }, [srcDoc]);

  // Track container width for scaling
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => setContainerWidth(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Calculate scale
  useEffect(() => {
    const padding = 32;
    const available = containerWidth - padding;
    const s = Math.min(1, available / viewportWidth);
    setScale(s);
  }, [containerWidth, viewportWidth]);

  // Rebuild iframe when viewport changes
  useEffect(() => {
    if (generatedCode) {
      setSrcDoc(buildHtml(generatedCode));
    }
  }, [viewportWidth]);

  // Message listener
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "wb-element-select" && onElementSelect) {
        onElementSelect(e.data.info);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [onElementSelect]);

  const fullScreen = () => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.css" rel="stylesheet" />
  <script src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.js"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" crossorigin="anonymous" referrerpolicy="no-referrer" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.css" />
  <script src="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body style="margin:0;padding:0;">${generatedCode}</body>
</html>`;
    const w = window.open();
    w?.document.write(html);
  };

  if (!generatedCode) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#1e1e1e] text-gray-600">
        <div className="text-center">
          <div className="text-5xl mb-4">🎨</div>
          <p className="text-sm">Your website preview will appear here</p>
          <p className="text-xs mt-1">Describe what you want to build in the chat</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#1e1e1e] overflow-hidden">
      {/* Toolbar */}
      <div className="h-9 bg-[#2d2d2d] border-b border-[#3c3c3c] flex items-center justify-between px-3 flex-shrink-0">
        <div className="flex items-center gap-1">
          <span className="text-[11px] text-gray-500 mr-2">Preview</span>
          <div className="w-px h-4 bg-[#3c3c3c] mx-1" />
          <button onClick={() => setResponsiveMode("desktop")} className={`p-1.5 rounded transition-colors ${responsiveMode === "desktop" ? "text-orange-400 bg-orange-500/10" : "text-gray-500 hover:text-white hover:bg-[#3c3c3c]"}`} title="Desktop (1440px)">
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setResponsiveMode("tablet")} className={`p-1.5 rounded transition-colors ${responsiveMode === "tablet" ? "text-orange-400 bg-orange-500/10" : "text-gray-500 hover:text-white hover:bg-[#3c3c3c]"}`} title="Tablet (768px)">
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setResponsiveMode("mobile")} className={`p-1.5 rounded transition-colors ${responsiveMode === "mobile" ? "text-orange-400 bg-orange-500/10" : "text-gray-500 hover:text-white hover:bg-[#3c3c3c]"}`} title="Mobile (375px)">
            <Smartphone className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] text-gray-600 ml-1 w-10 select-none">{viewportWidth}px</span>
          <span className={`text-[10px] ml-1 select-none ${scale < 1 ? "text-orange-400" : "text-gray-600"}`}>
            {Math.round(scale * 100)}%
          </span>
        </div>
        <button onClick={fullScreen} className="flex items-center gap-1 text-[11px] px-2 py-1 rounded text-gray-500 hover:text-white hover:bg-[#3c3c3c] transition-colors" title="Fullscreen preview">
          <Maximize2 className="w-3 h-3" /> Fullscreen
        </button>
      </div>

      {/* Preview container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden bg-[#1e1e1e] flex justify-center"
      >
        <div
          style={{
            width: viewportWidth * scale,
            height: "100%",
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          <div
            style={{
              width: viewportWidth * scale,
              height: contentHeight * scale,
              position: "relative",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <iframe
              ref={iframeRef}
              srcDoc={srcDoc}
              title="Website Preview"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: viewportWidth,
                height: contentHeight,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                border: "none",
                background: "white",
              }}
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
