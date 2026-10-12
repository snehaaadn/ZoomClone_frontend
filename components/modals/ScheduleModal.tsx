"use client";

import React, { useState } from "react";
import { X, Calendar, Clock, Globe, Shield, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { Meeting } from "@/types";

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMeetingScheduled: (meeting: Meeting) => void;
}

export function ScheduleModal({ isOpen, onClose, onMeetingScheduled }: ScheduleModalProps) {
  const [topic, setTopic] = useState("Weekly Team Sync");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("10:00");
  const [duration, setDuration] = useState(30);
  const [timezone, setTimezone] = useState("UTC");
  const [passcode, setPasscode] = useState("123456");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setDate(tomorrow.toISOString().split("T")[0]);
      try {
        setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
      } catch {}
      setPasscode(`${Math.floor(100000 + Math.random() * 900000)}`);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!topic.trim()) {
      setErrorMsg("Please enter a meeting topic.");
      return;
    }

    if (!date || !startTime) {
      setErrorMsg("Please select both a date and a start time.");
      return;
    }

    try {
      setIsSubmitting(true);
      const combinedDateTime = new Date(`${date}T${startTime}:00`);

      if (isNaN(combinedDateTime.getTime())) {
        setErrorMsg("Invalid date or time selected.");
        setIsSubmitting(false);
        return;
      }

      const scheduledMeeting = await api.scheduleMeeting({
        title: topic.trim(),
        description: description.trim() || undefined,
        start_time: combinedDateTime.toISOString(),
        duration,
        passcode,
        timezone,
        host_display_name: "Sneha Debnath (Host)",
      });

      onMeetingScheduled(scheduledMeeting);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to schedule meeting.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h3 className="font-semibold text-gray-900 text-base">Schedule Meeting</h3>
            <p className="text-xs text-gray-500">Plan and invite participants to a future session</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              {errorMsg}
            </div>
          )}

          {/* Meeting Topic */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Topic <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Sprint Architecture Sync"
              className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-gray-300 focus:border-[#0E71EB] focus:ring-2 focus:ring-[#0E71EB]/20 outline-none transition-all"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Description <span className="text-gray-400 lowercase font-normal">(optional)</span>
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add meeting agenda or notes for attendees"
              className="w-full text-sm px-3.5 py-2 rounded-lg border border-gray-300 focus:border-[#0E71EB] focus:ring-2 focus:ring-[#0E71EB]/20 outline-none transition-all resize-none"
            />
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                <span>Date</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-sm px-3.5 py-2 rounded-lg border border-gray-300 focus:border-[#0E71EB] focus:ring-2 focus:ring-[#0E71EB]/20 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                <span>Start Time</span>
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full text-sm px-3.5 py-2 rounded-lg border border-gray-300 focus:border-[#0E71EB] focus:ring-2 focus:ring-[#0E71EB]/20 outline-none transition-all"
                required
              />
            </div>
          </div>

          {/* Duration & Time Zone Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Duration
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full text-sm px-3.5 py-2 rounded-lg border border-gray-300 focus:border-[#0E71EB] focus:ring-2 focus:ring-[#0E71EB]/20 outline-none transition-all bg-white"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                <Globe className="w-3.5 h-3.5 text-gray-400" />
                <span>Time Zone</span>
              </label>
              <input
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-gray-300 bg-gray-50 text-gray-600 focus:outline-none"
                readOnly
              />
            </div>
          </div>

          {/* Security & Passcode */}
          <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-800">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Meeting Security</span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Passcode protection</span>
              <input
                type="text"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-28 text-center font-mono text-xs px-2 py-1 rounded border border-gray-300 bg-white focus:border-[#0E71EB] outline-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#0E71EB] hover:bg-[#0050C8] text-white text-sm font-semibold rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Scheduling...</span>
                </>
              ) : (
                <span>Schedule Meeting</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
