import { getAccessTokenKey, API_BASE_URL } from "./apiClient";

export async function downloadSingleIdCard(employeeId: number): Promise<string> {
  const url = `${API_BASE_URL}id-cards/${employeeId}/`;
  const token = typeof window !== "undefined" ? window.localStorage.getItem(getAccessTokenKey()) : null;

  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(url, { method: "GET", headers });
  if (!response.ok) throw new Error(`ID card generation failed (${response.status})`);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

export async function downloadBulkIdCards(employeeIds: number[]): Promise<string> {
  if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
    throw new Error("employeeIds must be a non-empty array");
  }

  const url = `${API_BASE_URL}id-cards/bulk/`;
  const token = typeof window !== "undefined" ? window.localStorage.getItem(getAccessTokenKey()) : null;

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ employeeIds }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Bulk ID cards generation failed (${response.status}) ${text}`);
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}
