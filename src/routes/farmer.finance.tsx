import { createFileRoute } from "@tanstack/react-router";
import { FarmerLayout } from "@/components/layout/FarmerLayout";
import bgDashboard from "@/assets/bg_dashboard.jpg";
import { salesData, formatRupiah } from "@/lib/mock-data";
import { Wallet, TrendingUp, Trophy, Download, ArrowUpRight, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/farmer/finance")({
  head: () => ({ meta: [{ title: "Analitik Pendapatan — PANENKU" }] }),
  component: FinancePage,
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
  { name: "Hasil Panen (Pre-Order)", value: 55, fill: "var(--leaf)" },
  { name: "Hasil Panen (Ready Stock)", value: 30, fill: "var(--honey)" },
  { name: "Limbah Organik", value: 15, fill: "var(--earth)" },
];

function FinancePage() {
  return (
    <FarmerLayout title="Analitik Pendapatan">
      <div className="space-y-8 relative">
        {/* BG decorative elements */}
        <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{ backgroundImage: "radial-gradient(#1a2b1b 1.5px, transparent 1.5px)", backgroundSize: "28px 28px" }} />
        <div className="absolute top-[5%] left-[-10%] w-[35vw] h-[35vw] rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none" />
          
          {/* Header Banner */}
          <div 
            className="relative overflow-hidden border border-emerald-800 rounded-[1.5rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-lg text-white"
            style={{ 
              backgroundImage: `linear-gradient(to right, rgba(6, 78, 59, 0.95), rgba(6, 78, 59, 0.45)), url(${bgDashboard})`,
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}
          >
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(white 1px, transparent 1px)", backgroundSize: "16px 16px" }} />
            <div className="relative z-10">
              <div className="text-xs font-bold text-[#b4f05a] uppercase tracking-wider">Dashboard Keuangan</div>
              <h1 className="font-['Plus_Jakarta_Sans',sans-serif] text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
                Analitik & <span className="font-['Playfair_Display',serif] italic font-light text-[#b4f05a]">Pendapatan Tani</span>
              </h1>
            </div>
          </div>

          {/* Stats KPI grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <KPI icon={Wallet} label="Total Pendapatan" value={formatRupiah(24800000)} delta="+12.8% Bulan ini" accent="primary" />
            <KPI icon={TrendingUp} label="Laba Bersih" value={formatRupiah(18300000)} delta="Margin laba 73.7%" accent="honey" />
            <KPI icon={Trophy} label="Komoditas Terlaris" value="Beras Pandan" delta="142 transaksi terkirim" accent="leaf" />
            <KPI icon={Wallet} label="Saldo Pencairan" value={formatRupiah(8420000)} delta="Klik Cairkan Dana" clickAction accent="earth" />
          </div>

          {/* Charts area */}
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white border border-border/40 rounded-[2rem] p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/20">
                <div>
                  <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-lg text-foreground">Arus Kas Bulanan</h2>
                  <p className="text-xs text-muted-foreground font-light">Perbandingan pemasukan vs biaya operasional</p>
                </div>
                <Button variant="outline" size="sm" className="rounded-full gap-1.5 text-xs font-bold"><Download className="h-3.5 w-3.5 text-emerald-600" /> Ekspor</Button>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cashflow}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                    <XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} tickFormatter={(v) => `${v / 1000000}jt`} />
                    <Tooltip contentStyle={{ background: "white", border: "1px solid var(--border)", borderRadius: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }} formatter={(v: any) => formatRupiah(v)} />
                    <Bar dataKey="in" name="Pemasukan" fill="var(--leaf)" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="out" name="Biaya Operasional" fill="var(--earth)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white border border-border/40 rounded-[2rem] p-6 sm:p-8 shadow-sm text-left">
              <div className="border-b border-border/20 pb-4 mb-4">
                <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-lg text-foreground">Komposisi Pendapatan</h2>
                <p className="text-xs text-muted-foreground font-light">Sumber kontribusi penjualan pertanian</p>
              </div>
              <div className="h-64 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={breakdown} dataKey="value" innerRadius={55} outerRadius={80} paddingAngle={4}>
                      {breakdown.map((b, i) => <Cell key={i} fill={b.fill} />)}
                    </Pie>
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 10, fontWeight: "bold" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Monthly statement ledger */}
          <div className="bg-white border border-border/40 rounded-[2rem] p-6 sm:p-8 shadow-sm">
            <div className="border-b border-border/20 pb-4 mb-6">
              <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-lg text-foreground">Riwayat Laporan Pembukuan</h2>
              <p className="text-xs text-muted-foreground font-light">Catatan pembukuan kas bulanan terverifikasi sistem</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead className="text-left text-xs text-muted-foreground uppercase">
                  <tr>
                    <th className="pb-4 tracking-wider">Bulan</th>
                    <th className="pb-4 tracking-wider">Pemasukan Kotor</th>
                    <th className="pb-4 tracking-wider">Biaya & Pengeluaran</th>
                    <th className="pb-4 tracking-wider">Laba Bersih</th>
                    <th className="pb-4 tracking-wider">Rasio Profit</th>
                    <th className="pb-4 tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {cashflow.slice().reverse().map((m) => (
                    <tr key={m.m} className="hover:bg-secondary/20 transition">
                      <td className="py-4 font-bold text-foreground">{m.m} 2026</td>
                      <td className="py-4 font-black text-primary">{formatRupiah(m.in)}</td>
                      <td className="py-4 font-semibold text-amber-900">{formatRupiah(m.out)}</td>
                      <td className="py-4 font-black text-emerald-800">{formatRupiah(m.in - m.out)}</td>
                      <td className="py-4">
                        <Badge className="bg-[#b4f05a]/10 text-emerald-800 border-[#b4f05a]/30 rounded-full font-bold text-[10px] px-2.5">
                          {Math.round(((m.in - m.out) / m.in) * 100)}% Laba
                        </Badge>
                      </td>
                      <td className="py-4 text-right">
                        <Button size="sm" variant="ghost" className="rounded-full gap-1 text-xs font-bold text-emerald-800 hover:bg-emerald-500/10">
                          <Download className="h-3.5 w-3.5" /> PDF
                        </Button>
                      </td>
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

