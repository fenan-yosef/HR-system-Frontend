import type {
  Application,
  ApplicationMetrics,
  JobPosting,
  JobPosition,
  CreateJobPosition,
  Department,
  PaginatedResponse,
  ShortlistEntry,
  CreateApplicant,
  ApplicantResponse,
  AiEvaluation,
  ScreeningResult,
  ScreeningProgress,
  VersionStats,
  SuggestSkillsResponse
} from "@/types/recruitment";
import { apiFetch } from "@/services/apiClient";

export function fetchJobPostings(): Promise<PaginatedResponse<JobPosting>> {
  return apiFetch<PaginatedResponse<JobPosting>>("/job-posts/", { requiresAuth: true });
}

export function fetchJobPositions(): Promise<PaginatedResponse<JobPosition>> {
  return apiFetch<PaginatedResponse<JobPosition>>("/job-positions/", { requiresAuth: true });
}

export function fetchJobPosition(positionId: number): Promise<JobPosition> {
  return apiFetch<JobPosition>(`/job-positions/${positionId}/`, { requiresAuth: true });
}

export function createJobPosition(data: CreateJobPosition): Promise<JobPosition> {
  return apiFetch<JobPosition>("/job-positions/", {
    method: "POST",
    body: JSON.stringify(data),
    requiresAuth: true,
  });
}

