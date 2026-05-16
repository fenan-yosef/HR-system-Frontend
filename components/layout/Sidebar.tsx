"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUI } from "@/context/UIContext";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { ROLE_LABELS } from "@/constants/roles";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import {
  LayoutDashboard,
  Briefcase,
  UserCheck,
  GalleryVerticalEnd,
  LogOut,
  ChevronRight,
  ChevronDown,
  Users2,
  CreditCard,
  Settings,
  GraduationCap,
  Target,
  FileText,
  UserCircle,
  Clock,
  MessageSquareText,
  ShieldAlert,
} from "lucide-react";
import { UserRole } from "@/types/auth";
import Image from "next/image";
import { getMediaUrl } from "@/services/apiClient";

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
    section: "Overview",
    items: [
      {
        label: "Dashboard",
        href: ROUTES.DASHBOARD,
        icon: LayoutDashboard,
        roles: ["ADMIN", "HR_CEO", "EMPLOYEE", "APPLICANT"],
      },
    ],
  },
  {
    section: "Talent Hub",
    items: [
      {
        label: "Recruitment",
        icon: Briefcase,
        roles: ["ADMIN", "HR_STAFF", "HR_CEO"],
        subItems: [
          { label: "Job Postings", href: ROUTES.RECRUITMENT_JOB_POSTINGS },
          { label: "Applications", href: ROUTES.RECRUITMENT_APPLICATIONS },
          { label: "Shortlist", href: ROUTES.RECRUITMENT_SHORTLIST },
        ],
      },
      {
        label: "Onboarding",
        href: ROUTES.ONBOARDING,
        icon: UserCheck,
        roles: ["ADMIN", "HR_CEO"],
      },
    ],
  },
  {
    section: "",
    items: [
      {
        label: "People",
        icon: Users2,
        roles: ["ADMIN", "HR_STAFF"],
        subItems: [
          { label: "Employee Directory", href: ROUTES.EMPLOYEES },
          { label: "Departments", href: ROUTES.DEPARTMENTS },
          { label: "Offboarding", href: ROUTES.OFFBOARDING },
        ],
      },
      {
        label: "Attendance",
        icon: Clock,
        roles: ["ADMIN", "HR_STAFF", "EMPLOYEE"],
        subItems: [
          { label: "Time Logs", href: ROUTES.ATTENDANCE },
          { label: "Leave Requests", href: ROUTES.LEAVE_REQUESTS },
        ],
      },
    ],
  },
  {
    section: "Growth",
    items: [
      {
        label: "Requests",
        icon: FileText,
        roles: ["EMPLOYEE"],
        subItems: [
          { label: "Complaint", href: ROUTES.EMPLOYEE_REQUEST_COMPLAINT },
          { label: "Letter Request", href: ROUTES.EMPLOYEE_REQUEST_LETTER },
          { label: "Transfer Request", href: ROUTES.EMPLOYEE_REQUEST_TRANSFER },
        ],
      },
      {
        label: "Letter Requests",
        href: ROUTES.HR_LETTER_REQUESTS,
        icon: FileText,
        roles: ["ADMIN", "HR_STAFF", "HR_CEO"],
      },
      {
        label: "Complaints",
        href: ROUTES.HR_COMPLAINTS,
        icon: MessageSquareText,
        roles: ["ADMIN", "HR_STAFF"],
      },
      {
        label: "Beneficiaries",
        href: ROUTES.HR_BENEFICIARIES,
        icon: Users2,
        roles: ["ADMIN", "HR_STAFF"],
      },
      {
        label: "ID Cards",
        href: ROUTES.HR_ID_CARDS,
        icon: CreditCard,
        roles: ["ADMIN", "HR_STAFF", "HR_CEO"],
      },
      {
        label: "Disciplinary Records",
        icon: ShieldAlert,
        roles: ["ADMIN", "HR_STAFF"],
        href: ROUTES.HR_DISCIPLINARY,
      },
      {
        label: "Create Disciplinary",
        icon: ShieldAlert,
        roles: ["ADMIN", "HR_STAFF"],
        href: ROUTES.HR_CREATE_DISCIPLINARY,
      },
      {
        label: "Disciplinary Approvals",
        icon: ShieldAlert,
        roles: ["ADMIN", "HR_CEO"],
        href: ROUTES.CEO_DISCIPLINARY_APPROVALS,
      },
      {
        label: "My Disciplinary",
        href: ROUTES.MY_DISCIPLINARY,
        icon: ShieldAlert,
        roles: ["EMPLOYEE"],
      },
    ],
  },

  {
    section: "Personal",
    items: [
      {
        label: "My Profile",
        href: ROUTES.MY_PROFILE,
        icon: UserCircle,
        roles: ["ADMIN", "HR_CEO", "EMPLOYEE", "APPLICANT"],
      },
      // {
      //   label: "Documents",
      //   href: ROUTES.MY_DOCUMENTS,
      //   icon: FileText,
      //   roles: ["ADMIN", "HR_CEO", "EMPLOYEE", "APPLICANT"],
      // },
    ],
  },
  {
    section: "Control",
    items: [
      {
        label: "System",
        icon: Settings,
        roles: ["ADMIN"],
        subItems: [
          { label: "Security", href: ROUTES.SECURITY },
          { label: "Config", href: ROUTES.SETTINGS },
        ],
      },
    ],
  },
  // {
  //   section: "Control",
  //   items: [
  //     {
  //       label: "System",
  //       icon: Settings,
  //       roles: ["ADMIN"],
  //       subItems: [
  //         { label: "Security", href: ROUTES.SECURITY },
  //         { label: "Config", href: ROUTES.SETTINGS },
  //       ],
  //     },
  //   ],
  // },
];

