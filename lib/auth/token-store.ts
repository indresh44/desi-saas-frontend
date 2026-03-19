import type { AuthBusiness, AuthUser } from "@/lib/types/auth";

const REFRESH_TOKEN_KEY = "desi_crm_refresh_token";
const USER_KEY = "desi_crm_user";
const BUSINESS_KEY = "desi_crm_business";

let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token: string | null): void {
  if (typeof window === "undefined") return;

  if (token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: AuthUser | null): void {
  if (typeof window === "undefined") return;

  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

export function getStoredBusiness(): AuthBusiness | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(BUSINESS_KEY);
    return raw ? (JSON.parse(raw) as AuthBusiness) : null;
  } catch {
    return null;
  }
}

export function setStoredBusiness(business: AuthBusiness | null): void {
  if (typeof window === "undefined") return;

  if (business) {
    localStorage.setItem(BUSINESS_KEY, JSON.stringify(business));
  } else {
    localStorage.removeItem(BUSINESS_KEY);
  }
}

export function clearAllTokens(): void {
  accessToken = null;

  if (typeof window === "undefined") return;

  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(BUSINESS_KEY);
}
