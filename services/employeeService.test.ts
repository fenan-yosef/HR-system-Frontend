import { describe, expect, it, beforeEach, vi, afterEach } from "vitest";
import * as employeeService from "@/services/employeeService";
import {
  mockEmployee,
  mockEmployees,
  createMockEmployee,
} from "@/services/__mocks__/mockData";

vi.mock("@/services/apiClient", () => ({
  apiFetch: vi.fn(),
}));

import { apiFetch } from "@/services/apiClient";

const mockApiFetch = apiFetch as ReturnType<typeof vi.fn>;

describe("employeeService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchEmployees", () => {
    it("should fetch employees with authentication", async () => {
      mockApiFetch.mockResolvedValue(mockEmployees);

      const result = await employeeService.fetchEmployees();

      expect(mockApiFetch).toHaveBeenCalledWith("/employees/", {
        method: "GET",
        requiresAuth: true,
      });
      expect(result.count).toBe(mockEmployees.count);
      expect(result.results).toHaveLength(2);
    });

    it("should fetch employees with pagination parameters", async () => {
      mockApiFetch.mockResolvedValue(mockEmployees);

      await employeeService.fetchEmployees({ page: 1, page_size: 10 });

      expect(mockApiFetch).toHaveBeenCalledWith(
        "/employees/?page=1&page_size=10",
        { method: "GET", requiresAuth: true },
      );
    });

    it("should handle empty employee list", async () => {
      mockApiFetch.mockResolvedValue({
        count: 0,
        next: null,
        previous: null,
        results: [],
      });

      const result = await employeeService.fetchEmployees();

      expect(result.results).toHaveLength(0);
      expect(result.count).toBe(0);
    });

    it("should handle API errors", async () => {
      mockApiFetch.mockRejectedValue(
        new Error("API request failed with status 500"),
      );

      await expect(employeeService.fetchEmployees()).rejects.toThrow(
        "API request failed with status 500",
      );
    });
  });

  describe("fetchEmployee", () => {
    it("should fetch a single employee by ID", async () => {
      mockApiFetch.mockResolvedValue(mockEmployee);

      const result = await employeeService.fetchEmployee(1);

      expect(mockApiFetch).toHaveBeenCalledWith("/employees/1/", {
        requiresAuth: true,
      });
      expect(result.employee_id).toBe(1);
      expect(result.first_name).toBe("Jane");
    });

    it("should handle employee not found error", async () => {
      mockApiFetch.mockRejectedValue(
        new Error("API request failed with status 404"),
      );

      await expect(employeeService.fetchEmployee(999)).rejects.toThrow(
        "API request failed with status 404",
      );
    });

    it("should return complete employee data with all fields", async () => {
      mockApiFetch.mockResolvedValue(mockEmployee);

      const result = await employeeService.fetchEmployee(1);

      expect(result).toHaveProperty("employee_id");
      expect(result).toHaveProperty("email");
      expect(result).toHaveProperty("department");
      expect(result).toHaveProperty("status");
    });
  });

  describe("fetchCurrentUserEmployee", () => {
    it("should fetch current user employee data", async () => {
      mockApiFetch.mockResolvedValue(mockEmployee);

      const result = await employeeService.fetchCurrentUserEmployee();

      expect(mockApiFetch).toHaveBeenCalledWith("/employees/me/", {
        requiresAuth: true,
      });
      expect(result.employee_id).toBe(mockEmployee.employee_id);
    });

    it("should handle unauthenticated user", async () => {
      mockApiFetch.mockRejectedValue(
        new Error("API request failed with status 401"),
      );

      await expect(employeeService.fetchCurrentUserEmployee()).rejects.toThrow(
        "API request failed with status 401",
      );
    });
  });

  describe("createEmployee", () => {
    it("should create a new employee", async () => {
      const newEmployee = {
        first_name: "Bob",
        last_name: "Johnson",
        email: "bob@example.com",
        hire_date: "2024-01-15",
      };

      const createdEmployee = {
        employee_id: 3,
        ...newEmployee,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        employment_type: "full_time" as const,
        status: "active" as const,
        onboarding_completion: 0,
        onboarding_data: {},
      };

      mockApiFetch.mockResolvedValue(createdEmployee);

      const result = await employeeService.createEmployee(newEmployee);

      expect(mockApiFetch).toHaveBeenCalledWith("/employees/", {
        method: "POST",
        body: JSON.stringify(newEmployee),
        requiresAuth: true,
      });
      expect(result.employee_id).toBe(3);
      expect(result.first_name).toBe("Bob");
    });

    it("should handle validation errors", async () => {
      const invalidEmployee = {
        first_name: "Jane",
        email: "invalid-email",
        hire_date: "2024-01-15",
      };

      mockApiFetch.mockRejectedValue(
        new Error("API request failed with status 400"),
      );

      await expect(
        employeeService.createEmployee(invalidEmployee),
      ).rejects.toThrow("API request failed with status 400");
    });

    it("should handle duplicate email error", async () => {
      const newEmployee = {
        first_name: "Jane",
        last_name: "Duplicate",
        email: mockEmployee.email,
        hire_date: "2024-01-15",
      };

      mockApiFetch.mockRejectedValue(
        new Error("API request failed with status 409"),
      );

      await expect(employeeService.createEmployee(newEmployee)).rejects.toThrow(
        "API request failed with status 409",
      );
    });
  });

  describe("updateEmployee", () => {
    it("should update employee data", async () => {
      const updateData = {
        phone: "+1999999999",
        position: "Staff Engineer",
      };

      const updatedEmployee = { ...mockEmployee, ...updateData };
      mockApiFetch.mockResolvedValue(updatedEmployee);

      const result = await employeeService.updateEmployee(1, updateData);

      expect(mockApiFetch).toHaveBeenCalledWith("/employees/1/", {
        method: "PATCH",
        body: JSON.stringify(updateData),
        requiresAuth: true,
      });
      expect(result.phone).toBe("+1999999999");
    });

    it("should handle partial updates", async () => {
      const partialUpdate = { status: "on_leave" as const };

      mockApiFetch.mockResolvedValue({ ...mockEmployee, ...partialUpdate });

      const result = await employeeService.updateEmployee(1, partialUpdate);

      expect(result.status).toBe("on_leave");
    });

    it("should handle update errors", async () => {
      mockApiFetch.mockRejectedValue(
        new Error("API request failed with status 500"),
      );

      await expect(
        employeeService.updateEmployee(1, { phone: "+1234567890" }),
      ).rejects.toThrow("API request failed with status 500");
    });
  });

  describe("fetchAllEmployees", () => {
    it("should fetch all employees across multiple pages", async () => {
      const page1 = {
        count: 100,
        next: "http://localhost:8000/api/employees/?page=2",
        previous: null,
        results: mockEmployees.results,
      };

      const page2 = {
        count: 100,
        next: null,
        previous: "http://localhost:8000/api/employees/",
        results: [createMockEmployee({ employee_id: 3 })],
      };

      mockApiFetch.mockResolvedValueOnce(page1).mockResolvedValueOnce(page2);

      const result = await employeeService.fetchAllEmployees(2);

      expect(result).toHaveLength(3);
      expect(mockApiFetch).toHaveBeenCalledTimes(2);
    });

    it("should handle API errors during pagination", async () => {
      mockApiFetch.mockRejectedValue(
        new Error("API request failed with status 500"),
      );

      await expect(employeeService.fetchAllEmployees()).rejects.toThrow(
        "API request failed with status 500",
      );
    });
  });
});