export function Sidebar() {
  const { isSidebarOpen, closeSidebar } = useUI();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleLinkClick = () => {
    closeSidebar();
  };

  const autoOpenSections = useMemo(() => {
    const nextAutoOpen: Record<string, boolean> = {};
    NAVIGATION_CONFIG.forEach((sec) => {
      sec.items.forEach((item) => {
        if (item.subItems?.some((sub) => sub.href === pathname)) {
          nextAutoOpen[item.label] = true;
        }
      });
    });
    return nextAutoOpen;
  }, [pathname]);

  const [sectionOverrides, setSectionOverrides] = useState<
    Record<string, boolean | undefined>
  >({});

  const getIsSectionOpen = (label: string) => {
    const overridden = sectionOverrides[label];
    if (typeof overridden === "boolean") return overridden;
    return Boolean(autoOpenSections[label]);
  };

  const toggleSection = (label: string) => {
    setSectionOverrides((prev) => ({
      ...prev,
      [label]: !getIsSectionOpen(label),
    }));
  };

  const userRole: UserRole | "UNKNOWN" = user?.role ?? "UNKNOWN";

  const SidebarItem = ({ item }: { item: NavItem }) => {
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isOpen = getIsSectionOpen(item.label);
    const isActive =
      item.href === pathname || item.subItems?.some((s) => s.href === pathname);

    return (
      <div className="flex flex-col gap-1">
        {hasSubItems ? (
          <button
            onClick={() => toggleSection(item.label)}
            className={cn(
              "group flex items-center justify-between rounded-xl px-4 py-3 transition-all duration-300",
              isActive
                ? "text-primary font-bold"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <div className="flex items-center gap-3">
              <item.icon
                className={cn(
                  "size-5 transition-transform group-hover:scale-110",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
              />
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
            onClick={handleLinkClick}
            className={cn(
              "group relative flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300",
              isActive
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <item.icon
              className={cn(
                "size-5 transition-transform group-hover:scale-110",
                isActive ? "text-primary-foreground" : "text-muted-foreground",
              )}
            />
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
                  onClick={handleLinkClick}
                  className={cn(
                    "flex items-center gap-2 rounded-lg py-2 px-3 text-xs transition-colors",
                    pathname === sub.href
                      ? "text-primary font-bold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <div
                    className={cn(
                      "size-1 rounded-full",
                      pathname === sub.href
                        ? "bg-primary"
                        : "bg-muted-foreground/30",
                    )}
                  />
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
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex h-dvh w-72 flex-col border-r bg-card text-card-foreground shadow-sm transition-transform duration-300 ease-in-out lg:static lg:z-20 lg:translate-x-0 lg:shrink-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
      {/* Decorative top gradient */}
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary/0 via-primary to-primary/0 opacity-50" />

      <div className="flex items-center gap-3 px-6 py-8 shrink-0 relative group cursor-default">
        <motion.div
          whileHover={{ rotate: 180 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-2xl shadow-xl shadow-primary/20 ring-4 ring-primary/5"
        >
          <GalleryVerticalEnd className="size-6" />
        </motion.div>
        <div className="flex flex-col">
          <span className="text-xl font-black tracking-tight leading-none">
            HR<span className="text-primary italic">System</span>
          </span>
          <span className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground font-black mt-1">
            AI integrated
          </span>
        </div>
      </div>

      <nav className="flex-1 min-h-0 overflow-y-auto overscroll-contain space-y-6 px-4 py-2 custom-scrollbar">
        {NAVIGATION_CONFIG.map((section, sIdx) => {
          const visibleItems = section.items.filter(
            (item) =>
              !item.roles ||
              (userRole !== "UNKNOWN" && item.roles.includes(userRole)),
          );

          if (visibleItems.length === 0) return null;

          return (
            <div key={sIdx} className="space-y-2">
              {/* <h3 className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
                {section.section}
              </h3> */}
              <div className="space-y-1">
                {visibleItems.map((item, iIdx) => (
                  <SidebarItem key={iIdx} item={item} />
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="mt-auto p-4 shrink-0 border-t border-border/40 bg-muted/20">
        <div className="rounded-2xl bg-background border border-border/50 transition-all hover:shadow-inner overflow-hidden">
          {user ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary border border-primary/20">
                  <span className="text-sm font-bold">
                    {user.firstName?.[0]}
                    {user.lastName?.[0]}
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <p className="font-bold text-sm truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-[10px] font-medium text-primary uppercase tracking-wide">
                    {ROLE_LABELS[user.role]}
                  </p>
                </div>
                <ChevronRight className="size-3.5 ml-auto opacity-0 -translate-x-2 group-hover/user:opacity-50 group-hover/user:translate-x-0 transition-all" />
              </div>

              <div className="px-4 pb-4">
                <button
                  onClick={logout}
                  className="flex w-full items-center justify-between gap-2 rounded-xl bg-muted/30 px-3 py-2.5 text-xs font-semibold text-muted-foreground transition-all hover:bg-destructive/5 hover:text-destructive border border-border/50 group/logout"
                >
                  <div className="flex items-center gap-2">
                    <LogOut className="size-3.5 transition-transform group-hover/logout:translate-x-0.5" />
                    Sign Out
                  </div>
                  <ChevronRight className="size-3 opacity-50 group-hover/logout:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          ) : (
            <p className="text-center text-xs text-muted-foreground">
              Not signed in
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}
