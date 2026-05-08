"use client";

import React from "react";
import useNotifications from "@/hooks/useNotifications";

export default function NotificationsPage() {
  const { notifications } = useNotifications();

  return (
    <section className="space-y-6 pb-10">
      <div>
        <h1 className="text-3xl font-extrabold">Notifications</h1>
        <p className="text-sm text-muted-foreground">Latest updates from the system.</p>
      </div>

      <div className="grid gap-4">
        {notifications.length === 0 ? (
          <div className="rounded-xl border border-border/40 p-6 bg-background text-muted-foreground">No notifications available.</div>
        ) : (
          notifications.map((n) => (
            <div key={n.id} className="rounded-xl border border-border/40 p-4 bg-background">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm">{n.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{n.description}</p>
                </div>
                {!n.read && <span className="size-2 rounded-full bg-primary" />}
              </div>
              <p className="mt-3 text-[10px] text-muted-foreground">{new Date(n.createdAt).toLocaleString()}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
