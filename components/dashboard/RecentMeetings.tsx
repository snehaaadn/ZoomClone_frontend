"use client";

import React from "react";
import { Meeting } from "@/types";
import { formatDate, formatDuration } from "@/lib/utils";
import { History, Users, RefreshCw, XCircle, CheckCircle } from "lucide-react";

interface RecentMeetingsProps {
  meetings: Meeting[];
  isLoading: boolean;
  onRestartMeeting: (meeting: Meeting) => void;
}

export function RecentMeetings({ meetings, isLoading, onRestartMeeting }: RecentMeetingsProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((n) => (
          <div
            key={n}
            className="p-4 bg-white border border-[#E4E7EB] rounded-xl flex items-center justify-between animate-pulse"
          >
            <div className="space-y-2">
              <div className="h-4 w-48 bg-gray-200 rounded"></div>
              <div className="h-3 w-32 bg-gray-100 rounded"></div>
            </div>
            <div className="h-8 w-20 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (meetings.length === 0) {
    return (
      <div className="p-8 text-center bg-white border border-[#E4E7EB] rounded-xl">
        <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center mx-auto mb-3">
          <History className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-semibold text-gray-800">No Past Meetings</h4>
        <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
          Meetings you complete or end will appear here for your review and history.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {meetings.map((meeting) => (
        <div
          key={meeting.id}
          className="p-4 bg-white border border-[#E4E7EB] rounded-xl transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-gray-900 text-sm md:text-base">
                {meeting.title}
              </h4>
              {meeting.status === "ended" ? (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-gray-500" />
                  Completed
                </span>
              ) : (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <XCircle className="w-3 h-3 text-red-500" />
                  Cancelled
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
              <span>{formatDate(meeting.start_time)}</span>
              <span>•</span>
              <span>{formatDuration(meeting.duration)}</span>
              <span>•</span>
              <span className="font-mono">ID: {meeting.meeting_id}</span>
              {meeting.participants?.length > 0 && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-gray-600">
                    <Users className="w-3 h-3 text-gray-400" />
                    {meeting.participants.length} attendee{meeting.participants.length > 1 ? "s" : ""}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="shrink-0">
            <button
              onClick={() => onRestartMeeting(meeting)}
              className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-gray-900 border border-gray-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3 text-gray-500" />
              <span>Start Again</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
