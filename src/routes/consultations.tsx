import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { formatRupiah } from "@/lib/mock-data";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { fetchRegisteredFarmers } from "@/lib/products-db";
import fotoPetani from "@/assets/foto_petani.jpg";
import {
  Search, Send, X, Star, ArrowLeft, Loader2,
  MessageSquare, Calendar, Clock, Award, ShieldCheck,
  ChevronDown, ChevronUp
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PAYMENT_METHODS } from "@/components/PaymentLogos";

export const Route = createFileRoute("/consultations")({
  head: () => ({ meta: [{ title: "Konsultasi Petani — PANENKU" }] }),
  component: ConsultationsPage,
});

function ConsultationsPage() {
  const { session, loading, user, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) {
      toast.info("Silakan masuk untuk menggunakan fitur konsultasi");
      navigate({ to: "/login", replace: true });
    }
  }, [loading, session, navigate]);

  // States
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({});

  // Database-loaded registered farmers
  const [dbFarmers, setDbFarmers] = useState<any[]>([]);
  const [isLoadingFarmers, setIsLoadingFarmers] = useState(true);

  // Modal controls
  const [activeMentor, setActiveMentor] = useState<any>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Booking form states
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("10:00");
  const [bookingNotes, setBookingNotes] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");

  // Booked sessions tracking from Supabase
  const [bookedFarmers, setBookedFarmers] = useState<string[]>([]);
  const [pendingFarmers, setPendingFarmers] = useState<string[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);

  // Set default booking date to today
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setBookingDate(today);
  }, []);

  // Load paid & pending sessions from Supabase
  useEffect(() => {
    if (!user) return;
    const fetchBuyerSessions = async () => {
      setIsLoadingSessions(true);
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("product_name, status")
          .eq("user_id", user.id);

        if (!error && data) {
          const paidMentors = data
            .filter(o => o.status === "Paid" && o.product_name && o.product_name.startsWith("Konsultasi: "))
            .map(o => o.product_name.replace("Konsultasi: ", ""));

          const pendingMentors = data
            .filter(o => o.status === "Pending" && o.product_name && o.product_name.startsWith("Konsultasi: "))
            .map(o => o.product_name.replace("Konsultasi: ", ""));

          setBookedFarmers(paidMentors);
          setPendingFarmers(pendingMentors);
        }
      } catch (err) {
        console.error("Failed to load sessions:", err);
      } finally {
        setIsLoadingSessions(false);
      }
    };
    fetchBuyerSessions();
  }, [user]);

  // Load registered mentors
  useEffect(() => {
    const loadFarmers = async () => {
      setIsLoadingFarmers(true);
      const data = await fetchRegisteredFarmers();
      // Filter out mentors who closed consultation
      const openMentors = data.filter(f => f.isOpenForConsultation !== false);
      setDbFarmers(openMentors);
      setIsLoadingFarmers(false);
    };
    loadFarmers();
  }, []);

  // Filter Mentors dynamically
  const filteredMentors = useMemo(() => {
    return dbFarmers.filter((m) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        m.name.toLowerCase().includes(searchLower) ||
        m.location.toLowerCase().includes(searchLower) ||
        (m.specialty && m.specialty.toLowerCase().includes(searchLower))
      );
    });
  }, [dbFarmers, searchTerm]);

  // Group Mentors by Specialty Categories
  const groupedMentors = useMemo(() => {
    const groups: { [key: string]: any[] } = {
      "Budidaya Padi & Pangan": [],
      "Sayuran Hortikultura": [],
      "Kopi & Perkebunan": [],
      "Limbah Tani": []
    };

    filteredMentors.forEach((m) => {
      const spec = m.specialty || "";
      if (spec.includes("Padi") || spec.includes("Pangan")) {
        groups["Budidaya Padi & Pangan"].push(m);
      } else if (spec.includes("Sayur") || spec.includes("Hortikultura")) {
        groups["Sayuran Hortikultura"].push(m);
      } else if (spec.includes("Kopi") || spec.includes("Perkebunan")) {
        groups["Kopi & Perkebunan"].push(m);
      } else if (spec.includes("Limbah")) {
        groups["Limbah Tani"].push(m);
      } else {
        groups["Budidaya Padi & Pangan"].push(m);
      }
    });

    return groups;
  }, [filteredMentors]);

  const handleChatClick = (mentor: any) => {
    if (bookedFarmers.includes(mentor.name)) {
      navigate({ to: "/chat", search: { mentorId: mentor.id } });
    } else {
      setActiveMentor(mentor);
      // Auto-set the first accepted payment method
      if (mentor.payments && mentor.payments.length > 0) {
        setSelectedPaymentMethod(mentor.payments[0]);
      } else {
        setSelectedPaymentMethod("BCA");
      }
      setShowBookingModal(true);
    }
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMentor || !user) {
      toast.error("Silakan masuk terlebih dahulu");
      return;
    }

    const orderId = "SES-" + Math.floor(100 + Math.random() * 899) + "-" + Date.now().toString().slice(-4);
    const consultationProduct = "Konsultasi: " + activeMentor.name;

    const orderData = {
      id: orderId,
      user_id: user.id,
      product_id: activeMentor.id || "consultation_" + activeMentor.name,
      product_name: consultationProduct,
      qty: "1",
      total: activeMentor.price,
      status: "Pending", // Default to Pending until farmer manual verification
      date: new Date(bookingDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) + " " + bookingTime,
      farmer_id: activeMentor.id || null,
      shipping_address: `Konsultasi Online [Metode: ${selectedPaymentMethod}] - ${bookingNotes}`,
      buyer_name: profile?.full_name || user.email?.split("@")[0] || "Pembeli",
      buyer_phone: profile?.phone || "-"
    };

    try {
      const { error } = await supabase.from("orders").insert([orderData]);
      if (error) throw error;

      toast.success("Pemesanan sesi berhasil dikirim! Silakan lakukan transfer bank dan tunggu verifikasi pembayaran oleh petani.");
      setPendingFarmers([...pendingFarmers, activeMentor.name]);
      setBookingNotes("");
      setShowBookingModal(false);
    } catch (err: any) {
      toast.error("Gagal melakukan pemesanan sesi: " + err.message);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMentor || !typedMessage.trim()) return;

    const newMsg = {
      sender: "student",
      text: typedMessage,
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    };

    const mentorChat = chatStreams[activeMentor.name] || [];
    setChatStreams({
      ...chatStreams,
      [activeMentor.name]: [...mentorChat, newMsg]
    });
    setTypedMessage("");

    // Simulated reply from the mentor
    setTimeout(() => {
      const reply = {
        sender: "mentor",
        text: `Halo, terima kasih atas pertanyaannya. Pesan Anda mengenai "${typedMessage}" akan segera saya ulas kembali ya. Mari sukseskan panen kita!`,
        time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
      };
      setChatStreams((prev) => ({
        ...prev,
        [activeMentor.name]: [...(prev[activeMentor.name] || []), reply]
      }));
    }, 1500);
  };
  return (
    <CustomerLayout>
      <div className="mx-auto max-w-full px-4 sm:px-8 md:px-12 py-8 text-left space-y-6">

        {/* HERO BANNER CARD (IMAGE AS BACKGROUND) - Spans 100% full width of content container, keeping rounded corners */}
        <div className="rounded-[2.2rem] overflow-hidden shadow-xl border border-emerald-850 relative text-white flex flex-col justify-end min-h-[240px] sm:min-h-[460px] lg:min-h-[480px] group">
          {/* Background image */}
          <img
            src={fotoPetani}
            alt="Petani Mentor"
            className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
          />

          {/* Dark green gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-950/40 to-transparent z-10" />

          {/* Background grids */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-10" style={{ backgroundImage: "radial-gradient(white 1px, transparent 1px)", backgroundSize: "16px 16px" }} />

          {/* Centered Text below the image (with padding) */}
          <div className="relative z-20 p-6 sm:p-12 text-center w-full">
            <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-2xl sm:text-4xl tracking-tight text-white leading-tight">
              Tanya Petani Mentor di <span className="text-[#b4f05a]">PANENKU</span>
            </h3>
          </div>
        </div>

        {/* Standalone Search Bar & Chat Sessions Launcher Button */}
        <div className="flex flex-row gap-2 items-center w-full">
          {/* SEARCH BAR */}
          <div className="flex items-center flex-grow bg-white border border-border/80 rounded-2xl shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-200 h-12 min-w-0">
            <Search className="h-4 w-4 text-muted-foreground ml-3 sm:ml-4 shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama mentor, keahlian..."
              className="w-full h-full border-none focus:outline-none bg-transparent text-xs text-foreground px-2 sm:px-3 font-light min-w-0"
            />
            <button
              type="button"
              className="bg-[#b4f05a] hover:bg-[#a3db4e] text-emerald-950 font-extrabold text-xs h-full px-4 sm:px-8 transition duration-200 shrink-0"
            >
              Cari
            </button>
          </div>

          {/* CHAT LAUNCH BUTTON */}
          <Button
            type="button"
            onClick={() => navigate({ to: "/chat" })}
            className="bg-primary hover:bg-primary/95 text-white font-extrabold text-xs h-12 px-3.5 sm:px-6 rounded-2xl shadow-sm shrink-0 flex items-center gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Chat Sesi</span>
          </Button>
        </div>

        {/* MENTOR LIST GROUPED BY CATEGORY (Full Width Layout) */}
        <div className="space-y-8 w-full">
          {isLoadingFarmers ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-light">Memuat direktori petani mentor...</p>
            </div>
          ) : filteredMentors.length === 0 ? (
            <div className="bg-white border border-border/40 rounded-[2.2rem] p-12 text-center text-muted-foreground text-sm font-light shadow-sm">
              Tidak ada petani terdaftar yang memenuhi kriteria pencarian Anda.
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedMentors).map(([categoryName, mentors]) => {
                if (mentors.length === 0) return null;

                const isExpanded = expandedCategories[categoryName] || false;
                const visibleMentors = isExpanded ? mentors : mentors.slice(0, 2);

                return (
                  <div key={categoryName} className="space-y-4 text-left">
                    <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-extrabold text-base text-foreground border-b border-border/20 pb-2 text-left">
                      {categoryName}
                    </h3>

                    <div className="grid gap-5 md:grid-cols-2">
                      {visibleMentors.map((m) => {
                        const hasActiveSession = bookedFarmers.includes(m.name);
                        const hasPendingSession = pendingFarmers.includes(m.name);
                        return (
                          <div key={m.id} className="bg-white border border-border/40 rounded-3xl p-5 shadow-sm hover:shadow-soft transition-all duration-300 flex gap-4 text-left relative overflow-hidden group">
                            {/* Avatar */}
                            <div className="aspect-square h-20 w-20 rounded-2xl overflow-hidden shrink-0 border border-border/20 bg-secondary">
                              <img src={m.image} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" alt={m.name} />
                            </div>

                            {/* Info details */}
                            <div className="flex-grow min-w-0 flex flex-col justify-between">
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <h4 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-sm text-foreground truncate">{m.name}</h4>
                                  {hasActiveSession ? (
                                    <Badge className="bg-blue-500 text-white border-transparent text-[8px] uppercase tracking-wide px-1.5 py-0 rounded font-black shrink-0">Aktif</Badge>
                                  ) : hasPendingSession ? (
                                    <Badge className="bg-amber-500 text-white border-transparent text-[8px] uppercase tracking-wide px-1.5 py-0 rounded font-black shrink-0">Menunggu Verifikasi</Badge>
                                  ) : (
                                    <Badge className="bg-[#b4f05a]/20 text-emerald-800 border-transparent text-[8px] uppercase tracking-wide px-1.5 py-0 rounded font-black shrink-0">Verified</Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5 font-light">{m.specialty}</p>

                                <div className="flex items-center gap-2 mt-2 select-none">
                                  <span className="text-[9px] text-muted-foreground bg-secondary/50 rounded px-1.5 py-0.5 flex items-center gap-1">
                                    💼 {m.experience}
                                  </span>
                                  <span className="text-[9px] text-muted-foreground bg-secondary/50 rounded px-1.5 py-0.5 flex items-center gap-0.5">
                                    ⭐ {m.satisfaction}
                                  </span>
                                </div>
                              </div>

                              {/* Price & CTA */}
                              <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/20">
                                <div>
                                  <span className="text-[8px] text-muted-foreground uppercase font-black tracking-wider block">Biaya Sesi</span>
                                  <span className="font-display font-extrabold text-primary text-sm">{formatRupiah(m.price)}</span>
                                </div>
                                {hasActiveSession ? (
                                  <Button
                                    onClick={() => handleChatClick(m)}
                                    size="sm"
                                    className="rounded-full text-xs font-bold px-4 bg-primary hover:bg-primary/95 text-white shadow-soft h-8 flex items-center gap-1.5 animate-pulse"
                                  >
                                    <MessageSquare className="h-3.5 w-3.5" />
                                    <span>Chat Sekarang</span>
                                  </Button>
                                ) : hasPendingSession ? (
                                  <Button
                                    disabled
                                    size="sm"
                                    className="rounded-full text-xs font-bold px-3.5 bg-amber-500 text-white h-8 flex items-center gap-1 opacity-80 cursor-not-allowed border-transparent"
                                  >
                                    <Clock className="h-3.5 w-3.5 text-white" />
                                    <span className="text-[10px]">Menunggu Verifikasi</span>
                                  </Button>
                                ) : (
                                  <Button
                                    onClick={() => handleChatClick(m)}
                                    size="sm"
                                    className="rounded-full text-xs font-bold px-5 bg-primary hover:bg-primary/95 text-white shadow-soft h-8"
                                  >
                                    <span>Konsultasi</span>
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Show more button if > 2 mentors */}
                    {mentors.length > 2 && (
                      <div className="text-center pt-2">
                        <button
                          type="button"
                          onClick={() => setExpandedCategories({
                            ...expandedCategories,
                            [categoryName]: !isExpanded
                          })}
                          className="text-xs font-extrabold text-primary hover:underline flex items-center gap-1 mx-auto"
                        >
                          {isExpanded ? (
                            <>Sembunyikan Sesi</>
                          ) : (
                            <>Tampilkan Lebih Banyak ({mentors.length - 2} mentor lagi)</>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* BOOKING MODAL DIALOG OVERLAY */}
        {showBookingModal && activeMentor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.5rem] w-full max-w-md p-6 sm:p-8 space-y-6 shadow-2xl relative animate-in zoom-in duration-300 text-left border border-border/30">
              <button
                onClick={() => setShowBookingModal(false)}
                className="absolute right-6 top-6 h-8 w-8 rounded-full hover:bg-secondary grid place-items-center text-muted-foreground transition"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              <div className="space-y-2">
                <Badge className="bg-primary/10 text-primary border-transparent rounded-full font-bold text-[9px] uppercase tracking-wider px-3 py-1">
                  📅 Beli Sesi Konsultasi
                </Badge>
                <h3 className="font-['Plus_Jakarta_Sans',sans-serif] text-xl font-black text-foreground">Konfirmasi Konsultasi</h3>
              </div>

              {/* Profile Card Summary */}
              <div className="flex items-center gap-4 bg-secondary/40 border border-border/10 rounded-2xl p-4">
                <img src={activeMentor.image} className="h-12 w-12 rounded-xl object-cover" alt="" />
                <div>
                  <div className="font-bold text-sm">{activeMentor.name}</div>
                  <div className="text-xs text-muted-foreground">{activeMentor.specialty}</div>
                </div>
              </div>

              {/* Booking form */}
              <form onSubmit={handleConfirmBooking} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="b-date" className="text-xs font-bold text-muted-foreground uppercase">Tanggal Sesi</Label>
                    <Input id="b-date" type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} className="rounded-xl text-xs" required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="b-time" className="text-xs font-bold text-muted-foreground uppercase">Jam Sesi</Label>
                    <Input id="b-time" type="time" value={bookingTime} onChange={(e) => setBookingTime(e.target.value)} className="rounded-xl text-xs" required />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="b-notes" className="text-xs font-bold text-muted-foreground uppercase">Topik Bahasan / Keluhan</Label>
                  <Input
                    id="b-notes"
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    placeholder="e.g. Cara mengatasi penyakit karat daun gayo"
                    className="rounded-xl text-xs h-10 border-border/40"
                    required
                  />
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground uppercase">Pilih Metode Pembayaran</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {(activeMentor.payments || ["BCA", "Mandiri", "DANA"]).map((payId: string) => {
                      const pm = PAYMENT_METHODS.find(p => p.id === payId);
                      if (!pm) return null;
                      const isSelected = selectedPaymentMethod === payId;
                      return (
                        <button
                          key={payId}
                          type="button"
                          onClick={() => setSelectedPaymentMethod(payId)}
                          className={`flex items-center justify-center p-3 rounded-xl border transition duration-200 ${isSelected
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border/60 hover:bg-secondary/40"
                            }`}
                        >
                          {pm.logo}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Dynamic Payment Credentials Instructions */}
                {selectedPaymentMethod && (() => {
                  const pm = PAYMENT_METHODS.find(p => p.id === selectedPaymentMethod);
                  if (!pm) return null;

                  const creds = (activeMentor.paymentDetails && activeMentor.paymentDetails[selectedPaymentMethod])
                    || (activeMentor.bankDetails?.name === selectedPaymentMethod ? activeMentor.bankDetails : null)
                    || { number: activeMentor.bankDetails?.number || "123-456-7890", holder: activeMentor.bankDetails?.holder || activeMentor.name };

                  return (
                    <div className="bg-secondary/40 border border-border/20 rounded-2xl p-4 space-y-2 text-xs text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{pm.type === "bank" ? "🏦" : "📱"}</span>
                        <span className="font-bold text-foreground uppercase tracking-wider text-[9px]">
                          Rincian Pembayaran {pm.name}
                        </span>
                      </div>
                      <div className="space-y-1 font-sans text-left">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Metode:</span>
                          <span className="font-bold text-foreground">{pm.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            {pm.type === "bank" ? "Nomor Rekening:" : "Nomor HP / Akun:"}
                          </span>
                          <span className="font-bold text-primary select-all">{creds.number}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Atas Nama:</span>
                          <span className="font-bold text-foreground">{creds.holder}</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Subtotal fee */}
                <div className="flex justify-between items-center bg-primary/5 rounded-2xl border border-primary/10 p-4 pt-3">
                  <div>
                    <span className="text-[8px] text-muted-foreground uppercase font-black block">Total Biaya Sesi</span>
                    <span className="font-display font-black text-primary text-lg">{formatRupiah(activeMentor.price)}</span>
                  </div>
                  <Button type="submit" className="rounded-full px-6 font-bold shadow-soft">Bayar & Mulai Chat</Button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </CustomerLayout>
  );
}
