import { apiFetch, getMediaUrl } from "@/services/apiClient";
import type { CreateLetterRequestPayload, LetterRequest } from "@/types/letter";

const LETTER_REQUESTS_ENDPOINT = "/letter-requests/";

interface LetterRequestListEnvelope {
  results?: unknown;
  data?: unknown;
  letter_requests?: unknown;
  requests?: unknown;
  items?: unknown;
}

function isLetterRequestArray(value: unknown): value is LetterRequest[] {
  return Array.isArray(value);
}

function extractLetterRequests(response: unknown): LetterRequest[] {
  if (isLetterRequestArray(response)) {
    return response;
  }

  if (!response || typeof response !== "object") {
    return [];
  }

  const payload = response as LetterRequestListEnvelope;

  if (isLetterRequestArray(payload.results)) {
    return payload.results;
  }

  if (isLetterRequestArray(payload.data)) {
    return payload.data;
  }

  if (isLetterRequestArray(payload.letter_requests)) {
    return payload.letter_requests;
  }

  if (isLetterRequestArray(payload.requests)) {
    return payload.requests;
  }

  if (isLetterRequestArray(payload.items)) {
    return payload.items;
  }

  return [];
}

export function getLetterEmployeeId(request: LetterRequest): number | null {
  const employeeId =
    request.employee?.employee_id ??
    request.employee?.id ??
    request.employee_id;

  if (employeeId === undefined || employeeId === null) {
    return null;
  }

  const parsed = Number(employeeId);
  return Number.isFinite(parsed) ? parsed : null;
}

export function resolveLetterFileUrl(fileUrl: string): string {
  if (!fileUrl) return "";

  if (
    /^https?:\/\//i.test(fileUrl) ||
    fileUrl.startsWith("blob:") ||
    fileUrl.startsWith("data:")
  ) {
    return fileUrl;
  }

  if (fileUrl.startsWith("/")) {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL;
    const cleanBase = base ? base.replace(/\/+$/, "") : "";
    const isAbsoluteBase = Boolean(cleanBase && !cleanBase.startsWith("/"));

    if (isAbsoluteBase) {
      return `${cleanBase}${fileUrl}`;
    }

    if (fileUrl.startsWith("/api/")) {
      return fileUrl;
    }

    if (fileUrl.startsWith("/media/")) {
      return `/api${fileUrl}`;
    }

    return fileUrl;
  }

  return getMediaUrl(fileUrl);
}

export function createLetterRequest(
  data: CreateLetterRequestPayload,
): Promise<LetterRequest> {
  return apiFetch<LetterRequest>(LETTER_REQUESTS_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(data),
    requiresAuth: true,
  });
}

export async function getMyLetterRequests(): Promise<LetterRequest[]> {
  const response = await apiFetch<unknown>(`${LETTER_REQUESTS_ENDPOINT}my/`, {
    method: "GET",
    requiresAuth: true,
  });
  return extractLetterRequests(response);
}

export async function getAllLetterRequests(): Promise<LetterRequest[]> {
  const response = await apiFetch<unknown>(LETTER_REQUESTS_ENDPOINT, {
    method: "GET",
    requiresAuth: true,
  });
  return extractLetterRequests(response);
}

export function approveLetter(employeeId: number): Promise<LetterRequest> {
  return apiFetch<LetterRequest>(
    `${LETTER_REQUESTS_ENDPOINT}${employeeId}/approve/`,
    {
      method: "PATCH",
      requiresAuth: true,
    },
  );
}

export function rejectLetter(employeeId: number): Promise<LetterRequest> {
  return apiFetch<LetterRequest>(
    `${LETTER_REQUESTS_ENDPOINT}${employeeId}/reject/`,
    {
      method: "PATCH",
      requiresAuth: true,
    },
  );
}

export function generateLetter(employeeId: number): Promise<LetterRequest> {
  return apiFetch<LetterRequest>(
    `${LETTER_REQUESTS_ENDPOINT}${employeeId}/generate/`,
    {
      method: "POST",
      requiresAuth: true,
    },
  );
}
