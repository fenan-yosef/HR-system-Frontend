import type { UserRole } from "./auth";

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type JobStatus = "open" | "closed" | "on_hold" | "cancelled";

export type CustomFieldType =
  | "short_text"
  | "long_text"
  | "number"
  | "integer"
  | "boolean"
  | "select"
  | "multi_select"
  | "date"
  | "file"
  | "file_list"
  | "email"
  | "url"
  | "phone";

export interface CustomApplicationField {
  key?: string;
  label: string;
  type: CustomFieldType;
  required: boolean;
  include_in_ai: boolean;
  order?: number;
  options?: string[];
  min_value?: number;
  max_length?: number;
}

export interface CustomFieldResponse {
  upload_id?: number;
  reference?: string;
  file_name?: string;
  mime_type?: string;
  size_bytes?: number;
  file_url?: string;
  [key: string]: any;
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
  criteria_version: number;
  recruiter_instructions?: string;
  custom_application_fields?: CustomApplicationField[];
  // Screening fields
  min_gpa?: number;
  min_years_experience?: number;
  required_skills?: string[];
  required_certificates?: string[];
  allowed_universities?: string[];
  shortlist_size?: number;
  scoring_weights?: {
    skills: number;
    experience: number;
    education: number;
    certifications: number;
  };
  ai_config?: {
    min_pass_score?: number;
    skip_ai_on_hard_fail?: boolean;
    final_score_blend?: {
      rule: number;
      ai: number;
    };
  };
}

// Legacy alias used by some services/routes that still call /job-posts/
export interface JobPosting extends JobPosition {}

export interface CreateJobPosition {
  title: string;
  department: number;
  description?: string;
  status?: JobStatus;
  posted_date: string;
  closed_date?: string;
  recruiter_instructions?: string;
  min_gpa?: number;
  min_years_experience?: number;
  required_skills?: string[];
  required_certificates?: string[];
  allowed_universities?: string[];
  shortlist_size?: number;
  scoring_weights?: {
    skills: number;
    experience: number;
    education: number;
    certifications: number;
  };
  ai_config?: {
    min_pass_score?: number;
    skip_ai_on_hard_fail?: boolean;
    final_score_blend?: {
      rule: number;
      ai: number;
    };
  };
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
  custom_field_values?: Record<string, CustomFieldResponse | any>;
  applicant?: {
    applicant_id: number;
    full_name: string;
    email: string;
    phone: string;
    cv_path: string;
    submitted_at: string;
    documents?: Array<{
      document_id: number;
      document_type: string;
      size_bytes?: number;
      uploaded_at: string;
      file_path?: string;
    }>;
  };
  // Optional legacy list of certificate file paths
  certificate_paths?: string[];
  evaluation?: AiEvaluation;
  extracted_resume?: {
    has_json: boolean;
    raw_llm_response: string;
    extracted_json: any;
  };
  screening_result?: ScreeningResult;
  screening_history?: ScreeningHistoryEntry[];
  status: string;
  applicant_note?: string;
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
  upload_id?: number; // Primary CV
  certificate_upload_ids?: number[];
  other_upload_ids?: number[];
  cv_path?: string; // Legacy field
  cover_letter?: string; // Optional cover letter
  applicant_note?: string; // HR context only
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

export interface ScreeningHistoryEntry {
  id: number;
  source_result_id: number;
  evaluation_version: number;
  final_score: number | string;
  status: "passed" | "failed";
  archive_reason: string;
  screened_at: string;
  archived_at: string;
  is_deleted?: boolean;
  deleted_at?: string | null;
}

export interface ScreeningResult {
  id?: number;
  application_id: number;
  applicant_name: string;
  rule_score: number | string;
  ai_score: number | string;
  final_score: number | string;
  evaluation_version: number;
  status: "passed" | "failed";
  hard_criteria_met: boolean;
  explanation: string;
  key_strengths: string[];
  key_weaknesses: string[];
  scoring_breakdown: {
    ai?: Record<string, any>;
    rule?: Record<string, any>;
    blend?: {
      rule?: number;
      ai?: number;
    };
    recommendation?: string;
    interview_questions?: string[];
    [key: string]: any;
  };
  raw_llm_response: string;
  // Metadata & History
  include_history?: boolean;
  history?: ScreeningHistoryEntry[];
  screening_model?: string;
  screened_at?: string;
  is_deleted?: boolean;
  deleted_at?: string | null;
  // Legacy fields
  overall_score?: number;
}

export interface ScreeningProgress {
  job_id: number;
  status: "pending" | "running" | "completed" | "failed" | "error";
  progress_percent: number;
  current: number;
  total: number;
  current_applicant?: string;
  mode: "full" | "stale_only";
  error?: string;
  fail_count?: number;
  error_message?: string;
}

export interface VersionStats {
  position_id: number;
  position_title: string;
  criteria_version: number;
  stats: {
    position_id: number;
    criteria_version: number;
    total_applications: number;
    up_to_date_count: number;
    stale_count: number;
    missing_result_count: number;
    rescreen_required_count: number;
    is_fully_up_to_date: boolean;
    stale_application_ids: number[];
    missing_result_application_ids: number[];
  };
}

export interface SuggestSkillsResponse {
  skills: string[];
  count: number;
  source?: string;
  position_id?: number;
}

export interface RecruiterInstructionTemplate {
  id: number;
  name: string;
  content: string;
  created_at: string;
  updated_at: string;
}

