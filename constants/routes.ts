export const ROUTES = {
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  NOTIFICATIONS: "/notifications",
  MY_DISCIPLINARY: "/employee/disciplinary",
  RECRUITMENT_JOB_POSTINGS: "/recruitment/job-postings",
  RECRUITMENT_APPLICATIONS: "/recruitment/applications",
  RECRUITMENT_SHORTLIST: "/recruitment/shortlist",
  RECRUITMENT_PENDING_INTERVIEWEES: "/recruitment/pending-interviewees",
  
  // People & Ops
  EMPLOYEES: "/employees",
  DEPARTMENTS: "/departments",
  HIRING: "/hiring",
  ONBOARDING: "/onboarding",
  OFFBOARDING: "/offboarding",
  ATTENDANCE: "/attendance",
  LEAVE_REQUESTS: "/leave-requests",
  LEAVE_APPROVALS: "/leave-approvals",
  PAYROLL: "/payroll",
  PERFORMANCE: "/performance",
  LEARNING: "/learning",

  // Employee Letters
  EMPLOYEE_REQUEST_LETTER: "/employee/request-letter",
  EMPLOYEE_MY_LETTERS: "/employee/my-letters",
  EMPLOYEE_REQUEST_TRANSFER: "/employee/request-transfer",
  EMPLOYEE_PENSION_REGISTRATION: "/employee/pension-registration",

  
  // Self Service
  MY_PROFILE: "/profile",
  MY_DOCUMENTS: "/documents",

  // HR Letters
  HR_LETTER_REQUESTS: "/hr/letter-requests",
  HR_ID_CARDS: "/hr/id-cards",
  HR_COMPLAINTS: "/hr/complaints",
  HR_BENEFICIARIES: "/hr/beneficiaries",
  HR_PENSION_REGISTRATIONS: "/hr/pension-registrations",

  // Disciplinary Management
  HR_DISCIPLINARY: "/hr/disciplinary",
  HR_CREATE_DISCIPLINARY: "/hr/create-disciplinary",
  CEO_DISCIPLINARY_APPROVALS: "/ceo/disciplinary-approvals",

  // Employee Complaints
  EMPLOYEE_REQUEST_COMPLAINT: "/employee/request-complaint",
  
  // System
  SETTINGS: "/settings",
  SECURITY: "/security",
  ROLE_MANAGEMENT: "/admin/role-management",
} as const;

export type AppRouteKey = keyof typeof ROUTES;
export type AppRoute = (typeof ROUTES)[AppRouteKey];
