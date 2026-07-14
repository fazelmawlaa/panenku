import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FarmerLayout } from "@/components/layout/FarmerLayout";
import bgDashboard from "@/assets/bg_dashboard.jpg";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  MessageSquare, DollarSign, Calendar, Clock, Star,
  ShieldCheck, HelpCircle, Check, X, Sparkles, User, Settings2, Loader2
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

interface BookingRequest {
  id: string;
  studentName: string;
  topic: string;
  date: string;
  time: string;
  duration: number;
  status: "pending" | "approved" | "rejected";
  price: number;
  avatar: string;
}

function FarmerConsultationsPage() {
  const { user } = useAuth();

  // Consultation state
  const [isOpenForConsultation, setIsOpenForConsultation] = useState(true);
  const [hourlyRate, setHourlyRate] = useState(75000);
  const [expertise, setExpertise] = useState("Budidaya Padi Organik, Pengomposan Sekam");
  const [bio, setBio] = useState("Petani padi senior dengan 15 tahun pengalaman bertani di Sukabumi & Cianjur. Fokus pada ekosistem sirkular nol limbah.");
  const [experienceYears, setExperienceYears] = useState(15);
  
  // Weekly availability schedule
  const [selectedDays, setSelectedDays] = useState<string[]>(["Senin", "Rabu", "Jumat"]);
  const [timeStart, setTimeStart] = useState("09:00");
  const [timeEnd, setTimeEnd] = useState("15:00");

  // Payment options state
  const [selectedPayments, setSelectedPayments] = useState<string[]>(["BCA", "Mandiri", "DANA"]);
  const [bankAccountHolder, setBankAccountHolder] = useState("");
  const [addressText, setAddressText] = useState("Sukabumi");
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

  const navigate = useNavigate();

  // Booking verification states
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);

  // Fetch real booking requests from Supabase
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
        const mapped = data
          .filter(o => o.product_name && o.product_name.startsWith("Konsultasi: "))
          .map(o => {
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

            return {
              id: o.id,
              studentId: o.user_id,
              studentName: o.buyer_name || "Calon Petani",
              topic: topicText,
              paymentMethod: payMethodText,
              date: o.date ? o.date.split(" ")[0] : new Date(o.created_at).toLocaleDateString("id-ID"),
              time: o.date && o.date.split(" ")[1] ? o.date.split(" ")[1] : "10:00",
              duration: 1,
              status: o.status === "Paid" ? "approved" : o.status === "Rejected" ? "rejected" : "pending",
              price: o.total,
              avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80"
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

  useEffect(() => {
    fetchRealBookings();
  }, [user]);

  // Load profile settings from Supabase
  useEffect(() => {
    const fetchProfileSettings = async () => {
      if (!user) return;
      setIsLoadingProfile(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("address, full_name, bio")
          .eq("id", user.id)
          .maybeSingle();

        if (!error && data) {
          setBankAccountHolder(data.full_name || "");
          
          let parsedBio = data.bio || "";
          
          if (data.address && data.address.trim().startsWith("{")) {
            try {
              const parsed = JSON.parse(data.address);
              setAddressText(parsed.addressText || "");
              setBio(parsed.bioText || data.bio || "");
              setHourlyRate(parsed.rate || 75000);
              setIsOpenForConsultation(parsed.isOpenForConsultation !== undefined ? parsed.isOpenForConsultation : true);
              setSelectedDays(parsed.selectedDays || ["Senin", "Rabu", "Jumat"]);
              setTimeStart(parsed.timeStart || "09:00");
              setTimeEnd(parsed.timeEnd || "15:00");
              setExpertise(parsed.expertise || "Budidaya Padi Organik");
              if (parsed.experienceYears) setExperienceYears(parsed.experienceYears);
              setSelectedPayments(parsed.payments || ["BCA", "Mandiri", "DANA"]);
              
              if (parsed.paymentDetails) {
                setPaymentDetails({
                  BCA: parsed.paymentDetails.BCA || { number: "", holder: data.full_name || "" },
                  BSI: parsed.paymentDetails.BSI || { number: "", holder: data.full_name || "" },
                  BRI: parsed.paymentDetails.BRI || { number: "", holder: data.full_name || "" },
                  Mandiri: parsed.paymentDetails.Mandiri || { number: "", holder: data.full_name || "" },
                  DANA: parsed.paymentDetails.DANA || { number: "", holder: data.full_name || "" },
                  OVO: parsed.paymentDetails.OVO || { number: "", holder: data.full_name || "" },
                  ShopeePay: parsed.paymentDetails.ShopeePay || { number: "", holder: data.full_name || "" }
                });
              }
            } catch (e) {
              setAddressText(data.address);
              setBio(data.bio || "");
            }
          } else {
            setAddressText(data.address || "Sukabumi");
            setBio(data.bio || "");

            // Fallback load from bio column if it was saved there previously
            if (data.bio && data.bio.trim().startsWith("{")) {
              try {
                const parsed = JSON.parse(data.bio);
                setHourlyRate(parsed.rate || 75000);
                setIsOpenForConsultation(parsed.isOpenForConsultation !== undefined ? parsed.isOpenForConsultation : true);
                setSelectedDays(parsed.selectedDays || ["Senin", "Rabu", "Jumat"]);
                setTimeStart(parsed.timeStart || "09:00");
                setTimeEnd(parsed.timeEnd || "15:00");
                setExpertise(parsed.expertise || "Budidaya Padi Organik");
                if (parsed.experienceYears) setExperienceYears(parsed.experienceYears);
                setSelectedPayments(parsed.payments || ["BCA", "Mandiri", "DANA"]);
                
                if (parsed.paymentDetails) {
                  setPaymentDetails({
                    BCA: parsed.paymentDetails.BCA || { number: "", holder: data.full_name || "" },
                    BSI: parsed.paymentDetails.BSI || { number: "", holder: data.full_name || "" },
                    BRI: parsed.paymentDetails.BRI || { number: "", holder: data.full_name || "" },
                    Mandiri: parsed.paymentDetails.Mandiri || { number: "", holder: data.full_name || "" },
                    DANA: parsed.paymentDetails.DANA || { number: "", holder: data.full_name || "" },
                    OVO: parsed.paymentDetails.OVO || { number: "", holder: data.full_name || "" },
                    ShopeePay: parsed.paymentDetails.ShopeePay || { number: "", holder: data.full_name || "" }
                  });
                }
              } catch (e) {
                console.warn(e);
              }
            }
          }
        }
      } catch (err) {
        console.error("Error loading profile settings:", err);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfileSettings();
  }, [user]);

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleBookingAction = async (id: string, action: "approve" | "reject") => {
    const newStatus = action === "approve" ? "Paid" : "Rejected";
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      toast.success(action === "approve" 
        ? "Pembayaran sesi berhasil diverifikasi & disetujui! Sesi chat sekarang aktif." 
        : "Sesi konsultasi ditolak.");
      
      fetchRealBookings();
    } catch (err: any) {
      toast.error("Gagal mengubah status verifikasi: " + err.message);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Silakan masuk terlebih dahulu");
      return;
    }

    setIsSaving(true);
    const settings = {
      addressText: addressText,
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
        holder: paymentDetails[selectedPayments[0] || "BCA"]?.holder || bankAccountHolder
      },
      bioText: bio
    };

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          address: JSON.stringify(settings)
        })
        .eq("id", user.id);

      if (error) throw error;
      toast.success("Pengaturan & Tarif Sesi Konsultasi Berhasil Disimpan!");
    } catch (err: any) {
      toast.error("Gagal menyimpan pengaturan: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <FarmerLayout title="Sesi Konsultasi & Mentorship">
      <div className="space-y-8 relative">
        {/* BG decoration patterns */}
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
                Kelola Mentorship & <span className="font-['Playfair_Display',serif] italic font-light text-[#b4f05a]">Sesi Tanya Jawab</span>
              </h1>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Left section: Settings, availability & rates */}
            <div className="lg:col-span-2 space-y-8">
              
              <form onSubmit={handleSaveSettings} className="bg-white border border-border/40 rounded-[2rem] p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-4">
                  <div>
                    <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-lg text-foreground">Pengaturan Mentorship</h3>
                    <p className="text-xs text-muted-foreground">Aktifkan sesi, atur harga konsultasi, dan jadwalkan kalender Anda.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsOpenForConsultation(!isOpenForConsultation)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isOpenForConsultation ? "bg-primary" : "bg-muted"}`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isOpenForConsultation ? "translate-x-5" : "translate-x-0"}`} />
                    </button>
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {isOpenForConsultation ? "Buka" : "Tutup"}
                    </span>
                  </div>
                </div>

                {isOpenForConsultation && (
                  <div className="space-y-6">
                    {/* Rate setting */}
                    <div className="space-y-2">
                      <Label htmlFor="rate" className="font-bold text-sm text-foreground">Tarif Konsultasi per Jam (Rp)</Label>
                      <div className="relative max-w-sm">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-600" />
                        <Input 
                          id="rate"
                          type="number"
                          value={hourlyRate}
                          onChange={(e) => setHourlyRate(Number(e.target.value))}
                          className="pl-10 rounded-xl font-bold"
                          placeholder="75000"
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground">Saran: Rp50.000 - Rp150.000 adalah rata-rata tarif konsultasi saat ini.</p>
                    </div>

                    {/* Weekly Schedule Days */}
                    <div className="space-y-2">
                      <Label className="font-bold text-sm text-foreground">Hari Konsultasi Tersedia</Label>
                      <div className="flex flex-wrap gap-2">
                        {["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"].map((day) => {
                          const active = selectedDays.includes(day);
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => toggleDay(day)}
                              className={`rounded-full px-4 py-2 text-xs font-bold transition duration-200 border ${
                                active 
                                  ? "bg-primary text-white border-primary shadow-soft" 
                                  : "border-border/60 hover:bg-secondary text-muted-foreground"
                              }`}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Time Schedule slots */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="timeStart" className="font-bold text-xs text-muted-foreground uppercase">Jam Mulai</Label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            id="timeStart"
                            type="time"
                            value={timeStart}
                            onChange={(e) => setTimeStart(e.target.value)}
                            className="pl-9 rounded-xl"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="timeEnd" className="font-bold text-xs text-muted-foreground uppercase">Jam Selesai</Label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            id="timeEnd"
                            type="time"
                            value={timeEnd}
                            onChange={(e) => setTimeEnd(e.target.value)}
                            className="pl-9 rounded-xl"
                          />
                        </div>
                      </div>
                    </div>                    {/* Payment methods & Bank Details configuration */}
                    <div className="space-y-4 border-t border-border/40 pt-4 text-left">
                      <div>
                        <Label className="font-bold text-sm text-foreground">Metode Pembayaran yang Diterima</Label>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Pilih metode pembayaran yang akan ditampilkan saat calon pembeli menyewa sesi Anda.</p>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {PAYMENT_METHODS.map((pm) => {
                          const isSelected = selectedPayments.includes(pm.id);
                          return (
                            <button
                              key={pm.id}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedPayments(selectedPayments.filter(id => id !== pm.id));
                                } else {
                                  setSelectedPayments([...selectedPayments, pm.id]);
                                }
                              }}
                              className={`flex items-center justify-center p-3.5 rounded-2xl border transition duration-200 ${
                                isSelected
                                  ? "border-primary bg-primary/5 shadow-soft"
                                  : "border-border/60 hover:bg-secondary/40"
                              }`}
                            >
                              {pm.logo}
                            </button>
                          );
                        })}
                      </div>

                      {/* Bank Details section */}
                      {selectedPayments.length > 0 && (
                        <div className="space-y-4 pt-2">
                          <Label className="text-xs font-bold text-foreground uppercase tracking-wider block">✍️ Masukkan Rincian Rekening / E-Wallet Berbeda</Label>
                          <div className="grid gap-4">
                            {selectedPayments.map((pmId) => {
                              const pm = PAYMENT_METHODS.find(p => p.id === pmId);
                              if (!pm) return null;
                              
                              const currentVal = paymentDetails[pmId] || { number: "", holder: bankAccountHolder };

                              return (
                                <div key={pmId} className="bg-secondary/20 rounded-2xl p-4 sm:p-5 border border-border/40 space-y-4 text-left">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      {pm.logo}
                                      <span className="text-xs font-bold text-foreground uppercase tracking-wider">{pm.name}</span>
                                    </div>
                                    <Badge className="bg-primary/10 text-primary border-transparent text-[8.5px] font-bold py-0.5 rounded px-2">
                                      {pm.type === "bank" ? "Bank Transfer" : "E-Wallet"}
                                    </Badge>
                                  </div>
                                  
                                  <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5 text-left">
                                      <Label className="text-[10px] font-bold text-muted-foreground uppercase">
                                        {pm.type === "bank" ? "Nomor Rekening Bank" : "Nomor HP Akun " + pm.name}
                                      </Label>
                                      <Input
                                        value={currentVal.number}
                                        onChange={(e) => setPaymentDetails({
                                          ...paymentDetails,
                                          [pmId]: { ...currentVal, number: e.target.value }
                                        })}
                                        className="rounded-xl h-10 text-xs bg-white"
                                        placeholder={pm.type === "bank" ? "e.g. 123456789" : "e.g. 08123456789"}
                                        required
                                      />
                                    </div>
                                    <div className="space-y-1.5 text-left">
                                      <Label className="text-[10px] font-bold text-muted-foreground uppercase">Nama Pemilik Akun / Rekening</Label>
                                      <Input
                                        value={currentVal.holder}
                                        onChange={(e) => setPaymentDetails({
                                          ...paymentDetails,
                                          [pmId]: { ...currentVal, holder: e.target.value }
                                        })}
                                        className="rounded-xl h-10 text-xs bg-white"
                                        placeholder="Nama lengkap sesuai akun"
                                        required
                                      />
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Experience Info fields */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="expYears" className="font-bold text-sm text-foreground">Pengalaman Mengajar (Tahun)</Label>
                        <Input 
                          id="expYears"
                          type="number"
                          value={experienceYears}
                          onChange={(e) => setExperienceYears(Number(e.target.value))}
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="expList" className="font-bold text-sm text-foreground">Keahlian & Topik Utama</Label>
                        <Input 
                          id="expList"
                          value={expertise}
                          onChange={(e) => setExpertise(e.target.value)}
                          className="rounded-xl"
                          placeholder="e.g. Kompos Organik, Budidaya melon"
                        />
                      </div>
                    </div>

                    <Button type="submit" disabled={isSaving} className="rounded-full px-8 shadow-soft flex items-center gap-2">
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Menyimpan...</span>
                        </>
                      ) : (
                        <span>Simpan Jadwal & Tarif Sesi</span>
                      )}
                    </Button>
                  </div>
                )}
              </form>
              {/* Consultation requests list */}
              <div className="bg-white border border-border/40 rounded-[2rem] p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-lg text-foreground">Verifikasi Pembayaran Masuk</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Daftar bukti transfer/pembayaran masuk dari pembeli untuk verifikasi manual.</p>
                </div>

                <div className="space-y-4">
                  {isLoadingBookings ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <span className="text-xs font-light">Memuat data permintaan...</span>
                    </div>
                  ) : bookings.length === 0 ? (
                    <div className="text-xs text-muted-foreground text-center py-10 font-light">Belum ada permintaan verifikasi pembayaran masuk.</div>
                  ) : (
                    bookings.map((b) => {
                      const pm = PAYMENT_METHODS.find(p => p.id === b.paymentMethod);
                      return (
                        <div 
                          key={b.id} 
                          className={`border rounded-2xl p-5 sm:p-6 transition duration-300 ${
                            b.status === "approved" 
                              ? "border-emerald-100 bg-emerald-50/10" 
                              : b.status === "rejected"
                                ? "border-red-100 bg-red-50/10"
                                : "border-border/40 hover:border-primary/20 hover:bg-secondary/10"
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <img src={b.avatar} alt={b.studentName} className="h-12 w-12 rounded-xl object-cover border border-border/40 shadow-sm" />
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

                          <div className="mt-4 p-3 rounded-xl bg-secondary/30 border border-border/20 text-left space-y-2">
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
                            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-primary" /> {b.time} ({b.duration} Jam Sesi)</span>
                          </div>

                          {b.status === "pending" && (
                            <div className="flex gap-2 mt-5 pt-3 border-t border-border/40">
                              <Button 
                                onClick={() => handleBookingAction(b.id, "approve")}
                                size="sm" 
                                className="rounded-full gap-1.5 text-[11px] px-4 font-bold"
                              >
                                <Check className="h-3.5 w-3.5" /> Verifikasi & Setujui
                              </Button>
                              <Button 
                                onClick={() => handleBookingAction(b.id, "reject")}
                                size="sm" 
                                variant="outline" 
                                className="rounded-full gap-1 text-[11px] px-4 font-bold text-destructive border-destructive/20 hover:bg-destructive/10"
                              >
                                <X className="h-3.5 w-3.5" /> Tolak
                              </Button>
                            </div>
                          )}

                          {b.status === "approved" && (
                            <div className="mt-4 pt-3 border-t border-emerald-100/50 flex items-center justify-between text-xs">
                              <span className="text-emerald-700 font-bold flex items-center gap-1"><Check className="h-4 w-4" /> Verifikasi Berhasil (Aktif)</span>
                              <Button 
                                onClick={() => navigate({ to: "/chat", search: { mentorId: b.studentId } })}
                                variant="outline" 
                                size="sm" 
                                className="rounded-full text-[10px] font-bold border-primary text-primary hover:bg-primary/5 flex items-center gap-1"
                              >
                                <MessageSquare className="h-3.5 w-3.5" />
                                <span>Buka Chat Sesi</span>
                              </Button>
                            </div>
                          )}

                          {b.status === "rejected" && (
                            <div className="mt-4 pt-3 border-t border-red-100/50 text-xs text-left">
                              <span className="text-red-700 font-bold flex items-center gap-1"><X className="h-4 w-4" /> Sesi Ditolak</span>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Right section: Info tip boxes */}
            <div className="space-y-8">
              
              <div className="bg-white border border-border/40 rounded-[2rem] p-6 sm:p-8 shadow-sm space-y-6 text-left">
                <div className="flex items-center gap-3 border-b border-border/40 pb-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center"><Sparkles className="h-5 w-5" /></div>
                  <div>
                    <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-base text-foreground">AI Insight Mentor</h3>
                    <p className="text-[10px] text-muted-foreground">Analitik performa konsultasi</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-xl bg-secondary/30 p-4 border border-border/20 text-xs">
                    <div className="font-bold text-foreground">Topik Terpopuler Bulan Ini</div>
                    <div className="text-muted-foreground mt-1 leading-relaxed">Fermentasi limbah jerami padi & pembuatan MOL (Mikroorganisme Lokal).</div>
                  </div>
                  <div className="rounded-xl bg-secondary/30 p-4 border border-border/20 text-xs">
                    <div className="font-bold text-foreground">Peluang Pendapatan</div>
                    <div className="text-muted-foreground mt-1 leading-relaxed">Buka jam ketersediaan di hari Sabtu & Minggu untuk menjangkau hingga 3× lipat calon petani pemula pekerja kantoran.</div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-border/40 rounded-[2rem] p-6 sm:p-8 shadow-sm text-left">
                <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-sm text-foreground mb-3">💡 Panduan Mentorship</h3>
                <ol className="list-decimal pl-4 text-xs text-muted-foreground font-light space-y-2 leading-relaxed">
                  <li>Pembeli sesi akan menjadwalkan sesi konsultasi sesuai ketersediaan Anda.</li>
                  <li>Anda berhak menyetujui atau menolak sesi masuk paling lambat 24 jam sebelum sesi dimulai.</li>
                  <li>Sesi yang disetujui akan melahirkan ruang chat terenkripsi dan koordinasi lanjutan di platform.</li>
                </ol>
              </div>
            </div>
          </div>

      </div>
    </FarmerLayout>
  );
}
