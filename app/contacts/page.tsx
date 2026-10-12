"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/layout/TopNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { Users, Search, UserPlus, Video, MessageSquare, Mail, Phone } from "lucide-react";
import { api } from "@/lib/api";

export default function ContactsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const contacts = [
    {
      id: "1",
      name: "Sneha Debnath",
      role: "Licensed Host & Lead Architect",
      email: "sneha.debnath@zoomclone.local",
      status: "Available",
      initials: "SD",
      color: "bg-blue-600",
    },
    {
      id: "2",
      name: "Alex Rivera",
      role: "Senior Frontend Engineer",
      email: "alex.rivera@zoomclone.local",
      status: "In a Meeting",
      initials: "AR",
      color: "bg-emerald-600",
    },
    {
      id: "3",
      name: "Sarah Chen",
      role: "Site Reliability & Cloud Lead",
      email: "sarah.chen@zoomclone.local",
      status: "Available",
      initials: "SC",
      color: "bg-indigo-600",
    },
    {
      id: "4",
      name: "Marcus Vance",
      role: "Principal Product Manager",
      email: "marcus.vance@zoomclone.local",
      status: "Offline",
      initials: "MV",
      color: "bg-amber-600",
    },
  ];

  const filtered = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMeetWithContact = async (contactName: string) => {
    try {
      const meeting = await api.createInstantMeeting({
        title: `1-on-1 with ${contactName}`,
        host_display_name: "Sneha Debnath",
      });
      router.push(`/meeting/${meeting.meeting_id}`);
    } catch (err: any) {
      alert(`Failed to start 1-on-1 meeting: ${err.message}`);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#F7F9FA]">
      <TopNav />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          onNewMeetingClick={() => router.push("/")}
          onJoinClick={() => router.push("/join")}
          onScheduleClick={() => router.push("/")}
        />

        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#0E71EB]" />
                  <span>Company Directory & Contacts</span>
                </h2>
                <p className="text-xs text-gray-500">
                  Connect and start 1-on-1 meetings with team members instantly.
                </p>
              </div>

              <button
                onClick={() => alert("Invite contact modal simulation: Link sent.")}
                className="bg-[#0E71EB] hover:bg-[#0050C8] text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Contact</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search contacts by name or role..."
                className="w-full bg-white border border-[#E4E7EB] rounded-xl pl-9 pr-4 py-2 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#0E71EB] shadow-xs"
              />
            </div>

            {/* Contacts Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((c) => (
                <div
                  key={c.id}
                  className="bg-white border border-[#E4E7EB] hover:border-[#CBD5E1] rounded-2xl p-4 flex items-center justify-between shadow-xs transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-full ${c.color} text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0`}
                    >
                      {c.initials}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm truncate">{c.name}</h4>
                      <p className="text-xs text-gray-500 truncate">{c.role}</p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-400">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            c.status === "Available"
                              ? "bg-emerald-500"
                              : c.status === "In a Meeting"
                              ? "bg-red-500"
                              : "bg-gray-400"
                          }`}
                        />
                        <span>{c.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleMeetWithContact(c.name)}
                      className="bg-[#0E71EB] hover:bg-[#0050C8] text-white p-2 rounded-lg transition-colors cursor-pointer"
                      title="Start 1-on-1 Meeting"
                    >
                      <Video className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => router.push("/team-chat")}
                      className="border border-gray-200 hover:bg-gray-100 text-gray-600 p-2 rounded-lg transition-colors cursor-pointer"
                      title="Send Message"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
