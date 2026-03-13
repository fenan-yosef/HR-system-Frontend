import type {
  Application,
  JobPosting,
  JobPosition,
  CreateJobPosition,
  Department,
  PaginatedResponse,
  ShortlistEntry,
  CreateApplicant,
  ApplicantResponse,
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

export interface FetchApplicationsParams {
  page?: number;
  search?: string;
  status?: string;
  min_score?: number;
  starts_with?: string;
  applied_today?: boolean;
}

export function fetchApplications(params: FetchApplicationsParams = {}): Promise<PaginatedResponse<Application>> {
  const query = new URLSearchParams();
  if (params.page) query.append("page", params.page.toString());
  if (params.search) query.append("search", params.search);
  if (params.status) query.append("status", params.status);
  if (params.min_score) query.append("min_score", params.min_score.toString());
  if (params.starts_with) query.append("starts_with", params.starts_with);
  if (params.applied_today) query.append("applied_today", "true");

  const queryString = query.toString();
  const endpoint = `/recruitment/applicant-applications/${queryString ? "?" + queryString : ""}`;
  return apiFetch<PaginatedResponse<Application>>(endpoint, { requiresAuth: true });
}

export function fetchApplicationMetrics(): Promise<{ total: number; applied_today: number; shortlisted: number; pending: number }> {
  return apiFetch<any>("/recruitment/applicant-applications/metrics/", { requiresAuth: true });
}

export async function exportApplicationsCsv(params: FetchApplicationsParams = {}): Promise<void> {
  const query = new URLSearchParams();
  if (params.status) query.append("status", params.status);
  if (params.min_score) query.append("min_score", params.min_score.toString());
  
  const queryString = query.toString();
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL || "/api"}/recruitment/applicant-applications/export-csv/${queryString ? "?" + queryString : ""}`;
  
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "applications.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function fetchShortlist(): Promise<PaginatedResponse<ShortlistEntry>> {
  return apiFetch<PaginatedResponse<ShortlistEntry>>("/recruitment/shortlists/", { requiresAuth: true });
}

export function triggerShortlist(applicationId: number) {
  return apiFetch<ShortlistEntry>(`/recruitment/applicant-applications/${applicationId}/shortlist/`, {
    method: "POST",
    requiresAuth: true,
  });
}

export function fetchPublicJobPositions(): Promise<PaginatedResponse<JobPosition>> {
  return apiFetch<PaginatedResponse<JobPosition>>("/job-positions/", { requiresAuth: false });
}

export function fetchPublicJobPosition(positionId: number): Promise<JobPosition> {
  return apiFetch<JobPosition>(`/job-positions/${positionId}/`, { requiresAuth: false });
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

export function confirmApplication(applicationId: number, data: { note?: string }) {
  return apiFetch<any>(`/recruitment/applicant-applications/${applicationId}/confirm/`, {
    method: "POST",
    body: JSON.stringify(data),
    requiresAuth: true,
  });
}

export function inviteToInterview(applicationId: number, data: { datetime: string; location: string; message: string }) {
  return apiFetch<any>(`/recruitment/applicant-applications/${applicationId}/invite_interview/`, {
    method: "POST",
    body: JSON.stringify(data),
    requiresAuth: true,
  });
}

export function hireApplicant(applicationId: number, data: { start_date: string; package: any }) {
  return apiFetch<any>(`/recruitment/applicant-applications/${applicationId}/hire/`, {
    method: "POST",
    body: JSON.stringify(data),
    requiresAuth: true,
  });
}