export function updateJobPosition(positionId: number, data: Partial<JobPosition>): Promise<JobPosition> {
  return apiFetch<JobPosition>(`/job-positions/${positionId}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
    requiresAuth: true,
  });
}

export function fetchDepartments(): Promise<PaginatedResponse<Department>> {
  return apiFetch<PaginatedResponse<Department>>("/departments/", { requiresAuth: true });
}

export function fetchDepartmentsAll(): Promise<PaginatedResponse<Department>> {
  return apiFetch<PaginatedResponse<Department>>("/departments/?page_size=1000", { requiresAuth: true });
}

export interface FetchApplicationsParams {
  page?: number;
  search?: string;
  status?: string;
  min_score?: number;
  max_score?: number;
  ordering?: string;
  starts_with?: string;
  applied_today?: boolean;
  position_id?: number | string;
}

export function fetchApplications(params: FetchApplicationsParams = {}): Promise<PaginatedResponse<Application>> {
  const query = new URLSearchParams();
  if (params.page) query.append("page", params.page.toString());
  if (params.search) query.append("search", params.search);
  if (params.status) query.append("status", params.status);
  if (params.min_score !== undefined) query.append("min_score", params.min_score.toString());
  if (params.max_score !== undefined) query.append("max_score", params.max_score.toString());
  if (params.ordering) query.append("ordering", params.ordering);
  if (params.starts_with) query.append("starts_with", params.starts_with);
  if (params.applied_today) query.append("applied_today", "true");
  if (params.position_id) query.append("position_id", params.position_id.toString());

  const queryString = query.toString();
  const endpoint = `/applicant-applications/${queryString ? "?" + queryString : ""}`;
  return apiFetch<PaginatedResponse<Application>>(endpoint, { requiresAuth: true });
}

export function fetchApplication(applicationId: number): Promise<Application> {
  return apiFetch<Application>(`/applicant-applications/${applicationId}/`, { requiresAuth: true });
}

export function fetchApplicationMetrics(): Promise<ApplicationMetrics> {
  return apiFetch<ApplicationMetrics>("/applicant-applications/metrics/", { requiresAuth: true });
}

export async function exportApplicationsCsv(params: FetchApplicationsParams = {}): Promise<void> {
  const query = new URLSearchParams();
  if (params.status) query.append("status", params.status);
  if (params.min_score) query.append("min_score", params.min_score.toString());
  
  const queryString = query.toString();
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL || "/api"}/applicant-applications/export-csv/${queryString ? "?" + queryString : ""}`;
  
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "applications.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function fetchShortlist(): Promise<PaginatedResponse<ShortlistEntry>> {
  return apiFetch<PaginatedResponse<ShortlistEntry>>("/shortlists/", { requiresAuth: true });
}

export function triggerShortlist(applicationId: number): Promise<AiEvaluation> {
  return apiFetch<AiEvaluation>(`/applicant-applications/${applicationId}/shortlist/`, {
    method: "POST",
    requiresAuth: true,
  });
}

// batchEvaluateApplications removed — backend returns 405.
// Use startScreening + polling instead.

export function fetchPublicJobPositions(): Promise<PaginatedResponse<JobPosition>> {
  return apiFetch<PaginatedResponse<JobPosition>>("/job-positions-public/", { requiresAuth: false });
}

export function fetchPublicJobPosition(publicId: string): Promise<JobPosition> {
  return apiFetch<JobPosition>(`/recruitment/public/job/${publicId}/`, { requiresAuth: false });
}

export function createApplicant(data: CreateApplicant): Promise<ApplicantResponse> {
  return apiFetch<ApplicantResponse>("/applicants/", {
    method: "POST",
    body: JSON.stringify(data),
    requiresAuth: false,
  });
}

export function createPublicApplication(publicId: string, data: CreateApplicant): Promise<any> {
  return apiFetch<any>(`/recruitment/public/apply/${publicId}/`, {
    method: "POST",
    body: JSON.stringify(data),
    requiresAuth: false,
  });
}

export function trackApplicant(trackingCode: string, email?: string): Promise<any> {
  return apiFetch<any>("/applicants/track-status/", {
    method: "POST",
    body: JSON.stringify({ tracking_code: trackingCode, email }),
    requiresAuth: false,
  });
}

export function fetchUploadMetadata(uploadId: number): Promise<any> {
  return apiFetch<any>(`/uploads/${uploadId}/`, { requiresAuth: true });
}

export function confirmApplication(applicationId: number) {
  return apiFetch<{ status: string; application_id: number }>(`/applicant-applications/${applicationId}/confirm/`, {
    method: "POST",
    requiresAuth: true,
  });
}

export function inviteToInterview(applicationId: number) {
  return apiFetch<any>(`/applicant-applications/${applicationId}/invite_interview/`, {
    method: "POST",
    requiresAuth: true,
  });
}

export function hireApplicant(applicationId: number) {
  return apiFetch<{ status: string; application_id: number }>(`/applicant-applications/${applicationId}/hire/`, {
    method: "POST",
    requiresAuth: true,
  });
}

export function fetchEvaluations(): Promise<PaginatedResponse<AiEvaluation>> {
  return apiFetch<PaginatedResponse<AiEvaluation>>("/recruitment/evaluations/", { requiresAuth: true });
}

export function createEvaluation(data: Partial<AiEvaluation>): Promise<AiEvaluation> {
  return apiFetch<AiEvaluation>("/recruitment/evaluations/", {
    method: "POST",
    body: JSON.stringify(data),
    requiresAuth: true,
  });
}

export function startScreening(jobPositionId: number, customParams?: any): Promise<{ id: number; status: string }> {
  return apiFetch<{ id: number; status: string }>(`/recruitment/screening/start/${jobPositionId}/`, {
    method: "POST",
    body: customParams ? JSON.stringify({ custom_params: customParams }) : undefined,
    requiresAuth: true,
  });
}

export function getScreeningProgress(jobId: number): Promise<ScreeningProgress> {
  return apiFetch<ScreeningProgress>(`/recruitment/screening/progress/${jobId}/`, {
    requiresAuth: true,
  });
}

export function getScreeningResults(jobPositionId: number): Promise<ScreeningResult[]> {
  return apiFetch<ScreeningResult[]>(`/recruitment/screening/${jobPositionId}/results/`, {
    requiresAuth: true,
  });
}

export function getVersionStats(jobPositionId: number): Promise<VersionStats> {
  return apiFetch<VersionStats>(`/recruitment/screening/version-stats/${jobPositionId}/`, {
    requiresAuth: true,
  });
}

export function reEvaluate(jobPositionId: number, customParams?: any): Promise<any> {
  return apiFetch<any>(`/recruitment/screening/re-evaluate/${jobPositionId}/`, {
    method: "POST",
    body: customParams ? JSON.stringify({ custom_params: customParams }) : undefined,
    requiresAuth: true,
  });
}

export function suggestSkills(
  description: string,
  limit: number = 10,
  position_id?: number,
  use_cache: boolean = true,
): Promise<SuggestSkillsResponse> {
  const body: any = { description, limit };
  if (position_id !== undefined) body.position_id = position_id;
  if (use_cache !== undefined) body.use_cache = use_cache;

  return apiFetch<SuggestSkillsResponse>("/job-positions/suggest-skills/", {
    method: "POST",
    body: JSON.stringify(body),
    requiresAuth: true,
  });
}

export function getSkillSuggestions(positionId: number): Promise<SuggestSkillsResponse> {
  return apiFetch<SuggestSkillsResponse>(`/job-positions/${positionId}/skill-suggestions/`, {
    requiresAuth: true,
  });
}

export function retryExtraction(applicationId: number): Promise<any> {
  return apiFetch<any>(`/applicant-applications/${applicationId}/retry-extraction/`, {
    method: "POST",
    requiresAuth: true,
  });
}
