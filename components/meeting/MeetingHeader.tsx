"use client";

import React, { useState } from "react";
import { ShieldCheck, Info, Grid, Maximize, Minimize, Copy, Check } from "lucide-react";
import { Meeting } from "@/types";
import { copyToClipboard } from "@/lib/utils";

interface MeetingHeaderProps {
  meeting: Meeting | null;
  layout: "gallery" | "speaker";
  onToggleLayout: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onOpenInvite: () => void;
}

export function MeetingHeader({
  meeting,
  layout,
  onToggleLayout,
  isFullscreen,
  onToggleFullscreen,
  onOpenInvite,
}: MeetingHeaderProps) {
  const [showInfoPopover, setShowInfoPopover] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = async () => {
    if (!meeting?.invite_url) return;
    const ok = await copyToClipboard(meeting.invite_url);
    if (ok) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="h-12 bg-[#12161A]/90 backdrop-blur-md px-4 flex items-center justify-between text-white border-b border-white/5 select-none z-20 shrink-0">
      {/* Left: Security badge & Meeting Title & Info Dropdown */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => setShowInfoPopover(!showInfoPopover)}
            className="flex items-center gap-2 hover:bg-white/10 px-2 py-1 rounded-lg transition-colors cursor-pointer text-xs"
            title="Meeting Information"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-gray-200 truncate max-w-[200px] sm:max-w-xs">
              {meeting?.title || "Zoom Meeting"}
            </span>
            <Info className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {/* Info Popover */}
          {showInfoPopover && meeting && (
            <div
              className="absolute left-0 top-full mt-2 w-72 bg-[#1E232A] border border-white/10 rounded-xl shadow-2xl p-4 text-xs space-y-3 z-50 animate-in fade-in zoom-in-95"
              onMouseLeave={() => setShowInfoPopover(false)}
            >
              <div>
                <h4 className="font-semibold text-white text-sm">{meeting.title}</h4>
                <p className="text-gray-400 text-[11px] mt-0.5">Host: {meeting.host_display_name}</p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between text-gray-300">
                  <span className="text-gray-400">Meeting ID:</span>
                  <span className="font-mono font-semibold text-white">{meeting.meeting_id}</span>
                </div>
                <div className="flex items-center justify-between text-gray-300">
                  <span className="text-gray-400">Passcode:</span>
                  <span className="font-mono font-semibold text-white">{meeting.passcode}</span>
                </div>
                <div className="flex items-center justify-between text-gray-300">
                  <span className="text-gray-400">Encryption:</span>
                  <span className="text-emerald-400 font-medium">Enhanced</span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10">
                <button
                  onClick={handleCopyLink}
                  className="w-full bg-[#0E71EB] hover:bg-[#0050C8] text-white py-1.5 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? "Link Copied!" : "Copy Invite Link"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Layout Switcher & Fullscreen */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleLayout}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title={`Switch to ${layout === "gallery" ? "Speaker" : "Gallery"} View`}
        >
          <Grid className="w-4 h-4" />
          <span className="hidden sm:inline capitalize">{layout} View</span>
        </button>

        <button
          onClick={onToggleFullscreen}
          className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title={isFullscreen ? "Exit Full Screen" : "Enter Full Screen"}
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
