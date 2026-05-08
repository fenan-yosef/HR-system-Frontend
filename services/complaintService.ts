import { apiFetch } from "@/services/apiClient";
import type { Complaint, CreateComplaintPayload } from "@/types/complaint";

const COMPLAINTS_ENDPOINT = "/complaints/";

interface ComplaintListEnvelope {
  results?: unknown;
  data?: unknown;
  complaints?: unknown;
  requests?: unknown;
  items?: unknown;
}

function isComplaintArray(value: unknown): value is Complaint[] {
  return Array.isArray(value);
}

function extractComplaints(response: unknown): Complaint[] {
  if (isComplaintArray(response)) {
    return response;
  }

  if (!response || typeof response !== "object") {
    return [];
  }

  const payload = response as ComplaintListEnvelope;

  if (isComplaintArray(payload.results)) return payload.results;
  if (isComplaintArray(payload.data)) return payload.data;
  if (isComplaintArray(payload.complaints)) return payload.complaints;
  if (isComplaintArray(payload.requests)) return payload.requests;
  if (isComplaintArray(payload.items)) return payload.items;

  return [];
}

export function createComplaint(data: CreateComplaintPayload): Promise<Complaint> {
  return apiFetch<Complaint>(COMPLAINTS_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(data),
    requiresAuth: true,
  });
}

export async function getMyComplaints(): Promise<Complaint[]> {
  const response = await apiFetch<unknown>(`${COMPLAINTS_ENDPOINT}my/`, {
    method: "GET",
    requiresAuth: true,
  });
  return extractComplaints(response);
}

export async function getAllComplaints(): Promise<Complaint[]> {
  const response = await apiFetch<unknown>(COMPLAINTS_ENDPOINT, {
    method: "GET",
    requiresAuth: true,
  });
  return extractComplaints(response);
}