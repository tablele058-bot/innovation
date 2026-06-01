"use client";

import Link from "next/link";

export default function WorkspaceHome() {
  return (
    <div className="h-full flex items-center justify-center bg-[#1e1e1e]">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-gray-200 mb-2">Welcome to Workspace</h1>
        <p className="text-sm text-gray-500 mb-8 leading-relaxed">
          Choose your workspace mode to get started
        </p>
        <div className="grid grid-cols-2 gap-4">
          <Link
            href="/workspace/youtube"
            className="group p-5 rounded-xl bg-[#252526] border border-[#3c3c3c] hover:border-orange-500/50 transition-all text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center mb-3 group-hover:bg-orange-500/20 transition-colors">
              <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-gray-200 mb-1">YouTube Workspace</h3>
            <p className="text-xs text-gray-500">Take notes while watching videos with auto-save</p>
          </Link>
          <Link
            href="/workspace/coding"
            className="group p-5 rounded-xl bg-[#252526] border border-[#3c3c3c] hover:border-orange-500/50 transition-all text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center mb-3 group-hover:bg-orange-500/20 transition-colors">
              <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-gray-200 mb-1">Coding Workspace</h3>
            <p className="text-xs text-gray-500">Write and edit code with Monaco editor & GitHub sync</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
