"use client";

import { useState, useCallback, useEffect, useRef } from "react";

interface FileNode {
  name: string;
  path: string;
  type: "file" | "folder";
  children?: FileNode[];
  content?: string;
  language?: string;
}

interface Project {
  id: number;
  name: string;
  repoName: string;
  files: FileNode[];
}

const LANG_MAP: Record<string, string> = {
  js: "javascript", ts: "typescript", tsx: "typescript", jsx: "javascript",
  py: "python", rs: "rust", go: "go", java: "java", c: "c", cpp: "cpp",
  html: "html", css: "css", json: "json", md: "markdown",
  sql: "sql", yml: "yaml", yaml: "yaml", toml: "toml",
  sh: "shell", bash: "shell", txt: "plaintext", zig: "zig",
};

const FILE_ICONS: Record<string, string> = {
  js: "🟨", ts: "🟦", tsx: "⚛️", jsx: "⚛️",
  py: "🐍", rs: "🦀", go: "🔷", java: "☕", c: "⚙️", cpp: "⚙️",
  html: "🌐", css: "🎨", json: "📋", md: "📝",
  sql: "🗃️", yml: "⚙️", yaml: "⚙️", toml: "⚙️",
  sh: "💻", bash: "💻", gitignore: "🙈",
  env: "🔒", lock: "🔒", txt: "📄", zig: "⚡"
};

const STORAGE_KEY = "coding_workspace_projects";

