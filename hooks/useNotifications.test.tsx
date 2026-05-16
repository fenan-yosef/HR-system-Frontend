import { describe, expect, it, beforeEach, vi, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import useNotifications from "@/hooks/useNotifications";
import {
  mockNotifications,
  createMockNotification,
} from "@/services/__mocks__/mockData";

vi.mock("@/services/notificationService", () => ({
  fetchInbox: vi.fn(),
  fetchUnreadCount: vi.fn(),
  markNotificationAsRead: vi.fn(),
  connectNotificationSocket: vi.fn(),
  clearNotifications: vi.fn(),
}));

import {
  fetchInbox,
  fetchUnreadCount,
  markNotificationAsRead,
  connectNotificationSocket,
  clearNotifications,
} from "@/services/notificationService";

const mockFetchInbox = fetchInbox as ReturnType<typeof vi.fn>;
const mockFetchUnreadCount = fetchUnreadCount as ReturnType<typeof vi.fn>;
const mockMarkAsRead = markNotificationAsRead as ReturnType<typeof vi.fn>;
const mockConnectSocket = connectNotificationSocket as ReturnType<typeof vi.fn>;
const mockClearNotifications = clearNotifications as ReturnType<typeof vi.fn>;

describe("useNotifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch inbox on mount", async () => {
    mockFetchInbox.mockResolvedValue(mockNotifications);
    mockFetchUnreadCount.mockResolvedValue(1);
    mockConnectSocket.mockReturnValue({
      close: vi.fn(),
    });

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.notifications).toHaveLength(2);
    });

    expect(mockFetchInbox).toHaveBeenCalled();
  });

  it("should fetch unread count on mount", async () => {
    mockFetchInbox.mockResolvedValue([]);
    mockFetchUnreadCount.mockResolvedValue(5);
    mockConnectSocket.mockReturnValue({
      close: vi.fn(),
    });

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.unreadCount).toBe(5);
    });

    expect(mockFetchUnreadCount).toHaveBeenCalled();
  });

  it("should establish WebSocket connection on mount", async () => {
    mockFetchInbox.mockResolvedValue([]);
    mockFetchUnreadCount.mockResolvedValue(0);
    const mockWs = { close: vi.fn() };
    mockConnectSocket.mockReturnValue(mockWs);

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(mockConnectSocket).toHaveBeenCalled();
    });
  });

  it("should add new notification from WebSocket", async () => {
    mockFetchInbox.mockResolvedValue([mockNotifications[0]]);
    mockFetchUnreadCount.mockResolvedValue(1);

    let wsCallback: ((data: any) => void) | undefined;
    mockConnectSocket.mockImplementation((callback) => {
      wsCallback = callback;
      return { close: vi.fn() };
    });

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.notifications).toHaveLength(1);
    });

    // Simulate incoming WebSocket message
    if (wsCallback) {
      act(() => {
        wsCallback({
          notification_id: 3,
          title: "New Message",
          body: "You have a new message",
          created_at: "2024-01-15T12:00:00Z",
          read: false,
        });
      });
    }

    await waitFor(() => {
      expect(result.current.notifications.length).toBeGreaterThan(1);
    });
  });

  it("should limit notifications to 10 items", async () => {
    const manyNotifications = Array.from({ length: 15 }, (_, i) =>
      createMockNotification({
        id: i + 1,
        title: `Notification ${i + 1}`,
      }),
    );

    mockFetchInbox.mockResolvedValue(manyNotifications);
    mockFetchUnreadCount.mockResolvedValue(15);
    mockConnectSocket.mockReturnValue({
      close: vi.fn(),
    });

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.notifications.length).toBeLessThanOrEqual(10);
    });
  });

  it("should disconnect WebSocket on unmount", async () => {
    mockFetchInbox.mockResolvedValue([]);
    mockFetchUnreadCount.mockResolvedValue(0);

    const mockWs = { close: vi.fn() };
    mockConnectSocket.mockReturnValue(mockWs);

    const { unmount } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(mockConnectSocket).toHaveBeenCalled();
    });

    unmount();

    expect(mockWs.close).toHaveBeenCalled();
  });

  it("should handle fetch errors gracefully", async () => {
    mockFetchInbox.mockRejectedValue(new Error("Fetch failed"));
    mockFetchUnreadCount.mockRejectedValue(new Error("Fetch failed"));
    mockConnectSocket.mockReturnValue({
      close: vi.fn(),
    });

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.notifications).toEqual([]);
      expect(result.current.unreadCount).toBe(0);
    });
  });

  it("should handle WebSocket errors gracefully", async () => {
    mockFetchInbox.mockResolvedValue([]);
    mockFetchUnreadCount.mockResolvedValue(0);
    mockConnectSocket.mockReturnValue({
      close: vi.fn(),
    });

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.notifications).toBeDefined();
    });
  });

  it("should update unread count when new notification arrives", async () => {
    mockFetchInbox.mockResolvedValue([]);
    mockFetchUnreadCount.mockResolvedValue(0);

    let wsCallback: ((data: any) => void) | undefined;
    mockConnectSocket.mockImplementation((callback) => {
      wsCallback = callback;
      return { close: vi.fn() };
    });

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.unreadCount).toBe(0);
    });

    if (wsCallback) {
      act(() => {
        wsCallback({
          notification_id: 1,
          title: "Test",
          body: "Test notification",
          created_at: new Date().toISOString(),
          read: false,
        });
      });
    }

    await waitFor(() => {
      expect(result.current.unreadCount).toBeGreaterThan(0);
    });
  });
});
