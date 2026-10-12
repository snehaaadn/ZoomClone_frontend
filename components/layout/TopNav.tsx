"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Bell, Settings, HelpCircle, User, CheckCircle2 } from "lucide-react";

export function TopNav() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="h-14 bg-white border-b border-[#E4E7EB] px-4 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Left: Brand & Search */}
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-[#0E71EB] flex items-center justify-center text-white font-bold text-lg shadow-sm">
            Z
          </div>
          <span className="font-semibold text-lg tracking-tight text-[#131619] group-hover:text-[#0E71EB] transition-colors">
            zoom<span className="text-xs font-medium ml-1.5 px-1.5 py-0.5 rounded bg-blue-50 text-[#0E71EB] border border-blue-100">Workplace</span>
          </span>
        </Link>

        {/* Global Search Bar */}
        <div className="hidden md:flex items-center relative w-72 lg:w-96">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search meetings, recordings, or contacts (⌘K)"
            className="w-full bg-[#F4F5F7] hover:bg-[#EBEDF0] focus:bg-white text-sm text-[#131619] pl-9 pr-4 py-1.5 rounded-md border border-transparent focus:border-[#0E71EB] focus:outline-none transition-all placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Right: Actions & User Avatar */}
      <div className="flex items-center gap-3">
        {/* Icon buttons */}
        <button
          title="Help & Feedback"
          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        <button
          title="Notifications"
          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 relative transition-colors"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 bg-[#0E71EB] rounded-full absolute top-1.5 right-1.5"></span>
        </button>

        <Link
          href="/settings"
          title="Settings"
          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <Settings className="w-4 h-4" />
        </Link>

        {/* Profile Avatar & Menu */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-gray-100 transition-colors focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-[#0E71EB] text-white flex items-center justify-center text-xs font-semibold shadow-xs">
              SD
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-medium text-gray-800 leading-tight">Sneha Debnath</span>
              <span className="text-[10px] text-gray-500 leading-tight">Licensed Host</span>
            </div>
          </button>

          {showProfileMenu && (
            <div
              className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
              onMouseLeave={() => setShowProfileMenu(false)}
            >
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="font-medium text-sm text-gray-900">Sneha Debnath</p>
                <p className="text-xs text-gray-500">sneha.debnath@zoomclone.local</p>
                <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Available (Default Host)</span>
                </div>
              </div>
              <div className="py-1">
                <Link
                  href="/meetings"
                  className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowProfileMenu(false)}
                >
                  My Personal Room
                </Link>
                <div className="px-4 py-1.5 text-[11px] text-gray-400">
                  PMI: 842-1920-3341
                </div>
              </div>
              <div className="border-t border-gray-100 pt-1">
                <button
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full text-left px-4 py-2 text-xs text-gray-600 hover:bg-gray-50"
                >
                  Sign Out (Simulated)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
