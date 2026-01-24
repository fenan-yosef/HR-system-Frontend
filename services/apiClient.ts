// Central HTTP client for communicating with the Django REST backend.
// Uses NEXT_PUBLIC_API_BASE (full URL) when provided, otherwise falls back
// to http://127.0.0.1:8000 for local development.

const RAW_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000";

function normalizeApiBaseUrl(baseUrl: string) {
  // remove trailing slashes
  const trimmed = baseUrl.replace(/\/+$/, "");

  // handle relative base (e.g. "/api" or "/")
  if (!/^https?:\/\//i.test(trimmed)) {
    if (trimmed === "" || trimmed === "/") return "/api";
    if (trimmed.endsWith("/api")) return trimmed;
    return `${trimmed}/api`;
  }

  // absolute URL (http/https)
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
  // When true, suppress console logging for non-OK responses (useful for optional metrics).
  suppressErrorLog?: boolean;
  // When true, return undefined on 404 without throwing.
  ignoreNotFound?: boolean;
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
  const headers = new Headers(options.headers as HeadersInit);

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
    let parsedJson: unknown | null = null;
    const contentType = response.headers.get("content-type") || "";

    const isHtml = contentType.includes("text/html") || contentType.includes("application/xhtml+xml");

    if (contentType.includes("application/json")) {
      try {
        parsedJson = await response.json();
        errorDetail = JSON.stringify(parsedJson);
      } catch {
        errorDetail = "(invalid json)";
      }
    } else {
      try {
        const text = await response.text();
        errorDetail = text.length > 1000 ? `${text.slice(0, 1000)}…(truncated)` : text;
      } catch {
        errorDetail = "";
      }
    }

    const logDetail = parsedJson ?? (isHtml ? "(html response omitted)" : errorDetail);

    const logPayload = {
      url,
      status: response.status,
      statusText: response.statusText,
      detail: logDetail,
    };
    const isNotFound = response.status === 404;
    if (isNotFound && (options.ignoreNotFound || url.includes("/leave-requests/"))) {
      return undefined as TResponse;
    }

    if (!options.suppressErrorLog) {
      try {
        console.error("apiFetch error: " + JSON.stringify(logPayload));
      } catch {
        console.error("apiFetch error", logPayload);
      }
    }

    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  const respContentType = response.headers.get("content-type") || "";
  if (respContentType.includes("application/json")) {
    return (await response.json()) as TResponse;
  }

  return (await response.text()) as unknown as TResponse;
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