"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  loginUser,
  logoutUser,
  refreshTokens,
  registerUser,
} from "@/lib/api/auth";
import {
  clearAllTokens,
  getRefreshToken,
  getStoredBusiness,
  getStoredUser,
  setAccessToken,
  setRefreshToken,
  setStoredBusiness,
  setStoredUser,
} from "@/lib/auth/token-store";
import type {
  AuthBusiness,
  AuthResponse,
  AuthUser,
  LoginInput,
  RegisterInput,
} from "@/lib/types/auth";

interface AuthContextValue {
  user: AuthUser | null;
  business: AuthBusiness | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  updateBusiness: (nextBusiness: AuthBusiness | null) => void;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
}

const PUBLIC_ROUTES = ["/", "/login", "/register", "/forgot-password", "/reset-password", "/blog", "/onboarding", "/privacy-policy", "/terms-and-conditions"];
const AUTH_ONLY_ROUTES = ["/login", "/register"];
const INVOICE_VIEW_PATTERN = /^\/invoices\/[0-9a-f-]{36}\/.+/;

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function isPublicRoute(pathname: string): boolean {
  if (INVOICE_VIEW_PATTERN.test(pathname)) return true;

  return PUBLIC_ROUTES.some((route) => {
    if (route === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(route);
  });
}

function isAuthOnlyRoute(pathname: string): boolean {
  return AUTH_ONLY_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [business, setBusiness] = useState<AuthBusiness | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleAuthResponse = useCallback((response: AuthResponse) => {
    setAccessToken(response.access_token);
    setRefreshToken(response.refresh_token);

    const authUser: AuthUser = {
      id: response.user.id,
      name: response.user.name,
      email: response.user.email,
      phone: response.user.phone,
      role: response.user.role,
      businessId: response.user.business_id,
    };

    const authBusiness: AuthBusiness = {
      id: response.business.id,
      name: response.business.name,
      onboarding_status: response.business.onboarding_status,
      business_type: response.business.business_type ?? null,
    };

    setUser(authUser);
    setBusiness(authBusiness);
    setStoredUser(authUser);
    setStoredBusiness(authBusiness);
  }, []);

  // initAuth must run EXACTLY ONCE per mount. Two reasons:
  // (1) The backend rotates refresh tokens — each successful refresh
  //     invalidates the previous refresh token. If `pathname` is a dep
  //     and the user navigates between two protected routes in quick
  //     succession (e.g. /register → /onboarding → /onboarding/role,
  //     where /onboarding redirects to /onboarding/role), this effect
  //     fires twice with the same stored refresh token. The first call
  //     consumes it; the second gets 401 → tokens cleared → user looks
  //     logged out. This was the "Authentication required" symptom
  //     after register on slow connections.
  // (2) React Strict Mode double-invokes effects in dev; the ref guard
  //     also prevents that path from causing the same race.
  // Redirect-on-no-auth has been moved to the dedicated effect below
  // (which keys on `[isLoading, user, pathname]`), so removing
  // `pathname` from this effect's deps doesn't drop any behavior.
  const initAuthRanRef = useRef(false);
  useEffect(() => {
    if (initAuthRanRef.current) return;
    initAuthRanRef.current = true;

    const initAuth = async () => {
      const storedUser = getStoredUser();
      const storedBusiness = getStoredBusiness();
      const refreshToken = getRefreshToken();

      if (storedUser && storedBusiness && refreshToken) {
        setUser(storedUser);
        setBusiness(storedBusiness);

        try {
          const refreshed = await refreshTokens(refreshToken);
          setAccessToken(refreshed.access_token);
          setRefreshToken(refreshed.refresh_token);
        } catch {
          clearAllTokens();
          setUser(null);
          setBusiness(null);
        }
      }

      setIsLoading(false);
    };

    void initAuth();
  }, []);

  useEffect(() => {
    const handleForcedLogout = () => {
      setUser(null);
      setBusiness(null);
      router.replace("/login");
    };

    window.addEventListener("auth:logout", handleForcedLogout);
    return () => {
      window.removeEventListener("auth:logout", handleForcedLogout);
    };
  }, [router]);

  useEffect(() => {
    if (isLoading) return;

    if (!user && !isPublicRoute(pathname)) {
      router.replace("/login");
    }

    if (user && isAuthOnlyRoute(pathname)) {
      router.replace("/");
    }

    // Redirect to onboarding if not completed (unless already on /onboarding)
    if (
      user &&
      business &&
      business.onboarding_status &&
      business.onboarding_status !== "completed" &&
      !pathname.startsWith("/onboarding")
    ) {
      router.replace("/onboarding");
    }
  }, [isLoading, pathname, router, user]);

  const login = useCallback(
    async (input: LoginInput) => {
      const response = await loginUser(input);
      handleAuthResponse(response);
      const onboardingStatus = response.business.onboarding_status;
      if (onboardingStatus && onboardingStatus !== "completed") {
        router.replace("/onboarding");
      } else {
        router.replace("/");
      }
    },
    [handleAuthResponse, router]
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const response = await registerUser(input);
      handleAuthResponse(response);
      const onboardingStatus = response.business.onboarding_status;
      if (onboardingStatus && onboardingStatus !== "completed") {
        router.replace("/onboarding");
      } else {
        router.replace("/");
      }
    },
    [handleAuthResponse, router]
  );

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      await logoutUser(refreshToken);
    }

    clearAllTokens();
    setUser(null);
    setBusiness(null);
    router.replace("/login");
  }, [router]);

  const updateBusiness = useCallback((nextBusiness: AuthBusiness | null) => {
    setBusiness(nextBusiness);
    setStoredBusiness(nextBusiness);
  }, []);

  const value: AuthContextValue = {
    user,
    business,
    isLoading,
    isAuthenticated: !!user,
    updateBusiness,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
