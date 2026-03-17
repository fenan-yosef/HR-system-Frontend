export type NotificationPreferenceKey = "email" | "push" | "sms";

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
}

export interface AppNotification {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
}

const PREFERENCES_KEY = "hrms_notification_preferences";
const NOTIFICATIONS_KEY = "hrms_notifications";

export const defaultNotificationPreferences: NotificationPreferences = {
  email: true,
  push: true,
  sms: false,
};

export const defaultNotifications: AppNotification[] = [
  {
    id: 1,
    title: "Recruitment update",
    description: "Three new applicants were added to the shortlist.",
    createdAt: "2026-03-17T09:15:00.000Z",
    read: false,
  },
  {
    id: 2,
    title: "Leave request approved",
    description: "Your annual leave request for Mar 21 - Mar 22 was approved.",
    createdAt: "2026-03-16T14:45:00.000Z",
    read: false,
  },
  {
    id: 3,
    title: "Payroll reminder",
    description: "Final payroll review is scheduled for Friday at 4:00 PM.",
    createdAt: "2026-03-15T11:00:00.000Z",
    read: true,
  },
];

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function loadNotificationPreferences(): NotificationPreferences {
  return {
    ...defaultNotificationPreferences,
    ...readStorage<Partial<NotificationPreferences>>(PREFERENCES_KEY, defaultNotificationPreferences),
  };
}

export function saveNotificationPreferences(preferences: NotificationPreferences) {
  writeStorage(PREFERENCES_KEY, preferences);
}

export function loadNotifications(): AppNotification[] {
  return readStorage<AppNotification[]>(NOTIFICATIONS_KEY, defaultNotifications);
}

export function saveNotifications(notifications: AppNotification[]) {
  writeStorage(NOTIFICATIONS_KEY, notifications);
}

// Placeholder mutation helpers. These centralize notification state updates so
// the app can later swap localStorage for backend API calls without changing UI components.
export function markAllNotificationsAsRead(notifications: AppNotification[]): AppNotification[] {
  return notifications.map((notification) => ({ ...notification, read: true }));
}

export function markNotificationAsRead(
  notifications: AppNotification[],
  notificationId: number,
): AppNotification[] {
  return notifications.map((notification) =>
    notification.id === notificationId
      ? { ...notification, read: true }
      : notification,
  );
}
