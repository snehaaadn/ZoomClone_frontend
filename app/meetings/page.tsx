"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/layout/TopNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { UpcomingMeetings } from "@/components/dashboard/UpcomingMeetings";
import { RecentMeetings } from "@/components/dashboard/RecentMeetings";
import { ScheduleModal } from "@/components/modals/ScheduleModal";
import { InviteModal } from "@/components/modals/InviteModal";
import { api } from "@/lib/api";
import { Meeting } from "@/types";
import { Calendar, History, Shield, Video, Copy, Plus } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export default function MeetingsPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"upcoming" | "previous" | "personal">("upcoming");
  const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([]);
  const [recentMeetings, setRecentMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [inviteMeeting, setInviteMeeting] = useState<Meeting | null>(null);
  const [copiedPmi, setCopiedPmi] = useState(false);

  const personalMeetingId = "842-1920-3341";
  const personalInviteLink = `http://localhost:3000/meeting/${personalMeetingId}`;

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [upcoming, recent] = await Promise.all([
        api.getUpcomingMeetings(),
        api.getRecentMeetings(),
      ]);
      setUpcomingMeetings(upcoming);
      setRecentMeetings(recent);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStartPmi = () => {
    router.push(`/meeting/${personalMeetingId}`);
  };

  const handleCopyPmi = async () => {
    const ok = await copyToClipboard(personalInviteLink);
    if (ok) {
      setCopiedPmi(true);
      setTimeout(() => setCopiedPmi(false), 2000);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#F7F9FA]">
      <TopNav />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          onNewMeetingClick={() => router.push("/")}
          onJoinClick={() => router.push("/join")}
          onScheduleClick={() => setIsScheduleOpen(true)}
        />

        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Meetings</h2>
                <p className="text-xs text-gray-500">Manage your scheduled sessions and personal meeting room</p>
              </div>
              <button
                onClick={() => setIsScheduleOpen(true)}
                className="bg-[#0E71EB] hover:bg-[#0050C8] text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Schedule a Meeting</span>
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-6 border-b border-[#E4E7EB] mb-6">
              <button
                onClick={() => setActiveTab("upcoming")}
                className={`pb-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                  activeTab === "upcoming"
                    ? "border-[#0E71EB] text-[#0E71EB]"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                Upcoming ({upcomingMeetings.length})
              </button>
              <button
                onClick={() => setActiveTab("previous")}
                className={`pb-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                  activeTab === "previous"
                    ? "border-[#0E71EB] text-[#0E71EB]"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                Previous ({recentMeetings.length})
              </button>
              <button
                onClick={() => setActiveTab("personal")}
                className={`pb-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                  activeTab === "personal"
                    ? "border-[#0E71EB] text-[#0E71EB]"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                Personal Room (PMI)
              </button>
            </div>

            {/* Content Tabs */}
            {activeTab === "upcoming" && (
              <UpcomingMeetings
                meetings={upcomingMeetings}
                isLoading={isLoading}
                onStartMeeting={(m) => router.push(`/meeting/${m.meeting_id}`)}
                onCancelMeeting={async (m) => {
                  if (confirm(`Cancel "${m.title}"?`)) {
                    await api.cancelMeeting(m.meeting_id);
                    loadData();
                  }
                }}
                onOpenInviteModal={(m) => setInviteMeeting(m)}
              />
            )}

            {activeTab === "previous" && (
              <RecentMeetings
                meetings={recentMeetings}
                isLoading={isLoading}
                onRestartMeeting={(m) => router.push(`/meeting/${m.meeting_id}`)}
              />
            )}

            {activeTab === "personal" && (
              <div className="bg-white border border-[#E4E7EB] rounded-2xl p-6 shadow-xs space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 text-base">Personal Meeting Room</h3>
                  <p className="text-xs text-gray-500">Your dedicated personal room that never expires.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                    <span className="text-gray-500 block">Personal Meeting ID</span>
                    <span className="font-mono font-bold text-gray-900 text-base">{personalMeetingId}</span>
                  </div>
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                    <span className="text-gray-500 block">Host Name</span>
                    <span className="font-semibold text-gray-900 text-sm">Sneha Debnath (Host)</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleStartPmi}
                    className="bg-[#0E71EB] hover:bg-[#0050C8] text-white px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
                  >
                    <Video className="w-4 h-4" />
                    <span>Start Personal Room</span>
                  </button>
                  <button
                    onClick={handleCopyPmi}
                    className="border border-gray-200 hover:bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Copy className="w-4 h-4" />
                    <span>{copiedPmi ? "Copied!" : "Copy Invitation"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <ScheduleModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        onMeetingScheduled={(m) => {
          setUpcomingMeetings((prev) => [m, ...prev]);
          setInviteMeeting(m);
        }}
      />

      <InviteModal
        isOpen={Boolean(inviteMeeting)}
        onClose={() => setInviteMeeting(null)}
        meeting={inviteMeeting}
      />
    </div>
  );
}
