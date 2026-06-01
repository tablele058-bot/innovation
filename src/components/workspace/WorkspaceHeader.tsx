"use client";

import Link from "next/link";
import { useAuth, UserButton } from "@clerk/nextjs";

export default function WorkspaceHeader() {
  const { userId } = useAuth();

  return (
    <header className="h-9 bg-[#323233] border-b border-[#3c3c3c] flex items-center justify-between px-4 flex-shrink-0">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
          <div className="w-5 h-5 bg-gradient-to-br from-orange-500 to-red-600 rounded flex items-center justify-center">
            <span className="text-white font-bold text-[9px]">YC</span>
          </div>
          <span className="font-medium text-xs text-gray-300">Directory</span>
        </Link>
        <span className="text-gray-600 text-xs">|</span>
        <span className="text-xs text-gray-500">Workspace</span>
      </div>

      {userId && (
        <div className="flex items-center gap-2">
          <Link
            href={`/user/${userId}`}
            className="text-[11px] text-gray-500 hover:text-gray-300 transition-colors px-2 py-1 rounded hover:bg-[#3c3c3c]"
          >
            Profile
          </Link>
          <UserButton
            appearance={{
              elements: { avatarBox: "w-5 h-5" },
            }}
          />
        </div>
      )}
    </header>
  );
}
