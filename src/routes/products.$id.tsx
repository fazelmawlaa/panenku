import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { products, formatRupiah } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Sprout, MessageCircle, ShoppingBag, Calendar, Leaf, Award, Shield, QrCode } from "lucide-react";

export const Route = createFileRoute("/products/$id")({
  loader: ({ params }) => {
    const p = products.find((x) => x.id === params.id);
    if (!p) throw notFound();
    return p;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name ?? "Produk"} — PANENKU` },
      { name: "description", content: loaderData?.description ?? "" },
      { property: "og:image", content: loaderData?.image ?? "" },
    ],
  }),
  component: ProductDetail,
});

function ProductDetail() {
  const p = Route.useLoaderData();
  const related = products.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4);

  return (
    <CustomerLayout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <div className="text-xs text-muted-foreground mb-4">
          <Link to="/products" className="hover:text-foreground">Katalog</Link> / {p.category} / <span className="text-foreground">{p.name}</span>
        </div>

        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-8">
          {/* Gallery */}
          <div className="space-y-3">
            <div className="aspect-square rounded-3xl overflow-hidden glass-card">
              <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[p.image, p.image, p.image, p.image].map((src, i) => (
                <div key={i} className={`aspect-square rounded-2xl overflow-hidden cursor-pointer border-2 ${i === 0 ? "border-primary" : "border-transparent"}`}>
                  <img src={src} alt="" className="h-full w-full object-cover opacity-80 hover:opacity-100" />
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-primary/10 text-primary border-primary/20">{p.category}</Badge>
              {p.type === "preorder" && <Badge className="bg-honey/15 text-foreground border-honey/30">Pre-Order</Badge>}
              {p.type === "waste" && <Badge className="bg-earth/10 text-earth border-earth/20">Limbah Pertanian</Badge>}
              <Badge variant="outline" className="gap-1"><Shield className="h-3 w-3" /> Petani Terverifikasi</Badge>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold">{p.name}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-honey text-honey" /> {p.rating} <span className="text-muted-foreground">({p.reviews} ulasan)</span></span>
              <span className="text-muted-foreground">·</span>
              <span className="flex items-center gap-1 text-muted-foreground"><MapPin className="h-3.5 w-3.5" /> {p.location}</span>
            </div>

            <div className="glass-card rounded-2xl p-5">
              <div className="text-xs text-muted-foreground">Harga</div>
              <div className="font-display text-4xl font-bold text-primary">{formatRupiah(p.price)}</div>
              <div className="text-sm text-muted-foreground">per {p.unit}</div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <InfoRow icon={Sprout} label="Petani" value={p.farmer} />
              <InfoRow icon={Leaf} label="Metode" value={p.cultivation ?? "—"} />
              <InfoRow icon={Calendar} label="Estimasi Panen" value={p.estimatedHarvest ?? "Siap kirim"} />
              <InfoRow icon={Award} label="Stok" value={`${p.stock} ${p.unit}`} />
            </div>

            {p.type === "preorder" && p.ordered !== undefined && (
              <div className="glass-card rounded-2xl p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">{p.ordered} {p.unit} terpesan</span>
                  <span className="text-muted-foreground">dari {p.stock} {p.unit}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full gradient-leaf" style={{ width: `${(p.ordered / p.stock) * 100}%` }} />
                </div>
              </div>
            )}

            <p className="text-sm text-foreground/80 leading-relaxed">{p.description}</p>

            <div className="flex flex-wrap gap-2">
              {p.type === "preorder" && (
                <Link to="/pre-order/$id" params={{ id: p.id }} className="flex-1 min-w-[160px]">
                  <Button size="lg" className="w-full rounded-full gap-2 shadow-soft"><Sprout className="h-4 w-4" /> Pre-Order</Button>
                </Link>
              )}
              {p.type !== "preorder" && (
                <Link to="/checkout/$id" params={{ id: p.id }} className="flex-1 min-w-[160px]">
                  <Button size="lg" className="w-full rounded-full gap-2 shadow-soft"><ShoppingBag className="h-4 w-4" /> Beli Sekarang</Button>
                </Link>
              )}
              <Button size="lg" variant="outline" className="rounded-full gap-2"><MessageCircle className="h-4 w-4" /> Chat Petani</Button>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground pt-2 border-t border-border/60">
              <QrCode className="h-4 w-4" /> Traceability QR tersedia · Sustainability Score: <span className="font-semibold text-primary">A+</span>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-2xl font-bold mb-5">Produk Serupa</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((r) => (
                <Link key={r.id} to="/products/$id" params={{ id: r.id }} className="glass-card rounded-2xl overflow-hidden group">
                  <img src={r.image} className="aspect-square w-full object-cover group-hover:scale-105 transition-transform duration-500" alt={r.name} />
                  <div className="p-3">
                    <div className="font-medium text-sm line-clamp-2">{r.name}</div>
                    <div className="text-primary font-bold mt-1">{formatRupiah(r.price)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </CustomerLayout>
  );
}

function InfoRow({ icon: Icon, label, value }: any) {
  return (
    <div className="glass-card rounded-xl p-3 flex items-center gap-3">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="h-4 w-4" /></div>
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="font-medium truncate">{value}</div>
      </div>
    </div>
  );
}
