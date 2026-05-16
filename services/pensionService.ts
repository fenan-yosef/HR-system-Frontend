import { apiFetch, apiDownload } from "./apiClient";

const BASE = "pension-registration/";

export type RegistrationType = "NEW_REGISTRATION" | "EXISTING_PENSION";

export interface ServiceHistoryItem {
  organization_name: string;
  start_date: string | null;
  end_date: string | null;
  monthly_salary?: number | null;
  termination_reason?: string;
}

export interface ChildItem {
  name: string;
  date_of_birth: string | null;
  gender?: string;
  mother_name?: string;
}

export interface PensionRegistration {
  id: number;
  full_name: string;
  date_of_birth: string;
  nationality_status?: string;
  registration_type: RegistrationType;
  pension_id_number?: string | null;
  employer_office_name?: string;
  employer_office_id?: string;
  office_phone?: string;
  office_po_box?: string;
  service_history?: ServiceHistoryItem[];
  spouse_name?: string;
  spouse_date_of_birth?: string | null;
  children?: ChildItem[];
  father_name?: string;
  mother_name?: string;
  livelihood_status?: string;
  pension_status?: string;
  submitted_at?: string | null;
}

export async function getMyPensionRegistration(): Promise<PensionRegistration | null> {
  return apiFetch<PensionRegistration | null>(`${BASE}my`, { method: "GET", requiresAuth: true });
}

export async function createPensionRegistration(payload: Partial<PensionRegistration>) {
  return apiFetch<PensionRegistration>(BASE, { method: "POST", requiresAuth: true, body: JSON.stringify(payload) });
}

export async function updatePensionRegistration(id: number, payload: Partial<PensionRegistration>) {
  return apiFetch<PensionRegistration>(`${BASE}${id}/`, { method: "PATCH", requiresAuth: true, body: JSON.stringify(payload) });
}

export async function uploadPensionAttachments(id: number, formData: FormData) {
  return apiFetch<any>(`${BASE}${id}/attachments/`, { method: "POST", requiresAuth: true, body: formData });
}

export async function getAllPensionRegistrations(query = "") {
  return apiFetch<PensionRegistration[]>(`${BASE}?${query}`, { method: "GET", requiresAuth: true });
}

export async function getPensionRegistrationDetails(id: string | number) {
  return apiFetch<PensionRegistration>(`${BASE}${id}/`, { method: "GET", requiresAuth: true });
}

export async function updatePensionStatus(id: number, status: string, pension_id_number?: string) {
  return apiFetch<any>(`${BASE}${id}/status/`, { method: "PATCH", requiresAuth: true, body: JSON.stringify({ pension_status: status, pension_id_number }) });
}

export async function downloadOfficialForm(id: number) {
  return apiDownload(`${BASE}${id}/download-form/`);
}

export default {
  getMyPensionRegistration,
  createPensionRegistration,
  updatePensionRegistration,
  uploadPensionAttachments,
  getAllPensionRegistrations,
  getPensionRegistrationDetails,
  updatePensionStatus,
  downloadOfficialForm,
};
