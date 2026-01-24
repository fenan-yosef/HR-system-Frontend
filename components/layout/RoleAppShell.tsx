"use client";

import { useMemo, useState } from "react";
import type { UserRole } from "@/types/auth";
import { useAuth } from "@/hooks/useAuth";
import { getHeaderForRole, getNavItemsForRole } from "@/components/navigation/roleNavConfig";
import { SideNav } from "@/components/layout/SideNav";
import { TopHeader } from "@/components/layout/TopHeader";
import { cn } from "@/lib/utils";

interface RoleAppShellProps {
  role?: UserRole;
  children: React.ReactNode;
  userName?: string;
}

export function RoleAppShell({ role, children, userName }: RoleAppShellProps) {
  const { user, logout } = useAuth();
  const [navOpen, setNavOpen] = useState(false);

  const resolvedRole: UserRole = useMemo(() => {
    if (role) return role;
    if (user?.role) return user.role;
    return "UNKNOWN";
  }, [role, user?.role]);

  const navItems = getNavItemsForRole(resolvedRole);
  const headerContent = getHeaderForRole(resolvedRole);

  const displayName = userName ?? user?.username ?? "";
  const roleLabel = headerContent.badge ?? resolvedRole;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex">
        <SideNav
          items={navItems}
          isOpen={navOpen}
          onClose={() => setNavOpen(false)}
          roleLabel={roleLabel}
        />

        {navOpen && (
          <button
            type="button"
            aria-label="Close menu overlay"
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setNavOpen(false)}
          />
        )}

        <main className="flex min-h-screen flex-1 flex-col lg:ml-0">
          <TopHeader
            title={headerContent.title}
            subtitle={headerContent.subtitle}
            accentClass={headerContent.accentClass}
            badge={headerContent.badge}
            userName={displayName || "User"}
            userRoleLabel={roleLabel}
            onLogout={logout}
            onMenuClick={() => setNavOpen(true)}
          />

          <div className={cn("w-full flex-1 p-4 lg:p-6")}>{children}</div>
        </main>
      </div>
    </div>
  );
}
