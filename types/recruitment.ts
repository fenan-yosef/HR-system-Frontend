import type { UserRole } from "./auth";

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type JobStatus = "open" | "closed" | "on_hold" | "cancelled";

export interface JobPosting {
  job_id: number;
  title: string;
  department: string;
  description: string;
  requirements: string;
  status: JobStatus;
  posted_date: string;
  created_at: string;
  updated_at: string;
}

export interface JobPosition {
  position_id: number;
  title: string;
  department: number;
  description: string | null;
  status: JobStatus;
  posted_date: string;
  closed_date: string | null;
  created_at: string;
}

export interface CreateJobPosition {
  title: string;
  department: number;
  description?: string;
  status?: JobStatus;
  posted_date: string;
  closed_date?: string;
}

export interface Department {
  department_id: number;
  name: string;
  code: string;
  manager: number | null;
  created_at: string;
}

export interface ApplicationPosition {
  job_id: number;
  title: string;
  department: string;
  description: string;
  requirements: string;
  status: string;
  posted_date: string;
  created_at: string;
  updated_at: string;
}

export interface Application {
  application_id: number;
  full_name: string;
  email: string;
  phone: string;
  cv_path: string;
  position: ApplicationPosition;
  status: string;
  submitted_at: string;
  created_at: string;
  updated_at: string;
}

export interface ShortlistEntry {
  shortlist_id: number;
  application: Application;
  skill_score: string;
  experience_score: string;
  matching_percentage: string;
  ai_rank: number;
  evaluated_at: string;
  created_at: string;
  updated_at: string;
  reviewer_role?: UserRole;
}

export interface CreateApplicant {
  full_name: string;
  email: string;
  phone: string;
  cv_path: string;
  position_id?: number;
}

export interface ApplicantResponse {
  applicant_id: number;
  full_name: string;
  email: string;
  phone: string;
  cv_path: string;
  submitted_at: string;
  tracking_code: string;
  tracking_code_sent_at: string;
}

export interface ApplicantTrackingResult {
  full_name?: string;
  status?: string;
  position?: { title?: string } | string;
  submitted_at?: string;
  [key: string]: unknown;
}
