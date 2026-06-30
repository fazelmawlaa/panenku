import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { Mail, Lock, User, Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react";
import logoPanenku from "@/assets/logo_panenku.png";
import farmingBg from "@/assets/farming_bg.png";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Masuk — PANENKU+" },
      { name: "description", content: "Masuk ke akun PANENKU+ Anda untuk mengakses semua fitur agritech belajar, bertani, panen, & sirkular limbah." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState<"customer" | "farmer">("customer");

  const { login, register, isLoggedIn, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      navigate({ to: "/" });
    }
  }, [isLoggedIn, isLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const result = await login(loginEmail, loginPassword);
      if (result.success) {
        navigate({ to: "/" });
      } else {
        setError(result.error || "Login gagal");
      }
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (regPassword.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await register(regName, regEmail, regPassword, regRole);
      if (result.success) {
        navigate({ to: "/" });
      } else {
        setError(result.error || "Registrasi gagal");
      }
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f4f5f1] font-['Inter',sans-serif] relative overflow-hidden">
      
      {/* DEKORASI BACKGROUND TIPIS (BACKGROUND PATTERNS & BLOBS) */}
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{ backgroundImage: "radial-gradient(#1a2b1b 1.5px, transparent 1.5px)", backgroundSize: "28px 28px" }} />
      <div className="absolute top-[10%] left-[-15%] w-[45vw] h-[45vw] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-15%] w-[45vw] h-[45vw] rounded-full bg-[#b4f05a]/5 blur-[120px] pointer-events-none" />

      {/* Left side — Farming background with rounded border card style */}
      <div className="hidden lg:flex lg:w-1/2 p-6 h-screen relative">
        <div className="w-full h-full rounded-[2.5rem] overflow-hidden shadow-2xl relative">
          <img
            src={farmingBg}
            alt="Petani Indonesia"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/55" />
          
          {/* Overlay text on background */}
          <div className="absolute bottom-12 left-12 right-12 z-10 text-white space-y-2 text-left">
            <h3 className="font-['Plus_Jakarta_Sans',sans-serif] text-3xl font-bold tracking-tight">
              Belajar, Bertani, Panen,<br />
              dan <span className="font-['Playfair_Display',serif] italic font-light text-[#b4f05a]">Berkembang Bersama</span>
            </h3>
            <p className="text-xs text-white/80 font-light leading-relaxed max-w-sm">
              Bergabunglah bersama ribuan petani mandiri dan pelaku usaha sukses dalam ekosistem digital PANENKU+.
            </p>
          </div>
        </div>
      </div>

      {/* Right side — Form */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Top bar */}
        <div className="flex items-center px-8 py-6">
          <Link
            to="/onboarding"
            className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-5 py-2.5 text-xs font-bold hover:bg-primary/20 transition uppercase tracking-wider shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Beranda
          </Link>
        </div>

        {/* Form container */}
        <div className="flex-1 flex items-center justify-center px-6 sm:px-12 pb-12">
          <div className="w-full max-w-md bg-white border border-border/40 p-8 sm:p-10 rounded-[2.5rem] shadow-lg relative">
            {/* Subtle glow filter inside card */}
            <div className="absolute top-0 right-0 w-44 h-44 rounded-full bg-[#b4f05a]/5 blur-2xl pointer-events-none" />

            {/* Logo and Brand Info */}
            <div className="flex flex-col items-center text-center mb-6">
              <img
                src={logoPanenku}
                alt="PANENKU Logo"
                className="h-28 w-28 object-contain mb-1"
              />
              <h2 className="font-['Plus_Jakarta_Sans',sans-serif] text-2xl font-black text-primary leading-none tracking-tight">
                PANENKU+
              </h2>
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-1">
                Dari Belajar Bertani Hingga Menjual Hasil Panen
              </p>
            </div>

            {/* Title */}
            <div className="text-center mb-6">
              <h1 className="font-['Plus_Jakarta_Sans',sans-serif] text-3xl font-extrabold text-foreground tracking-tight">
                {tab === "login" ? "Masuk" : "Daftar"}
              </h1>
              <p className="mt-1.5 text-muted-foreground text-xs font-light">
                {tab === "login"
                  ? "Selamat datang kembali di ekosistem tani kami!"
                  : "Buat akun baru untuk mulai belajar & bertani bersama"}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-xs text-destructive text-left font-medium">
                {error}
              </div>
            )}

            {/* Forms */}
            {tab === "login" ? (
              <form onSubmit={handleLogin} className="space-y-4 text-left">
                <div className="space-y-1.5">
                  <Label htmlFor="login-email" className="text-xs font-bold text-muted-foreground uppercase">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Tulis Email Anda"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      className="pl-11 h-11.5 rounded-xl border-border/50 bg-[#e9eae6]/30 focus:bg-background focus:ring-primary focus:border-primary transition"
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="login-password" className="text-xs font-bold text-muted-foreground uppercase">
                    Kata Sandi
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Tulis Kata sandi Anda"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      className="pl-11 pr-11 h-11.5 rounded-xl border-border/50 bg-[#e9eae6]/30 focus:bg-background focus:ring-primary focus:border-primary transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11.5 rounded-full bg-primary hover:bg-primary-hover text-white text-xs uppercase tracking-wider font-bold shadow-soft mt-3 transition duration-300"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Masuk
                </Button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4 text-left">
                <div className="space-y-1.5">
                  <Label htmlFor="reg-name" className="text-xs font-bold text-muted-foreground uppercase">
                    Nama Lengkap
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="reg-name"
                      type="text"
                      placeholder="Nama lengkap Anda"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      required
                      className="pl-11 h-11.5 rounded-xl border-border/50 bg-[#e9eae6]/30 focus:bg-background focus:ring-primary focus:border-primary transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reg-email" className="text-xs font-bold text-muted-foreground uppercase">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="nama@email.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      required
                      className="pl-11 h-11.5 rounded-xl border-border/50 bg-[#e9eae6]/30 focus:bg-background focus:ring-primary focus:border-primary transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reg-password" className="text-xs font-bold text-muted-foreground uppercase">
                    Kata Sandi
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="reg-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Minimal 6 karakter"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                      minLength={6}
                      className="pl-11 pr-11 h-11.5 rounded-xl border-border/50 bg-[#e9eae6]/30 focus:bg-background focus:ring-primary focus:border-primary transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground uppercase">Daftar Sebagai</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRegRole("customer")}
                      className={`rounded-xl border py-2.5 text-xs font-bold transition ${regRole === "customer"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/60 bg-[#e9eae6]/20 hover:bg-muted text-muted-foreground"
                        }`}
                    >
                      🛒 Calon Petani / Pembeli
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegRole("farmer")}
                      className={`rounded-xl border py-2.5 text-xs font-bold transition ${regRole === "farmer"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/60 bg-[#e9eae6]/20 hover:bg-muted text-muted-foreground"
                        }`}
                    >
                      🌾 Petani Ahli
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11.5 rounded-full bg-primary hover:bg-primary-hover text-white text-xs uppercase tracking-wider font-bold shadow-soft mt-3 transition duration-300"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Daftar Sekarang
                </Button>
              </form>
            )}

            {/* Switch tab */}
            <p className="mt-6 text-center text-xs text-muted-foreground">
              {tab === "login" ? (
                <>
                  belum punya akun?{" "}
                  <button
                    onClick={() => { setTab("register"); setError(""); }}
                    className="font-bold text-primary hover:underline ml-1"
                  >
                    Daftar sekarang
                  </button>
                </>
              ) : (
                <>
                  sudah punya akun?{" "}
                  <button
                    onClick={() => { setTab("login"); setError(""); }}
                    className="font-bold text-primary hover:underline ml-1"
                  >
                    Masuk
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
