import { apiFetch, getAccessTokenKey, API_BASE_URL } from "@/services/apiClient";
import type { AppNotification } from "@/lib/notifications";

interface BackendNotification {
  notification_id: number;
  title: string;
  body: string;
  created_at: string;
  read: boolean;
}

interface UnreadCountResponse {
  unread_count: number;
}

export async function fetchInbox(): Promise<AppNotification[]> {
  const data = await apiFetch<BackendNotification[]>("notifications/", { requiresAuth: true });
  // transform backend shape to frontend AppNotification
  return (data || []).map((n) => ({
    id: n.notification_id,
    title: n.title,
    description: n.body,
    createdAt: n.created_at,
    read: Boolean(n.read),
  }));
}

export async function fetchUnreadCount(): Promise<number> {
  const data = await apiFetch<UnreadCountResponse>("notifications/unread-count/", { requiresAuth: true });
  return data?.unread_count ?? 0;
}

export async function markNotificationAsRead(id: number): Promise<void> {
  await apiFetch<void>(`notifications/${id}/read/`, { method: "POST", requiresAuth: true });
}

export async function clearNotifications(): Promise<void> {
  await apiFetch<void>("notifications/clear/", { method: "POST", requiresAuth: true });
}

export function connectNotificationSocket(onMessage: (payload: BackendNotification) => void) {
  if (typeof window === "undefined") return null;
  const token = window.localStorage.getItem(getAccessTokenKey());
  const proto = window.location.protocol === "https:" ? "wss" : "ws";
  
  let host = window.location.host;
  try {
    if (API_BASE_URL && (API_BASE_URL.startsWith("http://") || API_BASE_URL.startsWith("https://"))) {
      const urlObj = new URL(API_BASE_URL);
      host = urlObj.host;
    }
  } catch (e) {}

  const url = `${proto}://${host}/ws/notifications/?token=${token}`;
  const ws = new WebSocket(url);
  ws.onmessage = (ev) => {
    try {
      const data = JSON.parse(ev.data) as BackendNotification;
      onMessage(data);
    } catch {
      // ignore parse errors
    }
  };
  return ws;
}
