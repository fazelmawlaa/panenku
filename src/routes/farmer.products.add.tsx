import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FarmerLayout } from "@/components/layout/FarmerLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sprout, Package, Recycle, Upload, Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/farmer/products/add")({
  head: () => ({ meta: [{ title: "Tambah Produk — PANENKU" }] }),
  component: AddProduct,
});

function AddProduct() {
  const [type, setType] = useState("preorder");

  return (
    <FarmerLayout title="Tambah Produk">
      <form onSubmit={(e) => { e.preventDefault(); toast.success("Produk berhasil disimpan!"); }} className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-5">
          {/* Type */}
          <div className="glass-card rounded-2xl p-5">
            <Label className="mb-3 block font-display font-bold">Tipe Produk</Label>
            <RadioGroup value={type} onValueChange={setType} className="grid sm:grid-cols-3 gap-3">
              {[
                { v: "preorder", icon: Sprout, t: "Pre-Order Panen", d: "Jual sebelum panen" },
                { v: "ready", icon: Package, t: "Ready Stock", d: "Stok siap kirim" },
                { v: "waste", icon: Recycle, t: "Limbah Pertanian", d: "Daur ulang & sirkular" },
              ].map((o) => {
                const Icon = o.icon;
                return (
                  <label key={o.v} className={`rounded-2xl border p-4 cursor-pointer transition flex flex-col gap-2 ${type === o.v ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`}>
                    <div className="flex items-center justify-between">
                      <Icon className="h-5 w-5 text-primary" />
                      <RadioGroupItem value={o.v} />
                    </div>
                    <div className="font-semibold text-sm">{o.t}</div>
                    <div className="text-xs text-muted-foreground">{o.d}</div>
                  </label>
                );
              })}
            </RadioGroup>
          </div>

          {/* Info */}
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <h3 className="font-display font-bold">Informasi Produk</h3>
            <div><Label className="mb-1.5 block">Nama Produk</Label><Input placeholder="Beras Pandan Wangi Premium" className="rounded-xl" /></div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="mb-1.5 block">Kategori</Label>
                <Select><SelectTrigger className="rounded-xl"><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                  <SelectContent><SelectItem value="beras">Beras</SelectItem><SelectItem value="sayur">Sayuran</SelectItem><SelectItem value="buah">Buah</SelectItem><SelectItem value="kopi">Kopi</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label className="mb-1.5 block">Metode Budidaya</Label><Input placeholder="Organik" className="rounded-xl" /></div>
              <div><Label className="mb-1.5 block">Harga per kg</Label><Input type="number" placeholder="14500" className="rounded-xl" /></div>
              <div><Label className="mb-1.5 block">Stok / Estimasi (kg)</Label><Input type="number" placeholder="600" className="rounded-xl" /></div>
              {type === "preorder" && (<>
                <div><Label className="mb-1.5 block">Estimasi Panen</Label><Input type="date" className="rounded-xl" /></div>
                <div><Label className="mb-1.5 block">Min. Pre-Order (kg)</Label><Input type="number" placeholder="5" className="rounded-xl" /></div>
              </>)}
            </div>
            <div><Label className="mb-1.5 block">Deskripsi</Label><Textarea rows={4} className="rounded-xl" placeholder="Jelaskan kualitas, asal, dan keunggulan produk Anda..." /></div>
          </div>

          {/* Images */}
          <div className="glass-card rounded-2xl p-5">
            <Label className="mb-3 block font-display font-bold">Foto Produk</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[0, 1, 2, 3].map((i) => (
                <label key={i} className="aspect-square rounded-2xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition grid place-items-center cursor-pointer">
                  <div className="text-center text-xs text-muted-foreground">
                    <Upload className="h-6 w-6 mx-auto mb-1" />
                    {i === 0 ? "Foto utama" : `Foto ${i + 1}`}
                  </div>
                  <input type="file" className="hidden" accept="image/*" />
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:sticky lg:top-24 h-fit space-y-4">
          <div className="glass-card rounded-2xl p-5 space-y-3">
            <h3 className="font-display font-bold">Publikasi</h3>
            <p className="text-xs text-muted-foreground">Produk akan dikurasi sebelum tampil di marketplace (max 1 jam).</p>
            <Button type="submit" size="lg" className="w-full rounded-full gap-2 shadow-soft"><Save className="h-4 w-4" /> Simpan Produk</Button>
            <Button type="button" variant="outline" size="lg" className="w-full rounded-full">Simpan sebagai Draft</Button>
          </div>
          <div className="glass-card rounded-2xl p-5">
            <h3 className="font-display font-bold mb-2 text-sm">💡 Tips AI</h3>
            <p className="text-xs text-muted-foreground">Foto produk yang jelas + deskripsi detail meningkatkan konversi hingga 3×.</p>
          </div>
        </div>
      </form>
    </FarmerLayout>
  );
}
