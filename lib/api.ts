import {
  Meeting,
  Participant,
  CreateInstantMeetingPayload,
  ScheduleMeetingPayload,
  JoinMeetingPayload,
  MeetingValidationResult,
} from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return {} as T;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data?.detail || data?.message || `HTTP error ${response.status}`;
    throw new ApiError(errorMsg, response.status, data);
  }

  return data as T;
}

export const api = {
  // 1. Health check
  async health(): Promise<{ status: string }> {
    return fetchJson<{ status: string }>(`${API_BASE_URL}/health`);
  },

  // 2. Upcoming meetings
  async getUpcomingMeetings(): Promise<Meeting[]> {
    return fetchJson<Meeting[]>(`${API_BASE_URL}/meetings/upcoming`, {
      cache: "no-store",
    });
  },

  // 3. Recent meetings
  async getRecentMeetings(limit: number = 20): Promise<Meeting[]> {
    return fetchJson<Meeting[]>(`${API_BASE_URL}/meetings/recent?limit=${limit}`, {
      cache: "no-store",
    });
  },

  // 4. Create instant meeting
  async createInstantMeeting(payload: CreateInstantMeetingPayload = {}): Promise<Meeting> {
    return fetchJson<Meeting>(`${API_BASE_URL}/meetings/instant`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // 5. Schedule a meeting
  async scheduleMeeting(payload: ScheduleMeetingPayload): Promise<Meeting> {
    return fetchJson<Meeting>(`${API_BASE_URL}/meetings/schedule`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // 6. Get meeting details
  async getMeeting(meetingId: string): Promise<Meeting> {
    return fetchJson<Meeting>(`${API_BASE_URL}/meetings/${encodeURIComponent(meetingId)}`, {
      cache: "no-store",
    });
  },

  // 7. Validate meeting
  async validateMeeting(meetingId: string): Promise<MeetingValidationResult> {
    return fetchJson<MeetingValidationResult>(
      `${API_BASE_URL}/meetings/${encodeURIComponent(meetingId)}/validate`
    );
  },

  // 8. Join meeting
  async joinMeeting(meetingId: string, payload: JoinMeetingPayload): Promise<Participant> {
    return fetchJson<Participant>(`${API_BASE_URL}/meetings/${encodeURIComponent(meetingId)}/join`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // 9. Leave meeting
  async leaveMeeting(meetingId: string, clientId: string): Promise<{ message: string }> {
    return fetchJson<{ message: string }>(
      `${API_BASE_URL}/meetings/${encodeURIComponent(meetingId)}/leave?client_id=${encodeURIComponent(clientId)}`,
      { method: "POST" }
    );
  },

  // 10. End meeting (Host)
  async endMeeting(meetingId: string): Promise<Meeting> {
    return fetchJson<Meeting>(`${API_BASE_URL}/meetings/${encodeURIComponent(meetingId)}/end`, {
      method: "POST",
    });
  },

  // 11. Cancel meeting
  async cancelMeeting(meetingId: string): Promise<Meeting> {
    return fetchJson<Meeting>(`${API_BASE_URL}/meetings/${encodeURIComponent(meetingId)}/cancel`, {
      method: "POST",
    });
  },

  // 12. Delete meeting
  async deleteMeeting(meetingId: string): Promise<void> {
    return fetchJson<void>(`${API_BASE_URL}/meetings/${encodeURIComponent(meetingId)}`, {
      method: "DELETE",
    });
  },

  // 13. List participants
  async getParticipants(meetingId: string, activeOnly: boolean = true): Promise<Participant[]> {
    return fetchJson<Participant[]>(
      `${API_BASE_URL}/meetings/${encodeURIComponent(meetingId)}/participants?active_only=${activeOnly}`,
      { cache: "no-store" }
    );
  },

  // 14. Update participant
  async updateParticipant(
    participantId: number,
    payload: { is_muted?: boolean; is_video_on?: boolean; status?: string }
  ): Promise<Participant> {
    return fetchJson<Participant>(`${API_BASE_URL}/participants/${participantId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  // 15. Remove participant
  async removeParticipant(participantId: number): Promise<{ message: string }> {
    return fetchJson<{ message: string }>(`${API_BASE_URL}/participants/${participantId}`, {
      method: "DELETE",
    });
  },
};
