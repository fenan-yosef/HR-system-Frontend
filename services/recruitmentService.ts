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
  ApplicantTrackingResult,
} from "@/types/recruitment";
import { apiFetch } from "@/services/apiClient";

export function fetchJobPostings(): Promise<PaginatedResponse<JobPosting>> {
  return apiFetch<PaginatedResponse<JobPosting>>("/job-posts/", {
    requiresAuth: true,
  });
}

export function fetchJobPositions(): Promise<PaginatedResponse<JobPosition>> {
  return apiFetch<PaginatedResponse<JobPosition>>("/job-positions/", {
    requiresAuth: true,
  });
}

export function fetchJobPosition(positionId: number): Promise<JobPosition> {
  return apiFetch<JobPosition>(`/job-positions/${positionId}/`, {
    requiresAuth: true,
  });
}

export function createJobPosition(
  data: CreateJobPosition,
): Promise<JobPosition> {
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

export function fetchCustomApplicationFields(positionId: number): Promise<{
  position_id: number;
  position_title: string;
  custom_application_fields: CustomApplicationField[];
  count: number;
}> {
  return apiFetch<any>(`/job-positions/${positionId}/application-fields/`, { requiresAuth: true });
}

export function updateCustomApplicationFields(positionId: number, data: { custom_application_fields: CustomApplicationField[] }): Promise<any> {
  return apiFetch<any>(`/job-positions/${positionId}/application-fields/`, {
    method: "PUT",
    body: JSON.stringify(data),
    requiresAuth: true,
  });
}

export function fetchDepartments(): Promise<PaginatedResponse<Department>> {
  return apiFetch<PaginatedResponse<Department>>("/departments/", {
    requiresAuth: true,
  });
}

export function fetchApplications(): Promise<PaginatedResponse<Application>> {
  return apiFetch<PaginatedResponse<Application>>("/applications/", {
    requiresAuth: true,
  });
}

export function fetchShortlist(): Promise<PaginatedResponse<ShortlistEntry>> {
  return apiFetch<PaginatedResponse<ShortlistEntry>>("/shortlists/", {
    requiresAuth: true,
  });
}

export function triggerShortlist(applicationId: number): Promise<AiEvaluation> {
  return apiFetch<AiEvaluation>(`/applicant-applications/${applicationId}/shortlist/`, {
    method: "POST",
    requiresAuth: true,
  });
}

export function fetchPublicJobPositions(): Promise<
  PaginatedResponse<JobPosition>
> {
  return apiFetch<PaginatedResponse<JobPosition>>("/job-positions/", {
    requiresAuth: false,
  });
}

export function fetchPublicJobPosition(
  positionId: number,
): Promise<JobPosition> {
  return apiFetch<JobPosition>(`/job-positions/${positionId}/`, {
    requiresAuth: false,
  });
}

export function createApplicant(
  data: CreateApplicant,
): Promise<ApplicantResponse> {
  return apiFetch<ApplicantResponse>("/applicants/", {
    method: "POST",
    body: JSON.stringify(data),
    requiresAuth: false,
  });
}

// Assuming the backend has this endpoint for tracking
export function trackApplicant(
  trackingCode: string,
  email?: string,
): Promise<ApplicantTrackingResult> {
  // Construct query or body. Using POST for security/privacy if email is involved, or GET with query params.
  // I will try GET with query param for now as it's a "Track" (Read) operation.
  const params = new URLSearchParams({ tracking_code: trackingCode });
  if (email) params.append("email", email);

  // Note: The actual endpoint might differ. Adjust as needed.
  return apiFetch<ApplicantTrackingResult>(
    `/applicants/track/?${params.toString()}`,
    { requiresAuth: false },
  );
}
