"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowUp, X, MessageSquare, Minus } from "lucide-react";

type Messages = {
  role: string;
  content: string;
};

type Props = {
  messages: Messages[];
  onSend: (input: string) => void;
  loading: boolean;
  onClose: () => void;
  minimized: boolean;
  onToggleMinimize: () => void;
};

export default function ChatSection({ messages, onSend, loading, onClose, minimized, onToggleMinimize }: Props) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input);
    setInput("");
  };

  if (minimized) {
    return (
      <button
        onClick={onToggleMinimize}
        className="flex items-center gap-2 px-4 py-2.5 bg-[#252526] border border-[#3c3c3c] rounded-lg shadow-2xl text-gray-400 hover:text-white hover:border-orange-500/40 transition-all"
      >
        <MessageSquare className="w-4 h-4" />
        <span className="text-xs font-medium">Chat</span>
      </button>
    );
  }

  return (
    <div className="w-96 bg-[#252526] border border-[#3c3c3c] rounded-xl shadow-2xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-10 border-b border-[#3c3c3c] flex items-center justify-between px-4 flex-shrink-0 bg-[#2d2d2d]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gradient-to-br from-orange-400 to-pink-500 rounded flex items-center justify-center">
            <MessageSquare className="w-2.5 h-2.5 text-white" />
          </div>
          <span className="text-xs font-semibold text-gray-300">AI Website Builder</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onToggleMinimize} className="text-gray-500 hover:text-white transition-colors p-1 rounded hover:bg-[#3c3c3c]" title="Minimize">
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-1 rounded hover:bg-[#3c3c3c]" title="Close">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: 400 }}>
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-3xl mb-3">🎨</div>
            <p className="text-gray-400 text-xs font-medium mb-1">Describe your website idea</p>
            <p className="text-gray-600 text-[10px]">e.g. "Build a landing page for a SaaS product"</p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`px-3.5 py-2.5 rounded-xl text-xs leading-relaxed max-w-[85%] ${
                  msg.role === "user"
                    ? "bg-orange-500/20 text-orange-200 border border-orange-500/15"
                    : "bg-[#1e1e1e] text-gray-300 border border-[#333]"
                }`}
              >
                {msg.content
                  ?.replace(/```html[\s\S]*```/g, "✨ Code generated! Check the preview.")
                  .replace(/```[\s\S]*```/g, "✨ Code generated! Check the preview.")}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-gray-500 px-3.5 py-2.5">
            <div className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-b-2 border-orange-400" />
            Generating your website...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-[#3c3c3c]">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            placeholder="Describe your website..."
            rows={1}
            className="flex-1 bg-[#1e1e1e] border border-[#3c3c3c] rounded-lg px-3 py-2.5 text-xs text-gray-300 placeholder-gray-600 resize-none focus:outline-none focus:border-orange-500/50 transition-colors"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="p-2.5 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-all disabled:opacity-50 flex-shrink-0"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
