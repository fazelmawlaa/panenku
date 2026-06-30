import { createFileRoute } from "@tanstack/react-router";
import { FarmerLayout } from "@/components/layout/FarmerLayout";
import { farmerOrders, salesData, formatRupiah } from "@/lib/mock-data";
import { Wallet, Package, Sprout, TrendingUp, ArrowUpRight, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area,
} from "recharts";

export const Route = createFileRoute("/farmer")({
  head: () => ({ meta: [{ title: "Dashboard Petani — PANENKU+" }] }),
  component: FarmerDash,
});

function FarmerDash() {
  return (
    <FarmerLayout title="Dashboard Petani">
      <div className="min-h-screen bg-[#f4f5f1] text-[#1a2b1b] py-4 px-1 sm:px-4 font-['Inter',sans-serif] relative overflow-hidden text-left">
        
        {/* DEKORASI BACKGROUND TIPIS (BACKGROUND PATTERNS & BLOBS) */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: "radial-gradient(#1a2b1b 1.5px, transparent 1.5px)", backgroundSize: "28px 28px" }} />
        <div className="absolute top-[5%] left-[-10%] w-[35vw] h-[35vw] rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[5%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-[#b4f05a]/5 blur-[100px] pointer-events-none" />

        <div className="space-y-8 relative z-10">
          
          {/* Welcome Card Banner */}
          <div className="bg-white border border-border/40 rounded-[2rem] p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <div>
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Selamat datang kembali,</div>
              <h1 className="font-['Plus_Jakarta_Sans',sans-serif] text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mt-1">
                Petani Mitra <span className="font-['Playfair_Display',serif] italic font-light text-primary">PANENKU+</span>
              </h1>
              <p className="text-sm text-muted-foreground font-light mt-1.5">Kelola pasokan panen pre-order, catat sirkular limbah tani, dan pantau keuangan Anda secara transparan.</p>
            </div>
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary text-white font-['Plus_Jakarta_Sans',sans-serif] font-bold text-2xl shrink-0 shadow-sm">P</div>
          </div>

          {/* Stats grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={Package} label="Pesanan Hari Ini" value="12" delta="+3" tone="primary" />
            <StatCard icon={Wallet} label="Pendapatan Bulan Ini" value={formatRupiah(14280000)} delta="+22%" tone="honey" />
            <StatCard icon={Sprout} label="Produk Terjual" value="284" delta="+18%" tone="leaf" />
            <StatCard icon={CalendarDays} label="Estimasi Panen" value="3.2 ton" delta="14 hari" tone="earth" />
          </div>

          {/* Sales Analytics Chart & Harvest Calendar */}
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white border border-border/40 rounded-[2rem] p-6 sm:p-8 shadow-sm">
              <div className="mb-6">
                <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-xl text-foreground">Analitik Penjualan</h2>
                <p className="text-xs text-muted-foreground font-light">Pendapatan 7 hari terakhir dari pre-order & limbah</p>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesData}>
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
                <p className="text-xs text-muted-foreground font-light">Jadwal 30 hari kedepan</p>
              </div>
              <div className="space-y-4">
                {[
                  { d: "12 Jul", c: "Beras Pandan Wangi", q: "1.2 ton", color: "var(--leaf)" },
                  { d: "19 Jul", c: "Kopi Arabika Gayo", q: "320 kg", color: "var(--earth)" },
                  { d: "28 Jul", c: "Alpukat Mentega", q: "850 kg", color: "var(--honey)" },
                ].map((h) => (
                  <div key={h.d} className="flex items-center gap-4 rounded-2xl border border-border/40 p-4 hover:bg-secondary/40 transition duration-300">
                    <div className="h-12 w-12 rounded-xl grid place-items-center text-white font-bold text-xs shrink-0 shadow-sm" style={{ background: h.color }}>
                      {h.d.split(" ")[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-foreground truncate">{h.c}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{h.q}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Orders Table */}
          <div className="bg-white border border-border/40 rounded-[2rem] p-6 sm:p-8 shadow-sm">
            <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-xl text-foreground mb-6">Pesanan Terbaru</h2>
            <div className="overflow-x-auto">
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
                  {farmerOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-secondary/20 transition">
                      <td className="py-4 font-bold text-foreground">{o.id}</td>
                      <td className="py-4 font-medium">{o.buyer}</td>
                      <td className="py-4 font-medium">{o.product}</td>
                      <td className="py-4 font-medium">{o.qty}</td>
                      <td className="py-4 font-black text-primary">{formatRupiah(o.total)}</td>
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
