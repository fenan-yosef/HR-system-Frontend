// Central HTTP client for communicating with the Django REST backend.
// NEXT_PUBLIC_API_BASE_URL can be a full backend URL (with or without /api).
// When unset, requests go to /api and are proxied by Next.js rewrites.

const RAW_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";

function normalizeApiBaseUrl(baseUrl: string) {
  const trimmed = baseUrl.replace(/\/$/, "");
  if (trimmed.endsWith("/api")) return trimmed;
  return `${trimmed}/api`;
}

const API_BASE_URL = `${normalizeApiBaseUrl(RAW_API_BASE_URL)}/`;

// Utility to resolve media URLs (CVs, profile pics, etc)
// Files are now served from the database via the /api/media/ route.
export function getMediaUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("data:")) return path;

  // Joins API_BASE_URL (which includes /api/) with media/ and the path
  // We use encodeURI to handle spaces in filenames like "Key Prices - Sheet1.pdf"
  const cleanPath = path.replace(/^\/+/, "");
  return `${API_BASE_URL}media/${encodeURI(cleanPath)}`;
}

function ensureTrailingSlash(path: string) {
  if (path.endsWith("/")) return path;
  if (path.includes("?") || path.includes("#")) return path;
  return `${path}/`;
}
const ACCESS_TOKEN_KEY = "hrms_access_token";
const REFRESH_TOKEN_KEY = "hrms_refresh_token";

export interface ApiRequestOptions extends RequestInit {
  requiresAuth?: boolean;
  redirectOnUnauthorized?: boolean;
}

export class ApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail = "") {
    super(`API request failed with status ${status}${detail ? ` - ${detail}` : ""}`);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

export function getApiErrorStatus(error: unknown): number | null {
  if (error instanceof ApiError) return error.status;
  if (error instanceof Error) {
    const match = error.message.match(/status\s+(\d{3})/i);
    return match ? Number(match[1]) : null;
  }
  return null;
}

function isFormData(body: BodyInit | null | undefined): body is FormData {
  return typeof FormData !== "undefined" && body instanceof FormData;
}

async function getStoredAccessToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export async function apiFetch<TResponse>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<TResponse> {
  const endpointPath = ensureTrailingSlash(endpoint.replace(/^\/+/, ""));
  const url = `${API_BASE_URL}${endpointPath}`;
  const headers = new Headers(options.headers);

  // Avoid clobbering multipart/form-data boundaries.
  if (!isFormData(options.body)) {
    headers.set("Content-Type", "application/json");
  }

  if (options.requiresAuth) {
    const token = await getStoredAccessToken();
    if (!token) {
      if (options.redirectOnUnauthorized !== false && typeof window !== "undefined") {
        try {
          clearTokens();
        } catch {}
        window.location.assign("/login");
      }
      throw new ApiError(401, "Missing access token");
    }
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    cache: options.cache ?? "no-store",
    headers,
  });

  // If we get a 401, check whether it's due to an expired/invalid access token.
  if (response.status === 401) {
    let respJson: any = null;
    try {
      respJson = await response.clone().json().catch(() => null);
    } catch {
      respJson = null;
    }

    const isTokenNotValid =
      respJson?.code === "token_not_valid" ||
      (typeof respJson?.detail === "string" && respJson.detail.toLowerCase().includes("given token not valid")) ||
      (Array.isArray(respJson?.messages) && respJson.messages.some((m: any) => m?.token_class === "AccessToken" && /expire|expired/i.test(m?.message)));

    const refresh = getStoredRefreshToken();

    // Attempt refresh if the backend indicates the access token is invalid/expired and we have a refresh token.
    if (isTokenNotValid && refresh) {
      try {
        const tokenRes = await fetch(`${API_BASE_URL}auth/token/refresh/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh }),
        });

        if (tokenRes.ok) {
          const tokenJson = await tokenRes.json().catch(() => null);
          const newAccess = tokenJson?.access;
          if (newAccess) {
            if (typeof window !== "undefined") {
              window.localStorage.setItem(ACCESS_TOKEN_KEY, newAccess);
            }

            // retry original request with new access token
            const retryHeaders = new Headers(options.headers);
            if (!isFormData(options.body)) retryHeaders.set("Content-Type", "application/json");
            retryHeaders.set("Authorization", `Bearer ${newAccess}`);
            const retryRes = await fetch(url, { ...options, headers: retryHeaders });
            if (!retryRes.ok) {
              let errDetail = "";
              try {
                errDetail = await retryRes.text();
              } catch { }
              console.error("apiFetch retry error", { url, status: retryRes.status, detail: errDetail });
              throw new ApiError(retryRes.status, errDetail);
            }
            if (retryRes.status === 204) return undefined as TResponse;
            return (await retryRes.json()) as TResponse;
          }
        }
      } catch (e) {
        console.warn("Token refresh failed", e);
      }
    }

    // If refresh was not possible or failed, only redirect when the caller
    // has not explicitly opted out. Login requests need to surface the error
    // in-place instead of bouncing back to the page.
    if (options.redirectOnUnauthorized !== false && typeof window !== "undefined") {
      // Avoid infinite redirect loops if we're already on the login page.
      if (window.location.pathname === "/login") {
        throw new ApiError(401, "Unauthorized on login page");
      }

      try {
        clearTokens();
      } catch {}
      // Force a full-page navigation to ensure any app state is reset.
      window.location.assign("/login");
      throw new ApiError(401, "Redirecting to login");
    }
  }

  if (!response.ok) {
    let errorDetail = "";
    try {
      errorDetail = await response.text();
    } catch {
      errorDetail = "";
    }
    // Surface API errors in dev tools for quicker diagnosis.
    console.error(`apiFetch error [${response.status}] ${url}`, {
      status: response.status,
      statusText: response.statusText,
      detail: errorDetail,
    });
    throw new ApiError(response.status, errorDetail);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return (await response.json()) as TResponse;
}

export async function apiDownload(url: string): Promise<string> {
  const headers = new Headers();
  const token = await getStoredAccessToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Resolve relative API paths to full backend URL so downloads work
  // when callers pass "/api/.." or "/beneficiaries/...".
  let fetchUrl = url;
  if (!/^https?:\/\//i.test(url)) {
    let path = url.replace(/^\/+/, "");
    if (path.startsWith("api/")) path = path.replace(/^api\//, "");
    const endpointPath = ensureTrailingSlash(path);
    fetchUrl = `${API_BASE_URL}${endpointPath}`;
  }

  const response = await fetch(fetchUrl, { headers });

  if (!response.ok) {
    throw new Error(`Download failed with status ${response.status}`);
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

export function persistTokens(access: string, refresh: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACCESS_TOKEN_KEY, access);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function getStoredRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getAccessTokenKey() {
  return ACCESS_TOKEN_KEY;
}
