"use client";

import React, { useState } from "react";
import { Meeting } from "@/types";
import { formatDate, formatDuration, copyToClipboard } from "@/lib/utils";
import { Calendar, Clock, Copy, Check, Video, Trash2, Link as LinkIcon, User } from "lucide-react";

interface UpcomingMeetingsProps {
  meetings: Meeting[];
  isLoading: boolean;
  onStartMeeting: (meeting: Meeting) => void;
  onCancelMeeting: (meeting: Meeting) => void;
  onOpenInviteModal: (meeting: Meeting) => void;
}

export function UpcomingMeetings({
  meetings,
  isLoading,
  onStartMeeting,
  onCancelMeeting,
  onOpenInviteModal,
}: UpcomingMeetingsProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (meeting: Meeting) => {
    const success = await copyToClipboard(meeting.invite_url);
    if (success) {
      setCopiedId(meeting.meeting_id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="p-4 bg-white border border-[#E4E7EB] rounded-xl flex items-center justify-between animate-pulse"
          >
            <div className="space-y-2">
              <div className="h-4 w-48 bg-gray-200 rounded"></div>
              <div className="h-3 w-32 bg-gray-100 rounded"></div>
            </div>
            <div className="h-8 w-24 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (meetings.length === 0) {
    return (
      <div className="p-8 text-center bg-white border border-[#E4E7EB] rounded-xl">
        <div className="w-12 h-12 rounded-full bg-blue-50 text-[#0E71EB] flex items-center justify-center mx-auto mb-3">
          <Calendar className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-semibold text-gray-800">No Upcoming Meetings</h4>
        <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
          You don't have any upcoming meetings scheduled. Click "Schedule" above to create one.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {meetings.map((meeting) => (
        <div
          key={meeting.id}
          className="p-4 md:p-5 bg-white border border-[#E4E7EB] hover:border-[#CBD5E1] rounded-xl transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
        >
          {/* Meeting details */}
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-gray-900 text-sm md:text-base truncate">
                {meeting.title}
              </h4>
              {meeting.is_instant && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-[#F26D21] px-2 py-0.5 rounded-full">
                  Instant
                </span>
              )}
              {meeting.status === "active" && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  Active Now
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
              <span className="flex items-center gap-1 text-gray-600 font-medium">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                {formatDate(meeting.start_time)}
              </span>
              <span>•</span>
              <span>{formatDuration(meeting.duration)}</span>
              <span>•</span>
              <span className="font-mono text-gray-600">ID: {meeting.meeting_id}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-gray-500">
                <User className="w-3 h-3 text-gray-400" />
                {meeting.host_display_name}
              </span>
            </div>

            {meeting.description && (
              <p className="text-xs text-gray-500 line-clamp-1 italic">
                {meeting.description}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Copy Invite Link */}
            <button
              onClick={() => handleCopy(meeting)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg text-xs font-medium border border-gray-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Copy Invite Link"
            >
              {copiedId === meeting.meeting_id ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Copy Link</span>
                </>
              )}
            </button>

            {/* Invite details modal */}
            <button
              onClick={() => onOpenInviteModal(meeting)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg text-xs font-medium border border-gray-200 transition-colors flex items-center gap-1 cursor-pointer"
              title="View Invitation Details"
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Invite</span>
            </button>

            {/* Start Meeting */}
            <button
              onClick={() => onStartMeeting(meeting)}
              className="bg-[#0E71EB] hover:bg-[#0050C8] text-white px-3.5 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Start</span>
            </button>

            {/* Cancel / Delete */}
            <button
              onClick={() => onCancelMeeting(meeting)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              title="Cancel Meeting"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
