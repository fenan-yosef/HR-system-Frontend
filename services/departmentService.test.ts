import { describe, expect, it, beforeEach, vi, afterEach } from "vitest";
import * as departmentService from "@/services/departmentService";
import {
  mockDepartments,
  mockDepartment,
  createMockDepartment,
} from "@/services/__mocks__/mockData";

vi.mock("@/services/apiClient", () => ({
  apiFetch: vi.fn(),
}));

import { apiFetch } from "@/services/apiClient";

const mockApiFetch = apiFetch as ReturnType<typeof vi.fn>;

describe("departmentService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchDepartments", () => {
    it("should fetch departments with pagination", async () => {
      mockApiFetch.mockResolvedValue(mockDepartments);

      const result = await departmentService.fetchDepartments(1, 10);

      expect(mockApiFetch).toHaveBeenCalledWith(
        "/departments/?page=1&page_size=10",
        { method: "GET", requiresAuth: true },
      );
      expect(result.count).toBe(2);
      expect(result.results).toHaveLength(2);
    });

    it("should handle empty department list", async () => {
      mockApiFetch.mockResolvedValue({
        count: 0,
        next: null,
        previous: null,
        results: [],
      });

      const result = await departmentService.fetchDepartments();

      expect(result.results).toHaveLength(0);
    });

    it("should handle API errors", async () => {
      mockApiFetch.mockRejectedValue(
        new Error("API request failed with status 500"),
      );

      await expect(departmentService.fetchDepartments()).rejects.toThrow(
        "API request failed with status 500",
      );
    });
  });

  describe("fetchDepartmentsAll", () => {
    it("should fetch all departments with manager expansion", async () => {
      mockApiFetch.mockResolvedValue(mockDepartments);

      const result = await departmentService.fetchDepartmentsAll();

      expect(mockApiFetch).toHaveBeenCalledWith(
        "/departments/?page_size=1000&expand=manager",
        { method: "GET", requiresAuth: true },
      );
      expect(result.results).toHaveLength(2);
    });
  });

  describe("fetchDepartment", () => {
    it("should fetch a single department", async () => {
      mockApiFetch.mockResolvedValue(mockDepartment);

      const result = await departmentService.fetchDepartment(1);

      expect(mockApiFetch).toHaveBeenCalledWith("/departments/1/", {
        requiresAuth: true,
      });
      expect(result.department_id).toBe(1);
      expect(result.name).toBe("Engineering");
    });

    it("should handle department not found error", async () => {
      mockApiFetch.mockRejectedValue(
        new Error("API request failed with status 404"),
      );

      await expect(departmentService.fetchDepartment(999)).rejects.toThrow(
        "API request failed with status 404",
      );
    });
  });

  describe("createDepartment", () => {
    it("should create a new department", async () => {
      const newDept = { name: "HR", code: "HR" };
      mockApiFetch.mockResolvedValue({
        department_id: 3,
        ...newDept,
        created_at: "2024-01-15T00:00:00Z",
      });

      const result = await departmentService.createDepartment(newDept);

      expect(mockApiFetch).toHaveBeenCalledWith("/departments/", {
        method: "POST",
        body: JSON.stringify(newDept),
        requiresAuth: true,
      });
      expect(result.department_id).toBe(3);
      expect(result.name).toBe("HR");
    });

    it("should handle validation errors", async () => {
      mockApiFetch.mockRejectedValue(
        new Error("API request failed with status 400"),
      );

      await expect(
        departmentService.createDepartment({ name: "" }),
      ).rejects.toThrow("API request failed with status 400");
    });
  });

  describe("updateDepartment", () => {
    it("should update a department", async () => {
      const updateData = { name: "Engineering Updated" };
      mockApiFetch.mockResolvedValue({
        ...mockDepartment,
        ...updateData,
      });

      const result = await departmentService.updateDepartment(1, updateData);

      expect(mockApiFetch).toHaveBeenCalledWith("/departments/1/", {
        method: "PATCH",
        body: JSON.stringify(updateData),
        requiresAuth: true,
      });
      expect(result.name).toBe("Engineering Updated");
    });

    it("should handle update errors", async () => {
      mockApiFetch.mockRejectedValue(
        new Error("API request failed with status 500"),
      );

      await expect(
        departmentService.updateDepartment(1, { name: "New Name" }),
      ).rejects.toThrow("API request failed with status 500");
    });
  });

  describe("deleteDepartment", () => {
    it("should delete a department", async () => {
      mockApiFetch.mockResolvedValue(undefined);

      await departmentService.deleteDepartment(1);

      expect(mockApiFetch).toHaveBeenCalledWith("/departments/1/", {
        method: "DELETE",
        requiresAuth: true,
      });
    });

    it("should handle delete errors", async () => {
      mockApiFetch.mockRejectedValue(
        new Error("API request failed with status 404"),
      );

      await expect(departmentService.deleteDepartment(999)).rejects.toThrow(
        "API request failed with status 404",
      );
    });
  });

  describe("assignManager", () => {
    it("should assign a manager to department", async () => {
      const updatedDept = { ...mockDepartment, manager: 2 };
      mockApiFetch.mockResolvedValue(updatedDept);

      const result = await departmentService.assignManager(1, 2);

      expect(mockApiFetch).toHaveBeenCalledWith(
        "/departments/1/assign-manager/",
        {
          method: "PATCH",
          body: JSON.stringify({ manager: 2 }),
          requiresAuth: true,
        },
      );
      expect(result.manager).toBe(2);
    });

    it("should clear manager when assigned null", async () => {
      mockApiFetch.mockResolvedValue({
        ...mockDepartment,
        manager: null,
      });

      const result = await departmentService.assignManager(1, null);

      expect(mockApiFetch).toHaveBeenCalledWith(
        "/departments/1/assign-manager/",
        {
          method: "PATCH",
          body: JSON.stringify({ manager: null }),
          requiresAuth: true,
        },
      );
      expect(result.manager).toBeNull();
    });
  });

  describe("fetchManagerDropdown", () => {
    it("should fetch manager dropdown list", async () => {
      const managers = [
        { employee_id: 1, full_name: "Jane Doe", email: "jane@example.com" },
      ];
      mockApiFetch.mockResolvedValue(managers);

      const result = await departmentService.fetchManagerDropdown("Jane", 50);

      expect(mockApiFetch).toHaveBeenCalledWith(
        "/departments/manager-dropdown/?q=Jane&limit=50",
        { method: "GET", requiresAuth: true },
      );
      expect(result).toHaveLength(1);
    });
  });
});
