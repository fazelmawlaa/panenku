import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { FarmerLayout } from "@/components/layout/FarmerLayout";
import bgDashboard from "@/assets/bg_dashboard.jpg";
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
  head: () => ({ meta: [{ title: "Marketplace Limbah Pertanian — PANENKU" }] }),
  component: WasteDashboard,
});


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
  const [editPayMethods, setEditPayMethods] = useState({
    ewallet: true,
    va: true,
    card: true,
  });
  const [editEwalletAccount, setEditEwalletAccount] = useState("");
  const [editVaAccount, setEditVaAccount] = useState("");
  const [editCardAccount, setEditCardAccount] = useState("");

  const handleEditClick = (w: any) => {
    setEditingProduct(w);
    setEditName(w.name);
    setEditCategory(w.category === "Limbah" ? "sekam" : w.category.toLowerCase());
    setEditPrice(w.price.toString());
    setEditStock(w.stock.toString());
    setEditUnit(w.unit || "kg");
    setEditCultivation(w.cultivation || "");
    setEditDescription(w.description || "");
    const pMethods = w.paymentMethods || ["ewallet", "va", "card"];
    setEditPayMethods({
      ewallet: pMethods.includes("ewallet"),
      va: pMethods.includes("va"),
      card: pMethods.includes("card"),
    });
    setEditEwalletAccount(w.paymentAccounts?.ewallet || "");
    setEditVaAccount(w.paymentAccounts?.va || "");
    setEditCardAccount(w.paymentAccounts?.card || "");
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      let paymentMethodsStr = Object.entries(editPayMethods)
        .filter(([_, enabled]) => enabled)
        .map(([key]) => {
          if (key === "ewallet") return `ewallet:${editEwalletAccount}`;
          if (key === "va") return `va:${editVaAccount}`;
          if (key === "card") return `card:${editCardAccount}`;
          return key;
        })
        .join(",");
      if (!paymentMethodsStr) {
        paymentMethodsStr = "ewallet,va,card";
      }

      await updateProductInSupabase(editingProduct.id, {
        name: editName,
        category: "Limbah", // Keep main category as "Limbah" so it renders in buyer waste listings
        price: Number(editPrice),
        stock: Number(editStock),
        unit: editUnit,
        cultivation: editCultivation,
        description: editDescription,
        payment_methods: paymentMethodsStr,
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
        <div
          className="relative overflow-hidden border border-emerald-800 rounded-[1.5rem] sm:rounded-[2.5rem] p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4 shadow-lg text-white"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(6, 78, 59, 0.95), rgba(6, 78, 59, 0.45)), url(${bgDashboard})`,
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        >
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(white 1px, transparent 1px)", backgroundSize: "16px 16px" }} />
          <div className="relative z-10">
            <div className="text-xs font-bold text-[#b4f05a] uppercase tracking-wider">Ekosistem Sirkular</div>
            <h1 className="font-['Plus_Jakarta_Sans',sans-serif] text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              Marketplace <span className="font-['Playfair_Display',serif] italic font-light text-[#b4f05a]">Limbah Pertanian</span>
            </h1>
          </div>
          {isVerified && (
            <Button
              onClick={() => navigate({ to: "/farmer/waste-add" })}
              className="relative z-10 rounded-full gap-2 px-6 bg-[#b4f05a] hover:bg-[#a3db4e] text-black font-extrabold shadow-soft hover:scale-[1.02] transition border-0"
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
                Untuk menjaga keamanan transaksi dan mencegah penipuan di platform PANENKU, Anda diwajibkan untuk melengkapi <strong className="font-bold">Profil & Biodata Penjual</strong>, termasuk mengunggah dokumen <strong className="font-bold">KTP</strong>, sebelum dapat menjual hasil tani atau limbah pertanian.
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
            <div className="grid gap-6 sm:grid-cols-2">
              <KPI label="Total Stok Terdaftar" value={`${totalStockKg} kg`} sub="Kategori limbah aktif" accent="primary" />
              <KPI label="Estimasi Pendapatan" value={formatRupiah(totalPotentialIncome)} sub="Potensi sirkular daur ulang" accent="honey" />
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
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                  {list.map((w) => (
                    <div key={w.id} className="border border-border/40 rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden hover:border-primary/20 hover:shadow-soft transition-all duration-300 flex flex-col justify-between p-3 sm:p-5 text-left bg-secondary/10">
                      <div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                          <img src={w.image} className="h-10 w-10 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl object-cover border border-border/40 shadow-sm shrink-0" alt={w.name} />
                          <div className="min-w-0">
                            <h3 className="font-bold text-xs sm:text-base text-foreground truncate">{w.name}</h3>
                            <Badge className="bg-primary/10 text-emerald-800 border-primary/20 font-bold text-[7px] sm:text-[9px] uppercase px-1.5 py-0.5 sm:px-2 mt-0.5 rounded-full">
                              Limbah Tani
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-1.5 sm:space-y-2.5 text-[10px] sm:text-xs pt-2 sm:pt-3 border-t border-border/20">
                          <div className="flex justify-between flex-wrap gap-1">
                            <span className="text-muted-foreground">Volume:</span>
                            <span className="font-bold text-foreground">{w.stock} {w.unit || "kg"}</span>
                          </div>
                          <div className="flex justify-between flex-wrap gap-1">
                            <span className="text-muted-foreground">Harga:</span>
                            <span className="font-black text-primary">{formatRupiah(w.price)}/{w.unit || "kg"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-border/40">
                        <Button
                          onClick={() => handleEditClick(w)}
                          variant="outline"
                          size="sm"
                          className="rounded-full flex-1 gap-1 text-[9px] sm:text-[11px] font-bold h-8 px-2"
                        >
                          <Edit3 className="h-3.5 w-3.5 shrink-0" /> Edit
                        </Button>
                        <Button
                          onClick={() => handleDelete(w.id)}
                          variant="outline"
                          size="icon"
                          className="rounded-full text-destructive border-destructive/20 hover:bg-destructive/10 shrink-0 h-8 w-8"
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

              <div>
                <Label className="text-xs font-bold text-gray-700">Metode Pembayaran yang Diterima</Label>
                <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-200 mt-1 space-y-3">
                  {/* E-Wallet */}
                  <div className="flex flex-col gap-1.5">
                    <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer select-none">
                      <input 
                        type="checkbox"
                        checked={editPayMethods.ewallet}
                        onChange={(e) => setEditPayMethods({ ...editPayMethods, ewallet: e.target.checked })}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      E-Wallet
                    </label>
                    {editPayMethods.ewallet && (
                      <Input
                        type="text"
                        value={editEwalletAccount}
                        onChange={(e) => setEditEwalletAccount(e.target.value)}
                        placeholder="Contoh: DANA - 08123456789"
                        className="h-8 text-xs rounded-lg border-gray-200 bg-white"
                        required
                      />
                    )}
                  </div>

                  {/* Virtual Account */}
                  <div className="flex flex-col gap-1.5">
                    <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer select-none">
                      <input 
                        type="checkbox"
                        checked={editPayMethods.va}
                        onChange={(e) => setEditPayMethods({ ...editPayMethods, va: e.target.checked })}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      Virtual Account
                    </label>
                    {editPayMethods.va && (
                      <Input
                        type="text"
                        value={editVaAccount}
                        onChange={(e) => setEditVaAccount(e.target.value)}
                        placeholder="Contoh: Mandiri VA - 8961234567890"
                        className="h-8 text-xs rounded-lg border-gray-200 bg-white"
                        required
                      />
                    )}
                  </div>

                  {/* Kartu Kredit/Debit */}
                  <div className="flex flex-col gap-1.5">
                    <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer select-none">
                      <input 
                        type="checkbox"
                        checked={editPayMethods.card}
                        onChange={(e) => setEditPayMethods({ ...editPayMethods, card: e.target.checked })}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      Kartu Kredit/Debit
                    </label>
                    {editPayMethods.card && (
                      <Input
                        type="text"
                        value={editCardAccount}
                        onChange={(e) => setEditCardAccount(e.target.value)}
                        placeholder="Contoh: BCA - 1234567890"
                        className="h-8 text-xs rounded-lg border-gray-200 bg-white"
                        required
                      />
                    )}
                  </div>
                </div>
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
