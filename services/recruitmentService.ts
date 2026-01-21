import type {
  Application,
  JobPosting,
  PaginatedResponse,
  ShortlistEntry,
} from "@/types/recruitment";
import { apiFetch } from "@/services/apiClient";

export function fetchJobPostings(): Promise<PaginatedResponse<JobPosting>> {
  return apiFetch<PaginatedResponse<JobPosting>>("/job-posts/", { requiresAuth: true });
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
