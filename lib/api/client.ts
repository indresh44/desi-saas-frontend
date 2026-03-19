import { API_BASE_URL } from "@/lib/constants/api";
import { ApiError, ApiResult } from "@/lib/types/api";

type ApiRequestInit = Omit<RequestInit, "body"> & {
  body?: unknown;
};

export async function apiClient<T>(
  path: string,
  init: ApiRequestInit = {}
): Promise<ApiResult<T>> {
  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = new Headers(init.headers);

  if (!headers.has("Content-Type") && init.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...init,
    headers,
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });

  if (!response.ok) {
    const fallbackMessage = "Request failed";
    let errorMessage = fallbackMessage;

    try {
      const errorBody = (await response.json()) as { message?: string };
      if (errorBody.message) {
        errorMessage = errorBody.message;
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

  const data = (await response.json()) as T;
  return { data, status: response.status };
}