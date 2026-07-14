import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { FarmerLayout } from "@/components/layout/FarmerLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sprout, Package, Recycle, Save, Loader2, ChevronLeft, ChevronRight, Upload, Wrench } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { saveProductToSupabase } from "@/lib/products-db";
import preorderImg from "@/assets/preorder_panen.png";
import readyStockImg from "@/assets/ready_stock.png";
import limbahImg from "@/assets/limbah_pertanian.png";
import alatTaniImg from "@/assets/alat_tani.png";

export const Route = createFileRoute("/farmer/products-add")({
  head: () => ({ meta: [{ title: "Tambah Produk — PANENKU" }] }),
  component: AddProduct,
});

function AddProduct() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [type, setType] = useState("preorder");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [cultivation, setCultivation] = useState("Organik");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [estimatedHarvest, setEstimatedHarvest] = useState("");
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
        toast.success("Foto produk terpilih!");
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

      let isKtpVerifiedFromDbAddress = false;
      if (profile?.address && profile.address.trim().startsWith("{")) {
        try {
          const parsed = JSON.parse(profile.address);
          isKtpVerifiedFromDbAddress = !!parsed.is_verified || (parsed.ktp_number && String(parsed.ktp_number).length === 16);
        } catch (e) {}
      }

      const hasKtp = lsBio.ktpNumber && String(lsBio.ktpNumber).length === 16;
      const hasKtpDb = (profile?.ktp_number && profile.ktp_number.trim().length === 16) || isKtpVerifiedFromDbAddress;
      setIsVerified(verifiedFlag === "true" || !!hasKtp || !!hasKtpDb);
    }
  }, [user, profile]);

  // Default images lookup in case farmer does not provide one
  const defaultImages: Record<string, string> = {
    beras: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=70",
    sayur: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=70",
    buah: "https://images.unsplash.com/photo-1601039641847-7857b994d704?auto=format&fit=crop&w=800&q=70",
    kopi: "https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?auto=format&fit=crop&w=800&q=70",
    sekam: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=70",
    jerami: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=70",
    kulit_kopi: "https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?auto=format&fit=crop&w=800&q=70",
    ampas_tebu: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=70",
    bonggol_jagung: "https://images.unsplash.com/photo-1601039641847-7857b994d704?auto=format&fit=crop&w=800&q=70",
    lainnya: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=70",
    alat: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=70",
    pupuk: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=70",
    bibit: "https://images.unsplash.com/photo-1601039641847-7857b994d704?auto=format&fit=crop&w=800&q=70",
    mesin: "https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?auto=format&fit=crop&w=800&q=70",
  };

  // Adjust defaults when type changes
  useEffect(() => {
    setImageUrl("");
    setName("");
    setPrice("");
    setStock("");
    setEstimatedHarvest("");
    setDescription("");
    
    if (type === "preorder" || type === "ready") {
      setCategory("");
      setUnit("kg");
      setCultivation("Organik");
    } else if (type === "waste") {
      setCategory("");
      setUnit("kg");
      setCultivation(""); // Will represent source/asal
    } else if (type === "tools") {
      setCategory("alat");
      setUnit("pcs");
      setCultivation("Baru"); // Will represent condition
    }
  }, [type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Silakan masuk ke akun Anda terlebih dahulu.");
      return;
    }
    if (!category) {
      toast.error("Silakan pilih kategori produk.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const selectedImg = imageUrl || defaultImages[category] || "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=70";
      
      // Calculate category database value
      let dbCategory = category;
      if (type === "waste") {
        dbCategory = "Limbah";
      } else if (type === "tools") {
        dbCategory = "Alat";
      } else {
        dbCategory = category.charAt(0).toUpperCase() + category.slice(1);
      }
      
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
        category: dbCategory,
        type: type,
        farmer: profile?.full_name || user.email?.split("@")[0] || "Petani Mitra",
        farmer_id: user.id,
        location: profile?.address || "Indonesia",
        price: Number(price),
        unit: unit,
        stock: Number(stock),
        description,
        image: selectedImg,
        estimated_harvest: type === "preorder" && estimatedHarvest ? estimatedHarvest : null,
        cultivation: cultivation || null,
        payment_methods: paymentMethodsStr,
      });

      toast.success("Produk Anda berhasil diterbitkan!");
      navigate({ to: "/farmer/products" });
    } catch (err: any) {
      toast.error(err.message || "Gagal memublikasikan produk.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FarmerLayout title="Tambah Produk">
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
            <Button 
              onClick={() => navigate({ to: "/farmer/verify" })}
              className="rounded-full px-8 shadow-soft font-bold bg-red-600 hover:bg-red-700 text-white"
            >
              Lengkapi Verifikasi KTP
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="w-full space-y-6 text-left">
          <div className="space-y-6">
            {/* Type Carousel (Edge-to-Edge Full Card Image) */}
            {(() => {
              const types = [
                { v: "preorder", icon: Sprout, t: "Pre-Order Panen", d: "Jual hasil panen sebelum panen tiba. Pembeli memesan dan membayar di muka untuk mendapatkan komoditas segar langsung dari lahan Anda.", img: preorderImg },
                { v: "ready", icon: Package, t: "Ready Stock", d: "Stok komoditas yang sudah siap kirim. Pembeli langsung membeli tanpa menunggu masa panen.", img: readyStockImg },
                { v: "tools", icon: Wrench, t: "Alat & Pupuk Tani", d: "Sediakan peralatan tani, bibit, atau pupuk berkualitas untuk menunjang aktivitas pertanian petani lain.", img: alatTaniImg },
              ];
              const currentIdx = types.findIndex(t => t.v === type);
              const current = types[currentIdx] || types[0];
              const Icon = current.icon;

              const goNext = () => {
                const nextIdx = (currentIdx + 1) % types.length;
                setType(types[nextIdx].v);
              };
              const goPrev = () => {
                const prevIdx = (currentIdx - 1 + types.length) % types.length;
                setType(types[prevIdx].v);
              };

              return (
                <div className="relative overflow-hidden rounded-[2.5rem] border border-gray-100/80 shadow-[0_15px_50px_-20px_rgba(26,43,27,0.04)] bg-white/95 backdrop-blur-md">
                  {/* Background Image */}
                  <div className="relative h-[420px] sm:h-[480px] w-full overflow-hidden">
                    <img 
                      src={current.img} 
                      alt={current.t} 
                      className="w-full h-full object-cover transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    
                    {/* Badge Overlay */}
                    <div className="absolute top-6 left-6 sm:top-8 sm:left-8 bg-black/40 backdrop-blur-md border border-white/10 text-white text-[11px] font-bold font-['Plus_Jakarta_Sans',sans-serif] px-4 py-2 rounded-full uppercase tracking-wider">
                      Pilih Tipe Produk
                    </div>

                    {/* Arrows */}
                    <button
                      type="button"
                      onClick={goPrev}
                      className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/95 backdrop-blur-md shadow-lg flex items-center justify-center hover:bg-white hover:scale-105 active:scale-95 transition-all z-10 border border-gray-100"
                    >
                      <ChevronLeft className="h-6 w-6 text-gray-700" />
                    </button>
                    <button
                      type="button"
                      onClick={goNext}
                      className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/95 backdrop-blur-md shadow-lg flex items-center justify-center hover:bg-white hover:scale-105 active:scale-95 transition-all z-10 border border-gray-100"
                    >
                      <ChevronRight className="h-6 w-6 text-gray-700" />
                    </button>

                    {/* Content overlay on image */}
                    <div className="absolute bottom-10 left-0 right-0 p-6 sm:p-8">
                      <div className="flex items-center gap-3 mb-2.5">
                        <div className="h-11 w-11 rounded-2xl bg-white/25 backdrop-blur-lg flex items-center justify-center border border-white/20">
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-2xl font-extrabold text-white font-['Plus_Jakarta_Sans',sans-serif] tracking-tight">{current.t}</h3>
                      </div>
                      <p className="text-sm sm:text-base text-white/85 font-light leading-relaxed max-w-3xl mb-4">{current.d}</p>
                    </div>

                    {/* Dots indicator - Absolute overlaid on image */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
                      {types.map((t, i) => (
                        <button
                          key={t.v}
                          type="button"
                          onClick={() => setType(t.v)}
                          className={`h-2 rounded-full transition-all duration-300 ${
                            i === currentIdx 
                              ? "w-8 bg-white" 
                              : "w-2 bg-white/40 hover:bg-white/60"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Info */}
            <div className="bg-white/90 border border-gray-100/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_15px_50px_-20px_rgba(26,43,27,0.04)] backdrop-blur-md">
              <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-lg text-foreground/90 border-b border-gray-100/80 pb-3">
                {type === "preorder" && "Detail Informasi Pre-Order Panen"}
                {type === "ready" && "Detail Informasi Ready Stock"}
                {type === "waste" && "Detail Informasi Limbah Pertanian"}
                {type === "tools" && "Detail Informasi Alat & Pupuk Tani"}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block text-sm font-semibold text-gray-700">
                    {type === "tools" ? "Nama Alat / Produk" : "Nama Produk"}
                  </Label>
                  <Input 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder={
                      type === "preorder" || type === "ready" ? "Contoh: Beras Pandan Wangi Premium" :
                      type === "waste" ? "Contoh: Sekam Padi Kering" : "Contoh: Cangkul Baja Super / Pupuk NPK"
                    } 
                    className="rounded-2xl border-gray-200/80 bg-gray-50/30 hover:bg-gray-50/50 focus:bg-white transition-all h-11" 
                    required 
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  {type !== "waste" && type !== "tools" && (
                    <div>
                      <Label className="mb-2 block text-sm font-semibold text-gray-700">Kategori Hasil Tani</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="rounded-2xl border-gray-200/80 bg-gray-50/30 hover:bg-gray-50/50 focus:bg-white transition-all h-11">
                          <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-gray-100">
                          <SelectItem value="beras" className="rounded-xl">Beras</SelectItem>
                          <SelectItem value="sayur" className="rounded-xl">Sayuran</SelectItem>
                          <SelectItem value="buah" className="rounded-xl">Buah</SelectItem>
                          <SelectItem value="kopi" className="rounded-xl">Kopi</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {type === "waste" && (
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
                  )}

                  {type === "tools" && (
                    <div>
                      <Label className="mb-2 block text-sm font-semibold text-gray-700">Kondisi Alat / Produk</Label>
                      <Select value={cultivation} onValueChange={setCultivation}>
                        <SelectTrigger className="rounded-2xl border-gray-200/80 bg-gray-50/30 hover:bg-gray-50/50 focus:bg-white transition-all h-11">
                          <SelectValue placeholder="Pilih kondisi" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-gray-100">
                          <SelectItem value="Baru" className="rounded-xl">Baru (Segel/Original)</SelectItem>
                          <SelectItem value="Bekas Layak Pakai" className="rounded-xl">Bekas Layak Pakai</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <Label className="mb-2 block text-sm font-semibold text-gray-700">Satuan Unit Penjualan</Label>
                    <Select value={unit} onValueChange={setUnit}>
                      <SelectTrigger className="rounded-2xl border-gray-200/80 bg-gray-50/30 hover:bg-gray-50/50 focus:bg-white transition-all h-11">
                        <SelectValue placeholder="Pilih satuan" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-gray-100">
                        {type === "tools" ? (
                          <>
                            <SelectItem value="pcs" className="rounded-xl">Satuan (pcs)</SelectItem>
                            <SelectItem value="unit" className="rounded-xl">Unit</SelectItem>
                            <SelectItem value="hari" className="rounded-xl">Hari (Sewa)</SelectItem>
                          </>
                        ) : type === "waste" ? (
                          <>
                            <SelectItem value="kg" className="rounded-xl">Per Kilo (kg)</SelectItem>
                            <SelectItem value="ton" className="rounded-xl">Per Ton (t)</SelectItem>
                            <SelectItem value="box" className="rounded-xl">Per Box</SelectItem>
                          </>
                        ) : (
                          <>
                            <SelectItem value="kg" className="rounded-xl">Per Kilo (kg)</SelectItem>
                            <SelectItem value="pcs" className="rounded-xl">Satuan (pcs)</SelectItem>
                            <SelectItem value="ikat" className="rounded-xl">Per Ikat</SelectItem>
                            <SelectItem value="liter" className="rounded-xl">Per Liter (L)</SelectItem>
                            <SelectItem value="box" className="rounded-xl">Per Box</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {type !== "waste" && type !== "tools" && (
                    <div>
                      <Label className="mb-2 block text-sm font-semibold text-gray-700">Metode Budidaya</Label>
                      <Input 
                        value={cultivation} 
                        onChange={(e) => setCultivation(e.target.value)} 
                        placeholder="Contoh: Organik / Hidroponik" 
                        className="rounded-2xl border-gray-200/80 bg-gray-50/30 hover:bg-gray-50/50 focus:bg-white transition-all h-11" 
                      />
                    </div>
                  )}

                  {type === "waste" && (
                    <div>
                      <Label className="mb-2 block text-sm font-semibold text-gray-700">Sumber Limbah (Asal)</Label>
                      <Input 
                        value={cultivation} 
                        onChange={(e) => setCultivation(e.target.value)} 
                        placeholder="Contoh: Penggilingan Padi / Perkebunan Kopi" 
                        className="rounded-2xl border-gray-200/80 bg-gray-50/30 hover:bg-gray-50/50 focus:bg-white transition-all h-11" 
                      />
                    </div>
                  )}

                  {type === "tools" && (
                    <div>
                      <Label className="mb-2 block text-sm font-semibold text-gray-700">Kategori Produk</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="rounded-2xl border-gray-200/80 bg-gray-50/30 hover:bg-gray-50/50 focus:bg-white transition-all h-11">
                          <SelectValue placeholder="Pilih jenis alat" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-gray-100">
                          <SelectItem value="alat" className="rounded-xl">Alat Tani (Cangkul, dll)</SelectItem>
                          <SelectItem value="pupuk" className="rounded-xl">Pupuk & Nutrisi</SelectItem>
                          <SelectItem value="bibit" className="rounded-xl">Bibit / Benih</SelectItem>
                          <SelectItem value="mesin" className="rounded-xl">Mesin Pertanian</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <Label className="mb-2 block text-sm font-semibold text-gray-700">
                      {type === "tools" ? "Harga Jual/Sewa (Rp)" : "Harga Satuan (Rp)"}
                    </Label>
                    <Input 
                      type="number" 
                      value={price} 
                      onChange={(e) => setPrice(e.target.value)} 
                      placeholder="14500" 
                      className="rounded-2xl border-gray-200/80 bg-gray-50/30 hover:bg-gray-50/50 focus:bg-white transition-all h-11" 
                      required 
                    />
                  </div>

                  <div>
                    <Label className="mb-2 block text-sm font-semibold text-gray-700">
                      {type === "preorder" ? "Estimasi Stok Hasil Panen" :
                       type === "waste" ? "Stok Limbah Tersedia" : "Stok Tersedia"}
                    </Label>
                    <Input 
                      type="number" 
                      value={stock} 
                      onChange={(e) => setStock(e.target.value)} 
                      placeholder="600" 
                      className="rounded-2xl border-gray-200/80 bg-gray-50/30 hover:bg-gray-50/50 focus:bg-white transition-all h-11" 
                      required 
                    />
                  </div>

                  {type === "preorder" && (
                    <div>
                      <Label className="mb-2 block text-sm font-semibold text-gray-700">Estimasi Masa Panen</Label>
                      <Input 
                        type="date" 
                        value={estimatedHarvest} 
                        onChange={(e) => setEstimatedHarvest(e.target.value)} 
                        className="rounded-2xl border-gray-200/80 bg-gray-50/30 hover:bg-gray-50/50 focus:bg-white transition-all h-11" 
                        required 
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2 pt-2">
                  <Label className="block text-sm font-semibold text-gray-700">Foto Produk</Label>
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
                          alt="Pratinjau produk" 
                          className="absolute inset-0 w-full h-full object-cover transition duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2">
                          <Upload className="h-7 w-7 text-white" />
                          <span className="text-xs text-white font-bold">Ganti Foto Produk</span>
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
                        <p className="text-sm font-semibold text-gray-700">Pilih berkas atau unggah foto produk</p>
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
                    placeholder="Jelaskan kualitas, asal, dan keunggulan produk Anda..." 
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

            {/* Bottom Buttons: Tambah Produk, Reset, Kembali */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 pb-8">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate({ to: "/farmer/products" })}
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
                    setCultivation("Organik");
                    setPrice("");
                    setStock("");
                    setEstimatedHarvest("");
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
                      Tambah Produk
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
