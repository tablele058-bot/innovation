"use client";

import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";

export type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";

export default function DiagramCanvas({
  excalidrawAPI,
  onChange,
  onPointerUpdate,
}: {
  excalidrawAPI?: (api: any) => void;
  onChange?: (elements: readonly any[], appState: any) => void;
  onPointerUpdate?: (payload: any) => void;
}) {
  return (
    <div className="w-full h-full overflow-hidden">
      <Excalidraw
        excalidrawAPI={excalidrawAPI}
        onChange={onChange}
        onPointerUpdate={onPointerUpdate}
        UIOptions={{
          canvasActions: {
            changeViewBackgroundColor: false,
            clearCanvas: false,
            export: false,
            loadScene: false,
            saveToActiveFile: false,
            toggleTheme: false,
            saveAsImage: false,
          },
          tools: {
            image: false,
          },
        }}
        viewModeEnabled={false}
        zenModeEnabled={false}
        theme="dark"
        name="easier.io"
      />
    </div>
  );
}
