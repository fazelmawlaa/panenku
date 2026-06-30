import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie, deleteCookie } from "@tanstack/react-start/server";
import { supabase } from "./supabase";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "customer" | "farmer";
}

// Helper to save Supabase session tokens in cookies
function setSessionCookies(accessToken: string, refreshToken: string) {
  setCookie("sb-access-token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  });
  setCookie("sb-refresh-token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  });
}

// Helper to delete session cookies
function clearSessionCookies() {
  deleteCookie("sb-access-token", { path: "/" });
  deleteCookie("sb-refresh-token", { path: "/" });
}

// ---------- server functions ----------
export const registerUser = createServerFn({ method: "POST" })
  .validator(
    (data: { name: string; email: string; password: string; role?: "customer" | "farmer" }) => data,
  )
  .handler(async ({ data }) => {
    const { name, email, password, role = "customer" } = data;

    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
        },
      },
    });

    if (error) {
      return { success: false as const, error: error.message };
    }

    const session = authData.session;
    const user = authData.user;

    if (!user) {
      return { success: false as const, error: "Registrasi gagal, silakan coba lagi." };
    }

    // Set session cookies if session was created automatically
    if (session) {
      setSessionCookies(session.access_token, session.refresh_token);
    }

    return {
      success: true as const,
      user: {
        id: user.id,
        name,
        email,
        role,
      } as AuthUser,
    };
  });

export const loginUser = createServerFn({ method: "POST" })
  .validator((data: { email: string; password: string }) => data)
  .handler(async ({ data }) => {
    const { email, password } = data;

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false as const, error: error.message === "Invalid login credentials" ? "Email atau password salah" : error.message };
    }

    const session = authData.session;
    const user = authData.user;

    if (!session || !user) {
      return { success: false as const, error: "Gagal memuat sesi login." };
    }

    setSessionCookies(session.access_token, session.refresh_token);

    return {
      success: true as const,
      user: {
        id: user.id,
        name: user.user_metadata?.name || "User",
        email: user.email || "",
        role: (user.user_metadata?.role as "customer" | "farmer") || "customer",
      } as AuthUser,
    };
  });

export const logoutUser = createServerFn({ method: "POST" }).handler(
  async () => {
    const accessToken = getCookie("sb-access-token");
    if (accessToken) {
      // Sign out from Supabase auth server
      await supabase.auth.signOut();
    }
    clearSessionCookies();
    return { success: true };
  },
);

export const getSession = createServerFn({ method: "GET" }).handler(
  async () => {
    const accessToken = getCookie("sb-access-token");
    const refreshToken = getCookie("sb-refresh-token");

    if (!accessToken) {
      return { user: null };
    }

    // Verify token with Supabase auth server
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (user) {
      return {
        user: {
          id: user.id,
          name: user.user_metadata?.name || "User",
          email: user.email || "",
          role: (user.user_metadata?.role as "customer" | "farmer") || "customer",
        } as AuthUser,
      };
    }

    // Access token may have expired. Try to refresh using the refresh token.
    if (refreshToken) {
      const { data: refreshData, error: refreshError } = await supabase.auth.setSession({
        access_token: "",
        refresh_token: refreshToken,
      });

      if (!refreshError && refreshData.session && refreshData.user) {
        const session = refreshData.session;
        const newUser = refreshData.user;

        setSessionCookies(session.access_token, session.refresh_token);

        return {
          user: {
            id: newUser.id,
            name: newUser.user_metadata?.name || "User",
            email: newUser.email || "",
            role: (newUser.user_metadata?.role as "customer" | "farmer") || "customer",
          } as AuthUser,
        };
      }
    }

    // If both failed or refresh token not present, clear sessions
    clearSessionCookies();
    return { user: null };
  },
);
