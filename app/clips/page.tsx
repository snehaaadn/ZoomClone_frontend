"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/layout/TopNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { Film, Play, Plus, Clock, Eye, Share2, MoreVertical } from "lucide-react";

export default function ClipsPage() {
  const router = useRouter();

  const clips = [
    {
      id: "1",
      title: "FastAPI WebRTC Architecture Overview",
      duration: "03:42",
      views: 18,
      createdAt: "Yesterday",
      thumbnailBg: "from-blue-600 to-indigo-800",
    },
    {
      id: "2",
      title: "Zoom Workplace Design System Walkthrough",
      duration: "02:15",
      views: 24,
      createdAt: "3 days ago",
      thumbnailBg: "from-amber-600 to-orange-700",
    },
    {
      id: "3",
      title: "Host Controls & Meeting Mute-All Demo",
      duration: "01:50",
      views: 9,
      createdAt: "Last week",
      thumbnailBg: "from-emerald-600 to-teal-800",
    },
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#F7F9FA]">
      <TopNav />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          onNewMeetingClick={() => router.push("/")}
          onJoinClick={() => router.push("/join")}
          onScheduleClick={() => router.push("/")}
        />

        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Film className="w-5 h-5 text-[#0E71EB]" />
                  <span>Zoom Clips</span>
                </h2>
                <p className="text-xs text-gray-500">
                  Record and share quick video messages without scheduling a meeting.
                </p>
              </div>

              <button
                onClick={() => alert("Recording clip feature simulation: Starting camera capture.")}
                className="bg-[#0E71EB] hover:bg-[#0050C8] text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Create Clip</span>
              </button>
            </div>

            {/* Clips Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {clips.map((clip) => (
                <div
                  key={clip.id}
                  className="bg-white border border-[#E4E7EB] hover:border-[#CBD5E1] rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col"
                >
                  {/* Thumbnail Video Card */}
                  <div
                    className={`aspect-video bg-gradient-to-br ${clip.thumbnailBg} relative flex items-center justify-center`}
                  >
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:scale-110 transition-transform cursor-pointer">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                    <span className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-md text-white text-[10px] font-mono px-2 py-0.5 rounded-md">
                      {clip.duration}
                    </span>
                  </div>

                  {/* Clip Details */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">
                        {clip.title}
                      </h4>
                      <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-2">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {clip.createdAt}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {clip.views} views
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                      <button
                        onClick={() => alert("Shareable clip link copied to clipboard!")}
                        className="flex items-center gap-1 text-[#0E71EB] hover:text-[#0050C8] font-medium cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Share Clip</span>
                      </button>
                      <button className="text-gray-400 hover:text-gray-600 cursor-pointer">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
