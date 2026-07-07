import { createFileRoute, Link } from "@tanstack/react-router";
import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { products, farmers, formatRupiah } from "@/lib/mock-data";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  ShoppingBag, Wallet, Heart, TrendingUp, ArrowRight, Star,
  Award, Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { fetchCustomerOrders } from "@/lib/products-db";
import bgDashboard from "@/assets/bg_dashboard.jpg";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard Pembeli — RumohTani" }] }),
  component: DashboardGate,
});

function DashboardGate() {
  return <PembeliDashboard />;
}

// ==========================================
// UNIFIED PEMBELI DASHBOARD (CONSOLIDATED)
// ==========================================
function PembeliDashboard() {
  const { user, signOut } = useAuth();
  const recs = products.slice(0, 4);

  // Supabase dynamic orders state
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      if (user?.id) {
        setIsLoadingOrders(true);
        const data = await fetchCustomerOrders(user.id);
        setOrdersList(data);
        setIsLoadingOrders(false);
      }
    };
    loadOrders();
  }, [user]);

  // Dynamic statistics calculations
  const activeOrdersCount = ordersList.filter(o => o.status !== "Selesai").length;
  const activeOrdersSub = `${ordersList.filter(o => o.status === "Sedang Panen").length} sedang panen`;
  const totalSpend = ordersList.reduce((sum, o) => sum + Number(o.total || 0), 0);
  const savings = Math.floor(totalSpend * 0.1); // 10% cashback savings
  const totalTransactionsCount = ordersList.length;

  // Upgrade States
  const [isUpgraded, setIsUpgraded] = useState(false);
  const [upgradeSubmitted, setUpgradeSubmitted] = useState(false);

  const handleUpgradeRequest = async () => {
    setUpgradeSubmitted(true);
    try {
      toast.info("Mengalihkan ke formulir pendaftaran Penjual...");
      await signOut();
      setTimeout(() => {
        window.location.href = "/login?tab=register&role=petani";
      }, 800);
    } catch (err: any) {
      toast.error("Gagal memproses pendaftaran.");
      setUpgradeSubmitted(false);
    }
  };

  return (
    <CustomerLayout>
      <div className="min-h-screen bg-[#f4f5f1] text-[#1a2b1b] py-8 px-4 sm:px-6 lg:px-8 font-['Inter',sans-serif] relative overflow-hidden text-left">
        
        {/* BG decorative elements */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: "radial-gradient(#1a2b1b 1.5px, transparent 1.5px)", backgroundSize: "28px 28px" }} />
        <div className="absolute top-[5%] left-[-10%] w-[35vw] h-[35vw] rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[5%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-[#b4f05a]/5 blur-[100px] pointer-events-none" />

        <div className="mx-auto max-w-full px-4 sm:px-8 md:px-12 space-y-8 relative z-10">

          {/* Welcome Banner Card */}
          <div 
            className="relative overflow-hidden border border-emerald-800 rounded-[2.5rem] p-6 sm:p-10 shadow-lg text-white"
            style={{ 
              backgroundImage: `linear-gradient(to right, rgba(6, 78, 59, 0.95), rgba(6, 78, 59, 0.45)), url(${bgDashboard})`,
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}
          >
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(white 1px, transparent 1px)", backgroundSize: "16px 16px" }} />
            <div className="absolute -right-[10%] -top-[30%] w-[300px] h-[300px] rounded-full bg-[#b4f05a]/20 blur-[80px] pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-4 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-[#b4f05a] hover:bg-[#b4f05a]/95 text-emerald-950 rounded-full font-bold text-[9px] uppercase tracking-wider px-3 py-1">
                    🛒 Pembeli (Buyer)
                  </Badge>
                </div>
                <h1 className="font-['Plus_Jakarta_Sans',sans-serif] text-3xl sm:text-4xl font-extrabold tracking-tight">
                  Belanja Hasil Bumi & <span className="font-['Playfair_Display',serif] italic font-light text-[#b4f05a]">Belajar Bertani Mandiri</span>
                </h1>
                <p className="text-sm text-emerald-100/80 font-light leading-relaxed">
                  Temukan hasil panen segar, limbah sirkular bernilai ekonomi, alat budidaya, serta bimbingan langsung dari mentor ahli dalam satu ekosistem agritech.
                </p>
              </div>

              <div className="hidden md:flex h-20 w-20 place-items-center justify-center rounded-[2rem] bg-white/10 border border-white/20 shadow-inner shrink-0 relative animate-bounce duration-1000">
                <ShoppingBag className="h-10 w-10 text-[#b4f05a]" />
              </div>
            </div>
          </div>

          {/* TAB CONTENT: SUMMARY (Rendered directly) */}
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Stats Section */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon={ShoppingBag} label="Pesanan Aktif" value={String(activeOrdersCount)} sub={activeOrdersSub} />
              <StatCard icon={Wallet} label="Penghematan" value={formatRupiah(savings)} sub="Estimasi cashback 10%" />
              <StatCard icon={Heart} label="Petani Favorit" value="3" sub="Semua terverifikasi" />
              <StatCard icon={TrendingUp} label="Total Transaksi" value={String(totalTransactionsCount)} sub="Sejak bergabung" />
            </div>

            {/* Grid 2 Columns: Orders & Favorites / Upgrade */}
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white border border-border/40 rounded-[2rem] p-6 sm:p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-xl text-foreground">Transaksi Terbaru</h2>
                  <Link to="/orders" className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1 uppercase tracking-wider">
                    Lihat semua <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
                <div className="space-y-4">
                  {isLoadingOrders ? (
                    <div className="flex items-center justify-center py-10 gap-2 text-muted-foreground text-xs">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" /> Memuat transaksi...
                    </div>
                  ) : ordersList.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground text-xs">Belum ada transaksi.</div>
                  ) : (
                    ordersList.slice(0, 4).map((o: any) => (
                      <div key={o.id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-secondary/40 border border-transparent hover:border-border/20 transition-all duration-300">
                        <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary shrink-0"><ShoppingBag className="h-5 w-5" /></div>
                        <div className="flex-1 min-w-0 text-left">
                          <div className="font-semibold text-foreground truncate">{o.product_name}</div>
                          <div className="text-xs text-muted-foreground">{o.id} · {o.date}</div>
                        </div>
                        <div className="text-right shrink-0 space-y-1">
                          <div className="font-display font-bold text-foreground">{formatRupiah(Number(o.total))}</div>
                          <Badge variant="outline" className="text-[10px] uppercase font-bold bg-[#b4f05a]/10 border-[#b4f05a]/30 text-emerald-800 rounded-full px-2.5">
                            {o.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="space-y-8">
                {/* Petani Favorit */}
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

                {/* Upgrade Account Card */}
                <div className="bg-white border border-border/40 rounded-[2rem] p-6 sm:p-8 shadow-sm flex flex-col justify-between text-left">
                  <div>
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#b4f05a]/25 text-emerald-800 mb-4 shadow-sm">
                      <Award className="h-6 w-6" />
                    </div>
                    <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-lg text-foreground">Mulai Jual Hasil Tani Anda!</h3>
                    <p className="text-xs text-muted-foreground font-light leading-relaxed mt-2">
                      Bergabunglah bersama ribuan petani sukses lainnya di RumohTani! Daftarkan akun penjual baru Anda untuk mulai mengunggah hasil panen segar, menawarkan limbah pertanian sirkular, dan membuka konsultasi tani.
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border/20">
                    {upgradeSubmitted ? (
                      <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center text-amber-950 text-xs font-bold animate-pulse">
                        Mengalihkan ke Pendaftaran Penjual...
                      </div>
                    ) : (
                      <Button onClick={handleUpgradeRequest} className="w-full rounded-full shadow-soft font-bold bg-primary hover:bg-primary-hover text-white">
                        Daftar Sebagai Penjual (Petani)
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
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
