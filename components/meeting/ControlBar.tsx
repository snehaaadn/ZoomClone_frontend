"use client";

import React, { useState } from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Shield,
  Users,
  MessageSquare,
  ScreenShare,
  Smile,
  CircleDot,
  ChevronUp,
  PhoneOff,
  Lock,
  Unlock,
} from "lucide-react";

interface ControlBarProps {
  isMuted: boolean;
  isVideoOff: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  isSharingScreen: boolean;
  onToggleScreenShare: () => void;
  isParticipantsOpen: boolean;
  onToggleParticipants: () => void;
  participantCount: number;
  isChatOpen: boolean;
  onToggleChat: () => void;
  unreadChatCount: number;
  onLeaveMeeting: () => void;
  onEndMeetingForEveryone?: () => void;
  isHost: boolean;
  onSendReaction: (emoji: string) => void;
  isRecording: boolean;
  onToggleRecord: () => void;
}

export function ControlBar({
  isMuted,
  isVideoOff,
  onToggleAudio,
  onToggleVideo,
  isSharingScreen,
  onToggleScreenShare,
  isParticipantsOpen,
  onToggleParticipants,
  participantCount,
  isChatOpen,
  onToggleChat,
  unreadChatCount,
  onLeaveMeeting,
  onEndMeetingForEveryone,
  isHost,
  onSendReaction,
  isRecording,
  onToggleRecord,
}: ControlBarProps) {
  const [showSecurityMenu, setShowSecurityMenu] = useState(false);
  const [showReactionsMenu, setShowReactionsMenu] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [isMeetingLocked, setIsMeetingLocked] = useState(false);

  const reactions = ["👍", "👏", "❤️", "😂", "🎉", "✋"];

  return (
    <footer className="h-18 bg-[#1A1D20] px-4 flex items-center justify-between border-t border-white/5 select-none relative z-30 shrink-0">
      {/* Left: Audio & Video controls */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Audio (Mute / Unmute) */}
        <div className="flex items-center group">
          <button
            onClick={onToggleAudio}
            className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-lg text-white hover:bg-white/10 transition-colors cursor-pointer min-w-[56px] ${
              isMuted ? "text-red-400" : "text-white"
            }`}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <MicOff className="w-5 h-5 text-red-500 mb-1" />
            ) : (
              <Mic className="w-5 h-5 mb-1" />
            )}
            <span className="text-[10px] font-medium leading-none">
              {isMuted ? "Unmute" : "Mute"}
            </span>
          </button>
        </div>

        {/* Video (Start / Stop Video) */}
        <div className="flex items-center group">
          <button
            onClick={onToggleVideo}
            className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-lg text-white hover:bg-white/10 transition-colors cursor-pointer min-w-[56px] ${
              isVideoOff ? "text-red-400" : "text-white"
            }`}
            title={isVideoOff ? "Start Video" : "Stop Video"}
          >
            {isVideoOff ? (
              <VideoOff className="w-5 h-5 text-red-500 mb-1" />
            ) : (
              <Video className="w-5 h-5 mb-1" />
            )}
            <span className="text-[10px] font-medium leading-none">
              {isVideoOff ? "Start Video" : "Stop Video"}
            </span>
          </button>
        </div>
      </div>

      {/* Center: Collaboration controls */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Security Menu */}
        <div className="relative hidden md:block">
          <button
            onClick={() => setShowSecurityMenu(!showSecurityMenu)}
            className="flex flex-col items-center justify-center px-3 py-1.5 rounded-lg text-white hover:bg-white/10 transition-colors cursor-pointer min-w-[56px]"
            title="Security Settings"
          >
            <Shield className="w-5 h-5 mb-1 text-gray-200" />
            <span className="text-[10px] font-medium leading-none text-gray-300">Security</span>
          </button>

          {showSecurityMenu && (
            <div
              className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-56 bg-[#242728] border border-white/10 rounded-xl shadow-2xl p-2 text-xs text-white z-50 space-y-1 animate-in fade-in zoom-in-95"
              onMouseLeave={() => setShowSecurityMenu(false)}
            >
              <div className="px-3 py-1.5 font-semibold text-gray-400 uppercase tracking-wider text-[10px]">
                Host Permissions
              </div>
              <button
                onClick={() => setIsMeetingLocked(!isMeetingLocked)}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>Lock Meeting</span>
                {isMeetingLocked ? (
                  <Lock className="w-3.5 h-3.5 text-red-400" />
                ) : (
                  <Unlock className="w-3.5 h-3.5 text-gray-400" />
                )}
              </button>
              <div className="px-3 py-1.5 font-semibold text-gray-400 uppercase tracking-wider text-[10px] border-t border-white/5 pt-2">
                Allow Participants To:
              </div>
              <div className="px-3 py-1 text-gray-300 text-[11px] flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded bg-gray-700" />
                <span>Share Screen</span>
              </div>
              <div className="px-3 py-1 text-gray-300 text-[11px] flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded bg-gray-700" />
                <span>Chat</span>
              </div>
              <div className="px-3 py-1 text-gray-300 text-[11px] flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded bg-gray-700" />
                <span>Rename Themselves</span>
              </div>
            </div>
          )}
        </div>

        {/* Participants */}
        <button
          onClick={onToggleParticipants}
          className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-lg text-white hover:bg-white/10 transition-colors cursor-pointer min-w-[56px] relative ${
            isParticipantsOpen ? "bg-white/15" : ""
          }`}
          title="Participants"
        >
          <div className="relative">
            <Users className="w-5 h-5 mb-1 text-gray-200" />
            <span className="absolute -top-1 -right-2 bg-blue-500 text-white text-[9px] font-bold px-1 rounded-full leading-tight">
              {participantCount}
            </span>
          </div>
          <span className="text-[10px] font-medium leading-none text-gray-300">
            Participants
          </span>
        </button>

        {/* Chat */}
        <button
          onClick={onToggleChat}
          className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-lg text-white hover:bg-white/10 transition-colors cursor-pointer min-w-[56px] relative ${
            isChatOpen ? "bg-white/15" : ""
          }`}
          title="In-meeting Chat"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5 mb-1 text-gray-200" />
            {unreadChatCount > 0 && !isChatOpen && (
              <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[9px] font-bold px-1.5 rounded-full leading-tight animate-bounce">
                {unreadChatCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium leading-none text-gray-300">Chat</span>
        </button>

        {/* Share Screen (Vibrant Zoom Green) */}
        <button
          onClick={onToggleScreenShare}
          className={`flex flex-col items-center justify-center px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer min-w-[64px] ${
            isSharingScreen
              ? "bg-emerald-600/30 text-emerald-400"
              : "text-[#23D160] hover:bg-emerald-500/10"
          }`}
          title={isSharingScreen ? "Stop Screen Share" : "Share Screen"}
        >
          <ScreenShare className="w-5 h-5 mb-1 text-[#23D160] stroke-[2.4]" />
          <span className="text-[10px] font-semibold leading-none text-[#23D160]">
            {isSharingScreen ? "Sharing" : "Share Screen"}
          </span>
        </button>

        {/* Record button */}
        <button
          onClick={onToggleRecord}
          className={`hidden sm:flex flex-col items-center justify-center px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer min-w-[56px] ${
            isRecording ? "text-red-400" : "text-white"
          }`}
          title={isRecording ? "Stop Recording" : "Record to Cloud"}
        >
          <CircleDot className={`w-5 h-5 mb-1 ${isRecording ? "text-red-500 animate-pulse" : "text-gray-200"}`} />
          <span className="text-[10px] font-medium leading-none text-gray-300">
            {isRecording ? "Recording" : "Record"}
          </span>
        </button>

        {/* Reactions */}
        <div className="relative">
          <button
            onClick={() => setShowReactionsMenu(!showReactionsMenu)}
            className="flex flex-col items-center justify-center px-3 py-1.5 rounded-lg text-white hover:bg-white/10 transition-colors cursor-pointer min-w-[56px]"
            title="Send Reaction"
          >
            <Smile className="w-5 h-5 mb-1 text-gray-200" />
            <span className="text-[10px] font-medium leading-none text-gray-300">Reactions</span>
          </button>

          {showReactionsMenu && (
            <div
              className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-[#242728] border border-white/10 rounded-full shadow-2xl p-2 flex items-center gap-2 z-50 animate-in fade-in zoom-in-95"
              onMouseLeave={() => setShowReactionsMenu(false)}
            >
              {reactions.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    onSendReaction(emoji);
                    setShowReactionsMenu(false);
                  }}
                  className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center text-base transition-transform hover:scale-125 cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: End / Leave Meeting Button (Zoom Red) */}
      <div className="flex items-center">
        <button
          onClick={() => setShowEndModal(true)}
          className="bg-[#E02828] hover:bg-[#B71C1C] text-white px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
        >
          <PhoneOff className="w-3.5 h-3.5" />
          <span>{isHost ? "End" : "Leave"}</span>
        </button>

        {/* End / Leave Confirmation Modal */}
        {showEndModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
            <div className="bg-[#242728] text-white rounded-2xl border border-white/10 shadow-2xl p-6 w-full max-w-sm text-center space-y-4">
              <h3 className="font-semibold text-base">
                {isHost ? "End meeting or leave?" : "Leave Meeting?"}
              </h3>
              <p className="text-xs text-gray-300">
                {isHost
                  ? "Ending the meeting will disconnect all participants."
                  : "You can rejoin later if the meeting is still active."}
              </p>

              <div className="space-y-2 pt-2">
                {isHost && onEndMeetingForEveryone && (
                  <button
                    onClick={() => {
                      setShowEndModal(false);
                      onEndMeetingForEveryone();
                    }}
                    className="w-full bg-[#E02828] hover:bg-[#B71C1C] text-white py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    End Meeting for All
                  </button>
                )}

                <button
                  onClick={() => {
                    setShowEndModal(false);
                    onLeaveMeeting();
                  }}
                  className="w-full bg-white/10 hover:bg-white/20 text-white py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Leave Meeting
                </button>

                <button
                  onClick={() => setShowEndModal(false)}
                  className="w-full text-gray-400 hover:text-white py-2 text-xs font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </footer>
  );
}
