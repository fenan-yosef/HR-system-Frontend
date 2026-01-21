"use client";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="border-border bg-background flex h-14 items-center justify-between border-b px-6 text-sm">
      <div className="flex flex-col">
        <span className="font-semibold">HR Management Workspace</span>
        <span className="text-xs text-muted-foreground">
          Recruitment, employees, and attendance in one view
        </span>
      </div>
      <div className="flex items-center gap-3 text-xs">
        {user && <span className="text-muted-foreground">Signed in as {user.email}</span>}
        {user && (
          <Button variant="outline" size="sm" type="button" onClick={logout}>
            Logout
          </Button>
        )}
      </div>
    </header>
  );
}
