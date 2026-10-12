"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Video, VideoOff, Settings2, X } from "lucide-react";
import { useMediaStream } from "@/hooks/useMediaStream";

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
  const {
    stream,
    isVideoEnabled,
    isAudioEnabled,
    toggleVideo,
    toggleAudio,
    stopStream,
    audioDevices,
    videoDevices,
    selectedAudioDevice,
    selectedVideoDevice,
    setSelectedAudioDevice,
    setSelectedVideoDevice,
    permissionError,
    retry,
  } = useMediaStream(true, true, isOpen);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, isVideoEnabled]);

  const handleClose = () => {
    stopStream();
    onClose();
  };

  const handleConfirm = () => {
    stopStream();
    onConfirmStart({
      title,
      isAudioEnabled,
      isVideoEnabled,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 text-base">Start Instant Meeting</h3>
            <p className="text-xs text-gray-500">Configure your camera and audio before starting</p>
          </div>
          <button
            onClick={handleClose}
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

          {/* Camera Preview Canvas */}
          <div className="relative aspect-video bg-[#1A1D20] rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
            {isVideoEnabled && stream ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover -scale-x-100"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xl font-bold mb-2 shadow-md">
                  SD
                </div>
                <span className="text-xs text-gray-300 font-medium">Camera is Off</span>
              </div>
            )}

            {/* In-preview Quick Toggles */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 z-10 shadow-lg">
              <button
                type="button"
                onClick={toggleAudio}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  isAudioEnabled ? "bg-white/20 text-white hover:bg-white/30" : "bg-red-600 text-white hover:bg-red-700"
                }`}
                title={isAudioEnabled ? "Mute Microphone" : "Unmute Microphone"}
              >
                {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={toggleVideo}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  isVideoEnabled ? "bg-white/20 text-white hover:bg-white/30" : "bg-red-600 text-white hover:bg-red-700"
                }`}
                title={isVideoEnabled ? "Turn Off Camera" : "Turn On Camera"}
              >
                {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Subtitle helper note if browser blocked permission */}
          {permissionError && (
            <div className="flex items-center justify-between text-[11px] text-amber-800 bg-amber-50 py-1.5 px-3 rounded-lg border border-amber-200">
              <span className="truncate">Camera/mic blocked. Allow in address bar or click:</span>
              <button
                type="button"
                onClick={() => retry()}
                className="ml-2 shrink-0 px-2.5 py-1 bg-[#0E71EB] hover:bg-[#0050C8] text-white rounded font-medium text-[11px] cursor-pointer transition-colors shadow-xs"
              >
                Allow Access
              </button>
            </div>
          )}

          {/* Device dropdowns */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-gray-500 mb-1 block">Microphone</label>
              <select
                value={selectedAudioDevice}
                onChange={(e) => setSelectedAudioDevice(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-gray-700 focus:outline-none focus:border-[#0E71EB]"
              >
                {audioDevices.length > 0 ? (
                  audioDevices.map((d) => (
                    <option key={d.deviceId} value={d.deviceId}>
                      {d.label}
                    </option>
                  ))
                ) : (
                  <option value="">Default Microphone</option>
                )}
              </select>
            </div>

            <div>
              <label className="text-gray-500 mb-1 block">Camera</label>
              <select
                value={selectedVideoDevice}
                onChange={(e) => setSelectedVideoDevice(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-gray-700 focus:outline-none focus:border-[#0E71EB]"
              >
                {videoDevices.length > 0 ? (
                  videoDevices.map((d) => (
                    <option key={d.deviceId} value={d.deviceId}>
                      {d.label}
                    </option>
                  ))
                ) : (
                  <option value="">Default Camera</option>
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            onClick={handleClose}
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
