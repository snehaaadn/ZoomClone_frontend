"use client";

import React, { useState, useRef, useEffect } from "react";
import { Meeting } from "@/types";
import { getInitials } from "@/lib/utils";
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  User,
  Crown,
  Lock,
  ArrowRight,
  ShieldCheck,
  Video,
} from "lucide-react";

interface PreJoinScreenProps {
  meeting: Meeting;
  localStream: MediaStream | null;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  toggleVideo: () => void;
  toggleAudio: () => void;
  onJoin: (name: string, passcode?: string, claimHost?: boolean) => void;
  initialPasscode?: string;
  onCancel?: () => void;
}

export function PreJoinScreen({
  meeting,
  localStream,
  isVideoEnabled,
  isAudioEnabled,
  toggleVideo,
  toggleAudio,
  onJoin,
  initialPasscode = "",
  onCancel,
}: PreJoinScreenProps) {
  const [name, setName] = useState("");
  const [passcode, setPasscode] = useState(initialPasscode || meeting.passcode || "");
  const [claimHost, setClaimHost] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Auto-play local stream in preview
  useEffect(() => {
    if (videoRef.current && localStream) {
      if (videoRef.current.srcObject !== localStream) {
        videoRef.current.srcObject = localStream;
      }
      videoRef.current.play().catch(() => {});
    }
  }, [localStream, isVideoEnabled]);

  // Check if entered name matches host name
  const cleanEntered = name.replace(/\s*\(.*?\)\s*/g, "").trim().toLowerCase();
  const cleanHost = (meeting.host_display_name || "").replace(/\s*\(.*?\)\s*/g, "").trim().toLowerCase();
  const isHostNameMatch = Boolean(cleanHost && cleanEntered === cleanHost);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage("Please enter your name to join the meeting.");
      return;
    }
    setErrorMessage("");
    onJoin(name.trim(), passcode.trim() || undefined, isHostNameMatch && claimHost);
  };

  return (
    <div className="min-h-screen w-screen bg-[#12161A] text-white flex flex-col justify-between p-4 sm:p-6 md:p-8">
      {/* Top Branding Bar */}
      <header className="flex items-center justify-between max-w-5xl mx-auto w-full py-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#0E71EB] flex items-center justify-center text-white shadow-md">
            <Video className="w-5 h-5 fill-white stroke-none" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white">Zoom Workplace</span>
        </div>
        <div className="text-xs text-gray-400 flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Encrypted Session</span>
        </div>
      </header>

      {/* Main Pre-Join Card */}
      <main className="flex-1 flex items-center justify-center py-6">
        <div className="bg-[#1E232A]/90 border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-8 max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center backdrop-blur-md">
          {/* Left Column: Live Camera Preview & AV Toggles */}
          <div className="flex flex-col items-center">
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-[#12161A] border border-white/10 shadow-inner flex items-center justify-center">
              {localStream && isVideoEnabled ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover -scale-x-100"
                />
              ) : (
                <div className="flex flex-col items-center justify-center select-none">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {name.trim() ? getInitials(name) : <User className="w-9 h-9 text-white/80" />}
                  </div>
                  <span className="text-gray-400 text-xs mt-3 font-medium">Camera is off</span>
                </div>
              )}

              {/* Media Controls Overlay */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15 z-10">
                <button
                  type="button"
                  onClick={toggleAudio}
                  className={`p-2 rounded-full transition-colors cursor-pointer flex items-center justify-center ${
                    isAudioEnabled
                      ? "bg-white/10 hover:bg-white/20 text-emerald-400"
                      : "bg-red-500/80 hover:bg-red-500 text-white"
                  }`}
                  title={isAudioEnabled ? "Mute Microphone" : "Unmute Microphone"}
                >
                  {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={toggleVideo}
                  className={`p-2 rounded-full transition-colors cursor-pointer flex items-center justify-center ${
                    isVideoEnabled
                      ? "bg-white/10 hover:bg-white/20 text-white"
                      : "bg-red-500/80 hover:bg-red-500 text-white"
                  }`}
                  title={isVideoEnabled ? "Turn Off Video" : "Turn On Video"}
                >
                  {isVideoEnabled ? <VideoIcon className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <p className="text-[11px] text-gray-400 mt-2 text-center">
              Preview your video and test audio before joining
            </p>
          </div>

          {/* Right Column: Meeting Info & Join Form */}
          <div className="flex flex-col justify-center">
            <div className="mb-5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0E71EB] bg-[#0E71EB]/10 px-2.5 py-1 rounded-md border border-[#0E71EB]/20">
                Ready to Join
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-white mt-2 leading-snug">
                {meeting.title}
              </h1>
              <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-400">
                <span>Meeting ID: <span className="font-mono text-gray-300">{meeting.meeting_id}</span></span>
                <span>•</span>
                <span className="flex items-center gap-1 text-blue-300">
                  <Crown className="w-3 h-3 text-blue-400" /> Host: {meeting.host_display_name}
                </span>
              </div>
            </div>

            {errorMessage && (
              <div className="mb-4 p-2.5 bg-red-500/20 border border-red-500/40 rounded-xl text-red-200 text-xs">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Your Display Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  autoFocus
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errorMessage) setErrorMessage("");
                  }}
                  placeholder="Enter your name (e.g. Rahul, Priya)"
                  className="w-full bg-[#12161A] border border-white/20 focus:border-[#0E71EB] focus:ring-2 focus:ring-[#0E71EB]/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition-all"
                  required
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  This name will be visible to all participants in the meeting.
                </p>
              </div>

              {/* Passcode input if required */}
              {meeting.passcode && (
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Meeting Passcode
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      placeholder="Enter passcode"
                      className="w-full bg-[#12161A] border border-white/20 focus:border-[#0E71EB] focus:ring-2 focus:ring-[#0E71EB]/20 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition-all font-mono"
                    />
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  </div>
                </div>
              )}

              {/* Host recognition toggle if name matches host */}
              {isHostNameMatch && (
                <div className="p-2.5 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-center gap-2.5 text-xs text-blue-200 animate-in fade-in">
                  <input
                    type="checkbox"
                    id="claimHostCheck"
                    checked={claimHost}
                    onChange={(e) => setClaimHost(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0E71EB] focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="claimHostCheck" className="cursor-pointer font-medium flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-blue-400" />
                    <span>I am the host ({meeting.host_display_name})</span>
                  </label>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  className="w-full bg-[#0E71EB] hover:bg-[#0050C8] text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm cursor-pointer active:scale-[0.99]"
                >
                  <span>Join Meeting</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {onCancel && (
                  <button
                    type="button"
                    onClick={onCancel}
                    className="w-full bg-white/5 hover:bg-white/10 text-gray-300 font-medium py-2 px-4 rounded-xl transition-colors text-xs cursor-pointer"
                  >
                    Return to Dashboard
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto w-full text-center text-[11px] text-gray-500 py-2">
        Zoom Workplace Web Client • Unique Participant Session
      </footer>
    </div>
  );
}
