"use client";

import React from "react";
import { PeerStream } from "@/types";
import { VideoTile } from "./VideoTile";
import { ScreenShareView } from "./ScreenShareView";
import { UserPlus, Copy } from "lucide-react";

interface VideoGridProps {
  localStream: MediaStream | null;
  localDisplayName: string;
  isLocalMuted: boolean;
  isLocalVideoOff: boolean;
  peerStreams: PeerStream[];
  screenStream: MediaStream | null;
  isScreenSharing: boolean;
  onStopScreenShare: () => void;
  onOpenInvite: () => void;
  isHost: boolean;
  pinnedPeerId?: string | null;
  onTogglePin?: (id: string) => void;
}

export function VideoGrid({
  localStream,
  localDisplayName,
  isLocalMuted,
  isLocalVideoOff,
  peerStreams,
  screenStream,
  isScreenSharing,
  onStopScreenShare,
  onOpenInvite,
  isHost,
  pinnedPeerId,
  onTogglePin,
}: VideoGridProps) {
  const totalCount = 1 + peerStreams.length;

  // 1. Screen sharing active mode
  if (isScreenSharing && screenStream) {
    return (
      <div className="flex-1 flex flex-col lg:flex-row p-3 gap-3 overflow-hidden">
        {/* Main Presentation View */}
        <div className="flex-1 min-h-[300px]">
          <ScreenShareView
            stream={screenStream}
            presenterName={localDisplayName}
            isSelf={true}
            onStopShare={onStopScreenShare}
          />
        </div>

        {/* Filmstrip of participants */}
        <div className="h-36 lg:h-auto lg:w-64 flex lg:flex-col gap-2 overflow-auto shrink-0">
          <div className="h-full lg:h-40 aspect-video shrink-0">
            <VideoTile
              stream={localStream}
              displayName={localDisplayName}
              isSelf={true}
              isHost={isHost}
              isMuted={isLocalMuted}
              isVideoOff={isLocalVideoOff}
            />
          </div>
          {peerStreams.map((peer) => (
            <div key={peer.clientId} className="h-full lg:h-40 aspect-video shrink-0">
              <VideoTile
                stream={peer.stream}
                displayName={peer.displayName}
                isMuted={peer.isMuted}
                isVideoOff={peer.isVideoOff}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2. Solo participant (honest helper message)
  if (totalCount === 1) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="w-full max-w-4xl h-[70vh] max-h-[580px] relative">
          <VideoTile
            stream={localStream}
            displayName={localDisplayName}
            isSelf={true}
            isHost={isHost}
            isMuted={isLocalMuted}
            isVideoOff={isLocalVideoOff}
          />

          {/* Honest Solo Indicator & Quick Invite Card */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/75 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-white text-xs flex items-center gap-3 shadow-xl z-20">
            <span className="text-gray-300">
              You are the only one here
            </span>
            <button
              onClick={onOpenInvite}
              className="bg-[#0E71EB] hover:bg-[#0050C8] text-white px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Invite Participants</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Multi-participant Grid (2, 3, 4+ participants)
  let gridColsClass = "grid-cols-1 md:grid-cols-2";
  if (totalCount >= 5) {
    gridColsClass = "grid-cols-2 md:grid-cols-3";
  }

  return (
    <div className="flex-1 p-3 md:p-5 overflow-auto flex items-center justify-center">
      <div className={`grid ${gridColsClass} gap-3 md:gap-4 w-full max-w-6xl h-full max-h-[82vh]`}>
        {/* Local user tile */}
        <div className="w-full h-full min-h-[220px]">
          <VideoTile
            stream={localStream}
            displayName={localDisplayName}
            isSelf={true}
            isHost={isHost}
            isMuted={isLocalMuted}
            isVideoOff={isLocalVideoOff}
          />
        </div>

        {/* Remote peer tiles */}
        {peerStreams.map((peer) => (
          <div key={peer.clientId} className="w-full h-full min-h-[220px]">
            <VideoTile
              stream={peer.stream}
              displayName={peer.displayName}
              isMuted={peer.isMuted}
              isVideoOff={peer.isVideoOff}
              onPin={() => onTogglePin?.(peer.clientId)}
              isPinned={pinnedPeerId === peer.clientId}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
