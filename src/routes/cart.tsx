import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { products, formatRupiah } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2, Tag, ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Keranjang — PANENKU" }] }),
  component: Cart,
});

const initial = [
  { id: products[0].id, qty: 10 },
  { id: products[2].id, qty: 3 },
  { id: products[6].id, qty: 50 },
];

function Cart() {
  const [items, setItems] = useState(initial);
  const list = items.map((i) => ({ ...products.find((p) => p.id === i.id)!, qty: i.qty }));

  const subtotal = list.reduce((s, p) => s + p.price * p.qty, 0);
  const shipping = 25000;
  const total = subtotal + shipping;

  const setQty = (id: string, q: number) => setItems(items.map((i) => i.id === id ? { ...i, qty: Math.max(1, q) } : i));
  const remove = (id: string) => setItems(items.filter((i) => i.id !== id));

  const groups: Record<string, typeof list> = { preorder: [], ready: [], waste: [] };
  list.forEach((p) => groups[p.type].push(p));

  return (
    <CustomerLayout>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        <h1 className="font-display text-3xl font-bold mb-6">Keranjang Belanja</h1>

        {list.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center">
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-4">Keranjang kosong</p>
            <Link to="/products"><Button className="rounded-full">Mulai Belanja</Button></Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_380px] gap-6">
            <div className="space-y-5">
              {(["preorder", "ready", "waste"] as const).map((key) => groups[key].length > 0 && (
                <div key={key} className="glass-card rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge className={
                      key === "preorder" ? "bg-primary/10 text-primary border-primary/20" :
                      key === "ready" ? "bg-honey/15 text-foreground border-honey/30" :
                      "bg-earth/10 text-earth border-earth/20"
                    }>
                      {key === "preorder" ? "Pre-Order" : key === "ready" ? "Ready Stock" : "Limbah Pertanian"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{groups[key].length} item</span>
                  </div>
                  <div className="space-y-4">
                    {groups[key].map((p) => (
                      <div key={p.id} className="flex flex-wrap items-center gap-4 pb-4 border-b last:border-0 border-border/60">
                        <img src={p.image} className="h-20 w-20 rounded-xl object-cover" alt={p.name} />
                        <div className="flex-1 min-w-[140px]">
                          <Link to="/products/$id" params={{ id: p.id }} className="font-semibold hover:text-primary">{p.name}</Link>
                          <div className="text-xs text-muted-foreground">{p.farmer} · {p.location}</div>
                          <div className="text-primary font-bold mt-1">{formatRupiah(p.price)} / {p.unit}</div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="outline" size="icon" className="rounded-full h-8 w-8" onClick={() => setQty(p.id, p.qty - 1)}>−</Button>
                          <span className="w-10 text-center font-semibold">{p.qty}</span>
                          <Button variant="outline" size="icon" className="rounded-full h-8 w-8" onClick={() => setQty(p.id, p.qty + 1)}>+</Button>
                        </div>
                        <div className="font-bold w-24 text-right">{formatRupiah(p.price * p.qty)}</div>
                        <button onClick={() => remove(p.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:sticky lg:top-24 h-fit space-y-4">
              <div className="glass-card rounded-2xl p-5">
                <div className="flex gap-2 mb-4">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Kode voucher" className="pl-9 rounded-full" />
                  </div>
                  <Button variant="outline" className="rounded-full">Pakai</Button>
                </div>
              </div>
              <div className="glass-card rounded-2xl p-5 space-y-3">
                <h3 className="font-display font-bold">Ringkasan</h3>
                <Row label="Subtotal" value={formatRupiah(subtotal)} />
                <Row label="Pengiriman" value={formatRupiah(shipping)} />
                <div className="border-t border-border pt-3 flex justify-between font-display text-lg font-bold">
                  <span>Total</span><span className="text-primary">{formatRupiah(total)}</span>
                </div>
                <Link to="/checkout/$id" params={{ id: list[0].id }}>
                  <Button size="lg" className="w-full rounded-full mt-2 shadow-soft">Checkout</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}

function Row({ label, value }: any) { return <div className="flex justify-between text-sm"><span className="text-muted-foreground">{label}</span><span>{value}</span></div>; }
