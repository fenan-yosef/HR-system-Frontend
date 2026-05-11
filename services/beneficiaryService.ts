import { apiFetch } from "@/services/apiClient";
import type { Beneficiary } from "@/types/beneficiary";

const BASE = "/beneficiaries/";

export async function createBeneficiary(payload: any): Promise<Beneficiary> {
  return apiFetch<Beneficiary>(BASE, {
    method: "POST",
    body: JSON.stringify(payload),
    requiresAuth: true,
  });
}

export async function getAllBeneficiaries(): Promise<Beneficiary[]> {
  const res = await apiFetch<unknown>(BASE, {
    method: "GET",
    requiresAuth: true,
  });
  // backend returns array or envelope
  if (Array.isArray(res)) return res as Beneficiary[];
  // try common fields
  return (res as any)?.results ?? (res as any)?.data ?? (res as any)?.items ?? [];
}

export function getBeneficiaryExportUrl(id: number) {
  const path = `/beneficiaries/${id}/export/`;
  return path;
}

export async function exportBeneficiaryCsv(id: number) {
  const url = getBeneficiaryExportUrl(id);
  return apiFetch<string>(url, { method: "GET", requiresAuth: true });
}
