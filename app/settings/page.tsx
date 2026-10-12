"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/layout/TopNav";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  Settings,
  Video,
  Mic,
  ScreenShare,
  Shield,
  Bell,
  Palette,
  CheckCircle,
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"general" | "video" | "audio" | "security">("general");
  const [savedAlert, setSavedAlert] = useState(false);

  // Settings states
  const [startVideoOnJoin, setStartVideoOnJoin] = useState(true);
  const [muteMicOnJoin, setMuteMicOnJoin] = useState(false);
  const [hdVideo, setHdVideo] = useState(true);
  const [mirrorVideo, setMirrorVideo] = useState(true);
  const [suppressBackgroundNoise, setSuppressBackgroundNoise] = useState("auto");

  const handleSave = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("zoom_video_off", (!startVideoOnJoin).toString());
      sessionStorage.setItem("zoom_audio_off", muteMicOnJoin.toString());
    }
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 2500);
  };

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
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#0E71EB]" />
                <span>Zoom Workplace Settings</span>
              </h2>
              <p className="text-xs text-gray-500">
                Manage audio, video, camera hardware, and security defaults.
              </p>
            </div>

            {savedAlert && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Preferences saved successfully to local session!</span>
              </div>
            )}

            {/* Settings Card */}
            <div className="bg-white border border-[#E4E7EB] rounded-2xl shadow-xs overflow-hidden flex flex-col md:flex-row">
              {/* Settings Nav Tabs */}
              <div className="w-full md:w-56 border-r border-[#E4E7EB] bg-[#F7F9FA] p-3 space-y-1 shrink-0">
                <button
                  onClick={() => setActiveTab("general")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    activeTab === "general"
                      ? "bg-blue-50 text-[#0E71EB]"
                      : "text-gray-600 hover:bg-gray-200/50"
                  }`}
                >
                  <Palette className="w-4 h-4" />
                  <span>General</span>
                </button>

                <button
                  onClick={() => setActiveTab("video")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    activeTab === "video"
                      ? "bg-blue-50 text-[#0E71EB]"
                      : "text-gray-600 hover:bg-gray-200/50"
                  }`}
                >
                  <Video className="w-4 h-4" />
                  <span>Video & Camera</span>
                </button>

                <button
                  onClick={() => setActiveTab("audio")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    activeTab === "audio"
                      ? "bg-blue-50 text-[#0E71EB]"
                      : "text-gray-600 hover:bg-gray-200/50"
                  }`}
                >
                  <Mic className="w-4 h-4" />
                  <span>Audio & Microphone</span>
                </button>

                <button
                  onClick={() => setActiveTab("security")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    activeTab === "security"
                      ? "bg-blue-50 text-[#0E71EB]"
                      : "text-gray-600 hover:bg-gray-200/50"
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span>Security & Passcodes</span>
                </button>
              </div>

              {/* Settings Tab Content */}
              <div className="flex-1 p-6 space-y-6">
                {activeTab === "general" && (
                  <div className="space-y-4 text-xs">
                    <h3 className="font-bold text-gray-900 text-sm">General Workplace Experience</h3>
                    <div className="space-y-3 pt-2">
                      <label className="flex items-center justify-between text-gray-700">
                        <span>Theme Mode</span>
                        <select className="border border-gray-200 rounded-lg p-1.5 text-xs bg-gray-50">
                          <option>Light Theme (Zoom Workplace)</option>
                          <option>Dark Meeting Canvas (Default)</option>
                          <option>Follow System Settings</option>
                        </select>
                      </label>
                      <label className="flex items-center justify-between text-gray-700">
                        <span>Show meeting duration timer</span>
                        <input type="checkbox" defaultChecked className="w-4 h-4 text-[#0E71EB] rounded" />
                      </label>
                      <label className="flex items-center justify-between text-gray-700">
                        <span>Ask to confirm before leaving meeting</span>
                        <input type="checkbox" defaultChecked className="w-4 h-4 text-[#0E71EB] rounded" />
                      </label>
                    </div>
                  </div>
                )}

                {activeTab === "video" && (
                  <div className="space-y-4 text-xs">
                    <h3 className="font-bold text-gray-900 text-sm">Camera & Video Settings</h3>
                    <div className="space-y-3 pt-2">
                      <label className="flex items-center justify-between text-gray-700 cursor-pointer">
                        <span>Turn on video automatically when joining</span>
                        <input
                          type="checkbox"
                          checked={startVideoOnJoin}
                          onChange={(e) => setStartVideoOnJoin(e.target.checked)}
                          className="w-4 h-4 text-[#0E71EB] rounded"
                        />
                      </label>
                      <label className="flex items-center justify-between text-gray-700 cursor-pointer">
                        <span>Enable HD Video (1080p WebRTC capture)</span>
                        <input
                          type="checkbox"
                          checked={hdVideo}
                          onChange={(e) => setHdVideo(e.target.checked)}
                          className="w-4 h-4 text-[#0E71EB] rounded"
                        />
                      </label>
                      <label className="flex items-center justify-between text-gray-700 cursor-pointer">
                        <span>Mirror my video stream locally</span>
                        <input
                          type="checkbox"
                          checked={mirrorVideo}
                          onChange={(e) => setMirrorVideo(e.target.checked)}
                          className="w-4 h-4 text-[#0E71EB] rounded"
                        />
                      </label>
                    </div>
                  </div>
                )}

                {activeTab === "audio" && (
                  <div className="space-y-4 text-xs">
                    <h3 className="font-bold text-gray-900 text-sm">Audio & Voice Clarity</h3>
                    <div className="space-y-3 pt-2">
                      <label className="flex items-center justify-between text-gray-700 cursor-pointer">
                        <span>Mute my microphone when joining a meeting</span>
                        <input
                          type="checkbox"
                          checked={muteMicOnJoin}
                          onChange={(e) => setMuteMicOnJoin(e.target.checked)}
                          className="w-4 h-4 text-[#0E71EB] rounded"
                        />
                      </label>
                      <label className="flex items-center justify-between text-gray-700">
                        <span>Suppress background noise</span>
                        <select
                          value={suppressBackgroundNoise}
                          onChange={(e) => setSuppressBackgroundNoise(e.target.value)}
                          className="border border-gray-200 rounded-lg p-1.5 text-xs bg-gray-50"
                        >
                          <option value="auto">Auto (Balanced)</option>
                          <option value="low">Low (Faint music/noise)</option>
                          <option value="high">High (Echo cancellation)</option>
                        </select>
                      </label>
                    </div>
                  </div>
                )}

                {activeTab === "security" && (
                  <div className="space-y-4 text-xs">
                    <h3 className="font-bold text-gray-900 text-sm">Meeting Security & Encryption</h3>
                    <div className="space-y-3 pt-2 text-gray-600">
                      <p>All meetings utilize peer-to-peer WebRTC encryption for media tracks.</p>
                      <label className="flex items-center justify-between text-gray-700">
                        <span>Require 6-digit passcode for scheduled sessions</span>
                        <input type="checkbox" defaultChecked className="w-4 h-4 text-[#0E71EB] rounded" />
                      </label>
                      <label className="flex items-center justify-between text-gray-700">
                        <span>Only host can admit attendees to meeting room</span>
                        <input type="checkbox" className="w-4 h-4 text-[#0E71EB] rounded" />
                      </label>
                    </div>
                  </div>
                )}

                {/* Save button */}
                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={handleSave}
                    className="bg-[#0E71EB] hover:bg-[#0050C8] text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
