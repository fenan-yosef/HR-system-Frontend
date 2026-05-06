import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type FetchMock = typeof fetch & ReturnType<typeof vi.fn>;

const fetchMock = vi.fn() as FetchMock;

async function loadApiClient() {
  vi.resetModules();
  return import("@/services/apiClient");
}

function createJsonResponse(body: unknown, init: { status?: number } = {}) {
  return {
    ok: (init.status ?? 200) >= 200 && (init.status ?? 200) < 300,
    status: init.status ?? 200,
    statusText: init.status === 500 ? "Internal Server Error" : "OK",
    json: vi.fn().mockResolvedValue(body),
    text: vi
      .fn()
      .mockResolvedValue(
        typeof body === "string" ? body : JSON.stringify(body),
      ),
  } as Response;
}

describe("apiFetch", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
    window.localStorage.clear();
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
  });

  it("normalizes the base URL and appends trailing slashes to endpoints", async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://backend.example.com";
    fetchMock.mockResolvedValue(createJsonResponse({ ok: true }));

    const { apiFetch } = await loadApiClient();

    await apiFetch("/hr/users", { method: "GET" });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://backend.example.com/api/hr/users/",
      expect.objectContaining({
        method: "GET",
        headers: expect.any(Headers),
      }),
    );
  });

  it("injects the bearer token when auth is required", async () => {
    window.localStorage.setItem("hrms_access_token", "access-token");
    fetchMock.mockResolvedValue(createJsonResponse({ ok: true }));

    const { apiFetch } = await loadApiClient();

    await apiFetch("/secure-data", { requiresAuth: true });

    const [, requestInit] = fetchMock.mock.calls[0];
    const headers = requestInit?.headers as Headers;

    expect(headers.get("Authorization")).toBe("Bearer access-token");
    expect(headers.get("Content-Type")).toBe("application/json");
  });

  it("throws a descriptive error when the response is not ok", async () => {
    fetchMock.mockResolvedValue(
      createJsonResponse("permission denied", { status: 403 }),
    );

    const { apiFetch } = await loadApiClient();

    await expect(apiFetch("/blocked", { method: "POST" })).rejects.toThrow(
      "API request failed with status 403 - permission denied",
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
