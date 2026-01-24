import type {
  Application,
  JobPosting,
  JobPosition,
  CreateJobPosition,
  Department,
  PaginatedResponse,
  ShortlistEntry,
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

export function fetchDepartments(): Promise<PaginatedResponse<Department>> {
  return apiFetch<PaginatedResponse<Department>>("/departments/", { requiresAuth: true });
}

export function fetchApplications(): Promise<PaginatedResponse<Application>> {
  return apiFetch<PaginatedResponse<Application>>("/applications/", { requiresAuth: true });
}

export function fetchShortlist(): Promise<PaginatedResponse<ShortlistEntry>> {
  return apiFetch<PaginatedResponse<ShortlistEntry>>("/shortlists/", { requiresAuth: true });
}

export function triggerShortlist(applicationId: number) {
  return apiFetch<ShortlistEntry>(`/applications/${applicationId}/shortlist/`, {
    method: "POST",
    requiresAuth: true,
  });
}
