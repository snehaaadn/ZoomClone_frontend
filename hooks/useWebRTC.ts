"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ChatMessage, PeerStream } from "@/types";

interface UseWebRTCProps {
  meetingId: string;
  clientId: string;
  displayName: string;
  localStream: MediaStream | null;
  enabled?: boolean;
  onKicked?: (reason: string) => void;
  onMeetingEnded?: (reason: string) => void;
  onMuteRequested?: () => void;
  onReactionReceived?: (emoji: string, senderName: string) => void;
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },
    { urls: "stun:stun.services.mozilla.com" },
    { urls: "stun:global.stun.twilio.com:3478" },
  ],
  iceCandidatePoolSize: 10,
};

function getWebSocketUrl(meetingId: string, clientId: string, displayName: string): string {
  const query = `?display_name=${encodeURIComponent(displayName)}`;
  const path = `/ws/meetings/${encodeURIComponent(meetingId)}/${encodeURIComponent(clientId)}${query}`;

  // 1. Explicit full WebSocket URL (e.g. wss://zoomclone-backend-581y.onrender.com)
  if (process.env.NEXT_PUBLIC_WS_URL) {
    const base = process.env.NEXT_PUBLIC_WS_URL.replace(/\/+$/, "");
    return `${base}${path}`;
  }

  // 2. Explicit WebSocket host (e.g. zoomclone-backend-581y.onrender.com)
  if (process.env.NEXT_PUBLIC_WS_HOST) {
    const cleanHost = process.env.NEXT_PUBLIC_WS_HOST
      .replace(/^https?:\/\//, "")
      .replace(/^wss?:\/\//, "")
      .replace(/\/+$/, "");
    const wsProtocol = typeof window !== "undefined" && window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${wsProtocol}//${cleanHost}${path}`;
  }

  // 3. Automatically extract from NEXT_PUBLIC_API_URL
  if (process.env.NEXT_PUBLIC_API_URL) {
    try {
      const parsed = new URL(process.env.NEXT_PUBLIC_API_URL);
      const wsProtocol = parsed.protocol === "https:" ? "wss:" : "ws:";
      return `${wsProtocol}//${parsed.host}${path}`;
    } catch {}
  }

  // 4. In browser environment: check if on localhost or deployed
  if (typeof window !== "undefined") {
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    if (isLocalhost) {
      return `ws://localhost:8000${path}`;
    }
  }

  // 5. Default fallback for deployed Vercel app to the live Render backend
  return `wss://zoomclone-backend-581y.onrender.com${path}`;
}

export function useWebRTC({
  meetingId,
  clientId,
  displayName,
  localStream,
  enabled = true,
  onKicked,
  onMeetingEnded,
  onMuteRequested,
  onReactionReceived,
}: UseWebRTCProps) {
  const [peerStreams, setPeerStreams] = useState<PeerStream[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [unreadChatCount, setUnreadChatCount] = useState<number>(0);

  const wsRef = useRef<WebSocket | null>(null);
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const peerNames = useRef<Map<string, string>>(new Map());
  const pendingIceCandidates = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());

  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef<boolean>(true);

  // Helper to drain queued ICE candidates after remote description is set
  const drainIceCandidates = useCallback(async (targetClientId: string, pc: RTCPeerConnection) => {
    const queued = pendingIceCandidates.current.get(targetClientId);
    if (queued && queued.length > 0) {
      for (const cand of queued) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(cand));
        } catch (err) {
          console.warn("Error adding queued ICE candidate:", err);
        }
      }
      pendingIceCandidates.current.delete(targetClientId);
    }
  }, []);

  // Cleanup peer connection
  const cleanUpPeer = useCallback((peerClientId: string) => {
    const pc = peerConnections.current.get(peerClientId);
    if (pc) {
      try {
        pc.close();
      } catch {}
      peerConnections.current.delete(peerClientId);
    }
    peerNames.current.delete(peerClientId);
    pendingIceCandidates.current.delete(peerClientId);
    setPeerStreams((prev) => prev.filter((p) => p.clientId !== peerClientId));
  }, []);

  // Setup peer connection helper
  const createPeerConnection = useCallback(
    (targetClientId: string, targetDisplayName: string, isInitiator: boolean) => {
      if (peerConnections.current.has(targetClientId)) {
        return peerConnections.current.get(targetClientId)!;
      }

      peerNames.current.set(targetClientId, targetDisplayName);
      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnections.current.set(targetClientId, pc);

      // Pre-allocate audio & video transceivers so track replacing works smoothly without renegotiation
      let videoTransceiver: RTCRtpTransceiver | undefined;
      let audioTransceiver: RTCRtpTransceiver | undefined;
      try {
        if (pc.addTransceiver) {
          audioTransceiver = pc.addTransceiver("audio", { direction: "sendrecv" });
          videoTransceiver = pc.addTransceiver("video", { direction: "sendrecv" });
        }
      } catch {}

      // Add local stream tracks to the connection
      if (localStream) {
        const liveVideoTrack = localStream.getVideoTracks().find((t) => t.readyState === "live") || null;
        const liveAudioTrack = localStream.getAudioTracks().find((t) => t.readyState === "live") || null;

        if (videoTransceiver && liveVideoTrack) {
          videoTransceiver.sender.replaceTrack(liveVideoTrack).catch(console.error);
        } else if (liveVideoTrack) {
          try { pc.addTrack(liveVideoTrack, localStream); } catch {}
        }

        if (audioTransceiver && liveAudioTrack) {
          audioTransceiver.sender.replaceTrack(liveAudioTrack).catch(console.error);
        } else if (liveAudioTrack) {
          try { pc.addTrack(liveAudioTrack, localStream); } catch {}
        }
      }

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({
              type: "ice-candidate",
              target: targetClientId,
              candidate: event.candidate,
            })
          );
        }
      };

      // Handle incoming remote stream tracks
      pc.ontrack = (event) => {
        const incomingStream = event.streams[0] || new MediaStream();
        if (!event.streams[0]) {
          incomingStream.addTrack(event.track);
        }

        setPeerStreams((prev) => {
          const existing = prev.find((p) => p.clientId === targetClientId);
          if (existing && existing.stream) {
            const currentTracks = existing.stream.getTracks();
            if (!currentTracks.some((t) => t.id === event.track.id)) {
              existing.stream.addTrack(event.track);
            }
            return prev.map((p) =>
              p.clientId === targetClientId
                ? {
                    ...p,
                    displayName: peerNames.current.get(targetClientId) || targetDisplayName || "Participant",
                    stream: new MediaStream(existing.stream.getTracks()),
                  }
                : p
            );
          }

          const peerData: PeerStream = {
            clientId: targetClientId,
            displayName: peerNames.current.get(targetClientId) || targetDisplayName || "Participant",
            stream: incomingStream,
          };
          return [...prev, peerData];
        });
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "closed" || pc.connectionState === "failed") {
          cleanUpPeer(targetClientId);
        }
      };

      // If initiator, create and send offer
      if (isInitiator) {
        pc.createOffer()
          .then((offer) => pc.setLocalDescription(offer))
          .then(() => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(
                JSON.stringify({
                  type: "offer",
                  target: targetClientId,
                  sdp: pc.localDescription,
                })
              );
            }
          })
          .catch((err) => console.error("Error creating WebRTC offer:", err));
      }

      return pc;
    },
    [localStream, cleanUpPeer]
  );

  // Update tracks when localStream changes (e.g. mic/cam toggle)
  useEffect(() => {
    peerConnections.current.forEach((pc) => {
      const senders = pc.getSenders();
      const liveVideoTrack = localStream?.getVideoTracks().find((t) => t.readyState === "live") || null;
      const liveAudioTrack = localStream?.getAudioTracks().find((t) => t.readyState === "live") || null;

      const transceivers = pc.getTransceivers ? pc.getTransceivers() : [];
      const videoTransceiver = transceivers.find((t) => t.receiver.track.kind === "video");
      const audioTransceiver = transceivers.find((t) => t.receiver.track.kind === "audio");

      const videoSender = videoTransceiver?.sender || senders.find((s) => s.track?.kind === "video");
      const audioSender = audioTransceiver?.sender || senders.find((s) => s.track?.kind === "audio");

      if (videoSender) {
        videoSender.replaceTrack(liveVideoTrack).catch(console.error);
      } else if (liveVideoTrack && localStream) {
        try { pc.addTrack(liveVideoTrack, localStream); } catch {}
      }

      if (audioSender) {
        audioSender.replaceTrack(liveAudioTrack).catch(console.error);
      } else if (liveAudioTrack && localStream) {
        try { pc.addTrack(liveAudioTrack, localStream); } catch {}
      }
    });
  }, [localStream]);

  // Request room peers sync from backend signaling
  const syncPeers = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "sync-room" }));
    }
  }, []);

  // Connect WebSocket with heartbeat ping and auto-reconnect
  useEffect(() => {
    isMountedRef.current = true;
    if (!enabled || !meetingId || !clientId || !displayName) return;

    const connectWebSocket = () => {
      if (!isMountedRef.current) return;

      const wsUrl = getWebSocketUrl(meetingId, clientId, displayName);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!isMountedRef.current) return;
        setIsConnected(true);

        // Start 20-second heartbeat to prevent Render from dropping idle connection (55s limit)
        if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "ping" }));
          }
        }, 20000);
      };

      ws.onerror = (err) => {
        console.warn("Signaling WebSocket connection error:", err);
      };

      ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          const { type } = data;

          if (type === "pong") {
            // Heartbeat response from server
            return;
          }

          if (type === "room-state") {
            // Connected/Reconnected: register and connect with all existing peers
            const { peers } = data;
            if (Array.isArray(peers)) {
              peers.forEach((peer: { clientId: string; displayName: string; isMuted?: boolean; isVideoOff?: boolean }) => {
                peerNames.current.set(peer.clientId, peer.displayName);
                setPeerStreams((prev) => {
                  if (prev.some((p) => p.clientId === peer.clientId)) {
                    return prev.map((p) =>
                      p.clientId === peer.clientId
                        ? { ...p, displayName: peer.displayName, isMuted: peer.isMuted, isVideoOff: peer.isVideoOff }
                        : p
                    );
                  }
                  return [
                    ...prev,
                    {
                      clientId: peer.clientId,
                      displayName: peer.displayName,
                      stream: new MediaStream(),
                      isMuted: peer.isMuted,
                      isVideoOff: peer.isVideoOff,
                    },
                  ];
                });
                createPeerConnection(peer.clientId, peer.displayName, true);
              });
            }
          } else if (type === "peer-joined") {
            // Another peer joined. Register immediately in peerStreams so UI shows both participants
            peerNames.current.set(data.clientId, data.displayName);
            setPeerStreams((prev) => {
              if (prev.some((p) => p.clientId === data.clientId)) {
                return prev.map((p) =>
                  p.clientId === data.clientId
                    ? { ...p, displayName: data.displayName, isMuted: data.isMuted, isVideoOff: data.isVideoOff }
                    : p
                );
              }
              return [
                ...prev,
                {
                  clientId: data.clientId,
                  displayName: data.displayName,
                  stream: new MediaStream(),
                  isMuted: data.isMuted,
                  isVideoOff: data.isVideoOff,
                },
              ];
            });
            // Ensure connection initiated if not already
            createPeerConnection(data.clientId, data.displayName, true);
          } else if (type === "peer-left") {
            cleanUpPeer(data.clientId);
          } else if (type === "offer") {
            const pc = createPeerConnection(data.sender, peerNames.current.get(data.sender) || "Peer", false);
            await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
            await drainIceCandidates(data.sender, pc);

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            if (ws.readyState === WebSocket.OPEN) {
              ws.send(
                JSON.stringify({
                  type: "answer",
                  target: data.sender,
                  sdp: pc.localDescription,
                })
              );
            }
          } else if (type === "answer") {
            const pc = peerConnections.current.get(data.sender);
            if (pc) {
              await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
              await drainIceCandidates(data.sender, pc);
            }
          } else if (type === "ice-candidate") {
            const pc = peerConnections.current.get(data.sender);
            if (pc && data.candidate) {
              if (pc.remoteDescription && pc.remoteDescription.type) {
                await pc.addIceCandidate(new RTCIceCandidate(data.candidate)).catch(console.error);
              } else {
                if (!pendingIceCandidates.current.has(data.sender)) {
                  pendingIceCandidates.current.set(data.sender, []);
                }
                pendingIceCandidates.current.get(data.sender)!.push(data.candidate);
              }
            }
          } else if (type === "chat-message") {
            const newMsg: ChatMessage = {
              id: `${Date.now()}-${Math.random()}`,
              sender: data.sender,
              displayName: data.displayName,
              text: data.text,
              timestamp: data.timestamp || new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
              isSelf: data.sender === clientId,
            };
            setChatMessages((prev) => [...prev, newMsg]);
            if (data.sender !== clientId) {
              setUnreadChatCount((prev) => prev + 1);
            }
          } else if (type === "reaction") {
            onReactionReceived?.(data.emoji, data.displayName || "Participant");
          } else if (type === "mute-all") {
            onMuteRequested?.();
          } else if (type === "removed-by-host") {
            onKicked?.(data.message || "Removed by host.");
          } else if (type === "meeting-ended") {
            onMeetingEnded?.(data.message || "Meeting ended by host.");
          } else if (type === "media-state") {
            setPeerStreams((prev) =>
              prev.map((p) => {
                if (p.clientId === data.sender) {
                  return {
                    ...p,
                    isMuted: data.audio === false,
                    isVideoOff: data.video === false,
                  };
                }
                return p;
              })
            );
          }
        } catch (err) {
          console.error("Signaling error:", err);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
          heartbeatIntervalRef.current = null;
        }

        // Auto-reconnect after 2.5s if component is still mounted and enabled
        if (isMountedRef.current && enabled) {
          if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, 2500);
        }
      };
    };

    connectWebSocket();

    return () => {
      isMountedRef.current = false;
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      peerConnections.current.forEach((pc) => {
        try { pc.close(); } catch {}
      });
      peerConnections.current.clear();
      peerNames.current.clear();
      pendingIceCandidates.current.clear();

      if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
        wsRef.current.close();
      }
    };
  }, [meetingId, clientId, displayName, enabled, createPeerConnection, cleanUpPeer, drainIceCandidates, onKicked, onMeetingEnded, onMuteRequested, onReactionReceived]);

  const sendChatMessage = useCallback(
    (text: string) => {
      if (!text.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
      const timestamp = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
      wsRef.current.send(
        JSON.stringify({
          type: "chat-message",
          text: text.trim(),
          timestamp,
        })
      );
    },
    []
  );

  const broadcastMediaState = useCallback((isAudioOn: boolean, isVideoOn: boolean) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "media-state",
          audio: isAudioOn,
          video: isVideoOn,
        })
      );
    }
  }, []);

  const sendReaction = useCallback((emoji: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "reaction",
          emoji,
        })
      );
    }
  }, []);

  const broadcastScreenState = useCallback((isSharing: boolean) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "screen-state",
          isSharing,
        })
      );
    }
  }, []);

  const sendMuteAll = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "mute-all" }));
    }
  }, []);

  const removePeer = useCallback((targetClientId: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "remove-peer",
          target: targetClientId,
        })
      );
    }
  }, []);

  const endMeetingForEveryone = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "meeting-ended" }));
    }
  }, []);

  const clearUnreadCount = useCallback(() => {
    setUnreadChatCount(0);
  }, []);

  return {
    peerStreams,
    setPeerStreams,
    chatMessages,
    isConnected,
    unreadChatCount,
    clearUnreadCount,
    sendChatMessage,
    broadcastMediaState,
    sendReaction,
    broadcastScreenState,
    sendMuteAll,
    removePeer,
    endMeetingForEveryone,
    syncPeers,
  };
}
