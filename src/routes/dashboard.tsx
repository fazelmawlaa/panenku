import { createFileRoute, Link } from "@tanstack/react-router";
import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { customerOrders, products, farmers, formatRupiah } from "@/lib/mock-data";
import { ShoppingBag, Wallet, Heart, TrendingUp, ArrowRight, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RequireRole } from "@/components/RequireRole";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — PANENKU" }] }),
  component: () => (
    <RequireRole role="customer">
      <Dashboard />
    </RequireRole>
  ),
});

function Dashboard() {
  const { profile, user } = useAuth();
  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Pengguna";
  const initial = displayName.charAt(0).toUpperCase();
  const recs = products.slice(0, 4);
  return (
    <CustomerLayout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-6">
        <div className="glass-card rounded-3xl p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Selamat datang kembali,</div>
            <h1 className="font-display text-3xl font-bold">{displayName} 👋</h1>
            <p className="text-sm text-muted-foreground mt-1">Pantau pesanan, simpanan, dan rekomendasi panen Anda.</p>
          </div>
          <div className="grid h-14 w-14 place-items-center rounded-2xl gradient-leaf text-white font-display font-bold text-2xl shrink-0">{initial}</div>
        </div>


        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={ShoppingBag} label="Pesanan Aktif" value="4" sub="2 sedang panen" />
          <StatCard icon={Wallet} label="Penghematan" value={formatRupiah(285000)} sub="+12% bulan ini" />
          <StatCard icon={Heart} label="Petani Favorit" value="8" sub="3 baru" />
          <StatCard icon={TrendingUp} label="Total Transaksi" value="42" sub="sejak Jan 2026" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg">Transaksi Terbaru</h2>
              <Link to="/orders" className="text-sm text-primary hover:underline flex items-center gap-1">Lihat semua <ArrowRight className="h-3 w-3" /></Link>
            </div>
            <div className="space-y-3">
              {customerOrders.slice(0, 4).map((o) => (
                <div key={o.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><ShoppingBag className="h-4 w-4" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{o.product}</div>
                    <div className="text-xs text-muted-foreground">{o.id} · {o.date}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-semibold">{formatRupiah(o.total)}</div>
                    <Badge variant="outline" className="text-[10px]">{o.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5">
            <h2 className="font-display font-bold text-lg mb-4">Petani Favorit</h2>
            <div className="space-y-3">
              {farmers.map((f) => (
                <div key={f.id} className="flex items-center gap-3">
                  <img src={f.image} className="h-11 w-11 rounded-full object-cover" alt={f.name} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{f.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{f.location}</div>
                  </div>
                  <div className="flex items-center gap-1 text-xs shrink-0"><Star className="h-3 w-3 fill-honey text-honey" />{f.rating}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg">Rekomendasi untuk Anda</h2>
            <Link to="/products" className="text-sm text-primary hover:underline flex items-center gap-1">Lihat semua <ArrowRight className="h-3 w-3" /></Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recs.map((p) => (
              <Link key={p.id} to="/products/$id" params={{ id: p.id }} className="group rounded-xl overflow-hidden border border-border/60 hover:shadow-soft transition">
                <img src={p.image} className="aspect-square w-full object-cover group-hover:scale-105 transition-transform duration-500" alt={p.name} />
                <div className="p-3">
                  <div className="text-sm font-medium line-clamp-2">{p.name}</div>
                  <div className="text-primary font-bold mt-1">{formatRupiah(p.price)}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}

function StatCard({ icon: Icon, label, value, sub }: any) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary mb-3"><Icon className="h-5 w-5" /></div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-display text-2xl font-bold">{value}</div>
      <div className="text-xs text-primary mt-1">{sub}</div>
    </div>
  );
}
