import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FarmerLayout } from "@/components/layout/FarmerLayout";
import bgDashboard from "@/assets/bg_dashboard.jpg";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  MessageSquare, DollarSign, Calendar, Clock,
  Check, X, Settings2, Loader2, ChevronDown, ChevronUp, Power,
  CheckCircle, XCircle, AlertCircle, Archive, Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatRupiah } from "@/lib/mock-data";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { PAYMENT_METHODS } from "@/components/PaymentLogos";

export const Route = createFileRoute("/farmer/consultations")({
  head: () => ({ meta: [{ title: "Sesi Konsultasi & Mentorship — PANENKU" }] }),
  component: FarmerConsultationsPage,
});

function FarmerConsultationsPage() {
  const { user } = useAuth();

  const [isOpenForConsultation, setIsOpenForConsultation] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [hourlyRate, setHourlyRate] = useState(75000);
  const [expertise, setExpertise] = useState("");
  const [experienceYears, setExperienceYears] = useState(1);
  const [selectedDays, setSelectedDays] = useState<string[]>(["Senin", "Rabu", "Jumat"]);
  const [timeStart, setTimeStart] = useState("09:00");
  const [timeEnd, setTimeEnd] = useState("15:00");
  const [selectedPayments, setSelectedPayments] = useState<string[]>(["BCA"]);
  const [paymentDetails, setPaymentDetails] = useState<Record<string, { number: string; holder: string }>>({
    BCA: { number: "", holder: "" },
    BSI: { number: "", holder: "" },
    BRI: { number: "", holder: "" },
    Mandiri: { number: "", holder: "" },
    DANA: { number: "", holder: "" },
    OVO: { number: "", holder: "" },
    ShopeePay: { number: "", holder: "" }
  });

  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTogglingOpen, setIsTogglingOpen] = useState(false);

  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);

  const navigate = useNavigate();

  const fetchRealBookings = async () => {
    if (!user) return;
    setIsLoadingBookings(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("farmer_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        const consultOrders = data.filter(o => o.product_name && o.product_name.startsWith("Konsultasi: "));
        const buyerIds = [...new Set(consultOrders.map(o => o.user_id).filter(Boolean))];

        let buyerProfilesMap: Record<string, { name?: string; avatar?: string }> = {};
        if (buyerIds.length > 0) {
          const { data: buyers } = await supabase
            .from("profiles")
            .select("id, full_name, address")
            .in("id", buyerIds);

          if (buyers) {
            buyers.forEach(b => {
              let avatar = b.avatar_url || "";
              if (!avatar && b.address && b.address.trim().startsWith("{")) {
                try {
                  const parsed = JSON.parse(b.address);
                  avatar = parsed.avatar_url || "";
                } catch (_) {}
              }
              buyerProfilesMap[b.id] = {
                name: b.full_name || undefined,
                avatar: avatar || undefined
              };
            });
          }
        }

        const mapped = consultOrders.map(o => {
          let topicText = "Materi Konsultasi";
          let payMethodText = "BCA";
          if (o.shipping_address) {
            const methodMatch = o.shipping_address.match(/\[Metode:\s*([^\]]+)\]/);
            if (methodMatch) payMethodText = methodMatch[1];
            if (o.shipping_address.includes(" - ")) {
              topicText = o.shipping_address.split(" - ")[1] || topicText;
            } else {
              topicText = o.shipping_address;
            }
          }
          const profileInfo = buyerProfilesMap[o.user_id] || {};
          const studentName = profileInfo.name || o.buyer_name || "Calon Petani";
          const avatar = profileInfo.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(studentName)}`;

          return {
            id: o.id,
            studentId: o.user_id,
            studentName,
            topic: topicText,
            paymentMethod: payMethodText,
            date: o.date ? o.date.split(" ")[0] : new Date(o.created_at).toLocaleDateString("id-ID"),
            time: o.date && o.date.split(" ")[1] ? o.date.split(" ")[1] : "10:00",
            duration: 1,
            status: o.status === "Paid" ? "approved" : o.status === "Rejected" ? "rejected" : o.status === "Completed" ? "completed" : "pending",
            price: o.total,
            avatar
          };
        });
        setBookings(mapped);
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  useEffect(() => { fetchRealBookings(); }, [user]);

  useEffect(() => {
    const fetchProfileSettings = async () => {
      if (!user) return;
      setIsLoadingProfile(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("address, full_name")
          .eq("id", user.id)
          .maybeSingle();

        if (!error && data) {
          if (data.address && data.address.trim().startsWith("{")) {
            try {
              const parsed = JSON.parse(data.address);
              setIsOpenForConsultation(parsed.isOpenForConsultation === true);
              setHourlyRate(parsed.rate || 75000);
              setExpertise(parsed.expertise || "");
              setExperienceYears(parsed.experienceYears || 1);
              setSelectedDays(parsed.selectedDays || ["Senin", "Rabu", "Jumat"]);
              setTimeStart(parsed.timeStart || "09:00");
              setTimeEnd(parsed.timeEnd || "15:00");
              setSelectedPayments(parsed.payments || ["BCA"]);
              if (parsed.paymentDetails) {
                setPaymentDetails(prev => ({ ...prev, ...parsed.paymentDetails }));
              }
            } catch (_) {}
          }
          if (data.full_name) {
            setPaymentDetails(prev => {
              const next: typeof prev = {} as typeof prev;
              (Object.keys(prev) as string[]).forEach(key => {
                next[key] = { number: prev[key]?.number || "", holder: prev[key]?.holder || data.full_name };
              });
              return next;
            });
          }
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setIsLoadingProfile(false);
      }
    };
    fetchProfileSettings();
  }, [user]);

  const handleToggleOpen = async () => {
    if (!user) { toast.error("Silakan masuk terlebih dahulu"); return; }
    const newVal = !isOpenForConsultation;
    setIsTogglingOpen(true);
    try {
      const { data: cur } = await supabase
        .from("profiles")
        .select("address")
        .eq("id", user.id)
        .maybeSingle();

      let existing: any = {};
      if (cur?.address && cur.address.trim().startsWith("{")) {
        try { existing = JSON.parse(cur.address); } catch (_) {}
      }

      const mergedConfig = { ...existing, isOpenForConsultation: newVal };

      const { error } = await supabase
        .from("profiles")
        .update({ address: JSON.stringify(mergedConfig) })
        .eq("id", user.id);

      if (error) throw error;

      // Sync with product table immediately
      try {
        const { data: existingProd } = await supabase
          .from("products")
          .select("id, cultivation")
          .eq("farmer_id", user.id)
          .eq("type", "consultation")
          .maybeSingle();

        if (existingProd) {
          let updatedCultivation = existingProd.cultivation;
          if (updatedCultivation && updatedCultivation.trim().startsWith("{")) {
            try {
              const parsed = JSON.parse(updatedCultivation);
              parsed.isOpenForConsultation = newVal;
              updatedCultivation = JSON.stringify(parsed);
            } catch (_) {}
          } else {
            updatedCultivation = JSON.stringify(mergedConfig);
          }

          await supabase
            .from("products")
            .update({
              stock: newVal ? 999 : 0,
              cultivation: updatedCultivation
            })
            .eq("id", existingProd.id);
        }
      } catch (prodErr) {
        console.warn("Product sync failed:", prodErr);
      }

      setIsOpenForConsultation(newVal);
      toast.success(newVal ? "✅ Sesi konsultasi dibuka!" : "🔒 Sesi konsultasi ditutup.");
    } catch (err: any) {
      toast.error("Gagal mengubah status: " + err.message);
    } finally {
      setIsTogglingOpen(false);
    }
  };

  const toggleDay = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error("Silakan masuk terlebih dahulu"); return; }
    setIsSaving(true);
    try {
      const { data: cur } = await supabase
        .from("profiles")
        .select("address, full_name")
        .eq("id", user.id)
        .maybeSingle();

      let existing: any = {};
      let avatarUrl = "";

      if (cur?.address && cur.address.trim().startsWith("{")) {
        try {
          existing = JSON.parse(cur.address);
          avatarUrl = existing.avatar_url || "";
        } catch (_) {}
      }

      if (!avatarUrl && user) {
        avatarUrl = localStorage.getItem(`panenku_avatar_${user.id}`) || "";
      }

      const farmerName = cur?.full_name || user.email?.split("@")[0] || "Petani";

      const merged = {
        ...existing,
        rate: hourlyRate,
        expertise,
        experienceYears,
        selectedDays,
        timeStart,
        timeEnd,
        isOpenForConsultation,
        payments: selectedPayments,
        paymentDetails,
        bankDetails: {
          name: selectedPayments[0] || "BCA",
          number: paymentDetails[selectedPayments[0] || "BCA"]?.number || "",
          holder: paymentDetails[selectedPayments[0] || "BCA"]?.holder || farmerName
        },
        bioText: expertise
      };

      const { error } = await supabase
        .from("profiles")
        .update({ address: JSON.stringify(merged) })
        .eq("id", user.id);

      if (error) throw error;

      // Sync consultation product so buyer page can find this farmer
      try {
        const { data: existingProd } = await supabase
          .from("products")
          .select("id")
          .eq("farmer_id", user.id)
          .eq("type", "consultation")
          .maybeSingle();

        const serializedConfig = JSON.stringify(merged);
        const farmerAvatar = avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(farmerName)}`;

        if (existingProd) {
          await supabase
            .from("products")
            .update({
              name: `Konsultasi: ${farmerName}`,
              price: hourlyRate,
              description: expertise,
              stock: isOpenForConsultation ? 999 : 0,
              cultivation: serializedConfig,
              image: farmerAvatar
            })
            .eq("id", existingProd.id);
        } else {
          await supabase
            .from("products")
            .insert([{
              name: `Konsultasi: ${farmerName}`,
              category: "Mentorship",
              type: "consultation",
              farmer: farmerName,
              farmer_id: user.id,
              location: existing.addressText || "Indonesia",
              price: hourlyRate,
              unit: "Sesi",
              stock: isOpenForConsultation ? 999 : 0,
              image: farmerAvatar,
              description: expertise,
              ordered: 0,
              rating: 5,
              reviews: 0,
              cultivation: serializedConfig
            }]);
        }
      } catch (prodErr) {
        console.warn("Consultation product sync failed (non-fatal):", prodErr);
      }

      toast.success("✅ Pengaturan berhasil disimpan!");
      setShowSettings(false);
    } catch (err: any) {
      toast.error("Gagal menyimpan: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBookingAction = async (id: string, action: "approve" | "reject") => {
    const newStatus = action === "approve" ? "Paid" : "Rejected";
    try {
      const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", id);
      if (error) throw error;
      toast.success(action === "approve" ? "Sesi berhasil disetujui!" : "Sesi ditolak.");
      fetchRealBookings();
    } catch (err: any) {
      toast.error("Gagal mengubah status: " + err.message);
    }
  };

  const handleEndSession = async (id: string) => {
    const confirmEnd = window.confirm("Apakah Anda yakin ingin mengakhiri sesi konsultasi ini? Pembeli tidak akan bisa lagi mengirim pesan baru.");
    if (!confirmEnd) return;
    try {
      const { error } = await supabase.from("orders").update({ status: "Completed" }).eq("id", id);
      if (error) throw error;
      toast.success("Sesi konsultasi telah berhasil diakhiri.");
      fetchRealBookings();
    } catch (err: any) {
      toast.error("Gagal mengakhiri sesi: " + err.message);
    }
  };

  if (isLoadingProfile) {
    return (
      <FarmerLayout title="Sesi Konsultasi & Mentorship">
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </FarmerLayout>
    );
  }

  return (
    <FarmerLayout title="Sesi Konsultasi & Mentorship">
      <div className="space-y-8 relative">
        <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{ backgroundImage: "radial-gradient(#1a2b1b 1.5px, transparent 1.5px)", backgroundSize: "28px 28px" }} />
        <div className="absolute top-[5%] left-[-10%] w-[35vw] h-[35vw] rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[5%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-[#b4f05a]/5 blur-[100px] pointer-events-none" />

        {/* Header Banner */}
        <div
          className="relative overflow-hidden border border-emerald-800 rounded-[1.5rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-lg text-white"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(6, 78, 59, 0.95), rgba(6, 78, 59, 0.45)), url(${bgDashboard})`,
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        >
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(white 1px, transparent 1px)", backgroundSize: "16px 16px" }} />
          <div className="relative z-10">
            <div className="text-xs font-bold text-[#b4f05a] uppercase tracking-wider">Layanan Konsultasi</div>
            <h1 className="font-['Plus_Jakarta_Sans',sans-serif] text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              Kelola Mentorship &amp; <span className="font-['Playfair_Display',serif] italic font-light text-[#b4f05a]">Sesi Tanya Jawab</span>
            </h1>
          </div>
        </div>

        {/* Main Toggle Card */}
        <div className={`border rounded-[2.2rem] p-6 sm:p-8 transition-all duration-300 shadow-sm ${isOpenForConsultation ? "border-emerald-200 bg-gradient-to-br from-white to-emerald-50/20" : "bg-white border-border/40"}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className={`h-14 w-14 rounded-2xl grid place-items-center shrink-0 transition-all duration-300 ${isOpenForConsultation ? "bg-emerald-500 text-white shadow-soft" : "bg-secondary text-muted-foreground"}`}>
                <Award className="h-7 w-7" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-xl text-foreground">Status Pendaftaran Mentorship</h2>
                  <span className="relative flex h-2 w-2">
                    {isOpenForConsultation && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    )}
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${isOpenForConsultation ? "bg-emerald-500" : "bg-gray-450"}`}></span>
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5 font-light">
                  {isOpenForConsultation
                    ? "Layanan Anda aktif dan siap menerima jadwal konsultasi dari calon pembeli."
                    : "Layanan Anda tidak aktif. Calon pembeli tidak dapat melihat atau memesan sesi Anda saat ini."}
                </p>
                <div className="mt-2">
                  <Badge className={`text-xs font-bold px-3 py-1 rounded-full border-transparent ${isOpenForConsultation ? "bg-emerald-100 text-emerald-800" : "bg-muted text-muted-foreground"}`}>
                    {isOpenForConsultation ? "Terbuka" : "Tertutup"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 shrink-0 select-none">
              {/* Premium Custom Slider Toggle */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {isOpenForConsultation ? "Aktif" : "Nonaktif"}
                </span>
                <button
                  id="btn-toggle-consultation"
                  onClick={handleToggleOpen}
                  disabled={isTogglingOpen}
                  className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isOpenForConsultation ? "bg-primary" : "bg-gray-250"}`}
                >
                  <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-soft transition duration-200 ease-in-out ${isOpenForConsultation ? "translate-x-6" : "translate-x-0"}`} />
                </button>
              </div>

              {/* Settings Button */}
              <Button
                id="btn-open-settings"
                type="button"
                variant="outline"
                onClick={() => setShowSettings(s => !s)}
                className="rounded-full px-6 gap-2 font-bold shadow-soft"
              >
                <Settings2 className="h-4 w-4" />
                Pengaturan
                {showSettings ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </Button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <form onSubmit={handleSaveSettings} className="mt-8 pt-6 border-t border-border/40 space-y-6">
              <div className="text-sm font-bold text-foreground flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-primary" />
                Pengaturan Konsultasi
              </div>

              <div className="space-y-2">
                <Label htmlFor="rate" className="font-bold text-sm">Tarif per Jam (Rp)</Label>
                <div className="relative max-w-xs">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600" />
                  <Input id="rate" type="number" value={hourlyRate} onChange={e => setHourlyRate(Number(e.target.value))} className="pl-9 rounded-xl font-bold" placeholder="75000" min={0} />
                </div>
                <p className="text-[10px] text-muted-foreground">Saran: Rp50.000 – Rp150.000 per jam</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="expertise" className="font-bold text-sm">Keahlian & Topik Utama</Label>
                  <Input id="expertise" value={expertise} onChange={e => setExpertise(e.target.value)} className="rounded-xl" placeholder="e.g. Kompos Organik, Budidaya Melon" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="expYears" className="font-bold text-sm">Pengalaman (Tahun)</Label>
                  <Input id="expYears" type="number" value={experienceYears} onChange={e => setExperienceYears(Number(e.target.value))} className="rounded-xl" min={0} />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-sm">Hari Tersedia</Label>
                <div className="flex flex-wrap gap-2">
                  {["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"].map(day => {
                    const active = selectedDays.includes(day);
                    return (
                      <button key={day} type="button" onClick={() => toggleDay(day)}
                        className={`rounded-full px-4 py-2 text-xs font-bold transition duration-200 border ${active ? "bg-primary text-white border-primary" : "border-border/60 hover:bg-secondary text-muted-foreground"}`}>
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="timeStart" className="font-bold text-xs uppercase text-muted-foreground">Jam Mulai</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="timeStart" type="time" value={timeStart} onChange={e => setTimeStart(e.target.value)} className="pl-9 rounded-xl" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="timeEnd" className="font-bold text-xs uppercase text-muted-foreground">Jam Selesai</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="timeEnd" type="time" value={timeEnd} onChange={e => setTimeEnd(e.target.value)} className="pl-9 rounded-xl" />
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-t border-border/40 pt-4">
                <div>
                  <Label className="font-bold text-sm">Metode Pembayaran yang Diterima</Label>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Pilih metode yang akan ditampilkan ke pembeli.</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {PAYMENT_METHODS.map(pm => {
                    const isSelected = selectedPayments.includes(pm.id);
                    return (
                      <button key={pm.id} type="button"
                        onClick={() => setSelectedPayments(prev => isSelected ? prev.filter(id => id !== pm.id) : [...prev, pm.id])}
                        className={`flex items-center justify-center p-3.5 rounded-2xl border transition duration-200 ${isSelected ? "border-primary bg-primary/5 shadow-soft" : "border-border/60 hover:bg-secondary/40"}`}>
                        {pm.logo}
                      </button>
                    );
                  })}
                </div>

                {selectedPayments.length > 0 && (
                  <div className="space-y-4 pt-2">
                    <Label className="text-xs font-bold text-foreground uppercase tracking-wider block">Rincian Rekening / E-Wallet</Label>
                    <div className="grid gap-4">
                      {selectedPayments.map(pmId => {
                        const pm = PAYMENT_METHODS.find(p => p.id === pmId);
                        if (!pm) return null;
                        const cur = paymentDetails[pmId] || { number: "", holder: "" };
                        return (
                          <div key={pmId} className="bg-secondary/20 rounded-2xl p-4 sm:p-5 border border-border/40 space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">{pm.logo}<span className="text-xs font-bold uppercase">{pm.name}</span></div>
                              <Badge className="bg-primary/10 text-primary border-transparent text-[8.5px] font-bold px-2 py-0.5 rounded">
                                {pm.type === "bank" ? "Bank Transfer" : "E-Wallet"}
                              </Badge>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold text-muted-foreground uppercase">{pm.type === "bank" ? "Nomor Rekening" : `Nomor HP ${pm.name}`}</Label>
                                <Input value={cur.number} onChange={e => setPaymentDetails(prev => ({ ...prev, [pmId]: { ...cur, number: e.target.value } }))} className="rounded-xl h-10 text-xs bg-white" placeholder={pm.type === "bank" ? "e.g. 1234567890" : "e.g. 08123456789"} required />
                              </div>
                              <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold text-muted-foreground uppercase">Nama Pemilik</Label>
                                <Input value={cur.holder} onChange={e => setPaymentDetails(prev => ({ ...prev, [pmId]: { ...cur, holder: e.target.value } }))} className="rounded-xl h-10 text-xs bg-white" placeholder="Nama lengkap" required />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" disabled={isSaving} className="rounded-full px-8 gap-2 font-bold">
                  {isSaving ? <><Loader2 className="h-4 w-4 animate-spin" /><span>Menyimpan...</span></> : <span>Simpan Pengaturan</span>}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setShowSettings(false)} className="rounded-full">Batal</Button>
              </div>
            </form>
          )}
        </div>

        {/* Booking requests */}
        <div className="bg-white border border-border/40 rounded-[2rem] p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-lg text-foreground">Verifikasi Pembayaran Masuk</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Daftar permintaan sesi dari pembeli yang menunggu verifikasi.</p>
          </div>

          <div className="space-y-4">
            {isLoadingBookings ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-xs">Memuat data permintaan...</span>
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-xs text-muted-foreground text-center py-10">Belum ada permintaan verifikasi pembayaran masuk.</div>
            ) : (
              bookings.map(b => {
                const pm = PAYMENT_METHODS.find(p => p.id === b.paymentMethod);
                return (
                  <div
                    key={b.id}
                    className={`border rounded-3xl p-6 transition-all duration-300 ${
                      b.status === "approved"
                        ? "border-emerald-250 bg-emerald-50/10 shadow-sm"
                        : b.status === "completed"
                          ? "border-gray-200 bg-gray-50/20"
                          : b.status === "rejected"
                            ? "border-red-200 bg-red-50/10"
                            : "border-amber-200 bg-amber-50/10"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img src={b.avatar} alt={b.studentName} className="h-12 w-12 rounded-2xl object-cover border border-border/20 shadow-sm" />
                        <div className="text-left">
                          <div className="font-bold text-sm text-foreground">{b.studentName}</div>
                          <div className="text-[10px] font-semibold text-primary uppercase tracking-wider">Calon Petani</div>
                        </div>
                      </div>
                      <div className="text-left sm:text-right shrink-0">
                        <div className="text-xs text-muted-foreground">{b.id}</div>
                        <div className="font-bold text-primary text-sm mt-0.5">{formatRupiah(b.price)}</div>
                      </div>
                    </div>

                    <div className="mt-4 p-3 rounded-2xl bg-secondary/30 border border-border/20 text-left space-y-2">
                      <div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase">Topik Bahasan</div>
                        <div className="text-xs font-semibold text-foreground mt-0.5">{b.topic}</div>
                      </div>
                      <div className="flex items-center gap-2 pt-2 border-t border-border/10 text-xs">
                        <span className="text-muted-foreground font-bold">Metode Bayar:</span>
                        {pm ? pm.logo : <span className="font-bold text-primary">{b.paymentMethod}</span>}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-3 text-[11px] text-muted-foreground font-medium">
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-primary" /> {b.date}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-primary" /> {b.time} ({b.duration} Jam)</span>
                    </div>

                    {b.status === "pending" && (
                      <div className="flex gap-2 mt-5 pt-3 border-t border-border/40">
                        <Button onClick={() => handleBookingAction(b.id, "approve")} size="sm" className="rounded-full gap-1.5 text-[11px] px-4 font-bold">
                          <Check className="h-3.5 w-3.5" /> Verifikasi & Setujui
                        </Button>
                        <Button onClick={() => handleBookingAction(b.id, "reject")} size="sm" variant="outline" className="rounded-full gap-1 text-[11px] px-4 font-bold text-destructive border-destructive/20 hover:bg-destructive/10">
                          <X className="h-3.5 w-3.5" /> Tolak
                        </Button>
                      </div>
                    )}

                    {b.status === "approved" && (
                      <div className="mt-4 pt-3 border-t border-emerald-100/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <span className="text-emerald-700 font-bold flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-emerald-600" /> Terverifikasi (Aktif)</span>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handleEndSession(b.id)}
                            variant="outline"
                            size="sm"
                            className="rounded-full text-[10px] font-bold border-destructive/20 text-destructive hover:bg-destructive/10 flex items-center gap-1"
                          >
                            <X className="h-3.5 w-3.5" />
                            <span>Akhiri Sesi</span>
                          </Button>
                          <Button
                            onClick={() => navigate({ to: "/chat", search: { mentorId: b.studentId } })}
                            size="sm"
                            className="rounded-full text-[10px] font-bold bg-primary text-white hover:bg-primary/95 flex items-center gap-1"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            <span>Buka Chat</span>
                          </Button>
                        </div>
                      </div>
                    )}

                    {b.status === "completed" && (
                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground font-bold flex items-center gap-1.5">
                          <CheckCircle className="h-4 w-4 text-gray-400" /> Sesi Selesai (Diakhiri)
                        </span>
                        <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100 border-transparent rounded-full font-bold text-[9px] uppercase tracking-wider px-2 py-0.5">
                          Selesai
                        </Badge>
                      </div>
                    )}

                    {b.status === "rejected" && (
                      <div className="mt-4 pt-3 border-t border-red-100/50 text-xs flex items-center justify-between">
                        <span className="text-red-700 font-bold flex items-center gap-1.5"><XCircle className="h-4 w-4 text-red-500" /> Sesi Ditolak</span>
                        <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-transparent rounded-full font-bold text-[9px] uppercase tracking-wider px-2 py-0.5">
                          Ditolak
                        </Badge>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </FarmerLayout>
  );
}
