"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
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

const PUBLIC_ROUTES = ["/login", "/register"];

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
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
    };

    setUser(authUser);
    setBusiness(authBusiness);
    setStoredUser(authUser);
    setStoredBusiness(authBusiness);
  }, []);

  useEffect(() => {
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
          if (!isPublicRoute(pathname)) {
            router.replace("/login");
          }
        }
      } else if (!isPublicRoute(pathname)) {
        router.replace("/login");
      }

      setIsLoading(false);
    };

    void initAuth();
  }, [pathname, router]);

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

    if (user && isPublicRoute(pathname)) {
      router.replace("/");
    }
  }, [isLoading, pathname, router, user]);

  const login = useCallback(
    async (input: LoginInput) => {
      const response = await loginUser(input);
      handleAuthResponse(response);
      router.replace("/");
    },
    [handleAuthResponse, router]
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const response = await registerUser(input);
      handleAuthResponse(response);
      router.replace("/");
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
