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

export function fetchApplications(): Promise<PaginatedResponse<Application>> {
  return apiFetch<PaginatedResponse<Application>>("/applicant-applications/", { requiresAuth: true });
}

export function fetchShortlist(): Promise<PaginatedResponse<ShortlistEntry>> {
  return apiFetch<PaginatedResponse<ShortlistEntry>>("/shortlists/", { requiresAuth: true });
}

export function triggerShortlist(applicationId: number) {
  return apiFetch<ShortlistEntry>(`/applicant-applications/${applicationId}/shortlist/`, {
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
