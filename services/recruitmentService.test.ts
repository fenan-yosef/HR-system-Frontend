import { describe, expect, it, beforeEach, vi, afterEach } from "vitest";
import * as recruitmentService from "@/services/recruitmentService";
import {
  mockJobPostings,
  mockApplications,
  createMockApplication,
} from "@/services/__mocks__/mockData";

vi.mock("@/services/apiClient", () => ({
  apiFetch: vi.fn(),
}));

import { apiFetch } from "@/services/apiClient";

const mockApiFetch = apiFetch as ReturnType<typeof vi.fn>;

describe("recruitmentService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchJobPostings", () => {
    it("should fetch job postings with authentication", async () => {
      mockApiFetch.mockResolvedValue(mockJobPostings);

      const result = await recruitmentService.fetchJobPostings();

      expect(mockApiFetch).toHaveBeenCalledWith("/job-positions/", {
        requiresAuth: true,
      });
      expect(result.count).toBe(mockJobPostings.count);
      expect(result.results).toHaveLength(mockJobPostings.results.length);
    });

    it("should return paginated results with next/previous links", async () => {
      const paginatedResponse = {
        ...mockJobPostings,
        count: 10,
        next: "https://api.example.com/api/job-posts/?page=2",
        previous: null,
      };
      mockApiFetch.mockResolvedValue(paginatedResponse);

      const result = await recruitmentService.fetchJobPostings();

      expect(result.next).not.toBeNull();
      expect(result.previous).toBeNull();
    });

    it("should handle API errors gracefully", async () => {
      const error = new Error("API request failed with status 500");
      mockApiFetch.mockRejectedValue(error);

      await expect(recruitmentService.fetchJobPostings()).rejects.toThrow(
        "API request failed with status 500",
      );
    });

    it("should handle empty results", async () => {
      mockApiFetch.mockResolvedValue({
        count: 0,
        next: null,
        previous: null,
        results: [],
      });

      const result = await recruitmentService.fetchJobPostings();

      expect(result.count).toBe(0);
      expect(result.results).toHaveLength(0);
    });
  });

  describe("fetchApplications", () => {
    it("should fetch applications with authentication", async () => {
      mockApiFetch.mockResolvedValue(mockApplications);

      const result = await recruitmentService.fetchApplications();

      expect(mockApiFetch).toHaveBeenCalledWith("/applicant-applications/", {
        requiresAuth: true,
      });
      expect(result.results).toHaveLength(mockApplications.results.length);
    });

    it("should return applications with correct properties", async () => {
      mockApiFetch.mockResolvedValue(mockApplications);

      const result = await recruitmentService.fetchApplications();

      expect(result.results[0]).toHaveProperty("application_id");
      expect(result.results[0]).toHaveProperty("applicant_name");
      expect(result.results[0]).toHaveProperty("status");
    });

    it("should handle network errors", async () => {
      mockApiFetch.mockRejectedValue(new Error("Network timeout"));

      await expect(recruitmentService.fetchApplications()).rejects.toThrow(
        "Network timeout",
      );
    });

    it("should handle empty applications list", async () => {
      mockApiFetch.mockResolvedValue({
        count: 0,
        next: null,
        previous: null,
        results: [],
      });

      const result = await recruitmentService.fetchApplications();

      expect(result.results).toHaveLength(0);
    });
  });

  describe("createApplicant", () => {
    it("should create a new applicant without authentication", async () => {
      const applicantData = {
        full_name: "Jane Doe",
        email: "jane@example.com",
        phone: "+251911223344",
        position_id: 1,
      };

      const response = {
        applicant_id: 1,
        ...applicantData,
        created_at: "2024-01-15T00:00:00Z",
      };

      mockApiFetch.mockResolvedValue(response);

      const result = await recruitmentService.createApplicant(applicantData);

      expect(mockApiFetch).toHaveBeenCalledWith("/applicants/", {
        method: "POST",
        body: JSON.stringify(applicantData),
        requiresAuth: false,
      });
      expect(result.applicant_id).toBe(1);
    });

    it("should handle validation errors when creating applicant", async () => {
      const invalidData = {
        full_name: "Jane",
        email: "invalid-email",
        phone: "",
        position_id: 1,
      };

      mockApiFetch.mockRejectedValue(
        new Error("API request failed with status 400"),
      );

      await expect(
        recruitmentService.createApplicant(invalidData),
      ).rejects.toThrow("API request failed with status 400");
    });

    it("should return applicant response with tracking code", async () => {
      const applicantData = {
        full_name: "John Smith",
        email: "john@example.com",
        phone: "+251911556677",
        position_id: 1,
      };

      const response = {
        applicant_id: 1,
        ...applicantData,
        tracking_code: "TRACK123",
        created_at: "2024-01-15T00:00:00Z",
      };

      mockApiFetch.mockResolvedValue(response);

      const result = await recruitmentService.createApplicant(applicantData);

      expect(result).toHaveProperty("tracking_code");
    });
  });

  describe("triggerShortlist", () => {
    it("should trigger AI shortlist for an application", async () => {
      const applicationId = 1;
      const aiEvaluation = {
        application_id: applicationId,
        matching_percentage: 85,
        status: "passed",
      };

      mockApiFetch.mockResolvedValue(aiEvaluation);

      const result = await recruitmentService.triggerShortlist(applicationId);

      expect(mockApiFetch).toHaveBeenCalledWith(
        `/applicant-applications/${applicationId}/toggle-shortlist/`,
        { method: "POST", requiresAuth: true },
      );
      expect(result.matching_percentage).toBe(85);
    });

    it("should handle shortlist API failures", async () => {
      mockApiFetch.mockRejectedValue(
        new Error("API request failed with status 500"),
      );

      await expect(recruitmentService.triggerShortlist(1)).rejects.toThrow(
        "API request failed with status 500",
      );
    });
  });
});
