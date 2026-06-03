"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { Download, Monitor, Save, ArrowLeft, Wand2, MessageSquare } from "lucide-react";
import { toast, Toaster } from "sonner";
import ChatSection from "./_components/ChatSection";
import WebsiteDesign from "./_components/WebsiteDesign";
import ElementEditor from "./_components/ElementEditor";
import type { ElementInfo } from "./_components/WebsiteDesign";
import Link from "next/link";

type Messages = {
  role: string;
  content: string;
};

function sanitizeCode(code: string): string {
  code = code.trim();
  const firstLt = code.indexOf("<");
  if (firstLt > 0) code = code.slice(firstLt);
  const endHtml = code.indexOf("</html>");
  if (endHtml !== -1) code = code.slice(0, endHtml + 7);
  return code;
}

export default function WebBuilderPage() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();

  const [projectId] = useState(() => uuidv4());
  const [frameId] = useState(() => uuidv4());
  const [messages, setMessages] = useState<Messages[]>([]);
  const [generatedCode, setGeneratedCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedElement, setSelectedElement] = useState<ElementInfo | null>(null);
  const [chatOpen, setChatOpen] = useState(true);
  const [chatMinimized, setChatMinimized] = useState(false);
  const projectCreated = useRef(false);

  useEffect(() => {
    if (isLoaded && !userId) router.push("/");
  }, [isLoaded, userId, router]);

  const saveGeneratedCode = useCallback(async (code: string) => {
    try {
      await fetch("/api/web-builder/frames", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ designCode: code, frameId, projectId }),
      });
    } catch (err) {
      console.error("Save error:", err);
    }
  }, [frameId, projectId]);

  const saveMessages = useCallback(async (msgs: Messages[]) => {
    try {
      await fetch("/api/web-builder/chats", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: msgs, frameId }),
      });
    } catch (err) {
      console.error("Save messages error:", err);
    }
  }, [frameId]);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (messages.length > 0) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => saveMessages(messages), 1000);
    }
    return () => clearTimeout(saveTimerRef.current);
  }, [messages, saveMessages]);

  useEffect(() => {
    if (generatedCode.length > 10 && !loading) {
      const timer = setTimeout(() => saveGeneratedCode(generatedCode), 2000);
      return () => clearTimeout(timer);
    }
  }, [generatedCode, loading, saveGeneratedCode]);

  const createProjectIfNeeded = useCallback(async (firstMsg: string) => {
    if (projectCreated.current) return;
    projectCreated.current = true;
    const msg: Messages = { role: "user", content: firstMsg };
    setMessages([msg]);
    await fetch("/api/web-builder/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, frameId, messages: [msg] }),
    });
    return msg;
  }, [projectId, frameId]);

  async function sendMessage(userInput: string) {
    if (!userInput.trim()) return;
    setLoading(true);
    setSelectedElement(null);

    let currentMsgs: Messages[];
    if (!projectCreated.current) {
      const initialMsg = await createProjectIfNeeded(userInput);
      currentMsgs = initialMsg ? [initialMsg] : [];
    } else {
      currentMsgs = [...messages, { role: "user", content: userInput }];
      setMessages(currentMsgs);
    }

    const apiMessages = currentMsgs.map((m) => ({
      role: m.role,
      content: m.content,
    }));
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const result = await fetch("/api/web-builder/ai-model", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!result.ok) {
        const errText = await result.text();
        console.error("API error:", errText);
        toast.error("AI generation failed. Check console.");
        setLoading(false);
        return;
      }

      if (!result.body) return;
      const reader = result.body.getReader();
      const decoder = new TextDecoder();

      let fullText = "";
      let isCode = false;
      let chatContent = "";
      let codeBuffer = "";
      let lastPreviewUpdate = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;

        if (!isCode && fullText.includes("```html")) {
          isCode = true;
          const parts = fullText.split("```html");
          chatContent = parts[0];
          codeBuffer = parts[1] || "";

          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { ...updated[updated.length - 1], content: chatContent || "Generating your website..." };
            return updated;
          });
          setGeneratedCode(sanitizeCode(codeBuffer));
        } else if (isCode) {
          codeBuffer += chunk;
          const now = Date.now();
          if (codeBuffer.includes("```") || now - lastPreviewUpdate > 500) {
            const cleanCode = codeBuffer.includes("```") ? codeBuffer.split("```")[0] : codeBuffer;
            setGeneratedCode(sanitizeCode(cleanCode));
            lastPreviewUpdate = now;
          }
        } else {
          chatContent += chunk;
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { ...updated[updated.length - 1], content: chatContent };
            return updated;
          });
        }
      }

      if (isCode) {
        const finalCode = codeBuffer.includes("```") ? codeBuffer.split("```")[0] : codeBuffer;
        setGeneratedCode(sanitizeCode(finalCode));
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { ...updated[updated.length - 1], content: "✅ Website generated! Click any element in the preview to edit it." };
          return updated;
        });
        toast.success("Website generated!");
        setChatMinimized(true);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const handleElementSelect = (info: ElementInfo | null) => {
    setSelectedElement(info);
  };

  const handleElementUpdate = (newBodyHtml: string) => {
    setGeneratedCode(newBodyHtml);
    setSelectedElement(null);
    toast.success("Element updated!");
  };

  const onDownload = () => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generated Website</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.css" rel="stylesheet" />
  <script src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.js"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" crossorigin="anonymous" referrerpolicy="no-referrer" />
