import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  (typeof process !== "undefined" ? process.env?.VITE_SUPABASE_URL : undefined) ||
  (import.meta.env?.VITE_SUPABASE_URL as string) ||
  "";

const supabaseAnonKey =
  (typeof process !== "undefined" ? process.env?.VITE_SUPABASE_ANON_KEY : undefined) ||
  (import.meta.env?.VITE_SUPABASE_ANON_KEY as string) ||
  "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase configuration is missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your env configuration.",
  );
}

const options: any = {};

if (typeof window === "undefined") {
  try {
    // Dynamically load 'ws' package on the server side to support Node 20
    const ws = await import("ws");
    options.realtime = {
      transport: ws.default || ws,
    };
  } catch (e) {
    console.warn("Failed to load 'ws' package for Supabase:", e);
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, options);
