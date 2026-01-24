export const ROUTES = {
  // Auth routes live under /auth, so keep the constant aligned to avoid 404s.
  LOGIN: "/auth/login",
  DASHBOARD: "/dashboard",
  HR_DASHBOARD: "/hr/dashboard",
  HR_ATTENDANCE: "/hr/attendance",
  HR_EMPLOYEES: "/hr/employees",
  HR_APPLICATIONS: "/hr/applications",
  HR_RECRUITMENT: "/hr/recruitment",
  HR_REPORTS: "/hr/reports",
  HR_SHORTLIST: "/hr/shortlist",
  HR_LEAVE: "/hr/leave",
  MANAGER_DASHBOARD: "/manager/dashboard",
  EMPLOYEE_DASHBOARD: "/employee/dashboard",
  RECRUITMENT_JOB_POSTINGS: "/recruitment/job-postings",
  RECRUITMENT_APPLICATIONS: "/recruitment/applications",
  RECRUITMENT_SHORTLIST: "/recruitment/shortlist",
} as const;

export type AppRouteKey = keyof typeof ROUTES;
export type AppRoute = (typeof ROUTES)[AppRouteKey];
