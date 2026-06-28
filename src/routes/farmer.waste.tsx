import { createFileRoute } from "@tanstack/react-router";
import { FarmerLayout } from "@/components/layout/FarmerLayout";
import { products, formatRupiah } from "@/lib/mock-data";
import { Sparkles, Recycle, ArrowRight, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/farmer/waste")({
  head: () => ({ meta: [{ title: "Limbah Pertanian — PANENKU" }] }),
  component: WasteDashboard,
});

const aiSuggest = [
  { from: "Sekam Padi", to: "Pupuk Organik", buyer: "Produsen Kompos", price: "Rp 1.500/kg", icon: "🌾" },
  { from: "Kulit Kopi", to: "Pakan Ternak", buyer: "Peternak Sapi", price: "Rp 2.500/kg", icon: "☕" },
  { from: "Batang Jagung", to: "Biomassa", buyer: "Industri Energi", price: "Rp 1.200/kg", icon: "🌽" },
  { from: "Batang Pisang", to: "Industri Serat", buyer: "Pabrik Tekstil", price: "Rp 2.000/kg", icon: "🍌" },
];

function WasteDashboard() {
  const myWaste = products.filter((p) => p.type === "waste").slice(0, 3);
  return (
    <FarmerLayout title="Dashboard Limbah Pertanian">
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <KPI label="Total Inventori" value="5.5 ton" sub="3 jenis limbah" />
          <KPI label="Potensi Pendapatan" value={formatRupiah(8200000)} sub="Berdasarkan AI" />
          <KPI label="Pembeli Tertarik" value="24" sub="+6 minggu ini" />
        </div>

        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-honey" /><h2 className="font-display font-bold">AI Rekomendasi Pemanfaatan</h2></div>
            <Badge className="bg-honey/15 text-foreground border-honey/30">Powered by AI</Badge>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {aiSuggest.map((s) => (
              <div key={s.from} className="rounded-2xl border border-border/60 p-4 hover:border-primary/40 hover:bg-primary/5 transition">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-3xl">{s.icon}</div>
                  <div className="flex items-center gap-2 text-sm flex-1 min-w-0">
                    <span className="font-semibold truncate">{s.from}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="text-primary font-semibold truncate">{s.to}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{s.buyer}</span>
                  <span className="font-bold text-primary">{s.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold flex items-center gap-2"><Recycle className="h-5 w-5 text-primary" /> Inventori Limbah Anda</h2>
            <Button className="rounded-full gap-2">Tambah Limbah</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="text-left text-xs text-muted-foreground uppercase">
                <tr><th className="pb-3">Limbah</th><th>Stok</th><th>Harga</th><th>Pembeli Tertarik</th><th></th></tr>
              </thead>
              <tbody>
                {myWaste.map((w) => (
                  <tr key={w.id} className="border-t border-border/60">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <img src={w.image} className="h-10 w-10 rounded-lg object-cover" alt={w.name} />
                        <div className="font-medium">{w.name}</div>
                      </div>
                    </td>
                    <td>{w.stock} kg</td>
                    <td className="font-semibold">{formatRupiah(w.price)}/kg</td>
                    <td><Badge variant="outline" className="gap-1"><TrendingUp className="h-3 w-3" /> {Math.floor(Math.random() * 10 + 3)} pembeli</Badge></td>
                    <td className="text-right"><Button size="sm" variant="outline" className="rounded-full">Kelola</Button></td>
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

function KPI({ label, value, sub }: any) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-display text-2xl font-bold mt-1">{value}</div>
      <div className="text-xs text-primary mt-1">{sub}</div>
    </div>
  );
}