function KPI({ icon: Icon, label, value, delta, clickAction, accent }: any) {
  const accentCls = {
    primary: "bg-emerald-500/10 text-emerald-800 border-emerald-500/20",
    honey: "bg-honey/15 text-amber-900 border-honey/20",
    leaf: "bg-[#b4f05a]/10 text-emerald-950 border-[#b4f05a]/20",
    earth: "bg-amber-600/10 text-amber-900 border-amber-600/20"
  } as any;

  const handleCairkan = () => {
    toast.success("Permintaan penarikan saldo berhasil dikirim ke bank Anda!");
  };

  return (
    <div className={`bg-white border rounded-[2.2rem] p-6 text-left shadow-sm hover:shadow-soft transition-all duration-300 ${accentCls[accent] || ""}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/70 shadow-sm border border-border/20">
          <Icon className="h-5 w-5 text-emerald-800" />
        </div>
        {clickAction ? (
          <Button 
            onClick={handleCairkan}
            size="sm" 
            className="rounded-full text-[10px] uppercase font-bold py-1 px-3 h-auto shadow-sm"
          >
            Cairkan
          </Button>
        ) : (
          <span className="text-[10px] font-bold text-emerald-800 bg-[#b4f05a]/30 rounded-full px-2.5 py-0.5 flex items-center gap-0.5">
            <ArrowUpRight className="h-3 w-3" /> {delta.split(" ")[0]}
          </span>
        )}
      </div>
      
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-['Plus_Jakarta_Sans',sans-serif] text-xl sm:text-2xl font-extrabold text-foreground mt-1.5 leading-none">{value}</div>
      {!clickAction && <div className="text-[10px] font-semibold text-muted-foreground mt-1">{delta}</div>}
    </div>
  );
}
