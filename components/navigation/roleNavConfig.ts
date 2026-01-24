import type { LucideIcon } from "lucide-react";
import {
  AlarmClock,
  BarChart3,
  Briefcase,
  CalendarCheck,
  ClipboardList,
  FileText,
  FolderKanban,
  Home,
  LayoutDashboard,
  LifeBuoy,
  Mail,
  Settings,
  ShieldCheck,
  ShoppingBag,
  UserRound,
  Users,
} from "lucide-react";
import type { UserRole } from "@/types/auth";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  highlight?: boolean;
};

export const roleNavConfig: Record<UserRole, NavItem[]> = {
  ADMIN: [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "People", href: "/admin/people", icon: Users },
    { label: "Approvals", href: "/admin/approvals", icon: ShieldCheck },
    { label: "Reports", href: "/admin/reports", icon: BarChart3 },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ],
  HR_MANAGER: [
    { label: "Dashboard", href: "/hr", icon: LayoutDashboard },
    { label: "Employees", href: "/hr/employees", icon: Users },
    { label: "Recruitment", href: "/hr/recruitment", icon: Briefcase },
    { label: "Leave Management", href: "/hr/leave", icon: CalendarCheck },
    { label: "Attendance", href: "/hr/attendance", icon: AlarmClock },
    { label: "Reports", href: "/hr/reports", icon: BarChart3 },
    { label: "Settings", href: "/hr/settings", icon: Settings },
  ],
  MANAGER: [
    { label: "Dashboard", href: "/manager", icon: LayoutDashboard },
    { label: "Team", href: "/manager/team", icon: Users },
    { label: "Performance", href: "/manager/performance", icon: BarChart3 },
    { label: "Leave Approvals", href: "/manager/leave-approvals", icon: ClipboardList },
    { label: "Reports", href: "/manager/reports", icon: FileText },
    { label: "Projects", href: "/manager/projects", icon: FolderKanban },
    { label: "Settings", href: "/manager/settings", icon: Settings },
  ],
  EMPLOYEE: [
    { label: "Dashboard", href: "/employee", icon: Home },
    { label: "Attendance", href: "/employee/attendance", icon: CalendarCheck },
    { label: "Leave", href: "/employee/leave", icon: ClipboardList },
    { label: "Payroll", href: "/employee/payroll", icon: ShoppingBag },
    { label: "Documents", href: "/employee/documents", icon: FileText },
    { label: "Support", href: "/employee/support", icon: LifeBuoy },
  ],
  APPLICANT: [
    { label: "Dashboard", href: "/applicant", icon: LayoutDashboard },
    { label: "Job Openings", href: "/applicant/jobs", icon: Briefcase },
    { label: "My Applications", href: "/applicant/applications", icon: ClipboardList },
    { label: "Profile", href: "/applicant/profile", icon: UserRound },
    { label: "Messages", href: "/applicant/messages", icon: Mail },
  ],
  UNKNOWN: [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Support", href: "/support", icon: LifeBuoy },
  ],
};

export type RoleHeader = {
  title: string;
  subtitle: string;
  accentClass: string;
  badge?: string;
};

export const roleHeaderConfig: Record<UserRole, RoleHeader> = {
  ADMIN: {
    title: "Admin Workspace",
    subtitle: "Oversee the entire platform and governance.",
    accentClass: "from-slate-800 to-slate-600",
    badge: "Admin",
  },
  HR_MANAGER: {
    title: "HR Officer Dashboard",
    subtitle: "Manage recruitment, employees, and HR operations.",
    accentClass: "from-blue-600 to-indigo-600",
    badge: "HR",
  },
  MANAGER: {
    title: "Manager Dashboard",
    subtitle: "Oversee team performance, attendance, and projects.",
    accentClass: "from-emerald-600 to-teal-600",
    badge: "Manager",
  },
  EMPLOYEE: {
    title: "Employee Portal",
    subtitle: "Track attendance, leave, payroll, and documents.",
    accentClass: "from-sky-600 to-blue-500",
    badge: "Employee",
  },
  APPLICANT: {
    title: "Applicant Home",
    subtitle: "Follow your applications and explore new openings.",
    accentClass: "from-purple-600 to-fuchsia-600",
    badge: "Applicant",
  },
  UNKNOWN: {
    title: "Welcome",
    subtitle: "Select a role to continue.",
    accentClass: "from-slate-500 to-slate-400",
  },
};

export function getNavItemsForRole(role?: UserRole) {
  if (!role) return roleNavConfig.UNKNOWN;
  return roleNavConfig[role] ?? roleNavConfig.UNKNOWN;
}

export function getHeaderForRole(role?: UserRole) {
  if (!role) return roleHeaderConfig.UNKNOWN;
  return roleHeaderConfig[role] ?? roleHeaderConfig.UNKNOWN;
}
