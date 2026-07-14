import { Link, useRouterState, useNavigate, useRouter } from "@tanstack/react-router";
import {
  ShoppingCart, User, Search, Menu, X, LogOut,
  Home, BookOpen, Recycle, LayoutDashboard, Sprout, MapPin, Phone, Check, ChevronDown, RefreshCw, Plus, Trash2
} from "lucide-react";
import logoPanenku from "@/assets/logo_panenku.png";
import { useState, useEffect, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  fetchShippingAddresses,
  insertShippingAddress,
  setDefaultShippingAddress,
  deleteShippingAddress
} from "@/lib/addresses-db";

const nav = [
  { to: "/products", label: "Marketplace", icon: BookOpen },
  { to: "/consultations", label: "Konsultasi", icon: Sprout },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
] as const;

// Static regions database mapping representing Indonesia provinces, cities, districts, and zip codes for fallback
export const localIndonesiaData: Record<string, Record<string, Record<string, string[]>>> = {
  "Aceh": {
    "Banda Aceh": {
      "Baiturrahman": ["23241", "23244"],
      "Kuta Alam": ["23121", "23126"],
      "Meuraxa": ["23231"],
      "Jaya Baru": ["23232"],
      "Lueng Bata": ["23247"],
      "Kuta Raja": ["23127"],
      "Syiah Kuala": ["23111", "23115"],
      "Ulee Kareng": ["23118", "23119"],
      "Banda Raya": ["23238"]
    },
    "Sabang": {
      "Sukajaya": ["23511"],
      "Sukakarya": ["23512"]
    },
    "Lhokseumawe": {
      "Banda Sakti": ["24351", "24354"],
      "Blang Mangat": ["24355"],
      "Muara Dua": ["24352"],
      "Muara Satu": ["24353"]
    },
    "Langsa": {
      "Langsa Kota": ["24411"],
      "Langsa Barat": ["24415"],
      "Langsa Lama": ["24416"],
      "Langsa Timur": ["24417"],
      "Langsa Baro": ["24418"]
    },
    "Subulussalam": {
      "Simpang Kiri": ["24782"],
      "Penanggalan": ["24783"],
      "Rundeng": ["24784"],
      "Sultan Daulat": ["24785"],
      "Longkib": ["24786"]
    },
    "Aceh Besar": {
      "Darul Imarah": ["23352"],
      "Darussalam": ["23373"],
      "Ingin Jaya": ["23371"],
      "Krueng Barona Jaya": ["23373"],
      "Lhoknga": ["23387"],
      "Leupung": ["23381"],
      "Mesjid Raya": ["23381"],
      "Montasik": ["23362"],
      "Peukan Bada": ["23239"],
      "Seulimeum": ["23361"]
    },
    "Pidie": {
      "Sigli": ["24111"],
      "Sakti": ["24171"],
      "Mutiara": ["24151"],
      "Indrajaya": ["24181"],
      "Kembang Tanjong": ["24182"]
    },
    "Pidie Jaya": {
      "Meureudu": ["24186"],
      "Bandar Baru": ["24184"],
      "Trienggadeng": ["24187"],
      "Panteraja": ["24188"],
      "Ulim": ["24189"]
    },
    "Bireuen": {
      "Kota Juang": ["24251"],
      "Jeumpa": ["24261"],
      "Peusangan": ["24271"],
      "Juli": ["24262"],
      "Samalanga": ["24264"]
    },
    "Aceh Utara": {
      "Lhoksukon": ["24382"],
      "Dewantara": ["24394"],
      "Syamtalira Bayu": ["24391"],
      "Tanah Luas": ["24385"],
      "Matangkuli": ["24386"]
    },
    "Aceh Timur": {
      "Idi Rayeuk": ["24454"],
      "Peureulak": ["24462"],
      "Peunaron": ["24474"],
      "Rantau Selamat": ["24452"],
      "Simpang Ulim": ["24457"]
    },
    "Aceh Tamiang": {
      "Karang Baru": ["24476"],
      "Kejuruan Muda": ["24477"],
      "Manyak Payed": ["24478"],
      "Rantau": ["24479"],
      "Seruway": ["24475"]
    },
    "Aceh Tengah": {
      "Lut Tawar": ["24519"],
      "Bebesen": ["24552"],
      "Pegasing": ["24561"],
      "Kebayakan": ["24514"],
      "Silih Nara": ["24564"]
    },
    "Bener Meriah": {
      "Bukit": ["24581"],
      "Permata": ["24582"],
      "Timang Gajah": ["24583"],
      "Wih Pesam": ["24584"],
      "Bandar": ["24585"]
    },
    "Aceh Barat": {
      "Johan Pahlawan": ["23611"],
      "Meureubo": ["23681"],
      "Samatiga": ["23682"],
      "Arongan Lambalek": ["23652"],
      "Woyla": ["23657"]
    },
    "Nagan Raya": {
      "Suka Makmue": ["23661"],
      "Kuala": ["23662"],
      "Seunagan": ["23663"],
      "Darul Makmur": ["23665"],
      "Beutong": ["23666"]
    },
    "Aceh Jaya": {
      "Calang": ["23654"],
      "Krueng Sabee": ["23655"],
      "Panga": ["23656"],
      "Teunom": ["23657"],
      "Setia Bakti": ["23658"]
    },
    "Aceh Barat Daya": {
      "Blangpidie": ["23764"],
      "Susoh": ["23765"],
      "Manggeng": ["23766"],
      "Tangan-Tangan": ["23767"],
      "Babah Rot": ["23768"]
    },
    "Aceh Selatan": {
      "Tapaktuan": ["23711"],
      "Labuhan Haji": ["23761"],
      "Meukek": ["23754"],
      "Sama Dua": ["23752"],
      "Kluet Utara": ["23772"]
    },
    "Aceh Singkil": {
      "Singkil": ["24785"],
      "Gunung Meriah": ["24791"],
      "Simpang Kanan": ["24784"],
      "Danau Paris": ["24792"],
      "Pulau Banyak": ["24795"]
    },
    "Simeulue": {
      "Simeulue Timur": ["23891"],
      "Simeulue Tengah": ["23892"],
      "Teupah Barat": ["23893"],
      "Teupah Selatan": ["23894"],
      "Salang": ["23895"]
    },
    "Gayo Lues": {
      "Blangkejeren": ["24653"],
      "Kutapanjang": ["24654"],
      "Rikit Gaib": ["24655"],
      "Terangun": ["24656"],
      "Pining": ["24657"]
    }
  }
};

