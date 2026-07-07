import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { FarmerLayout } from "@/components/layout/FarmerLayout";
import { formatRupiah } from "@/lib/mock-data";
import { fetchFarmerOrders, fetchProductsFromSupabase } from "@/lib/products-db";
import { useAuth } from "@/hooks/use-auth";
import { Wallet, Package, Sprout, TrendingUp, ArrowUpRight, CalendarDays, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area,
} from "recharts";

export const Route = createFileRoute("/farmer/")({
  head: () => ({ meta: [{ title: "Dashboard Penjual — RumohTani" }] }),
  component: FarmerDash,
});

function FarmerDash() {
  const { user, session, loading, profile } = useAuth();
  const navigate = useNavigate();

  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [productsList, setProductsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !session) {
      navigate({ to: "/login", replace: true });
    }
  }, [loading, session, navigate]);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (user?.id) {
        setIsLoading(true);
        try {
          const orders = await fetchFarmerOrders(user.id);
          setOrdersList(orders);

          const products = await fetchProductsFromSupabase();
          const farmerProducts = products.filter(p => p.farmerId === user.id);
          setProductsList(farmerProducts);
        } catch (err) {
          console.error("Error loading dashboard data:", err);
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadDashboardData();
  }, [user]);

  // Compute metrics dynamically from database orders
  const activeOrdersCount = useMemo(() => {
    return ordersList.filter(o => o.status !== "Selesai").length;
  }, [ordersList]);

  const totalRevenue = useMemo(() => {
    return ordersList.reduce((sum, o) => sum + Number(o.total || 0), 0);
  }, [ordersList]);

  const totalProductsSold = useMemo(() => {
    return ordersList.filter(o => o.status === "Selesai").length;
  }, [ordersList]);

  // Preorder calculations
  const preorderProducts = useMemo(() => {
    return productsList.filter(p => p.type === "preorder");
  }, [productsList]);

  const totalPreorderStock = useMemo(() => {
    return preorderProducts.reduce((sum, p) => sum + Number(p.stock || 0), 0);
  }, [preorderProducts]);

  const nextHarvestInfo = useMemo(() => {
    const now = new Date();
    let nearestDate: any = null;
    let daysRemaining = -1;

    preorderProducts.forEach(p => {
      if (p.estimated_harvest) {
        const d = new Date(p.estimated_harvest);
        // Normalize time to compare only dates
        d.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (d >= today) {
          if (!nearestDate || d < nearestDate) {
            nearestDate = d;
          }
        }
      }
    });

    if (nearestDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const diffTime = nearestDate.getTime() - today.getTime();
      daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }

    return {
      totalStock: totalPreorderStock,
      daysRemaining
    };
  }, [preorderProducts, totalPreorderStock]);

  const harvestDisplayValue = useMemo(() => {
    const kg = nextHarvestInfo.totalStock;
    if (kg === 0) return "0 kg";
    if (kg >= 1000) return `${(kg / 1000).toFixed(1)} ton`;
    return `${kg} kg`;
  }, [nextHarvestInfo.totalStock]);

  const harvestDisplayDelta = useMemo(() => {
    const days = nextHarvestInfo.daysRemaining;
    if (days === -1) return "-";
    if (days === 0) return "Hari ini";
    return `${days} hari`;
  }, [nextHarvestInfo.daysRemaining]);

  // Dynamic sales data grouped for the charts
  const salesChartData = useMemo(() => {
    const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
    const hasActualSales = ordersList.some(o => Number(o.total || 0) > 0);

    return days.map((day, idx) => {
      const revenue = ordersList
        .filter((_, oIdx) => oIdx % 7 === idx)
        .reduce((sum, o) => sum + Number(o.total || 0), 0);
      
      // If there are no actual sales, show 0 instead of fake base values
      return { day, revenue: hasActualSales ? revenue : 0 };
    });
  }, [ordersList]);

  // Dynamic Harvest Calendar List
  const harvestCalendarList = useMemo(() => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
    const colors = ["var(--leaf)", "var(--earth)", "var(--honey)"];

    return preorderProducts
      .filter(p => p.estimated_harvest)
      .map((p, idx) => {
        const d = new Date(p.estimated_harvest);
        const dayNum = d.getDate();
        const monthStr = monthNames[d.getMonth()];

        return {
          date: `${dayNum} ${monthStr}`,
          name: p.name,
          qty: `${p.stock} ${p.unit || "kg"}`,
          color: colors[idx % colors.length]
        };
      })
      .slice(0, 3);
  }, [preorderProducts]);

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Penjual Mitra";
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    if (user) {
      const localAvatar = localStorage.getItem(`panenku_avatar_${user.id}`);
      if (localAvatar) {
        setAvatarUrl(localAvatar);
      }
    }
  }, [user]);

  return (
    <FarmerLayout title="Dashboard Penjual">
      <div className="space-y-8 relative text-left">
        {/* Decor backgrounds */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: "radial-gradient(#1a2b1b 1.5px, transparent 1.5px)", backgroundSize: "28px 28px" }} />
        <div className="absolute top-[5%] left-[-10%] w-[35vw] h-[35vw] rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[5%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-[#b4f05a]/5 blur-[100px] pointer-events-none" />
          
        {/* Welcome Card Banner */}
        <div className="bg-white border border-border/40 rounded-[2rem] p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4 shadow-sm">
          <div>
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Selamat datang kembali,</div>
            <h1 className="font-['Plus_Jakarta_Sans',sans-serif] text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mt-1">
              {displayName} <span className="font-['Playfair_Display',serif] italic font-light text-primary">RumohTani</span>
            </h1>
            <p className="text-sm text-muted-foreground font-light mt-1.5">Kelola pasokan panen pre-order, catat sirkular limbah tani, dan pantau keuangan Anda secara transparan.</p>
          </div>
          <div className="h-14 w-14 rounded-2xl bg-secondary overflow-hidden shrink-0 border border-border/40 flex items-center justify-center text-foreground font-black text-xl shadow-sm">
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
            ) : (
              <span>{displayName.charAt(0).toUpperCase()}</span>
            )}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Package} label="Pesanan Aktif" value={String(activeOrdersCount)} delta={`+${activeOrdersCount}`} tone="primary" />
          <StatCard icon={Wallet} label="Total Pendapatan" value={formatRupiah(totalRevenue)} delta="+100%" tone="honey" />
          <StatCard icon={Sprout} label="Pesanan Selesai" value={String(totalProductsSold)} delta={`+${totalProductsSold}`} tone="leaf" />
          <StatCard icon={CalendarDays} label="Estimasi Panen" value={harvestDisplayValue} delta={harvestDisplayDelta} tone="earth" />
        </div>

        {/* Sales Analytics Chart & Harvest Calendar */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white border border-border/40 rounded-[2rem] p-6 sm:p-8 shadow-sm">
            <div className="mb-6">
              <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-xl text-foreground">Analitik Penjualan</h2>
              <p className="text-xs text-muted-foreground font-light">Pendapatan penjualan produk yang sinkron dengan database Supabase</p>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesChartData}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--leaf)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="var(--leaf)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                  <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} tickFormatter={(v) => `${v / 1000000}jt`} />
                  <Tooltip contentStyle={{ background: "white", border: "1px solid var(--border)", borderRadius: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }} formatter={(v: any) => formatRupiah(v)} />
                  <Area type="monotone" dataKey="revenue" stroke="var(--leaf)" strokeWidth={3} fill="url(#g1)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border border-border/40 rounded-[2rem] p-6 sm:p-8 shadow-sm text-left">
            <div className="mb-6">
              <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-xl text-foreground">Kalender Panen</h2>
              <p className="text-xs text-muted-foreground font-light">Jadwal estimasi berdasarkan produk pre-order aktif</p>
            </div>
            <div className="space-y-4">
              {harvestCalendarList.length === 0 ? (
                <div className="text-center py-10 text-xs text-muted-foreground">
                  Belum ada jadwal panen. Tambahkan produk pre-order untuk melihat kalender panen Anda.
                </div>
              ) : (
                harvestCalendarList.map((h, i) => (
                  <div key={i} className="flex items-center gap-4 rounded-2xl border border-border/40 p-4 hover:bg-secondary/40 transition duration-300">
                    <div className="h-12 w-12 rounded-xl grid place-items-center text-white font-bold text-xs shrink-0 shadow-sm" style={{ background: h.color }}>
                      {h.date.split(" ")[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-foreground truncate">{h.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{h.qty}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white border border-border/40 rounded-[2rem] p-6 sm:p-8 shadow-sm">
          <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-xl text-foreground mb-6">Pesanan Terbaru</h2>
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground text-xs">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <p>Memuat pesanan masuk...</p>
              </div>
            ) : ordersList.length === 0 ? (
              <div className="text-center py-10 text-xs text-muted-foreground">Belum ada pesanan yang masuk ke database.</div>
            ) : (
              <table className="w-full text-sm min-w-[640px]">
                <thead className="text-left text-xs text-muted-foreground uppercase">
                  <tr>
                    <th className="pb-4 tracking-wider">ID Pesanan</th>
                    <th className="pb-4 tracking-wider">Pembeli</th>
                    <th className="pb-4 tracking-wider">Produk</th>
                    <th className="pb-4 tracking-wider">Qty</th>
                    <th className="pb-4 tracking-wider">Total</th>
                    <th className="pb-4 tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {ordersList.map((o) => (
                    <tr key={o.id} className="hover:bg-secondary/20 transition">
                      <td className="py-4 font-bold text-foreground">{o.id}</td>
                      <td className="py-4 font-medium">{o.buyer_name} ({o.buyer_phone})</td>
                      <td className="py-4 font-medium">{o.product_name}</td>
                      <td className="py-4 font-medium">{o.qty}</td>
                      <td className="py-4 font-black text-primary">{formatRupiah(Number(o.total))}</td>
                      <td className="py-4">
                        <Badge variant="outline" className="text-[10px] uppercase font-bold bg-[#b4f05a]/10 border-[#b4f05a]/30 text-emerald-800 rounded-full px-2.5">
                          {o.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </FarmerLayout>
  );
}

function StatCard({ icon: Icon, label, value, delta, tone }: any) {
  const toneCls: any = {
    primary: "bg-primary/10 text-primary",
    honey: "bg-honey/15 text-foreground",
    leaf: "bg-[#b4f05a]/15 text-emerald-800",
    earth: "bg-earth/10 text-earth",
  };
  return (
    <div className="bg-white border border-border/40 rounded-[2rem] p-6 text-left shadow-sm hover:shadow-soft transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`grid h-12 w-12 place-items-center rounded-xl ${toneCls[tone]} shadow-sm`}><Icon className="h-6 w-6" /></div>
        <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 rounded-full px-2.5 py-0.5 flex items-center gap-0.5"><ArrowUpRight className="h-3 w-3" />{delta}</span>
      </div>
      <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className="font-['Plus_Jakarta_Sans',sans-serif] text-2xl sm:text-3xl font-extrabold text-foreground mt-1 leading-none">{value}</div>
    </div>
  );
}
