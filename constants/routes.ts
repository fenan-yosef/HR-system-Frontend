export const ROUTES = {
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  RECRUITMENT_JOB_POSTINGS: "/recruitment/job-postings",
  RECRUITMENT_APPLICATIONS: "/recruitment/applications",
  RECRUITMENT_SHORTLIST: "/recruitment/shortlist",
  
  // People & Ops
  EMPLOYEES: "/employees",
  ONBOARDING: "/onboarding",
  OFFBOARDING: "/offboarding",
  ATTENDANCE: "/attendance",
  LEAVE_REQUESTS: "/leave-requests",
  PAYROLL: "/payroll",

  // Performance & Growth
  PERFORMANCE: "/performance",
  LEARNING: "/learning",
  
  // Self Service
  MY_PROFILE: "/profile",
  MY_DOCUMENTS: "/documents",
  
  // System
  SETTINGS: "/settings",
  SECURITY: "/security",
  ROLE_MANAGEMENT: "/admin/role-management",
} as const;

export type AppRouteKey = keyof typeof ROUTES;
export type AppRoute = (typeof ROUTES)[AppRouteKey];
