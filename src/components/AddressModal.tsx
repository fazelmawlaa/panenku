import { useState, useEffect, useCallback } from "react";
import { MapPin, Search, Check, ChevronDown, Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchShippingAddresses,
  insertShippingAddress,
  setDefaultShippingAddress,
  deleteShippingAddress
} from "@/lib/addresses-db";
import {
  getLocalProvinceData,
  getLocalCityData,
  getLocalSubdistrictData
} from "@/lib/indonesia-regions";
import { useRouter } from "@tanstack/react-router";

interface AddressModalProps {
  userId: string;
  onClose: () => void;
}

export function AddressModal({ userId, onClose }: AddressModalProps) {
  const router = useRouter();

  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [makeDefault, setMakeDefault] = useState(true);
  const [addressRecipientName, setAddressRecipientName] = useState("");
  const [addressRecipientPhone, setAddressRecipientPhone] = useState("");
  const [addressStreet, setAddressStreet] = useState("");
  const [addressDetails, setAddressDetails] = useState("");
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // Regional selector states
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"provinsi" | "kota" | "kecamatan" | "kodepos">("provinsi");
  const [tabSearchQuery, setTabSearchQuery] = useState("");

  const [tempProvince, setTempProvince] = useState<{ id: string; name: string } | null>(null);
  const [tempCity, setTempCity] = useState<{ id: string; name: string } | null>(null);
  const [tempSubdistrict, setTempSubdistrict] = useState<{ id: string; name: string } | null>(null);
  const [tempPostalCode, setTempPostalCode] = useState("");

  const [provincesList, setProvincesList] = useState<{ id: string; name: string }[]>([]);
  const [citiesList, setCitiesList] = useState<{ id: string; name: string }[]>([]);
  const [subdistrictsList, setSubdistrictsList] = useState<{ id: string; name: string }[]>([]);
  const [postalCodesList, setPostalCodesList] = useState<{ id: string; name: string }[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Load initial addresses and provinces on mount
  useEffect(() => {
    const init = async () => {
      try {
        const data = await fetchShippingAddresses(userId);
        setSavedAddresses(data);
        setShowNewAddressForm(data.length === 0);
      } catch {
        setShowNewAddressForm(true);
      }

      // Fetch provinces
      setIsLoadingData(true);
      try {
        const res = await fetch("https://emsifa.github.io/api-wilayah-indonesia/api/provinces.json");
        if (!res.ok) throw new Error("Network error");
        const data = await res.json();
        const filtered = (data || []).filter((p: any) => p.id === "11" || p.name.toUpperCase().includes("ACEH"));
        setProvincesList(filtered);
      } catch {
        setProvincesList([{ id: "11", name: "ACEH" }]);
      } finally {
        setIsLoadingData(false);
      }
    };
    init();
  }, [userId]);

  useEffect(() => {
    if (!tempProvince) { setCitiesList([]); return; }
    setIsLoadingData(true);
    fetch(`https://emsifa.github.io/api-wilayah-indonesia/api/regencies/${tempProvince.id}.json`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setCitiesList(data || []))
      .catch(() => {
        const provData = getLocalProvinceData(tempProvince.name) || {};
        setCitiesList(Object.keys(provData).map(c => ({ id: c, name: c })));
      })
      .finally(() => setIsLoadingData(false));
  }, [tempProvince]);

  useEffect(() => {
    if (!tempCity) { setSubdistrictsList([]); return; }
    setIsLoadingData(true);
    fetch(`https://emsifa.github.io/api-wilayah-indonesia/api/districts/${tempCity.id}.json`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setSubdistrictsList(data || []))
      .catch(() => {
        const cityData = getLocalCityData(tempProvince?.name || "", tempCity.name) || {};
        setSubdistrictsList(Object.keys(cityData).map(s => ({ id: s, name: s })));
      })
      .finally(() => setIsLoadingData(false));
  }, [tempCity]);

  useEffect(() => {
    if (!tempSubdistrict) { setPostalCodesList([]); return; }
    const staticCodes = getLocalSubdistrictData(tempProvince?.name || "", tempCity?.name || "", tempSubdistrict.name);
    if (staticCodes && staticCodes.length > 0) {
      setPostalCodesList(staticCodes.map(c => ({ id: c, name: c })));
      return;
    }
    const baseCode = 10000 + (parseInt(tempSubdistrict.id) % 89999);
    setPostalCodesList([
      { id: `${tempSubdistrict.id}-z1`, name: String(baseCode) },
      { id: `${tempSubdistrict.id}-z2`, name: String(baseCode + 1) },
      { id: `${tempSubdistrict.id}-z3`, name: String(baseCode + 2) }
    ]);
  }, [tempSubdistrict]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".region-selector-container")) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleSelectOption = useCallback((opt: { id: string; name: string }) => {
    setTabSearchQuery("");
    if (activeTab === "provinsi") {
      setTempProvince(opt); setTempCity(null); setTempSubdistrict(null); setTempPostalCode(""); setActiveTab("kota");
    } else if (activeTab === "kota") {
      setTempCity(opt); setTempSubdistrict(null); setTempPostalCode(""); setActiveTab("kecamatan");
    } else if (activeTab === "kecamatan") {
      setTempSubdistrict(opt); setTempPostalCode(""); setActiveTab("kodepos");
    } else if (activeTab === "kodepos") {
      setTempPostalCode(opt.name); setIsDropdownOpen(false);
    }
  }, [activeTab]);

  const getFilteredOptions = () => {
    let rawList: { id: string; name: string }[] = [];
    if (activeTab === "provinsi") rawList = provincesList;
    else if (activeTab === "kota") rawList = citiesList;
    else if (activeTab === "kecamatan") rawList = subdistrictsList;
    else if (activeTab === "kodepos") rawList = postalCodesList;
    if (!tabSearchQuery) return rawList;
    return rawList.filter(item => item.name.toLowerCase().includes(tabSearchQuery.toLowerCase()));
  };

  const filteredOptions = getFilteredOptions();
  const displayRegionLabel = [tempProvince?.name, tempCity?.name, tempSubdistrict?.name, tempPostalCode].filter(Boolean).join(", ");

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempProvince || !tempCity || !tempSubdistrict || !tempPostalCode) {
      toast.error("Harap lengkapi semua pilihan wilayah (Provinsi, Kota, Kecamatan, Kode Pos)!");
      return;
    }
    setIsSavingAddress(true);
    try {
      const isFirst = savedAddresses.length === 0;
      const shouldBeDefault = makeDefault || isFirst;

      const newAddr = await insertShippingAddress(userId, {
        recipient_name: addressRecipientName,
        recipient_phone: addressRecipientPhone,
        province: tempProvince.name,
        city: tempCity.name,
        district: tempSubdistrict.name,
        postal_code: tempPostalCode,
        street_address: addressStreet,
        details: addressDetails || null,
        is_default: shouldBeDefault
      });

      if (shouldBeDefault && newAddr) {
        const { data: currentP } = await supabase.from("profiles").select("address").eq("id", userId).maybeSingle();
        let config: any = {};
        if (currentP?.address?.trim().startsWith("{")) {
          try { config = JSON.parse(currentP.address); } catch {}
        } else if (currentP?.address && !currentP.address.trim().startsWith("[")) {
          config.addressText = currentP.address;
        }
        const compiledAddress = `${addressStreet}, ${addressDetails ? addressDetails + ", " : ""}Kec. ${tempSubdistrict.name}, Kota ${tempCity.name}, Prov. ${tempProvince.name}, ${tempPostalCode} (Penerima: ${addressRecipientName}, Telp: ${addressRecipientPhone})`;
        config.addressText = compiledAddress;
        await supabase.from("profiles").update({ address: JSON.stringify(config) }).eq("id", userId);
        const fields = { recipientName: addressRecipientName, recipientPhone: addressRecipientPhone, province: tempProvince, city: tempCity, subdistrict: tempSubdistrict, postalCode: tempPostalCode, street: addressStreet, details: addressDetails };
        localStorage.setItem(`panenku_address_fields_${userId}`, JSON.stringify(fields));
      }

      toast.success("Alamat pengiriman berhasil ditambahkan!");
      const list = await fetchShippingAddresses(userId);
      setSavedAddresses(list);
      setShowNewAddressForm(false);
      setTimeout(() => { router.invalidate(); }, 300);
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan alamat.");
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleSetDefaultAddress = async (addrId: string) => {
    try {
      const updated = await setDefaultShippingAddress(userId, addrId);
      if (updated) {
        const { data: currentP } = await supabase.from("profiles").select("address").eq("id", userId).maybeSingle();
        let config: any = {};
        if (currentP?.address?.trim().startsWith("{")) { try { config = JSON.parse(currentP.address); } catch {} }
        const compiledAddress = `${updated.street_address}, ${updated.details ? updated.details + ", " : ""}Kec. ${updated.district}, Kota ${updated.city}, Prov. ${updated.province}, ${updated.postal_code} (Penerima: ${updated.recipient_name}, Telp: ${updated.recipient_phone})`;
        config.addressText = compiledAddress;
        await supabase.from("profiles").update({ address: JSON.stringify(config) }).eq("id", userId);
      }
      toast.success("Alamat utama berhasil diubah!");
      const list = await fetchShippingAddresses(userId);
      setSavedAddresses(list);
      setTimeout(() => { router.invalidate(); }, 300);
    } catch (err: any) {
      toast.error(err.message || "Gagal mengatur alamat utama.");
    }
  };

  const handleDeleteAddress = async (addrId: string) => {
    try {
      await deleteShippingAddress(userId, addrId);
      toast.success("Alamat berhasil dihapus!");
      const list = await fetchShippingAddresses(userId);
      setSavedAddresses(list);
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus alamat.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] w-full max-w-xl p-6 sm:p-8 space-y-6 shadow-2xl relative animate-in zoom-in duration-300 text-left border border-border/30 overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between font-display font-bold text-lg mb-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <h3 className="font-['Plus_Jakarta_Sans',sans-serif] text-xl font-black text-foreground">Alamat Pengiriman</h3>
          </div>
          {savedAddresses.length > 0 && !showNewAddressForm && (
            <Button type="button" variant="outline" size="sm"
              onClick={() => { setShowNewAddressForm(true); setAddressRecipientName(""); setAddressRecipientPhone(""); setTempProvince(null); setTempCity(null); setTempSubdistrict(null); setTempPostalCode(""); setAddressStreet(""); setAddressDetails(""); setMakeDefault(true); }}
              className="rounded-full gap-1.5 text-xs font-bold border-primary text-primary hover:bg-primary/5">
              <Plus className="h-3.5 w-3.5" /> Tambah Baru
            </Button>
          )}
        </div>

        {/* View 1: Address list */}
        {savedAddresses.length > 0 && !showNewAddressForm ? (
          <div className="space-y-4 font-sans">
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {savedAddresses.map((addrObj) => {
                const isDefault = addrObj.is_default;
                return (
                  <div key={addrObj.id} className={`p-4 sm:p-5 rounded-2xl border text-left transition-all duration-300 relative flex flex-col gap-3 ${isDefault ? "border-primary bg-primary/5/10 ring-1 ring-primary/20 shadow-sm" : "border-border/60 hover:border-primary/40 hover:bg-slate-50/50"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isDefault ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-400"}`}>
                          <MapPin className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-sm text-foreground">{addrObj.recipient_name}</span>
                            {addrObj.recipient_phone && <span className="text-xs text-muted-foreground/80 font-medium">({addrObj.recipient_phone})</span>}
                            {isDefault && <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200/50 px-2 py-0.5 rounded-md">Utama</span>}
                          </div>
                          <p className="text-xs text-muted-foreground/90 font-normal leading-relaxed">{addrObj.street_address}{addrObj.details ? `, ${addrObj.details}` : ""}</p>
                          {(addrObj.district || addrObj.city || addrObj.province) && (
                            <p className="text-[11px] text-muted-foreground/75 font-light">
                              {[addrObj.district ? `Kec. ${addrObj.district}` : "", addrObj.city ? `Kota ${addrObj.city}` : "", addrObj.province ? `Prov. ${addrObj.province}` : "", addrObj.postal_code || ""].filter(Boolean).join(", ")}
                            </p>
                          )}
                        </div>
                      </div>
                      <button type="button" onClick={() => handleDeleteAddress(addrObj.id)} className="h-7 w-7 rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 transition flex items-center justify-center shrink-0 self-start" title="Hapus Alamat">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {!isDefault && (
                      <div className="pt-1.5 flex justify-end">
                        <Button type="button" variant="outline" size="sm" onClick={() => handleSetDefaultAddress(addrObj.id)} className="rounded-full text-[10px] font-bold h-7 px-3.5 border-border hover:bg-secondary/60 hover:text-primary transition-all duration-200">
                          Jadikan Utama
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="pt-2 flex">
              <Button type="button" variant="outline" onClick={onClose} className="rounded-full flex-1 font-semibold hover:bg-slate-100 border-border/70 text-foreground/80">Tutup</Button>
            </div>
          </div>
        ) : (
          /* View 2: New address form */
          <form onSubmit={handleSaveAddress} className="space-y-4 font-sans">
            <div className="space-y-1.5">
              <Label htmlFor="addr-name" className="text-xs font-bold text-muted-foreground uppercase">Nama Lengkap Penerima</Label>
              <Input id="addr-name" value={addressRecipientName} onChange={e => setAddressRecipientName(e.target.value)} placeholder="Nama penerima paket" className="rounded-xl border-border/50 text-xs h-10" required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="addr-phone" className="text-xs font-bold text-muted-foreground uppercase">Nomor HP / WhatsApp Penerima</Label>
              <Input id="addr-phone" value={addressRecipientPhone} onChange={e => setAddressRecipientPhone(e.target.value)} placeholder="Contoh: 08123456789" className="rounded-xl border-border/50 text-xs h-10" required />
            </div>

            {/* Region selector */}
            <div className="space-y-1.5 region-selector-container relative">
              <Label className="text-xs font-bold text-muted-foreground uppercase">Provinsi, Kota, Kecamatan, Kode Pos</Label>
              <div onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="w-full h-10 rounded-xl border border-border/50 bg-white px-3 flex items-center justify-between cursor-pointer transition-all duration-200 text-left">
                <span className={`text-xs truncate ${displayRegionLabel ? "text-foreground font-medium" : "text-muted-foreground font-light"}`}>
                  {displayRegionLabel || "Provinsi, Kota, Kecamatan, Kode Pos"}
                </span>
                <div className="flex items-center gap-1 text-muted-foreground shrink-0 ml-2">
                  <Search className="h-3.5 w-3.5" />
                  <ChevronDown className="h-3.5 w-3.5" />
                </div>
              </div>

              {isDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-border/40 rounded-2xl shadow-xl p-3 z-50 text-left space-y-3 animate-in fade-in duration-200">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                    <input type="text" placeholder={`Cari ${activeTab === "provinsi" ? "Provinsi" : activeTab === "kota" ? "Kota" : activeTab === "kecamatan" ? "Kecamatan" : "Kode Pos"}...`} value={tabSearchQuery} onChange={e => setTabSearchQuery(e.target.value)} className="w-full h-8 pl-8 pr-3 rounded-lg border border-border/50 bg-[#e9eae6]/10 text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 transition" />
                  </div>

                  <div className="flex border-b border-border/20 text-xs select-none">
                    {(["provinsi", "kota", "kecamatan", "kodepos"] as const).map((tab) => {
                      const isActive = activeTab === tab;
                      const isEnabled = tab === "provinsi" || (tab === "kota" && tempProvince) || (tab === "kecamatan" && tempCity) || (tab === "kodepos" && tempSubdistrict);
                      return (
                        <button type="button" key={tab} disabled={!isEnabled} onClick={() => { setActiveTab(tab); setTabSearchQuery(""); }}
                          className={`flex-1 pb-1.5 font-bold text-center border-b-2 transition ${isActive ? "border-primary text-primary" : isEnabled ? "border-transparent text-foreground hover:text-primary" : "border-transparent text-muted-foreground/30 cursor-not-allowed"}`}>
                          {tab === "provinsi" ? "Provinsi" : tab === "kota" ? "Kota" : tab === "kecamatan" ? "Kecamatan" : "Kode Pos"}
                        </button>
                      );
                    })}
                  </div>

                  <div className="max-h-[160px] overflow-y-auto space-y-0.5 pr-1 text-xs select-none">
                    {isLoadingData ? (
                      <div className="flex items-center justify-center py-6 gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span>Memuat data wilayah...</span>
                      </div>
                    ) : filteredOptions.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground font-light">Tidak ada hasil.</div>
                    ) : (
                      filteredOptions.map(opt => (
                        <button type="button" key={opt.id} onClick={() => handleSelectOption(opt)}
                          className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-secondary/60 text-foreground transition font-medium flex items-center justify-between">
                          <span>{opt.name}</span>
                          {((activeTab === "provinsi" && tempProvince?.id === opt.id) || (activeTab === "kota" && tempCity?.id === opt.id) || (activeTab === "kecamatan" && tempSubdistrict?.id === opt.id) || (activeTab === "kodepos" && tempPostalCode === opt.name)) && (
                            <Check className="h-3 w-3 text-primary shrink-0" />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="addr-street" className="text-xs font-bold text-muted-foreground uppercase">Nama Jalan &amp; Nomor Rumah</Label>
              <Input id="addr-street" value={addressStreet} onChange={e => setAddressStreet(e.target.value)} placeholder="Contoh: Jl. Dipatiukur No. 4" className="rounded-xl border-border/50 text-xs h-10" required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="addr-details" className="text-xs font-bold text-muted-foreground uppercase">Detail Lainnya (RT/RW, Komplek, dll.)</Label>
              <Input id="addr-details" value={addressDetails} onChange={e => setAddressDetails(e.target.value)} placeholder="Contoh: RT 03/RW 11, Komplek Permai, pagar hijau" className="rounded-xl border-border/50 text-xs h-10" />
            </div>

            {savedAddresses.length > 0 && (
              <div className="flex items-center gap-2 py-1">
                <input type="checkbox" id="make-default" checked={makeDefault} onChange={e => setMakeDefault(e.target.checked)} className="rounded border-border/50 text-primary focus:ring-primary/20 h-4 w-4" />
                <Label htmlFor="make-default" className="text-xs font-semibold text-muted-foreground cursor-pointer select-none">Jadikan Alamat Utama (Default)</Label>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => savedAddresses.length > 0 ? setShowNewAddressForm(false) : onClose()} className="rounded-full flex-1 font-semibold">Batal</Button>
              <Button type="submit" disabled={isSavingAddress} className="rounded-full flex-1 font-bold shadow-soft bg-primary hover:bg-primary-hover text-white">
                {isSavingAddress ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
