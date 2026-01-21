export const ROUTES = {
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  RECRUITMENT_JOB_POSTINGS: "/recruitment/job-postings",
  RECRUITMENT_APPLICATIONS: "/recruitment/applications",
  RECRUITMENT_SHORTLIST: "/recruitment/shortlist",
} as const;

export type AppRouteKey = keyof typeof ROUTES;
export type AppRoute = (typeof ROUTES)[AppRouteKey];