</head>
<body>${generatedCode}</body>
</html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "index.html";
    a.click();
  };

  const onFullScreen = () => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Website Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.css" rel="stylesheet" />
  <script src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.js"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" crossorigin="anonymous" referrerpolicy="no-referrer" />
</head>
<body>${generatedCode}</body>
</html>`;
    const w = window.open();
    w?.document.write(html);
  };

  if (!isLoaded || !userId) return null;

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] relative">
      <Toaster position="top-center" />
      {/* Header */}
      <div className="h-9 bg-[#323233] border-b border-[#3c3c3c] flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/workspace" className="text-gray-500 hover:text-gray-300 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="w-5 h-5 bg-gradient-to-br from-purple-500 to-pink-600 rounded flex items-center justify-center">
            <Wand2 className="w-3 h-3 text-white" />
          </div>
          <span className="text-xs text-gray-400 font-medium">Web Builder</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setChatOpen(true)}
            className="flex items-center gap-1 text-[11px] px-2 py-1 rounded text-gray-500 hover:text-gray-300 hover:bg-[#3c3c3c] transition-colors"
            title="Open chat"
          >
            <MessageSquare className="w-3 h-3" /> Chat
          </button>
          <button onClick={() => saveGeneratedCode(generatedCode)} className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-300 transition-colors px-2 py-1 rounded hover:bg-[#3c3c3c]">
            <Save className="w-3 h-3" /> Save
          </button>
          {generatedCode && (
            <>
              <button onClick={onFullScreen} className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-300 transition-colors px-2 py-1 rounded hover:bg-[#3c3c3c]">
                <Monitor className="w-3 h-3" /> Preview
              </button>
              <button onClick={onDownload} className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-300 transition-colors px-2 py-1 rounded hover:bg-[#3c3c3c]">
                <Download className="w-3 h-3" /> Download
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Preview fills everything */}
        <WebsiteDesign generatedCode={generatedCode} onElementSelect={handleElementSelect} />

        {/* Floating chat overlay */}
        {chatOpen && (
          <div className="absolute left-4 bottom-4 z-50">
            <ChatSection
              messages={messages}
              onSend={sendMessage}
              loading={loading}
              onClose={() => setChatOpen(false)}
              minimized={chatMinimized}
              onToggleMinimize={() => setChatMinimized((v) => !v)}
            />
          </div>
        )}

        {/* Properties panel - slides in from right */}
        {selectedElement && (
          <div className="absolute right-0 top-0 bottom-0 z-40 flex">
            <div className="w-72 bg-[#252526] border-l border-[#3c3c3c] flex flex-col shadow-2xl animate-slide-in">
              <ElementEditor element={selectedElement} onClose={() => setSelectedElement(null)} onUpdate={handleElementUpdate} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
