"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Calendar,
  MessageSquare,
  Presentation,
  Film,
  Users,
  Settings,
  Plus
} from "lucide-react";

interface SidebarProps {
  onScheduleClick?: () => void;
  onJoinClick?: () => void;
  onNewMeetingClick?: () => void;
}

export function Sidebar({ onScheduleClick, onJoinClick, onNewMeetingClick }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Meetings", href: "/meetings", icon: Calendar },
    { label: "Team Chat", href: "/team-chat", icon: MessageSquare, badge: "3" },
    { label: "Whiteboards", href: "/whiteboards", icon: Presentation },
    { label: "Clips", href: "/clips", icon: Film },
    { label: "Contacts", href: "/contacts", icon: Users },
  ];

  return (
    <aside className="w-16 md:w-60 bg-white border-r border-[#E4E7EB] flex flex-col justify-between shrink-0 select-none">
      <div className="py-4">
        {/* Quick Action Button for Desktop Sidebar */}
        <div className="hidden md:block px-4 mb-4">
          <button
            onClick={onNewMeetingClick}
            className="w-full bg-[#0E71EB] hover:bg-[#0050C8] text-white py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Host Meeting</span>
          </button>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1 px-2 md:px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-blue-50 text-[#0E71EB]"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/70"
                }`}
                title={item.label}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-[#0E71EB]" : "text-gray-500"}`} />
                <span className="hidden md:inline truncate">{item.label}</span>
                {item.badge && (
                  <span className="hidden md:inline-flex ml-auto text-[10px] bg-blue-100 text-[#0E71EB] font-bold px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom utility links */}
      <div className="p-3 border-t border-[#E4E7EB]">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          title="Settings"
        >
          <Settings className="w-5 h-5 text-gray-500 shrink-0" />
          <span className="hidden md:inline">Settings</span>
        </Link>
      </div>
    </aside>
  );
}
