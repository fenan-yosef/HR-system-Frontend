import { apiFetch } from "@/services/apiClient";

export interface Employee {
  id: number;
  full_name: string;
  role: string;
  department: string;
  status: "Active" | "Inactive";
  email?: string;
}

export interface PaginatedEmployees {
  count: number;
  next: string | null;
  previous: string | null;
  results: Employee[];
}

export function fetchEmployees(): Promise<PaginatedEmployees> {
  return apiFetch<PaginatedEmployees>("/employees/", { requiresAuth: true });
}

export function createEmployee(payload: Partial<Employee>): Promise<Employee> {
  return apiFetch<Employee>("/employees/", {
    method: "POST",
    body: JSON.stringify(payload),
    requiresAuth: true,
  });
}

export function updateEmployee(id: number, payload: Partial<Employee>): Promise<Employee> {
  return apiFetch<Employee>(`/employees/${id}/`, {
    method: "PUT",
    body: JSON.stringify(payload),
    requiresAuth: true,
  });
}

export function disableEmployee(id: number): Promise<void> {
  return apiFetch<void>(`/employees/${id}/disable/`, {
    method: "POST",
    requiresAuth: true,
  });
}
