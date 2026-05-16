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
  AiEvaluation,
  CustomApplicationField,
  VersionStats,
  RecruiterInstructionTemplate,
  ScreeningProgress,
  ScreeningResult,
} from "@/types/recruitment";
import { apiFetch, apiDownload } from "@/services/apiClient";

export function fetchJobPostings(): Promise<PaginatedResponse<JobPosting>> {
  return apiFetch<PaginatedResponse<JobPosting>>("/job-positions/", {
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
  return apiFetch<PaginatedResponse<Department>>("/departments/dropdown/", {
    requiresAuth: false,
  });
}

export function fetchApplications(
  filters: Record<string, string | number | boolean | undefined> = {},
): Promise<PaginatedResponse<Application>> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) {
      if (key === "is_shortlisted" && value === true) {
        params.append("status", "shortlisted");
      } else {
        params.append(key, String(value));
      }
    }
  });

  const queryString = params.toString();
  const endpoint = queryString ? `/applicant-applications/?${queryString}` : "/applicant-applications/";
  
  return apiFetch<PaginatedResponse<Application>>(endpoint, {
    requiresAuth: true,
  });
}

export function fetchApplication(
  applicationId: number,
  options: { includeHistory?: boolean; includeDeleted?: boolean } = {},
): Promise<Application> {
  const params = new URLSearchParams();
  if (options.includeHistory) params.append("include_history", "true");
  if (options.includeDeleted) params.append("include_deleted", "true");
  
  const queryString = params.toString();
  const endpoint = queryString 
    ? `/applicant-applications/${applicationId}/?${queryString}`
    : `/applicant-applications/${applicationId}/`;

  return apiFetch<Application>(endpoint, {
    requiresAuth: true,
  });
}

