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
  refreshSession: () => Promise<void>;
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

    // 2. Load profile safely (Only querying columns that are guaranteed to exist to avoid 400 Bad Request)
    try {
      const { data: p, error } = await supabase
        .from("profiles")
        .select("full_name, phone, address")
        .eq("id", userId)
        .maybeSingle();

      if (error || !p) {
        setProfile(null);
        return;
      }

      // Initialize default profile fields
      const parsedProfile: Profile = {
        full_name: p.full_name,
        phone: p.phone,
        address: p.address,
        experience: "-",
        focus_area: "-",
        certification: "-",
        bio: "-",
        ktp_number: "-",
        ktp_photo: "-",
        avatar_url: ""
      };

      // Sync local storage state and parse extra profile fields from profiles.address JSON
      const addressVal = p.address;
      if (addressVal && addressVal.trim().startsWith("{")) {
        try {
          const config = JSON.parse(addressVal);
          
          // Populate the parsedProfile with custom fields from JSON
          if (config.ktp_number) parsedProfile.ktp_number = config.ktp_number;
          if (config.ktp_photo) parsedProfile.ktp_photo = config.ktp_photo;
          if (config.experience) parsedProfile.experience = config.experience;
          if (config.certification) parsedProfile.certification = config.certification;
          if (config.bio) parsedProfile.bio = config.bio;
          if (config.focus_area) parsedProfile.focus_area = config.focus_area;
          if (config.avatar_url) parsedProfile.avatar_url = config.avatar_url;

          // Sync localStorage
          if (config.is_verified) {
            localStorage.setItem(`panenku_farmer_verified_${userId}`, "true");
          }
          
          const biodata = {
            ktpNumber: config.ktp_number || "",
            ktpPhoto: config.ktp_photo || "",
            ktpName: config.ktp_name || "",
            ktpAddress: config.ktp_address || "",
            birthPlaceDate: config.birth_place_date || "",
            gender: config.gender || "",
            phone: config.phone || "",
            location: config.addressText || "",
            experience: config.experience || "",
            certification: config.certification || "",
            bio: config.bio || "",
            focusArea: config.focus_area || ""
          };
          localStorage.setItem(`panenku_farmer_biodata_${userId}`, JSON.stringify(biodata));
          
          if (config.avatar_url) {
            localStorage.setItem(`panenku_avatar_${userId}`, config.avatar_url);
          }
        } catch (e) {
          console.warn("Failed to parse profiles.address JSON config", e);
        }
      }

      setProfile(parsedProfile);
    } catch (e) {
      console.error("Failed to load user profile:", e);
      setProfile(null);
    }
  }

  async function signOut() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("panenku_login_time");
    }
    await supabase.auth.signOut();
  }

  async function refreshSession() {
    if (session?.user?.id) {
      await loadUserData(session.user.id);
    }
  }

  return (
    <AuthCtx.Provider value={{ session, user: session?.user ?? null, role, profile, loading, signOut, refreshSession }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const v = useContext(AuthCtx);
  if (!v) throw new Error("useAuth must be inside <AuthProvider>");
  return v;
}