function loadProjects(): Project[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveProjects(projects: Project[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch { /* noop */ }
}

function getLanguage(filename: string): string {
  const ext = filename.split(".").pop() || "";
  return LANG_MAP[ext] || "plaintext";
}

function getFileIcon(name: string): string {
  if (!name) return "📄";
  const ext = name.split(".").pop()?.toLowerCase() || "";
  if (name === ".gitignore") return FILE_ICONS.gitignore;
  if (name.startsWith(".env")) return FILE_ICONS.env;
  if (name === "package-lock.json" || name === "yarn.lock") return FILE_ICONS.lock;
  return FILE_ICONS[ext] || "📄";
}

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [fileContent, setFileContent] = useState("");
  const [projectName, setProjectName] = useState("");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState("");
  const [cursorPos, setCursorPos] = useState({ ln: 1, col: 1 });
  const messageTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [contextMenu, setContextMenu] = useState<{
    x: number; y: number; targetPath: string; targetType: "file" | "folder"; targetName: string;
  } | null>(null);

  const [renamingPath, setRenamingPath] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);

  const [modal, setModal] = useState<{
    type: "createFile" | "createFolder" | "delete";
    path: string;
  } | null>(null);
  const [modalInput, setModalInput] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = loadProjects();
    if (stored.length > 0) {
      setProjects(stored);
      setCurrentProject(stored[0]);
    } else {
      const empty: Project = { id: Date.now(), name: "untitled", repoName: "untitled", files: [] };
      setProjects([empty]);
      setCurrentProject(empty);
      saveProjects([empty]);
    }
  }, []);

  useEffect(() => {
    if (projects.length > 0) saveProjects(projects);
  }, [projects]);

  useEffect(() => {
    if (renamingPath && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingPath]);

  useEffect(() => {
    if (!contextMenu) return;
    const close = () => setContextMenu(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [contextMenu]);

  const persistCurrent = useCallback((proj: Project) => {
    setProjects(prev => prev.map(p => p.id === proj.id ? proj : p));
  }, []);

  const saveFile = useCallback(() => {
    if (!currentProject || !selectedFile) return;

    const updateTree = (nodes: FileNode[]): FileNode[] =>
      nodes.map((n) => {
        if (n.path === selectedFile.path) return { ...n, content: fileContent };
        if (n.children) return { ...n, children: updateTree(n.children) };
        return n;
      });

    const updatedFiles = updateTree(currentProject.files || []);
    const updatedProj = { ...currentProject, files: updatedFiles };

    setCurrentProject(updatedProj);
    persistCurrent(updatedProj);
    showMessage("Saved");
  }, [currentProject, selectedFile, fileContent, persistCurrent]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        saveFile();
      }
      if (e.key === "Escape") {
        setContextMenu(null);
        setRenamingPath(null);
        setModal(null);
        setModalInput("");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [saveFile]);

  const showMessage = (msg: string) => {
    setMessage(msg);
    if (messageTimeout.current) clearTimeout(messageTimeout.current);
    messageTimeout.current = setTimeout(() => setMessage(""), 2000);
  };

  const createProject = () => {
    if (!projectName.trim()) return;
    const proj: Project = {
      id: Date.now(),
      name: projectName.trim(),
      repoName: projectName.trim().toLowerCase().replace(/\s+/g, "-"),
      files: []
    };
    setProjects(prev => [...prev, proj]);
    setCurrentProject(proj);
    setSelectedFile(null);
    setFileContent("");
    setProjectName("");
    showMessage("Project created");
  };

  const loadProject = (project: Project) => {
    setCurrentProject(project);
    if (project.files && project.files.length > 0) {
      const firstFile = project.files[0].type === "folder" && project.files[0].children?.length 
        ? project.files[0].children[0] 
        : project.files[0];
      setSelectedFile(firstFile);
      setFileContent(firstFile.content || "");
    } else {
      setSelectedFile(null);
      setFileContent("");
    }
  };

  const selectFile = (file: FileNode) => {
    setSelectedFile(file);
    setFileContent(file.content || "");
    setCursorPos({ ln: 1, col: 1 });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFileContent(e.target.value);
    updateCursorInfo(e.target);
  };

  const handleScroll = () => {
    if (textareaRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const ta = e.currentTarget;
    if (e.key === "Tab") {
      e.preventDefault();
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const updatedValue = fileContent.substring(0, start) + "  " + fileContent.substring(end);
      setFileContent(updatedValue);
      setTimeout(() => {
        ta.selectionStart = ta.selectionEnd = start + 2;
      }, 0);
    }

    const autoPairs: Record<string, string> = {
      "{": "}", "(": ")", "[": "]", '"': '"', "'": "'", "`": "`"
    };

    if (autoPairs[e.key] !== undefined) {
      e.preventDefault();
      const pair = autoPairs[e.key];
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const updatedValue = fileContent.substring(0, start) + e.key + pair + fileContent.substring(end);
      setFileContent(updatedValue);
      setTimeout(() => {
        ta.selectionStart = ta.selectionEnd = start + 1;
      }, 0);
    }
  };

  const updateCursorInfo = (target: HTMLTextAreaElement) => {
    const textBeforeCursor = target.value.substring(0, target.selectionStart);
    const lines = textBeforeCursor.split("\n");
    setCursorPos({
      ln: lines.length,
      col: lines[lines.length - 1].length + 1
    });
  };

  const addNodeToTree = (parentPath: string, name: string, type: "file" | "folder") => {
    if (!currentProject || !name.trim()) return;

    const hasDuplicate = (nodes: FileNode[]): boolean =>
      nodes.some((n) => n.name === name);

    const addToTree = (nodes: FileNode[], pp: string): FileNode[] => {
      if (pp === "") {
        if (hasDuplicate(nodes)) return nodes;
        const newItem: FileNode = type === "folder"
          ? { name, path: name, type: "folder", children: [] }
          : { name, path: name, type: "file", content: "", language: getLanguage(name) };
        return [...nodes, newItem];
      }
      return nodes.map((n) => {
        if (n.path === pp && n.children) {
          if (hasDuplicate(n.children)) return n;
          const childPath = `${pp}/${name}`;
          const newItem: FileNode = type === "folder"
            ? { name, path: childPath, type: "folder", children: [] }
            : { name, path: childPath, type: "file", content: "", language: getLanguage(name) };
          return { ...n, children: [...n.children, newItem] };
        }
        if (n.children) return { ...n, children: addToTree(n.children, pp) };
        return n;
      });
    };

    const updatedFiles = addToTree(currentProject.files || [], parentPath);
    const updatedProj = { ...currentProject, files: updatedFiles };
    setCurrentProject(updatedProj);
    setProjects(prev => prev.map(p => p.id === currentProject.id ? updatedProj : p));

    if (parentPath) {
      setExpandedFolders((prev) => {
        const next = new Set(prev);
        next.add(parentPath);
        return next;
      });
    }
    showMessage(`${type === "file" ? "File" : "Folder"} deployed successfully`);
  };

  const deleteNodeFromTree = (targetPath: string) => {
    if (!currentProject) return;
    const removeFromTree = (nodes: FileNode[]): FileNode[] =>
      nodes
        .filter((n) => n.path !== targetPath)
        .map((n) =>
          n.children ? { ...n, children: removeFromTree(n.children) } : n
        );

    const updatedFiles = removeFromTree(currentProject.files || []);
    const updatedProj = { ...currentProject, files: updatedFiles };
    setCurrentProject(updatedProj);
    setProjects(prev => prev.map(p => p.id === currentProject.id ? updatedProj : p));

    if (selectedFile?.path === targetPath || selectedFile?.path.startsWith(targetPath + "/")) {
      setSelectedFile(null);
      setFileContent("");
    }
    showMessage("Node removed");
  };

  const renameNodeInTree = (targetPath: string, newName: string) => {
    if (!currentProject || !newName.trim()) return;
    const parentPath = targetPath.includes("/") ? targetPath.slice(0, targetPath.lastIndexOf("/")) : "";

    const renameInTree = (nodes: FileNode[]): FileNode[] =>
      nodes.map((n) => {
        if (n.path === targetPath) {
          const newPath = parentPath ? `${parentPath}/${newName}` : newName;
          const updated = { ...n, name: newName, path: newPath };
          if (n.children) {
            updated.children = n.children.map((child) => renameChildrenPaths(child, n.path, newPath));
          }
          return updated;
        }
        if (n.children) return { ...n, children: renameInTree(n.children) };
        return n;
      });

    const renameChildrenPaths = (node: FileNode, oldBase: string, newBase: string): FileNode => {
      const newPath = node.path.replace(oldBase, newBase);
      const updated = { ...node, path: newPath };
      if (node.children) {
        updated.children = node.children.map((child) => renameChildrenPaths(child, oldBase, newBase));
      }
      return updated;
    };

    const updatedFiles = renameInTree(currentProject.files || []);
    const updatedProj = { ...currentProject, files: updatedFiles };
    setCurrentProject(updatedProj);
    setProjects(prev => prev.map(p => p.id === currentProject.id ? updatedProj : p));

    const newPath = parentPath ? `${parentPath}/${newName}` : newName;
    if (selectedFile?.path === targetPath) {
      setSelectedFile({ ...selectedFile, name: newName, path: newPath });
    }
    showMessage("VFS Reference updated");
  };

  const handleContextMenu = (e: React.MouseEvent, node: FileNode) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      targetPath: node.path,
      targetType: node.type,
      targetName: node.name,
    });
  };

  const handleRenameSubmit = (path: string) => {
    if (renameValue.trim() && renameValue !== path.split("/").pop()) {
      renameNodeInTree(path, renameValue.trim());
    }
    setRenamingPath(null);
    setRenameValue("");
  };

  const renderFileTree = (nodes: FileNode[], parentPath = "") => {
    const sorted = [...nodes].sort((a, b) => {
      if (!a || !b) return 0;
      if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
      return (a.name || "").localeCompare(b.name || "");
    });

    return sorted.map((node) => {
      const fullPath = node.path;
      const isExpanded = expandedFolders.has(fullPath);
      const isRenaming = renamingPath === fullPath;
      const isSelected = selectedFile?.path === fullPath;

      if (node.type === "folder") {
        return (
          <div key={fullPath}>
            <div
              onContextMenu={(e) => handleContextMenu(e, node)}
              className={`group flex items-center gap-1.5 px-2 py-1 text-xs cursor-pointer select-none rounded mb-0.5 transition-colors ${
                isSelected ? "bg-indigo-500/10 text-indigo-400 font-medium" : "text-gray-400 hover:bg-[#0e0e0e] hover:text-gray-200"
              }`}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedFolders((prev) => {
                    const next = new Set(prev);
                    isExpanded ? next.delete(fullPath) : next.add(fullPath);
                    return next;
                  });
                }}
                className="w-3 text-center flex-shrink-0 text-[8px] text-gray-300 hover:text-white"
              >
                {isExpanded ? "▼" : "▶"}
              </button>
              <span className="flex-shrink-0 text-xs">{isExpanded ? "📂" : "📁"}</span>
              {isRenaming ? (
                <input
                  ref={renameInputRef}
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={() => handleRenameSubmit(fullPath)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRenameSubmit(fullPath);
                    if (e.key === "Escape") setRenamingPath(null);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 px-1 bg-[#060606] border border-indigo-500 rounded text-white text-xs outline-none"
                />
              ) : (
                <span
                  className="flex-1 truncate pl-0.5"
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setRenamingPath(fullPath);
                    setRenameValue(node.name);
                  }}
                >
                  {node.name}
                </span>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setModal({ type: "createFile", path: fullPath });
                }}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-indigo-400 px-1 text-xs font-bold"
                title="Create Internal File"
              >
                ＋
              </button>
            </div>
            {isExpanded && node.children && (
              <div className="pl-3 border-l border-gray-800 ml-2 my-0.5">
                {renderFileTree(node.children, fullPath)}
              </div>
            )}
          </div>
        );
      }

      return (
        <div
          key={fullPath}
          onContextMenu={(e) => handleContextMenu(e, node)}
          onClick={() => selectFile(node)}
          className={`group flex items-center gap-2 px-2 py-1 text-xs cursor-pointer select-none rounded mb-0.5 transition-colors ${
            isSelected ? "bg-indigo-500/15 text-indigo-400 font-medium" : "text-gray-400 hover:bg-[#0e0e0e] hover:text-gray-200"
          }`}
        >
          <span className="w-3 flex-shrink-0 text-center pl-0.5">
            {getFileIcon(node.name)}
          </span>
          {isRenaming ? (
            <input
              ref={renameInputRef}
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={() => handleRenameSubmit(fullPath)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRenameSubmit(fullPath);
                if (e.key === "Escape") setRenamingPath(null);
              }}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 px-1 bg-[#060606] border border-indigo-500 rounded text-white text-xs outline-none"
            />
          ) : (
            <span
              className="flex-1 truncate"
              onDoubleClick={(e) => {
                e.stopPropagation();
                setRenamingPath(fullPath);
                setRenameValue(node.name);
              }}
            >
              {node.name}
            </span>
          )}
        </div>
      );
    });
  };

  const totalLines = fileContent.split("\n").length;
  const lineNumbers = Array.from({ length: totalLines }, (_, idx) => idx + 1);

  return (
    <div className="h-full flex bg-black overflow-hidden text-gray-200 font-sans antialiased selection:bg-indigo-500/30">
      
      {/* Dynamic Action Modals */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm"
          onClick={() => { setModal(null); setModalInput(""); }}
        >
          <div
            className="bg-[#080808] border border-[#1a1a1a] rounded-xl shadow-2xl w-80 p-5"
            onClick={(e) => e.stopPropagation()}
          >
            {modal.type !== "delete" ? (
              <>
                <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider mb-1">
                  Create New {modal.type === "createFile" ? "File" : "Folder"}
                </h3>
                <p className="text-[10px] text-gray-300 mb-3 truncate">
                  Target Destination: <span className="font-mono text-gray-400">{modal.path || "root"}</span>
                </p>
                <input
                  autoFocus
                  type="text"
                  value={modalInput}
                  onChange={(e) => setModalInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && modalInput.trim()) {
                      addNodeToTree(modal.path, modalInput.trim(), modal.type === "createFile" ? "file" : "folder");
                      setModal(null);
                      setModalInput("");
                    }
                    if (e.key === "Escape") {
                      setModal(null);
                      setModalInput("");
                    }
                  }}
                  placeholder={modal.type === "createFile" ? "index.js" : "components"}
                  className="w-full px-3 py-2 bg-black border border-[#222222] rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 mb-4"
                />
                <div className="flex justify-end gap-2 text-xs">
                  <button
                    onClick={() => { setModal(null); setModalInput(""); }}
                    className="px-3 py-1.5 text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (modalInput.trim()) {
                        addNodeToTree(modal.path, modalInput.trim(), modal.type === "createFile" ? "file" : "folder");
                        setModal(null);
                        setModalInput("");
                      }
                    }}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Confirm Create
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">Destructive Deletion</h3>
                <p className="text-xs text-gray-300 mb-3">
                  Confirm absolute purging of targeted node structure:
                </p>
                <div className="text-xs text-white bg-red-950/20 border border-red-900/40 px-3 py-2 rounded-lg font-mono mb-4 break-all">
                  {modal.path.split("/").pop()}
                </div>
                <div className="flex justify-end gap-2 text-xs">
                  <button
                    onClick={() => setModal(null)}
                    className="px-3 py-1.5 text-gray-400 hover:text-white"
                  >
                    Abstain
                  </button>
                  <button
                    onClick={() => {
                      deleteNodeFromTree(modal.path);
                      setModal(null);
                    }}
                    className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                  >
                    Execute Purge
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Workspace Context Actions Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 w-44 py-1 bg-[#080808] border border-[#1a1a1a] rounded-lg shadow-2xl text-xs"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => { setModal({ type: "createFile", path: contextMenu.targetPath }); setContextMenu(null); }}
            className="w-full text-left px-3 py-2 text-gray-300 hover:bg-indigo-600/20 hover:text-white flex items-center gap-2"
          >
            <span>📄</span> New File
          </button>
          <button
            onClick={() => { setModal({ type: "createFolder", path: contextMenu.targetPath }); setContextMenu(null); }}
            className="w-full text-left px-3 py-2 text-gray-300 hover:bg-indigo-600/20 hover:text-white flex items-center gap-2"
          >
            <span>📁</span> New Folder
          </button>
          <div className="border-t border-[#1a1a1a] my-1" />
          <button
            onClick={() => { setRenamingPath(contextMenu.targetPath); setRenameValue(contextMenu.targetName); setContextMenu(null); }}
            className="w-full text-left px-3 py-2 text-gray-300 hover:bg-indigo-600/20 hover:text-white flex items-center gap-2"
          >
            <span>✏️</span> Inline Rename
          </button>
          <button
            onClick={() => { setModal({ type: "delete", path: contextMenu.targetPath }); setContextMenu(null); }}
            className="w-full text-left px-3 py-2 text-red-400 hover:bg-red-950/30 flex items-center gap-2"
          >
            <span>🗑️</span> Remove Node
          </button>
        </div>
      )}

      {/* File Explorer Sidebar */}
      <aside className="w-56 bg-[#080808] border-r border-[#181818] flex flex-col flex-shrink-0">
        <div className="p-3 border-b border-[#181818] bg-[#080808]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Projects</span>
          </div>
          <div className="flex items-center gap-1.5 mb-2">
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") createProject(); }}
              placeholder="Deploy project scope..."
              className="flex-1 min-w-0 px-2 py-1.5 bg-black border border-[#181818] rounded text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={createProject}
              className="p-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors flex items-center justify-center font-bold flex-shrink-0"
              title="Instantiate Scope"
            >
              ＋
            </button>
          </div>
          <div className="space-y-0.5 max-h-28 overflow-y-auto pr-1">
            {projects.map((p) => (
              <button
                key={p.id}
                onClick={() => loadProject(p)}
                className={`w-full text-left px-2 py-1 rounded text-xs truncate flex items-center gap-1.5 transition-all ${
                  currentProject?.id === p.id ? "bg-indigo-500/10 text-indigo-400 font-medium" : "text-gray-300 hover:text-white"
                }`}
              >
                <span>📦</span> <span className="truncate">{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        {currentProject ? (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between px-3 py-1.5 bg-[#060606] border-b border-[#181818]">
              <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">VFS Tree Explorer</span>
              <div className="flex gap-1">
                <button onClick={() => setModal({ type: "createFile", path: "" })} className="p-0.5 text-gray-300 hover:text-white text-xs">📄</button>
                <button onClick={() => setModal({ type: "createFolder", path: "" })} className="p-0.5 text-gray-300 hover:text-white text-xs">📁</button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-1.5 font-mono">
              {renderFileTree(currentProject.files || [])}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-4 text-center">
            <p className="text-[11px] text-gray-400">No context loaded</p>
          </div>
        )}
      </aside>

      {/* Primary Code Canvas Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-black">
        {selectedFile ? (
          <>
            {/* Minimal High-Density Header Panel */}
            <div className="flex items-center justify-between px-4 py-1.5 bg-[#080808] border-b border-[#181818]">
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs">{getFileIcon(selectedFile.name)}</span>
                  <span className="text-xs text-gray-200 font-mono font-medium truncate">{selectedFile.name}</span>
                </div>
                <span className="text-[9px] text-gray-400 font-mono truncate">
                  {currentProject?.name} / {selectedFile.path}
                </span>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {message && <span className="text-[11px] text-indigo-400 font-medium font-mono">{message}</span>}
                <span className="text-[9px] text-gray-300 bg-[#0a0a0a] px-1.5 py-0.5 rounded border border-[#1a1a1a] font-mono uppercase">
                  {selectedFile.language || getLanguage(selectedFile.name)}
                </span>
                <button
                  onClick={saveFile}
                  className="px-3 py-1 bg-indigo-600 text-white rounded text-xs font-medium hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-1"
                  title="Hotkey: Ctrl + S / Cmd + S"
                >
                  <span>💾</span> Save
                </button>
              </div>
            </div>

            {/* Maximized Workspace Textarea Frame */}
            <div className="flex-1 min-h-0 flex bg-black overflow-hidden relative">
              {/* Core Synchronized Gutter Line Panel */}
              <div 
                ref={gutterRef}
                className="w-10 bg-black text-[#88889a] py-2 text-right pr-2.5 font-mono text-xs select-none overflow-y-auto border-r border-[#1a1a1a]/60 flex flex-col flex-shrink-0 scrollbar-none"
                style={{ scrollbarWidth: 'none' }}
              >
                {lineNumbers.map((line) => (
                  <div 
                    key={line} 
                    className="h-5 leading-5"
                    style={{ color: cursorPos.ln === line ? "#818cf8" : undefined, backgroundColor: cursorPos.ln === line ? "#4f46e5/10" : undefined }}
                  >
                    {line}
                  </div>
                ))}
              </div>

              {/* Seamless Input Canvas Area */}
              <textarea
                ref={textareaRef}
                value={fileContent}
                onChange={handleFileChange}
                onScroll={handleScroll}
                onKeyDown={handleKeyDown}
                onKeyUp={(e) => updateCursorInfo(e.currentTarget)}
                onMouseUp={(e) => updateCursorInfo(e.currentTarget)}
                className="flex-1 bg-transparent text-[#d4d4d8] py-2 px-3 font-mono text-xs outline-none resize-none overflow-auto whitespace-pre h-full w-full leading-5 border-none tracking-normal"
                style={{ 
                  tabSize: 2, 
                  MozTabSize: 2,
                  caretColor: "#6366f1",
                  fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace" 
                }}
                spellCheck="false"
                placeholder="Start typing..."
              />
            </div>

            {/* Bottom Status Bar */}
            <div className="h-5 bg-[#080808] border-t border-[#181818] flex items-center justify-between px-3 text-[9px] text-gray-300 font-mono select-none flex-shrink-0">
              <div className="flex items-center gap-2 truncate">
                <span className="font-bold text-indigo-400">● VFS_READY</span>
                <span className="opacity-30">|</span>
                <span className="truncate">{currentProject?.name}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span>{selectedFile.name} — {totalLines} lines</span>
                <span className="opacity-30">|</span>
                <span>Ln {cursorPos.ln}, Col {cursorPos.col}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center bg-black">
            <div className="text-center max-w-xs px-4">
              <div className="text-4xl mb-2 opacity-30">💻</div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">No file open</h3>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Right-click in the sidebar to create a new file or folder.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}