"use client";

import React, { useRef, useEffect } from "react";
import { Mic, MicOff, Crown, Pin } from "lucide-react";
import { getInitials } from "@/lib/utils";

interface VideoTileProps {
  stream: MediaStream | null;
  displayName: string;
  isSelf?: boolean;
  isHost?: boolean;
  isMuted?: boolean;
  isVideoOff?: boolean;
  isSpeaking?: boolean;
  onPin?: () => void;
  isPinned?: boolean;
}

export function VideoTile({
  stream,
  displayName,
  isSelf = false,
  isHost = false,
  isMuted = false,
  isVideoOff = false,
  isSpeaking = false,
  onPin,
  isPinned = false,
}: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleVideoRef = (el: HTMLVideoElement | null) => {
    videoRef.current = el;
    if (el && stream) {
      if (el.srcObject !== stream) {
        el.srcObject = stream;
      }
      el.play().catch(() => {});
    }
  };

  useEffect(() => {
    if (videoRef.current && stream) {
      if (videoRef.current.srcObject !== stream) {
        videoRef.current.srcObject = stream;
      }
      videoRef.current.play().catch(() => {});
    }
  }, [stream, isVideoOff]);

  return (
    <div
      className={`relative rounded-2xl overflow-hidden bg-[#1E232A] flex items-center justify-center group transition-all duration-200 border-2 ${
        isSpeaking ? "border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "border-transparent"
      } w-full h-full min-h-[180px]`}
    >
      {/* Video Element */}
      {stream && !isVideoOff ? (
        <video
          ref={handleVideoRef}
          autoPlay
          playsInline
          muted={isSelf} // always mute self to prevent audio feedback loop
          className={`w-full h-full object-cover ${isSelf ? "-scale-x-100" : ""}`}
        />
      ) : (
        /* Avatar Placeholder when Camera is Off */
        <div className="flex flex-col items-center justify-center select-none">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-lg">
            {getInitials(displayName)}
          </div>
          <span className="text-gray-300 font-medium text-sm mt-3">{displayName}</span>
        </div>
      )}

      {/* Top Controls on Hover */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 z-10">
        {onPin && (
          <button
            onClick={onPin}
            className="p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors cursor-pointer"
            title={isPinned ? "Unpin participant" : "Pin participant"}
          >
            <Pin className={`w-3.5 h-3.5 ${isPinned ? "fill-white" : ""}`} />
          </button>
        )}
      </div>

      {/* Bottom Name Tag & Microphone Status */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/65 backdrop-blur-md px-2.5 py-1 rounded-lg text-white text-xs select-none z-10 max-w-[80%]">
        {/* Mic Indicator */}
        {isMuted ? (
          <MicOff className="w-3.5 h-3.5 text-red-500 shrink-0" />
        ) : (
          <div className="relative flex items-center shrink-0">
            <Mic className="w-3.5 h-3.5 text-emerald-400" />
            {isSpeaking && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            )}
          </div>
        )}

        {/* Display Name */}
        <span className="truncate font-medium">
          {displayName} {isSelf && "(You)"}
        </span>

        {/* Host Badge */}
        {isHost && (
          <span className="bg-blue-500/80 text-[10px] px-1.5 py-0.2 rounded font-semibold text-white shrink-0 flex items-center gap-0.5">
            <Crown className="w-2.5 h-2.5" />
            Host
          </span>
        )}
      </div>
    </div>
  );
}
