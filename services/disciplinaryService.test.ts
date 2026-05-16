import { describe, expect, it, beforeEach, vi, afterEach } from "vitest";
import * as disciplinaryService from "@/services/disciplinaryService";
import {
  mockDisciplinaryAction,
  mockDisciplinaryActions,
  createMockDisciplinaryAction,
} from "@/services/__mocks__/mockData";

vi.mock("@/services/apiClient", () => ({
  apiFetch: vi.fn(),
}));

import { apiFetch } from "@/services/apiClient";

const mockApiFetch = apiFetch as ReturnType<typeof vi.fn>;

describe("disciplinaryService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("createDisciplinaryAction", () => {
    it("should create a warning action", async () => {
      const payload = {
        employee_id: 1,
        action_type: "WARNING" as const,
        severity: "MEDIUM" as const,
        description: "Violation of company policy",
      };

      mockApiFetch.mockResolvedValue(mockDisciplinaryAction);

      const result =
        await disciplinaryService.createDisciplinaryAction(payload);

      expect(mockApiFetch).toHaveBeenCalledWith("/disciplinary-actions/", {
        method: "POST",
        body: expect.stringContaining('"employee":1'),
        requiresAuth: true,
      });
      expect(result.id).toBe(1);
      expect(result.action_type).toBe("WARNING");
    });

    it("should create a deduction action with amount", async () => {
      const payload = {
        employee_id: 1,
        action_type: "DEDUCTION" as const,
        severity: "HIGH" as const,
        description: "Serious violation",
        deduction_amount: "500",
      };

      mockApiFetch.mockResolvedValue(mockDisciplinaryActions[1]);

      const result =
        await disciplinaryService.createDisciplinaryAction(payload);

      expect(mockApiFetch).toHaveBeenCalledWith("/disciplinary-actions/", {
        method: "POST",
        body: expect.stringContaining('"deduction_amount":"500"'),
        requiresAuth: true,
      });
      expect(result.deduction_amount).toBe("500");
    });

    it("should create suspension action", async () => {
      const payload = {
        employee_id: 1,
        action_type: "SUSPENSION" as const,
        severity: "HIGH" as const,
        description: "Gross misconduct",
      };

      mockApiFetch.mockResolvedValue({
        ...mockDisciplinaryAction,
        action_type: "SUSPENSION",
      });

      const result =
        await disciplinaryService.createDisciplinaryAction(payload);

      expect(result.action_type).toBe("SUSPENSION");
    });

    it("should handle API errors", async () => {
      mockApiFetch.mockRejectedValue(
        new Error("API request failed with status 400"),
      );

      const payload = {
        employee_id: 1,
        action_type: "WARNING" as const,
        severity: "MEDIUM" as const,
        description: "",
      };

      await expect(
        disciplinaryService.createDisciplinaryAction(payload),
      ).rejects.toThrow("API request failed with status 400");
    });
  });

  describe("getMyDisciplinaryActions", () => {
    it("should fetch current user's disciplinary actions", async () => {
      mockApiFetch.mockResolvedValue(mockDisciplinaryActions);

      const result = await disciplinaryService.getMyDisciplinaryActions();

      expect(mockApiFetch).toHaveBeenCalledWith("/disciplinary-actions/my/", {
        method: "GET",
        requiresAuth: true,
      });
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
    });

    it("should handle empty actions list", async () => {
      mockApiFetch.mockResolvedValue([]);

      const result = await disciplinaryService.getMyDisciplinaryActions();

      expect(result).toHaveLength(0);
    });

    it("should handle API errors", async () => {
      mockApiFetch.mockRejectedValue(
        new Error("API request failed with status 500"),
      );

      await expect(
        disciplinaryService.getMyDisciplinaryActions(),
      ).rejects.toThrow("API request failed with status 500");
    });
  });

  describe("getAllDisciplinaryActions", () => {
    it("should fetch all disciplinary actions", async () => {
      mockApiFetch.mockResolvedValue(mockDisciplinaryActions);

      const result = await disciplinaryService.getAllDisciplinaryActions();

      expect(mockApiFetch).toHaveBeenCalledWith("/disciplinary-actions/", {
        method: "GET",
        requiresAuth: true,
      });
      expect(result).toHaveLength(2);
    });

    it("should extract actions from various response formats", async () => {
      const responseWithResults = { results: mockDisciplinaryActions };
      mockApiFetch.mockResolvedValue(responseWithResults);

      const result = await disciplinaryService.getAllDisciplinaryActions();

      expect(result).toHaveLength(2);
    });

    it("should handle empty response", async () => {
      mockApiFetch.mockResolvedValue({});

      const result = await disciplinaryService.getAllDisciplinaryActions();

      expect(result).toHaveLength(0);
    });
  });

  describe("approveDisciplinaryAction", () => {
    it("should approve a disciplinary action", async () => {
      const approvedAction = {
        ...mockDisciplinaryAction,
        status: "approved",
      };
      mockApiFetch.mockResolvedValue(approvedAction);

      const result = await disciplinaryService.approveDisciplinaryAction(1);

      expect(mockApiFetch).toHaveBeenCalledWith(
        "/disciplinary-actions/1/approve/",
        { method: "PATCH", requiresAuth: true },
      );
      expect(result.status).toBe("approved");
    });

    it("should handle approval errors", async () => {
      mockApiFetch.mockRejectedValue(
        new Error("API request failed with status 400"),
      );

      await expect(
        disciplinaryService.approveDisciplinaryAction(1),
      ).rejects.toThrow("API request failed with status 400");
    });
  });

  describe("rejectDisciplinaryAction", () => {
    it("should reject a disciplinary action", async () => {
      const rejectedAction = {
        ...mockDisciplinaryAction,
        status: "rejected",
      };
      mockApiFetch.mockResolvedValue(rejectedAction);

      const result = await disciplinaryService.rejectDisciplinaryAction(1);

      expect(mockApiFetch).toHaveBeenCalledWith(
        "/disciplinary-actions/1/reject/",
        { method: "PATCH", requiresAuth: true },
      );
      expect(result.status).toBe("rejected");
    });

    it("should handle rejection errors", async () => {
      mockApiFetch.mockRejectedValue(
        new Error("API request failed with status 404"),
      );

      await expect(
        disciplinaryService.rejectDisciplinaryAction(999),
      ).rejects.toThrow("API request failed with status 404");
    });
  });
});
