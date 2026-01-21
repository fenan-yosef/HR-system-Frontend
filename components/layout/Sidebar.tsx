"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { ROLE_LABELS } from "@/constants/roles";
import { useAuth } from "@/hooks/useAuth";

interface NavItem {
  label: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: ROUTES.DASHBOARD },
  { label: "Job Postings", href: ROUTES.RECRUITMENT_JOB_POSTINGS },
  { label: "Applications", href: ROUTES.RECRUITMENT_APPLICATIONS },
  { label: "Shortlist", href: ROUTES.RECRUITMENT_SHORTLIST },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside className="border-sidebar-border bg-sidebar text-sidebar-foreground flex h-full w-64 flex-col border-r">
      <div className="flex items-center gap-2 border-b px-4 py-4">
        <div className="bg-sidebar-primary text-sidebar-primary-foreground flex size-8 items-center justify-center rounded-md text-sm font-semibold">
          GH
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold">Guest Home HRMS</span>
          <span className="text-xs text-muted-foreground">Intelligent Recruitment</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-4 text-sm">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
            >
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-sidebar-border mt-auto border-t px-4 py-3 text-xs text-muted-foreground">
        {user ? (
          <div className="space-y-0.5">
            <p className="font-medium text-foreground">{user.fullName}</p>
            <p>{user.email}</p>
            <p className="text-[11px] uppercase tracking-wide">
              {ROLE_LABELS[user.role]} role
            </p>
          </div>
        ) : (
          <p>Not signed in</p>
        )}
      </div>
    </aside>
  );
}
