export type MeetingStatus = "scheduled" | "active" | "ended" | "cancelled";

export interface Participant {
  id: number;
  meeting_id: number;
  display_name: string;
  client_id: string;
  join_time: string;
  leave_time?: string | null;
  is_host: boolean;
  status: "in_meeting" | "left" | "removed";
  is_muted: boolean;
  is_video_on: boolean;
  created_at: string;
}

export interface Meeting {
  id: number;
  meeting_id: string;
  title: string;
  description?: string | null;
  invite_token: string;
  invite_url: string;
  passcode: string;
  host_display_name: string;
  start_time: string;
  duration: number; // in minutes
  status: MeetingStatus;
  is_instant: boolean;
  created_at: string;
  updated_at: string;
  participant_count: number;
  participants: Participant[];
}

export interface CreateInstantMeetingPayload {
  title?: string;
  host_display_name?: string;
  passcode?: string;
}

export interface ScheduleMeetingPayload {
  title: string;
  description?: string;
  host_display_name?: string;
  start_time: string;
  duration: number;
  passcode?: string;
  timezone?: string;
}

export interface JoinMeetingPayload {
  display_name: string;
  passcode?: string;
  client_id?: string;
  is_host?: boolean;
}

export interface MeetingValidationResult {
  exists: boolean;
  is_valid: boolean;
  meeting_id?: string;
  title?: string;
  status?: string;
  host_display_name?: string;
  start_time?: string;
  duration?: number;
  message: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  displayName: string;
  text: string;
  timestamp: string;
  isSelf?: boolean;
}

export interface PeerStream {
  clientId: string;
  displayName: string;
  stream: MediaStream;
  isMuted?: boolean;
  isVideoOff?: boolean;
}
