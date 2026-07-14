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
  head: () => ({ meta: [{ title: "Dashboard Penjual — PANENKU" }] }),
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
      if (p.estimatedHarvest) {
        const d = new Date(p.estimatedHarvest);
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
      .filter(p => p.estimatedHarvest)
      .map((p, idx) => {
        const d = new Date(p.estimatedHarvest!);
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
        <div className="bg-white border border-border/40 rounded-[2rem] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-4">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Selamat datang kembali,</div>
              {/* Avatar on mobile screen */}
              <div className="sm:hidden h-12 w-12 rounded-xl bg-secondary overflow-hidden shrink-0 border border-border/40 flex items-center justify-center text-foreground font-black text-lg shadow-sm">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                ) : (
                  <span>{displayName.charAt(0).toUpperCase()}</span>
                )}
              </div>
            </div>
            <h1 className="font-['Plus_Jakarta_Sans',sans-serif] text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight mt-1.5 leading-tight">
              {displayName} <span className="font-['Playfair_Display',serif] italic font-light text-primary">PANENKU</span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-light mt-2 leading-relaxed">Kelola pasokan panen pre-order, catat sirkular limbah tani, dan pantau keuangan Anda secara transparan.</p>
          </div>
          {/* Avatar on desktop/tablet screen */}
          <div className="hidden sm:flex h-14 w-14 rounded-2xl bg-secondary overflow-hidden shrink-0 border border-border/40 items-center justify-center text-foreground font-black text-xl shadow-sm">
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
            ) : (
              <span>{displayName.charAt(0).toUpperCase()}</span>
            )}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard icon={Package} label="Pesanan Aktif" value={String(activeOrdersCount)} delta={`+${activeOrdersCount}`} tone="primary" />
          <StatCard icon={Wallet} label="Total Pendapatan" value={formatRupiah(totalRevenue)} delta="+100%" tone="honey" />
          <StatCard icon={Sprout} label="Pesanan Selesai" value={String(totalProductsSold)} delta={`+${totalProductsSold}`} tone="leaf" />
          <StatCard icon={CalendarDays} label="Estimasi Panen" value={harvestDisplayValue} delta={harvestDisplayDelta} tone="earth" />
        </div>

        {/* Sales Analytics Chart & Harvest Calendar */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white border border-border/40 rounded-[2rem] p-6 sm:p-8 shadow-sm">             <div className="mb-6">
              <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-xl text-foreground">Analitik Penjualan</h2>
              <p className="text-xs text-muted-foreground font-light">Statistik pendapatan mingguan dari penjualan hasil panen dan produk sirkular</p>
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
                    <div className="h-12 w-12 rounded-xl flex flex-col items-center justify-center text-white shrink-0 shadow-sm" style={{ background: h.color }}>
                      <span className="text-sm font-bold leading-none">{h.date.split(" ")[0]}</span>
                      <span className="text-[9px] uppercase font-semibold mt-0.5 leading-none">{h.date.split(" ")[1]}</span>
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
          <div className="mt-2">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground text-xs">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <p>Memuat pesanan masuk...</p>
              </div>
            ) : ordersList.length === 0 ? (
              <div className="text-center py-10 text-xs text-muted-foreground">Belum ada pesanan yang masuk ke database.</div>
            ) : (
              <>
                {/* Mobile view: list of order item cards */}
                <div className="sm:hidden space-y-3">
                  {ordersList.map((o) => (
                    <div key={o.id} className="bg-secondary/20 border border-border/20 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-foreground">{o.id}</span>
                        <Badge variant="outline" className="text-[9px] uppercase font-bold bg-[#b4f05a]/10 border-[#b4f05a]/30 text-emerald-800 rounded-full px-2 py-0.5">
                          {o.status}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="font-medium text-foreground"><span className="text-muted-foreground">Pembeli:</span> {o.buyer_name}</div>
                        <div className="font-medium text-foreground"><span className="text-muted-foreground">Produk:</span> {o.product_name} ({o.qty})</div>
                      </div>
                      <div className="border-t border-border/20 pt-2 flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">{o.buyer_phone}</span>
                        <span className="font-black text-xs text-primary">{formatRupiah(Number(o.total))}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop & Tablet view: structured table */}
                <div className="hidden sm:block overflow-x-auto">
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
                </div>
              </>
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
    <div className="bg-white border border-border/40 rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-6 text-left shadow-sm hover:shadow-soft transition-all duration-300">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className={`grid h-9 w-9 sm:h-12 sm:w-12 place-items-center rounded-xl ${toneCls[tone]} shadow-sm`}><Icon className="h-4.5 w-4.5 sm:h-6 sm:w-6" /></div>
        <span className="text-[9px] sm:text-xs font-bold text-emerald-600 bg-emerald-500/10 rounded-full px-1.5 sm:px-2.5 py-0.5 flex items-center gap-0.5"><ArrowUpRight className="h-2.5 w-2.5 sm:h-3 sm:w-3" />{delta}</span>
      </div>
      <div className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider truncate">{label}</div>
      <div className="font-['Plus_Jakarta_Sans',sans-serif] text-lg sm:text-2xl lg:text-3xl font-extrabold text-foreground mt-1 leading-none truncate">{value}</div>
    </div>
  );
}
