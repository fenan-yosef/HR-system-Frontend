"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { ROLE_LABELS } from "@/constants/roles";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  UserCheck, 
  GalleryVerticalEnd,
  LogOut,
  ChevronRight
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: "Job Postings", href: ROUTES.RECRUITMENT_JOB_POSTINGS, icon: Briefcase },
  { label: "Applications", href: ROUTES.RECRUITMENT_APPLICATIONS, icon: Users },
  { label: "Shortlist", href: ROUTES.RECRUITMENT_SHORTLIST, icon: UserCheck },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="border-border bg-card text-card-foreground flex h-full w-72 flex-col border-r shadow-sm relative z-20">
      <div className="flex items-center gap-3 px-6 py-8">
        <motion.div 
          whileHover={{ rotate: 5 }}
          className="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-xl shadow-lg shadow-primary/20"
        >
          <GalleryVerticalEnd className="size-6" />
        </motion.div>
        <div className="flex flex-col">
          <span className="text-lg font-bold tracking-tight">HR<span className="text-primary/70">Flow</span></span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Workspace</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1.5 px-4 py-2">
        {NAV_ITEMS.map((item, index) => {
          const isActive = pathname === item.href;
          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Link
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className={cn("size-5 transition-transform group-hover:scale-110", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="activeNav"
                    className="absolute right-2 size-1.5 rounded-full bg-primary-foreground/50"
                  />
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      <div className="mt-auto p-4">
        <div className="rounded-2xl bg-muted/50 p-4 border border-border/50">
          {user ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <span className="text-sm font-bold">{user.firstName?.[0]}{user.lastName?.[0]}</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <p className="font-bold text-sm truncate">{user.firstName} {user.lastName}</p>
                  <p className="text-[10px] font-medium text-primary uppercase tracking-wide">
                    {ROLE_LABELS[user.role]}
                  </p>
                </div>
              </div>
              
              <button 
                onClick={logout}
                className="flex w-full items-center justify-between gap-2 rounded-lg bg-background px-3 py-2 text-xs font-semibold text-muted-foreground transition-all hover:bg-destructive/5 hover:text-destructive border border-border"
              >
                <div className="flex items-center gap-2">
                  <LogOut className="size-3.5" />
                  Sign Out
                </div>
                <ChevronRight className="size-3 opacity-50" />
              </button>
            </div>
          ) : (
            <p className="text-center text-xs text-muted-foreground">Not signed in</p>
          )}
        </div>
        <p className="mt-4 text-center text-[10px] text-muted-foreground/50 font-medium uppercase tracking-tighter">
          v1.0.4 • © 2026 HRFlow
        </p>
      </div>
    </aside>
  );
}
