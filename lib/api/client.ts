import { API_BASE_URL } from "@/lib/constants/api";
import { refreshTokens } from "@/lib/api/auth";
import {
  clearAllTokens,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from "@/lib/auth/token-store";
import { ApiError, ApiResult } from "@/lib/types/api";

type ApiRequestInit = Omit<RequestInit, "body"> & {
  body?: unknown;
};

let refreshPromise: Promise<string | null> | null = null;

async function parseJsonResponse<T>(response: Response): Promise<T | null> {
  const text = await response.text();
  if (!text) {
    return null;
  }

  return JSON.parse(text) as T;
}

function notifyAuthExpired() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("auth:logout"));
  }
}

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      return null;
    }

    try {
      const refreshed = await refreshTokens(refreshToken);
      setAccessToken(refreshed.access_token);
      setRefreshToken(refreshed.refresh_token);
      return refreshed.access_token;
    } catch {
      clearAllTokens();
      notifyAuthExpired();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function apiClient<T>(
  path: string,
  init: ApiRequestInit = {},
  hasRetried = false
): Promise<ApiResult<T>> {
  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = new Headers(init.headers);

  const token = getAccessToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (
    !headers.has("Content-Type") &&
    init.body !== undefined &&
    !(init.body instanceof FormData)
  ) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...init,
    headers,
    body:
      init.body === undefined
        ? undefined
        : init.body instanceof FormData
          ? init.body
          : JSON.stringify(init.body),
  });

  if (response.status === 401 && !hasRetried && !path.startsWith("/api/v1/auth")) {
    const newAccessToken = await refreshAccessToken();

    if (newAccessToken) {
      const retryHeaders = new Headers(init.headers);
      retryHeaders.set("Authorization", `Bearer ${newAccessToken}`);

      if (
        !retryHeaders.has("Content-Type") &&
        init.body !== undefined &&
        !(init.body instanceof FormData)
      ) {
        retryHeaders.set("Content-Type", "application/json");
      }

      return apiClient<T>(
        path,
        {
          ...init,
          headers: retryHeaders,
        },
        true
      );
    }
  }

  if (!response.ok) {
    const fallbackMessage = "Request failed";
    let errorMessage = fallbackMessage;

    try {
      const errorBody = (await parseJsonResponse<{ message?: string; detail?: string }>(
        response
      )) ?? { message: undefined, detail: undefined };
      if (errorBody.message || errorBody.detail) {
        errorMessage = errorBody.message || errorBody.detail || fallbackMessage;
      }
    } catch {
      errorMessage = response.statusText || fallbackMessage;
    }

    const error: ApiError = {
      message: errorMessage,
      status: response.status,
    };

    throw error;
  }

  const data = (await parseJsonResponse<T>(response)) as T;
  return { data, status: response.status };
}