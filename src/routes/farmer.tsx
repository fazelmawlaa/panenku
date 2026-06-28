import { createFileRoute } from "@tanstack/react-router";
import { FarmerLayout } from "@/components/layout/FarmerLayout";
import { farmerOrders, salesData, formatRupiah } from "@/lib/mock-data";
import { Wallet, Package, Sprout, TrendingUp, ArrowUpRight, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area,
} from "recharts";

export const Route = createFileRoute("/farmer")({
  head: () => ({ meta: [{ title: "Dashboard Petani — PANENKU" }] }),
  component: FarmerDash,
});

function FarmerDash() {
  return (
    <FarmerLayout title="Dashboard Petani">
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Package} label="Pesanan Hari Ini" value="12" delta="+3" tone="primary" />
          <StatCard icon={Wallet} label="Pendapatan Bulan Ini" value={formatRupiah(14280000)} delta="+22%" tone="honey" />
          <StatCard icon={Sprout} label="Produk Terjual" value="284" delta="+18%" tone="leaf" />
          <StatCard icon={CalendarDays} label="Estimasi Panen" value="3.2 ton" delta="14 hari" tone="earth" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-card rounded-2xl p-5">
            <h2 className="font-display font-bold mb-1">Analitik Penjualan</h2>
            <p className="text-xs text-muted-foreground mb-4">Pendapatan 7 hari terakhir</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--leaf)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="var(--leaf)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} tickFormatter={(v) => `${v / 1000000}jt`} />
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }} formatter={(v: any) => formatRupiah(v)} />
                  <Area type="monotone" dataKey="revenue" stroke="var(--leaf)" strokeWidth={3} fill="url(#g1)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5">
            <h2 className="font-display font-bold mb-1">Kalender Panen</h2>
            <p className="text-xs text-muted-foreground mb-4">Jadwal 30 hari kedepan</p>
            <div className="space-y-3">
              {[
                { d: "12 Jul", c: "Beras Pandan Wangi", q: "1.2 ton", color: "var(--leaf)" },
                { d: "19 Jul", c: "Kopi Arabika", q: "320 kg", color: "var(--earth)" },
                { d: "28 Jul", c: "Alpukat Mentega", q: "850 kg", color: "var(--honey)" },
              ].map((h) => (
                <div key={h.d} className="flex items-center gap-3 rounded-xl border border-border/60 p-3">
                  <div className="h-10 w-10 rounded-xl grid place-items-center text-white font-bold text-xs" style={{ background: h.color }}>
                    {h.d.split(" ")[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{h.c}</div>
                    <div className="text-xs text-muted-foreground">{h.q}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <h2 className="font-display font-bold mb-4">Pesanan Terbaru</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="text-left text-xs text-muted-foreground uppercase">
                <tr><th className="pb-3">ID</th><th>Pembeli</th><th>Produk</th><th>Qty</th><th>Total</th><th>Status</th></tr>
              </thead>
              <tbody>
                {farmerOrders.map((o) => (
                  <tr key={o.id} className="border-t border-border/60">
                    <td className="py-3 font-medium">{o.id}</td>
                    <td>{o.buyer}</td>
                    <td>{o.product}</td>
                    <td>{o.qty}</td>
                    <td className="font-semibold">{formatRupiah(o.total)}</td>
                    <td><Badge variant="outline">{o.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
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
    leaf: "bg-leaf-soft/20 text-primary",
    earth: "bg-earth/10 text-earth",
  };
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`grid h-10 w-10 place-items-center rounded-xl ${toneCls[tone]}`}><Icon className="h-5 w-5" /></div>
        <span className="text-xs font-medium text-primary flex items-center gap-0.5"><ArrowUpRight className="h-3 w-3" />{delta}</span>
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-display text-2xl font-bold">{value}</div>
    </div>
  );
}