export const normalizeName = (name: string) => {
  if (!name) return "";
  return name.toUpperCase()
    .replace(/^(KABUPATEN|KOTA)\s+/, "")
    .trim();
};

export const getLocalProvinceData = (provName: string) => {
  const normProv = normalizeName(provName);
  const provKey = Object.keys(localIndonesiaData).find(k => normalizeName(k) === normProv);
  return provKey ? localIndonesiaData[provKey] : null;
};

export const getLocalCityData = (provName: string, cityName: string) => {
  const provData = getLocalProvinceData(provName);
  if (!provData) return null;
  const normCity = normalizeName(cityName);
  const cityKey = Object.keys(provData).find(k => normalizeName(k) === normCity);
  return cityKey ? provData[cityKey] : null;
};

export const getLocalSubdistrictData = (provName: string, cityName: string, subName: string) => {
  const cityData = getLocalCityData(provName, cityName);
  if (!cityData) return null;
  const normSub = normalizeName(subName);
  const subKey = Object.keys(cityData).find(k => normalizeName(k) === normSub);
  return subKey ? cityData[subKey] : null;
};

export function CustomerLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const activeNav = nav;
  const router = useRouter();

  useEffect(() => {
    const resetScroll = () => {
      const elements = document.querySelectorAll(".overflow-x-hidden");
      elements.forEach((el) => {
        if (el instanceof HTMLElement) {
          el.scrollLeft = 0;
        }
      });
      document.documentElement.scrollLeft = 0;
      document.body.scrollLeft = 0;
      window.scrollTo(0, 0);
    };
    resetScroll();
    requestAnimationFrame(resetScroll);
    const timer = setTimeout(resetScroll, 100);
    return () => clearTimeout(timer);
  }, [path]);

  // 1. Profile Modal states
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileOldPassword, setProfileOldPassword] = useState("");
  const [profilePassword, setProfilePassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // 2. Shipping Address Modal states
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [makeDefault, setMakeDefault] = useState(true);
  const [addressRecipientName, setAddressRecipientName] = useState("");
  const [addressRecipientPhone, setAddressRecipientPhone] = useState("");
  const [addressStreet, setAddressStreet] = useState("");
  const [addressDetails, setAddressDetails] = useState("");
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // --- 3. Step-by-Step Step Regional Selector States ---
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"provinsi" | "kota" | "kecamatan" | "kodepos">("provinsi");
  const [tabSearchQuery, setTabSearchQuery] = useState("");

  const [tempProvince, setTempProvince] = useState<{ id: string; name: string } | null>(null);
  const [tempCity, setTempCity] = useState<{ id: string; name: string } | null>(null);
  const [tempSubdistrict, setTempSubdistrict] = useState<{ id: string; name: string } | null>(null);
  const [tempPostalCode, setTempPostalCode] = useState("");

  // States to hold region options lists fetched from Emsifa API or falls back to local data
  const [provincesList, setProvincesList] = useState<{ id: string; name: string }[]>([]);
  const [citiesList, setCitiesList] = useState<{ id: string; name: string }[]>([]);
  const [subdistrictsList, setSubdistrictsList] = useState<{ id: string; name: string }[]>([]);
  const [postalCodesList, setPostalCodesList] = useState<{ id: string; name: string }[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Real-time header avatar state
  const [headerAvatar, setHeaderAvatar] = useState("");

  // Disable background scrolling when modal is open
  useEffect(() => {
    if (showProfileModal || showAddressModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showProfileModal, showAddressModal]);

  useEffect(() => {
    if (user?.id) {
      const localAvatar = localStorage.getItem(`panenku_avatar_${user.id}`);
      if (localAvatar) {
        setHeaderAvatar(localAvatar);
      }
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    toast.success("Berhasil keluar dari akun.");
    navigate({ to: "/onboarding" });
  };

  // --- Dynamic Cascading Indonesia Region Fetchers ---
  useEffect(() => {
    if (!showAddressModal) return;

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
        // Fallback to static list keys (Aceh only)
        const staticProvinces = [{ id: "11", name: "ACEH" }];
        setProvincesList(staticProvinces);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchProvinces();
  }, [showAddressModal]);

  useEffect(() => {
    if (!tempProvince) {
      setCitiesList([]);
      return;
    }

    const fetchCities = async () => {
      setIsLoadingData(true);
      try {
        // Emsifa Regencies endpoint
        const res = await fetch(`https://emsifa.github.io/api-wilayah-indonesia/api/regencies/${tempProvince.id}.json`);
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        setCitiesList(data || []);
      } catch (err) {
        console.warn("API regencies error, loading fallback local cities", err);
        const provData = getLocalProvinceData(tempProvince.name) || {};
        const staticCities = Object.keys(provData).map((c) => ({ id: c, name: c }));
        setCitiesList(staticCities);
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
        // Emsifa Districts endpoint
        const res = await fetch(`https://emsifa.github.io/api-wilayah-indonesia/api/districts/${tempCity.id}.json`);
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        setSubdistrictsList(data || []);
      } catch (err) {
        console.warn("API districts error, loading fallback local subdistricts", err);
        const cityData = getLocalCityData(tempProvince?.name || "", tempCity.name) || {};
        const staticSubsList = Object.keys(cityData).map((s) => ({ id: s, name: s }));
        setSubdistrictsList(staticSubsList);
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

    // Attempt local database first
    const staticCodes = getLocalSubdistrictData(
      tempProvince?.name || "",
      tempCity?.name || "",
      tempSubdistrict.name
    );
    if (staticCodes && staticCodes.length > 0) {
      setPostalCodesList(staticCodes.map((c) => ({ id: c, name: c })));
      return;
    }

    // Fallback to generating dynamic deterministic zip codes based on District ID
    const baseCode = 10000 + (parseInt(tempSubdistrict.id) % 89999);
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

  // Modal actions
  const openProfileModal = async () => {
    setShowProfileModal(true);
    setProfilePassword("");
    setProfileOldPassword("");
    if (user?.id) {
      setProfileEmail(user.email || "");
      const localAvatar = localStorage.getItem(`panenku_avatar_${user.id}`);
      setAvatarUrl(localAvatar || "");
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();
        if (data && !error) {
          setProfileName(data.full_name || user.name || "");
          setProfilePhone(data.phone || "");
          setAvatarUrl(data.avatar_url || localStorage.getItem(`panenku_avatar_${user.id}`) || "");
        } else {
          setProfileName(user.name || "");
        }
      } catch (err) {
        console.error("Failed to load profile", err);
        setProfileName(user.name || "");
      }
    }
  };

  const openAddressModal = async () => {
    setShowAddressModal(true);
    setIsDropdownOpen(false);
    setActiveTab("provinsi");
    setTabSearchQuery("");

    // Clear form inputs
    setAddressRecipientName("");
    setAddressRecipientPhone("");
    setTempProvince(null);
    setTempCity(null);
    setTempSubdistrict(null);
    setTempPostalCode("");
    setAddressStreet("");
    setAddressDetails("");
    setMakeDefault(true);

    if (user?.id) {
      try {
        const data = await fetchShippingAddresses(user.id);
        setSavedAddresses(data);
        if (data.length > 0) {
          setShowNewAddressForm(false);
        } else {
          setShowNewAddressForm(true);
        }
      } catch (err) {
        console.error(err);
        setShowNewAddressForm(true);
      }
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
        toast.success("Foto profil berhasil dipilih!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setIsSavingProfile(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profileName,
          phone: profilePhone,
          avatar_url: avatarUrl
        })
        .eq("id", user.id);

      if (error) throw error;

      if (avatarUrl) {
        localStorage.setItem(`panenku_avatar_${user.id}`, avatarUrl);
      } else {
        localStorage.removeItem(`panenku_avatar_${user.id}`);
      }

      if (profilePassword || profileOldPassword) {
        if (!profileOldPassword) {
          toast.error("Harap masukkan kata sandi lama Anda!");
          setIsSavingProfile(false);
          return;
        }
        if (!profilePassword) {
          toast.error("Harap masukkan kata sandi baru Anda!");
          setIsSavingProfile(false);
          return;
        }
        if (profilePassword.trim().length < 6) {
          toast.error("Kata sandi baru minimal harus 6 karakter!");
          setIsSavingProfile(false);
          return;
        }

        const { error: pwdError } = await supabase.auth.updateUser({
          password: profilePassword,
        });
        if (pwdError) throw pwdError;
        toast.success("Kata sandi berhasil diperbarui!");
      }

      toast.success("Profil Anda berhasil diperbarui!");
      setShowProfileModal(false);

      setTimeout(() => {
        router.invalidate();
      }, 300);
    } catch (err: any) {
      toast.error(err.message || "Gagal memperbarui profil.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    if (!tempProvince || !tempCity || !tempSubdistrict || !tempPostalCode) {
      toast.error("Harap lengkapi semua pilihan wilayah (Provinsi, Kota, Kecamatan, Kode Pos)!");
      return;
    }
    setIsSavingAddress(true);
    try {
      const isFirst = savedAddresses.length === 0;
      const shouldBeDefault = makeDefault || isFirst;

      const newAddr = await insertShippingAddress(user.id, {
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
        // Also update profiles.address with the compiled address for compatibility
        const compiledAddress = `${addressStreet}, ${addressDetails ? addressDetails + ", " : ""}Kec. ${tempSubdistrict.name}, Kota ${tempCity.name}, Prov. ${tempProvince.name}, ${tempPostalCode} (Penerima: ${addressRecipientName}, Telp: ${addressRecipientPhone})`;
        await supabase
          .from("profiles")
          .update({ address: compiledAddress })
          .eq("id", user.id);

        const fields = {
          recipientName: addressRecipientName,
          recipientPhone: addressRecipientPhone,
          province: tempProvince,
          city: tempCity,
          subdistrict: tempSubdistrict,
          postalCode: tempPostalCode,
          street: addressStreet,
          details: addressDetails,
        };
        localStorage.setItem(`panenku_address_fields_${user.id}`, JSON.stringify(fields));
      }

      toast.success("Alamat pengiriman berhasil ditambahkan!");
      
      // Reload addresses
      const list = await fetchShippingAddresses(user.id);
      setSavedAddresses(list);
      
      // Hide form
      setShowNewAddressForm(false);
      
      setTimeout(() => {
        router.invalidate();
      }, 300);
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan alamat.");
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleSetDefaultAddress = async (addrId: string) => {
    if (!user?.id) return;
    try {
      const updated = await setDefaultShippingAddress(user.id, addrId);

      // Also update profiles.address with default address for compatibility
      if (updated) {
        const compiledAddress = `${updated.street_address}, ${updated.details ? updated.details + ", " : ""}Kec. ${updated.district}, Kota ${updated.city}, Prov. ${updated.province}, ${updated.postal_code} (Penerima: ${updated.recipient_name}, Telp: ${updated.recipient_phone})`;
        await supabase
          .from("profiles")
          .update({ address: compiledAddress })
          .eq("id", user.id);
      }

      toast.success("Alamat utama berhasil diubah!");

      // Reload
      const list = await fetchShippingAddresses(user.id);
      setSavedAddresses(list);

      setTimeout(() => {
        router.invalidate();
      }, 300);
    } catch (err: any) {
      toast.error(err.message || "Gagal mengatur alamat utama.");
    }
  };

  const handleDeleteAddress = async (addrId: string) => {
    if (!user?.id) return;
    try {
      await deleteShippingAddress(user.id, addrId);
      toast.success("Alamat berhasil dihapus!");

      // Reload
      const list = await fetchShippingAddresses(user.id);
      setSavedAddresses(list);
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus alamat.");
    }
  };

  // --- Region click handlers ---
  const handleSelectOption = (opt: { id: string; name: string }) => {
    setTabSearchQuery("");

    if (activeTab === "provinsi") {
      setTempProvince(opt);
      setTempCity(null);
      setTempSubdistrict(null);
      setTempPostalCode("");
      setActiveTab("kota");
    } else if (activeTab === "kota") {
      setTempCity(opt);
      setTempSubdistrict(null);
      setTempPostalCode("");
      setActiveTab("kecamatan");
    } else if (activeTab === "kecamatan") {
      setTempSubdistrict(opt);
      setTempPostalCode("");
      setActiveTab("kodepos");
    } else if (activeTab === "kodepos") {
      setTempPostalCode(opt.name);
      setIsDropdownOpen(false);
    }
  };

  const getFilteredOptions = () => {
    let rawList: { id: string; name: string }[] = [];
    if (activeTab === "provinsi") rawList = provincesList;
    else if (activeTab === "kota") rawList = citiesList;
    else if (activeTab === "kecamatan") rawList = subdistrictsList;
    else if (activeTab === "kodepos") rawList = postalCodesList;

    if (!tabSearchQuery) return rawList;
    return rawList.filter((item) =>
      item.name.toLowerCase().includes(tabSearchQuery.toLowerCase())
    );
  };

  const filteredOptions = getFilteredOptions();

  // Selected string for main input trigger text label
  const displayRegionLabel = [
    tempProvince?.name,
    tempCity?.name,
    tempSubdistrict?.name,
    tempPostalCode
  ].filter(Boolean).join(", ");

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f5f1] font-['Inter',sans-serif] overflow-x-hidden">
      {/* STANDARD HEADER */}
      <header className="sticky top-0 z-45 w-full border-b border-border/30 bg-white/85 backdrop-blur-lg select-none">
        <div className="mx-auto max-w-full px-4 sm:px-8 md:px-12 py-3.5 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center">
            <img src={logoPanenku} alt="PANENKU" className="h-10 sm:h-12 object-contain" />
          </Link>

          <nav className="hidden lg:flex items-center gap-1.5">
            {activeNav.map((n) => {
              const active = (n.to as string) === "/" ? path === "/" : path.startsWith(n.to);
              const Icon = n.icon;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${active
                    ? "bg-primary text-white shadow-soft"
                    : "text-foreground/75 hover:bg-secondary hover:text-foreground"
                    }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{n.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="hidden lg:flex items-center gap-4">
            <Link
              to="/cart"
              className={`relative grid h-10 w-10 place-items-center rounded-full border border-border/40 hover:bg-secondary/40 transition shadow-sm ${path === "/cart" ? "bg-primary/10 text-primary border-primary/20" : "bg-white text-muted-foreground hover:text-foreground"
                }`}
            >
              <ShoppingCart className="h-4 w-4" />
            </Link>

            {isLoggedIn && user ? (
              /* HOVER DROPDOWN MENU */
              <div className="relative group select-none">
                <div className="flex items-center gap-3 cursor-pointer py-1.5 px-3.5 hover:bg-secondary/40 rounded-full border border-transparent hover:border-border/10 transition-all duration-300">
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-primary text-white font-black text-xs shadow-sm overflow-hidden">
                    {headerAvatar ? (
                      <img src={headerAvatar} alt="Header Avatar" className="h-full w-full object-cover" />
                    ) : (
                      initial
                    )}
                  </div>
                  <div className="hidden xl:flex flex-col text-left leading-none">
                    <span className="text-xs font-bold text-foreground mb-0.5">{user.name}</span>
                    <span className="text-[8px] font-bold text-emerald-800 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {user.role === "petani" ? "PENJUAL" : "PEMBELI"}
                    </span>
                  </div>
                </div>

                {/* Dropdown Card */}
                <div className="absolute right-0 top-full pt-1.5 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 z-50 w-[240px]">
                  <div className="bg-white border border-border/40 rounded-2xl shadow-xl p-3 text-left space-y-1.5 backdrop-blur-md">
                    <div className="px-3 py-2 border-b border-border/10 pb-2">
                      <div className="text-xs font-black text-foreground leading-tight truncate">{user.name}</div>
                      <div className="text-[9px] text-muted-foreground leading-tight truncate mt-0.5">{user.email}</div>
                    </div>

                    <button
                      onClick={openProfileModal}
                      className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold hover:bg-secondary text-foreground/80 hover:text-foreground transition text-left"
                    >
                      <User className="h-4 w-4 text-primary shrink-0" />
                      <span>Edit Profil</span>
                    </button>



                    <button
                      onClick={openAddressModal}
                      className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold hover:bg-secondary text-foreground/80 hover:text-foreground transition text-left"
                    >
                      <MapPin className="h-4 w-4 text-primary shrink-0" />
                      <span>Alamat Pengiriman</span>
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold hover:bg-destructive/10 text-destructive rounded-xl transition text-left mt-1 pt-2 border-t border-border/10"
                    >
                      <LogOut className="h-4 w-4 shrink-0" />
                      <span>Keluar Sesi</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link to="/login">
                <Button size="sm" className="rounded-full gap-2 px-5">
                  <User className="h-4 w-4" /> Masuk
                </Button>
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <Link
              to="/cart"
              className={`relative grid h-10 w-10 place-items-center rounded-full border border-border/40 hover:bg-secondary/40 transition shadow-sm ${path === "/cart" ? "bg-primary/10 text-primary border-primary/20" : "bg-white text-muted-foreground hover:text-foreground"
                }`}
            >
              <ShoppingCart className="h-4 w-4" />
            </Link>

            <button onClick={() => setOpen(!open)} className="grid h-10 w-10 place-items-center rounded-full hover:bg-muted">
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="lg:hidden border border-white/30 rounded-[2rem] bg-white/95 backdrop-blur-xl mt-3 p-3 flex flex-col gap-1 shadow-lg mx-auto max-w-7xl">
            {activeNav.map((n) => {
              const Icon = n.icon;
              return (
                <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-muted flex items-center gap-2 text-foreground/80">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{n.label}</span>
                </Link>
              );
            })}
            {isLoggedIn && user ? (
              <>
                <button
                  onClick={() => { setOpen(false); openProfileModal(); }}
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-muted flex items-center gap-2 text-foreground/80 text-left"
                >
                  <User className="h-4 w-4 shrink-0" />
                  <span>Edit Profil</span>
                </button>
                <button
                  onClick={() => { setOpen(false); openAddressModal(); }}
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-muted flex items-center gap-2 text-foreground/80 text-left"
                >
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span>Alamat Pengiriman</span>
                </button>
                <button
                  onClick={() => { setOpen(false); handleLogout(); }}
                  className="rounded-xl px-4 py-2.5 text-sm font-bold hover:bg-destructive/10 text-destructive text-left flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  <span>Keluar ({user.name})</span>
                </button>
              </>
            ) : null}
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      {/* MODAL 1: EDIT PROFILE */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl p-6 sm:p-8 space-y-6 shadow-2xl relative animate-in zoom-in duration-300 text-left border border-border/30">
            <div className="space-y-1">
              <h3 className="font-['Plus_Jakarta_Sans',sans-serif] text-xl font-black text-foreground">Edit Profil</h3>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 font-sans">
              {/* Foto Profil Input */}
              <div className="flex flex-col items-center justify-center gap-2 mb-2">
                <div className="relative group/avatar cursor-pointer">
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  <label htmlFor="avatar-upload" className="cursor-pointer block relative">
                    <div className="h-20 w-20 rounded-full border-2 border-primary/30 shadow-md bg-secondary overflow-hidden flex items-center justify-center text-foreground font-black text-xl select-none">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar Preview" className="h-full w-full object-cover" />
                      ) : (
                        <span>{initial}</span>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-all duration-200">
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider">Ubah</span>
                    </div>
                  </label>
                </div>
                <span className="text-[10px] text-muted-foreground/85">Klik untuk mengganti foto profil</span>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="m-name" className="text-xs font-bold text-muted-foreground uppercase">Nama Lengkap</Label>
                <Input
                  id="m-name"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Nama lengkap Anda"
                  className="rounded-xl border-border/50 text-xs h-10"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="m-email" className="text-xs font-bold text-muted-foreground uppercase">Email Akun (Tidak dapat diubah)</Label>
                <Input
                  id="m-email"
                  value={profileEmail}
                  disabled
                  className="rounded-xl bg-secondary/50 text-muted-foreground border-border/30 text-xs h-10 cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="m-phone" className="text-xs font-bold text-muted-foreground uppercase">Nomor WhatsApp / Telp</Label>
                <Input
                  id="m-phone"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  placeholder="e.g. 08123456789"
                  className="rounded-xl border-border/50 text-xs h-10"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="m-old-pwd" className="text-xs font-bold text-muted-foreground uppercase">Kata Sandi Lama</Label>
                <Input
                  id="m-old-pwd"
                  type="password"
                  value={profileOldPassword}
                  onChange={(e) => setProfileOldPassword(e.target.value)}
                  placeholder="Masukkan kata sandi saat ini"
                  className="rounded-xl border-border/50 text-xs h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="m-pwd" className="text-xs font-bold text-muted-foreground uppercase">Kata Sandi Baru</Label>
                <Input
                  id="m-pwd"
                  type="password"
                  value={profilePassword}
                  onChange={(e) => setProfilePassword(e.target.value)}
                  placeholder="Masukkan kata sandi baru Anda"
                  className="rounded-xl border-border/50 text-xs h-10"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowProfileModal(false)} className="rounded-full flex-1">Batal</Button>
                <Button type="submit" disabled={isSavingProfile} className="rounded-full flex-1 font-bold shadow-soft">
                  {isSavingProfile ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ALAMAT PENGIRIMAN */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl p-6 sm:p-8 space-y-6 shadow-2xl relative animate-in zoom-in duration-300 text-left border border-border/30 overflow-y-auto max-h-[90vh]">

            {/* Header */}
            <div className="flex items-center justify-between font-display font-bold text-lg mb-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <h3 className="font-['Plus_Jakarta_Sans',sans-serif] text-xl font-black text-foreground">Alamat Pengiriman</h3>
              </div>
              {savedAddresses.length > 0 && !showNewAddressForm && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowNewAddressForm(true);
                    setAddressRecipientName("");
                    setAddressRecipientPhone("");
                    setTempProvince(null);
                    setTempCity(null);
                    setTempSubdistrict(null);
                    setTempPostalCode("");
                    setAddressStreet("");
                    setAddressDetails("");
                    setMakeDefault(true);
                  }}
                  className="rounded-full gap-1.5 text-xs font-bold border-primary text-primary hover:bg-primary/5"
                >
                  <Plus className="h-3.5 w-3.5" /> Tambah Baru
                </Button>
              )}
            </div>

            {/* View 1: List of saved addresses */}
            {savedAddresses.length > 0 && !showNewAddressForm ? (
              <div className="space-y-4 font-sans">
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {savedAddresses.map((addrObj) => {
                    const isDefault = addrObj.is_default;
                    return (
                      <div
                        key={addrObj.id}
                        className={`p-4 sm:p-5 rounded-2xl border text-left transition-all duration-300 relative flex flex-col gap-3 group/card ${
                          isDefault
                            ? "border-primary bg-primary/5/10 ring-1 ring-primary/20 shadow-sm"
                            : "border-border/60 hover:border-primary/40 hover:bg-slate-50/50 shadow-soft-sm"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                              isDefault ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-400"
                            }`}>
                              <MapPin className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-extrabold text-sm text-foreground">{addrObj.recipient_name}</span>
                                {addrObj.recipient_phone && (
                                  <span className="text-xs text-muted-foreground/80 font-medium">({addrObj.recipient_phone})</span>
                                )}
                                {isDefault && (
                                  <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200/50 px-2 py-0.5 rounded-md">Utama</span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground/90 font-normal leading-relaxed">
                                {addrObj.street_address}{addrObj.details ? `, ${addrObj.details}` : ""}
                              </p>
                              {(addrObj.district || addrObj.city || addrObj.province) && (
                                <p className="text-[11px] text-muted-foreground/75 font-light">
                                  {[
                                    addrObj.district ? `Kec. ${addrObj.district}` : "",
                                    addrObj.city ? `Kota ${addrObj.city}` : "",
                                    addrObj.province ? `Prov. ${addrObj.province}` : "",
                                    addrObj.postal_code || ""
                                  ].filter(Boolean).join(", ")}
                                </p>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteAddress(addrObj.id)}
                            className="h-7 w-7 rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 transition flex items-center justify-center shrink-0 self-start"
                            title="Hapus Alamat"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        
                        {!isDefault && (
                          <div className="pt-1.5 flex justify-end">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleSetDefaultAddress(addrObj.id)}
                              className="rounded-full text-[10px] font-bold h-7 px-3.5 border-border hover:bg-secondary/60 hover:text-primary transition-all duration-200"
                            >
                              Jadikan Utama
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2 flex">
                  <Button type="button" variant="outline" onClick={() => setShowAddressModal(false)} className="rounded-full flex-1 font-semibold hover:bg-slate-100 border-border/70 text-foreground/80">Tutup</Button>
                </div>
              </div>
            ) : (
              /* View 2: Form to add a new address */
              <form onSubmit={handleSaveAddress} className="space-y-4 font-sans">
                <div className="space-y-1.5">
                  <Label htmlFor="addr-name" className="text-xs font-bold text-muted-foreground uppercase">Nama Lengkap Penerima</Label>
                  <Input
                    id="addr-name"
                    value={addressRecipientName}
                    onChange={(e) => setAddressRecipientName(e.target.value)}
                    placeholder="Nama penerima paket"
                    className="rounded-xl border-border/50 text-xs h-10"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="addr-phone" className="text-xs font-bold text-muted-foreground uppercase">Nomor HP / WhatsApp Penerima</Label>
                  <Input
                    id="addr-phone"
                    value={addressRecipientPhone}
                    onChange={(e) => setAddressRecipientPhone(e.target.value)}
                    placeholder="Contoh: 08123456789"
                    className="rounded-xl border-border/50 text-xs h-10"
                    required
                  />
                </div>

                {/* STEP-BY-STEP INTEGRATED WIDGET */}
                <div className="space-y-1.5 region-selector-container relative">
                  <Label className="text-xs font-bold text-muted-foreground uppercase">Provinsi, Kota, Kecamatan, Kode Pos</Label>
                  <div
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full h-10 rounded-xl border border-border/50 bg-white px-3 flex items-center justify-between cursor-pointer focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-200 text-left"
                  >
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
                      {/* Search inside the dropdown panel */}
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
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
                              className={`flex-1 pb-1.5 font-bold text-center border-b-2 transition ${isActive
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
                            Tidak ada hasil.
                          </div>
                        ) : (
                          filteredOptions.map((opt) => (
                            <button
                              type="button"
                              key={opt.id}
                              onClick={() => handleSelectOption(opt)}
                              className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-secondary/60 text-foreground transition font-medium flex items-center justify-between"
                            >
                              <span>{opt.name}</span>
                              {/* Checkmark indicator for matched selection */}
                              {((activeTab === "provinsi" && tempProvince?.id === opt.id) ||
                                (activeTab === "kota" && tempCity?.id === opt.id) ||
                                (activeTab === "kecamatan" && tempSubdistrict?.id === opt.id) ||
                                (activeTab === "kodepos" && tempPostalCode === opt.name)) && (
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
                  <Label htmlFor="addr-street" className="text-xs font-bold text-muted-foreground uppercase">Nama Jalan & Nomor Rumah</Label>
                  <Input
                    id="addr-street"
                    value={addressStreet}
                    onChange={(e) => setAddressStreet(e.target.value)}
                    placeholder="Contoh: Jl. Dipatiukur No. 4"
                    className="rounded-xl border-border/50 text-xs h-10"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="addr-details" className="text-xs font-bold text-muted-foreground uppercase">Detail Lainnya (RT/RW, Komplek, dll.)</Label>
                  <Input
                    id="addr-details"
                    value={addressDetails}
                    onChange={(e) => setAddressDetails(e.target.value)}
                    placeholder="Contoh: RT 03/RW 11, Komplek Permai, pagar hijau"
                    className="rounded-xl border-border/50 text-xs h-10"
                  />
                </div>

                {savedAddresses.length > 0 && (
                  <div className="flex items-center gap-2 py-1">
                    <input
                      type="checkbox"
                      id="make-default"
                      checked={makeDefault}
                      onChange={(e) => setMakeDefault(e.target.checked)}
                      className="rounded border-border/50 text-primary focus:ring-primary/20 h-4 w-4"
                    />
                    <Label htmlFor="make-default" className="text-xs font-semibold text-muted-foreground cursor-pointer select-none">Jadikan Alamat Utama (Default)</Label>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (savedAddresses.length > 0) {
                        setShowNewAddressForm(false);
                      } else {
                        setShowAddressModal(false);
                      }
                    }}
                    className="rounded-full flex-1 font-semibold"
                  >
                    Batal
                  </Button>
                  <Button type="submit" disabled={isSavingAddress} className="rounded-full flex-1 font-bold shadow-soft bg-primary hover:bg-primary-hover text-white">
                    {isSavingAddress ? "Menyimpan..." : "Simpan"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Loader fallback spinner icon
function Loader2({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}
