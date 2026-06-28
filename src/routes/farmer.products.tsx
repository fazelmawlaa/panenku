import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { FarmerLayout } from "@/components/layout/FarmerLayout";
import { products, formatRupiah } from "@/lib/mock-data";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit3, Trash2, Archive, Filter } from "lucide-react";

export const Route = createFileRoute("/farmer/products")({
  head: () => ({ meta: [{ title: "Manajemen Produk — PANENKU" }] }),
  component: ProductManagement,
});

function ProductManagement() {
  const [tab, setTab] = useState<"all" | "preorder" | "ready" | "waste">("all");
  const [q, setQ] = useState("");
  const list = products.filter((p) => (tab === "all" || p.type === tab) && p.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <FarmerLayout title="Manajemen Produk">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
          <TabsList className="rounded-full p-1 h-auto bg-secondary/60">
            <TabsTrigger value="all" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-1.5">Semua</TabsTrigger>
            <TabsTrigger value="preorder" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-1.5">Pre-Order</TabsTrigger>
            <TabsTrigger value="ready" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-1.5">Ready</TabsTrigger>
            <TabsTrigger value="waste" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-1.5">Limbah</TabsTrigger>
          </TabsList>
        </Tabs>
        <Link to="/farmer/products/add"><Button className="rounded-full gap-2"><Plus className="h-4 w-4" /> Tambah Produk</Button></Link>
      </div>

      <div className="glass-card rounded-2xl p-5">
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari produk..." className="pl-9 rounded-full" />
          </div>
          <Button variant="outline" className="rounded-full gap-2"><Filter className="h-4 w-4" /> Filter</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead className="text-left text-xs text-muted-foreground uppercase">
              <tr><th className="pb-3">Produk</th><th>Tipe</th><th>Harga</th><th>Stok</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id} className="border-t border-border/60">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.image} className="h-12 w-12 rounded-lg object-cover" alt={p.name} />
                      <div className="min-w-0">
                        <div className="font-medium truncate">{p.name}</div>
                        <div className="text-xs text-muted-foreground">{p.category}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <Badge variant="outline" className="capitalize">
                      {p.type === "preorder" ? "Pre-Order" : p.type === "ready" ? "Ready" : "Limbah"}
                    </Badge>
                  </td>
                  <td className="font-semibold">{formatRupiah(p.price)}</td>
                  <td>{p.stock} {p.unit}</td>
                  <td><Badge className="bg-primary/10 text-primary border-primary/20">Aktif</Badge></td>
                  <td>
                    <div className="flex gap-1 justify-end">
                      <Button size="icon" variant="ghost" className="h-8 w-8"><Edit3 className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8"><Archive className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </FarmerLayout>
  );
}
