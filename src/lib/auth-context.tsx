import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type { AuthUser } from "./auth.server";
import {
  getSession,
  loginUser,
  registerUser,
  logoutUser,
} from "./auth.server";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (
    name: string,
    email: string,
    password: string,
    role?: "customer" | "farmer",
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser?: AuthUser | null;
}) {
  const [user, setUser] = useState<AuthUser | null>(initialUser ?? null);
  const [isLoading, setIsLoading] = useState(!initialUser);

  const refreshSession = useCallback(async () => {
    try {
      const result = await getSession();
      setUser(result.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialUser) {
      refreshSession();
    }
  }, [initialUser, refreshSession]);

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await loginUser({ data: { email, password } });
      if (result.success) {
        setUser(result.user);
        return { success: true };
      }
      return { success: false, error: result.error };
    },
    [],
  );

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      role?: "customer" | "farmer",
    ) => {
      const result = await registerUser({
        data: { name, email, password, role },
      });
      if (result.success) {
        setUser(result.user);
        return { success: true };
      }
      return { success: false, error: result.error };
    },
    [],
  );

  const logout = useCallback(async () => {
    await logoutUser();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isLoggedIn: !!user,
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
