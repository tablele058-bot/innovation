"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const menuItems = [
  {
    label: "YouTube Workspace",
    href: "/workspace/youtube",
    icon: (active: boolean) => (
      <svg className={`w-4 h-4 ${active ? "text-orange-400" : "text-gray-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: "Coding Workspace",
    href: "/workspace/coding",
    icon: (active: boolean) => (
      <svg className={`w-4 h-4 ${active ? "text-orange-400" : "text-gray-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
  },
  {
    label: "Attendance",
    href: "/attendance",
    icon: (active: boolean) => (
      <svg className={`w-4 h-4 ${active ? "text-orange-400" : "text-gray-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    label: "Web Builder",
    href: "/workspace/web-builder",
    icon: (active: boolean) => (
      <svg className={`w-4 h-4 ${active ? "text-orange-400" : "text-gray-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: "easier.io",
    href: "/workspace/easier-io",
    icon: (active: boolean) => (
      <svg className={`w-4 h-4 ${active ? "text-orange-400" : "text-gray-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    label: "canva.io",
    href: "/workspace/canva",
    icon: (active: boolean) => (
      <svg className={`w-4 h-4 ${active ? "text-orange-400" : "text-gray-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: "AI Book",
    href: "/workspace/ai-book",
    icon: (active: boolean) => (
      <svg className={`w-4 h-4 ${active ? "text-orange-400" : "text-gray-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
];

const bottomItems = [
  {
    label: "Settings",
    href: "/workspace?tab=settings",
    icon: (active: boolean) => (
      <svg className={`w-4 h-4 ${active ? "text-orange-400" : "text-gray-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`${
        collapsed ? "w-14" : "w-56"
      } h-full bg-[#252526] border-r border-[#3c3c3c] flex flex-col transition-all duration-200 flex-shrink-0`}
    >
      <div className="h-9 flex items-center justify-between px-3 border-b border-[#3c3c3c]">
        {!collapsed && (
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">
            Explorer
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`text-gray-500 hover:text-white transition-colors ${collapsed ? "mx-auto" : ""}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <nav className="flex-1 py-2">
        {menuItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 mx-2 rounded text-sm transition-all ${
                active
                  ? "bg-orange-500/10 text-orange-400"
                  : "text-gray-400 hover:text-white hover:bg-[#2d2d2d]"
              }`}
              title={collapsed ? item.label : undefined}
            >
              {item.icon(active)}
              {!collapsed && <span className="truncate text-xs">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="py-2 border-t border-[#3c3c3c]">
        {bottomItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 mx-2 rounded text-sm transition-all ${
                active
                  ? "bg-orange-500/10 text-orange-400"
                  : "text-gray-400 hover:text-white hover:bg-[#2d2d2d]"
              }`}
              title={collapsed ? item.label : undefined}
            >
              {item.icon(active)}
              {!collapsed && <span className="truncate text-xs">{item.label}</span>}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
