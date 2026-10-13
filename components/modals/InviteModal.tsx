"use client";

import React, { useState } from "react";
import { X, Copy, Check, Link as LinkIcon, Shield, Mail } from "lucide-react";
import { Meeting } from "@/types";
import { copyToClipboard, formatDate } from "@/lib/utils";

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: Meeting | null;
}

export function InviteModal({ isOpen, onClose, meeting }: InviteModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedFull, setCopiedFull] = useState(false);

  if (!isOpen || !meeting) return null;

  const effectiveInviteUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/meeting/${meeting.meeting_id}?pwd=${meeting.passcode}`
      : meeting.invite_url;

  const fullInvitationText = `${meeting.host_display_name} is inviting you to a Zoom meeting.

Topic: ${meeting.title}
Time: ${formatDate(meeting.start_time)}

Join Zoom Meeting:
${effectiveInviteUrl}

Meeting ID: ${meeting.meeting_id}
Passcode: ${meeting.passcode}
`;

  const handleCopyLink = async () => {
    const success = await copyToClipboard(effectiveInviteUrl);
    if (success) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleCopyFull = async () => {
    const success = await copyToClipboard(fullInvitationText);
    if (success) {
      setCopiedFull(true);
      setTimeout(() => setCopiedFull(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 text-base">Invite Attendees</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <h4 className="font-semibold text-gray-800 text-sm">{meeting.title}</h4>
            <p className="text-xs text-gray-500 mt-0.5">{formatDate(meeting.start_time)}</p>
          </div>

          {/* Meeting ID & Passcode Card */}
          <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Meeting ID:</span>
              <span className="font-mono font-semibold text-gray-800">{meeting.meeting_id}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Passcode:</span>
              <span className="font-mono font-semibold text-gray-800">{meeting.passcode}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Host:</span>
              <span className="font-medium text-gray-800">{meeting.host_display_name}</span>
            </div>
          </div>

          {/* Invite URL box */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Invite Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={effectiveInviteUrl}
                className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-600 select-all font-mono outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="px-3 py-2 bg-[#0E71EB] hover:bg-[#0050C8] text-white text-xs font-semibold rounded-lg shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? "Copied!" : "Copy"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <button
            onClick={handleCopyFull}
            className="text-xs font-medium text-gray-700 hover:text-gray-900 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copiedFull ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Mail className="w-3.5 h-3.5" />}
            <span>{copiedFull ? "Invitation Copied!" : "Copy Invitation Text"}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-white transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
