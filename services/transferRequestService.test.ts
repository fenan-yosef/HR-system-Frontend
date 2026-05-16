import { describe, expect, it, beforeEach, vi, afterEach } from "vitest";
import * as transferRequestService from "@/services/transferRequestService";
import {
  mockTransferRequest,
  mockTransferRequests,
} from "@/services/__mocks__/mockData";

vi.mock("@/services/apiClient", () => ({
  apiFetch: vi.fn(),
}));

import { apiFetch } from "@/services/apiClient";

const mockApiFetch = apiFetch as ReturnType<typeof vi.fn>;

describe("transferRequestService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("createTransferRequest", () => {
    it("should create a transfer request", async () => {
      const payload = {
        target_department: 2,
        requested_position: "HR Specialist",
        reason: "Looking for a career change",
      };

      mockApiFetch.mockResolvedValue(mockTransferRequest);

      const result =
        await transferRequestService.createTransferRequest(payload);

      expect(mockApiFetch).toHaveBeenCalledWith("/transfer-requests/", {
        method: "POST",
        body: JSON.stringify(payload),
        requiresAuth: true,
      });
      expect(result.transfer_request_id).toBe(1);
      expect(result.reason).toBe("Looking for a career change");
    });

    it("should create transfer request without position", async () => {
      const payload = {
        target_department: 3,
        reason: "Seeking new challenges",
      };

      mockApiFetch.mockResolvedValue({
        ...mockTransferRequest,
        requested_position: null,
        reason: "Seeking new challenges",
      });

      const result =
        await transferRequestService.createTransferRequest(payload);

      expect(result.requested_position).toBeNull();
    });

    it("should handle validation errors", async () => {
      mockApiFetch.mockRejectedValue(
        new Error("API request failed with status 400"),
      );

      const payload = {
        target_department: 999,
        reason: "",
      };

      await expect(
        transferRequestService.createTransferRequest(payload),
      ).rejects.toThrow("API request failed with status 400");
    });

    it("should handle API errors", async () => {
      mockApiFetch.mockRejectedValue(
        new Error("API request failed with status 500"),
      );

      const payload = {
        target_department: 2,
        reason: "Test",
      };

      await expect(
        transferRequestService.createTransferRequest(payload),
      ).rejects.toThrow("API request failed with status 500");
    });
  });

  describe("fetchMyTransferRequests", () => {
    it("should fetch user's transfer requests", async () => {
      mockApiFetch.mockResolvedValue(mockTransferRequests);

      const result = await transferRequestService.fetchMyTransferRequests();

      expect(mockApiFetch).toHaveBeenCalledWith("/transfer-requests/my/", {
        method: "GET",
        requiresAuth: true,
      });
      expect(result).toHaveLength(2);
      expect(result[0].transfer_request_id).toBe(1);
    });

    it("should handle empty transfer requests list", async () => {
      mockApiFetch.mockResolvedValue([]);

      const result = await transferRequestService.fetchMyTransferRequests();

      expect(result).toHaveLength(0);
    });

    it("should handle API errors when fetching requests", async () => {
      mockApiFetch.mockRejectedValue(
        new Error("API request failed with status 401"),
      );

      await expect(
        transferRequestService.fetchMyTransferRequests(),
      ).rejects.toThrow("API request failed with status 401");
    });
  });
});
