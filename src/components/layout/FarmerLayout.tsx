import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Package, PlusCircle, CalendarDays, ClipboardList,
<<<<<<< HEAD
  FileSignature, Wallet, Recycle, UserCircle, ArrowLeft, Menu, X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import logoPanenku from "@/assets/logo_panenku.png";
=======
  FileSignature, Wallet, Recycle, UserCircle, Sprout, ArrowLeft, Menu, X, LogOut,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { RequireRole } from "@/components/RequireRole";
import { useAuth } from "@/hooks/use-auth";
>>>>>>> 1fc4c8c6e2c496da55c449d48f785ee9053f9c3b

type MenuItem = { to: string; label: string; icon: any; exact?: boolean };
const menu: MenuItem[] = [
  { to: "/farmer", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/farmer/products", label: "Produk", icon: Package },
  { to: "/farmer/products/add", label: "Tambah Produk", icon: PlusCircle },
  { to: "/farmer/harvest", label: "Prediksi Panen", icon: CalendarDays },
  { to: "/farmer/orders", label: "Pesanan", icon: ClipboardList },
  { to: "/farmer/contracts", label: "Kontrak Digital", icon: FileSignature },
  { to: "/farmer/finance", label: "Keuangan", icon: Wallet },
  { to: "/farmer/waste", label: "Limbah Pertanian", icon: Recycle },
  { to: "/farmer/profile", label: "Profil", icon: UserCircle },
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

  return (
    <div className="min-h-screen flex bg-[#f4f5f1] font-['Inter',sans-serif] relative overflow-hidden">
      {/* DEKORASI BACKGROUND TIPIS (BACKGROUND PATTERNS & BLOBS) */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{ backgroundImage: "radial-gradient(#1a2b1b 1.5px, transparent 1.5px)", backgroundSize: "28px 28px" }} />

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 z-40 h-screen w-72 shrink-0 border-r border-border/40 bg-white transition-transform duration-300 relative z-20 ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex h-full flex-col">
          <Link to="/" className="flex items-center gap-3 px-6 py-5 border-b border-border/40">
            <img src={logoPanenku} alt="PANENKU+ Logo" className="h-10 w-10 rounded-xl object-contain bg-muted p-1" />
            <div className="leading-tight text-left">
              <div className="font-['Plus_Jakarta_Sans',sans-serif] text-lg font-black tracking-tight text-primary">PANENKU+</div>
              <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider -mt-0.5">Dashboard Petani</div>
            </div>
          </Link>

          <nav className="flex-1 overflow-y-auto p-4 space-y-1.5">
            {menu.map((m) => {
              const active = m.exact ? path === m.to : path === m.to || path.startsWith(m.to + "/");
              const Icon = m.icon;
              return (
                <Link
                  key={m.to}
                  to={m.to}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-xs uppercase tracking-wider font-bold transition duration-200 ${
                    active ? "bg-primary text-white shadow-soft" : "text-foreground/75 hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{m.label}</span>
                </Link>
              );
            })}
          </nav>

<<<<<<< HEAD
          <Link to="/" className="m-4 flex items-center gap-2 rounded-xl px-4 py-3 text-xs uppercase tracking-wider font-bold text-muted-foreground hover:bg-secondary transition">
            <ArrowLeft className="h-4 w-4" /> Kembali ke Beranda
          </Link>
=======
          <div className="m-3 space-y-1">
            <div className="rounded-xl border border-border/60 p-3 flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl gradient-leaf text-white font-bold text-sm shrink-0">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate">{displayName}</div>
                <div className="text-[11px] text-muted-foreground truncate">{user?.email}</div>
              </div>
            </div>
            <button onClick={signOut} className="w-full flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10">
              <LogOut className="h-4 w-4" /> Keluar
            </button>
            <Link to="/" className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted">
              <ArrowLeft className="h-4 w-4" /> Kembali ke Beranda
            </Link>
          </div>
>>>>>>> 1fc4c8c6e2c496da55c449d48f785ee9053f9c3b
        </div>
      </aside>

      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col relative z-10">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border/40 bg-[#f4f5f1]/80 backdrop-blur-xl px-4 sm:px-8 py-4">
          <button onClick={() => setOpen(true)} className="lg:hidden grid h-9 w-9 place-items-center rounded-lg hover:bg-muted text-foreground">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <h1 className="font-['Plus_Jakarta_Sans',sans-serif] text-xl font-black text-foreground tracking-tight truncate">{title}</h1>
        </header>
        <div className="p-4 sm:p-8 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
