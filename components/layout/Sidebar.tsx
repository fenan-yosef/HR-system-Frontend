"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { ROLE_LABELS } from "@/constants/roles";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  UserCheck, 
  GalleryVerticalEnd,
  LogOut,
  ChevronRight,
  ChevronDown,
  Users2,
  CalendarDays,
  CreditCard,
  Settings,
  ShieldAlert,
  GraduationCap
} from "lucide-react";
import { UserRole } from "@/types/auth";

interface NavSubItem {
  label: string;
  href: string;
}

interface NavItem {
  label: string;
  href?: string;
  icon: React.ElementType;
  roles?: UserRole[];
  subItems?: NavSubItem[];
}

interface NavSection {
  section: string;
  items: NavItem[];
}

const NAVIGATION_CONFIG: NavSection[] = [
  {
    section: "Main",
    items: [
      { 
        label: "Dashboard", 
        href: ROUTES.DASHBOARD, 
        icon: LayoutDashboard,
        roles: ["ADMIN", "HR_MANAGER", "EMPLOYEE", "APPLICANT"]
      },
    ],
  },
  {
    section: "Recruitment",
    items: [
      { 
        label: "Job Postings", 
        href: ROUTES.RECRUITMENT_JOB_POSTINGS, 
        icon: Briefcase,
        roles: ["ADMIN", "HR_MANAGER"]
      },
      { 
        label: "Applications", 
        href: ROUTES.RECRUITMENT_APPLICATIONS, 
        icon: Users,
        roles: ["ADMIN", "HR_MANAGER"]
      },
      { 
        label: "Shortlist", 
        href: ROUTES.RECRUITMENT_SHORTLIST, 
        icon: UserCheck,
        roles: ["ADMIN", "HR_MANAGER"]
      },
    ],
  },
  {
    section: "People & Ops",
    items: [
      { 
        label: "Employees", 
        icon: Users2,
        roles: ["ADMIN", "HR_MANAGER"],
        subItems: [
          { label: "All Directory", href: "#" },
          { label: "Onboarding", href: "#" },
          { label: "Offboarding", href: "#" },
        ]
      },
      { 
        label: "Attendance", 
        icon: CalendarDays,
        roles: ["ADMIN", "HR_MANAGER", "EMPLOYEE"],
        subItems: [
          { label: "My Attendance", href: "#" },
          { label: "Team Logs", href: "#" },
          { label: "Leave Requests", href: "#" },
        ]
      },
      { 
        label: "Payroll", 
        icon: CreditCard,
        roles: ["ADMIN", "HR_MANAGER", "EMPLOYEE"],
        subItems: [
          { label: "Payslips", href: "#" },
          { label: "Tax Forms", href: "#" },
          { label: "Settings", href: "#" },
        ]
      },
    ],
  },
  {
    section: "Growth",
    items: [
      { 
        label: "Learning", 
        icon: GraduationCap,
        roles: ["EMPLOYEE", "ADMIN", "HR_MANAGER"],
        subItems: [
          { label: "Courses", href: "#" },
          { label: "Certifications", href: "#" },
        ]
      },
    ],
  },
  {
    section: "System",
    items: [
      { 
        label: "Security", 
        icon: ShieldAlert,
        roles: ["ADMIN"],
        href: "#"
      },
      { 
        label: "Settings", 
        icon: Settings,
        roles: ["ADMIN", "HR_MANAGER", "EMPLOYEE"],
        href: "#"
      },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (label: string) => {
    setOpenSections(prev => ({ ...prev, [label]: !prev[label] }));
  };

  // Pre-open sections that contain the active route
  useEffect(() => {
    const newOpenSections: Record<string, boolean> = {};
    NAVIGATION_CONFIG.forEach(sec => {
      sec.items.forEach(item => {
        if (item.subItems?.some(sub => sub.href === pathname)) {
          newOpenSections[item.label] = true;
        }
      });
    });
    setOpenSections(prev => ({ ...prev, ...newOpenSections }));
  }, [pathname]);

  const userRole = user?.role || "UNKNOWN";

  const SidebarItem = ({ item, index }: { item: NavItem; index: number }) => {
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isOpen = openSections[item.label];
    const isActive = item.href === pathname || item.subItems?.some(s => s.href === pathname);

    return (
      <div className="flex flex-col gap-1">
        {hasSubItems ? (
          <button
            onClick={() => toggleSection(item.label)}
            className={cn(
              "group flex items-center justify-between rounded-xl px-4 py-3 transition-all duration-300",
              isActive ? "text-primary font-bold" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <div className="flex items-center gap-3">
              <item.icon className={cn("size-5 transition-transform group-hover:scale-110", isActive ? "text-primary" : "text-muted-foreground")} />
              <span className="font-medium text-sm">{item.label}</span>
            </div>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="size-3.5 opacity-50" />
            </motion.div>
          </button>
        ) : (
          <Link
            href={item.href || "#"}
            className={cn(
              "group relative flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300",
              isActive
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className={cn("size-5 transition-transform group-hover:scale-110", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
            <span className="font-medium text-sm">{item.label}</span>
            {isActive && (
              <motion.div 
                layoutId="activeNav"
                className="absolute right-2 size-1.5 rounded-full bg-primary-foreground/50"
              />
            )}
          </Link>
        )}

        <AnimatePresence initial={false}>
          {hasSubItems && isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden flex flex-col gap-0.5 pl-9 pr-2"
            >
              {item.subItems?.map((sub, idx) => (
                <Link
                  key={idx}
                  href={sub.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg py-2 px-3 text-xs transition-colors",
                    pathname === sub.href 
                      ? "text-primary font-bold" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <div className={cn("size-1 rounded-full", pathname === sub.href ? "bg-primary" : "bg-muted-foreground/30")} />
                  {sub.label}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <aside className="border-border bg-card text-card-foreground flex h-full w-72 flex-col border-r shadow-sm relative z-20 overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-8 shrink-0">
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

      <nav className="flex-1 overflow-y-auto space-y-6 px-4 py-2 custom-scrollbar">
        {NAVIGATION_CONFIG.map((section, sIdx) => {
          const visibleItems = section.items.filter(item => 
            !item.roles || item.roles.includes(userRole as any)
          );

          if (visibleItems.length === 0) return null;

          return (
            <div key={sIdx} className="space-y-2">
              <h3 className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
                {section.section}
              </h3>
              <div className="space-y-1">
                {visibleItems.map((item, iIdx) => (
                  <SidebarItem key={iIdx} item={item} index={iIdx} />
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="mt-auto p-4 shrink-0 border-t border-border/40">
        <div className="rounded-2xl bg-muted/50 p-4 border border-border/50 transition-all hover:bg-muted/80">
          {user ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary border border-primary/20">
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
                className="flex w-full items-center justify-between gap-2 rounded-xl bg-background px-3 py-2.5 text-xs font-semibold text-muted-foreground transition-all hover:bg-destructive/5 hover:text-destructive border border-border group"
              >
                <div className="flex items-center gap-2">
                  <LogOut className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
                  Sign Out
                </div>
                <ChevronRight className="size-3 opacity-50 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          ) : (
            <p className="text-center text-xs text-muted-foreground">Not signed in</p>
          )}
        </div>
        <p className="mt-4 text-center text-[10px] text-muted-foreground/50 font-medium uppercase tracking-tighter">
          Enterprise v1.2.1 • HRFlow AI
        </p>
      </div>
    </aside>
  );
}
