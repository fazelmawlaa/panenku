import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { ProductCard } from "@/components/ProductCard";
import { products } from "@/lib/mock-data";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Search, SlidersHorizontal } from "lucide-react";

export const Route = createFileRoute("/products")({
  head: () => ({ meta: [{ title: "Katalog Produk — PANENKU" }, { name: "description", content: "Telusuri hasil panen pre-order, ready stock, dan limbah pertanian dari seluruh Indonesia." }] }),
  component: Catalog,
});

function Catalog() {
  const [tab, setTab] = useState<"all" | "preorder" | "ready" | "waste">("all");
  const [q, setQ] = useState("");
  const [loc, setLoc] = useState("all");
  const [cat, setCat] = useState("all");
  const [price, setPrice] = useState([200000]);

  const locations = Array.from(new Set(products.map((p) => p.location.split(",")[0])));
  const categories = Array.from(new Set(products.map((p) => p.category)));

  const filtered = useMemo(() => products.filter((p) => {
    if (tab !== "all" && p.type !== tab) return false;
    if (q && !p.name.toLowerCase().includes(q.toLowerCase())) return false;
    if (loc !== "all" && !p.location.startsWith(loc)) return false;
    if (cat !== "all" && p.category !== cat) return false;
    if (p.price > price[0]) return false;
    return true;
  }), [tab, q, loc, cat, price]);

  return (
    <CustomerLayout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold">Katalog Produk</h1>
          <p className="text-muted-foreground text-sm mt-1">{filtered.length} produk tersedia</p>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="mb-6">
          <TabsList className="rounded-full p-1 h-auto bg-secondary/60 backdrop-blur">
            <TabsTrigger value="all" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-5 py-2">Semua</TabsTrigger>
            <TabsTrigger value="preorder" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-5 py-2">Pre-Order</TabsTrigger>
            <TabsTrigger value="ready" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-5 py-2">Ready Stock</TabsTrigger>
            <TabsTrigger value="waste" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-5 py-2">Limbah Pertanian</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          {/* Filters */}
          <aside className="glass-card rounded-2xl p-5 h-fit lg:sticky lg:top-24 space-y-5">
            <div className="flex items-center gap-2 font-display font-semibold">
              <SlidersHorizontal className="h-4 w-4" /> Filter
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Cari produk..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9 rounded-full bg-background" />
            </div>
            <FilterBlock label="Lokasi">
              <Select value={loc} onValueChange={setLoc}>
                <SelectTrigger className="rounded-xl bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Lokasi</SelectItem>
                  {locations.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </FilterBlock>
            <FilterBlock label="Kategori">
              <Select value={cat} onValueChange={setCat}>
                <SelectTrigger className="rounded-xl bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </FilterBlock>
            <FilterBlock label={`Harga maks: Rp${price[0].toLocaleString("id-ID")}`}>
              <Slider value={price} onValueChange={setPrice} min={1000} max={200000} step={1000} />
            </FilterBlock>
            <FilterBlock label="Estimasi Panen">
              <Select defaultValue="all">
                <SelectTrigger className="rounded-xl bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Waktu</SelectItem>
                  <SelectItem value="7">≤ 7 hari</SelectItem>
                  <SelectItem value="14">≤ 14 hari</SelectItem>
                  <SelectItem value="30">≤ 30 hari</SelectItem>
                </SelectContent>
              </Select>
            </FilterBlock>
          </aside>

          {/* Grid */}
          <div>
            {filtered.length === 0 ? (
              <div className="glass-card rounded-2xl p-12 text-center">
                <p className="text-muted-foreground">Tidak ada produk yang cocok.</p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}

function FilterBlock({ label, children }: any) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</div>
      {children}
    </div>
  );
}
