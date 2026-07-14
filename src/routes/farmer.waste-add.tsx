import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { FarmerLayout } from "@/components/layout/FarmerLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Recycle, Save, Loader2, Upload, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { saveProductToSupabase } from "@/lib/products-db";
import { formatRupiah } from "@/lib/mock-data";
import limbahImg from "@/assets/limbah_pertanian.png";

export const Route = createFileRoute("/farmer/waste-add")({
  head: () => ({ meta: [{ title: "Tambah Limbah Pertanian — PANENKU" }] }),
  component: AddWaste,
});

function AddWaste() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [cultivation, setCultivation] = useState(""); // Sumber Limbah (Asal)
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [unit, setUnit] = useState("kg");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerified, setIsVerified] = useState(true);
  const [payMethods, setPayMethods] = useState({
    ewallet: true,
    va: true,
    card: true,
  });
  const [ewalletAccount, setEwalletAccount] = useState("");
  const [vaAccount, setVaAccount] = useState("");
  const [cardAccount, setCardAccount] = useState("");

  // AI Price Recommendation State
  const [aiRecommendation, setAiRecommendation] = useState<any>(null);

  useEffect(() => {
    if (category === "sekam") {
      setAiRecommendation({
        price: 1500,
        demand: "Tinggi",
        buyer: "Produsen Kompos Hijau",
        reason: "Sekam padi mentah sedang sangat dicari oleh industri pembuatan kompos hijau untuk media tanam sirkular."
      });
    } else if (category === "jerami") {
      setAiRecommendation({
        price: 1200,
        demand: "Tinggi",
        buyer: "Peternakan Sapi Potong Sukabumi",
        reason: "Jerami padi kering digunakan sebagai pakan serat kasar berkualitas tinggi untuk peternakan sapi setempat."
      });
    } else if (category === "kulit_kopi") {
      setAiRecommendation({
        price: 2500,
        demand: "Sedang",
        buyer: "Peternakan Barokah Jaya",
        reason: "Kulit kopi kering difermentasi untuk bahan campuran pakan ternak konsentrat tinggi protein nabati."
      });
    } else if (category === "ampas_tebu") {
      setAiRecommendation({
        price: 1800,
        demand: "Tinggi",
        buyer: "Pabrik Kertas & Biomassa",
        reason: "Ampas tebu kering digunakan sebagai bahan pulp pembuatan kertas dan briket pembakar industri."
      });
    } else if (category === "bonggol_jagung") {
      setAiRecommendation({
        price: 1200,
        demand: "Tinggi",
        buyer: "PT Industri Hijau Mandiri",
        reason: "Bonggol jagung kering dihancurkan untuk dijadikan arang briket biomassa alternatif ramah lingkungan."
      });
    } else {
      setAiRecommendation(null);
    }
  }, [category]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
        toast.success("Foto limbah terpilih!");
      };
      reader.readAsDataURL(file);
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Silakan masuk ke akun Anda terlebih dahulu.");
      return;
    }
    if (!category) {
      toast.error("Silakan pilih kategori limbah.");
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedImg = imageUrl || "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=70";

      let paymentMethodsStr = Object.entries(payMethods)
        .filter(([_, enabled]) => enabled)
        .map(([key]) => {
          if (key === "ewallet") return `ewallet:${ewalletAccount}`;
          if (key === "va") return `va:${vaAccount}`;
          if (key === "card") return `card:${cardAccount}`;
          return key;
        })
        .join(",");
      if (!paymentMethodsStr) {
        paymentMethodsStr = "ewallet,va,card";
      }

      await saveProductToSupabase({
        name,
        category: "Limbah",
        type: "waste",
        farmer: profile?.full_name || user.email?.split("@")[0] || "Petani Mitra",
        farmer_id: user.id,
        location: profile?.address || "Indonesia",
        price: Number(price),
        unit: unit,
        stock: Number(stock),
        description,
        image: selectedImg,
        estimated_harvest: null,
        cultivation: cultivation || null,
        payment_methods: paymentMethodsStr,
      });

      toast.success("Limbah pertanian berhasil diterbitkan!");
      navigate({ to: "/farmer/waste" });
    } catch (err: any) {
      toast.error(err.message || "Gagal memublikasikan limbah.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FarmerLayout title="Tambah Limbah Pertanian">
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
        <form onSubmit={handleSubmit} className="w-full space-y-6 text-left">
          <div className="space-y-6">
            {/* Cover Card Banner */}
            <div className="relative overflow-hidden rounded-[2.5rem] border border-gray-100/80 shadow-[0_15px_50px_-20px_rgba(26,43,27,0.04)] bg-white/95 backdrop-blur-md">
              <div className="relative h-[280px] sm:h-[320px] w-full overflow-hidden">
                <img 
                  src={limbahImg} 
                  alt="Tambah Limbah" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                
                <div className="absolute top-6 left-6 sm:top-8 sm:left-8 bg-black/40 backdrop-blur-md border border-white/10 text-white text-[11px] font-bold font-['Plus_Jakarta_Sans',sans-serif] px-4 py-2 rounded-full uppercase tracking-wider">
                  Tipe Produk: Limbah Tani
                </div>

                <div className="absolute bottom-8 left-0 right-0 p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className="h-11 w-11 rounded-2xl bg-white/25 backdrop-blur-lg flex items-center justify-center border border-white/20">
                      <Recycle className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="font-['Plus_Jakarta_Sans',sans-serif] text-2xl sm:text-3xl font-black text-white tracking-tight">Limbah Pertanian</h2>
                  </div>
                  <p className="text-white/80 font-light text-xs sm:text-sm max-w-xl leading-relaxed">
                    Ubah limbah pertanian seperti sekam, jerami, dan kulit kopi menjadi sumber pendapatan tambahan yang berkelanjutan melalui ekosistem sirkular.
                  </p>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="bg-white/90 border border-gray-100/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_15px_50px_-20px_rgba(26,43,27,0.04)] backdrop-blur-md">
              <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-lg text-foreground/90 border-b border-gray-100/80 pb-3">
                Detail Informasi Limbah Pertanian
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block text-sm font-semibold text-gray-700">Nama Produk</Label>
                  <Input 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Contoh: Sekam Padi Mentah Berkualitas"
                    className="rounded-2xl border-gray-200/80 bg-gray-50/30 hover:bg-gray-50/50 focus:bg-white transition-all h-11" 
                    required 
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <Label className="mb-2 block text-sm font-semibold text-gray-700">Kategori Limbah</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="rounded-2xl border-gray-200/80 bg-gray-50/30 hover:bg-gray-50/50 focus:bg-white transition-all h-11">
                        <SelectValue placeholder="Pilih kategori limbah" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-gray-100">
                        <SelectItem value="sekam" className="rounded-xl">Sekam Padi</SelectItem>
                        <SelectItem value="jerami" className="rounded-xl">Jerami Padi</SelectItem>
                        <SelectItem value="kulit_kopi" className="rounded-xl">Kulit Kopi</SelectItem>
                        <SelectItem value="ampas_tebu" className="rounded-xl">Ampas Tebu</SelectItem>
                        <SelectItem value="bonggol_jagung" className="rounded-xl">Bonggol Jagung</SelectItem>
                        <SelectItem value="lainnya" className="rounded-xl">Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="mb-2 block text-sm font-semibold text-gray-700">Satuan Unit Penjualan</Label>
                    <Select value={unit} onValueChange={setUnit}>
                      <SelectTrigger className="rounded-2xl border-gray-200/80 bg-gray-50/30 hover:bg-gray-50/50 focus:bg-white transition-all h-11">
                        <SelectValue placeholder="Pilih satuan" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-gray-100">
                        <SelectItem value="kg" className="rounded-xl">Per Kilo (kg)</SelectItem>
                        <SelectItem value="ton" className="rounded-xl">Per Ton (t)</SelectItem>
                        <SelectItem value="box" className="rounded-xl">Per Box</SelectItem>
                        <SelectItem value="karung" className="rounded-xl">Per Karung</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="mb-2 block text-sm font-semibold text-gray-700">Sumber Limbah (Asal)</Label>
                    <Input 
                      value={cultivation} 
                      onChange={(e) => setCultivation(e.target.value)} 
                      placeholder="Contoh: Penggilingan Padi / Perkebunan Kopi" 
                      className="rounded-2xl border-gray-200/80 bg-gray-50/30 hover:bg-gray-50/50 focus:bg-white transition-all h-11" 
                    />
                  </div>

                  <div>
                    <Label className="mb-2 block text-sm font-semibold text-gray-700">Stok Limbah Tersedia</Label>
                    <Input 
                      type="number" 
                      value={stock} 
                      onChange={(e) => setStock(e.target.value)} 
                      placeholder="600" 
                      className="rounded-2xl border-gray-200/80 bg-gray-50/30 hover:bg-gray-50/50 focus:bg-white transition-all h-11" 
                      required 
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Label className="mb-2 block text-sm font-semibold text-gray-700">Harga Satuan (Rp)</Label>
                    <div className="space-y-1">
                      <Input 
                        type="number" 
                        value={price} 
                        onChange={(e) => setPrice(e.target.value)} 
                        placeholder="1500" 
                        className="rounded-2xl border-gray-200/80 bg-gray-50/30 hover:bg-gray-50/50 focus:bg-white transition-all h-11" 
                        required 
                      />
                      
                      {/* AI Recommendation Widget */}
                      {aiRecommendation && (
                        <div className="mt-3 p-4 rounded-2xl bg-gradient-to-br from-emerald-50/50 to-emerald-500/[0.03] border border-emerald-500/20 shadow-sm relative overflow-hidden text-left animate-fadeIn">
                          <div className="absolute top-0 right-0 p-3 text-emerald-500/10 pointer-events-none">
                            <Sparkles className="h-10 w-10" />
                          </div>
                          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                            <Sparkles className="h-4 w-4 text-amber-500 fill-amber-500/10 animate-pulse" />
                            <span>Circular AI: Rekomendasi Harga Optimum</span>
                          </div>
                          <p className="text-xs text-muted-foreground font-light mt-1.5 leading-relaxed">
                            {aiRecommendation.reason}
                          </p>
                          <div className="flex flex-wrap items-center justify-between gap-3 mt-3.5 pt-3 border-t border-emerald-500/10">
                            <div>
                              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Estimasi Harga Rekomendasi</div>
                              <div className="text-emerald-700 font-extrabold text-base mt-0.5">{formatRupiah(aiRecommendation.price)} / kg</div>
                            </div>
                            <Button
                              type="button"
                              onClick={() => {
                                setPrice(aiRecommendation.price.toString());
                                toast.success("Harga rekomendasi AI berhasil diterapkan!");
                              }}
                              className="rounded-full bg-primary text-white text-xs font-bold px-4 py-2 hover:scale-[1.02] active:scale-[0.98] transition border-0 shrink-0 shadow-sm"
                            >
                              Terapkan Harga
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <Label className="block text-sm font-semibold text-gray-700">Foto Limbah</Label>
                  <label className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-primary/50 rounded-2xl cursor-pointer transition bg-gray-50/30 hover:bg-white h-48 w-full overflow-hidden group">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageChange} 
                      className="hidden" 
                    />
                    
                    {imageUrl ? (
                      <>
                        <img 
                          src={imageUrl} 
                          alt="Pratinjau limbah" 
                          className="absolute inset-0 w-full h-full object-cover transition duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2">
                          <Upload className="h-7 w-7 text-white" />
                          <span className="text-xs text-white font-bold">Ganti Foto Limbah</span>
                        </div>
                        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm border border-white/10 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider select-none">
                          Foto Terunggah
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-6 text-center">
                        <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2.5 transition duration-300 group-hover:scale-110">
                          <Upload className="h-5 w-5" />
                        </div>
                        <p className="text-sm font-semibold text-gray-700">Pilih berkas atau unggah foto limbah</p>
                        <p className="text-xs text-gray-500 font-light mt-1">Mendukung format PNG, JPG, JPEG (Max 5MB)</p>
                      </div>
                    )}
                  </label>
                </div>

                <div>
                  <Label className="mb-2 block text-sm font-semibold text-gray-700">Deskripsi</Label>
                  <Textarea 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    rows={4} 
                    className="rounded-2xl border-gray-200/80 bg-gray-50/30 hover:bg-gray-50/50 focus:bg-white transition-all resize-none" 
                    placeholder="Jelaskan kualitas, asal-usul, kelembaban, dan ketersediaan limbah pertanian Anda..." 
                    required 
                  />
                </div>

                <div>
                  <Label className="mb-2 block text-sm font-semibold text-gray-700">Metode Pembayaran yang Diterima</Label>
                  <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-200/40 space-y-4">
                    {/* E-Wallet */}
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer select-none">
                        <input 
                          type="checkbox"
                          checked={payMethods.ewallet}
                          onChange={(e) => setPayMethods({ ...payMethods, ewallet: e.target.checked })}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        E-Wallet
                      </label>
                      {payMethods.ewallet && (
                        <div className="pl-6 max-w-md">
                          <Input
                            type="text"
                            value={ewalletAccount}
                            onChange={(e) => setEwalletAccount(e.target.value)}
                            placeholder="Contoh: DANA - 08123456789 (a.n. Fazel)"
                            className="h-9 text-xs rounded-xl border-gray-200/80 bg-white"
                            required
                          />
                        </div>
                      )}
                    </div>

                    {/* Virtual Account */}
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer select-none">
                        <input 
                          type="checkbox"
                          checked={payMethods.va}
                          onChange={(e) => setPayMethods({ ...payMethods, va: e.target.checked })}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        Virtual Account
                      </label>
                      {payMethods.va && (
                        <div className="pl-6 max-w-md">
                          <Input
                            type="text"
                            value={vaAccount}
                            onChange={(e) => setVaAccount(e.target.value)}
                            placeholder="Contoh: Mandiri VA - 8961234567890"
                            className="h-9 text-xs rounded-xl border-gray-200/80 bg-white"
                            required
                          />
                        </div>
                      )}
                    </div>

                    {/* Kartu Kredit/Debit */}
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer select-none">
                        <input 
                          type="checkbox"
                          checked={payMethods.card}
                          onChange={(e) => setPayMethods({ ...payMethods, card: e.target.checked })}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        Kartu Kredit/Debit
                      </label>
                      {payMethods.card && (
                        <div className="pl-6 max-w-md">
                          <Input
                            type="text"
                            value={cardAccount}
                            onChange={(e) => setCardAccount(e.target.value)}
                            placeholder="Contoh: BCA - 1234567890 (a.n. Fazel)"
                            className="h-9 text-xs rounded-xl border-gray-200/80 bg-white"
                            required
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 pb-8">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate({ to: "/farmer/waste" })}
                className="w-full sm:w-auto rounded-full px-8 h-12 border-gray-200 text-gray-600 hover:bg-gray-50 font-medium transition-all"
              >
                Kembali
              </Button>
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <Button 
                  type="button" 
                  onClick={() => {
                    setName("");
                    setCategory("");
                    setCultivation("");
                    setPrice("");
                    setStock("");
                    setDescription("");
                    setImageUrl("");
                  }}
                  className="w-full sm:w-auto rounded-full px-8 h-12 bg-yellow-500 hover:bg-yellow-600 text-white font-bold shadow-[0_4px_14px_rgba(234,179,8,0.25)] hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Reset Form
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="w-full sm:w-auto rounded-full px-10 h-12 gap-2 font-bold shadow-[0_4px_14px_rgba(16,185,129,0.25)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.35)] transition-all bg-primary text-white hover:bg-primary-dark"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Menerbitkan...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Terbitkan Limbah
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      )}
    </FarmerLayout>
  );
}
