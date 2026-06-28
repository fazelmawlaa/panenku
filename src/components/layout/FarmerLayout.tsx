import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Package, PlusCircle, CalendarDays, ClipboardList,
  FileSignature, Wallet, Recycle, UserCircle, Sprout, ArrowLeft, Menu, X,
} from "lucide-react";
import { useState, type ReactNode } from "react";

const menu = [
  { to: "/farmer", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/farmer/products", label: "Produk", icon: Package },
  { to: "/farmer/products/add", label: "Tambah Produk", icon: PlusCircle },
  { to: "/farmer/harvest", label: "Prediksi Panen", icon: CalendarDays },
  { to: "/farmer/orders", label: "Pesanan", icon: ClipboardList },
  { to: "/farmer/contracts", label: "Kontrak Digital", icon: FileSignature },
  { to: "/farmer/finance", label: "Keuangan", icon: Wallet },
  { to: "/farmer/waste", label: "Limbah Pertanian", icon: Recycle },
  { to: "/farmer/profile", label: "Profil", icon: UserCircle },
] as const;

export function FarmerLayout({ children, title }: { children: ReactNode; title: string }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-secondary/30">
      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 z-40 h-screen w-72 shrink-0 border-r border-border/50 bg-background transition-transform ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex h-full flex-col">
          <Link to="/" className="flex items-center gap-2 px-6 py-5 border-b border-border/50">
            <div className="grid h-9 w-9 place-items-center rounded-xl gradient-leaf shadow-soft">
              <Sprout className="h-5 w-5 text-white" />
            </div>
            <div className="leading-tight">
              <div className="font-display font-bold">PANENKU</div>
              <div className="text-[10px] text-muted-foreground -mt-0.5">Dashboard Petani</div>
            </div>
          </Link>

          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {menu.map((m) => {
              const active = m.exact ? path === m.to : path === m.to || path.startsWith(m.to + "/");
              const Icon = m.icon;
              return (
                <Link
                  key={m.to}
                  to={m.to}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    active ? "bg-primary text-primary-foreground shadow-soft" : "text-foreground/70 hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{m.label}</span>
                </Link>
              );
            })}
          </nav>

          <Link to="/" className="m-3 flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted">
            <ArrowLeft className="h-4 w-4" /> Kembali ke Beranda
          </Link>
        </div>
      </aside>

      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Main */}
      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border/40 bg-background/80 backdrop-blur-xl px-4 sm:px-8 py-4">
          <button onClick={() => setOpen(true)} className="lg:hidden grid h-9 w-9 place-items-center rounded-lg hover:bg-muted">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <h1 className="font-display text-xl font-bold truncate">{title}</h1>
        </header>
        <div className="p-4 sm:p-8">{children}</div>
      </div>
    </div>
  );
}
