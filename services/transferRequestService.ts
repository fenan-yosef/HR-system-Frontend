import { apiFetch } from "@/services/apiClient";
import { TransferRequest } from "@/types/transfer";

interface CreateTransferRequestPayload {
  target_department: number;
  requested_position?: string | null;
  reason: string;
}

export function createTransferRequest(data: CreateTransferRequestPayload): Promise<TransferRequest> {
  return apiFetch<TransferRequest>(`/transfer-requests/`, {
    method: "POST",
    body: JSON.stringify(data),
    requiresAuth: true,
  });
}

export function fetchMyTransferRequests(): Promise<TransferRequest[]> {
  return apiFetch<TransferRequest[]>(`/transfer-requests/my/`, {
    method: "GET",
    requiresAuth: true,
  });
}
