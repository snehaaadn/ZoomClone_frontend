"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, CheckCircle, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { parseMeetingIdFromInput } from "@/lib/utils";
import { api } from "@/lib/api";
import { MeetingValidationResult } from "@/types";

interface JoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMeetingId?: string;
  defaultPasscode?: string;
}

export function JoinModal({
  isOpen,
  onClose,
  defaultMeetingId = "",
  defaultPasscode = "",
}: JoinModalProps) {
  const router = useRouter();

  const [inputVal, setInputVal] = useState(defaultMeetingId);
  const [displayName, setDisplayName] = useState("");
  const [passcode, setPasscode] = useState(defaultPasscode);
  const [turnOffVideo, setTurnOffVideo] = useState(false);
  const [dontConnectAudio, setDontConnectAudio] = useState(false);

  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<MeetingValidationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (defaultMeetingId) {
      setInputVal(defaultMeetingId);
    }
    if (defaultPasscode) {
      setPasscode(defaultPasscode);
    }
  }, [defaultMeetingId, defaultPasscode]);

  // Handle URL pasting & parsing
  const handleInputChange = (val: string) => {
    setInputVal(val);
    setValidationResult(null);
    setErrorMsg(null);

    const parsed = parseMeetingIdFromInput(val);
    if (parsed.passcode && !passcode) {
      setPasscode(parsed.passcode);
    }
  };

  const handleValidate = async () => {
    const { meetingId } = parseMeetingIdFromInput(inputVal);
    if (!meetingId) {
      setErrorMsg("Please enter a valid Meeting ID or link.");
      return;
    }

    setIsValidating(true);
    setErrorMsg(null);

    try {
      const res = await api.validateMeeting(meetingId);
      setValidationResult(res);
      if (!res.is_valid) {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to validate meeting.");
      setValidationResult(null);
    } finally {
      setIsValidating(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { meetingId } = parseMeetingIdFromInput(inputVal);
    if (!meetingId) {
      setErrorMsg("Please enter a meeting ID or paste an invite link.");
      return;
    }

    if (!displayName.trim()) {
      setErrorMsg("Please enter your display name.");
      return;
    }

    setIsValidating(true);
    setErrorMsg(null);

    try {
      const res = await api.validateMeeting(meetingId);
      if (!res.is_valid) {
        setErrorMsg(res.message);
        setIsValidating(false);
        return;
      }

      // Store pre-join preferences in sessionStorage so meeting room picks them up
      if (typeof window !== "undefined") {
        sessionStorage.setItem("zoom_display_name", displayName.trim());
        sessionStorage.setItem("zoom_audio_off", dontConnectAudio ? "true" : "false");
        sessionStorage.setItem("zoom_video_off", turnOffVideo ? "true" : "false");
        sessionStorage.setItem("zoom_is_host", "false");
        sessionStorage.setItem("zoom_meeting_joined", res.meeting_id || meetingId);
        if (passcode) {
          sessionStorage.setItem("zoom_passcode", passcode);
        }
      }

      onClose();
      router.push(`/meeting/${res.meeting_id || meetingId}`);
    } catch (err: any) {
      setErrorMsg(err.message || "Could not join meeting.");
    } finally {
      setIsValidating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 text-base">Join Meeting</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleJoin} className="p-6 space-y-4">
          {/* Meeting ID or URL */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Meeting ID or Personal Link Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={inputVal}
                onChange={(e) => handleInputChange(e.target.value)}
                onBlur={inputVal ? handleValidate : undefined}
                placeholder="e.g. 842-1920-3341 or paste invite URL"
                className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-gray-300 focus:border-[#0E71EB] focus:ring-2 focus:ring-[#0E71EB]/20 outline-none transition-all placeholder:text-gray-400 font-mono"
                required
              />
              {isValidating && (
                <div className="absolute right-3 top-3">
                  <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                </div>
              )}
            </div>
          </div>

          {/* Validation Feedback Banner */}
          {validationResult && validationResult.is_valid && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2.5 text-xs text-emerald-800">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{validationResult.title}</p>
                <p className="text-emerald-700 mt-0.5">Host: {validationResult.host_display_name}</p>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Display Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Your Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your name (e.g. Rahul)"
              className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-gray-300 focus:border-[#0E71EB] focus:ring-2 focus:ring-[#0E71EB]/20 outline-none transition-all"
              required
            />
          </div>

          {/* Passcode (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Meeting Passcode <span className="text-gray-400 font-normal lowercase">(optional)</span>
            </label>
            <input
              type="text"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="e.g. 123456"
              className="w-full text-sm px-3.5 py-2 rounded-lg border border-gray-300 focus:border-[#0E71EB] focus:ring-2 focus:ring-[#0E71EB]/20 outline-none transition-all font-mono"
            />
          </div>

          {/* Join Preferences Checkboxes */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <label className="flex items-center gap-2.5 text-xs text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={dontConnectAudio}
                onChange={(e) => setDontConnectAudio(e.target.checked)}
                className="w-4 h-4 rounded text-[#0E71EB] border-gray-300 focus:ring-[#0E71EB]"
              />
              <span>Do not connect to audio</span>
            </label>
            <label className="flex items-center gap-2.5 text-xs text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={turnOffVideo}
                onChange={(e) => setTurnOffVideo(e.target.checked)}
                className="w-4 h-4 rounded text-[#0E71EB] border-gray-300 focus:ring-[#0E71EB]"
              />
              <span>Turn off my video</span>
            </label>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isValidating || !inputVal.trim() || !displayName.trim()}
              className="px-5 py-2 bg-[#0E71EB] hover:bg-[#0050C8] text-white text-sm font-semibold rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isValidating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Checking...</span>
                </>
              ) : (
                <>
                  <span>Join</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
