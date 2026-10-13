"use client";

import React from "react";
import { X, Mic, MicOff, Video, VideoOff, Crown, UserX, VolumeX } from "lucide-react";
import { PeerStream } from "@/types";
import { getInitials } from "@/lib/utils";

interface ParticipantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  localDisplayName: string;
  isLocalHost: boolean;
  hostDisplayName?: string;
  isLocalMuted: boolean;
  isLocalVideoOff: boolean;
  peerStreams: PeerStream[];
  onMuteAll?: () => void;
  onRemovePeer?: (clientId: string) => void;
  onOpenInvite: () => void;
}

export function ParticipantDrawer({
  isOpen,
  onClose,
  localDisplayName,
  isLocalHost,
  hostDisplayName,
  isLocalMuted,
  isLocalVideoOff,
  peerStreams,
  onMuteAll,
  onRemovePeer,
  onOpenInvite,
}: ParticipantDrawerProps) {
  if (!isOpen) return null;

  const totalCount = 1 + peerStreams.length;

  return (
    <aside className="w-80 bg-[#1E232A] border-l border-white/10 flex flex-col h-full text-white z-20 shrink-0 select-none animate-in slide-in-from-right duration-150">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <h3 className="font-semibold text-sm">
          Participants ({totalCount})
        </h3>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Participants List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {/* Local user row */}
        <div className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors group">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {getInitials(localDisplayName)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-200 truncate flex items-center gap-1.5">
                <span>{localDisplayName}</span>
                <span className="text-[10px] text-gray-400">(Me)</span>
              </p>
              {isLocalHost ? (
                <span className="text-[10px] text-blue-400 font-medium flex items-center gap-0.5">
                  <Crown className="w-2.5 h-2.5" /> Host
                </span>
              ) : (
                <span className="text-[10px] text-gray-400 font-medium">Guest</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 text-gray-400">
            {isLocalMuted ? (
              <MicOff className="w-4 h-4 text-red-400" />
            ) : (
              <Mic className="w-4 h-4 text-emerald-400" />
            )}
            {isLocalVideoOff ? (
              <VideoOff className="w-4 h-4 text-red-400" />
            ) : (
              <Video className="w-4 h-4 text-gray-300" />
            )}
          </div>
        </div>

        {/* Remote peers */}
        {peerStreams.map((peer) => {
          const cleanPeer = peer.displayName.replace(/\s*\(.*?\)\s*/g, "").trim().toLowerCase();
          const cleanHost = (hostDisplayName || "").replace(/\s*\(.*?\)\s*/g, "").trim().toLowerCase();
          const isPeerHost = Boolean(cleanHost && cleanPeer === cleanHost);

          return (
            <div
              key={peer.clientId}
              className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {getInitials(peer.displayName)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-200 truncate">
                    {peer.displayName}
                  </p>
                  {isPeerHost ? (
                    <span className="text-[10px] text-blue-400 font-medium flex items-center gap-0.5">
                      <Crown className="w-2.5 h-2.5" /> Host
                    </span>
                  ) : (
                    <span className="text-[10px] text-gray-400 font-medium">Guest</span>
                  )}
                </div>
              </div>

            <div className="flex items-center gap-2 text-gray-400">
              {peer.isMuted ? (
                <MicOff className="w-4 h-4 text-red-400" />
              ) : (
                <Mic className="w-4 h-4 text-emerald-400" />
              )}
              {peer.isVideoOff ? (
                <VideoOff className="w-4 h-4 text-red-400" />
              ) : (
                <Video className="w-4 h-4 text-gray-300" />
              )}

              {/* Host Control: Remove Peer */}
              {isLocalHost && onRemovePeer && (
                <button
                  onClick={() => onRemovePeer(peer.clientId)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-all cursor-pointer"
                  title="Remove from meeting"
                >
                  <UserX className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        );
      })}
      </div>

      {/* Footer / Host Controls */}
      <div className="p-3 border-t border-white/10 space-y-2 bg-[#171B21]">
        {isLocalHost && (
          <button
            onClick={onMuteAll}
            className="w-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <VolumeX className="w-3.5 h-3.5" />
            <span>Mute All</span>
          </button>
        )}

        <button
          onClick={onOpenInvite}
          className="w-full bg-[#0E71EB] hover:bg-[#0050C8] text-white text-xs font-semibold py-2 px-3 rounded-lg transition-colors cursor-pointer"
        >
          Invite
        </button>
      </div>
    </aside>
  );
}
