import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { products, formatRupiah } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Calendar, Sprout, Users, TrendingUp, Shield, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { fetchProductDetail } from "@/lib/products-db";

export const Route = createFileRoute("/pre-order/$id")({
  loader: async ({ params }) => {
    const details = await fetchProductDetail(params.id);
    if (!details || !details.product) throw notFound();
    return details.product;
  },
  head: ({ loaderData }) => ({ meta: [{ title: `Pre-Order ${loaderData?.name} — PANENKU` }] }),
  component: PreOrderPage,
});

function PreOrderPage() {
  const p = Route.useLoaderData();
  const [qty, setQty] = useState(10);
  const [notes, setNotes] = useState("");
  const [agree, setAgree] = useState(false);

  const subtotal = p.price * qty;
  const deposit = Math.round(subtotal * 0.3);
  const ordered = p.ordered ?? 0;
  const progress = (ordered / p.stock) * 100;

  return (
    <CustomerLayout>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        <Link to="/products/$id" params={{ id: p.id }} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Kembali ke produk
        </Link>

        <h1 className="font-display text-3xl font-bold mb-2">Pre-Order Hasil Panen</h1>
        <p className="text-muted-foreground mb-6">Pesan sekarang, dapatkan saat panen tiba dengan harga lebih hemat.</p>

        <div className="grid lg:grid-cols-[1fr_400px] gap-6">
          {/* Form */}
          <div className="space-y-5">
            {/* Product summary */}
            <div className="glass-card rounded-2xl p-5 flex gap-4">
              <img src={p.image} className="h-24 w-24 rounded-xl object-cover" alt={p.name} />
              <div className="min-w-0">
                <div className="font-display font-bold text-lg">{p.name}</div>
                <div className="text-sm text-muted-foreground">{p.farmer} · {p.location}</div>
                <div className="text-primary font-bold mt-1">{formatRupiah(p.price)} / {p.unit}</div>
              </div>
            </div>

            {/* Timeline */}
            <div className="glass-card rounded-2xl p-5">
              <h3 className="font-display font-bold mb-4 flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /> Timeline Panen</h3>
              <div className="space-y-3">
                {[
                  { t: "Sekarang", d: "Pesanan dikonfirmasi & DP dibayar" },
                  { t: "7 hari lagi", d: "Tanaman memasuki masa pra-panen" },
                  { t: p.estimatedHarvest, d: "Panen dimulai oleh petani" },
                  { t: "+3 hari", d: "Sortasi & pengiriman ke Anda" },
                ].map((s, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`h-3 w-3 rounded-full ${i === 0 ? "bg-primary" : "bg-muted-foreground/30"}`} />
                      {i < 3 && <div className="w-0.5 flex-1 bg-border my-1" />}
                    </div>
                    <div className="pb-3">
                      <div className="font-medium text-sm">{s.t}</div>
                      <div className="text-xs text-muted-foreground">{s.d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress */}
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-bold flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Progress Pre-Order</h3>
                <span className="text-sm font-semibold">{Math.round(progress)}%</span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden mb-3">
                <div className="h-full gradient-leaf transition-all" style={{ width: `${progress}%` }} />
              </div>
              <div className="grid grid-cols-3 gap-3 text-center text-sm">
                <Stat label="Sudah Dipesan" value={`${ordered} kg`} />
                <Stat label="Tersedia" value={`${p.stock - ordered} kg`} />
                <Stat label="Panen" value={p.estimatedHarvest ?? "—"} />
              </div>
            </div>

            {/* Form */}
            <div className="glass-card rounded-2xl p-5 space-y-4">
              <h3 className="font-display font-bold">Detail Pesanan</h3>
              <div>
                <Label className="mb-1.5 block">Jumlah (kg)</Label>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="rounded-full" onClick={() => setQty(Math.max(1, qty - 1))}>−</Button>
                  <Input type="number" value={qty} onChange={(e) => setQty(Math.max(1, +e.target.value))} className="text-center rounded-xl" />
                  <Button variant="outline" size="icon" className="rounded-full" onClick={() => setQty(qty + 1)}>+</Button>
                </div>
              </div>
              <div>
                <Label className="mb-1.5 block">Catatan Khusus</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Permintaan grading, pengemasan, dsb..." className="rounded-xl" rows={3} />
              </div>
              <label className="flex items-start gap-3 text-sm cursor-pointer">
                <Checkbox checked={agree} onCheckedChange={(v) => setAgree(!!v)} className="mt-0.5" />
                <span>Saya menyetujui <a className="text-primary underline">kontrak digital</a>, kebijakan deposit 30%, dan ketentuan PANENKU.</span>
              </label>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:sticky lg:top-24 h-fit space-y-4">
            <div className="glass-card rounded-2xl p-5 space-y-3">
              <h3 className="font-display font-bold">Ringkasan</h3>
              <Row label={`${qty} × ${formatRupiah(p.price)}`} value={formatRupiah(subtotal)} />
              <Row label="Estimasi ongkir" value="Dihitung saat panen" muted />
              <div className="border-t border-border pt-3">
                <Row label="Subtotal" value={formatRupiah(subtotal)} bold />
                <Row label="Deposit (30%)" value={formatRupiah(deposit)} accent />
                <Row label="Sisa saat panen" value={formatRupiah(subtotal - deposit)} muted />
              </div>
              <Button
                size="lg"
                className="w-full rounded-full mt-2 gap-2 shadow-soft"
                disabled={!agree}
                onClick={() => toast.success("Pre-order berhasil! Deposit akan ditagih.")}
              >
                <Sprout className="h-4 w-4" /> Konfirmasi Pre-Order
              </Button>
              <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
                <Shield className="h-3 w-3" /> Dilindungi PANENKU Protection
              </div>
            </div>
            <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-primary shrink-0" />
              <div className="text-xs"><b>Hemat 15%</b> dibanding harga pasar saat panen — AI Price Prediction.</div>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}

function Stat({ label, value }: any) { return <div className="rounded-xl bg-secondary/50 p-2"><div className="text-[10px] text-muted-foreground uppercase">{label}</div><div className="font-bold text-sm">{value}</div></div>; }
function Row({ label, value, bold, accent, muted }: any) {
  return <div className={`flex justify-between text-sm py-1 ${bold ? "font-semibold" : ""} ${accent ? "text-primary font-bold" : ""} ${muted ? "text-muted-foreground" : ""}`}><span>{label}</span><span>{value}</span></div>;
}
