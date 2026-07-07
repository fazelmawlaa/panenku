import { createFileRoute, notFound, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { formatRupiah, shippingMethods } from "@/lib/mock-data";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { fetchProductDetail, placeOrderInSupabase, deductProductStock } from "@/lib/products-db";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft, ArrowRight, CreditCard, Wallet, Building2, MapPin, ShoppingBag,
  Truck, Check, Package, ShieldCheck, Loader2, ChevronDown, Search, Plus
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout/$id")({
  validateSearch: (search: Record<string, unknown>): { qty?: number } => {
    return {
      qty: search.qty ? Number(search.qty) : undefined,
    };
  },
  loader: async ({ params }) => {
    const { product } = await fetchProductDetail(params.id);
    if (!product) throw notFound();
    return product;
  },
  head: () => ({ meta: [{ title: "Checkout — RumohTani" }] }),
  component: Checkout,
});

type Step = 1 | 2 | 3;

const steps = [
  { n: 1 as const, label: "Alamat", icon: MapPin },
  { n: 2 as const, label: "Pengiriman", icon: Truck },
  { n: 3 as const, label: "Pembayaran", icon: CreditCard },
];

const payments = [
  { v: "ewallet", icon: Wallet, t: "E-Wallet", d: "GoPay, OVO, DANA, ShopeePay" },
  { v: "va", icon: Building2, t: "Virtual Account", d: "BCA, BNI, BRI, Mandiri" },
  { v: "card", icon: CreditCard, t: "Kartu Kredit/Debit", d: "Visa, Mastercard, JCB" },
  { v: "cod", icon: Package, t: "Bayar di Tempat (COD)", d: "Khusus area Jabodetabek" },
];

