"use client";

import { useState, useCallback, useRef } from "react";

export function useScreenShare() {
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isSharing, setIsSharing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startScreenShare = useCallback(async (): Promise<MediaStream | null> => {
    setError(null);
    try {
      if (typeof navigator === "undefined" || !navigator.mediaDevices?.getDisplayMedia) {
        throw new Error("Screen sharing is not supported in this browser.");
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "always" } as any,
        audio: false,
      });

      streamRef.current = stream;
      setScreenStream(stream);
      setIsSharing(true);

      // Listen for the native browser "Stop sharing" button
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
          stopScreenShare();
        };
      }

      return stream;
    } catch (err: any) {
      if (err.name !== "NotAllowedError") {
        setError(err.message || "Failed to start screen share.");
      }
      setIsSharing(false);
      return null;
    }
  }, []);

  const stopScreenShare = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setScreenStream(null);
    setIsSharing(false);
  }, []);

  return {
    screenStream,
    isSharing,
    error,
    startScreenShare,
    stopScreenShare,
  };
}
