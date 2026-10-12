"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/layout/TopNav";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  Search,
  Plus,
  Hash,
  Send,
  Video,
  Smile,
  Paperclip,
  User,
  Users,
  CheckCircle2,
} from "lucide-react";
import { api } from "@/lib/api";

interface Message {
  id: string;
  sender: string;
  avatar: string;
  text: string;
  time: string;
  isSelf?: boolean;
}

const CHANNELS = [
  { id: "engineering", name: "engineering", unread: 2 },
  { id: "general", name: "general", unread: 0 },
  { id: "product-design", name: "product-design", unread: 1 },
  { id: "releases", name: "releases", unread: 0 },
];

const DIRECT_MESSAGES = [
  { id: "alex", name: "Alex Rivera", status: "online", role: "Frontend Lead" },
  { id: "sarah", name: "Sarah Chen", status: "busy", role: "DevOps Engineer" },
  { id: "marcus", name: "Marcus Vance", status: "offline", role: "Product Manager" },
];

export default function TeamChatPage() {
  const router = useRouter();
  const [activeChannel, setActiveChannel] = useState("engineering");
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "Alex Rivera",
      avatar: "AR",
      text: "Hey team! WebRTC signaling mesh is working cleanly with FastAPI WebSocket.",
      time: "10:14 AM",
    },
    {
      id: "2",
      sender: "Sarah Chen",
      avatar: "SC",
      text: "Awesome, I just tested participant mute-all and host end controls. Looked great!",
      time: "10:18 AM",
    },
    {
      id: "3",
      sender: "Sneha Debnath",
      avatar: "SD",
      text: "Great work everyone! Let's do a quick sync before the final submission.",
      time: "10:25 AM",
      isSelf: true,
    },
  ]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const newMsg: Message = {
      id: Date.now().toString(),
      sender: "Sneha Debnath (You)",
      avatar: "SD",
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      isSelf: true,
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputText("");
  };

  const handleStartInstantMeetingFromChat = async () => {
    try {
      const meeting = await api.createInstantMeeting({
        title: `#${activeChannel} Video Sync`,
        host_display_name: "Sneha Debnath",
      });
      router.push(`/meeting/${meeting.meeting_id}`);
    } catch (err: any) {
      alert(`Could not start meeting: ${err.message}`);
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

        <main className="flex-1 flex overflow-hidden bg-white border-l border-[#E4E7EB]">
          {/* Chat Sidebar */}
          <div className="w-64 border-r border-[#E4E7EB] flex flex-col bg-[#F7F9FA] shrink-0">
            <div className="p-4 border-b border-[#E4E7EB] flex items-center justify-between">
              <span className="font-bold text-sm text-gray-900">Team Chat</span>
              <button
                className="w-7 h-7 rounded-lg bg-gray-200/80 hover:bg-gray-300 flex items-center justify-center text-gray-700 transition-colors cursor-pointer"
                title="New Message"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Channels & DMs List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              <div>
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-2">
                  Channels
                </span>
                <div className="mt-1 space-y-0.5">
                  {CHANNELS.map((ch) => (
                    <button
                      key={ch.id}
                      onClick={() => setActiveChannel(ch.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        activeChannel === ch.id
                          ? "bg-blue-50 text-[#0E71EB] font-semibold"
                          : "text-gray-700 hover:bg-gray-200/60"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <Hash className="w-3.5 h-3.5 text-gray-400" />
                        <span className="truncate">{ch.name}</span>
                      </div>
                      {ch.unread > 0 && (
                        <span className="bg-[#0E71EB] text-white text-[10px] px-1.5 rounded-full font-bold">
                          {ch.unread}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-2">
                  Direct Messages
                </span>
                <div className="mt-1 space-y-0.5">
                  {DIRECT_MESSAGES.map((dm) => (
                    <div
                      key={dm.id}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-200/60 transition-colors cursor-pointer"
                    >
                      <div className="relative">
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                          {dm.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <span
                          className={`w-2 h-2 rounded-full absolute -bottom-0.5 -right-0.5 border-2 border-white ${
                            dm.status === "online"
                              ? "bg-emerald-500"
                              : dm.status === "busy"
                              ? "bg-red-500"
                              : "bg-gray-400"
                          }`}
                        />
                      </div>
                      <span className="truncate">{dm.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Active Chat Stage */}
          <div className="flex-1 flex flex-col bg-white overflow-hidden">
            {/* Stage Header */}
            <div className="h-14 border-b border-[#E4E7EB] px-6 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Hash className="w-5 h-5 text-gray-400" />
                <span className="font-bold text-gray-900 text-sm">{activeChannel}</span>
                <span className="text-xs text-gray-500 ml-2">Zoom Workplace Engineering Hub</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleStartInstantMeetingFromChat}
                  className="bg-[#0E71EB] hover:bg-[#0050C8] text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Start Meeting</span>
                </button>
              </div>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((m) => (
                <div key={m.id} className="flex items-start gap-3 group">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
                    {m.avatar}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold text-gray-900">{m.sender}</span>
                      <span className="text-gray-400 text-[11px]">{m.time}</span>
                    </div>
                    <p className="text-xs text-gray-800 leading-relaxed bg-gray-50/80 p-2.5 rounded-xl border border-gray-100 max-w-xl">
                      {m.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Composer */}
            <form onSubmit={handleSend} className="p-4 border-t border-[#E4E7EB] bg-white">
              <div className="border border-gray-200 rounded-xl p-2 focus-within:border-[#0E71EB] focus-within:ring-2 focus-within:ring-[#0E71EB]/10 transition-all">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Message #${activeChannel}...`}
                  className="w-full text-xs text-gray-800 outline-none px-2 py-1 placeholder:text-gray-400"
                />
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-2 px-1">
                  <div className="flex items-center gap-1 text-gray-400">
                    <button type="button" className="p-1 hover:text-gray-600 rounded">
                      <Smile className="w-4 h-4" />
                    </button>
                    <button type="button" className="p-1 hover:text-gray-600 rounded">
                      <Paperclip className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="bg-[#0E71EB] hover:bg-[#0050C8] disabled:opacity-40 text-white p-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
