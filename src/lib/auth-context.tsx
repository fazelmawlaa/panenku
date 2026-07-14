import {
  createContext,
  useContext,
  useCallback,
  type ReactNode,
} from "react";
import type { AuthUser } from "./auth.server";
import { useAuth as useSupabaseAuth } from "@/hooks/use-auth";
import { loginUser, registerUser } from "./auth.server";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: AuthUser }>;
  register: (
    name: string,
    email: string,
    password: string,
    role?: "petani" | "pembeli",
  ) => Promise<{ success: boolean; error?: string; user?: AuthUser }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { user: sbUser, role: sbRole, loading, signOut } = useSupabaseAuth();

  const isLoggedIn = !!sbUser;
  const isLoading = loading;

  const user: AuthUser | null = sbUser
    ? {
        id: sbUser.id,
        name: sbUser.user_metadata?.name || sbUser.user_metadata?.full_name || sbUser.email?.split("@")[0] || "User",
        email: sbUser.email || "",
        role: ((sbRole as any) === "calon_petani" ? "pembeli" : sbRole as "pembeli" | "petani") || "pembeli",
      }
    : null;

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginUser({ data: { email, password } });
    if (result.success && result.session) {
      if (typeof window !== "undefined") {
        localStorage.setItem("panenku_login_time", Date.now().toString());
      }
      await supabase.auth.setSession({
        access_token: result.session.access_token,
        refresh_token: result.session.refresh_token,
      });
    }
    return result;
  }, []);

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      role?: "petani" | "pembeli",
    ) => {
      const result = await registerUser({
        data: { name, email, password, role },
      });
      if (result.success && result.session) {
        if (typeof window !== "undefined") {
          localStorage.setItem("panenku_login_time", Date.now().toString());
        }
        await supabase.auth.setSession({
          access_token: result.session.access_token,
          refresh_token: result.session.refresh_token,
        });
      }
      return result;
    },
    [],
  );

  const logout = useCallback(async () => {
    await signOut();
  }, [signOut]);

  const refreshSession = useCallback(async () => {
    // Supabase Auth provider handles this automatically under the hood
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isLoggedIn,
        login,
        register,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
