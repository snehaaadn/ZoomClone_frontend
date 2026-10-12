"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/layout/TopNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { ClockWidget } from "@/components/dashboard/ClockWidget";
import { ActionCards } from "@/components/dashboard/ActionCards";
import { UpcomingMeetings } from "@/components/dashboard/UpcomingMeetings";
import { RecentMeetings } from "@/components/dashboard/RecentMeetings";
import { InstantMeetingModal } from "@/components/modals/InstantMeetingModal";
import { JoinModal } from "@/components/modals/JoinModal";
import { ScheduleModal } from "@/components/modals/ScheduleModal";
import { InviteModal } from "@/components/modals/InviteModal";
import { api } from "@/lib/api";
import { Meeting } from "@/types";
import { Calendar, History, RefreshCw, AlertCircle } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();

  const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([]);
  const [recentMeetings, setRecentMeetings] = useState<Meeting[]>([]);
  const [activeTab, setActiveTab] = useState<"upcoming" | "recent">("upcoming");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modals state
  const [isInstantModalOpen, setIsInstantModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [inviteMeeting, setInviteMeeting] = useState<Meeting | null>(null);
  const [isCreatingInstant, setIsCreatingInstant] = useState(false);

  const fetchMeetings = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [upcoming, recent] = await Promise.all([
        api.getUpcomingMeetings(),
        api.getRecentMeetings(20),
      ]);
      setUpcomingMeetings(upcoming);
      setRecentMeetings(recent);
    } catch (err: any) {
      console.error("Failed to load meetings:", err);
      setErrorMsg(
        err.message || "Failed to connect to the FastAPI backend. Please ensure the backend is running."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  // Handler for New Meeting
  const handleStartInstantMeeting = async (config: {
    title: string;
    isAudioEnabled: boolean;
    isVideoEnabled: boolean;
  }) => {
    setIsCreatingInstant(true);
    try {
      const meeting = await api.createInstantMeeting({
        title: config.title,
        host_display_name: "Sneha Debnath",
      });

      // Save preferences to session
      if (typeof window !== "undefined") {
        sessionStorage.setItem("zoom_audio_off", (!config.isAudioEnabled).toString());
        sessionStorage.setItem("zoom_video_off", (!config.isVideoEnabled).toString());
        sessionStorage.setItem("zoom_display_name", "Sneha Debnath");
      }

      setIsInstantModalOpen(false);
      router.push(`/meeting/${meeting.meeting_id}`);
    } catch (err: any) {
      alert(`Error creating instant meeting: ${err.message}`);
    } finally {
      setIsCreatingInstant(false);
    }
  };

  // Handler for starting any meeting card
  const handleStartExistingMeeting = (meeting: Meeting) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("zoom_display_name", "Sneha Debnath");
      sessionStorage.setItem("zoom_passcode", meeting.passcode);
    }
    router.push(`/meeting/${meeting.meeting_id}`);
  };

  // Handler for cancelling / deleting a scheduled meeting
  const handleCancelMeeting = async (meeting: Meeting) => {
    if (!confirm(`Are you sure you want to cancel "${meeting.title}"?`)) return;

    try {
      await api.cancelMeeting(meeting.meeting_id);
      fetchMeetings();
    } catch (err: any) {
      alert(`Failed to cancel meeting: ${err.message}`);
    }
  };

  // Callback when a new meeting is scheduled
  const handleMeetingScheduled = (newMeeting: Meeting) => {
    setUpcomingMeetings((prev) => [newMeeting, ...prev]);
    setActiveTab("upcoming");
    setInviteMeeting(newMeeting); // Automatically open invite dialog with copy link
  };

  const nextUpcoming = upcomingMeetings.length > 0 ? upcomingMeetings[0] : null;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#F7F9FA]">
      {/* Top Navigation */}
      <TopNav />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          onNewMeetingClick={() => setIsInstantModalOpen(true)}
          onJoinClick={() => setIsJoinModalOpen(true)}
          onScheduleClick={() => setIsScheduleModalOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
          <div className="max-w-5xl mx-auto">
            {/* Error Banner */}
            {errorMsg && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-xs text-red-800">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
                <button
                  onClick={fetchMeetings}
                  className="font-medium underline hover:text-red-900 cursor-pointer"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Prominent Clock Banner with Next Meeting Spotlight */}
            <ClockWidget
              nextMeeting={nextUpcoming}
              onStartMeeting={handleStartExistingMeeting}
              onScheduleClick={() => setIsScheduleModalOpen(true)}
            />

            {/* The 4 Zoom Action Cards */}
            <ActionCards
              onNewMeeting={() => setIsInstantModalOpen(true)}
              onJoinMeeting={() => setIsJoinModalOpen(true)}
              onScheduleMeeting={() => setIsScheduleModalOpen(true)}
              onShareScreen={() => setIsJoinModalOpen(true)}
              isCreatingInstant={isCreatingInstant}
            />

            {/* Meetings Section (Upcoming & Recent Tabs) */}
            <div className="mt-8 bg-white border border-[#E4E7EB] rounded-2xl shadow-xs overflow-hidden">
              {/* Tabs Header */}
              <div className="px-6 py-3 border-b border-[#E4E7EB] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setActiveTab("upcoming")}
                    className={`flex items-center gap-2 py-2 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                      activeTab === "upcoming"
                        ? "border-[#0E71EB] text-[#0E71EB]"
                        : "border-transparent text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Upcoming Meetings</span>
                    {upcomingMeetings.length > 0 && (
                      <span className="text-xs bg-blue-100 text-[#0E71EB] font-bold px-1.5 py-0.2 rounded-full">
                        {upcomingMeetings.length}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setActiveTab("recent")}
                    className={`flex items-center gap-2 py-2 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                      activeTab === "recent"
                        ? "border-[#0E71EB] text-[#0E71EB]"
                        : "border-transparent text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    <History className="w-4 h-4" />
                    <span>Recent Meetings</span>
                    {recentMeetings.length > 0 && (
                      <span className="text-xs bg-gray-100 text-gray-600 font-bold px-1.5 py-0.2 rounded-full">
                        {recentMeetings.length}
                      </span>
                    )}
                  </button>
                </div>

                <button
                  onClick={fetchMeetings}
                  disabled={isLoading}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                  title="Refresh Meetings"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-[#0E71EB]" : ""}`} />
                </button>
              </div>

              {/* Tab Contents */}
              <div className="p-6">
                {activeTab === "upcoming" ? (
                  <UpcomingMeetings
                    meetings={upcomingMeetings}
                    isLoading={isLoading}
                    onStartMeeting={handleStartExistingMeeting}
                    onCancelMeeting={handleCancelMeeting}
                    onOpenInviteModal={(m) => setInviteMeeting(m)}
                  />
                ) : (
                  <RecentMeetings
                    meetings={recentMeetings}
                    isLoading={isLoading}
                    onRestartMeeting={handleStartExistingMeeting}
                  />
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      {isInstantModalOpen && (
        <InstantMeetingModal
          isOpen={isInstantModalOpen}
          onClose={() => setIsInstantModalOpen(false)}
          onConfirmStart={handleStartInstantMeeting}
          isLoading={isCreatingInstant}
        />
      )}

      <JoinModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
      />

      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onMeetingScheduled={handleMeetingScheduled}
      />

      <InviteModal
        isOpen={Boolean(inviteMeeting)}
        onClose={() => setInviteMeeting(null)}
        meeting={inviteMeeting}
      />
    </div>
  );
}
