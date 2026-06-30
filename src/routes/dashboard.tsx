import { createFileRoute, Link } from "@tanstack/react-router";
import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { customerOrders, products, farmers, formatRupiah } from "@/lib/mock-data";
import { ShoppingBag, Wallet, Heart, TrendingUp, ArrowRight, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard Pembeli — PANENKU+" }] }),
  component: Dashboard,
});

function Dashboard() {
  const recs = products.slice(0, 4);
  return (
    <CustomerLayout>
      <div className="min-h-screen bg-[#f4f5f1] text-[#1a2b1b] py-8 px-4 sm:px-6 lg:px-8 font-['Inter',sans-serif] relative overflow-hidden">
        
        {/* DEKORASI BACKGROUND TIPIS (BACKGROUND PATTERNS & BLOBS) */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: "radial-gradient(#1a2b1b 1.5px, transparent 1.5px)", backgroundSize: "28px 28px" }} />
        <div className="absolute top-[5%] left-[-10%] w-[35vw] h-[35vw] rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[5%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-[#b4f05a]/5 blur-[100px] pointer-events-none" />

        <div className="mx-auto max-w-[1400px] space-y-8 relative z-10">
          
          {/* Welcome Banner Card */}
          <div className="bg-white border border-border/40 rounded-[2rem] p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4 shadow-sm hover:shadow-soft transition-all duration-300">
            <div className="text-left">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Selamat datang kembali,</div>
              <h1 className="font-['Plus_Jakarta_Sans',sans-serif] text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mt-1">
                Andi Pratama <span className="font-['Playfair_Display',serif] italic font-light text-primary">👋</span>
              </h1>
              <p className="text-sm text-muted-foreground font-light mt-1.5">Pantau pesanan, penghematan pre-order, dan rekomendasi panen Anda.</p>
            </div>
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary text-white font-['Plus_Jakarta_Sans',sans-serif] font-black text-2xl shrink-0 shadow-md">
              A
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={ShoppingBag} label="Pesanan Aktif" value="4" sub="2 sedang panen" />
            <StatCard icon={Wallet} label="Penghematan" value={formatRupiah(285000)} sub="+12% bulan ini" />
            <StatCard icon={Heart} label="Petani Favorit" value="8" sub="3 baru" />
            <StatCard icon={TrendingUp} label="Total Transaksi" value="42" sub="sejak Jan 2026" />
          </div>

          {/* Transaction History & Favorites */}
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white border border-border/40 rounded-[2rem] p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-xl text-foreground">Transaksi Terbaru</h2>
                <Link to="/orders" className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1 uppercase tracking-wider">
                  Lihat semua <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="space-y-4">
                {customerOrders.slice(0, 4).map((o) => (
                  <div key={o.id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-secondary/40 border border-transparent hover:border-border/20 transition-all duration-300">
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary shrink-0"><ShoppingBag className="h-5 w-5" /></div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="font-semibold text-foreground truncate">{o.product}</div>
                      <div className="text-xs text-muted-foreground">{o.id} · {o.date}</div>
                    </div>
                    <div className="text-right shrink-0 space-y-1">
                      <div className="font-display font-bold text-foreground">{formatRupiah(o.total)}</div>
                      <Badge variant="outline" className="text-[10px] uppercase font-bold bg-[#b4f05a]/10 border-[#b4f05a]/30 text-emerald-800 rounded-full px-2.5">
                        {o.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-border/40 rounded-[2rem] p-6 sm:p-8 shadow-sm text-left">
              <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-xl text-foreground mb-6">Petani Favorit</h2>
              <div className="space-y-4">
                {farmers.map((f) => (
                  <div key={f.id} className="flex items-center gap-4 p-2 rounded-2xl hover:bg-secondary/30 transition-all duration-300">
                    <img src={f.image} className="h-12 w-12 rounded-full object-cover shadow-sm border border-border/20" alt={f.name} />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-foreground truncate">{f.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{f.location}</div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-honey shrink-0">
                      <Star className="h-3.5 w-3.5 fill-honey text-honey" />
                      <span>{f.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommendations Grid */}
          <div className="bg-white border border-border/40 rounded-[2rem] p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-xl text-foreground">Rekomendasi untuk Anda</h2>
              <Link to="/products" className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1 uppercase tracking-wider">
                Lihat semua <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {recs.map((p) => (
                <Link key={p.id} to="/products/$id" params={{ id: p.id }} className="group rounded-[1.8rem] overflow-hidden border border-border/50 bg-[#e9eae6]/25 hover:shadow-soft hover:border-primary/20 transition-all duration-300">
                  <div className="aspect-square w-full overflow-hidden bg-secondary">
                    <img src={p.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={p.name} />
                  </div>
                  <div className="p-4 text-left space-y-1">
                    <div className="text-sm font-bold text-foreground line-clamp-1 group-hover:text-primary transition">{p.name}</div>
                    <div className="text-primary font-black text-sm">{formatRupiah(p.price)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </CustomerLayout>
  );
}

function StatCard({ icon: Icon, label, value, sub }: any) {
  return (
    <div className="bg-white border border-border/40 rounded-[2rem] p-6 text-left shadow-sm hover:shadow-soft transition-all duration-300">
      <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary mb-4 shadow-sm">
        <Icon className="h-6 w-6" />
      </div>
      <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className="font-['Plus_Jakarta_Sans',sans-serif] text-3xl font-extrabold text-foreground mt-1 leading-none">{value}</div>
      <div className="text-xs text-primary font-semibold mt-2">{sub}</div>
    </div>
  );
}