function Checkout() {
  const p = Route.useLoaderData();
  const navigate = useNavigate();
  const { profile, user, session, loading } = useAuth();
  const search = Route.useSearch();

  const [qty, setQty] = useState(search.qty || 1);
  const [step, setStep] = useState<Step>(1);

  // Address form fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [addr, setAddr] = useState("");
  
  // Region selection details
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [postal, setPostal] = useState("");
  const [details, setDetails] = useState("");
  const [notes, setNotes] = useState("");
  
  // Saved addresses states
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [saveToAddresses, setSaveToAddresses] = useState(true);

  // Region dropdown states
  const [provincesList, setProvincesList] = useState<any[]>([]);
  const [citiesList, setCitiesList] = useState<any[]>([]);
  const [subdistrictsList, setSubdistrictsList] = useState<any[]>([]);
  const [postalCodesList, setPostalCodesList] = useState<any[]>([]);
  
  const [tempProvince, setTempProvince] = useState<any | null>(null);
  const [tempCity, setTempCity] = useState<any | null>(null);
  const [tempSubdistrict, setTempSubdistrict] = useState<any | null>(null);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"provinsi" | "kota" | "kecamatan" | "kodepos">("provinsi");
  const [tabSearchQuery, setTabSearchQuery] = useState("");
  const [isLoadingData, setIsLoadingData] = useState(false);

  // shipping & payment
  const [shipId, setShipId] = useState<string>("cod");
  const [pay, setPay] = useState("ewallet");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !session) {
      toast.info("Silakan masuk untuk melanjutkan checkout");
      navigate({ to: "/login", replace: true });
    }
  }, [loading, session, navigate]);

  // Load Saved Addresses from Database
  useEffect(() => {
    const loadAddresses = async () => {
      if (user?.id) {
        const { data, error } = await supabase
          .from("shipping_addresses")
          .select("*")
          .order("is_default", { ascending: false });
        if (data && !error && data.length > 0) {
          setSavedAddresses(data);
          const def = data.find(a => a.is_default) || data[0];
          if (def) {
            setSelectedAddressId(def.id);
            setName(def.recipient_name);
            setPhone(def.recipient_phone);
            setProvince(def.province);
            setCity(def.city);
            setDistrict(def.district);
            setPostal(def.postal_code);
            setAddr(def.street_address);
            setDetails(def.details || "");
            setShowNewAddressForm(false);
          } else {
            setShowNewAddressForm(true);
          }
        } else {
          setShowNewAddressForm(true);
        }
      }
    };
    loadAddresses();
  }, [user]);

  // Fallback profile address if no saved addresses found
  useEffect(() => {
    if (savedAddresses.length === 0 && profile) {
      if (profile.full_name && !name) setName(profile.full_name);
      if (profile.phone && !phone) setPhone(profile.phone);
      if (profile.address && !addr) setAddr(profile.address);
    }
  }, [profile, savedAddresses]);

  // --- Dynamic Cascading Indonesia Region Fetchers ---
  useEffect(() => {
    if (!showNewAddressForm) return;

    const fetchProvinces = async () => {
      setIsLoadingData(true);
      try {
        const res = await fetch("https://emsifa.github.io/api-wilayah-indonesia/api/provinces.json");
        if (!res.ok) throw new Error("CORS or network error");
        const data = await res.json();
        const filtered = (data || []).filter((prov: any) => prov.id === "11" || prov.name.toUpperCase().includes("ACEH"));
        setProvincesList(filtered);
      } catch (err) {
        console.warn("API error, loading fallback local provinces", err);
        const fallbackProvinces = [
          { id: "11", name: "ACEH" }
        ];
        setProvincesList(fallbackProvinces);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchProvinces();
  }, [showNewAddressForm]);

  useEffect(() => {
    if (!tempProvince) {
      setCitiesList([]);
      return;
    }

    const fetchCities = async () => {
      setIsLoadingData(true);
      try {
        const res = await fetch(`https://emsifa.github.io/api-wilayah-indonesia/api/regencies/${tempProvince.id}.json`);
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        setCitiesList(data || []);
      } catch (err) {
        console.warn("API regencies error, loading fallback local cities", err);
        setCitiesList([
          { id: `${tempProvince.id}-c1`, name: "Kota Banda Aceh" },
          { id: `${tempProvince.id}-c2`, name: "Kab. Aceh Besar" }
        ]);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchCities();
  }, [tempProvince]);

  useEffect(() => {
    if (!tempCity) {
      setSubdistrictsList([]);
      return;
    }

    const fetchSubdistricts = async () => {
      setIsLoadingData(true);
      try {
        const res = await fetch(`https://emsifa.github.io/api-wilayah-indonesia/api/districts/${tempCity.id}.json`);
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        setSubdistrictsList(data || []);
      } catch (err) {
        console.warn("API districts error, loading fallback local subdistricts", err);
        setSubdistrictsList([
          { id: `${tempCity.id}-d1`, name: "Kecamatan Syiah Kuala" }
        ]);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchSubdistricts();
  }, [tempCity]);

  useEffect(() => {
    if (!tempSubdistrict) {
      setPostalCodesList([]);
      return;
    }
    const cleanId = tempSubdistrict.id.replace(/\D/g, "");
    const baseCode = 10000 + (parseInt(cleanId) % 89999 || 40000);
    const mockCodes = [
      { id: `${tempSubdistrict.id}-z1`, name: String(baseCode) },
      { id: `${tempSubdistrict.id}-z2`, name: String(baseCode + 1) },
      { id: `${tempSubdistrict.id}-z3`, name: String(baseCode + 2) }
    ];
    setPostalCodesList(mockCodes);
  }, [tempSubdistrict]);

  // Click outside listener for the dropdown container
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".region-selector-container")) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const displayRegionLabel = useMemo(() => {
    if (province && city && district && postal) {
      return `${province}, ${city}, ${district}, ${postal}`;
    }
    return "";
  }, [province, city, district, postal]);

  const filteredOptions = useMemo(() => {
    const query = tabSearchQuery.toLowerCase().trim();
    if (activeTab === "provinsi") {
      return provincesList.filter(x => x.name.toLowerCase().includes(query));
    }
    if (activeTab === "kota") {
      return citiesList.filter(x => x.name.toLowerCase().includes(query));
    }
    if (activeTab === "kecamatan") {
      return subdistrictsList.filter(x => x.name.toLowerCase().includes(query));
    }
    if (activeTab === "kodepos") {
      return postalCodesList.filter(x => x.name.toLowerCase().includes(query));
    }
    return [];
  }, [activeTab, tabSearchQuery, provincesList, citiesList, subdistrictsList, postalCodesList]);

  const handleSelectOption = (item: any) => {
    if (activeTab === "provinsi") {
      setTempProvince(item);
      setProvince(item.name);
      setTempCity(null);
      setCity("");
      setTempSubdistrict(null);
      setDistrict("");
      setPostal("");
      setActiveTab("kota");
      setTabSearchQuery("");
    } else if (activeTab === "kota") {
      setTempCity(item);
      setCity(item.name);
      setTempSubdistrict(null);
      setDistrict("");
      setPostal("");
      setActiveTab("kecamatan");
      setTabSearchQuery("");
    } else if (activeTab === "kecamatan") {
      setTempSubdistrict(item);
      setDistrict(item.name);
      setPostal("");
      setActiveTab("kodepos");
      setTabSearchQuery("");
    } else if (activeTab === "kodepos") {
      setPostal(item.name);
      setIsDropdownOpen(false);
      setTabSearchQuery("");
    }
  };

  const handleSelectAddress = (addrObj: any) => {
    setSelectedAddressId(addrObj.id);
    setName(addrObj.recipient_name);
    setPhone(addrObj.recipient_phone);
    setProvince(addrObj.province);
    setCity(addrObj.city);
    setDistrict(addrObj.district);
    setPostal(addrObj.postal_code);
    setAddr(addrObj.street_address);
    setDetails(addrObj.details || "");
    setShowNewAddressForm(false);
  };

  const handleUseNewAddress = () => {
    setSelectedAddressId(null);
    setName("");
    setPhone("");
    setProvince("");
    setCity("");
    setDistrict("");
    setPostal("");
    setAddr("");
    setDetails("");
    setTempProvince(null);
    setTempCity(null);
    setTempSubdistrict(null);
    setShowNewAddressForm(true);
  };

  const ship = shippingMethods.find((s) => s.id === shipId) ?? shippingMethods[0];
  const subtotal = p.price * qty;
  const total = subtotal + ship.price;

  const fullShippingAddress = useMemo(() => {
    return `${addr}${details ? `, ${details}` : ""}, Kec. ${district}, Kota ${city}, Prov. ${province}, ${postal}`;
  }, [addr, details, district, city, province, postal]);

  function validateStep1() {
    if (!name.trim()) {
      toast.error("Nama penerima harus diisi");
      return false;
    }
    if (!phone.trim()) {
      toast.error("Nomor HP harus diisi");
      return false;
    }
    if (!province || !city || !district || !postal) {
      toast.error("Silakan lengkapi Provinsi, Kota, Kecamatan, dan Kode Pos");
      return false;
    }
    if (!addr.trim()) {
      toast.error("Alamat lengkap harus diisi");
      return false;
    }
    return true;
  }

  function next() {
    if (step === 1 && !validateStep1()) return;
    setStep((s) => (s < 3 ? ((s + 1) as Step) : s));
  }

  async function placeOrder() {
    if (!user) {
      toast.error("Silakan masuk terlebih dahulu.");
      return;
    }
    setIsSubmitting(true);
    const orderId = "ORD-" + Math.floor(2500 + Math.random() * 9999);
    try {
      // 1. If adding a new address and user checked "save to addresses", insert to DB
      if (showNewAddressForm && saveToAddresses) {
        await supabase
          .from("shipping_addresses")
          .insert([{
            user_id: user.id,
            recipient_name: name,
            recipient_phone: phone,
            province: province,
            city: city,
            district: district,
            postal_code: postal,
            street_address: addr,
            details: details,
            is_default: savedAddresses.length === 0
          }]);
      }

      // 2. Insert order
      await placeOrderInSupabase({
        id: orderId,
        user_id: user.id,
        product_id: p.id,
        product_name: p.name,
        qty: `${qty} ${p.unit}`,
        total: total,
        status: "Menunggu",
        date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
        farmer_id: p.farmerId === "mock" ? null : p.farmerId,
        shipping_address: `${fullShippingAddress}${notes ? ` (Catatan: ${notes})` : ""}`,
        buyer_name: name,
        buyer_phone: phone
      });
      
      // Deduct stock in real-time
      await deductProductStock(p.id, qty);
      
      toast.success(`Pesanan ${orderId} berhasil dibuat!`);
      navigate({ to: "/orders" });
    } catch (err: any) {
      toast.error(err.message || "Gagal membuat pesanan.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <CustomerLayout>
      <div className="mx-auto max-w-full px-4 sm:px-8 md:px-12 py-8 text-left">
        <Link to="/products/$id" params={{ id: p.id }} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Kembali
        </Link>
        <h1 className="font-display text-3xl font-bold mb-6">Checkout</h1>

        {/* Steps header */}
        <div className="flex items-center justify-center max-w-lg mx-auto mb-10 select-none">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const active = step >= s.n;
            const current = step === s.n;
            return (
              <div key={s.n} className="flex items-center flex-1 last:flex-initial">
                <div className="flex flex-col items-center gap-1.5 relative">
                  <div
                    className={`h-10 w-10 rounded-full border grid place-items-center transition duration-300 ${
                      current
                        ? "bg-primary text-white border-primary shadow-soft"
                        : active
                        ? "bg-primary/10 text-primary border-primary/20"
                        : "bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    {active && !current ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>
                  <span className={`text-[10px] font-bold ${active ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-2 -mt-4 transition duration-500 ${step > s.n ? "bg-primary" : "bg-border"}`} />
                )}
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-[1.6fr_1fr] gap-8 items-start">
          <div className="space-y-6">
            {step === 1 && (
              <div className="space-y-6">
                {/* Saved Addresses list */}
                {savedAddresses.length > 0 && !showNewAddressForm && (
                  <div className="glass-card rounded-[2rem] p-6 bg-white border border-border/40 shadow-sm space-y-4">
                    <div className="flex items-center justify-between font-display font-bold text-lg mb-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        Pilih Alamat Pengiriman
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleUseNewAddress}
                        className="rounded-full gap-1.5 text-xs font-bold border-primary text-primary hover:bg-primary/5"
                      >
                        <Plus className="h-3.5 w-3.5" /> Alamat Baru
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {savedAddresses.map((addrObj) => {
                        const isSelected = selectedAddressId === addrObj.id;
                        return (
                          <div
                            key={addrObj.id}
                            onClick={() => handleSelectAddress(addrObj)}
                            className={`p-4 rounded-2xl border text-left cursor-pointer transition-all duration-300 relative group flex items-start gap-4 ${
                              isSelected
                                ? "border-primary bg-primary/5 ring-2 ring-primary/10 shadow-soft"
                                : "border-border/60 hover:border-primary/30 hover:bg-secondary/20"
                            }`}
                          >
                            <div className={`mt-1 h-5 w-5 rounded-full border-2 grid place-items-center shrink-0 transition-colors ${
                              isSelected ? "border-primary text-primary" : "border-muted-foreground/30 text-transparent"
                            }`}>
                              <Check className="h-3 w-3 stroke-[3]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-sm text-foreground">{addrObj.recipient_name}</span>
                                <span className="text-xs text-muted-foreground">({addrObj.recipient_phone})</span>
                                {addrObj.is_default && (
                                  <span className="text-[9px] font-black uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">Utama</span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground/80 font-light mt-1.5 leading-relaxed">
                                {addrObj.street_address}{addrObj.details ? `, ${addrObj.details}` : ""}, Kec. {addrObj.district}, Kota {addrObj.city}, Prov. {addrObj.province}, {addrObj.postal_code}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Form to enter new address / details */}
                {(showNewAddressForm || savedAddresses.length === 0) && (
                  <div className="glass-card rounded-[2rem] p-6 bg-white border border-border/40 shadow-sm space-y-4">
                    <div className="flex items-center justify-between font-display font-bold text-lg mb-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        Tambah Alamat Baru
                      </div>
                      {savedAddresses.length > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const def = savedAddresses.find(a => a.is_default) || savedAddresses[0];
                            if (def) handleSelectAddress(def);
                          }}
                          className="rounded-full text-xs font-bold text-muted-foreground hover:text-foreground"
                        >
                          Pilih Alamat yang Ada
                        </Button>
                      )}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5 text-left">
                        <Label className="text-xs font-bold text-muted-foreground uppercase">Nama Lengkap Penerima</Label>
                        <Input 
                          value={name} 
                          onChange={(e) => setName(e.target.value)} 
                          placeholder="Nama lengkap penerima" 
                          className="rounded-xl border-border/50 text-xs h-10" 
                        />
                      </div>
                      <div className="space-y-1.5 text-left">
                        <Label className="text-xs font-bold text-muted-foreground uppercase">No. Telepon / WhatsApp</Label>
                        <Input 
                          value={phone} 
                          onChange={(e) => setPhone(e.target.value)} 
                          placeholder="Contoh: 08123456789" 
                          className="rounded-xl border-border/50 text-xs h-10" 
                        />
                      </div>
                    </div>

                    {/* REGION STEP-BY-STEP dropdown */}
                    <div className="space-y-1.5 region-selector-container relative text-left">
                      <Label className="text-xs font-bold text-muted-foreground uppercase">Provinsi, Kota, Kecamatan, Kode Pos</Label>
                      <div 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-full h-10 rounded-xl border border-border/50 bg-white px-3 flex items-center justify-between cursor-pointer focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-200"
                      >
                        <span className={`text-xs truncate ${displayRegionLabel ? "text-foreground font-medium" : "text-muted-foreground font-light"}`}>
                          {displayRegionLabel || "Pilih Provinsi, Kota, Kecamatan, Kode Pos"}
                        </span>
                        <div className="flex items-center gap-1 text-muted-foreground shrink-0 ml-2">
                          <Search className="h-3.5 w-3.5" />
                          <ChevronDown className="h-3.5 w-3.5" />
                        </div>
                      </div>

                      {isDropdownOpen && (
                        <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-border/40 rounded-2xl shadow-xl p-3 z-50 text-left space-y-3 animate-in fade-in duration-200">
                          {/* Search inside dropdown */}
                          <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                            <input 
                              type="text"
                              placeholder={`Cari ${activeTab === "provinsi" ? "Provinsi" : activeTab === "kota" ? "Kota" : activeTab === "kecamatan" ? "Kecamatan" : "Kode Pos"}...`}
                              value={tabSearchQuery}
                              onChange={(e) => setTabSearchQuery(e.target.value)}
                              className="w-full h-8 pl-8 pr-3 rounded-lg border border-border/50 bg-[#e9eae6]/10 text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 transition"
                            />
                          </div>

                          {/* Tabs row representing steps */}
                          <div className="flex border-b border-border/20 text-xs select-none">
                            {(["provinsi", "kota", "kecamatan", "kodepos"] as const).map((tab) => {
                              const isActive = activeTab === tab;
                              const isEnabled = 
                                tab === "provinsi" ||
                                (tab === "kota" && tempProvince) ||
                                (tab === "kecamatan" && tempCity) ||
                                (tab === "kodepos" && tempSubdistrict);

                              return (
                                <button
                                  type="button"
                                  key={tab}
                                  disabled={!isEnabled}
                                  onClick={() => {
                                    setActiveTab(tab);
                                    setTabSearchQuery("");
                                  }}
                                  className={`flex-1 pb-1.5 font-bold text-center border-b-2 transition ${
                                    isActive 
                                      ? "border-primary text-primary" 
                                      : isEnabled 
                                        ? "border-transparent text-foreground hover:text-primary" 
                                        : "border-transparent text-muted-foreground/30 cursor-not-allowed"
                                  }`}
                                >
                                  {tab === "provinsi" ? "Provinsi" : tab === "kota" ? "Kota" : tab === "kecamatan" ? "Kecamatan" : "Kode Pos"}
                                </button>
                              );
                            })}
                          </div>

                          {/* Step Options List */}
                          <div className="max-h-[160px] overflow-y-auto space-y-0.5 pr-1 text-xs select-none">
                            {isLoadingData ? (
                              <div className="flex items-center justify-center py-6 gap-2 text-muted-foreground">
                                <Loader2 className="h-4.5 w-4.5 animate-spin text-primary" />
                                <span>Memuat data wilayah...</span>
                              </div>
                            ) : filteredOptions.length === 0 ? (
                              <div className="text-center py-6 text-muted-foreground font-light">
                                Tidak ditemukan hasil "{tabSearchQuery}"
                              </div>
                            ) : (
                              filteredOptions.map((opt) => (
                                <div 
                                  key={opt.id}
                                  onClick={() => handleSelectOption(opt)}
                                  className="px-3 py-2 rounded-lg hover:bg-secondary/40 cursor-pointer flex items-center justify-between text-foreground"
                                >
                                  <span className="font-medium text-[11px] uppercase tracking-wide">{opt.name}</span>
                                  <ChevronDown className="h-3 w-3 text-muted-foreground/50 -rotate-90" />
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5 text-left">
                      <Label className="text-xs font-bold text-muted-foreground uppercase">Alamat Lengkap</Label>
                      <Textarea 
                        value={addr} 
                        onChange={(e) => setAddr(e.target.value)} 
                        rows={3} 
                        placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan" 
                        className="rounded-xl border-border/50 text-xs" 
                      />
                    </div>

                    <div className="space-y-1.5 text-left">
                      <Label className="text-xs font-bold text-muted-foreground uppercase">Detail Patokan (Opsional)</Label>
                      <Input 
                        value={details} 
                        onChange={(e) => setDetails(e.target.value)} 
                        placeholder="Contoh: Dekat masjid agung, pagar warna hitam..." 
                        className="rounded-xl border-border/50 text-xs h-10" 
                      />
                    </div>

                    {user?.id && (
                      <div className="flex items-center gap-2.5 pt-2 select-none">
                        <input
                          type="checkbox"
                          id="save-addr-check"
                          checked={saveToAddresses}
                          onChange={(e) => setSaveToAddresses(e.target.checked)}
                          className="h-4 w-4 rounded-lg border-gray-300 text-primary focus:ring-primary/20 accent-primary cursor-pointer"
                        />
                        <Label htmlFor="save-addr-check" className="text-xs text-muted-foreground font-medium cursor-pointer">
                          Simpan alamat ini ke daftar alamat saya untuk belanja berikutnya
                        </Label>
                      </div>
                    )}
                  </div>
                )}

                {/* Additional instructions/notes */}
                <div className="glass-card rounded-[2rem] p-6 bg-white border border-border/40 shadow-sm space-y-4 text-left">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-muted-foreground uppercase">Catatan untuk Penjual (Opsional)</Label>
                    <Input 
                      value={notes} 
                      onChange={(e) => setNotes(e.target.value)} 
                      placeholder="Contoh: Titip pos satpam, bungkus double bubble wrap..." 
                      className="rounded-xl border-border/50 text-xs h-10" 
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="glass-card rounded-2xl p-5 sm:p-6">
                <div className="flex items-center gap-2 font-display font-bold text-lg mb-1"><Truck className="h-5 w-5 text-primary" /> Opsi Pengiriman</div>
                <p className="text-sm text-muted-foreground mb-5">Tarif pengiriman disesuaikan dengan volume hasil bumi.</p>
                <RadioGroup value={shipId} onValueChange={setShipId} className="space-y-2.5">
                  {shippingMethods.map((m) => (
                    <label
                      key={m.id}
                      className={`flex items-center gap-4 rounded-2xl border p-4 cursor-pointer transition ${
                        shipId === m.id ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border hover:bg-muted/40"
                      }`}
                    >
                      <RadioGroupItem value={m.id} />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold">{m.name}</div>
                        <div className="text-xs text-muted-foreground">{m.eta}</div>
                      </div>
                      <div className="font-display font-bold text-right shrink-0">{formatRupiah(m.price)}</div>
                    </label>
                  ))}
                </RadioGroup>
              </div>
            )}

            {step === 3 && (
              <div className="glass-card rounded-2xl p-5 sm:p-6">
                <div className="flex items-center gap-2 font-display font-bold text-lg mb-1"><CreditCard className="h-5 w-5 text-primary" /> Metode Pembayaran</div>
                <p className="text-sm text-muted-foreground mb-5">Pembayaran diamankan oleh sistem RumohTani.</p>
                <RadioGroup value={pay} onValueChange={setPay} className="space-y-2.5">
                  {payments.map((m) => {
                    const Icon = m.icon;
                    return (
                      <label
                        key={m.v}
                        className={`flex items-center gap-4 rounded-2xl border p-4 cursor-pointer transition ${
                          pay === m.v ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border hover:bg-muted/40"
                        }`}
                      >
                        <RadioGroupItem value={m.v} />
                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary shrink-0">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold">{m.t}</div>
                          <div className="text-xs text-muted-foreground">{m.d}</div>
                        </div>
                      </label>
                    );
                  })}
                </RadioGroup>
                <div className="mt-4 flex items-start gap-2 rounded-xl bg-leaf-soft/15 border border-primary/15 p-3 text-xs text-foreground/80">
                  <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>Dana Anda ditahan sistem RumohTani dan baru diteruskan ke petani setelah pesanan diterima dengan baik.</div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between gap-3">
              <Button
                variant="outline"
                className="rounded-full"
                disabled={step === 1}
                onClick={() => setStep((s) => (s > 1 ? ((s - 1) as Step) : s))}
              >
                <ArrowLeft className="h-4 w-4 mr-1" /> Kembali
              </Button>
              {step < 3 ? (
                <Button className="rounded-full gap-1 font-bold" onClick={next}>
                  Lanjut <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button disabled={isSubmitting} className="rounded-full gap-2 shadow-soft font-bold" size="lg" onClick={placeOrder}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Memproses...
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="h-4 w-4" /> Bayar {formatRupiah(total)}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="glass-card rounded-2xl p-5 space-y-4">
              <h3 className="font-display font-bold">Ringkasan Pesanan</h3>

              <div className="flex items-center gap-3 pb-4 border-b border-border/60">
                <img src={p.image} className="h-16 w-16 rounded-xl object-cover" alt={p.name} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{formatRupiah(p.price)} / {p.unit}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">oleh {p.farmer}</div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="outline" size="icon" className="rounded-full h-7 w-7" onClick={() => setQty(Math.max(1, qty - 1))}>−</Button>
                  <span className="w-6 text-center text-sm font-semibold">{qty}</span>
                  <Button variant="outline" size="icon" className="rounded-full h-7 w-7" onClick={() => setQty(qty + 1)}>+</Button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal ({qty} {p.unit})</span><span>{formatRupiah(subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Ongkir ({ship.name})</span><span>{formatRupiah(ship.price)}</span></div>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Estimasi tiba</span><span className="text-primary font-medium">{ship.eta}</span></div>
              </div>

              <div className="border-t border-border pt-3 flex justify-between font-display text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">{formatRupiah(total)}</span>
              </div>

              {step >= 1 && name && (
                <div className="rounded-xl bg-muted/40 p-3 text-xs space-y-1">
                  <div className="font-semibold text-foreground">{name} · {phone}</div>
                  <div className="text-muted-foreground line-clamp-2">{addr}{city ? `, ${city}` : ""} {postal}</div>
                </div>
              )}
              <div className="text-[11px] text-muted-foreground text-center">
                Login sebagai <span className="font-medium text-foreground">{user?.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
