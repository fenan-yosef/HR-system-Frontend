"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AppNotification } from "@/lib/notifications";
import { fetchInbox, fetchUnreadCount, markNotificationAsRead, connectNotificationSocket, clearNotifications } from "@/services/notificationService";

export default function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const inbox = await fetchInbox();
        if (!mounted) return;
        setNotifications(inbox.slice(0, 10));
        const uc = await fetchUnreadCount();
        setUnreadCount(uc);
      } catch {
        // ignore for now
      }
    })();

    // connect websocket
    if (typeof window !== "undefined") {
      const ws = connectNotificationSocket((data) => {
        // backend payload follows NotificationSerializer shape
        const n: AppNotification = {
          id: data.notification_id,
          title: data.title,
          description: data.body,
          createdAt: data.created_at,
          read: Boolean(data.read),
        };
        setNotifications((prev) => [n, ...prev].slice(0, 10));
        setUnreadCount((prev) => prev + 1);
      });
      wsRef.current = ws as WebSocket | null;
    }

    return () => {
      mounted = false;
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  const markAllAsRead = useCallback(async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    await Promise.all(unreadIds.map((id) => markNotificationAsRead(id)));
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, [notifications]);

  const markSingleAsRead = useCallback(async (id: number) => {
    await markNotificationAsRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const clearAll = useCallback(async () => {
    await clearNotifications();
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return { notifications, unreadCount, markAllAsRead, markSingleAsRead, clearAll };
}
