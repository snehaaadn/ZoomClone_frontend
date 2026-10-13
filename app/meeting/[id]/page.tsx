"use client";

import React, { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Meeting } from "@/types";
import { useMediaStream, stopAllGlobalMediaTracks } from "@/hooks/useMediaStream";
import { useScreenShare } from "@/hooks/useScreenShare";
import { useWebRTC } from "@/hooks/useWebRTC";
import { MeetingHeader } from "@/components/meeting/MeetingHeader";
import { VideoGrid } from "@/components/meeting/VideoGrid";
import { ControlBar } from "@/components/meeting/ControlBar";
import { ParticipantDrawer } from "@/components/meeting/ParticipantDrawer";
import { ChatDrawer } from "@/components/meeting/ChatDrawer";
import { InviteModal } from "@/components/modals/InviteModal";
import { PreJoinScreen } from "@/components/meeting/PreJoinScreen";
import { AlertCircle, Loader2 } from "lucide-react";

interface MeetingPageProps {
  params: Promise<{ id: string }>;
}

export default function MeetingRoomPage({ params }: MeetingPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const meetingIdParam = resolvedParams.id;

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [isLoadingMeeting, setIsLoadingMeeting] = useState<boolean>(true);
  const [meetingError, setMeetingError] = useState<string | null>(null);

  // Check if this browser tab has already joined this specific meeting
  const [hasJoined, setHasJoined] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const joinedMeeting = sessionStorage.getItem("zoom_meeting_joined");
      const storedName = sessionStorage.getItem("zoom_display_name");
      const isMatch =
        joinedMeeting &&
        (joinedMeeting === meetingIdParam ||
          joinedMeeting.replace(/-/g, "") === meetingIdParam.replace(/-/g, ""));
      return Boolean(isMatch && storedName && storedName.trim());
    }
    return false;
  });

  // User state
  const [displayName, setDisplayName] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return (sessionStorage.getItem("zoom_display_name") || "")
        .replace(/\s*\(Host\)\s*/gi, "")
        .trim();
    }
    return "";
  });

  const [clientId, setClientId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("zoom_client_id") || "";
    }
    return "";
  });

  const [isHost, setIsHost] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("zoom_is_host") === "true";
    }
    return false;
  });

  const [urlPasscode, setUrlPasscode] = useState<string>("");

  // Extract passcode from ?pwd= URL search query
  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const pwd = searchParams.get("pwd");
      if (pwd) {
        setUrlPasscode(pwd);
        sessionStorage.setItem("zoom_passcode", pwd);
      }
    }
  }, []);

  // UI state
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [layout, setLayout] = useState<"gallery" | "speaker">("gallery");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [pinnedPeerId, setPinnedPeerId] = useState<string | null>(null);
  const [activeReaction, setActiveReaction] = useState<string | null>(null);

  // Fetch meeting details from backend
  useEffect(() => {
    async function loadMeeting() {
      setIsLoadingMeeting(true);
      try {
        const data = await api.getMeeting(meetingIdParam);
        setMeeting(data);

        // If user already joined prior to load (e.g. host from dashboard), ensure backend registration
        if (hasJoined && clientId && displayName) {
          const storedHostFlag = sessionStorage.getItem("zoom_is_host") === "true";
          const cleanUser = displayName.replace(/\s*\(.*?\)\s*/g, "").trim().toLowerCase();
          const cleanHost = (data.host_display_name || "")
            .replace(/\s*\(.*?\)\s*/g, "")
            .trim()
            .toLowerCase();
          const userIsHost = storedHostFlag && Boolean(cleanUser && cleanHost && cleanUser === cleanHost);
          setIsHost(userIsHost);

          await api.joinMeeting(data.meeting_id, {
            display_name: displayName,
            client_id: clientId,
            is_host: userIsHost,
            passcode: sessionStorage.getItem("zoom_passcode") || undefined,
          }).catch(console.error);
        }
      } catch (err: any) {
        setMeetingError(err.message || "Failed to load meeting details.");
      } finally {
        setIsLoadingMeeting(false);
      }
    }

    loadMeeting();
  }, [meetingIdParam, hasJoined, clientId, displayName]);

  // Read initial audio/video preferences stably on mount
  const [initialVideoPref] = useState(() => {
    if (typeof window !== "undefined") {
      const isOff = sessionStorage.getItem("zoom_video_off") === "true";
      sessionStorage.removeItem("zoom_video_off");
      return !isOff;
    }
    return true;
  });

  const [initialAudioPref] = useState(() => {
    if (typeof window !== "undefined") {
      const isOff = sessionStorage.getItem("zoom_audio_off") === "true";
      sessionStorage.removeItem("zoom_audio_off");
      return !isOff;
    }
    return true;
  });

  // Local media stream hook
  const {
    stream: localStream,
    isVideoEnabled,
    isAudioEnabled,
    toggleVideo,
    toggleAudio,
    setAudioState,
    stopStream: stopLocalStream,
    permissionError,
    retry: retryLocalStream,
  } = useMediaStream(initialVideoPref, initialAudioPref, true);

  // Screen share hook
  const {
    screenStream,
    isSharing: isScreenSharing,
    startScreenShare,
    stopScreenShare,
  } = useScreenShare();

  const stopAllMediaTracks = useCallback(() => {
    stopLocalStream();
    stopScreenShare();
    stopAllGlobalMediaTracks();
  }, [stopLocalStream, stopScreenShare]);

  // Clean up all media tracks when exiting the meeting room
  useEffect(() => {
    const handleExit = () => {
      stopLocalStream();
      stopScreenShare();
      stopAllGlobalMediaTracks();
    };

    window.addEventListener("beforeunload", handleExit);
    window.addEventListener("pagehide", handleExit);
    window.addEventListener("popstate", handleExit);

    return () => {
      handleExit();
      window.removeEventListener("beforeunload", handleExit);
      window.removeEventListener("pagehide", handleExit);
      window.removeEventListener("popstate", handleExit);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Callbacks for WebRTC signaling events
  const handleKicked = useCallback((reason: string) => {
    stopAllMediaTracks();
    alert(reason);
    window.location.href = "/";
  }, [stopAllMediaTracks]);

  const handleMeetingEnded = useCallback((reason: string) => {
    stopAllMediaTracks();
    alert(reason);
    window.location.href = "/";
  }, [stopAllMediaTracks]);

  const handleMuteRequested = useCallback(() => {
    setAudioState(false);
  }, [setAudioState]);

  // Real-time WebRTC & signaling hook (only active once user has joined)
  const {
    peerStreams,
    chatMessages,
    unreadChatCount,
    clearUnreadCount,
    sendChatMessage,
    broadcastMediaState,
    sendReaction,
    broadcastScreenState,
    sendMuteAll,
    removePeer,
    endMeetingForEveryone,
  } = useWebRTC({
    meetingId: meeting?.meeting_id || meetingIdParam,
    clientId,
    displayName,
    localStream,
    enabled: hasJoined && Boolean(clientId) && Boolean(displayName),
    onKicked: handleKicked,
    onMeetingEnded: handleMeetingEnded,
    onMuteRequested: handleMuteRequested,
    onReactionReceived: (emoji) => {
      setActiveReaction(emoji);
      setTimeout(() => setActiveReaction(null), 3000);
    },
  });

  // Broadcast local media track state when changed
  useEffect(() => {
    if (hasJoined) {
      broadcastMediaState(isAudioEnabled, isVideoEnabled);
    }
  }, [hasJoined, isAudioEnabled, isVideoEnabled, broadcastMediaState]);

  // Broadcast screen sharing state to peers
  useEffect(() => {
    if (hasJoined) {
      broadcastScreenState(isScreenSharing);
    }
  }, [hasJoined, isScreenSharing, broadcastScreenState]);

  // Clear unread count when chat drawer is opened
  useEffect(() => {
    if (isChatOpen) {
      clearUnreadCount();
    }
  }, [isChatOpen, clearUnreadCount]);

  // Handler for joining from PreJoinScreen
  const handleJoinFromPreJoin = async (name: string, passcode?: string, claimHost?: boolean) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    const assignedClientId =
      clientId || `client-${Math.random().toString(36).substring(2, 9)}`;

    const userIsHost = Boolean(
      claimHost &&
      meeting &&
      trimmed.replace(/\s*\(.*?\)\s*/g, "").trim().toLowerCase() ===
        meeting.host_display_name.replace(/\s*\(.*?\)\s*/g, "").trim().toLowerCase()
    );

    if (typeof window !== "undefined") {
      sessionStorage.setItem("zoom_client_id", assignedClientId);
      sessionStorage.setItem("zoom_display_name", trimmed);
      sessionStorage.setItem("zoom_is_host", userIsHost ? "true" : "false");
      sessionStorage.setItem("zoom_meeting_joined", meeting?.meeting_id || meetingIdParam);
      if (passcode) {
        sessionStorage.setItem("zoom_passcode", passcode);
      }
    }

    setDisplayName(trimmed);
    setClientId(assignedClientId);
    setIsHost(userIsHost);
    setHasJoined(true);

    if (meeting) {
      try {
        await api.joinMeeting(meeting.meeting_id, {
          display_name: trimmed,
          client_id: assignedClientId,
          is_host: userIsHost,
          passcode: passcode || undefined,
        });
      } catch (err: any) {
        console.error("Backend join error:", err);
      }
    }
  };

  // Fullscreen toggle handler
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(console.error);
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(console.error);
      setIsFullscreen(false);
    }
  };

  // Leave meeting handler (updates this participant's status to 'left' without ending meeting for others)
  const handleLeaveMeeting = async () => {
    stopAllMediaTracks();
    if (meeting && clientId) {
      api.leaveMeeting(meeting.meeting_id, clientId).catch(console.error);
    }
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("zoom_meeting_joined");
    }
    window.location.href = "/";
  };

  // End meeting for everyone handler (host only)
  const handleEndMeeting = async () => {
    stopAllMediaTracks();
    if (meeting) {
      endMeetingForEveryone();
      api.endMeeting(meeting.meeting_id).catch(console.error);
    }
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("zoom_meeting_joined");
    }
    window.location.href = "/";
  };

  // Send reaction emoji
  const handleSendReaction = (emoji: string) => {
    setActiveReaction(emoji);
    sendReaction(emoji);
    setTimeout(() => setActiveReaction(null), 3000);
  };

  if (isLoadingMeeting) {
    return (
      <div className="h-screen bg-[#12161A] text-white flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-[#0E71EB] animate-spin" />
        <p className="text-sm font-medium text-gray-300">Connecting to Zoom Meeting...</p>
      </div>
    );
  }

  if (meetingError || !meeting) {
    return (
      <div className="h-screen bg-[#12161A] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-white mb-2">Unable to Join Meeting</h2>
        <p className="text-sm text-gray-400 max-w-md mb-6">{meetingError || "Meeting not found."}</p>
        <button
          onClick={() => router.push("/")}
          className="bg-[#0E71EB] hover:bg-[#0050C8] text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // If user has not yet joined or provided their name, render the Pre-Join Screen
  if (!hasJoined) {
    return (
      <PreJoinScreen
        meeting={meeting}
        localStream={localStream}
        isVideoEnabled={isVideoEnabled}
        isAudioEnabled={isAudioEnabled}
        toggleVideo={toggleVideo}
        toggleAudio={toggleAudio}
        onJoin={handleJoinFromPreJoin}
        initialPasscode={urlPasscode || meeting.passcode}
        onCancel={() => router.push("/")}
      />
    );
  }

  return (
    <div className="h-screen w-screen bg-[#12161A] flex flex-col overflow-hidden relative select-none">
      {/* Meeting Header */}
      <MeetingHeader
        meeting={meeting}
        layout={layout}
        onToggleLayout={() => setLayout(layout === "gallery" ? "speaker" : "gallery")}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        onOpenInvite={() => setIsInviteModalOpen(true)}
      />

      {/* Floating Reaction Animation */}
      {activeReaction && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 text-5xl animate-bounce z-40 pointer-events-none drop-shadow-lg">
          {activeReaction}
        </div>
      )}

      {/* Recording Pill Indicator */}
      {isRecording && (
        <div className="absolute top-14 left-4 z-30 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full border border-red-500/30 flex items-center gap-2 text-xs text-white">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
          <span className="font-semibold text-red-400">Recording</span>
        </div>
      )}

      {/* Permission helper pill if browser blocked automatic prompt */}
      {permissionError && !isVideoEnabled && !isAudioEnabled && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-[#1E232A]/95 border border-amber-500/40 text-amber-200 px-4 py-2 rounded-xl text-xs flex items-center gap-3 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2">
          <span>Camera & microphone access blocked in browser.</span>
          <button
            onClick={() => retryLocalStream()}
            className="bg-[#0E71EB] hover:bg-[#0050C8] text-white px-3 py-1 rounded-lg font-semibold text-xs cursor-pointer transition-colors shadow-xs"
          >
            Allow Permissions
          </button>
        </div>
      )}

      {/* Center Meeting Stage */}
      <div className="flex-1 flex overflow-hidden relative">
        <VideoGrid
          localStream={localStream}
          localDisplayName={displayName}
          isLocalMuted={!isAudioEnabled}
          isLocalVideoOff={!isVideoEnabled}
          peerStreams={peerStreams}
          screenStream={screenStream}
          isScreenSharing={isScreenSharing}
          onStopScreenShare={stopScreenShare}
          onOpenInvite={() => setIsInviteModalOpen(true)}
          isHost={isHost}
          hostDisplayName={meeting.host_display_name}
          pinnedPeerId={pinnedPeerId}
          onTogglePin={(id) => setPinnedPeerId(pinnedPeerId === id ? null : id)}
        />

        {/* Slide-over Participants Drawer */}
        <ParticipantDrawer
          isOpen={isParticipantsOpen}
          onClose={() => setIsParticipantsOpen(false)}
          localDisplayName={displayName}
          isLocalHost={isHost}
          hostDisplayName={meeting.host_display_name}
          isLocalMuted={!isAudioEnabled}
          isLocalVideoOff={!isVideoEnabled}
          peerStreams={peerStreams}
          onMuteAll={isHost ? sendMuteAll : undefined}
          onRemovePeer={isHost ? removePeer : undefined}
          onOpenInvite={() => setIsInviteModalOpen(true)}
        />

        {/* Slide-over Chat Drawer */}
        <ChatDrawer
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          messages={chatMessages}
          onSendMessage={sendChatMessage}
        />
      </div>

      {/* Zoom Control Bar */}
      <ControlBar
        isMuted={!isAudioEnabled}
        isVideoOff={!isVideoEnabled}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        isSharingScreen={isScreenSharing}
        onToggleScreenShare={isScreenSharing ? stopScreenShare : startScreenShare}
        isParticipantsOpen={isParticipantsOpen}
        onToggleParticipants={() => {
          setIsParticipantsOpen(!isParticipantsOpen);
          if (!isParticipantsOpen) setIsChatOpen(false);
        }}
        participantCount={1 + peerStreams.length}
        isChatOpen={isChatOpen}
        onToggleChat={() => {
          setIsChatOpen(!isChatOpen);
          if (!isChatOpen) setIsParticipantsOpen(false);
        }}
        unreadChatCount={unreadChatCount}
        onLeaveMeeting={handleLeaveMeeting}
        onEndMeetingForEveryone={isHost ? handleEndMeeting : undefined}
        isHost={isHost}
        onSendReaction={handleSendReaction}
        isRecording={isRecording}
        onToggleRecord={() => setIsRecording(!isRecording)}
      />

      {/* Invite Modal in Meeting */}
      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        meeting={meeting}
      />
    </div>
  );
}
