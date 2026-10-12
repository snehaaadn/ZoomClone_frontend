"use client";

import React, { useState, useEffect } from "react";
import { Meeting } from "@/types";
import { formatDate } from "@/lib/utils";
import { Video, Calendar, ArrowRight } from "lucide-react";

interface ClockWidgetProps {
  nextMeeting?: Meeting | null;
  onStartMeeting: (meeting: Meeting) => void;
  onScheduleClick: () => void;
}

export function ClockWidget({ nextMeeting, onStartMeeting, onScheduleClick }: ClockWidgetProps) {
  const [time, setTime] = useState({
    timeStr: "12:00 PM",
    dateStr: "Loading date...",
  });
  const [timeZone, setTimeZone] = useState("UTC");

  useEffect(() => {
    try {
      setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
    } catch {}

    const updateTime = () => {
      const now = new Date();
      setTime({
        timeStr: now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
        dateStr: now.toLocaleDateString([], {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
      });
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
      {/* Clock Box - Zoom workplace style background banner */}
      <div className="lg:col-span-2 relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1C2536] via-[#111927] to-[#0A0E17] text-white p-6 md:p-8 flex flex-col justify-between shadow-sm min-h-[160px]">
        {/* Subtle decorative circles */}
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />
        <div className="absolute right-12 bottom-0 w-32 h-32 rounded-full bg-indigo-500/10 blur-xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider uppercase text-blue-400 bg-blue-500/20 px-2.5 py-1 rounded-md border border-blue-400/20">
            Workplace Time
          </span>
          <span className="text-xs text-gray-400 font-medium">
            {timeZone}
          </span>
        </div>

        <div className="relative z-10 my-2">
          <div className="text-4xl md:text-5xl font-bold tracking-tight text-white font-mono">
            {time.timeStr || "12:00 PM"}
          </div>
          <div className="text-sm md:text-base text-gray-300 mt-1 font-medium">
            {time.dateStr || "Loading..."}
          </div>
        </div>
      </div>

      {/* Next Meeting Spotlight Box */}
      <div className="bg-white border border-[#E4E7EB] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Up Next
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
        </div>

        {nextMeeting ? (
          <div className="my-2">
            <h4 className="font-semibold text-gray-900 line-clamp-1 text-sm md:text-base">
              {nextMeeting.title}
            </h4>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              <span>{formatDate(nextMeeting.start_time)}</span>
            </p>
            <p className="text-[11px] text-gray-400 mt-1 font-mono">
              ID: {nextMeeting.meeting_id}
            </p>
          </div>
        ) : (
          <div className="my-2 py-1">
            <p className="text-sm font-medium text-gray-700">No upcoming meetings today</p>
            <p className="text-xs text-gray-500 mt-1">Schedule one to collaborate with your team</p>
          </div>
        )}

        <div>
          {nextMeeting ? (
            <button
              onClick={() => onStartMeeting(nextMeeting)}
              className="w-full bg-[#0E71EB] hover:bg-[#0050C8] text-white text-xs font-medium py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Start Now</span>
            </button>
          ) : (
            <button
              onClick={onScheduleClick}
              className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 text-xs font-medium py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Schedule a Meeting</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
