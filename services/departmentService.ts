import { apiFetch } from "@/services/apiClient";
import { Department, CreateDepartment, UpdateDepartment, ManagerDropdownItem } from "@/types/department";
import { PaginatedResponse } from "@/types/recruitment";

export function fetchDepartments(page = 1, pageSize = 10): Promise<PaginatedResponse<Department>> {
  return apiFetch<PaginatedResponse<Department>>(`/departments/?page=${page}&page_size=${pageSize}`, {
    method: "GET",
    requiresAuth: true,
  });
}

export function fetchDepartmentsAll(): Promise<PaginatedResponse<Department>> {
  return apiFetch<PaginatedResponse<Department>>(`/departments/?page_size=1000&expand=manager`, {
    method: "GET",
    requiresAuth: true,
  });
}

export function fetchManagerDropdown(query = "", limit = 50): Promise<ManagerDropdownItem[]> {
  return apiFetch<ManagerDropdownItem[]>(`/departments/manager-dropdown/?q=${query}&limit=${limit}`, {
    method: "GET",
    requiresAuth: true,
  });
}

export function assignManager(departmentId: number, managerId: number | null): Promise<Department> {
  return apiFetch<Department>(`/departments/${departmentId}/assign-manager/`, {
    method: "PATCH",
    body: JSON.stringify({ manager: managerId }),
    requiresAuth: true,
  });
}

export function fetchDepartment(departmentId: number): Promise<Department> {
  return apiFetch<Department>(`/departments/${departmentId}/`, {
    requiresAuth: true,
  });
}

export function createDepartment(data: CreateDepartment): Promise<Department> {
  return apiFetch<Department>("/departments/", {
    method: "POST",
    body: JSON.stringify(data),
    requiresAuth: true,
  });
}

export function updateDepartment(departmentId: number, data: UpdateDepartment): Promise<Department> {
  return apiFetch<Department>(`/departments/${departmentId}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
    requiresAuth: true,
  });
}

export function deleteDepartment(departmentId: number): Promise<void> {
  return apiFetch<void>(`/departments/${departmentId}/`, {
    method: "DELETE",
    requiresAuth: true,
  });
}
