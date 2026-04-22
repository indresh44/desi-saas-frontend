import { API_BASE_URL } from "../constants/api";
import {
  AuthResponse,
  LoginInput,
  RefreshResponse,
  RegisterInput,
} from "../types/auth";

const AUTH_BASE = `${API_BASE_URL}/api/v1/auth`;

async function authFetch<T>(path: string, body: object): Promise<T> {
  const response = await fetch(`${AUTH_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const errorBody =
      typeof data === "object" && data !== null
        ? (data as { detail?: string; message?: string })
        : {};
    const message =
      errorBody.detail || errorBody.message || "Something went wrong";
    throw new Error(message);
  }

  return data as T;
}

export async function registerUser(input: RegisterInput): Promise<AuthResponse> {
  return authFetch<AuthResponse>("/register", input);
}

export async function loginUser(input: LoginInput): Promise<AuthResponse> {
  return authFetch<AuthResponse>("/login", input);
}

export async function refreshTokens(refreshToken: string): Promise<RefreshResponse> {
  return authFetch<RefreshResponse>("/refresh", {
    refresh_token: refreshToken,
  });
}

export async function logoutUser(refreshToken: string): Promise<void> {
  try {
    await authFetch<{ message: string }>("/logout", {
      refresh_token: refreshToken,
    });
  } catch {
    // logout should not block user sign-out UX
  }
}

export async function requestPasswordReset(email: string): Promise<{ message: string }> {
  return authFetch<{ message: string }>("/password-reset/request", { email });
}

export async function confirmPasswordReset(
  token: string,
  newPassword: string,
): Promise<{ message: string }> {
  return authFetch<{ message: string }>("/password-reset/confirm", {
    token,
    new_password: newPassword,
  });
}
