"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@clerk/nextjs";

interface NoteData {
  id?: number;
  videoUrl: string;
  videoTitle: string;
  content: string;
  summary?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

type PanelMode = "edit" | "preview" | "split";

const TOOLBAR_BTNS = [
  { label: "B", action: "**", after: "**", title: "Bold (Ctrl+B)", class: "font-bold" },
  { label: "I", action: "_", after: "_", title: "Italic (Ctrl+I)", class: "italic" },
  { label: "S", action: "~~", after: "~~", title: "Strikethrough", class: "line-through" },
  { label: "H1", action: "# ", after: "", title: "Heading 1" },
  { label: "H2", action: "## ", after: "", title: "Heading 2" },
  { label: "H3", action: "### ", after: "", title: "Heading 3" },
  { label: "•", action: "- ", after: "", title: "Bullet list" },
  { label: "1.", action: "1. ", after: "", title: "Numbered list" },
  { label: "❝", action: "> ", after: "", title: "Blockquote" },
  { label: "[ ]", action: "- [ ] ", after: "", title: "Task item" },
  { label: "—", action: "\n---\n", after: "", title: "Divider" },
  { label: "⏱", action: "[00:00] ", after: "", title: "Timestamp" },
  { label: "{}", action: "```\n", after: "\n```", title: "Code block" },
  { label: "``", action: "`", after: "`", title: "Inline code" },
];

function renderMarkdown(text: string): string {
  return text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/^---$/gm, "<hr/>")
    .replace(/^&gt; (.+)$/gm, "<blockquote>$1</blockquote>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/_(.+?)_/g, "<em>$1</em>")
    .replace(/~~(.+?)~~/g, "<del>$1</del>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>")
    .replace(/^- \[x\] (.+)$/gm, '<li class="task done">✓ $1</li>')
    .replace(/^- \[ \] (.+)$/gm, '<li class="task">☐ $1</li>')
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/^\d+\. (.+)$/gm, "<li class=\"ol\">$1</li>")
    .replace(/\[(\d{1,2}:\d{2}(?::\d{2})?)\]/g, '<span class="ts">$1</span>')
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br/>");
}

