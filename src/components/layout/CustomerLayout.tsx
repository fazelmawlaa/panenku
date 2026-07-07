import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  ShoppingCart, User, Search, Menu, X, LogOut,
  Home, BookOpen, Recycle, LayoutDashboard, Sprout, MapPin, Phone, Check, ChevronDown, RefreshCw
} from "lucide-react";
import logoRumohTani from "@/assets/rumohtani_transparent.png";
import { useState, useEffect, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const nav = [
  { to: "/products", label: "Marketplace", icon: BookOpen },
  { to: "/consultations", label: "Konsultasi", icon: Sprout },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
] as const;

// Static regions database mapping representing Indonesia provinces, cities, districts, and zip codes for fallback
const localIndonesiaData: Record<string, Record<string, Record<string, string[]>>> = {
  "ACEH": {
    "Banda Aceh": {
      "Baiturrahman": ["23241", "23244"],
      "Syiah Kuala": ["23111", "23115"],
      "Ulee Kareng": ["23118", "23119"]
    },
    "Lhokseumawe": {
      "Banda Sakti": ["24351", "24354"],
      "Muara Dua": ["24352"]
    }
  },
  "BALI": {
    "Denpasar": {
      "Denpasar Barat": ["80111", "80119", "80120"],
      "Denpasar Timur": ["80231", "80239", "80240"],
      "Denpasar Selatan": ["80221", "80229", "80230"],
      "Denpasar Utara": ["80115", "80116"]
    },
    "Badung": {
      "Kuta": ["80361", "80362"],
      "Mengwi": ["80351", "80352"],
      "Canggu": ["80363", "80364"]
    }
  },
  "BANGKA BELITUNG": {
    "Pangkal Pinang": {
      "Gerunggang": ["33111", "33112"],
      "Bukit Intan": ["33141", "33144"]
    }
  },
  "BANTEN": {
    "Tangerang": {
      "Cipondoh": ["15141", "15148"],
      "Karawaci": ["15115", "15116"],
      "Ciledug": ["15151", "15157"]
    },
    "Tangerang Selatan": {
      "Serpong": ["15310", "15318"],
      "Ciputat": ["15411", "15414"],
      "Pondok Aren": ["15220", "15227"]
    },
    "Serang": {
      "Cipocok Jaya": ["42121", "42127"],
      "Serang Kota": ["42111", "42118"]
    }
  },
  "BENGKULU": {
    "Bengkulu Kota": {
      "Gading Cempaka": ["38221", "38225"],
      "Muara Bangkahulu": ["38119", "38122"]
    }
  },
  "DI YOGYAKARTA": {
    "Yogyakarta": {
      "Danurejan": ["55211", "55213"],
      "Gondokusuman": ["55221", "55225"],
      "Mantinejeron": ["55141", "55143"],
      "Umbulharjo": ["55161", "55167"]
    },
    "Sleman": {
      "Depok Sleman": ["55281", "55283"],
      "Mlati": ["55284", "55285"],
      "Gamping": ["55291", "55294"]
    },
    "Bantul": {
      "Sewon": ["55187", "55188"],
      "Kasihan": ["55181", "55184"]
    }
  },
  "DKI JAKARTA": {
    "Jakarta Selatan": {
      "Kebayoran Baru": ["12110", "12120", "12130"],
      "Tebet": ["12810", "12820", "12830"],
      "Cilandak": ["12410", "12420", "12430"],
      "Pasar Minggu": ["12510", "12520"],
      "Pancoran": ["12780", "12790"]
    },
    "Jakarta Pusat": {
      "Menteng": ["10310", "10320", "10330"],
      "Kemayoran": ["10610", "10620", "10630"],
      "Sawah Besar": ["10710", "10720"],
      "Tanah Abang": ["10210", "10220"]
    },
    "Jakarta Timur": {
      "Jatinegara": ["13310", "13320"],
      "Duren Sawit": ["13440", "13450"],
      "Pulogadung": ["13210", "13220"],
      "Cakung": ["13910", "13950"]
    },
    "Jakarta Barat": {
      "Cengkareng": ["11730", "11740"],
      "Kebon Jeruk": ["11530", "11540"],
      "Grogol Petamburan": ["11440", "11450"],
      "Palmerah": ["11480", "11490"]
    },
    "Jakarta Utara": {
      "Kelapa Gading": ["14240", "14250"],
      "Penjaringan": ["14460", "14470"],
      "Tanjung Priok": ["14310", "14320"]
    }
  },
  "JAWA BARAT": {
    "Bandung": {
      "Coblong": ["40132", "40135", "40139"],
      "Sukajadi": ["40161", "40162", "40163"],
      "Cibeunying": ["40191", "40192"],
      "Lengkong": ["40261", "40262"],
      "Astana Anyar": ["40241", "40242"]
    },
    "Bogor": {
      "Bogor Timur": ["16141", "16142"],
      "Bogor Tengah": ["16121", "16122"],
      "Bogor Barat": ["16111", "16112"],
      "Cibinong": ["16911", "16914"]
    },
    "Depok": {
      "Beji": ["16421", "16424"],
      "Pancoran Mas": ["16431", "16436"],
      "Sukmajaya": ["16411", "16418"]
    },
    "Bekasi": {
      "Bekasi Barat": ["17131", "17134"],
      "Bekasi Timur": ["17111", "17113"],
      "Pondok Gede": ["17411", "17415"]
    }
  },
  "JAWA TENGAH": {
    "Semarang": {
      "Tembalang": ["50275", "50277"],
      "Banyumanik": ["50261", "50264"],
      "Pedurungan": ["50191", "50198"]
    },
    "Surakarta": {
      "Banjarsari": ["57131", "57139"],
      "Laweyan": ["57141", "57149"]
    }
  },
  "JAWA TIMUR": {
    "Surabaya": {
      "Tegalsari": ["60261", "60262"],
      "Gubeng": ["60281", "60285"],
      "Genteng": ["60271", "60275"],
      "Wonokromo": ["60241", "60244"]
    },
    "Malang": {
      "Klojen": ["65111", "65119"],
      "Lowokwaru": ["65141", "65145"]
    }
  },
  "SUMATERA UTARA": {
    "Medan": {
      "Medan Baru": ["20152", "20154"],
      "Medan Selayang": ["20131", "20137"],
      "Medan Petisah": ["20111", "20112"]
    }
  },
  "SUMATERA BARAT": {
    "Padang": {
      "Padang Barat": ["25111", "25119"],
      "Padang Timur": ["25121", "25129"]
    }
  },
  "RIAU": {
    "Pekanbaru": {
      "Tampan": ["28291", "28294"],
      "Senapelan": ["28151", "28156"]
    }
  },
  "KEPULAWAN RIAU": {
    "Batam": {
      "Batam Kota": ["29461", "29464"],
      "Lubuk Baja": ["29431", "29433"]
    }
  },
  "SUMATERA SELATAN": {
    "Palembang": {
      "Ilir Barat I": ["30137", "30139"],
      "Seberang Ulu I": ["30251", "30257"]
    }
  },
  "LAMPUNG": {
    "Bandar Lampung": {
      "Kedaton": ["35141", "35149"],
      "Tanjung Karang Pusat": ["35111", "35118"]
    }
  },
  "KALIMANTAN BARAT": {
    "Pontianak": {
      "Pontianak Kota": ["78111", "78116"],
      "Pontianak Selatan": ["78121", "78124"]
    }
  },
  "KALIMANTAN TIMUR": {
    "Samarinda": {
      "Samarinda Kota": ["75111", "75117"],
      "Samarinda Ulu": ["75121", "75127"]
    },
    "Balikpapan": {
      "Balikpapan Kota": ["76111", "76114"],
      "Balikpapan Selatan": ["76115", "76117"]
    }
  },
  "SULAWESI UTARA": {
    "Manado": {
      "Wenang": ["95111", "95117"],
      "Sario": ["95114", "95115"]
    }
  },
  "SULAWESI SELATAN": {
    "Makassar": {
      "Rappocini": ["90222", "90224"],
      "Panakkukang": ["90231", "90234"],
      "Ujung Pandang": ["90111", "90115"]
    }
  },
  "MALUKU": {
    "Ambon": {
      "Sirimau": ["97121", "97129"]
    }
  },
  "GORONTALO": {
    "Gorontalo Kota": {
      "Kota Selatan": ["96111", "96115"],
      "Kota Tengah": ["96116", "96118"]
    }
  },
  "JAMBI": {
    "Jambi Kota": {
      "Telanaipura": ["36121", "36124"],
      "Jelutung": ["36131", "36135"]
    }
  },
  "KALIMANTAN SELATAN": {
    "Banjarmasin": {
      "Banjarmasin Tengah": ["70111", "70118"],
      "Banjarmasin Utara": ["70121", "70125"]
    }
  },
  "KALIMANTAN TENGAH": {
    "Palangkaraya": {
      "Pahandut": ["73111", "73115"],
      "Jekan Raya": ["73112", "73118"]
    }
  },
  "KALIMANTAN UTARA": {
    "Tanjung Selor": {
      "Tanjung Selor Hilir": ["77211", "77215"]
    }
  },
  "MALUKU UTARA": {
    "Ternate": {
      "Ternate Selatan": ["97711", "97715"],
      "Ternate Utara": ["97721", "97725"]
    }
  },
  "NUSA TENGGARA BARAT": {
    "Mataram": {
      "Ampenan": ["83111", "83114"],
      "Cakranegara": ["83231", "83239"]
    }
  },
  "NUSA TENGGARA TIMUR": {
    "Kupang": {
      "Alak": ["85231", "85239"],
      "Kelapa Lima": ["85221", "85228"]
    }
  },
  "SULAWESI BARAT": {
    "Mamuju": {
      "Mamuju Kota": ["91511", "91515"]
    }
  },
  "SULAWESI TENGAH": {
    "Palu": {
      "Palu Timur": ["94111", "94118"],
      "Palu Barat": ["94121", "94125"]
    }
  },
  "SULAWESI TENGGARA": {
    "Kendari": {
      "Kadia": ["93117", "93118"],
      "Wua-Wua": ["93115", "93116"]
    }
  },
  "PAPUA": {
    "Jayapura": {
      "Jayapura Utara": ["99111", "99119"]
    }
  },
  "PAPUA BARAT": {
    "Manokwari": {
      "Manokwari Barat": ["98311", "98315"]
    }
  },
  "PAPUA SELATAN": {
    "Merauke": {
      "Merauke Kota": ["99611", "99615"]
    }
  },
  "PAPUA TENGAH": {
    "Nabire": {
      "Nabire Kota": ["98811", "98815"]
    }
  },
  "PAPUA PEGUNUNGAN": {
    "Wamena": {
      "Wamena Kota": ["99511", "99515"]
    }
  },
  "PAPUA BARAT DAYA": {
    "Sorong": {
      "Sorong Barat": ["98411", "98415"]
    }
  }
};


export function CustomerLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const activeNav = nav;

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
        const staticCities = Object.keys(localIndonesiaData[tempProvince.name] || {}).map((c) => ({ id: c, name: c }));
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
        const staticSubs = (localIndonesiaData[tempProvince?.name || ""]?.[tempCity.name] || {});
        const staticSubsList = Object.keys(staticSubs).map((s) => ({ id: s, name: s }));
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
    const staticCodes = localIndonesiaData[tempProvince?.name || ""]?.[tempCity?.name || ""]?.[tempSubdistrict.name];
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
    if (user?.id) {
      const savedFields = localStorage.getItem(`panenku_address_fields_${user.id}`);
      if (savedFields) {
        try {
          const parsed = JSON.parse(savedFields);
          setAddressRecipientName(parsed.recipientName || user.name || "");
          setAddressRecipientPhone(parsed.recipientPhone || "");
          setTempProvince(parsed.province ? { id: parsed.province.id, name: parsed.province.name } : null);
          setTempCity(parsed.city ? { id: parsed.city.id, name: parsed.city.name } : null);
          setTempSubdistrict(parsed.subdistrict ? { id: parsed.subdistrict.id, name: parsed.subdistrict.name } : null);
          setTempPostalCode(parsed.postalCode || "");
          setAddressStreet(parsed.street || "");
          setAddressDetails(parsed.details || "");
          return;
        } catch (e) {
          console.error(e);
        }
      }

      // Query DB profiles fallback
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();
        if (data && !error) {
          setAddressRecipientName(data.full_name || user.name || "");
          setAddressRecipientPhone(data.phone || "");
          setAddressStreet(data.address || "");
        } else {
          setAddressRecipientName(user.name || "");
        }
      } catch (err) {
        console.error(err);
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
        window.location.reload();
      }, 500);
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
      const compiledAddress = `${addressStreet}, ${addressDetails}, Kec. ${tempSubdistrict.name}, Kota ${tempCity.name}, Prov. ${tempProvince.name}, ${tempPostalCode} (Penerima: ${addressRecipientName}, Telp: ${addressRecipientPhone})`;

      const { error } = await supabase
        .from("profiles")
        .update({
          address: compiledAddress,
        })
        .eq("id", user.id);

      if (error) throw error;

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

      toast.success("Alamat pengiriman berhasil diperbarui!");
      setShowAddressModal(false);

      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan alamat.");
    } finally {
      setIsSavingAddress(false);
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
            <img src={logoRumohTani} alt="RumohTani" className="h-14 sm:h-16 object-contain" />
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

          <button onClick={() => setOpen(!open)} className="lg:hidden grid h-10 w-10 place-items-center rounded-full hover:bg-muted">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
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
            <Link to="/cart" onClick={() => setOpen(false)} className="rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-muted flex items-center gap-2 text-foreground/80">
              <ShoppingCart className="h-4 w-4 shrink-0" />
              <span>Keranjang</span>
            </Link>
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
            <div className="space-y-1">
              <h3 className="font-['Plus_Jakarta_Sans',sans-serif] text-xl font-black text-foreground">Alamat Pengiriman</h3>
            </div>

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

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowAddressModal(false)} className="rounded-full flex-1 font-semibold">Batal</Button>
                <Button type="submit" disabled={isSavingAddress} className="rounded-full flex-1 font-bold shadow-soft">
                  {isSavingAddress ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </form>
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
