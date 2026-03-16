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
  public_id: string;
  application_url?: string; // URL for the public application form
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
  position_id: number;
  title: string;
  department: string;
  description: string;
  requirements: string;
  status: string;
  posted_date: string;
  created_at: string;
  updated_at: string;
}

export interface AiEvaluation {
  evaluation_id: number;
  fit_label?: "Strong fit" | "Good fit (gaps)" | "Review manually";
  skill_score: number;
  experience_score: number;
  matching_percentage: number;
  semantic_score?: number;
  keyword_ratio?: number;
  embedding_model_name?: string;
  matched_keywords?: string[];
  missing_keywords?: string[];
  ai_rank: number;
  notes?: string;
  evaluated_at: string;
  // New AI fields
  summary?: string;
  skill_gaps?: {
    matched_skills: string[];
    missing_skills: string[];
    gaps: string[];
  };
  interview_questions?: string[];
  cluster_id?: number;
}

export interface Application {
  application_id: number;
  full_name: string;
  email: string;
  phone: string;
  cv_path: string;
  cover_letter?: string;
  position: ApplicationPosition;
  applicant?: {
    applicant_id: number;
    full_name: string;
    email: string;
    phone: string;
    cv_path: string;
    submitted_at: string;
  };
  evaluation?: AiEvaluation;
  status: string;
  submitted_at: string;
  created_at: string;
  updated_at: string;
}

export interface ApplicationMetrics {
  total: number;
  applied_today: number;
  shortlisted: number;
  pending: number;
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
  cover_letter?: string; // Optional cover letter
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
