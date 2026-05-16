import { describe, expect, it, beforeEach, vi, afterEach } from "vitest";
import * as complaintService from "@/services/complaintService";
import {
  mockComplaint,
  mockComplaints,
  createMockComplaint,
} from "@/services/__mocks__/mockData";

vi.mock("@/services/apiClient", () => ({
  apiFetch: vi.fn(),
}));

import { apiFetch } from "@/services/apiClient";

const mockApiFetch = apiFetch as ReturnType<typeof vi.fn>;

describe("complaintService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("createComplaint", () => {
    it("should create a workplace complaint", async () => {
      const payload = {
        subject: "Workplace Safety Concern",
        category: "WORKPLACE" as const,
        details: "The office air conditioning is not working properly",
        desired_resolution: "Fix the air conditioning",
      };

      mockApiFetch.mockResolvedValue(mockComplaint);

      const result = await complaintService.createComplaint(payload);

      expect(mockApiFetch).toHaveBeenCalledWith("/complaints/", {
        method: "POST",
        body: JSON.stringify(payload),
        requiresAuth: true,
      });
      expect(result.complaint_id).toBe(1);
      expect(result.subject).toBe("Workplace Safety Concern");
    });

    it("should create a payroll complaint", async () => {
      const payload = {
        subject: "Missing Bonus",
        category: "PAYROLL" as const,
        details: "I did not receive my monthly bonus",
      };

      mockApiFetch.mockResolvedValue({
        ...mockComplaint,
        subject: "Missing Bonus",
        category: "PAYROLL",
      });

      const result = await complaintService.createComplaint(payload);

      expect(result.category).toBe("PAYROLL");
    });

    it("should create a harassment complaint", async () => {
      const payload = {
        subject: "Harassment by Manager",
        category: "HARASSMENT" as const,
        details: "My manager has been treating me unfairly",
      };

      mockApiFetch.mockResolvedValue({
        ...mockComplaint,
        subject: "Harassment by Manager",
        category: "HARASSMENT",
      });

      const result = await complaintService.createComplaint(payload);

      expect(result.category).toBe("HARASSMENT");
    });

    it("should handle validation errors", async () => {
      mockApiFetch.mockRejectedValue(
        new Error("API request failed with status 400"),
      );

      const payload = {
        subject: "",
        category: "WORKPLACE" as const,
        details: "",
      };

      await expect(complaintService.createComplaint(payload)).rejects.toThrow(
        "API request failed with status 400",
      );
    });

    it("should handle API errors", async () => {
      mockApiFetch.mockRejectedValue(
        new Error("API request failed with status 500"),
      );

      const payload = {
        subject: "Test",
        category: "WORKPLACE" as const,
        details: "Test details",
      };

      await expect(complaintService.createComplaint(payload)).rejects.toThrow(
        "API request failed with status 500",
      );
    });
  });

  describe("getMyComplaints", () => {
    it("should fetch current user's complaints", async () => {
      mockApiFetch.mockResolvedValue(mockComplaints);

      const result = await complaintService.getMyComplaints();

      expect(mockApiFetch).toHaveBeenCalledWith("/complaints/my/", {
        method: "GET",
        requiresAuth: true,
      });
      expect(result).toHaveLength(2);
      expect(result[0].complaint_id).toBe(1);
    });

    it("should handle empty complaints list", async () => {
      mockApiFetch.mockResolvedValue([]);

      const result = await complaintService.getMyComplaints();

      expect(result).toHaveLength(0);
    });

    it("should extract complaints from response format with results", async () => {
      mockApiFetch.mockResolvedValue({ results: mockComplaints });

      const result = await complaintService.getMyComplaints();

      expect(result).toHaveLength(2);
    });

    it("should handle API errors", async () => {
      mockApiFetch.mockRejectedValue(
        new Error("API request failed with status 500"),
      );

      await expect(complaintService.getMyComplaints()).rejects.toThrow(
        "API request failed with status 500",
      );
    });
  });

  describe("getAllComplaints", () => {
    it("should fetch all complaints", async () => {
      mockApiFetch.mockResolvedValue(mockComplaints);

      const result = await complaintService.getAllComplaints();

      expect(mockApiFetch).toHaveBeenCalledWith("/complaints/", {
        method: "GET",
        requiresAuth: true,
      });
      expect(result).toHaveLength(2);
    });

    it("should extract complaints from various response formats", async () => {
      const responseWithData = { data: mockComplaints };
      mockApiFetch.mockResolvedValue(responseWithData);

      const result = await complaintService.getAllComplaints();

      expect(result).toHaveLength(2);
    });

    it("should extract complaints from complaints field", async () => {
      const responseWithComplaints = { complaints: mockComplaints };
      mockApiFetch.mockResolvedValue(responseWithComplaints);

      const result = await complaintService.getAllComplaints();

      expect(result).toHaveLength(2);
    });

    it("should handle empty response", async () => {
      mockApiFetch.mockResolvedValue({});

      const result = await complaintService.getAllComplaints();

      expect(result).toHaveLength(0);
    });

    it("should handle null response", async () => {
      mockApiFetch.mockResolvedValue(null);

      const result = await complaintService.getAllComplaints();

      expect(result).toHaveLength(0);
    });

    it("should handle API errors", async () => {
      mockApiFetch.mockRejectedValue(
        new Error("API request failed with status 401"),
      );

      await expect(complaintService.getAllComplaints()).rejects.toThrow(
        "API request failed with status 401",
      );
    });
  });
});
