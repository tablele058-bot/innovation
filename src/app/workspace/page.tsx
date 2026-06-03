"use client";

import Link from "next/link";

const workspaces = [
  {
    title: "YouTube",
    href: "/workspace/youtube",
    desc: "Take notes while watching videos with auto-save",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    gradient: "from-red-500 to-red-600",
    bgGlow: "bg-red-500/5",
    borderHover: "group-hover:border-red-500/40",
    iconBg: "bg-red-500/10 group-hover:bg-red-500/20",
    iconColor: "text-red-400",
  },
  {
    title: "Coding",
    href: "/workspace/coding",
    desc: "Write and edit code with Monaco editor & GitHub sync",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    gradient: "from-blue-500 to-cyan-600",
    bgGlow: "bg-blue-500/5",
    borderHover: "group-hover:border-blue-500/40",
    iconBg: "bg-blue-500/10 group-hover:bg-blue-500/20",
    iconColor: "text-blue-400",
  },
  {
    title: "Attendance",
    href: "/attendance",
    desc: "Track your daily attendance with calendar view",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    gradient: "from-emerald-500 to-teal-600",
    bgGlow: "bg-emerald-500/5",
    borderHover: "group-hover:border-emerald-500/40",
    iconBg: "bg-emerald-500/10 group-hover:bg-emerald-500/20",
    iconColor: "text-emerald-400",
  },
  {
    title: "Web Builder",
    href: "/workspace/web-builder",
    desc: "Build websites with AI prompts & live preview",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    gradient: "from-purple-500 to-pink-600",
    bgGlow: "bg-purple-500/5",
    borderHover: "group-hover:border-purple-500/40",
    iconBg: "bg-purple-500/10 group-hover:bg-purple-500/20",
    iconColor: "text-purple-400",
  },
  {
    title: "easier.io",
    href: "/workspace/easier-io",
    desc: "Diagramming & whiteboarding with Eraser.io-style UI",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    gradient: "from-violet-500 to-cyan-400",
    bgGlow: "bg-violet-500/5",
    borderHover: "group-hover:border-violet-500/40",
    iconBg: "bg-violet-500/10 group-hover:bg-violet-500/20",
    iconColor: "text-violet-400",
  },
  {
    title: "AI Book",
    href: "/workspace/ai-book",
    desc: "AI-powered kids story generator with images & narration",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    gradient: "from-purple-500 to-pink-600",
    bgGlow: "bg-purple-500/5",
    borderHover: "group-hover:border-purple-500/40",
    iconBg: "bg-purple-500/10 group-hover:bg-purple-500/20",
    iconColor: "text-purple-400",
  },
  {
    title: "canva.io",
    href: "/workspace/canva",
    desc: "Full-stack Canva clone design tool with Fabric.js",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    gradient: "from-pink-500 to-purple-600",
    bgGlow: "bg-pink-500/5",
    borderHover: "group-hover:border-pink-500/40",
    iconBg: "bg-pink-500/10 group-hover:bg-pink-500/20",
    iconColor: "text-pink-400",
  },
  {
    title: "Startup Board",
    href: "/workspace/startup-board",
    desc: "Pinterest-style board for elite startup content — save, organize, and discover",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
    gradient: "from-amber-500 to-orange-600",
    bgGlow: "bg-amber-500/5",
    borderHover: "group-hover:border-amber-500/40",
    iconBg: "bg-amber-500/10 group-hover:bg-amber-500/20",
    iconColor: "text-amber-400",
  },
];

export default function WorkspaceHome() {
  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] p-8">
      <div className="mb-8">
        <h1 className="text-lg font-semibold text-gray-200">Workspace</h1>
        <p className="text-xs text-gray-500 mt-1">Choose a workspace to get started</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {workspaces.map((ws) => (
          <Link
            key={ws.href}
            href={ws.href}
            className={`group relative p-6 rounded-xl bg-[#252526] border border-[#3c3c3c] ${ws.borderHover} transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl ${ws.iconBg} ${ws.iconColor} flex items-center justify-center transition-all duration-300 shrink-0`}>
                {ws.icon}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${ws.gradient}`} />
                  <h3 className="text-sm font-semibold text-gray-200">{ws.title}</h3>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{ws.desc}</p>
              </div>
            </div>
            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
