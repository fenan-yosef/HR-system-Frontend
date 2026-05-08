import { apiFetch } from "@/services/apiClient";

export const fetchDashboardMetrics = async () => {
  return apiFetch<any>("/dashboard/metrics/metrics/", { requiresAuth: true });
};
