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

function ensureTrailingSlash(path: string) {
  if (path.endsWith("/")) return path;
  if (path.includes("?") || path.includes("#")) return path;
  return `${path}/`;
}
const ACCESS_TOKEN_KEY = "hrms_access_token";
const REFRESH_TOKEN_KEY = "hrms_refresh_token";

export interface ApiRequestOptions extends RequestInit {
  requiresAuth?: boolean;
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
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = "";
    try {
      errorDetail = await response.text();
    } catch {
      errorDetail = "";
    }
    // Surface API errors in dev tools for quicker diagnosis.
    console.error("apiFetch error", {
      url,
      status: response.status,
      statusText: response.statusText,
      detail: errorDetail,
    });
    const suffix = errorDetail ? ` - ${errorDetail}` : "";
    throw new Error(`API request failed with status ${response.status}${suffix}`);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return (await response.json()) as TResponse;
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
