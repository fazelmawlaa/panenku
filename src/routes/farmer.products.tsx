import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { FarmerLayout } from "@/components/layout/FarmerLayout";
import bgDashboard from "@/assets/bg_dashboard.jpg";
import { formatRupiah } from "@/lib/mock-data";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit3, Trash2, Archive, Loader2, Sprout, Package } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { fetchProductsFromSupabase, deleteProductFromSupabase, archiveProductInSupabase, updateProductInSupabase, restoreProductFromArchive } from "@/lib/products-db";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/farmer/products")({
  head: () => ({ meta: [{ title: "Marketplace Hasil Panen — PANENKU" }] }),
  component: ProductManagement,
});

function ProductManagement() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"all" | "preorder" | "ready" | "archived">("all");
  const [q, setQ] = useState("");
  const [list, setList] = useState<any[]>([]);
  const [archivedIds, setArchivedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadProducts = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await fetchProductsFromSupabase(true);
      const filtered = data.filter((p) => p.farmerId === user.id && p.type !== "waste");
      setList(filtered);
      // Archived products are those with stock === 0
      setArchivedIds(filtered.filter(p => p.stock === 0).map(p => p.id));
    } catch (err: any) {
      console.error(err);
      toast.error("Gagal memuat produk.");
    } finally {
      setIsLoading(false);
    }
  };

  const [isVerified, setIsVerified] = useState(true);

  useEffect(() => {
    if (user) {
      // Check verification
      const verifiedFlag = localStorage.getItem(`panenku_farmer_verified_${user.id}`);
      let lsBio: any = {};
      try {
        const rawBio = localStorage.getItem(`panenku_biodata_${user.id}`);
        if (rawBio) lsBio = JSON.parse(rawBio);
      } catch (e) { /* ignore */ }
      const hasKtp = lsBio.ktpNumber && lsBio.ktpNumber.length === 16;
      const hasKtpDb = profile?.ktp_number && profile.ktp_number.trim().length === 16;
      setIsVerified(verifiedFlag === "true" || !!hasKtp || !!hasKtpDb);

      // Load products
      loadProducts();
    } else {
      setIsLoading(false);
    }
  }, [user, profile]);

  // Edit states
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editUnit, setEditUnit] = useState("");
  const [editCultivation, setEditCultivation] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPayMethods, setEditPayMethods] = useState({
    ewallet: true,
    va: true,
    card: true,
  });
  const [editEwalletAccount, setEditEwalletAccount] = useState("");
  const [editVaAccount, setEditVaAccount] = useState("");
  const [editCardAccount, setEditCardAccount] = useState("");

  const handleEditClick = (p: any) => {
    setEditingProduct(p);
    setEditName(p.name);
    setEditCategory(p.category.toLowerCase());
    setEditPrice(p.price.toString());
    setEditStock(p.stock.toString());
    setEditUnit(p.unit || "kg");
    setEditCultivation(p.cultivation || "");
    setEditDescription(p.description || "");
    const pMethods = p.paymentMethods || ["ewallet", "va", "card"];
    setEditPayMethods({
      ewallet: pMethods.includes("ewallet"),
      va: pMethods.includes("va"),
      card: pMethods.includes("card"),
    });
    setEditEwalletAccount(p.paymentAccounts?.ewallet || "");
    setEditVaAccount(p.paymentAccounts?.va || "");
    setEditCardAccount(p.paymentAccounts?.card || "");
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
        category: editCategory,
        price: Number(editPrice),
        stock: Number(editStock),
        unit: editUnit,
        cultivation: editCultivation,
        description: editDescription,
        payment_methods: paymentMethodsStr,
      });
      toast.success("Produk berhasil diperbarui!");
      setEditingProduct(null);
      loadProducts();
    } catch (err: any) {
      toast.error(err.message || "Gagal memperbarui produk.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProductFromSupabase(id);
      toast.success("Produk berhasil dihapus!");
      loadProducts();
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus produk.");
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await archiveProductInSupabase(id);
      toast.success("Produk berhasil diarsipkan!");
      loadProducts();
    } catch (err: any) {
      toast.error(err.message || "Gagal mengarsipkan produk.");
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await restoreProductFromArchive(id);
      toast.success("Produk berhasil dipulihkan!");
      loadProducts();
    } catch (err: any) {
      toast.error(err.message || "Gagal memulihkan produk.");
    }
  };

  // Filter based on selected tabs and search queries
  const filteredList = list.filter((p) => {
    const isArchived = archivedIds.includes(p.id);
    const searchMatch = p.name.toLowerCase().includes(q.toLowerCase());
    
    if (tab === "archived") {
      return isArchived && searchMatch;
    }
    
    // For other tabs (all, preorder, ready), exclude archived items
    if (isArchived) return false;
    
    if (tab === "all") return searchMatch;
    return p.type === tab && searchMatch;
  });

  return (
    <FarmerLayout title="Marketplace Hasil Panen">
      <div className="space-y-8 relative">
        {/* Decorative backdrop patterns */}
        <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{ backgroundImage: "radial-gradient(#1a2b1b 1.5px, transparent 1.5px)", backgroundSize: "28px 28px" }} />
        <div className="absolute top-[5%] left-[-10%] w-[35vw] h-[35vw] rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none" />
          
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
            <div className="text-xs font-bold text-[#b4f05a] uppercase tracking-wider">Kelola Produk Tani</div>
            <h1 className="font-['Plus_Jakarta_Sans',sans-serif] text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              Marketplace <span className="font-['Playfair_Display',serif] italic font-light text-[#b4f05a]">Hasil Panen</span>
            </h1>
          </div>
          {isVerified && (
            <Button 
              onClick={() => navigate({ to: "/farmer/products-add" })}
              className="relative z-10 rounded-full gap-2 px-6 bg-[#b4f05a] hover:bg-[#a3db4e] text-black font-extrabold shadow-soft hover:scale-[1.02] transition border-0"
            >
              <Plus className="h-5 w-5" /> Tambah Produk
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
            {/* Filtering tabs */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
                <TabsList className="rounded-full p-1 h-auto bg-secondary/70 border border-border/20">
                  <TabsTrigger value="all" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-5 py-2 font-bold text-xs uppercase tracking-wider">Semua</TabsTrigger>
                  <TabsTrigger value="preorder" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-5 py-2 font-bold text-xs uppercase tracking-wider gap-1">
                    <Sprout className="h-3.5 w-3.5" /> Pre-Order
                  </TabsTrigger>
                  <TabsTrigger value="ready" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-5 py-2 font-bold text-xs uppercase tracking-wider gap-1">
                    <Package className="h-3.5 w-3.5" /> Ready Stock
                  </TabsTrigger>
                  <TabsTrigger value="archived" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-5 py-2 font-bold text-xs uppercase tracking-wider gap-1">
                    <Archive className="h-3.5 w-3.5" /> Diarsipkan
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex gap-2 items-center w-full sm:w-auto flex-1 max-w-sm">
                <div className="relative w-full">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    value={q} 
                    onChange={(e) => setQ(e.target.value)} 
                    placeholder="Cari komoditas..." 
                    className="pl-10 rounded-full bg-white border-border/40" 
                  />
                </div>
              </div>
            </div>

            {/* Product grid list */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm font-light">Memuat produk Anda...</p>
              </div>
            ) : filteredList.length === 0 ? (
              <div className="bg-white border border-border/40 rounded-[2.2rem] p-12 text-center text-muted-foreground text-sm font-light shadow-sm">
                Belum ada produk hasil panen terdaftar. Silakan klik "Tambah Produk" untuk mulai menjual.
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                {filteredList.map((p) => {
                  const isPreorder = p.type === "preorder";
                  return (
                    <div key={p.id} className="bg-white border border-border/40 rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden shadow-sm hover:shadow-soft hover:scale-[1.01] transition-all duration-300 flex flex-col text-left">
                      <div className="h-28 sm:h-44 relative bg-secondary">
                        <img src={p.image} className="h-full w-full object-cover" alt={p.name} />
                        <div className="absolute top-2 left-2 sm:top-4 sm:left-4">
                          <Badge className={`rounded-full px-2 py-0.5 sm:px-3 sm:py-1 font-bold text-[7px] sm:text-[9px] uppercase tracking-wider ${
                            isPreorder 
                              ? "bg-[#b4f05a] hover:bg-[#b4f05a]/90 text-emerald-900 border-[#b4f05a]/50" 
                              : "bg-emerald-600 hover:bg-emerald-700 text-white"
                          }`}>
                            {isPreorder ? "🌾 PO" : "📦 Ready"}
                          </Badge>
                        </div>
                        <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
                          <Badge className="bg-black/60 text-white rounded-full text-[7px] sm:text-[9px] uppercase font-bold px-1.5 py-0.5 sm:px-2.5 backdrop-blur-sm">
                            {p.category}
                          </Badge>
                        </div>
                      </div>

                      <div className="p-3 sm:p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-sm sm:text-lg text-foreground truncate">{p.name}</h3>
                          <div className="flex items-center gap-2 mt-1 sm:mt-1.5 text-[9px] sm:text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                            <span>Budidaya: {p.cultivation || "Organik"}</span>
                          </div>
                          
                          <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-border/30 grid grid-cols-2 gap-2 sm:gap-3 text-[10px] sm:text-xs">
                            <div>
                              <span className="text-muted-foreground block text-[8px] sm:text-[10px] uppercase font-bold">Harga per kg</span>
                              <span className="font-extrabold text-primary text-xs sm:text-base mt-0.5 block">{formatRupiah(p.price)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block text-[8px] sm:text-[10px] uppercase font-bold">
                                {isPreorder ? "Estimasi Stok" : "Stok Tersedia"}
                              </span>
                              <span className="font-bold text-foreground mt-0.5 block">{p.stock} {p.unit || "kg"}</span>
                            </div>
                          </div>

                          {isPreorder && (
                            <div className="mt-2.5 sm:mt-4 p-2 sm:p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 text-[9px] sm:text-[11px] text-amber-900 flex items-center gap-1.5 sm:gap-2">
                              <Sprout className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                              <span>Panen: <span className="font-bold">{p.estimated_harvest || "Segera"}</span></span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-border/40">
                          <Button 
                            onClick={() => handleEditClick(p)}
                            variant="outline" 
                            size="sm" 
                            className="rounded-full flex-1 gap-1 text-[9px] sm:text-[11px] font-bold h-8 px-2"
                          >
                            <Edit3 className="h-3.5 w-3.5 shrink-0" /> Edit
                          </Button>
                          {archivedIds.includes(p.id) ? (
                            <Button 
                              onClick={() => handleRestore(p.id)}
                              variant="outline" 
                              size="sm" 
                              className="rounded-full flex-1 gap-1 text-[9px] sm:text-[11px] font-bold text-emerald-700 border-emerald-200 hover:bg-emerald-50 h-8 px-2"
                            >
                              <Archive className="h-3.5 w-3.5 shrink-0" /> Buka
                            </Button>
                          ) : (
                            <Button 
                              onClick={() => handleArchive(p.id)}
                              variant="outline" 
                              size="sm" 
                              className="rounded-full flex-1 gap-1 text-[9px] sm:text-[11px] font-bold h-8 px-2"
                            >
                              <Archive className="h-3.5 w-3.5 shrink-0" /> Arsip
                            </Button>
                          )}
                          <Button 
                            onClick={() => handleDelete(p.id)}
                            variant="outline" 
                            size="icon" 
                            className="rounded-full text-destructive border-destructive/20 hover:bg-destructive/10 shrink-0 h-8 w-8"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
        </>
      )}
      </div>

      {/* Edit Product Dialog Modal */}
      <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent className="sm:max-w-[550px] rounded-3xl border border-gray-100 shadow-xl bg-white select-none">
          <DialogHeader>
            <DialogTitle className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-xl text-foreground">Edit Informasi Produk</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSave} className="space-y-4 pt-2 text-left">
            <div className="space-y-3">
              <div>
                <Label className="text-xs font-bold text-gray-700">Nama Produk</Label>
                <Input 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)} 
                  className="rounded-xl border-gray-200 mt-1" 
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-bold text-gray-700">Kategori</Label>
                  <Select value={editCategory} onValueChange={setEditCategory}>
                    <SelectTrigger className="rounded-xl border-gray-200 mt-1">
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="beras">Beras</SelectItem>
                      <SelectItem value="sayur">Sayuran</SelectItem>
                      <SelectItem value="buah">Buah</SelectItem>
                      <SelectItem value="kopi">Kopi</SelectItem>
                      <SelectItem value="alat">Alat & Pupuk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-bold text-gray-700">Satuan Unit</Label>
                  <Select value={editUnit} onValueChange={setEditUnit}>
                    <SelectTrigger className="rounded-xl border-gray-200 mt-1">
                      <SelectValue placeholder="Pilih satuan" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="kg">Per Kilo (kg)</SelectItem>
                      <SelectItem value="pcs">Satuan (pcs)</SelectItem>
                      <SelectItem value="ikat">Per Ikat</SelectItem>
                      <SelectItem value="liter">Per Liter (L)</SelectItem>
                      <SelectItem value="box">Per Box</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-bold text-gray-700">Harga Satuan (Rp)</Label>
                  <Input 
                    type="number"
                    value={editPrice} 
                    onChange={(e) => setEditPrice(e.target.value)} 
                    className="rounded-xl border-gray-200 mt-1" 
                    required 
                  />
                </div>

                <div>
                  <Label className="text-xs font-bold text-gray-700">Stok Tersedia</Label>
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
                <Label className="text-xs font-bold text-gray-700">Metode Budidaya</Label>
                <Input 
                  value={editCultivation} 
                  onChange={(e) => setEditCultivation(e.target.value)} 
                  className="rounded-xl border-gray-200 mt-1" 
                />
              </div>

              <div>
                <Label className="text-xs font-bold text-gray-700">Deskripsi</Label>
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