export default function YouTubeWorkspace() {
  const { userId } = useAuth();
  const [videoUrl, setVideoUrl] = useState("");
  const [embedUrl, setEmbedUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [noteId, setNoteId] = useState<number | null>(null);
  const [content, setContent] = useState("");
  const [savedNotes, setSavedNotes] = useState<NoteData[]>([]);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [videoRatio, setVideoRatio] = useState(50);
  const [selectedNote, setSelectedNote] = useState<NoteData | null>(null);
  const [viewMode, setViewMode] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [panelMode, setPanelMode] = useState<PanelMode>("edit");
  const [summarizing, setSummarizing] = useState(false);
  const [aiSummary, setAiSummary] = useState("");
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [filterTag, setFilterTag] = useState("");
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [wordWrap, setWordWrap] = useState(true);
  const [fontSize, setFontSize] = useState(13);
  const [notification, setNotification] = useState("");
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [askingAi, setAskingAi] = useState(false);

  const dragging = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const notifTimer = useRef<number | null>(null);

  const notify = (msg: string) => {
    setNotification(msg);
    if (notifTimer.current) clearTimeout(notifTimer.current);
    notifTimer.current = window.setTimeout(() => setNotification(""), 2500);
  };

  useEffect(() => { if (userId) fetchSavedNotes(); }, [userId]);

  const fetchSavedNotes = async () => {
    const res = await fetch("/api/notes");
    const data = await res.json();
    setSavedNotes(data);
  };

  const handleLoadVideo = () => {
    const match = videoUrl.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    if (match) {
      const vid = match[1];
      setEmbedUrl(`https://www.youtube.com/embed/${vid}?rel=0`);
      setVideoTitle(videoUrl);
      setViewMode(false);
      setAiSummary("");
      setShowAiPanel(false);
      const existing = savedNotes.find((n) => n.videoUrl.includes(vid));
      if (existing) {
        setNoteId(existing.id || null);
        setContent(existing.content);
        setTags(existing.tags || []);
        if (existing.summary) setAiSummary(existing.summary);
      } else {
        setNoteId(null);
        setContent("");
        setTags([]);
      }
    } else {
      notify("Invalid YouTube URL");
    }
  };

  const handleSave = useCallback(async () => {
    if (!embedUrl || !userId) return;
    setSaving(true);
    await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: noteId, videoUrl: embedUrl, videoTitle, content, tags, summary: aiSummary }),
    });
    await fetchSavedNotes();
    setSaving(false);
  }, [embedUrl, videoTitle, content, noteId, userId, tags, aiSummary]);

  useEffect(() => {
    if (!content || viewMode) return;
    const timer = setTimeout(() => handleSave(), 2000);
    return () => clearTimeout(timer);
  }, [content, handleSave, viewMode]);

  const selectNote = (note: NoteData) => {
    setSelectedNote(note);
    const match = note.videoUrl.match(/embed\/([a-zA-Z0-9_-]{11})/);
    if (match) {
      setEmbedUrl(note.videoUrl);
      setVideoUrl(`https://youtu.be/${match[1]}`);
      setVideoTitle(note.videoTitle);
      setContent(note.content);
      setNoteId(note.id || null);
      setTags(note.tags || []);
      setAiSummary(note.summary || "");
      setViewMode(false);
    }
  };

  const deleteNote = async (id: number) => {
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    setConfirmDelete(null);
    if (selectedNote?.id === id || noteId === id) {
      setSelectedNote(null); setContent(""); setNoteId(null);
      setEmbedUrl(""); setVideoUrl(""); setTags([]); setAiSummary("");
    }
    await fetchSavedNotes();
    notify("Note deleted");
  };

  // FIX: proper cursor-position insert
  const insertAtCursor = (before: string, after = "") => {
    const ta = textareaRef.current;
    if (!ta) { setContent((p) => p + before + after); return; }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = content.slice(start, end);
    const newVal = content.slice(0, start) + before + selected + after + content.slice(end);
    setContent(newVal);
    requestAnimationFrame(() => {
      ta.focus();
      const cursor = start + before.length + selected.length + (after ? after.length : 0);
      ta.setSelectionRange(
        after ? start + before.length : cursor,
        after ? start + before.length + selected.length : cursor
      );
    });
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      if (e.key === "b") { e.preventDefault(); insertAtCursor("**", "**"); }
      if (e.key === "i") { e.preventDefault(); insertAtCursor("_", "_"); }
      if (e.key === "s") { e.preventDefault(); handleSave(); notify("Saved!"); }
      if (e.key === "e") { e.preventDefault(); exportNote(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [content, handleSave]);

  const exportNote = () => {
    if (!content) return notify("Nothing to export");
    const blob = new Blob([`# Notes for: ${videoTitle}\n\n${content}`], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `notes-${Date.now()}.md`;
    a.click();
    notify("Exported as Markdown!");
  };

  const exportPdf = () => {
    if (!content) return notify("Nothing to export");
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<html><head><title>Notes</title><style>
      body{font-family:monospace;padding:2rem;max-width:800px;margin:0 auto}
      h1,h2,h3{border-bottom:1px solid #ccc} code{background:#f0f0f0;padding:2px 4px}
      pre{background:#f0f0f0;padding:1rem;overflow:auto}
    </style></head><body><h1>${videoTitle}</h1><div>${renderMarkdown(content)}</div></body></html>`);
    win.print();
  };

  const copyNote = () => {
    navigator.clipboard.writeText(content);
    notify("Copied to clipboard!");
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, "-");
    if (t && !tags.includes(t)) { setTags((p) => [...p, t]); setTagInput(""); }
  };

  const removeTag = (t: string) => setTags((p) => p.filter((x) => x !== t));

  const allTags = Array.from(new Set(savedNotes.flatMap((n) => n.tags || [])));

  const filteredNotes = savedNotes.filter((n) => {
    const q = search.toLowerCase();
    const matchSearch = !q || n.videoTitle?.toLowerCase().includes(q) || n.content?.toLowerCase().includes(q);
    const matchTag = !filterTag || (n.tags || []).includes(filterTag);
    return matchSearch && matchTag;
  });

  const formatDate = (d?: string) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  const handleMouseDown = () => { dragging.current = true; };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setVideoRatio(Math.max(20, Math.min(80, ((e.clientX - rect.left) / rect.width) * 100)));
  };
  const handleMouseUp = () => { dragging.current = false; };

  // AI summarize using Anthropic API
  const summarizeWithAI = async () => {
    if (!content) return notify("Write some notes first");
    setSummarizing(true); setShowAiPanel(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `Summarize these video notes into 3-5 key bullet points. Be concise and insightful.\n\nNotes:\n${content}`,
          }],
        }),
      });
      const data = await res.json();
      const summary = data.content?.find((b: { type: string }) => b.type === "text")?.text || "No summary.";
      setAiSummary(summary);
    } catch {
      setAiSummary("Error generating summary.");
    }
    setSummarizing(false);
  };

  const askAI = async () => {
    if (!aiQuestion.trim()) return;
    setAskingAi(true); setAiAnswer("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `Based on these video notes:\n${content}\n\nAnswer this question: ${aiQuestion}`,
          }],
        }),
      });
      const data = await res.json();
      setAiAnswer(data.content?.find((b: { type: string }) => b.type === "text")?.text || "No answer.");
    } catch {
      setAiAnswer("Error getting answer.");
    }
    setAskingAi(false);
  };

  const clearWorkspace = () => {
    setEmbedUrl(""); setVideoUrl(""); setContent(""); setNoteId(null);
    setSelectedNote(null); setTags([]); setAiSummary(""); setShowAiPanel(false);
  };

  return (
    <div className="flex flex-1" style={{ background: "#141414", fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}>

      {/* Notification toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-[100] px-4 py-2 rounded-lg text-xs font-medium" style={{
          background: "linear-gradient(135deg, #f97316, #ea580c)",
          color: "#fff", boxShadow: "0 4px 20px rgba(249,115,22,0.4)",
          animation: "slideIn 0.2s ease"
        }}>
          {notification}
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600&family=Space+Grotesk:wght@400;500;600&display=swap');
        @keyframes slideIn { from { transform: translateX(20px); opacity: 0 } to { transform: translateX(0); opacity: 1 } }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        ::-webkit-scrollbar { width: 4px; height: 4px }
        ::-webkit-scrollbar-track { background: #1a1a1a }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px }
        ::-webkit-scrollbar-thumb:hover { background: #f97316 }
        .note-item { transition: all 0.15s ease }
        .note-item:hover { background: rgba(249,115,22,0.04) }
        .tag-pill { transition: all 0.1s }
        .tag-pill:hover { background: rgba(249,115,22,0.15) !important }
        .md-preview h1 { font-size: 1.4em; border-bottom: 1px solid #2a2a2a; padding-bottom: 6px; margin: 12px 0 8px; color: #f0f0f0 }
        .md-preview h2 { font-size: 1.2em; color: #d0d0d0; margin: 10px 0 6px }
        .md-preview h3 { font-size: 1.05em; color: #b0b0b0; margin: 8px 0 4px }
        .md-preview p { color: #909090; line-height: 1.7; margin: 6px 0 }
        .md-preview strong { color: #f0f0f0 }
        .md-preview em { color: #c0c0c0; font-style: italic }
        .md-preview del { color: #555; text-decoration: line-through }
        .md-preview blockquote { border-left: 3px solid #f97316; padding-left: 12px; color: #777; margin: 8px 0 }
        .md-preview code { background: #1e1e1e; color: #f97316; padding: 1px 5px; border-radius: 3px; font-size: 0.85em }
        .md-preview pre { background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 6px; padding: 12px; overflow-x: auto; margin: 8px 0 }
        .md-preview pre code { background: none; color: #a0cfff; padding: 0 }
        .md-preview hr { border: none; border-top: 1px solid #2a2a2a; margin: 16px 0 }
        .md-preview li { color: #909090; margin: 3px 0; padding-left: 4px }
        .md-preview li.task { list-style: none; padding-left: 0 }
        .md-preview li.task.done { color: #4ade80 }
        .md-preview .ts { background: rgba(249,115,22,0.15); color: #f97316; padding: 1px 6px; border-radius: 3px; font-size: 0.8em; font-weight: 500 }
        .toolbar-btn { background: transparent; border: none; cursor: pointer; color: #555; padding: 3px 7px; border-radius: 4px; font-size: 11px; transition: all 0.1s; font-family: inherit }
        .toolbar-btn:hover { background: #2a2a2a; color: #f0f0f0 }
        .ai-panel { animation: fadeIn 0.2s ease }
        input[type=text], input[type=url] { outline: none }
      `}</style>

      {/* SIDEBAR */}
      {showSidebar && (
        <aside style={{ width: 280, minWidth: 280, background: "#161616", borderRight: "1px solid #1f1f1f", display: "flex", flexDirection: "column" }}>
          {/* Sidebar header */}
          <div style={{ padding: "12px", borderBottom: "1px solid #1f1f1f" }}>
            <div style={{ fontSize: 10, color: "#f97316", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8, fontWeight: 600 }}>
              ◈ Notes Vault
            </div>
            <div style={{ position: "relative" }}>
              <svg style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", width: 12, height: 12, color: "#444" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notes..."
                style={{ width: "100%", paddingLeft: 26, paddingRight: 8, paddingTop: 6, paddingBottom: 6, background: "#1a1a1a", border: "1px solid #232323", borderRadius: 6, color: "#ccc", fontSize: 11, boxSizing: "border-box" }}
              />
            </div>
          </div>

          {/* Tag filter */}
          {allTags.length > 0 && (
            <div style={{ padding: "8px 12px", borderBottom: "1px solid #1f1f1f", display: "flex", gap: 4, flexWrap: "wrap" }}>
              <button onClick={() => setFilterTag("")} className="tag-pill" style={{ fontSize: 10, padding: "2px 8px", borderRadius: 12, background: !filterTag ? "rgba(249,115,22,0.2)" : "#1e1e1e", color: !filterTag ? "#f97316" : "#555", border: "1px solid #2a2a2a", cursor: "pointer" }}>all</button>
              {allTags.map((t) => (
                <button key={t} onClick={() => setFilterTag(t === filterTag ? "" : t)} className="tag-pill" style={{ fontSize: 10, padding: "2px 8px", borderRadius: 12, background: filterTag === t ? "rgba(249,115,22,0.2)" : "#1e1e1e", color: filterTag === t ? "#f97316" : "#555", border: "1px solid #2a2a2a", cursor: "pointer" }}>
                  #{t}
                </button>
              ))}
            </div>
          )}

          <div style={{ padding: "6px 12px", fontSize: 9, color: "#333", textTransform: "uppercase", letterSpacing: "0.12em", borderBottom: "1px solid #1a1a1a" }}>
            {filteredNotes.length} note{filteredNotes.length !== 1 ? "s" : ""}
          </div>

          {/* Notes list */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {filteredNotes.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 16px" }}>
                <div style={{ fontSize: 28, opacity: 0.15, marginBottom: 8 }}>◈</div>
                <p style={{ fontSize: 11, color: "#333" }}>No notes yet</p>
              </div>
            ) : filteredNotes.map((note) => (
              <div key={note.id} className="note-item" style={{ borderLeft: `2px solid ${selectedNote?.id === note.id ? "#f97316" : "transparent"}`, cursor: "pointer", position: "relative" }}>
                <div onClick={() => selectNote(note)} style={{ padding: "10px 12px" }}>
                  <div style={{ fontSize: 11, color: selectedNote?.id === note.id ? "#f97316" : "#bbb", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 3 }}>
                    ▶ {note.videoTitle?.replace(/^https?:\/\//, "").slice(0, 36) || "Untitled"}
                  </div>
                  <div style={{ fontSize: 10, color: "#444", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 4 }}>
                    {note.content?.slice(0, 70) || "—"}
                  </div>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 3 }}>
                    {(note.tags || []).map((t) => (
                      <span key={t} style={{ fontSize: 9, color: "#f97316", background: "rgba(249,115,22,0.1)", padding: "1px 5px", borderRadius: 8 }}>#{t}</span>
                    ))}
                  </div>
                  <div style={{ fontSize: 9, color: "#2a2a2a" }}>{formatDate(note.updatedAt || note.createdAt)}</div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setConfirmDelete(note.id!); }}
                  style={{ position: "absolute", right: 8, top: 8, opacity: 0, background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 11, padding: 2, borderRadius: 3, transition: "all 0.1s" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; (e.currentTarget as HTMLElement).style.color = "#ef4444"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0"; }}
                >✕</button>
              </div>
            ))}
          </div>

          {/* Sidebar footer stats */}
          <div style={{ padding: "8px 12px", borderTop: "1px solid #1f1f1f", fontSize: 9, color: "#2f2f2f", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            {savedNotes.length} total · {allTags.length} tags
          </div>
        </aside>
      )}

      {/* MAIN */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>

        {/* TOP BAR */}
        <div style={{ background: "#161616", borderBottom: "1px solid #1f1f1f", padding: "0 12px", height: 44, display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {/* Toggle sidebar */}
          <button onClick={() => setShowSidebar(!showSidebar)} style={{ background: "none", border: "none", color: "#444", cursor: "pointer", padding: 4, borderRadius: 4, display: "flex" }}>
            <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div style={{ width: 1, height: 20, background: "#232323" }} />

          {/* URL input */}
          <input
            value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleLoadVideo(); }}
            placeholder="Paste YouTube URL and press Enter..."
            style={{ flex: 1, maxWidth: 480, padding: "5px 10px", background: "#1a1a1a", border: "1px solid #232323", borderRadius: 6, color: "#ccc", fontSize: 12, fontFamily: "inherit" }}
          />
          <button onClick={handleLoadVideo} style={{ padding: "5px 14px", background: "#f97316", border: "none", borderRadius: 6, color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer", letterSpacing: "0.05em" }}>
            LOAD
          </button>
          {embedUrl && (
            <button onClick={clearWorkspace} style={{ padding: "5px 8px", background: "transparent", border: "1px solid #333", borderRadius: 6, color: "#666", fontSize: 13, cursor: "pointer", lineHeight: 1, display: "flex", alignItems: "center", transition: "all 0.15s" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#ef4444"; (e.currentTarget as HTMLElement).style.borderColor = "#ef4444"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#666"; (e.currentTarget as HTMLElement).style.borderColor = "#333"; }}
              title="Clear video">
              ✕
            </button>
          )}

          <div style={{ flex: 1 }} />

          {/* Right actions */}
          <button onClick={() => setShowShortcuts(!showShortcuts)} style={{ background: "none", border: "1px solid #232323", borderRadius: 4, color: "#444", cursor: "pointer", fontSize: 10, padding: "3px 8px" }}>⌘</button>
          <button onClick={copyNote} title="Copy notes" style={{ background: "none", border: "1px solid #232323", borderRadius: 4, color: "#444", cursor: "pointer", fontSize: 10, padding: "3px 8px" }}>COPY</button>
          <button onClick={exportNote} title="Export .md (Ctrl+E)" style={{ background: "none", border: "1px solid #232323", borderRadius: 4, color: "#444", cursor: "pointer", fontSize: 10, padding: "3px 8px" }}>.MD</button>
          <button onClick={exportPdf} title="Print/PDF" style={{ background: "none", border: "1px solid #232323", borderRadius: 4, color: "#444", cursor: "pointer", fontSize: 10, padding: "3px 8px" }}>PDF</button>
        </div>

        {/* SHORTCUTS PANEL */}
        {showShortcuts && (
          <div style={{ background: "#161616", borderBottom: "1px solid #1f1f1f", padding: "8px 16px", display: "flex", gap: 20, flexWrap: "wrap" }}>
            {[["Ctrl+B", "Bold"], ["Ctrl+I", "Italic"], ["Ctrl+S", "Save"], ["Ctrl+E", "Export"]].map(([k, v]) => (
              <span key={k} style={{ fontSize: 10, color: "#444" }}>
                <span style={{ color: "#f97316", marginRight: 4 }}>{k}</span>{v}
              </span>
            ))}
          </div>
        )}

        {/* WORKSPACE */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>

          {/* VIDEO PANE */}
          <div style={{ width: embedUrl ? `${videoRatio}%` : "100%", flexShrink: 0, background: "#0d0d0d", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {embedUrl ? (
              <iframe src={embedUrl} style={{ flex: 1, width: "100%", border: "none" }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            ) : (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <div style={{ fontSize: 32, opacity: 0.08 }}>▶</div>
                <p style={{ fontSize: 11, color: "#2a2a2a" }}>Paste a YouTube URL above</p>
              </div>
            )}
          </div>

          {/* DRAG HANDLE */}
          {embedUrl && (
            <div onMouseDown={handleMouseDown} style={{ width: 4, cursor: "col-resize", background: "#1a1a1a", flexShrink: 0, position: "relative", transition: "background 0.15s" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#f97316"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#1a1a1a"; }}>
              <div style={{ position: "absolute", inset: "0 -3px" }} />
            </div>
          )}

          {/* NOTES PANE */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>

            {/* Notes toolbar */}
            <div style={{ background: "#161616", borderBottom: "1px solid #1a1a1a", padding: "4px 8px", display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap", flexShrink: 0 }}>
              {TOOLBAR_BTNS.map((btn, i) => (
                <button key={i} className="toolbar-btn" onClick={() => insertAtCursor(btn.action, btn.after)} title={btn.title}
                  style={{ fontStyle: btn.label === "I" ? "italic" : undefined, fontWeight: ["B", "H1", "H2", "H3"].includes(btn.label) ? 600 : undefined }}>
                  {btn.label}
                </button>
              ))}
              <div style={{ width: 1, height: 14, background: "#2a2a2a", margin: "0 2px" }} />

              {/* Panel mode */}
              {(["edit", "preview", "split"] as PanelMode[]).map((m) => (
                <button key={m} className="toolbar-btn" onClick={() => setPanelMode(m)} style={{ color: panelMode === m ? "#f97316" : undefined, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.05em" }}>{m}</button>
              ))}

              <div style={{ flex: 1 }} />

              {/* Font size */}
              <button className="toolbar-btn" onClick={() => setFontSize((s) => Math.max(10, s - 1))} title="Decrease font">A-</button>
              <span style={{ fontSize: 9, color: "#333", minWidth: 20, textAlign: "center" }}>{fontSize}</span>
              <button className="toolbar-btn" onClick={() => setFontSize((s) => Math.min(18, s + 1))} title="Increase font">A+</button>

              <button className="toolbar-btn" onClick={() => setWordWrap((w) => !w)} style={{ color: wordWrap ? "#f97316" : undefined }} title="Toggle word wrap">↩</button>

              {/* AI */}
              <button className="toolbar-btn" onClick={summarizeWithAI} style={{ color: "#f97316", fontSize: 9, letterSpacing: "0.05em" }} title="AI summarize">
                {summarizing ? "AI..." : "✦ AI"}
              </button>

              <div style={{ width: 1, height: 14, background: "#2a2a2a", margin: "0 2px" }} />

              <span style={{ fontSize: 9, color: saving ? "#f97316" : "#2a2a2a", marginRight: 4 }}>
                {saving ? "● saving" : viewMode ? "read-only" : "● auto"}
              </span>
              <span style={{ fontSize: 9, color: "#2a2a2a" }}>{wordCount}w {charCount}c</span>
            </div>

            {/* AI Panel */}
            {showAiPanel && (
              <div className="ai-panel" style={{ background: "#111", borderBottom: "1px solid #1f1f1f", padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 10, color: "#f97316", fontWeight: 600, letterSpacing: "0.1em" }}>✦ AI SUMMARY</span>
                  <button onClick={() => setShowAiPanel(false)} style={{ background: "none", border: "none", color: "#333", cursor: "pointer", fontSize: 12 }}>✕</button>
                </div>
                {summarizing ? (
                  <div style={{ fontSize: 11, color: "#444", fontStyle: "italic" }}>Generating summary...</div>
                ) : (
                  <div style={{ fontSize: 11, color: "#888", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{aiSummary}</div>
                )}
                <div style={{ marginTop: 12, display: "flex", gap: 6 }}>
                  <input value={aiQuestion} onChange={(e) => setAiQuestion(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") askAI(); }}
                    placeholder="Ask AI about your notes..."
                    style={{ flex: 1, padding: "5px 8px", background: "#1a1a1a", border: "1px solid #232323", borderRadius: 4, color: "#ccc", fontSize: 11, fontFamily: "inherit" }} />
                  <button onClick={askAI} style={{ padding: "5px 10px", background: "rgba(249,115,22,0.15)", border: "1px solid rgba(249,115,22,0.3)", borderRadius: 4, color: "#f97316", fontSize: 10, cursor: "pointer" }}>
                    {askingAi ? "..." : "ASK"}
                  </button>
                </div>
                {aiAnswer && <div style={{ marginTop: 8, fontSize: 11, color: "#777", lineHeight: 1.7, borderLeft: "2px solid #f97316", paddingLeft: 8 }}>{aiAnswer}</div>}
              </div>
            )}

            {/* Tags bar */}
            {embedUrl && (
              <div style={{ background: "#141414", borderBottom: "1px solid #1a1a1a", padding: "5px 10px", display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", flexShrink: 0 }}>
                <span style={{ fontSize: 9, color: "#333", textTransform: "uppercase" }}>tags:</span>
                {tags.map((t) => (
                  <span key={t} style={{ fontSize: 9, color: "#f97316", background: "rgba(249,115,22,0.1)", padding: "2px 6px", borderRadius: 8, display: "flex", alignItems: "center", gap: 3 }}>
                    #{t}
                    <button onClick={() => removeTag(t)} style={{ background: "none", border: "none", color: "#f97316", cursor: "pointer", padding: 0, fontSize: 9, lineHeight: 1 }}>×</button>
                  </span>
                ))}
                <input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); } }}
                  placeholder="add tag..."
                  style={{ fontSize: 10, color: "#555", background: "transparent", border: "none", outline: "none", width: 70, fontFamily: "inherit" }} />
              </div>
            )}

            {/* Editor / Preview */}
            <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
              {/* Editor */}
              {(panelMode === "edit" || panelMode === "split") && (
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  readOnly={viewMode}
                  placeholder={"Start taking notes...\n\nMarkdown supported — use the toolbar above\nor keyboard shortcuts (⌘ to view)"}
                  style={{
                    flex: 1, padding: "16px", background: "#141414", color: "#888",
                    fontSize, fontFamily: "'JetBrains Mono', monospace",
                    lineHeight: 1.7, resize: "none", border: "none", outline: "none",
                    whiteSpace: wordWrap ? "pre-wrap" : "pre",
                    overflowX: wordWrap ? "hidden" : "auto",
                    borderRight: panelMode === "split" ? "1px solid #1a1a1a" : undefined,
                    caretColor: "#f97316",
                  }}
                />
              )}

              {/* Preview */}
              {(panelMode === "preview" || panelMode === "split") && (
                <div className="md-preview" style={{ flex: 1, padding: "16px", overflowY: "auto", fontSize: fontSize - 1, fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1.7 }}
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(content) || '<p style="color:#333">Preview will appear here...</p>' }} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* DELETE MODAL */}
      {confirmDelete && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={() => setConfirmDelete(null)}>
          <div style={{ background: "#161616", border: "1px solid #2a2a2a", borderRadius: 12, padding: 24, width: 280, boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}
            onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 11, color: "#f97316", marginBottom: 8, fontWeight: 600 }}>DELETE NOTE</div>
            <p style={{ fontSize: 12, color: "#666", marginBottom: 20 }}>This action cannot be undone.</p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button onClick={() => setConfirmDelete(null)} style={{ padding: "6px 14px", background: "none", border: "1px solid #232323", borderRadius: 6, color: "#555", cursor: "pointer", fontSize: 11 }}>Cancel</button>
              <button onClick={() => deleteNote(confirmDelete)} style={{ padding: "6px 14px", background: "#ef4444", border: "none", borderRadius: 6, color: "#fff", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
