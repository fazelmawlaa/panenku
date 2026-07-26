import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  ShoppingCart, User, Menu, X, LogOut,
  BookOpen, LayoutDashboard, Sprout, MapPin,
} from "lucide-react";
import logoPanenku from "@/assets/logo_panenku.png";
import { useState, useEffect, lazy, Suspense, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

// Lazy-load heavy modals — only bundled/mounted when actually opened
const ProfileModal = lazy(() => import("@/components/ProfileModal").then(m => ({ default: m.ProfileModal })));
const AddressModal = lazy(() => import("@/components/AddressModal").then(m => ({ default: m.AddressModal })));

// Re-export helpers from indonesia-regions so existing imports don't break
export { localIndonesiaData, normalizeName, getLocalProvinceData, getLocalCityData, getLocalSubdistrictData } from "@/lib/indonesia-regions";

const nav = [
  { to: "/products", label: "Marketplace", icon: BookOpen },
  { to: "/consultations", label: "Konsultasi", icon: Sprout },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
] as const;

export function CustomerLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  // Modal visibility — only open state lives here, heavy components lazy loaded
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);

  // Header avatar from localStorage
  const [headerAvatar, setHeaderAvatar] = useState("");

  useEffect(() => {
    if (user?.id) {
      const localAvatar = localStorage.getItem(`panenku_avatar_${user.id}`);
      if (localAvatar) setHeaderAvatar(localAvatar);
    }
  }, [user]);

  // Disable body scroll when a modal is open
  useEffect(() => {
    document.body.style.overflow = showProfileModal || showAddressModal ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showProfileModal, showAddressModal]);

  // Reset scroll position on navigation
  useEffect(() => {
    const resetScroll = () => {
      document.documentElement.scrollLeft = 0;
      document.body.scrollLeft = 0;
      window.scrollTo(0, 0);
    };
    resetScroll();
    const timer = setTimeout(resetScroll, 100);
    return () => clearTimeout(timer);
  }, [path]);

  const handleLogout = async () => {
    await logout();
    toast.success("Berhasil keluar dari akun.");
    navigate({ to: "/onboarding" });
  };

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f5f1] font-['Inter',sans-serif] overflow-x-hidden">
      {/* HEADER */}
      <header className="sticky top-0 z-45 w-full border-b border-border/30 bg-white/90 select-none" style={{ transform: "translateZ(0)" }}>
        <div className="mx-auto max-w-full px-4 sm:px-8 md:px-12 py-3.5 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center">
            <img src={logoPanenku} alt="PANENKU" className="h-10 sm:h-12 object-contain" />
          </Link>

          <nav className="hidden lg:flex items-center gap-1.5">
            {nav.map((n) => {
              const active = (n.to as string) === "/" ? path === "/" : path.startsWith(n.to);
              const Icon = n.icon;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-2 ${active ? "bg-primary text-white shadow-soft" : "text-foreground/75 hover:bg-secondary hover:text-foreground"}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{n.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Desktop right side */}
          <div className="hidden lg:flex items-center gap-4">
            <Link
              to="/cart"
              className={`relative grid h-10 w-10 place-items-center rounded-full border border-border/40 hover:bg-secondary/40 transition shadow-sm ${path === "/cart" ? "bg-primary/10 text-primary border-primary/20" : "bg-white text-muted-foreground hover:text-foreground"}`}
            >
              <ShoppingCart className="h-4 w-4" />
            </Link>

            {isLoggedIn && user ? (
              <div className="relative group select-none">
                <div className="flex items-center gap-3 cursor-pointer py-1.5 px-3.5 hover:bg-secondary/40 rounded-full border border-transparent hover:border-border/10 transition-all duration-200">
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-primary text-white font-black text-xs shadow-sm overflow-hidden">
                    {headerAvatar ? (
                      <img src={headerAvatar} alt="Avatar" className="h-full w-full object-cover" />
                    ) : initial}
                  </div>
                  <div className="hidden xl:flex flex-col text-left leading-none">
                    <span className="text-xs font-bold text-foreground mb-0.5">{user.name}</span>
                    <span className="text-[8px] font-bold text-emerald-800 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {user.role === "petani" ? "PENJUAL" : "PEMBELI"}
                    </span>
                  </div>
                </div>

                {/* Dropdown */}
                <div className="absolute right-0 top-full pt-1.5 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50 w-[240px]">
                  <div className="bg-white border border-border/40 rounded-2xl shadow-xl p-3 text-left space-y-1.5">
                    <div className="px-3 py-2 border-b border-border/10 pb-2">
                      <div className="text-xs font-black text-foreground leading-tight truncate">{user.name}</div>
                      <div className="text-[9px] text-muted-foreground leading-tight truncate mt-0.5">{user.email}</div>
                    </div>

                    <button onClick={() => setShowProfileModal(true)} className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold hover:bg-secondary text-foreground/80 hover:text-foreground transition text-left">
                      <User className="h-4 w-4 text-primary shrink-0" />
                      <span>Edit Profil</span>
                    </button>

                    <button onClick={() => setShowAddressModal(true)} className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold hover:bg-secondary text-foreground/80 hover:text-foreground transition text-left">
                      <MapPin className="h-4 w-4 text-primary shrink-0" />
                      <span>Alamat Pengiriman</span>
                    </button>

                    <button onClick={handleLogout} className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold hover:bg-destructive/10 text-destructive transition text-left mt-1 pt-2 border-t border-border/10">
                      <LogOut className="h-4 w-4 shrink-0" />
                      <span>Keluar Sesi</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link to="/login">
                <Button size="sm" className="rounded-full gap-2 px-5">
                  <User className="h-4 w-4" /> Masuk
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile right side */}
          <div className="flex items-center gap-2 lg:hidden">
            <Link
              to="/cart"
              className={`relative grid h-10 w-10 place-items-center rounded-full border border-border/40 hover:bg-secondary/40 transition shadow-sm ${path === "/cart" ? "bg-primary/10 text-primary border-primary/20" : "bg-white text-muted-foreground hover:text-foreground"}`}
            >
              <ShoppingCart className="h-4 w-4" />
            </Link>
            <button onClick={() => setOpen(!open)} className="grid h-10 w-10 place-items-center rounded-full hover:bg-muted">
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav dropdown */}
        {open && (
          <div className="lg:hidden border border-white/30 rounded-[2rem] bg-white/95 mt-3 p-3 flex flex-col gap-1 shadow-lg mx-4 mb-3">
            {nav.map((n) => {
              const Icon = n.icon;
              return (
                <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-muted flex items-center gap-2 text-foreground/80">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{n.label}</span>
                </Link>
              );
            })}
            {isLoggedIn && user ? (
              <>
                <button onClick={() => { setOpen(false); setShowProfileModal(true); }} className="rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-muted flex items-center gap-2 text-foreground/80 text-left">
                  <User className="h-4 w-4 shrink-0" /><span>Edit Profil</span>
                </button>
                <button onClick={() => { setOpen(false); setShowAddressModal(true); }} className="rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-muted flex items-center gap-2 text-foreground/80 text-left">
                  <MapPin className="h-4 w-4 shrink-0" /><span>Alamat Pengiriman</span>
                </button>
                <button onClick={() => { setOpen(false); handleLogout(); }} className="rounded-xl px-4 py-2.5 text-sm font-bold hover:bg-destructive/10 text-destructive text-left flex items-center gap-2">
                  <LogOut className="h-4 w-4 shrink-0" /><span>Keluar ({user.name})</span>
                </button>
              </>
            ) : null}
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      {/* Lazy-mounted modals — zero cost when not opened */}
      <Suspense fallback={null}>
        {showProfileModal && (
          <ProfileModal
            user={user}
            onClose={() => setShowProfileModal(false)}
          />
        )}
        {showAddressModal && user?.id && (
          <AddressModal
            userId={user.id}
            onClose={() => setShowAddressModal(false)}
          />
        )}
      </Suspense>
    </div>
  );
}
