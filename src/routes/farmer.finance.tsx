import { createFileRoute } from "@tanstack/react-router";
import { FarmerLayout } from "@/components/layout/FarmerLayout";
import { salesData, formatRupiah } from "@/lib/mock-data";
import { Wallet, TrendingUp, Trophy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend,
} from "recharts";

export const Route = createFileRoute("/farmer/finance")({
  head: () => ({ meta: [{ title: "Keuangan — PANENKU" }] }),
  component: Finance,
});

const cashflow = [
  { m: "Jan", in: 12000000, out: 4000000 },
  { m: "Feb", in: 14500000, out: 4500000 },
  { m: "Mar", in: 16000000, out: 5000000 },
  { m: "Apr", in: 18500000, out: 5500000 },
  { m: "Mei", in: 22000000, out: 6000000 },
  { m: "Jun", in: 24800000, out: 6500000 },
];

const breakdown = [
  { name: "Beras", value: 45, fill: "var(--leaf)" },
  { name: "Sayuran", value: 25, fill: "var(--leaf-soft)" },
  { name: "Buah", value: 18, fill: "var(--honey)" },
  { name: "Limbah", value: 12, fill: "var(--earth)" },
];

function Finance() {
  return (
    <FarmerLayout title="Dashboard Keuangan">
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPI icon={Wallet} label="Pendapatan Bulan Ini" value={formatRupiah(24800000)} delta="+12.8%" />
          <KPI icon={TrendingUp} label="Laba Bersih" value={formatRupiah(18300000)} delta="+9.2%" />
          <KPI icon={Trophy} label="Produk Terlaris" value="Beras Pandan" delta="142 transaksi" />
          <KPI icon={Wallet} label="Saldo Tersedia" value={formatRupiah(8420000)} delta="Siap dicairkan" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display font-bold">Arus Kas Bulanan</h2>
                <p className="text-xs text-muted-foreground">Pemasukan vs Pengeluaran</p>
              </div>
              <Button variant="outline" size="sm" className="rounded-full gap-1"><Download className="h-3.5 w-3.5" /> Ekspor</Button>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cashflow}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} tickFormatter={(v) => `${v / 1000000}jt`} />
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }} formatter={(v: any) => formatRupiah(v)} />
                  <Bar dataKey="in" fill="var(--leaf)" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="out" fill="var(--earth)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5">
            <h2 className="font-display font-bold mb-1">Komposisi Pendapatan</h2>
            <p className="text-xs text-muted-foreground mb-4">Per kategori produk</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={breakdown} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={4}>
                    {breakdown.map((b, i) => <Cell key={i} fill={b.fill} />)}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <h2 className="font-display font-bold mb-4">Laporan Bulanan</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="text-left text-xs text-muted-foreground uppercase">
                <tr><th className="pb-3">Bulan</th><th>Pemasukan</th><th>Pengeluaran</th><th>Laba</th><th>Margin</th><th></th></tr>
              </thead>
              <tbody>
                {cashflow.slice().reverse().map((m) => (
                  <tr key={m.m} className="border-t border-border/60">
                    <td className="py-3 font-medium">{m.m} 2026</td>
                    <td className="text-primary font-semibold">{formatRupiah(m.in)}</td>
                    <td>{formatRupiah(m.out)}</td>
                    <td className="font-semibold">{formatRupiah(m.in - m.out)}</td>
                    <td>{Math.round(((m.in - m.out) / m.in) * 100)}%</td>
                    <td><Button size="sm" variant="ghost" className="gap-1"><Download className="h-3.5 w-3.5" /> PDF</Button></td>
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

function KPI({ icon: Icon, label, value, delta }: any) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary mb-3"><Icon className="h-5 w-5" /></div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-display text-xl font-bold">{value}</div>
      <div className="text-xs text-primary mt-1">{delta}</div>
    </div>
  );
}
