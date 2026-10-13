"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface MediaDeviceOption {
  deviceId: string;
  label: string;
}

export function useMediaStream(
  initialVideo: boolean = true,
  initialAudio: boolean = true,
  enabled: boolean = true
) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState<boolean>(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(false);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceOption[]>([]);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceOption[]>([]);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>("");
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>("");
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const streamRef = useRef<MediaStream | null>(null);
  const isVideoEnabledRef = useRef<boolean>(false);
  const isAudioEnabledRef = useRef<boolean>(false);

  // Keep refs in sync with state
  useEffect(() => {
    isVideoEnabledRef.current = isVideoEnabled;
  }, [isVideoEnabled]);

  useEffect(() => {
    isAudioEnabledRef.current = isAudioEnabled;
  }, [isAudioEnabled]);

  // Stop all active tracks and release hardware from system
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {}
      });
      streamRef.current = null;
    }
    setStream(null);
    setIsVideoEnabled(false);
    setIsAudioEnabled(false);
    setIsLoading(false);
  }, []);

  // Enumerate hardware devices
  const refreshDevices = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.enumerateDevices) return;
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs: MediaDeviceOption[] = [];
      const videoInputs: MediaDeviceOption[] = [];

      devices.forEach((d) => {
        if (d.kind === "audioinput") {
          audioInputs.push({ deviceId: d.deviceId, label: d.label || `Microphone ${audioInputs.length + 1}` });
        } else if (d.kind === "videoinput") {
          videoInputs.push({ deviceId: d.deviceId, label: d.label || `Camera ${videoInputs.length + 1}` });
        }
      });

      setAudioDevices(audioInputs);
      setVideoDevices(videoInputs);
    } catch {}
  }, []);

  // Initialize media devices: Directly call getUserMedia without delay so browser native prompt triggers
  const initStream = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setPermissionError(null);

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setPermissionError("Media devices are not supported in this browser.");
      setIsLoading(false);
      return;
    }

    // Stop any existing tracks before initializing
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {}
      });
      streamRef.current = null;
    }

    let acquiredStream: MediaStream | null = null;

    // Directly request camera and microphone to trigger native browser prompt
    try {
      const constraints: MediaStreamConstraints = {
        video: selectedVideoDevice ? { deviceId: { exact: selectedVideoDevice } } : true,
        audio: selectedAudioDevice ? { deviceId: { exact: selectedAudioDevice } } : true,
      };
      acquiredStream = await navigator.mediaDevices.getUserMedia(constraints);
    } catch (err: any) {
      // Fallback: If combined request failed (e.g. no camera attached), try audio only
      try {
        acquiredStream = await navigator.mediaDevices.getUserMedia({
          audio: selectedAudioDevice ? { deviceId: { exact: selectedAudioDevice } } : true,
        });
      } catch {}

      // Fallback: If still nothing, try video only
      if (!acquiredStream) {
        try {
          acquiredStream = await navigator.mediaDevices.getUserMedia({
            video: selectedVideoDevice ? { deviceId: { exact: selectedVideoDevice } } : true,
          });
        } catch {}
      }

      if (!acquiredStream) {
        if (err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError") {
          setPermissionError("Camera or microphone permission was blocked. Please allow access in browser settings.");
        } else if (err?.name === "NotFoundError" || err?.name === "DevicesNotFoundError") {
          setPermissionError("No camera or microphone hardware found on this system.");
        } else {
          setPermissionError(err?.message || "Failed to access camera and microphone.");
        }
      }
    }

    if (acquiredStream) {
      // If user wanted video OFF initially, stop the video track immediately
      const videoTrack = acquiredStream.getVideoTracks()[0];
      if (videoTrack) {
        if (!initialVideo) {
          try {
            videoTrack.stop();
          } catch {}
          acquiredStream.removeTrack(videoTrack);
        }
      }

      // If user wanted audio OFF initially, stop the audio track immediately
      const audioTrack = acquiredStream.getAudioTracks()[0];
      if (audioTrack) {
        if (!initialAudio) {
          try {
            audioTrack.stop();
          } catch {}
          acquiredStream.removeTrack(audioTrack);
        }
      }

      streamRef.current = acquiredStream;
      setStream(acquiredStream);

      const hasLiveVideo = acquiredStream.getVideoTracks().some((t) => t.readyState === "live");
      const hasLiveAudio = acquiredStream.getAudioTracks().some((t) => t.readyState === "live");

      setIsVideoEnabled(hasLiveVideo);
      setIsAudioEnabled(hasLiveAudio);
      setPermissionError(null);

      await refreshDevices();
    } else {
      const emptyStream = new MediaStream();
      streamRef.current = emptyStream;
      setStream(emptyStream);
      setIsVideoEnabled(false);
      setIsAudioEnabled(false);
    }

    setIsLoading(false);
  }, [enabled, initialVideo, initialAudio, selectedAudioDevice, selectedVideoDevice, refreshDevices]);

  // Initial stream mount/unmount - stable, does NOT tear down on stream state changes
  useEffect(() => {
    if (enabled) {
      initStream();
    }
    return () => {
      stopStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  // Listen for device changes
  useEffect(() => {
    if (typeof window === "undefined" || !enabled) return;

    const handleDeviceChange = () => {
      refreshDevices();
    };

    navigator.mediaDevices?.addEventListener("devicechange", handleDeviceChange);
    return () => {
      navigator.mediaDevices?.removeEventListener("devicechange", handleDeviceChange);
    };
  }, [enabled, refreshDevices]);

  // Toggle Video: turns hardware on/off at system level and updates UI state reliably
  const toggleVideo = useCallback(async () => {
    if (isVideoEnabledRef.current) {
      // Currently ON -> Turn OFF and stop camera track
      if (streamRef.current) {
        streamRef.current.getVideoTracks().forEach((track) => {
          try {
            track.stop();
          } catch {}
          streamRef.current?.removeTrack(track);
        });
        setStream(new MediaStream(streamRef.current.getTracks()));
      }
      setIsVideoEnabled(false);
    } else {
      // Currently OFF -> Turn ON and acquire camera track
      try {
        setIsLoading(true);
        const newVideoStream = await navigator.mediaDevices.getUserMedia({
          video: selectedVideoDevice ? { deviceId: { exact: selectedVideoDevice } } : true,
        });
        const newTrack = newVideoStream.getVideoTracks()[0];

        if (newTrack) {
          if (streamRef.current) {
            // Remove any old/dead video tracks first
            streamRef.current.getVideoTracks().forEach((t) => {
              try { t.stop(); } catch {}
              streamRef.current?.removeTrack(t);
            });
            streamRef.current.addTrack(newTrack);
            setStream(new MediaStream(streamRef.current.getTracks()));
          } else {
            const fresh = new MediaStream([newTrack]);
            streamRef.current = fresh;
            setStream(fresh);
          }
          setIsVideoEnabled(true);
          setPermissionError(null);
          await refreshDevices();
        }
      } catch (err: any) {
        console.error("Failed to enable camera:", err);
        setPermissionError("Could not access camera. Please allow camera access in browser settings.");
      } finally {
        setIsLoading(false);
      }
    }
  }, [selectedVideoDevice, refreshDevices]);

  // Toggle Audio: turns microphone on/off at system level and updates UI state reliably
  const toggleAudio = useCallback(async () => {
    if (isAudioEnabledRef.current) {
      // Currently ON -> Turn OFF (Mute)
      if (streamRef.current) {
        streamRef.current.getAudioTracks().forEach((track) => {
          try {
            track.stop();
          } catch {}
          streamRef.current?.removeTrack(track);
        });
        setStream(new MediaStream(streamRef.current.getTracks()));
      }
      setIsAudioEnabled(false);
    } else {
      // Currently OFF -> Turn ON (Unmute)
      try {
        setIsLoading(true);
        const newAudioStream = await navigator.mediaDevices.getUserMedia({
          audio: selectedAudioDevice ? { deviceId: { exact: selectedAudioDevice } } : true,
        });
        const newTrack = newAudioStream.getAudioTracks()[0];

        if (newTrack) {
          if (streamRef.current) {
            // Remove any old/dead audio tracks first
            streamRef.current.getAudioTracks().forEach((t) => {
              try { t.stop(); } catch {}
              streamRef.current?.removeTrack(t);
            });
            streamRef.current.addTrack(newTrack);
            setStream(new MediaStream(streamRef.current.getTracks()));
          } else {
            const fresh = new MediaStream([newTrack]);
            streamRef.current = fresh;
            setStream(fresh);
          }
          setIsAudioEnabled(true);
          setPermissionError(null);
          await refreshDevices();
        }
      } catch (err: any) {
        console.error("Failed to enable microphone:", err);
        setPermissionError("Could not access microphone. Please allow microphone access in browser settings.");
      } finally {
        setIsLoading(false);
      }
    }
  }, [selectedAudioDevice, refreshDevices]);

  const setAudioState = useCallback(async (active: boolean) => {
    if (active) {
      if (!isAudioEnabledRef.current) {
        try {
          const fresh = await navigator.mediaDevices.getUserMedia({
            audio: selectedAudioDevice ? { deviceId: { exact: selectedAudioDevice } } : true,
          });
          const track = fresh.getAudioTracks()[0];
          if (track) {
            if (streamRef.current) {
              streamRef.current.getAudioTracks().forEach((t) => {
                try { t.stop(); } catch {}
                streamRef.current?.removeTrack(t);
              });
              streamRef.current.addTrack(track);
              setStream(new MediaStream(streamRef.current.getTracks()));
            } else {
              const freshStream = new MediaStream([track]);
              streamRef.current = freshStream;
              setStream(freshStream);
            }
            setIsAudioEnabled(true);
          }
        } catch (err) {
          console.error("Failed to enable audio:", err);
        }
      }
    } else {
      if (streamRef.current) {
        streamRef.current.getAudioTracks().forEach((track) => {
          try {
            track.stop();
          } catch {}
          streamRef.current?.removeTrack(track);
        });
        setStream(new MediaStream(streamRef.current.getTracks()));
      }
      setIsAudioEnabled(false);
    }
  }, [selectedAudioDevice]);

  const setVideoState = useCallback(async (active: boolean) => {
    if (active) {
      if (!isVideoEnabledRef.current) {
        try {
          const fresh = await navigator.mediaDevices.getUserMedia({
            video: selectedVideoDevice ? { deviceId: { exact: selectedVideoDevice } } : true,
          });
          const track = fresh.getVideoTracks()[0];
          if (track) {
            if (streamRef.current) {
              streamRef.current.getVideoTracks().forEach((t) => {
                try { t.stop(); } catch {}
                streamRef.current?.removeTrack(t);
              });
              streamRef.current.addTrack(track);
              setStream(new MediaStream(streamRef.current.getTracks()));
            } else {
              const freshStream = new MediaStream([track]);
              streamRef.current = freshStream;
              setStream(freshStream);
            }
            setIsVideoEnabled(true);
          }
        } catch (err) {
          console.error("Failed to enable video:", err);
        }
      }
    } else {
      if (streamRef.current) {
        streamRef.current.getVideoTracks().forEach((track) => {
          try {
            track.stop();
          } catch {}
          streamRef.current?.removeTrack(track);
        });
        setStream(new MediaStream(streamRef.current.getTracks()));
      }
      setIsVideoEnabled(false);
    }
  }, [selectedVideoDevice]);

  return {
    stream,
    streamRef,
    isVideoEnabled,
    isAudioEnabled,
    toggleVideo,
    toggleAudio,
    setAudioState,
    setVideoState,
    stopStream,
    audioDevices,
    videoDevices,
    selectedAudioDevice,
    selectedVideoDevice,
    setSelectedAudioDevice,
    setSelectedVideoDevice,
    permissionError,
    isLoading,
    retry: initStream,
  };
}
