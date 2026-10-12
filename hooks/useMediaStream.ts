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
      // If user wanted video OFF initially, IMMEDIATELY stop the video track so camera hardware is released from system!
      const videoTrack = acquiredStream.getVideoTracks()[0];
      if (videoTrack) {
        if (!initialVideo) {
          try {
            videoTrack.stop();
          } catch {}
          acquiredStream.removeTrack(videoTrack);
        }
      }

      // If user wanted audio OFF initially, IMMEDIATELY stop the audio track so microphone hardware is released from system!
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

  // Initial stream mount/unmount
  useEffect(() => {
    if (enabled) {
      initStream();
    } else {
      stopStream();
    }
    return () => {
      stopStream();
    };
  }, [enabled, initStream, stopStream]);

  // Real-time permission listener & window focus listener so user NEVER needs to reload the page
  useEffect(() => {
    if (typeof window === "undefined" || !enabled) return;

    const handleAutoDetect = () => {
      // Re-acquire stream if previously blocked or inactive
      if (!streamRef.current || streamRef.current.getTracks().length === 0 || permissionError) {
        initStream();
      }
    };

    // When returning to tab after changing browser permissions in lock/settings popup
    window.addEventListener("focus", handleAutoDetect);
    document.addEventListener("visibilitychange", handleAutoDetect);

    // When hardware device state changes
    navigator.mediaDevices?.addEventListener("devicechange", handleAutoDetect);

    // Browser permission status change listeners (Chrome, Edge, Brave, Firefox)
    let camStatus: PermissionStatus | null = null;
    let micStatus: PermissionStatus | null = null;

    if (navigator.permissions?.query) {
      navigator.permissions
        .query({ name: "camera" as PermissionName })
        .then((status) => {
          camStatus = status;
          status.addEventListener("change", handleAutoDetect);
        })
        .catch(() => {});

      navigator.permissions
        .query({ name: "microphone" as PermissionName })
        .then((status) => {
          micStatus = status;
          status.addEventListener("change", handleAutoDetect);
        })
        .catch(() => {});
    }

    return () => {
      window.removeEventListener("focus", handleAutoDetect);
      document.removeEventListener("visibilitychange", handleAutoDetect);
      navigator.mediaDevices?.removeEventListener("devicechange", handleAutoDetect);
      camStatus?.removeEventListener("change", handleAutoDetect);
      micStatus?.removeEventListener("change", handleAutoDetect);
    };
  }, [enabled, initStream, permissionError]);

  // Toggle Video: when stopping, call track.stop() to turn hardware off from system
  const toggleVideo = useCallback(async () => {
    if (isVideoEnabled) {
      // Currently ON -> Turn OFF and release camera hardware from system
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
      // Currently OFF -> Turn ON and acquire camera hardware (User click triggers native prompt if needed)
      try {
        setIsLoading(true);
        const newVideoStream = await navigator.mediaDevices.getUserMedia({
          video: selectedVideoDevice ? { deviceId: { exact: selectedVideoDevice } } : true,
        });
        const newTrack = newVideoStream.getVideoTracks()[0];

        if (newTrack) {
          if (streamRef.current) {
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
        setPermissionError("Could not access camera. Please allow camera access in browser settings.");
      } finally {
        setIsLoading(false);
      }
    }
  }, [isVideoEnabled, selectedVideoDevice, refreshDevices]);

  // Toggle Audio: when muting, call track.stop() to turn microphone off from system
  const toggleAudio = useCallback(async () => {
    if (isAudioEnabled) {
      // Currently ON -> Turn OFF and release microphone hardware from system
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
      // Currently OFF -> Turn ON and acquire microphone hardware (User click triggers native prompt if needed)
      try {
        setIsLoading(true);
        const newAudioStream = await navigator.mediaDevices.getUserMedia({
          audio: selectedAudioDevice ? { deviceId: { exact: selectedAudioDevice } } : true,
        });
        const newTrack = newAudioStream.getAudioTracks()[0];

        if (newTrack) {
          if (streamRef.current) {
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
        setPermissionError("Could not access microphone. Please allow microphone access in browser settings.");
      } finally {
        setIsLoading(false);
      }
    }
  }, [isAudioEnabled, selectedAudioDevice, refreshDevices]);

  const setAudioState = useCallback(async (active: boolean) => {
    if (active) {
      if (!isAudioEnabled) {
        try {
          const fresh = await navigator.mediaDevices.getUserMedia({
            audio: selectedAudioDevice ? { deviceId: { exact: selectedAudioDevice } } : true,
          });
          const track = fresh.getAudioTracks()[0];
          if (track) {
            if (streamRef.current) {
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
  }, [isAudioEnabled, selectedAudioDevice]);

  const setVideoState = useCallback(async (active: boolean) => {
    if (active) {
      if (!isVideoEnabled) {
        try {
          const fresh = await navigator.mediaDevices.getUserMedia({
            video: selectedVideoDevice ? { deviceId: { exact: selectedVideoDevice } } : true,
          });
          const track = fresh.getVideoTracks()[0];
          if (track) {
            if (streamRef.current) {
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
  }, [isVideoEnabled, selectedVideoDevice]);

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
