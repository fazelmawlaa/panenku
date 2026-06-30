<<<<<<< HEAD
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { ShoppingCart, User, Search, Menu, X, LogOut } from "lucide-react";
import logoPanenku from "@/assets/logo_panenku.png";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
=======
import { Link, useRouterState } from "@tanstack/react-router";
import { ShoppingCart, Sprout, User, Search, Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
>>>>>>> 1fc4c8c6e2c496da55c449d48f785ee9053f9c3b

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
<<<<<<< HEAD
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/onboarding" });
  };

  // Dynamically filter nav items based on role
  const activeNav = isLoggedIn && user?.role === "customer"
    ? nav.filter((n) => n.to !== "/farmer")
    : nav;
=======
  const { session, role, profile, user, signOut } = useAuth();
  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Akun";
  const initial = displayName.charAt(0).toUpperCase();

>>>>>>> 1fc4c8c6e2c496da55c449d48f785ee9053f9c3b

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f5f1] font-['Inter',sans-serif]">
      <header className="sticky top-0 z-40 border-b border-border/40 bg-[#f4f5f1]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-3">
            <img src={logoPanenku} alt="PANENKU+ Logo" className="h-11 w-11 rounded-xl object-contain bg-white/20 p-1" />
            <div className="leading-tight text-left">
              <div className="font-['Plus_Jakarta_Sans',sans-serif] text-xl font-black tracking-tight text-primary">PANENKU+</div>
              <div className="text-xs text-muted-foreground font-medium -mt-0.5">Dari Petani, Untuk Indonesia</div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {activeNav.map((n) => {
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
<<<<<<< HEAD

            {isLoggedIn && user ? (
              <div className="flex items-center gap-2 ml-1">
                <div className="grid h-9 w-9 place-items-center rounded-full gradient-leaf text-white font-semibold text-sm">
                  {user.name[0].toUpperCase()}
                </div>
                <div className="hidden xl:block leading-tight text-left">
                  <div className="text-sm font-medium">{user.name}</div>
                  <div className="text-[10px] text-muted-foreground capitalize">{user.role}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="grid h-9 w-9 place-items-center rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition"
                  title="Keluar"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link to="/login">
=======
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="grid h-10 w-10 place-items-center rounded-full gradient-leaf text-white text-sm font-bold shadow-soft">
                    {initial}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="flex flex-col gap-0.5">
                    <span className="font-semibold truncate">{displayName}</span>
                    <span className="text-xs font-normal text-muted-foreground truncate">{user?.email}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={role === "petani" ? "/farmer" : "/dashboard"} className="gap-2 cursor-pointer">
                      <LayoutDashboard className="h-4 w-4" /> {role === "petani" ? "Dashboard Petani" : "Dashboard"}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="h-4 w-4" /> Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
>>>>>>> 1fc4c8c6e2c496da55c449d48f785ee9053f9c3b
                <Button size="sm" className="rounded-full gap-2">
                  <User className="h-4 w-4" /> Masuk
                </Button>
              </Link>
            )}
          </div>

          <button onClick={() => setOpen(!open)} className="lg:hidden grid h-10 w-10 place-items-center rounded-full hover:bg-muted">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div className="lg:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl">
            <div className="mx-auto max-w-7xl px-4 py-3 flex flex-col gap-1">
              {activeNav.map((n) => (
                <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-muted">
                  {n.label}
                </Link>
              ))}
              <Link to="/cart" onClick={() => setOpen(false)} className="rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-muted">Keranjang</Link>
              {isLoggedIn && user ? (
                <button
                  onClick={() => { setOpen(false); handleLogout(); }}
                  className="rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-destructive/10 text-destructive text-left"
                >
                  Keluar ({user.name})
                </button>
              ) : null}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-20 border-t border-border/40 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 grid gap-10 md:grid-cols-4 text-left">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img src={logoPanenku} alt="PANENKU+ Logo" className="h-11 w-11 rounded-xl object-contain bg-muted p-1" />
              <div className="font-['Plus_Jakarta_Sans',sans-serif] text-xl font-black">PANENKU+</div>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md font-light leading-relaxed">
              Platform digital agritech terintegrasi. Pendampingan belajar bersama praktisi agronomis, pasar pre-order komoditas segar, dan ekonomi sirkular limbah tani.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-3 text-xs uppercase tracking-wider text-primary">Platform</h4>
            <ul className="space-y-2 text-xs text-muted-foreground font-light">
              <li><Link to="/products" className="hover:text-primary transition">Katalog Produk</Link></li>
              <li><Link to="/waste" className="hover:text-primary transition">Limbah Pertanian</Link></li>
              <li><Link to="/farmer" className="hover:text-primary transition">Untuk Petani</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-3 text-xs uppercase tracking-wider text-primary">Perusahaan</h4>
            <ul className="space-y-2 text-xs text-muted-foreground font-light">
              <li>Tentang Kami</li>
              <li>Karir</li>
              <li>Kontak</li>
              <li>Kebijakan Privasi</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border/30 py-5 text-center text-xs text-muted-foreground font-light">
          © 2026 PANENKU+. Semua hak dilindungi. 🌱 Pertanian Berkelanjutan & Sirkular.
        </div>
      </footer>
    </div>
  );
}
