import { Link, useRouterState } from "@tanstack/react-router";
import { ShoppingCart, Sprout, User, Search, Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const nav = [
  { to: "/", label: "Beranda" },
  { to: "/products", label: "Katalog" },
  { to: "/waste", label: "Limbah Pertanian" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/farmer", label: "Untuk Petani" },
] as const;

export function CustomerLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { session, role, profile, user, signOut } = useAuth();
  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Akun";
  const initial = displayName.charAt(0).toUpperCase();


  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl gradient-leaf shadow-soft">
              <Sprout className="h-5 w-5 text-white" />
            </div>
            <div className="leading-tight">
              <div className="font-display text-lg font-bold tracking-tight">PANENKU</div>
              <div className="text-[10px] text-muted-foreground -mt-0.5">Dari Petani, Untuk Indonesia</div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {nav.map((n) => {
              const active = n.to === "/" ? path === "/" : path.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    active ? "bg-primary/10 text-primary" : "text-foreground/70 hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <button className="grid h-10 w-10 place-items-center rounded-full hover:bg-muted">
              <Search className="h-4 w-4" />
            </button>
            <Link to="/cart" className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-muted">
              <ShoppingCart className="h-4 w-4" />
              <span className="absolute -top-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full bg-honey text-[10px] font-bold text-foreground">3</span>
            </Link>
            <Link to="/dashboard">
              <Button size="sm" className="rounded-full gap-2">
                <User className="h-4 w-4" /> Masuk
              </Button>
            </Link>
          </div>

          <button onClick={() => setOpen(!open)} className="lg:hidden grid h-10 w-10 place-items-center rounded-full hover:bg-muted">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div className="lg:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl">
            <div className="mx-auto max-w-7xl px-4 py-3 flex flex-col gap-1">
              {nav.map((n) => (
                <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-muted">
                  {n.label}
                </Link>
              ))}
              <Link to="/cart" onClick={() => setOpen(false)} className="rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-muted">Keranjang</Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-20 border-t border-border/40 bg-gradient-to-b from-background to-secondary/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="grid h-9 w-9 place-items-center rounded-xl gradient-leaf"><Sprout className="h-5 w-5 text-white" /></div>
              <div className="font-display text-lg font-bold">PANENKU</div>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              Marketplace hasil panen Indonesia berbasis pre-order dan pasokan langsung. Mendukung pertanian berkelanjutan dan ekonomi sirkular.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/products">Katalog Produk</Link></li>
              <li><Link to="/waste">Limbah Pertanian</Link></li>
              <li><Link to="/farmer">Untuk Petani</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Perusahaan</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Tentang Kami</li>
              <li>Karir</li>
              <li>Kontak</li>
              <li>Kebijakan Privasi</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border/40 py-5 text-center text-xs text-muted-foreground">
          © 2026 PANENKU. Semua hak dilindungi. 🌱 Pertanian Berkelanjutan.
        </div>
      </footer>
    </div>
  );
}
