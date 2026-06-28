import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { products, formatRupiah } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, CreditCard, Wallet, Building2, MapPin, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout/$id")({
  loader: ({ params }) => {
    const p = products.find((x) => x.id === params.id);
    if (!p) throw notFound();
    return p;
  },
  head: () => ({ meta: [{ title: "Checkout — PANENKU" }] }),
  component: Checkout,
});

function Checkout() {
  const p = Route.useLoaderData();
  const [qty, setQty] = useState(2);
  const [pay, setPay] = useState("ewallet");

  const subtotal = p.price * qty;
  const shipping = 18000;
  const total = subtotal + shipping;

  return (
    <CustomerLayout>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        <Link to="/products/$id" params={{ id: p.id }} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Kembali
        </Link>
        <h1 className="font-display text-3xl font-bold mb-6">Checkout</h1>

        <div className="grid lg:grid-cols-[1fr_400px] gap-6">
          <div className="space-y-5">
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 font-display font-bold mb-4"><MapPin className="h-4 w-4 text-primary" /> Alamat Pengiriman</div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div><Label className="mb-1.5 block">Nama Penerima</Label><Input defaultValue="Andi Pratama" className="rounded-xl" /></div>
                <div><Label className="mb-1.5 block">No. HP</Label><Input defaultValue="0812-xxxx-xxxx" className="rounded-xl" /></div>
                <div className="sm:col-span-2"><Label className="mb-1.5 block">Alamat Lengkap</Label><Textarea defaultValue="Jl. Sudirman No. 42, Jakarta Pusat" className="rounded-xl" rows={2} /></div>
                <div><Label className="mb-1.5 block">Kota</Label><Input defaultValue="Jakarta Pusat" className="rounded-xl" /></div>
                <div><Label className="mb-1.5 block">Kode Pos</Label><Input defaultValue="10220" className="rounded-xl" /></div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5">
              <div className="font-display font-bold mb-4">Jumlah</div>
              <div className="flex items-center gap-3">
                <img src={p.image} className="h-16 w-16 rounded-xl object-cover" alt={p.name} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{p.name}</div>
                  <div className="text-sm text-muted-foreground">{formatRupiah(p.price)} / {p.unit}</div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" className="rounded-full h-8 w-8" onClick={() => setQty(Math.max(1, qty - 1))}>−</Button>
                  <span className="w-8 text-center font-semibold">{qty}</span>
                  <Button variant="outline" size="icon" className="rounded-full h-8 w-8" onClick={() => setQty(qty + 1)}>+</Button>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5">
              <div className="font-display font-bold mb-4">Metode Pembayaran</div>
              <RadioGroup value={pay} onValueChange={setPay} className="space-y-2">
                {[
                  { v: "ewallet", icon: Wallet, t: "E-Wallet", d: "GoPay, OVO, DANA, ShopeePay" },
                  { v: "va", icon: Building2, t: "Virtual Account", d: "BCA, BNI, BRI, Mandiri" },
                  { v: "card", icon: CreditCard, t: "Kartu Kredit/Debit", d: "Visa, Mastercard, JCB" },
                ].map((m) => {
                  const Icon = m.icon;
                  return (
                    <label key={m.v} className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition ${pay === m.v ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`}>
                      <RadioGroupItem value={m.v} />
                      <Icon className="h-5 w-5 text-primary" />
                      <div className="flex-1"><div className="font-medium text-sm">{m.t}</div><div className="text-xs text-muted-foreground">{m.d}</div></div>
                    </label>
                  );
                })}
              </RadioGroup>
            </div>
          </div>

          <div className="lg:sticky lg:top-24 h-fit">
            <div className="glass-card rounded-2xl p-5 space-y-3">
              <h3 className="font-display font-bold">Ringkasan Pesanan</h3>
              <div className="flex justify-between text-sm"><span>Subtotal ({qty} {p.unit})</span><span>{formatRupiah(subtotal)}</span></div>
              <div className="flex justify-between text-sm"><span>Ongkos kirim</span><span>{formatRupiah(shipping)}</span></div>
              <div className="border-t border-border pt-3 flex justify-between font-display text-lg font-bold"><span>Total</span><span className="text-primary">{formatRupiah(total)}</span></div>
              <Button size="lg" className="w-full rounded-full gap-2 shadow-soft" onClick={() => toast.success("Pesanan berhasil! Cek halaman pesanan.")}>
                <ShoppingBag className="h-4 w-4" /> Bayar Sekarang
              </Button>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
