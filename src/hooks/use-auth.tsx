import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "petani" | "pembeli";

type Profile = { 
  full_name: string | null; 
  phone: string | null; 
  address: string | null;
  experience: string | null;
  focus_area: string | null;
  certification: string | null;
  bio: string | null;
  ktp_number: string | null;
  ktp_photo: string | null;
  avatar_url: string | null;
} | null;

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  role: AppRole | null;
  profile: Profile;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthCtx = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [profile, setProfile] = useState<Profile>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkExpiration = async () => {
      if (typeof window === "undefined") return false;
      const loginTimeStr = localStorage.getItem("panenku_login_time");
      if (loginTimeStr) {
        const loginTime = parseInt(loginTimeStr, 10);
        const oneDayMs = 24 * 60 * 60 * 1000;
        if (Date.now() - loginTime > oneDayMs) {
          localStorage.removeItem("panenku_login_time");
          await supabase.auth.signOut();
          return true; // expired
        }
      }
      return false; // not expired
    };

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, s) => {
      if (s?.user) {
        if (event === "SIGNED_IN") {
          localStorage.setItem("panenku_login_time", Date.now().toString());
        }
        
        const isExpired = await checkExpiration();
        if (isExpired) {
          setSession(null);
          setRole(null);
          setProfile(null);
          return;
        }
        
        setSession(s);
        setTimeout(() => loadUserData(s.user.id), 0);
      } else {
        setSession(null);
        setRole(null);
        setProfile(null);
      }
    });

    checkExpiration().then((isExpired) => {
      if (isExpired) {
        setSession(null);
        setLoading(false);
      } else {
        supabase.auth.getSession().then(({ data }) => {
          if (data.session) {
            if (!localStorage.getItem("panenku_login_time")) {
              localStorage.setItem("panenku_login_time", Date.now().toString());
            }
          }
          setSession(data.session);
          if (data.session?.user) loadUserData(data.session.user.id);
          setLoading(false);
        });
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  async function loadUserData(userId: string) {
    // 1. Load role directly from Supabase
    try {
      const { data: r } = await supabase.from("user_roles").select("role").eq("user_id", userId).maybeSingle();
      const roleVal = r?.role as string;
      const finalRole = (roleVal === "calon_petani" ? "pembeli" : roleVal) as AppRole;
      setRole(finalRole ?? "pembeli");
    } catch (err) {
      console.error("Error loading user role, defaulting to pembeli:", err);
      setRole("pembeli");
    }

    // 2. Load profile safely
    try {
      const { data: p, error } = await supabase
        .from("profiles")
        .select("full_name, phone, address, experience, focus_area, certification, bio, ktp_number, ktp_photo, avatar_url")
        .eq("id", userId)
        .maybeSingle();

      if (error || !p) {
        // Fallback query without custom fields
        const { data: stdP } = await supabase
          .from("profiles")
          .select("full_name, phone, address")
          .eq("id", userId)
          .maybeSingle();

        if (stdP) {
          setProfile({
            full_name: stdP.full_name,
            phone: stdP.phone,
            address: stdP.address,
            experience: "-",
            focus_area: "-",
            certification: "-",
            bio: "-",
            ktp_number: "-",
            ktp_photo: "-",
            avatar_url: ""
          });
        } else {
          setProfile(null);
        }
      } else {
        setProfile(p as any);
      }
    } catch (e) {
      // Final fallback query
      const { data: stdP } = await supabase
        .from("profiles")
        .select("full_name, phone, address")
        .eq("id", userId)
        .maybeSingle();

      if (stdP) {
        setProfile({
          full_name: stdP.full_name,
          phone: stdP.phone,
          address: stdP.address,
          experience: "-",
          focus_area: "-",
          certification: "-",
          bio: "-",
          ktp_number: "-",
          ktp_photo: "-",
          avatar_url: ""
        });
      } else {
        setProfile(null);
      }
    }
  }

  async function signOut() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("panenku_login_time");
    }
    await supabase.auth.signOut();
  }

  return (
    <AuthCtx.Provider value={{ session, user: session?.user ?? null, role, profile, loading, signOut }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const v = useContext(AuthCtx);
  if (!v) throw new Error("useAuth must be inside <AuthProvider>");
  return v;
}
