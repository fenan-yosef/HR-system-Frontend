"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Bell, Search, HelpCircle, Menu } from "lucide-react";
import { motion } from "framer-motion";
import {
  AppNotification,
  loadNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  saveNotifications,
} from "@/lib/notifications";

export function Header() {
  const { user } = useAuth();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const notificationsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setNotifications(loadNotifications());
  }, []);

  useEffect(() => {
    if (!isNotificationsOpen) return;

    const updated = markAllNotificationsAsRead(loadNotifications());
    setNotifications(updated);
    saveNotifications(updated);
  }, [isNotificationsOpen]);

  useEffect(() => {
    if (!isNotificationsOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!notificationsRef.current) return;
      if (!notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isNotificationsOpen]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications],
  );

  const markAllAsRead = () => {
    const updated = markAllNotificationsAsRead(notifications);
    setNotifications(updated);
    saveNotifications(updated);
    setIsNotificationsOpen(false);
  };

  const markSingleAsRead = (id: number) => {
    const updated = markNotificationAsRead(notifications, id);
    setNotifications(updated);
    saveNotifications(updated);
    setIsNotificationsOpen(false);
  };

  return (
    <header className="sticky text-black top-0 z-10 flex h-20 items-center justify-between border-b border-border/50 bg-background/80 px-8 backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <button className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors">
          <Menu className="size-5" />
        </button>
        <div className="flex flex-col">
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg font-bold tracking-tight "
          >
            Management Portal
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xs font-medium text-muted-foreground"
          >
            Monitor recruitment metrics and employee data
          </motion.p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search anything..."
            className="h-10 w-64 rounded-xl bg-muted/50 pl-10 pr-4 text-xs font-medium transition-all focus:bg-muted focus:ring-2 focus:ring-primary/20 border-none outline-none"
          />
        </div>

        <div className="flex items-center gap-2 border-l border-border/50 pl-6">
          <div ref={notificationsRef} className="relative">
            <button
              onClick={() => setIsNotificationsOpen((value) => !value)}
              className="relative rounded-xl p-2  transition-all hover:bg-muted "
            >
              <Bell className="size-5" />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 inline-flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold  ring-2 ring-background">
                  {unreadCount}
                </span>
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 top-12 z-30 w-80 overflow-hidden rounded-2xl border border-border/60 bg-background text-foreground shadow-2xl">
                <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      Notifications
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {unreadCount} unread updates
                    </p>
                  </div>
                  <button
                    onClick={markAllAsRead}
                    className="text-[10px] font-bold uppercase tracking-wider text-primary hover:underline"
                  >
                    Mark all read
                  </button>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="px-4 py-6 text-sm text-muted-foreground">
                      No notifications available.
                    </p>
                  ) : (
                    notifications.map((notification) => (
                      <button
                        key={notification.id}
                        onClick={() => markSingleAsRead(notification.id)}
                        className={`block w-full border-b border-border/40 px-4 py-3 text-left transition-colors hover:bg-muted/40 ${notification.read ? "bg-background" : "bg-primary/5"}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {notification.title}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {notification.description}
                            </p>
                          </div>
                          {!notification.read && (
                            <span className="mt-1 size-2 rounded-full bg-primary" />
                          )}
                        </div>
                        <p className="mt-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <button className="p-2  hover:bg-muted rounded-xl transition-all">
            <HelpCircle className="size-5" />
          </button>

          <div className="ml-2 h-8 w-px bg-border/50" />

          <div className="flex items-center gap-3 pl-2">
            <div className="flex flex-col items-end sm:flex">
              <span className="text-sm font-bold leading-none text-foreground">
                {user?.firstName}
              </span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                Online
              </span>
            </div>
            <div className="size-9 rounded-xl bg-linear-to-br from-primary to-primary/60 p-px">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-background">
                <span className="text-xs font-bold text-foreground">
                  {user?.firstName?.[0]}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
