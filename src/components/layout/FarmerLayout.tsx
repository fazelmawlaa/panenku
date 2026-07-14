import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard, Package, CalendarDays, ClipboardList,
  Wallet, Recycle, UserCircle, ArrowLeft, Menu, X, MessageSquare, LogOut, RefreshCw
} from "lucide-react";
import { useState, useEffect, type ReactNode } from "react";
import logoPanenku from "@/assets/logo_panenku.png";
import { RequireRole } from "@/components/RequireRole";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

type MenuItem = { to: string; label: string; icon: any; exact?: boolean };
const menu: MenuItem[] = [
  { to: "/farmer", label: "Dashboard Penjual", icon: LayoutDashboard, exact: true },
  { to: "/farmer/profile", label: "Profil Penjual & Ulasan", icon: UserCircle },
  { to: "/farmer/consultations", label: "Sesi Konsultasi", icon: MessageSquare },
  { to: "/farmer/products", label: "Marketplace Panen", icon: Package },
  { to: "/farmer/waste", label: "Limbah Pertanian", icon: Recycle },
  { to: "/farmer/orders", label: "Kelola Pesanan", icon: ClipboardList },
  { to: "/farmer/finance", label: "Analitik Pendapatan", icon: Wallet },
  { to: "/farmer/harvest", label: "Kalender Tanam & Panen", icon: CalendarDays },
];

export function FarmerLayout({ children, title }: { children: ReactNode; title: string }) {
  return (
    <RequireRole role="petani">
      <FarmerLayoutInner title={title}>{children}</FarmerLayoutInner>
    </RequireRole>
  );
}

function FarmerLayoutInner({ children, title }: { children: ReactNode; title: string }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const { profile, user, signOut } = useAuth();
  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Petani";
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    if (user) {
      const localAvatar = localStorage.getItem(`panenku_avatar_${user.id}`);
      if (localAvatar) {
        setAvatarUrl(localAvatar);
      }
    }
  }, [user]);

  useEffect(() => {
    const resetScroll = () => {
      const elements = document.querySelectorAll(".overflow-x-hidden");
      elements.forEach((el) => {
        if (el instanceof HTMLElement) {
          el.scrollLeft = 0;
        }
      });
      document.documentElement.scrollLeft = 0;
      document.body.scrollLeft = 0;
      window.scrollTo(0, 0);
    };
    resetScroll();
    requestAnimationFrame(resetScroll);
    const timer = setTimeout(resetScroll, 100);
    return () => clearTimeout(timer);
  }, [path]);

  return (
    <div className="min-h-screen bg-[#f4f5f1] font-['Inter',sans-serif] relative overflow-x-hidden">
      {/* DEKORASI BACKGROUND TIPIS (BACKGROUND PATTERNS & BLOBS) */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: "radial-gradient(#1a2b1b 1.5px, transparent 1.5px)", backgroundSize: "28px 28px" }} />
      <div className="absolute top-[5%] right-[-5%] w-[35vw] h-[35vw] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-[#b4f05a]/50 opacity-[0.07] blur-[130px] pointer-events-none" />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 h-screen w-72 shrink-0 border-r border-border/40 bg-white transition-transform duration-300 lg:fixed lg:left-0 lg:top-0 lg:bottom-0 ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
      >
        <div className="flex h-full flex-col">
          <Link to="/" className="flex items-center justify-center px-6 py-5 border-b border-border/40 w-full">
            <img src={logoPanenku} alt="PANENKU" className="h-18 object-contain" />
          </Link>

          <nav className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Group 1: Utama */}
            <div className="space-y-1">
              <div className="px-4 text-[9px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] mb-2 select-none">Utama</div>
              {menu.slice(0, 3).map((m, idx) => {
                const active = m.exact ? path === m.to : path === m.to || path.startsWith(m.to + "/");
                const Icon = m.icon;
                return (
                  <div key={m.to}>
                    <Link
                      to={m.to}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-xs uppercase tracking-wider font-bold transition duration-200 ${active ? "bg-primary text-white shadow-soft" : "text-foreground/75 hover:bg-secondary hover:text-foreground"
                        }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{m.label}</span>
                    </Link>
                    {idx < 2 && <div className="h-px bg-gray-100/80 my-1 mx-2" />}
                  </div>
                );
              })}
            </div>

            <div className="border-t border-border/30 my-4" />

            {/* Group 2: Penjualan & Layanan */}
            <div className="space-y-1">
              <div className="px-4 text-[9px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] mb-2 select-none">Penjualan & Layanan</div>
              {menu.slice(3, 7).map((m, idx) => {
                const active = m.exact ? path === m.to : path === m.to || path.startsWith(m.to + "/");
                const Icon = m.icon;
                return (
                  <div key={m.to}>
                    <Link
                      to={m.to}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-xs uppercase tracking-wider font-bold transition duration-200 ${active ? "bg-primary text-white shadow-soft" : "text-foreground/75 hover:bg-secondary hover:text-foreground"
                        }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{m.label}</span>
                    </Link>
                    {idx < 3 && <div className="h-px bg-gray-100/80 my-1 mx-2" />}
                  </div>
                );
              })}
            </div>

            <div className="border-t border-border/30 my-4" />

            {/* Group 3: Budidaya */}
            <div className="space-y-1">
              <div className="px-4 text-[9px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] mb-2 select-none">Budidaya</div>
              {menu.slice(7).map((m) => {
                const active = m.exact ? path === m.to : path === m.to || path.startsWith(m.to + "/");
                const Icon = m.icon;
                return (
                  <Link
                    key={m.to}
                    to={m.to}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-xs uppercase tracking-wider font-bold transition duration-200 ${active ? "bg-primary text-white shadow-soft" : "text-foreground/75 hover:bg-secondary hover:text-foreground"
                      }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{m.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Bottom Sidebar Profile Container */}
          <div className="border-t border-border/40 p-4 bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-secondary overflow-hidden shrink-0 border border-border/40 flex items-center justify-center text-foreground font-black text-sm shadow-sm">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                ) : (
                  <span>{displayName.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-foreground truncate">{displayName}</div>
                <div className="text-[9px] font-bold text-emerald-800 bg-emerald-500/10 px-1.5 py-0.5 rounded-full uppercase w-fit mt-0.5">Penjual (Seller)</div>
              </div>
              <button
                onClick={() => {
                  signOut();
                  toast.success("Berhasil keluar dari akun.");
                }}
                title="Keluar dari akun"
                className="grid h-8 w-8 place-items-center rounded-lg bg-white border border-border/40 text-destructive hover:bg-destructive/10 hover:border-destructive/20 transition-all duration-300 shadow-sm shrink-0"
              >
                <LogOut className="h-3.5 w-3.5 text-destructive" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col relative z-10 lg:pl-72 overflow-x-hidden">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border/40 bg-[#f4f5f1]/80 backdrop-blur-xl px-4 sm:px-8 py-4">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setOpen(true)} className="lg:hidden grid h-9 w-9 place-items-center rounded-lg hover:bg-muted text-foreground">
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <h1 className="font-['Plus_Jakarta_Sans',sans-serif] text-xl font-black text-foreground tracking-tight truncate">{title}</h1>
          </div>
        </header>
        <div className="p-4 sm:p-8 flex-1 overflow-x-hidden overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
