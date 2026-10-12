export function formatMeetingId(id: string): string {
  if (!id) return "";
  const cleaned = id.replace(/[^a-zA-Z0-9]/g, "");
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 7)} ${cleaned.slice(7)}`;
  }
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 7)} ${cleaned.slice(7)}`;
  }
  if (cleaned.length === 9) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  return id;
}

export function parseMeetingIdFromInput(input: string): { meetingId: string; passcode?: string } {
  const trimmed = input.trim();
  if (!trimmed) return { meetingId: "" };

  try {
    // If user pasted a full URL
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.includes("/meeting/")) {
      const url = new URL(trimmed.startsWith("http") ? trimmed : `http://dummy.com/${trimmed}`);
      const pathParts = url.pathname.split("/").filter(Boolean);
      const meetingIndex = pathParts.indexOf("meeting");
      
      let meetingId = "";
      if (meetingIndex !== -1 && pathParts[meetingIndex + 1]) {
        meetingId = pathParts[meetingIndex + 1];
      } else if (url.searchParams.get("id")) {
        meetingId = url.searchParams.get("id") || "";
      }

      const passcode = url.searchParams.get("pwd") || undefined;
      return { meetingId: meetingId.trim(), passcode };
    }
  } catch {
    // Fall through to plain text parsing
  }

  // Treat as raw meeting ID
  return { meetingId: trimmed.replace(/[\s-]/g, "") };
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    return date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} mins`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining > 0 ? `${hours} hr ${remaining} min` : `${hours} hr`;
}

export function getInitials(name: string): string {
  if (!name) return "U";
  // Remove suffixes in parentheses like (Host), (Me), (You), etc. and any remaining parenthesis chars
  const cleanName = name.replace(/\([^)]*\)/g, "").replace(/[()]/g, "").trim();
  const parts = cleanName.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    return true;
  } catch {
    return false;
  }
}
