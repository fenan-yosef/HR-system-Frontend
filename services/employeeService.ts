
import { apiFetch } from "@/services/apiClient";
import { CreateEmployee, Employee, UpdateEmployee, User } from "@/types/employee";
import { PaginatedResponse } from "@/types/recruitment";

interface EmployeeListParams {
  page?: number;
  page_size?: number;
}

type EmployeeListResponse = PaginatedResponse<Employee> | Employee[];
const EMPLOYEES_ENDPOINT = "/employees/";

interface EmployeeListEnvelope {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: unknown;
  employees?: unknown;
  data?: unknown;
}

function isEmployeeArray(value: unknown): value is Employee[] {
  return Array.isArray(value);
}

function extractEmployeesFromResponse(response: unknown): Employee[] {
  if (isEmployeeArray(response)) {
    return response;
  }

  if (!response || typeof response !== "object") {
    return [];
  }

  const payload = response as EmployeeListEnvelope;

  if (isEmployeeArray(payload.results)) {
    return payload.results;
  }

  if (isEmployeeArray(payload.employees)) {
    return payload.employees;
  }

  if (isEmployeeArray(payload.data)) {
    return payload.data;
  }

  return [];
}

function getNextPageUrl(response: unknown): string | null {
  if (!response || typeof response !== "object") return null;
  const payload = response as EmployeeListEnvelope;
  if (typeof payload.next !== "string" || !payload.next.trim()) return null;
  return payload.next;
}

function extractApiEndpointFromUrl(nextUrl: string): string | null {
  try {
    const url = new URL(nextUrl, "http://localhost");
    const apiPrefix = "/api/";
    const apiIndex = url.pathname.indexOf(apiPrefix);

    if (apiIndex !== -1) {
      const relativePath = url.pathname.slice(apiIndex + apiPrefix.length);
      const withLeadingSlash = `/${relativePath}`;
      return `${withLeadingSlash}${url.search}`;
    }

    const cleanPath = url.pathname.replace(/^\/+/, "");
    return `/${cleanPath}${url.search}`;
  } catch {
    return null;
  }
}

export function fetchEmployees(params?: EmployeeListParams): Promise<EmployeeListResponse> {
  const queryParams = new URLSearchParams();

  if (params?.page) {
    queryParams.set("page", String(params.page));
  }

  if (params?.page_size) {
    queryParams.set("page_size", String(params.page_size));
  }

  const query = queryParams.toString();
  const endpoint = query ? `${EMPLOYEES_ENDPOINT}?${query}` : EMPLOYEES_ENDPOINT;

  return apiFetch<EmployeeListResponse>(endpoint, {
    method: "GET",
    requiresAuth: true,
  });
}

export async function fetchAllEmployees(pageSize = 200): Promise<Employee[]> {
  let endpoint = `${EMPLOYEES_ENDPOINT}?page_size=${pageSize}`;
  const allEmployees: Employee[] = [];

  // Safety cap to prevent infinite loops if backend next links are malformed.
  for (let i = 0; i < 50; i += 1) {
    const response = await apiFetch<unknown>(endpoint, {
      method: "GET",
      requiresAuth: true,
    });

    const pageEmployees = extractEmployeesFromResponse(response);
    allEmployees.push(...pageEmployees);

    const nextUrl = getNextPageUrl(response);
    if (!nextUrl) {
      break;
    }

    const nextEndpoint = extractApiEndpointFromUrl(nextUrl);
    if (!nextEndpoint) {
      break;
    }

    endpoint = nextEndpoint;
  }

  return allEmployees;
}

export function fetchUsers(): Promise<PaginatedResponse<User>> {
  return apiFetch<PaginatedResponse<User>>(EMPLOYEES_ENDPOINT, {
    method: "GET",
    requiresAuth: true,
  });
}

export function fetchEmployee(employeeId: number): Promise<Employee> {
  return apiFetch<Employee>(`${EMPLOYEES_ENDPOINT}${employeeId}/`, {
    requiresAuth: true,
  });
}


export function createEmployee(data: CreateEmployee): Promise<Employee> {
  return apiFetch<Employee>(EMPLOYEES_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(data),
    requiresAuth: true,
  });
}

export function updateEmployee(
  employeeId: number,
  data: UpdateEmployee
): Promise<Employee> {
  return apiFetch<Employee>(`${EMPLOYEES_ENDPOINT}${employeeId}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
    requiresAuth: true,
  });
}

export function deleteEmployee(employeeId: number): Promise<void> {
  return apiFetch<void>(`${EMPLOYEES_ENDPOINT}${employeeId}/`, {
    method: "DELETE",
    requiresAuth: true,
  });
}


//Activate / Deactivate employee
export function updateEmployeeStatus(
  employeeId: number,
  isActive: boolean
): Promise<Employee> {
  return apiFetch<Employee>(`${EMPLOYEES_ENDPOINT}${employeeId}/status/`, {
    method: "PATCH",
    body: JSON.stringify({ is_active: isActive }),
    requiresAuth: true,
  });
}
