"use client";

import { Bell, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TopHeaderProps {
  title: string;
  subtitle: string;
  accentClass: string;
  badge?: string;
  userName?: string;
  userRoleLabel?: string;
  onLogout?: () => void;
  onMenuClick?: () => void;
}

function getInitials(name?: string) {
  if (!name) return "";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function TopHeader({
  title,
  subtitle,
  accentClass,
  badge,
  userName,
  userRoleLabel = "",
  onLogout,
  onMenuClick,
}: TopHeaderProps) {
  const initials = getInitials(userName) || "HM";

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="flex items-center justify-between gap-4 px-4 py-4 lg:px-6">
        <div className="flex items-start gap-3">
          <span className={cn("h-12 w-1 rounded-full bg-linear-to-b", accentClass)} aria-hidden />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold lg:text-xl">{title}</h1>
              {badge ? (
                <span className="bg-slate-100 text-slate-700 rounded-full px-2 py-0.5 text-xs font-semibold">
                  {badge}
                </span>
              ) : null}
            </div>
            <p className="text-sm text-slate-500 max-w-xl">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
            aria-label="Open navigation"
          >
            <Menu className="size-5" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="size-5" />
          </Button>
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <div className="bg-slate-900 text-white flex size-9 items-center justify-center rounded-full text-sm font-semibold">
              {initials}
            </div>
            <div className="leading-tight">
              <div className="text-sm font-medium text-slate-900">{userName || "User"}</div>
              <div className="text-xs text-slate-500">{userRoleLabel}</div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onLogout} className="hidden sm:inline-flex" aria-label="Logout">
            <LogOut className="mr-2 size-4" /> Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
