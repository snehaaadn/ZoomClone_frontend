"use client";

import React, { useState } from "react";
import { Mic, MicOff, Video, VideoOff, X, Sparkles } from "lucide-react";

interface InstantMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmStart: (config: {
    title: string;
    isAudioEnabled: boolean;
    isVideoEnabled: boolean;
  }) => void;
  isLoading: boolean;
}

export function InstantMeetingModal({
  isOpen,
  onClose,
  onConfirmStart,
  isLoading,
}: InstantMeetingModalProps) {
  const [title, setTitle] = useState("Sneha Debnath's Personal Meeting Room");
  const [isVideoEnabled, setIsVideoEnabled] = useState<boolean>(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirmStart({
      title,
      isAudioEnabled,
      isVideoEnabled,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 text-base">Start Instant Meeting</h3>
            <p className="text-xs text-gray-500">Configure your camera and audio preferences</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Meeting Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Meeting Topic
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Quick Sync"
              className="w-full text-sm px-3.5 py-2 rounded-lg border border-gray-300 focus:border-[#0E71EB] focus:ring-2 focus:ring-[#0E71EB]/20 outline-none transition-all"
            />
          </div>

          {/* Camera / Audio Setup Card */}
          <div className="relative aspect-video bg-[#1A1D20] rounded-xl overflow-hidden shadow-inner flex flex-col items-center justify-center text-center p-6 select-none">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold mb-3 shadow-lg ring-4 ring-white/10">
              SD
            </div>

            <p className="text-sm font-medium text-white mb-1">Sneha Debnath</p>
            <div className="flex items-center gap-2 text-xs text-gray-300">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                isVideoEnabled ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-red-500/20 text-red-300 border border-red-500/30"
              }`}>
                {isVideoEnabled ? "Camera: On" : "Camera: Off"}
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                isAudioEnabled ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-red-500/20 text-red-300 border border-red-500/30"
              }`}>
                {isAudioEnabled ? "Mic: Unmuted" : "Mic: Muted"}
              </span>
            </div>

            {/* Quick Toggle Controls */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/70 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 z-10 shadow-lg">
              <button
                type="button"
                onClick={() => setIsAudioEnabled((prev) => !prev)}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  isAudioEnabled ? "bg-white/20 text-white hover:bg-white/30" : "bg-red-600 text-white hover:bg-red-700"
                }`}
                title={isAudioEnabled ? "Turn Off Microphone" : "Turn On Microphone"}
              >
                {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => setIsVideoEnabled((prev) => !prev)}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  isVideoEnabled ? "bg-white/20 text-white hover:bg-white/30" : "bg-red-600 text-white hover:bg-red-700"
                }`}
                title={isVideoEnabled ? "Turn Off Camera" : "Turn On Camera"}
              >
                {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Browser Permission Info Card */}
          <div className="flex items-center gap-2 p-3 bg-blue-50/80 border border-blue-200/60 rounded-xl text-xs text-blue-900">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Your browser will pop up its permission prompt for camera & mic when the meeting starts.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-200/50 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="px-5 py-2 bg-[#F26D21] hover:bg-[#D95610] text-white text-sm font-semibold rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Creating Room...</span>
              </>
            ) : (
              <span>Start Meeting</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
