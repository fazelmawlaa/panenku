import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { Mail, Lock, User, Loader2, Eye, EyeOff } from "lucide-react";
import logoPanenku from "@/assets/logo_panenku.png";
import farmingBg from "@/assets/farming_bg.png";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  defaultTab?: "login" | "register";
}

export function LoginModal({
  open,
  onOpenChange,
  onSuccess,
  defaultTab = "login",
}: LoginModalProps) {
  const [tab, setTab] = useState<"login" | "register">(defaultTab);
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
  const [regRole, setRegRole] = useState<"petani" | "pembeli">("pembeli");

  const { login, register } = useAuth();

  const resetForms = () => {
    setLoginEmail("");
    setLoginPassword("");
    setRegName("");
    setRegEmail("");
    setRegPassword("");
    setRegRole("pembeli");
    setError("");
    setShowPassword(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const result = await login(loginEmail, loginPassword);
      if (result.success) {
        resetForms();
        onOpenChange(false);
        onSuccess?.();
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
        resetForms();
        onOpenChange(false);
        onSuccess?.();
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
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) resetForms();
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden rounded-3xl border-0 shadow-glow">
        {/* Header with farming background */}
        <div className="relative px-8 pt-10 pb-8 text-center text-white overflow-hidden">
          <img
            src={farmingBg}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
          <div className="relative z-10">
            <div className="mx-auto mb-4">
              <img src={logoPanenku} alt="PANENKU Logo" className="h-16 mx-auto object-contain" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white drop-shadow-lg">
                {tab === "login"
                  ? "Selamat Datang Kembali"
                  : "Bergabung dengan PANENKU"}
              </DialogTitle>
            </DialogHeader>
            <p className="mt-1 text-sm text-white/90 drop-shadow-md">
              {tab === "login"
                ? "Masuk untuk akses semua fitur"
                : "Daftar gratis dan mulai bertransaksi"}
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-border/40 mx-6">
          <button
            onClick={() => {
              setTab("login");
              setError("");
            }}
            className={`flex-1 py-3 text-sm font-medium transition border-b-2 ${
              tab === "login"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Masuk
          </button>
          <button
            onClick={() => {
              setTab("register");
              setError("");
            }}
            className={`flex-1 py-3 text-sm font-medium transition border-b-2 ${
              tab === "register"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Daftar
          </button>
        </div>

        {/* Forms */}
        <div className="px-6 pb-6 pt-4">
          {error && (
            <div className="mb-4 rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {tab === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-sm font-medium">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="nama@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    className="pl-10 h-11 rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="login-password"
                  className="text-sm font-medium"
                >
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    className="pl-10 pr-10 h-11 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 rounded-xl shadow-glow"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Masuk
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reg-name" className="text-sm font-medium">
                  Nama Lengkap
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reg-name"
                    type="text"
                    placeholder="Nama lengkap"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                    className="pl-10 h-11 rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-email" className="text-sm font-medium">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="nama@email.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                    className="pl-10 h-11 rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimal 6 karakter"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                    minLength={6}
                    className="pl-10 pr-10 h-11 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground uppercase">Daftar Sebagai</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegRole("pembeli")}
                    className={`rounded-xl border p-2 text-center transition flex flex-col items-center justify-center gap-1 min-h-[70px] ${
                      regRole === "pembeli"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-[#e9eae6]/10 hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    <span className="text-lg">🛒</span>
                    <span className="text-[10px] font-bold uppercase tracking-tight">Pembeli</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole("petani")}
                    className={`rounded-xl border p-2 text-center transition flex flex-col items-center justify-center gap-1 min-h-[70px] ${
                      regRole === "petani"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-[#e9eae6]/10 hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    <span className="text-lg">🌾</span>
                    <span className="text-[10px] font-bold uppercase tracking-tight text-center leading-none">Penjual</span>
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 rounded-xl shadow-glow"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Daftar Sekarang
              </Button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
