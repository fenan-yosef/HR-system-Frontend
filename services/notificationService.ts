import { apiFetch, getAccessTokenKey } from "@/services/apiClient";
import type { AppNotification } from "@/lib/notifications";

export async function fetchInbox(): Promise<AppNotification[]> {
  const data = await apiFetch<any>("notifications/", { requiresAuth: true });
  // transform backend shape to frontend AppNotification
  return (data || []).map((n: any) => ({
    id: n.notification_id,
    title: n.title,
    description: n.body,
    createdAt: n.created_at,
    read: Boolean(n.read),
  }));
}

export async function fetchUnreadCount(): Promise<number> {
  const data = await apiFetch<any>("notifications/unread-count/", { requiresAuth: true });
  return data?.unread_count ?? 0;
}

export async function markNotificationAsRead(id: number): Promise<void> {
  await apiFetch<void>(`notifications/${id}/read/`, { method: "POST", requiresAuth: true });
}

export function connectNotificationSocket(onMessage: (payload: any) => void) {
  if (typeof window === "undefined") return null;
  const token = window.localStorage.getItem(getAccessTokenKey());
  const proto = window.location.protocol === "https:" ? "wss" : "ws";
  const url = `${proto}://${window.location.host}/ws/notifications/?token=${token}`;
  const ws = new WebSocket(url);
  ws.onmessage = (ev) => {
    try {
      const data = JSON.parse(ev.data);
      onMessage(data);
    } catch (e) {
      // ignore parse errors
    }
  };
  return ws;
}
