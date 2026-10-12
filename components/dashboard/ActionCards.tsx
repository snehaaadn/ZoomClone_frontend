"use client";

import React from "react";
import { Video, Plus, Calendar, ScreenShare } from "lucide-react";

interface ActionCardsProps {
  onNewMeeting: () => void;
  onJoinMeeting: () => void;
  onScheduleMeeting: () => void;
  onShareScreen: () => void;
  isCreatingInstant?: boolean;
}

export function ActionCards({
  onNewMeeting,
  onJoinMeeting,
  onScheduleMeeting,
  onShareScreen,
  isCreatingInstant = false,
}: ActionCardsProps) {
  const actions = [
    {
      id: "new-meeting",
      title: "New Meeting",
      description: "Start instant video meeting",
      icon: Video,
      bgColor: "bg-[#F26D21] hover:bg-[#D95610]", // Classic Zoom Orange
      textColor: "text-white",
      onClick: onNewMeeting,
      loading: isCreatingInstant,
    },
    {
      id: "join",
      title: "Join",
      description: "Join with ID or invite link",
      icon: Plus,
      bgColor: "bg-[#0E71EB] hover:bg-[#0050C8]", // Classic Zoom Blue
      textColor: "text-white",
      onClick: onJoinMeeting,
    },
    {
      id: "schedule",
      title: "Schedule",
      description: "Plan a future video meeting",
      icon: Calendar,
      bgColor: "bg-[#0E71EB] hover:bg-[#0050C8]",
      textColor: "text-white",
      onClick: onScheduleMeeting,
    },
    {
      id: "share-screen",
      title: "Share Screen",
      description: "Share desktop in room",
      icon: ScreenShare,
      bgColor: "bg-[#0E71EB] hover:bg-[#0050C8]",
      textColor: "text-white",
      onClick: onShareScreen,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6 mb-8">
      {actions.map((act) => {
        const Icon = act.icon;
        return (
          <button
            key={act.id}
            onClick={act.onClick}
            disabled={act.loading}
            className="flex flex-col items-center group cursor-pointer text-center focus:outline-none transition-transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <div
              className={`w-16 h-16 sm:w-20 sm:h-20 md:w-22 md:h-22 rounded-2xl flex items-center justify-center shadow-md transition-all duration-150 ${act.bgColor} group-hover:shadow-lg group-hover:-translate-y-0.5`}
            >
              {act.loading ? (
                <div className="w-7 h-7 border-3 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Icon className="w-8 h-8 sm:w-9 sm:h-9 text-white stroke-[2.2]" />
              )}
            </div>
            <span className="mt-3 text-xs sm:text-sm font-semibold text-gray-800 group-hover:text-[#0E71EB] transition-colors">
              {act.title}
            </span>
            <span className="hidden sm:inline text-[11px] text-gray-500 mt-0.5">
              {act.description}
            </span>
          </button>
        );
      })}
    </div>
  );
}
