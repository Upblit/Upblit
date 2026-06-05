// lib/api.ts

/**
 * API helper module
 * Provides typed wrappers for GET, POST, POST (form), DELETE requests.
 * Base URL is read from NEXT_PUBLIC_API_URL environment variable.
 * Includes Authorization header with bearer token from user store when available.
 */

/** Thrown when the server returns a QUOTA_EXCEEDED 403. */
export class QuotaError extends Error {
  resource: string
  plan: string
  current: number
  limit: number
  upgradeUrl: string

  constructor(body: {
    message: string
    resource: string
    plan: string
    current: number
    limit: number
    upgradeUrl?: string
  }) {
    super(body.message)
    this.name = "QuotaError"
    this.resource = body.resource
    this.plan = body.plan
    this.current = body.current
    this.limit = body.limit
    this.upgradeUrl = body.upgradeUrl ?? "/pricing"
  }
}

import { jwtDecode } from "jwt-decode";
import { useUserData } from "../hooks/use-userData";

// Helper to get the base URL
function getBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_API_URL is not defined in environment variables");
  }
  return url.replace(/\/*$/, ""); // Remove trailing slash if any
}

// Helper to get current access token (synchronously via store)
function getAccessToken(): string | null {
  // Zustand store is not reactive here; we can retrieve the current state directly.
  const state = useUserData.getState();
  return state.accessToken;
}

// Helper to build headers
function buildHeaders(token: string | null, isJson: boolean = true): HeadersInit {
  const headers: HeadersInit = {};
  if (isJson) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as T;
  }
}

/**
 * Shared error handler for all API methods.
 * Detects QUOTA_EXCEEDED 403 and throws a typed QuotaError;
 * otherwise throws a plain Error with the raw message.
 */
async function handleErrorResponse(method: string, path: string, response: Response): Promise<never> {
  const text = await response.text();
  if (response.status === 403 && text) {
    try {
      const body = JSON.parse(text) as Record<string, unknown>;
      if (body.error === "QUOTA_EXCEEDED") {
        throw new QuotaError({
          message: String(body.message ?? "Quota exceeded"),
          resource: String(body.resource ?? "resource"),
          plan: String(body.plan ?? ""),
          current: Number(body.current ?? 0),
          limit: Number(body.limit ?? 0),
          upgradeUrl: typeof body.upgradeUrl === "string" ? body.upgradeUrl : "/pricing",
        });
      }
    } catch (e) {
      if (e instanceof QuotaError) throw e;
    }
  }
  throw new Error(`${method} ${path} failed: ${response.status} - ${text}`);
}

async function getFreshAccessToken(): Promise<string | null> {
  const token = getAccessToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode<{ exp?: number }>(token);
    const expiresIn = decoded.exp ? decoded.exp - Date.now() / 1000 : Number.POSITIVE_INFINITY;

    if (expiresIn > 300) {
      return token;
    }

    // Use the refresh token stored in localStorage (if available)
    const refreshToken = typeof window !== "undefined" ? localStorage.getItem("upblit_refresh") : null;
    if (!refreshToken) return token;
    const url = new URL(getBaseUrl() + "/auth/refresh");
    url.searchParams.set("refreshToken", refreshToken);

    const response = await fetch(url.toString(), { method: "GET" });
    if (!response.ok) return token;

    const refreshed = await parseResponse<unknown>(response);
    const nextToken =
      typeof refreshed === "string"
        ? refreshed
        : isRecord(refreshed) && typeof refreshed.token === "string"
          ? refreshed.token
          : isRecord(refreshed) && typeof refreshed.accessToken === "string"
            ? refreshed.accessToken
            : null;

    if (nextToken) {
      useUserData.getState().setToken(nextToken);
      if (typeof window !== "undefined") {
        localStorage.setItem("upblit_token", nextToken);
      }
      return nextToken;
    }
  } catch {
    return token;
  }

  return token;
}

/**
 * Perform a GET request.
 * @param path Relative API path, e.g. "/org"
 * @param params Optional query parameters object
 */
export async function apiGet<T>(path: string, params?: Record<string, string | number>): Promise<T> {
  const url = new URL(getBaseUrl() + path);
  if (params) {
    Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, String(value)));
  }
  const response = await fetch(url.toString(), {
    method: "GET",
    headers: buildHeaders(await getFreshAccessToken(), false),
  });
  if (!response.ok) {
    await handleErrorResponse("GET", path, response);
  }
  return parseResponse<T>(response);
}

/**
 * Perform a POST request with a JSON body.
 * @param path Relative API path
 * @param body Optional request payload (will be JSON.stringified)
 */
export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(getBaseUrl() + path, {
    method: "POST",
    headers: buildHeaders(await getFreshAccessToken(), true),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    await handleErrorResponse("POST", path, response);
  }
  return parseResponse<T>(response);
}

/**
 * Perform a PUT request with a JSON body.
 * @param path Relative API path
 * @param body Optional request payload (will be JSON.stringified)
 */
export async function apiPut<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(getBaseUrl() + path, {
    method: "PUT",
    headers: buildHeaders(await getFreshAccessToken(), true),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    await handleErrorResponse("PUT", path, response);
  }
  return parseResponse<T>(response);
}

/**
 * Perform a POST request with FormData (for file uploads).
 * @param path Relative API path
 * @param formData FormData instance containing file and other fields
 */
export async function apiPostForm<T>(path: string, formData: FormData): Promise<T> {
  const token = await getFreshAccessToken();
  const response = await fetch(getBaseUrl() + path, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });
  if (!response.ok) {
    await handleErrorResponse("POST (form)", path, response);
  }
  return parseResponse<T>(response);
}

/**
 * Perform a PUT request with FormData (for file uploads).
 * @param path Relative API path
 * @param formData FormData instance containing file and other fields
 */
export async function apiPutForm<T>(path: string, formData: FormData): Promise<T> {
  const token = await getFreshAccessToken();
  const response = await fetch(getBaseUrl() + path, {
    method: "PUT",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });
  if (!response.ok) {
    await handleErrorResponse("PUT (form)", path, response);
  }
  return parseResponse<T>(response);
}

/**
 * Perform a DELETE request.
 * @param path Relative API path
 * @param params Optional query parameters
 */
export async function apiDelete<T>(path: string, params?: Record<string, string | number>): Promise<T> {
  const url = new URL(getBaseUrl() + path);
  if (params) {
    Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, String(value)));
  }
  const response = await fetch(url.toString(), {
    method: "DELETE",
    headers: buildHeaders(await getFreshAccessToken(), false),
  });
  if (!response.ok) {
    await handleErrorResponse("DELETE", path, response);
  }
  return parseResponse<T>(response);
}
