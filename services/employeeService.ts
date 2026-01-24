
import { apiFetch } from "@/services/apiClient";
import { CreateEmployee, Employee, UpdateEmployee } from "@/types/employee";
import { PaginatedResponse } from "@/types/recruitment";

export function fetchEmployees(): Promise<PaginatedResponse<Employee>> {
  return apiFetch<PaginatedResponse<Employee>>("/employees/", {
    method:"GET",
    requiresAuth: true,
  });
}

export function fetchUsers(): Promise<PaginatedResponse<Employee>> {
  return apiFetch<PaginatedResponse<Employee>>("/users/", {
    method:"GET",
    requiresAuth: true,
  });
}

export function fetchEmployee(employeeId: number): Promise<Employee> {
  return apiFetch<Employee>(`/employees/${employeeId}/`, {
    requiresAuth: true,
  });
}


export function createEmployee(data: CreateEmployee): Promise<Employee> {
  return apiFetch<Employee>("/employees/", {
    method: "POST",
    body: JSON.stringify(data),
    requiresAuth: true,
  });
}

export function updateEmployee(
  employeeId: number,
  data: UpdateEmployee
): Promise<Employee> {
  return apiFetch<Employee>(`/employees/${employeeId}/`, {
    method: "PUT", // or PATCH if backend supports partial updates
    body: JSON.stringify(data),
    requiresAuth: true,
  });
}

export function deleteEmployee(employeeId: number): Promise<void> {
  return apiFetch<void>(`/employees/${employeeId}/`, {
    method: "DELETE",
    requiresAuth: true,
  });
}


//Activate / Deactivate employee
export function updateEmployeeStatus(
  employeeId: number,
  isActive: boolean
): Promise<Employee> {
  return apiFetch<Employee>(`/employees/${employeeId}/status/`, {
    method: "PATCH",
    body: JSON.stringify({ is_active: isActive }),
    requiresAuth: true,
  });
}

//Assign department
export function assignEmployeeDepartment(
  employeeId: number,
  departmentId: number
): Promise<Employee> {
  return apiFetch<Employee>(`/employees/${employeeId}/assign-department/`, {
    method: "POST",
    body: JSON.stringify({ department_id: departmentId }),
    requiresAuth: true,
  });
}
