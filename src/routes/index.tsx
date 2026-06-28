import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShoppingBag, Sprout, Recycle, TrendingUp, FileSignature, Leaf,
  ArrowRight, CheckCircle2, Star, Quote, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { ProductCard } from "@/components/ProductCard";
import { products, priceTrend, testimonials, farmers } from "@/lib/mock-data";
import {
  LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PANENKU — Dari Petani, Untuk Indonesia" },
      { name: "description", content: "Marketplace hasil panen Indonesia. Pre-order panen, ready stock, dan limbah pertanian dalam satu platform." },
    ],
  }),
  component: Home,
});

const features = [
  { icon: Sprout, text: "Pre-order hasil panen" },
  { icon: ShoppingBag, text: "Produk siap kirim" },
  { icon: Recycle, text: "Marketplace limbah pertanian" },
  { icon: TrendingUp, text: "Harga pasar realtime" },
  { icon: FileSignature, text: "Kontrak digital" },
  { icon: Leaf, text: "Pertanian berkelanjutan" },
];

function Home() {
  const popular = products.slice(0, 4);
  const preorder = products.filter((p) => p.type === "preorder");
  const ready = products.filter((p) => p.type === "ready");
  const waste = products.filter((p) => p.type === "waste").slice(0, 4);

  return (
    <CustomerLayout>
      {/* HERO */}
      <section className="relative overflow-hidden gradient-hero">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-12 pb-20 lg:pt-20 lg:pb-32 grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full glass-card px-4 py-1.5 text-xs font-medium">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              Platform agritech terpercaya #1 Indonesia
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05]">
              Marketplace Hasil Panen Berbasis{" "}
              <span className="text-gradient">Pre-Order</span> dan{" "}
              <span className="text-gradient">Pasokan Langsung</span>
            </h1>
            <p className="text-base sm:text-lg text-foreground/70 max-w-xl">
              Hubungkan langsung dengan petani Indonesia. Pesan sebelum panen, belanja segar, atau dapatkan limbah pertanian untuk bisnis Anda.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/products"><Button size="lg" className="rounded-full gap-2 h-12 px-7 shadow-glow">
                <Sprout className="h-4 w-4" /> Pre-Order Sekarang
              </Button></Link>
              <Link to="/products"><Button size="lg" variant="outline" className="rounded-full gap-2 h-12 px-7 bg-background/80 backdrop-blur">
                Belanja Produk <ArrowRight className="h-4 w-4" />
              </Button></Link>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2">
              {features.slice(0, 3).map((f) => (
                <div key={f.text} className="flex items-center gap-2 text-sm text-foreground/70">
                  <CheckCircle2 className="h-4 w-4 text-primary" /> {f.text}
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <img className="rounded-3xl shadow-glow aspect-[3/4] w-full object-cover" src="https://images.unsplash.com/photo-1500076656116-558758c991c1?auto=format&fit=crop&w=600&q=70" alt="Sawah" />
                <div className="glass-card rounded-2xl p-4">
                  <div className="text-xs text-muted-foreground">Petani Aktif</div>
                  <div className="font-display text-2xl font-bold text-primary">12,400+</div>
                </div>
              </div>
              <div className="space-y-4 pt-10">
                <div className="glass-card rounded-2xl p-4">
                  <div className="text-xs text-muted-foreground">Transaksi Hari Ini</div>
                  <div className="font-display text-2xl font-bold text-primary">Rp 2.8M</div>
                </div>
                <img className="rounded-3xl shadow-glow aspect-[3/4] w-full object-cover" src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=70" alt="Tomat" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 -mt-10 relative z-10">
        <div className="glass-card rounded-3xl p-6 sm:p-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.text} className="flex flex-col items-center text-center gap-2">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-xs sm:text-sm font-medium">{f.text}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* POPULAR */}
      <Section title="Produk Populer" subtitle="Paling dicari minggu ini" link="/products">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {popular.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </Section>

      {/* PRE ORDER */}
      <Section title="Pre-Order Hasil Panen" subtitle="Pesan sekarang, panen kemudian — harga lebih hemat" link="/products" highlight>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {preorder.slice(0, 3).map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </Section>

      {/* READY */}
      <Section title="Produk Siap Kirim" subtitle="Stok tersedia, dikirim hari ini" link="/products">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ready.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </Section>

      {/* WASTE */}
      <Section title="Limbah Pertanian" subtitle="Ekonomi sirkular — limbah jadi cuan" link="/waste">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {waste.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </Section>

      {/* FARMER STORIES */}
      <Section title="Cerita Petani" subtitle="Mereka tumbuh bersama PANENKU">
        <div className="grid gap-5 md:grid-cols-3">
          {farmers.map((f) => (
            <div key={f.id} className="glass-card rounded-3xl overflow-hidden hover:shadow-glow transition group">
              <div className="aspect-[4/3] overflow-hidden">
                <img src={f.image} alt={f.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-5">
                <div className="font-display text-lg font-bold">{f.name}</div>
                <div className="text-sm text-muted-foreground">{f.farm} · {f.location}</div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5">{f.landSize}</span>
                  <span className="rounded-full bg-honey/15 px-2 py-0.5">{f.certification}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-honey text-honey" />{f.rating}</span>
                  <span className="text-muted-foreground">{f.harvests} panen sukses</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* PRICE TREND */}
      <Section title="Tren Harga Pasar" subtitle="Pantau harga komoditas realtime">
        <div className="glass-card rounded-3xl p-6">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Line type="monotone" dataKey="beras" stroke="var(--leaf)" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="cabai" stroke="var(--honey)" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="tomat" stroke="var(--earth)" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-xs">
            <Legend dot="var(--leaf)" label="Beras" />
            <Legend dot="var(--honey)" label="Cabai" />
            <Legend dot="var(--earth)" label="Tomat" />
          </div>
        </div>
      </Section>

      {/* HOW IT WORKS */}
      <Section title="Cara Kerja PANENKU" subtitle="3 langkah mudah">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { n: "01", t: "Jelajahi & Pilih", d: "Telusuri produk pre-order, ready stock, atau limbah pertanian dari petani lokal." },
            { n: "02", t: "Pesan & Bayar", d: "Pre-order dengan DP atau bayar langsung. Aman dengan kontrak digital." },
            { n: "03", t: "Terima Panen", d: "Pantau status pesanan dari panen hingga pengiriman ke alamat Anda." },
          ].map((s) => (
            <div key={s.n} className="glass-card rounded-3xl p-6 relative overflow-hidden">
              <div className="font-display text-6xl font-bold text-primary/10 absolute -top-2 -right-2">{s.n}</div>
              <div className="relative">
                <div className="font-display text-xl font-bold mb-2">{s.t}</div>
                <p className="text-sm text-muted-foreground">{s.d}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* TESTIMONIALS */}
      <Section title="Kata Mereka" subtitle="Dipercaya ribuan pengguna">
        <div className="grid gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.name} className="glass-card rounded-3xl p-6">
              <Quote className="h-7 w-7 text-primary/40 mb-3" />
              <p className="text-sm leading-relaxed mb-4">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full gradient-leaf text-white font-semibold">{t.name[0]}</div>
                <div>
                  <div className="font-medium text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
                <div className="ml-auto flex">
                  {Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-honey text-honey" />)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="relative overflow-hidden rounded-[2rem] gradient-leaf p-10 sm:p-14 text-white text-center shadow-glow">
          <div className="absolute inset-0 opacity-20" style={{
            background: "radial-gradient(circle at 30% 30%, white 0%, transparent 40%), radial-gradient(circle at 70% 70%, white 0%, transparent 40%)",
          }} />
          <div className="relative">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-3">Jadi bagian dari revolusi pertanian Indonesia</h2>
            <p className="text-white/90 max-w-2xl mx-auto mb-6">Mulai jual hasil panen Anda atau temukan produk segar langsung dari petani.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/farmer"><Button size="lg" variant="secondary" className="rounded-full h-12 px-7">Daftar Sebagai Petani</Button></Link>
              <Link to="/products"><Button size="lg" variant="outline" className="rounded-full h-12 px-7 bg-transparent text-white border-white/40 hover:bg-white/10 hover:text-white">Mulai Belanja</Button></Link>
            </div>
          </div>
        </div>
      </section>
    </CustomerLayout>
  );
}

function Section({ title, subtitle, link, highlight, children }: any) {
  return (
    <section className={`mx-auto max-w-7xl px-4 sm:px-6 py-12 ${highlight ? "" : ""}`}>
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold">{title}</h2>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        {link && (
          <Link to={link} className="text-sm font-medium text-primary hover:underline flex items-center gap-1 shrink-0">
            Lihat semua <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function Legend({ dot, label }: { dot: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: dot }} />
      <span>{label}</span>
    </div>
  );
}