export function updateApplication(applicationId: number, data: Partial<Application>): Promise<Application> {
  return apiFetch<Application>(`/applicant-applications/${applicationId}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
    requiresAuth: true,
  });
}

export function confirmApplication(applicationId: number): Promise<any> {
  return apiFetch<any>(`/applicant-applications/${applicationId}/confirm/`, {
    method: "POST",
    requiresAuth: true,
  });
}

export function inviteToInterview(applicationId: number): Promise<any> {
  return apiFetch<any>(`/applicant-applications/${applicationId}/invite_interview/`, {
    method: "POST",
    requiresAuth: true,
  });
}

export function hireApplicant(
  applicationId: number,
  data: any,
): Promise<any> {
  return apiFetch<any>(`/applicant-applications/${applicationId}/hire/`, {
    method: "POST",
    body: JSON.stringify(data),
    requiresAuth: true,
  });
}

export function approveHire(applicationId: number): Promise<any> {
  return apiFetch<any>(`/applicant-applications/${applicationId}/approve-hire/`, {
    method: "POST",
    requiresAuth: true,
  });
}

export function rejectHire(applicationId: number, reason: string): Promise<any> {
  return apiFetch<any>(`/applicant-applications/${applicationId}/reject-hire/`, {
    method: "POST",
    body: JSON.stringify({ reason }),
    requiresAuth: true,
  });
}

export function fetchApplicationMetrics(): Promise<ApplicationMetrics> {
  return apiFetch<ApplicationMetrics>("/applicant-applications/metrics/", {
    requiresAuth: true,
  });
}

export function batchInviteToInterview(
  applicationIds: number[],
): Promise<any> {
  return apiFetch<any>("/applicant-applications/batch-invite/", {
    method: "POST",
    body: JSON.stringify({ application_ids: applicationIds }),
    requiresAuth: true,
  });
}

export function batchConfirmInterviews(applicationIds: number[]): Promise<any> {
  return apiFetch<any>("/applicant-applications/batch-confirm/", {
    method: "POST",
    body: JSON.stringify({ application_ids: applicationIds }),
    requiresAuth: true,
  });
}

export function startScreening(positionId: number, options: { mode?: string } = {}): Promise<any> {
  return apiFetch<any>(`/recruitment/screening/start/${positionId}/`, {
    method: "POST",
    body: JSON.stringify(options),
    requiresAuth: true,
  });
}

export function getScreeningProgress(jobId: number): Promise<ScreeningProgress> {
  return apiFetch<ScreeningProgress>(`/recruitment/screening/progress/${jobId}/`, {
    requiresAuth: true,
  });
}

export function getScreeningResults(positionId: number, options: { includeHistory?: boolean } = {}): Promise<ScreeningResult[]> {
  const params = new URLSearchParams();
  if (options.includeHistory) params.append("include_history", "true");
  
  const queryString = params.toString();
  const endpoint = queryString 
    ? `/recruitment/screening/${positionId}/results/?${queryString}`
    : `/recruitment/screening/${positionId}/results/`;

  return apiFetch<any>(endpoint, {
    requiresAuth: true,
  }).then(res => res.results || []);
}

export function softDeleteScreeningResult(resultId: number, reason?: string): Promise<any> {
  return apiFetch<any>(`/screening-results/${resultId}/soft-delete/`, {
    method: "POST",
    body: JSON.stringify({ reason }),
    requiresAuth: true,
  });
}

export function restoreScreeningResult(resultId: number): Promise<any> {
  return apiFetch<any>(`/screening-results/${resultId}/restore/`, {
    method: "POST",
    requiresAuth: true,
  });
}

export function softDeleteScreeningHistory(historyId: number, reason?: string): Promise<any> {
  return apiFetch<any>(`/screening-history/${historyId}/soft-delete/`, {
    method: "POST",
    body: JSON.stringify({ reason }),
    requiresAuth: true,
  });
}

export function restoreScreeningHistory(historyId: number): Promise<any> {
  return apiFetch<any>(`/screening-history/${historyId}/restore/`, {
    method: "POST",
    requiresAuth: true,
  });
}

export function removeFromShortlist(applicationId: number): Promise<any> {
  return apiFetch<any>(`/applicant-applications/${applicationId}/remove-shortlist/`, {
    method: "POST",
    requiresAuth: true,
  });
}

export function rejectShortlisted(
  applicationId: number,
  reason: string,
): Promise<any> {
  return apiFetch<any>(`/applicant-applications/${applicationId}/reject-shortlisted/`, {
    method: "POST",
    body: JSON.stringify({ reason }),
    requiresAuth: true,
  });
}

export function fetchShortlist(): Promise<PaginatedResponse<ShortlistEntry>> {
  return apiFetch<PaginatedResponse<ShortlistEntry>>("/shortlists/", {
    requiresAuth: true,
  });
}

export function toggleShortlist(applicationId: number): Promise<any> {
  return apiFetch<any>(`/applicant-applications/${applicationId}/toggle-shortlist/`, {
    method: "POST",
    requiresAuth: true,
  });
}

export function triggerShortlist(applicationId: number): Promise<AiEvaluation> {
  return apiFetch<AiEvaluation>(`/applicant-applications/${applicationId}/toggle-shortlist/`, {
    method: "POST",
    requiresAuth: true,
  });
}

export function retryExtraction(applicationId: number): Promise<any> {
  return apiFetch<any>(`/applicant-applications/${applicationId}/extract-resume/`, {
    method: "POST",
    requiresAuth: true,
  });
}

export async function exportApplicationsCsv(): Promise<void> {
  const blobUrl = await apiDownload("/applicant-applications/export-csv/");
  const link = document.createElement("a");
  link.href = blobUrl;
  link.setAttribute("download", `applications-export-${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(blobUrl);
}

// Screening Settings & Config
export function getVersionStats(positionId: number): Promise<VersionStats> {
  return apiFetch<VersionStats>(`/recruitment/screening/version-stats/${positionId}/`, {
    requiresAuth: true,
  });
}

export function reEvaluate(positionId: number): Promise<any> {
  return apiFetch<any>(`/recruitment/screening/re-evaluate/${positionId}/`, {
    method: "POST",
    requiresAuth: true,
  });
}

export function getSkillSuggestions(positionId: number): Promise<{ skills: string[] }> {
  return apiFetch<{ skills: string[] }>("/job-positions/suggest-skills/", {
    method: "POST",
    body: JSON.stringify({ position_id: positionId }),
    requiresAuth: true,
  });
}

export function suggestSkills(
  description: string,
  limit = 12,
  context?: any,
  useCache = true
): Promise<{ skills: string[] }> {
  return apiFetch<{ skills: string[] }>("/job-positions/suggest-skills/", {
    method: "POST",
    body: JSON.stringify({ description, limit, context, use_cache: useCache }),
    requiresAuth: true,
  });
}

export function fetchInstructionTemplates(): Promise<PaginatedResponse<RecruiterInstructionTemplate>> {
  return apiFetch<PaginatedResponse<RecruiterInstructionTemplate>>("/recruiter-instruction-templates/", {
    requiresAuth: true,
  });
}

export function createInstructionTemplate(data: { name: string; content: string }): Promise<RecruiterInstructionTemplate> {
  return apiFetch<RecruiterInstructionTemplate>("/recruiter-instruction-templates/", {
    method: "POST",
    body: JSON.stringify(data),
    requiresAuth: true,
  });
}

export function deleteInstructionTemplate(templateId: number): Promise<void> {
  return apiFetch<void>(`/recruiter-instruction-templates/${templateId}/`, {
    method: "DELETE",
    requiresAuth: true,
  });
}

export function fetchPublicJobPositions(): Promise<
  PaginatedResponse<JobPosition>
> {
  return apiFetch<PaginatedResponse<JobPosition>>("/job-positions-public/", {
    requiresAuth: false,
  });
}

export function fetchPublicJobPosition(
  positionId: number,
): Promise<JobPosition> {
  return apiFetch<JobPosition>(`/job-positions-public/${positionId}/`, {
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

export function trackApplicant(
  trackingCode: string,
  email?: string,
): Promise<ApplicantTrackingResult> {
  const params = new URLSearchParams({ tracking_code: trackingCode });
  if (email) params.append("email", email);

  return apiFetch<ApplicantTrackingResult>(
    `/applicants/track/?${params.toString()}`,
    { requiresAuth: false },
  );
}
