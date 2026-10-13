"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Video, VideoOff, X, Sparkles } from "lucide-react";

interface InstantMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmStart: (config: {
    title: string;
    isAudioEnabled: boolean;
    isVideoEnabled: boolean;
  }) => void;
  isLoading: boolean;
}

export function InstantMeetingModal({
  isOpen,
  onClose,
  onConfirmStart,
  isLoading,
}: InstantMeetingModalProps) {
  const [title, setTitle] = useState("Sneha Debnath's Personal Meeting Room");
  const [isVideoEnabled, setIsVideoEnabled] = useState<boolean>(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const [isAcquiringMedia, setIsAcquiringMedia] = useState<boolean>(false);

  const previewStreamRef = useRef<MediaStream | null>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);

  // Stop any active preview tracks
  const stopPreviewTracks = () => {
    if (previewStreamRef.current) {
      previewStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {}
      });
      previewStreamRef.current = null;
    }
    setPreviewStream(null);
  };

  // Start preview camera/mic when modal opens
  useEffect(() => {
    if (!isOpen) {
      stopPreviewTracks();
      return;
    }

    let isMounted = true;

    async function initPreview() {
      setIsAcquiringMedia(true);
      try {
        if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: isVideoEnabled,
            audio: isAudioEnabled,
          });

          if (!isMounted) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }

          previewStreamRef.current = stream;
          setPreviewStream(stream);
        }
      } catch (err) {
        console.warn("Could not acquire preview stream in modal:", err);
      } finally {
        if (isMounted) setIsAcquiringMedia(false);
      }
    }

    initPreview();

    return () => {
      isMounted = false;
      stopPreviewTracks();
    };
  }, [isOpen]);

  // Toggle Video in Modal Preview
  const handleToggleVideo = async () => {
    if (isVideoEnabled) {
      // Turn OFF video
      if (previewStreamRef.current) {
        previewStreamRef.current.getVideoTracks().forEach((track) => {
          try {
            track.stop();
          } catch {}
          previewStreamRef.current?.removeTrack(track);
        });
        setPreviewStream(new MediaStream(previewStreamRef.current.getTracks()));
      }
      setIsVideoEnabled(false);
    } else {
      // Turn ON video
      try {
        setIsAcquiringMedia(true);
        const newStream = await navigator.mediaDevices.getUserMedia({ video: true });
        const newTrack = newStream.getVideoTracks()[0];
        if (newTrack) {
          if (previewStreamRef.current) {
            previewStreamRef.current.addTrack(newTrack);
            const updated = new MediaStream(previewStreamRef.current.getTracks());
            previewStreamRef.current = updated;
            setPreviewStream(updated);
          } else {
            const fresh = new MediaStream([newTrack]);
            previewStreamRef.current = fresh;
            setPreviewStream(fresh);
          }
          setIsVideoEnabled(true);
        }
      } catch (err) {
        console.warn("Camera access denied or failed in modal:", err);
      } finally {
        setIsAcquiringMedia(false);
      }
    }
  };

  // Toggle Audio in Modal Preview
  const handleToggleAudio = async () => {
    if (isAudioEnabled) {
      // Turn OFF audio
      if (previewStreamRef.current) {
        previewStreamRef.current.getAudioTracks().forEach((track) => {
          try {
            track.stop();
          } catch {}
          previewStreamRef.current?.removeTrack(track);
        });
        setPreviewStream(new MediaStream(previewStreamRef.current.getTracks()));
      }
      setIsAudioEnabled(false);
    } else {
      // Turn ON audio
      try {
        setIsAcquiringMedia(true);
        const newStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const newTrack = newStream.getAudioTracks()[0];
        if (newTrack) {
          if (previewStreamRef.current) {
            previewStreamRef.current.addTrack(newTrack);
            const updated = new MediaStream(previewStreamRef.current.getTracks());
            previewStreamRef.current = updated;
            setPreviewStream(updated);
          } else {
            const fresh = new MediaStream([newTrack]);
            previewStreamRef.current = fresh;
            setPreviewStream(fresh);
          }
          setIsAudioEnabled(true);
        }
      } catch (err) {
        console.warn("Mic access denied in modal:", err);
      } finally {
        setIsAcquiringMedia(false);
      }
    }
  };

  const handleClose = () => {
    stopPreviewTracks();
    onClose();
  };

  const handleConfirm = () => {
    stopPreviewTracks();
    onConfirmStart({
      title,
      isAudioEnabled,
      isVideoEnabled,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 text-base">Start Instant Meeting</h3>
            <p className="text-xs text-gray-500">Configure your camera and audio preferences</p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Meeting Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Meeting Topic
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Quick Sync"
              className="w-full text-sm px-3.5 py-2 rounded-lg border border-gray-300 focus:border-[#0E71EB] focus:ring-2 focus:ring-[#0E71EB]/20 outline-none transition-all"
            />
          </div>

          {/* Camera / Audio Setup Card */}
          <div className="relative aspect-video bg-[#1A1D20] rounded-xl overflow-hidden shadow-inner flex flex-col items-center justify-center text-center select-none">
            {/* Live Video Preview if Video is ON */}
            {isVideoEnabled && previewStream && previewStream.getVideoTracks().some((t) => t.readyState === "live") ? (
              <video
                ref={(el) => {
                  videoElementRef.current = el;
                  if (el && previewStream) {
                    if (el.srcObject !== previewStream) el.srcObject = previewStream;
                    el.play().catch(() => {});
                  }
                }}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover -scale-x-100"
              />
            ) : (
              /* Avatar Placeholder when Camera is Off */
              <div className="flex flex-col items-center justify-center p-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold mb-3 shadow-lg ring-4 ring-white/10">
                  SD
                </div>
                <p className="text-sm font-medium text-white mb-1">Sneha Debnath</p>
              </div>
            )}

            {/* Badges Overlay */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium backdrop-blur-md shadow-sm ${
                isVideoEnabled ? "bg-emerald-500/80 text-white" : "bg-black/60 text-gray-300 border border-white/10"
              }`}>
                {isVideoEnabled ? "Camera: On" : "Camera: Off"}
              </span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium backdrop-blur-md shadow-sm ${
                isAudioEnabled ? "bg-emerald-500/80 text-white" : "bg-black/60 text-gray-300 border border-white/10"
              }`}>
                {isAudioEnabled ? "Mic: Unmuted" : "Mic: Muted"}
              </span>
            </div>

            {/* Quick Toggle Controls */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/70 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 z-10 shadow-lg">
              <button
                type="button"
                onClick={handleToggleAudio}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  isAudioEnabled ? "bg-white/20 text-white hover:bg-white/30" : "bg-red-600 text-white hover:bg-red-700"
                }`}
                title={isAudioEnabled ? "Turn Off Microphone" : "Turn On Microphone"}
              >
                {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={handleToggleVideo}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  isVideoEnabled ? "bg-white/20 text-white hover:bg-white/30" : "bg-red-600 text-white hover:bg-red-700"
                }`}
                title={isVideoEnabled ? "Turn Off Camera" : "Turn On Camera"}
              >
                {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Subtitle helper note */}
          <div className="flex items-center gap-2 p-3 bg-blue-50/80 border border-blue-200/60 rounded-xl text-xs text-blue-900">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Your preview is live above. Click Start Meeting to enter the room.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-200/50 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading || isAcquiringMedia}
            className="px-5 py-2 bg-[#F26D21] hover:bg-[#D95610] text-white text-sm font-semibold rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Creating Room...</span>
              </>
            ) : (
              <span>Start Meeting</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
