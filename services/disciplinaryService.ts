import { apiFetch } from "@/services/apiClient";
import type {
  CreateDisciplinaryActionPayload,
  DisciplinaryAction,
} from "@/types/disciplinary";

const DISCIPLINARY_ACTIONS_ENDPOINT = "/disciplinary-actions/";

interface DisciplinaryActionListEnvelope {
  results?: unknown;
  data?: unknown;
  actions?: unknown;
  disciplinary_actions?: unknown;
  items?: unknown;
}

function isDisciplinaryActionArray(value: unknown): value is DisciplinaryAction[] {
  return Array.isArray(value);
}

function extractDisciplinaryActions(response: unknown): DisciplinaryAction[] {
  if (isDisciplinaryActionArray(response)) {
    return response;
  }

  if (!response || typeof response !== "object") {
    return [];
  }

  const payload = response as DisciplinaryActionListEnvelope;

  if (isDisciplinaryActionArray(payload.results)) {
    return payload.results;
  }

  if (isDisciplinaryActionArray(payload.data)) {
    return payload.data;
  }

  if (isDisciplinaryActionArray(payload.actions)) {
    return payload.actions;
  }

  if (isDisciplinaryActionArray(payload.disciplinary_actions)) {
    return payload.disciplinary_actions;
  }

  if (isDisciplinaryActionArray(payload.items)) {
    return payload.items;
  }

  return [];
}

export function createDisciplinaryAction(
  data: CreateDisciplinaryActionPayload,
): Promise<DisciplinaryAction> {
  // Backend expects the employee field to be named `employee` (id),
  // but our frontend type historically used `employee_id`.
  // Normalize both shapes and send the exact payload the API requires.
  const payload: Record<string, unknown> = {
    employee: (data as any).employee ?? (data as any).employee_id,
    action_type: data.action_type,
    severity: data.severity,
    description: data.description,
  };

  if (typeof data.deduction_amount !== "undefined" && data.deduction_amount !== null) {
    payload.deduction_amount = String(data.deduction_amount);
  }

  return apiFetch<DisciplinaryAction>(DISCIPLINARY_ACTIONS_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(payload),
    requiresAuth: true,
  });
}

export async function getMyDisciplinaryActions(): Promise<DisciplinaryAction[]> {
  const response = await apiFetch<unknown>(`${DISCIPLINARY_ACTIONS_ENDPOINT}my/`, {
    method: "GET",
    requiresAuth: true,
  });
  return extractDisciplinaryActions(response);
}

export async function getAllDisciplinaryActions(): Promise<DisciplinaryAction[]> {
  const response = await apiFetch<unknown>(DISCIPLINARY_ACTIONS_ENDPOINT, {
    method: "GET",
    requiresAuth: true,
  });
  return extractDisciplinaryActions(response);
}

export function approveDisciplinaryAction(id: number): Promise<DisciplinaryAction> {
  return apiFetch<DisciplinaryAction>(`${DISCIPLINARY_ACTIONS_ENDPOINT}${id}/approve/`, {
    method: "PATCH",
    requiresAuth: true,
  });
}

export function rejectDisciplinaryAction(id: number): Promise<DisciplinaryAction> {
  return apiFetch<DisciplinaryAction>(`${DISCIPLINARY_ACTIONS_ENDPOINT}${id}/reject/`, {
    method: "PATCH",
    requiresAuth: true,
  });
}