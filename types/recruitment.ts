import type { UserRole } from "./auth";

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface JobPosting {
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
