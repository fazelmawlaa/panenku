import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Sprout, Mail, Lock, User, Phone, MapPin, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth, type AppRole } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Masuk / Daftar — PANENKU" }] }),
  component: AuthPage,
});

const emailSchema = z.string().trim().email("Email tidak valid").max(255);
const passwordSchema = z.string().min(8, "Minimal 8 karakter").max(72);
const nameSchema = z.string().trim().min(2, "Minimal 2 karakter").max(100);

function redirectFor(role: AppRole | null) {
  return role === "petani" ? "/farmer" : "/dashboard";
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4">
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.4-1.7 4-5.5 4-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.6 14.6 2.7 12 2.7 6.9 2.7 2.7 6.9 2.7 12s4.2 9.3 9.3 9.3c5.4 0 8.9-3.8 8.9-9.1 0-.6-.1-1.1-.2-1.6H12z"/>
    </svg>
  );
}

function AuthPage() {
  const navigate = useNavigate();
  const { session, role, loading } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [submitting, setSubmitting] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupRole, setSignupRole] = useState<AppRole>("customer");

  useEffect(() => {
    if (!loading && session) {
      navigate({ to: redirectFor(role), replace: true });
    }
  }, [loading, session, role, navigate]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    try {
      emailSchema.parse(loginEmail);
      passwordSchema.parse(loginPassword);
    } catch (err: any) {
      toast.error(err.errors?.[0]?.message ?? "Periksa input Anda");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Berhasil masuk");
    // redirect handled by useEffect once role loads
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    try {
      nameSchema.parse(name);
      emailSchema.parse(signupEmail);
      passwordSchema.parse(signupPassword);
    } catch (err: any) {
      toast.error(err.errors?.[0]?.message ?? "Periksa input Anda");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: name, phone, address, role: signupRole },
      },
    });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Akun berhasil dibuat");
  }

  async function handleGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
    if (result.error) toast.error("Gagal masuk dengan Google");
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left: brand panel */}
      <div className="hidden lg:flex flex-col justify-between p-10 gradient-leaf text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_20%,white,transparent_50%)]" />
        <Link to="/" className="flex items-center gap-2 relative">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/20 backdrop-blur"><Sprout className="h-5 w-5" /></div>
          <div className="font-display text-xl font-bold">PANENKU</div>
        </Link>
        <div className="relative space-y-3">
          <h2 className="font-display text-4xl font-bold leading-tight">Dari Petani,<br />Untuk Indonesia 🌱</h2>
          <p className="text-white/85 max-w-md">Bergabunglah dengan ribuan petani dan pembeli yang mendukung pertanian berkelanjutan di seluruh nusantara.</p>
        </div>
        <div className="relative text-xs text-white/70">© 2026 PANENKU</div>
      </div>

      {/* Right: form panel */}
      <div className="flex flex-col">
        <div className="p-4 sm:p-6">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Kembali ke beranda
          </Link>
        </div>
        <div className="flex-1 grid place-items-center px-4 pb-10">
          <div className="w-full max-w-md">
            <div className="lg:hidden flex items-center gap-2 mb-6 justify-center">
              <div className="grid h-10 w-10 place-items-center rounded-xl gradient-leaf"><Sprout className="h-5 w-5 text-white" /></div>
              <div className="font-display text-xl font-bold">PANENKU</div>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-bold mb-1">Selamat datang</h1>
            <p className="text-sm text-muted-foreground mb-6">Masuk atau buat akun untuk melanjutkan.</p>

            <Tabs value={mode} onValueChange={(v) => setMode(v as any)}>
              <TabsList className="grid grid-cols-2 w-full rounded-full p-1 h-auto">
                <TabsTrigger value="login" className="rounded-full">Masuk</TabsTrigger>
                <TabsTrigger value="signup" className="rounded-full">Daftar</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <Field id="lemail" label="Email" icon={Mail}>
                    <Input id="lemail" type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="kamu@email.com" autoComplete="email" required />
                  </Field>
                  <Field id="lpass" label="Password" icon={Lock}>
                    <Input id="lpass" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" required />
                  </Field>
                  <Button type="submit" className="w-full rounded-full" disabled={submitting}>
                    {submitting ? "Memproses…" : "Masuk"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-6">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Saya mendaftar sebagai</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <RoleChip selected={signupRole === "customer"} onClick={() => setSignupRole("customer")} label="Pembeli" emoji="🛒" desc="Belanja hasil panen" />
                      <RoleChip selected={signupRole === "petani"} onClick={() => setSignupRole("petani")} label="Petani" emoji="🌾" desc="Jual hasil panen" />
                    </div>
                  </div>
                  <Field id="sname" label="Nama lengkap" icon={User}>
                    <Input id="sname" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama lengkap" autoComplete="name" required />
                  </Field>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field id="sphone" label="No. HP" icon={Phone}>
                      <Input id="sphone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08xxxxxxxxxx" autoComplete="tel" />
                    </Field>
                    <Field id="saddr" label="Alamat" icon={MapPin}>
                      <Input id="saddr" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Kota / Kab." autoComplete="address-level2" />
                    </Field>
                  </div>
                  <Field id="semail" label="Email" icon={Mail}>
                    <Input id="semail" type="email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} placeholder="kamu@email.com" autoComplete="email" required />
                  </Field>
                  <Field id="spass" label="Password" icon={Lock}>
                    <Input id="spass" type="password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} placeholder="Min. 8 karakter" autoComplete="new-password" required />
                  </Field>
                  <Button type="submit" className="w-full rounded-full" disabled={submitting}>
                    {submitting ? "Memproses…" : "Daftar"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
              <div className="h-px flex-1 bg-border" /> atau lanjutkan dengan <div className="h-px flex-1 bg-border" />
            </div>

            <Button type="button" variant="outline" className="w-full rounded-full gap-2" onClick={handleGoogle}>
              <GoogleIcon /> Google
            </Button>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Dengan melanjutkan, Anda menyetujui Syarat Layanan dan Kebijakan Privasi PANENKU.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ id, label, icon: Icon, children }: { id: string; label: string; icon: any; children: ReactNodeChildren }) {
  return (
    <div>
      <Label htmlFor={id} className="text-sm font-medium mb-1.5 block">{label}</Label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <div className="[&_input]:pl-9">{children}</div>
      </div>
    </div>
  );
}

type ReactNodeChildren = React.ReactNode;

function RoleChip({ selected, onClick, label, emoji, desc }: { selected: boolean; onClick: () => void; label: string; emoji: string; desc: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-2xl border p-3 transition ${
        selected ? "border-primary bg-primary/5 ring-2 ring-primary/30" : "border-border hover:bg-muted/60"
      }`}
    >
      <div className="text-xl mb-0.5">{emoji}</div>
      <div className="font-medium text-sm">{label}</div>
      <div className="text-[11px] text-muted-foreground">{desc}</div>
    </button>
  );
}
