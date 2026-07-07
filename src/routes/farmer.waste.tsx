import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { FarmerLayout } from "@/components/layout/FarmerLayout";
import { formatRupiah } from "@/lib/mock-data";
import { Sparkles, Recycle, ArrowRight, Plus, Trash2, Edit3, CircleDot, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { fetchProductsFromSupabase, deleteProductFromSupabase, updateProductInSupabase } from "@/lib/products-db";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/farmer/waste")({
  head: () => ({ meta: [{ title: "Marketplace Limbah Pertanian — RumohTani" }] }),
  component: WasteDashboard,
});

const aiSuggest = [
  { from: "Sekam Padi Mentah", to: "Pupuk Organik Bokashi", buyer: "Produsen Kompos Hijau", price: "Rp 1.500/kg", icon: "🌾" },
  { from: "Kulit Biji Kopi", to: "Pakan Ternak Sapi", buyer: "Peternakan Barokah Jaya", price: "Rp 2.500/kg", icon: "☕" },
  { from: "Batang Jagung Kering", to: "Biomassa Pellet Energi", buyer: "PT Industri Hijau Mandiri", price: "Rp 1.200/kg", icon: "🌽" },
  { from: "Batang Pohon Pisang", to: "Kerajinan Serat Organik", buyer: "Pabrik Tekstil Ecoprint", price: "Rp 2.000/kg", icon: "🍌" },
];

function WasteDashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [list, setList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadWaste = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await fetchProductsFromSupabase();
      const filtered = data.filter((p) => p.farmerId === user.id && p.type === "waste");
      setList(filtered);
    } catch (err: any) {
      console.error(err);
      toast.error("Gagal memuat inventori limbah.");
    } finally {
      setIsLoading(false);
    }
  };

  const [isVerified, setIsVerified] = useState(true);

  useEffect(() => {
    if (user) {
      const verifiedFlag = localStorage.getItem(`panenku_farmer_verified_${user.id}`);
      let lsBio: any = {};
      try {
        const raw = localStorage.getItem(`panenku_farmer_biodata_${user.id}`);
        if (raw) lsBio = JSON.parse(raw);
      } catch (e) { /* ignore */ }
      const hasKtp = lsBio.ktpNumber && lsBio.ktpNumber.length === 16;
      const hasKtpDb = profile?.ktp_number && profile.ktp_number.trim().length === 16;
      setIsVerified(verifiedFlag === "true" || !!hasKtp || !!hasKtpDb);
    }
  }, [user, profile]);

  useEffect(() => {
    loadWaste();
  }, [user]);

  // Edit states for waste
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editUnit, setEditUnit] = useState("");
  const [editCultivation, setEditCultivation] = useState(""); // represents source/asal for waste
  const [editDescription, setEditDescription] = useState("");

  const handleEditClick = (w: any) => {
    setEditingProduct(w);
    setEditName(w.name);
    setEditCategory(w.category === "Limbah" ? "sekam" : w.category.toLowerCase());
    setEditPrice(w.price.toString());
    setEditStock(w.stock.toString());
    setEditUnit(w.unit || "kg");
    setEditCultivation(w.cultivation || "");
    setEditDescription(w.description || "");
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      await updateProductInSupabase(editingProduct.id, {
        name: editName,
        category: "Limbah", // Keep main category as "Limbah" so it renders in buyer waste listings
        price: Number(editPrice),
        stock: Number(editStock),
        unit: editUnit,
        cultivation: editCultivation,
        description: editDescription
      });
      toast.success("Limbah pertanian berhasil diperbarui!");
      setEditingProduct(null);
      loadWaste();
    } catch (err: any) {
      toast.error(err.message || "Gagal memperbarui limbah.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProductFromSupabase(id);
      toast.success("Limbah pertanian berhasil dihapus!");
      loadWaste();
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus limbah.");
    }
  };

  // Metric aggregates
  const totalStockKg = list.reduce((sum, w) => sum + (Number(w.stock) || 0), 0);
  const totalPotentialIncome = list.reduce((sum, w) => sum + ((Number(w.stock) || 0) * (Number(w.price) || 0)), 0);

  return (
    <FarmerLayout title="Marketplace Limbah Pertanian">
      <div className="space-y-8 relative">
        {/* BG patterns */}
        <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{ backgroundImage: "radial-gradient(#1a2b1b 1.5px, transparent 1.5px)", backgroundSize: "28px 28px" }} />
        <div className="absolute top-[10%] right-[-10%] w-[30vw] h-[30vw] rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none" />
          
        {/* Header Card */}
        <div className="bg-white border border-border/40 rounded-[2rem] p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4 shadow-sm">
          <div>
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Ekosistem Sirkular</div>
            <h1 className="font-['Plus_Jakarta_Sans',sans-serif] text-3xl font-extrabold text-foreground tracking-tight mt-1">
              Marketplace <span className="font-['Playfair_Display',serif] italic font-light text-primary">Limbah Pertanian</span>
            </h1>
            <p className="text-sm text-muted-foreground font-light mt-1.5">Ubah sekam, jerami, batang pisang, and limbah kebun lainnya menjadi tambahan pendapatan berkelanjutan.</p>
          </div>
          {isVerified && (
            <Button 
              onClick={() => navigate({ to: "/farmer/products-add" })}
              className="rounded-full gap-2 px-6 shadow-soft hover:scale-[1.02] transition"
            >
              <Plus className="h-5 w-5" /> Tambah Limbah
            </Button>
          )}
        </div>

        {!isVerified ? (
          <div className="bg-white border border-border/40 rounded-[2.5rem] p-8 text-center max-w-xl mx-auto shadow-lg space-y-6 my-10 py-12 select-none">
            <div className="h-16 w-16 bg-red-500/10 text-red-600 rounded-2xl grid place-items-center mx-auto text-3xl">🔒</div>
            <div className="space-y-2">
              <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-2xl text-foreground">Verifikasi Akun Penjual Diperlukan</h2>
              <p className="text-sm font-light text-muted-foreground leading-relaxed">
                Untuk menjaga keamanan transaksi dan mencegah penipuan di platform RumohTani, Anda diwajibkan untuk melengkapi <strong className="font-bold">Profil & Biodata Penjual</strong>, termasuk mengunggah dokumen <strong className="font-bold">KTP</strong>, sebelum dapat menjual hasil tani atau limbah pertanian.
              </p>
            </div>
            <div className="pt-2">
              <Link to="/farmer/verify">
                <Button className="rounded-full px-8 shadow-soft font-bold bg-red-600 hover:bg-red-700 text-white">Lengkapi Verifikasi KTP</Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* KPI grid */}
            <div className="grid gap-6 sm:grid-cols-3">
          <KPI label="Total Stok Terdaftar" value={`${totalStockKg} kg`} sub="Kategori limbah aktif" accent="primary" />
          <KPI label="Estimasi Pendapatan" value={formatRupiah(totalPotentialIncome)} sub="Potensi sirkular daur ulang" accent="honey" />
          <KPI label="Peminat Industri" value="28 Pembeli" sub="+8 pembeli baru minggu ini" accent="leaf" />
        </div>

        {/* AI Circular Recommendation */}
        <div className="bg-white border border-border/40 rounded-[2rem] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-border/30 pb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-honey fill-honey/10 animate-pulse" />
              <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-lg text-foreground">AI Rekomendasi Pemanfaatan & Harga</h2>
            </div>
            <Badge className="bg-honey/10 text-amber-800 border-honey/20 rounded-full font-bold text-[9px] uppercase px-3 py-1">Circular AI</Badge>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {aiSuggest.map((s) => (
              <div key={s.from} className="rounded-2xl border border-border/40 p-4 hover:border-primary/30 hover:bg-emerald-500/5 transition duration-300">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-3xl shrink-0">{s.icon}</div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground flex-1 min-w-0">
                    <span className="truncate">{s.from}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="text-primary truncate">{s.to}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] font-semibold pt-2 border-t border-border/20">
                  <span className="text-muted-foreground">{s.buyer}</span>
                  <span className="text-primary font-bold">{s.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* My Waste Inventory */}
        <div className="bg-white border border-border/40 rounded-[2rem] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-border/30 pb-4">
            <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-lg text-foreground flex items-center gap-2">
              <Recycle className="h-5 w-5 text-primary" /> Inventori Limbah Organik Anda
            </h2>
            <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase">Aktif Tayang</Badge>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-light">Memuat limbah...</p>
            </div>
          ) : list.length === 0 ? (
            <div className="bg-white border border-border/40 rounded-[2.2rem] p-12 text-center text-muted-foreground text-sm font-light shadow-sm">
              Belum ada inventori limbah terdaftar. Silakan klik "Tambah Limbah" untuk mulai menawarkan.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {list.map((w) => (
                <div key={w.id} className="border border-border/40 rounded-[2rem] overflow-hidden hover:border-primary/20 hover:shadow-soft transition-all duration-300 flex flex-col justify-between p-5 text-left bg-secondary/10">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <img src={w.image} className="h-14 w-14 rounded-2xl object-cover border border-border/40 shadow-sm" alt={w.name} />
                      <div className="min-w-0">
                        <h3 className="font-bold text-base text-foreground truncate">{w.name}</h3>
                        <Badge className="bg-primary/10 text-emerald-800 border-primary/20 font-bold text-[9px] uppercase px-2 py-0.5 mt-1 rounded-full">
                          Limbah Tani
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2.5 text-xs pt-3 border-t border-border/20">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Volume Stok:</span>
                        <span className="font-bold text-foreground">{w.stock} {w.unit || "kg"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Harga Penawaran:</span>
                        <span className="font-black text-primary">{formatRupiah(w.price)}/{w.unit || "kg"}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Minat Industri:</span>
                        <span className="text-emerald-700 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1">
                          <CircleDot className="h-2.5 w-2.5 fill-current animate-ping" /> {Math.floor((w.price % 8) + 3)} pembeli
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-6 pt-4 border-t border-border/40">
                    <Button 
                      onClick={() => handleEditClick(w)}
                      variant="outline" 
                      size="sm" 
                      className="rounded-full flex-1 gap-1 text-[11px] font-bold"
                    >
                      <Edit3 className="h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button 
                      onClick={() => handleDelete(w.id)}
                      variant="outline" 
                      size="icon" 
                      className="rounded-full text-destructive border-destructive/20 hover:bg-destructive/10 shrink-0 h-9 w-9"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        </>
        )}

      </div>

      {/* Edit Waste Dialog Modal */}
      <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent className="sm:max-w-[550px] rounded-3xl border border-gray-100 shadow-xl bg-white select-none">
          <DialogHeader>
            <DialogTitle className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-xl text-foreground">Edit Informasi Limbah</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSave} className="space-y-4 pt-2 text-left">
            <div className="space-y-3">
              <div>
                <Label className="text-xs font-bold text-gray-700">Nama Limbah</Label>
                <Input 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)} 
                  className="rounded-xl border-gray-200 mt-1" 
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-bold text-gray-700">Satuan Unit</Label>
                  <Select value={editUnit} onValueChange={setEditUnit}>
                    <SelectTrigger className="rounded-xl border-gray-200 mt-1">
                      <SelectValue placeholder="Pilih satuan" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="kg">Per Kilo (kg)</SelectItem>
                      <SelectItem value="ton">Per Ton (t)</SelectItem>
                      <SelectItem value="box">Per Box</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-bold text-gray-700">Harga Penawaran (Rp)</Label>
                  <Input 
                    type="number"
                    value={editPrice} 
                    onChange={(e) => setEditPrice(e.target.value)} 
                    className="rounded-xl border-gray-200 mt-1" 
                    required 
                  />
                </div>

                <div className="col-span-2">
                  <Label className="text-xs font-bold text-gray-700">Volume Stok Tersedia</Label>
                  <Input 
                    type="number"
                    value={editStock} 
                    onChange={(e) => setEditStock(e.target.value)} 
                    className="rounded-xl border-gray-200 mt-1" 
                    required 
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-bold text-gray-700">Sumber Limbah (Asal)</Label>
                <Input 
                  value={editCultivation} 
                  onChange={(e) => setEditCultivation(e.target.value)} 
                  className="rounded-xl border-gray-200 mt-1" 
                  placeholder="Contoh: Perkebunan Kopi / Penggilingan Padi"
                />
              </div>

              <div>
                <Label className="text-xs font-bold text-gray-700">Deskripsi Pemanfaatan</Label>
                <Textarea 
                  value={editDescription} 
                  onChange={(e) => setEditDescription(e.target.value)} 
                  rows={3}
                  className="rounded-xl border-gray-200 mt-1 resize-none" 
                  required
                />
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-gray-50 flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setEditingProduct(null)}
                className="rounded-full px-5"
              >
                Batal
              </Button>
              <Button 
                type="submit" 
                className="rounded-full px-6 bg-primary text-white hover:bg-primary-dark font-bold"
              >
                Simpan Perubahan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </FarmerLayout>
  );
}

// Sub-component KPI card
function KPI({ label, value, sub, accent }: { label: string; value: string; sub: string; accent: "primary" | "honey" | "leaf" }) {
  const styles = {
    primary: "border-primary/20 bg-emerald-500/5 text-primary",
    honey: "border-amber-500/20 bg-amber-500/5 text-amber-800",
    leaf: "border-[#b4f05a]/30 bg-[#b4f05a]/5 text-emerald-900"
  };

  return (
    <div className={`bg-white border rounded-[2rem] p-6 text-left shadow-sm transition duration-300 hover:shadow-soft`}>
      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{label}</span>
      <h3 className="font-['Plus_Jakarta_Sans',sans-serif] text-3xl font-extrabold text-foreground tracking-tight mt-1.5">{value}</h3>
      <span className="text-[11px] text-muted-foreground/80 mt-1 block">{sub}</span>
    </div>
  );
}
