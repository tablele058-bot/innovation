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
