"use client";

import React, { useRef, useEffect } from "react";
import { ScreenShare, StopCircle } from "lucide-react";

interface ScreenShareViewProps {
  stream: MediaStream | null;
  presenterName: string;
  isSelf: boolean;
  onStopShare: () => void;
}

export function ScreenShareView({
  stream,
  presenterName,
  isSelf,
  onStopShare,
}: ScreenShareViewProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative w-full h-full bg-black rounded-2xl overflow-hidden flex items-center justify-center border border-white/10 shadow-2xl">
      {/* Top Bar Indicator */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/75 backdrop-blur-md px-4 py-1.5 rounded-full border border-emerald-500/30 flex items-center gap-3 z-10 text-xs text-white">
        <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
          <ScreenShare className="w-4 h-4 text-emerald-400" />
          <span>{isSelf ? "You are sharing your screen" : `${presenterName} is sharing their screen`}</span>
        </span>

        {isSelf && (
          <button
            onClick={onStopShare}
            className="bg-red-600 hover:bg-red-700 text-white font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1 text-[11px] transition-colors cursor-pointer"
          >
            <StopCircle className="w-3.5 h-3.5" />
            <span>Stop Share</span>
          </button>
        )}
      </div>

      {/* Screen Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-contain max-h-[calc(100vh-160px)]"
      />
    </div>
  );
}
