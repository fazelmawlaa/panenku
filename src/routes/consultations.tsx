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
  MessageSquare, Calendar, Clock, Award, ShieldCheck
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/consultations")({
  head: () => ({ meta: [{ title: "Konsultasi Petani — RumohTani" }] }),
  component: ConsultationsPage,
});

function ConsultationsPage() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) {
      toast.info("Silakan masuk untuk menggunakan fitur konsultasi");
      navigate({ to: "/login", replace: true });
    }
  }, [loading, session, navigate]);

  // States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCommodity, setSelectedCommodity] = useState<string>("Semua");
  
  // Database-loaded registered farmers
  const [dbFarmers, setDbFarmers] = useState<any[]>([]);
  const [isLoadingFarmers, setIsLoadingFarmers] = useState(true);

  // Modal controls
  const [activeMentor, setActiveMentor] = useState<any>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);

  // Booking states
  const [bookingDate, setBookingDate] = useState("2026-07-06");
  const [bookingTime, setBookingTime] = useState("10:00");
  const [bookingNotes, setBookingNotes] = useState("");
  
  // Booked sessions tracking
  const [bookedFarmers, setBookedFarmers] = useState<string[]>(["Pak Sugeng"]); // Sugeng pre-activated

  // Sesi lists
  const [consultSessions, setConsultSessions] = useState([
    { id: "SES-892", mentor: "Pak Sugeng", topic: "Persiapan lahan padi lempung", date: "02 Jul 2026", time: "10:00", status: "Terjadwal", price: 75000 },
    { id: "SES-451", mentor: "Bu Rahma", topic: "Pencegahan karat daun kopi", date: "25 Jun 2026", time: "13:00", status: "Selesai", price: 95000 }
  ]);

  // Chat conversation streams
  const [typedMessage, setTypedMessage] = useState("");
  const [chatStreams, setChatStreams] = useState<{ [key: string]: any[] }>({
    "Pak Sugeng": [
      { sender: "mentor", text: "Halo! Ada yang bisa saya bantu dengan persiapan lahan padi Anda?", time: "09:12" }
    ],
    "Bu Rahma": [
      { sender: "mentor", text: "Kopi Gayo biasanya butuh naungan pohon lamtoro. Sudah Anda siapkan?", time: "Kemarin" }
    ]
  });

  useEffect(() => {
    const loadFarmers = async () => {
      setIsLoadingFarmers(true);
      const data = await fetchRegisteredFarmers();
      
      // Inject Halodoc metrics dynamically to database farmers
      const mapped = data.map((f, idx) => {
        const specs = [
          "Spesialis Budidaya Padi & Pangan", 
          "Ahli Kopi & Kompos Sirkular", 
          "Praktisi Sayuran Hortikultura", 
          "Mentor Pengolahan Limbah Tani"
        ];
        const experiences = ["15 tahun", "12 tahun", "18 tahun", "9 tahun"];
        const ratings = ["99%", "98%", "97%", "95%"];
        const prices = [75000, 95000, 60000, 80000];

        return {
          ...f,
          specialty: specs[idx % specs.length],
          experience: experiences[idx % experiences.length],
          satisfaction: ratings[idx % ratings.length],
          price: prices[idx % prices.length]
        };
      });

      setDbFarmers(mapped);
      setIsLoadingFarmers(false);
    };
    loadFarmers();
  }, []);

  // Filter Mentors dynamically
  const filteredMentors = useMemo(() => {
    return dbFarmers.filter((m) => {
      const matchSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          m.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Map selector categories
      let matchComm = true;
      if (selectedCommodity === "Padi") matchComm = m.specialty.includes("Padi");
      else if (selectedCommodity === "Kopi") matchComm = m.specialty.includes("Kopi");
      else if (selectedCommodity === "Sayuran") matchComm = m.specialty.includes("Sayur");
      else if (selectedCommodity === "Limbah") matchComm = m.specialty.includes("Limbah");

      return matchSearch && matchComm;
    });
  }, [dbFarmers, searchTerm, selectedCommodity]);

  const handleChatClick = (mentor: any) => {
    setActiveMentor(mentor);
    // If already booked, open chat directly. Otherwise, show booking checkout modal.
    if (bookedFarmers.includes(mentor.name)) {
      setShowChatModal(true);
    } else {
      setShowBookingModal(true);
    }
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMentor) return;

    const newSession = {
      id: "SES-" + Math.floor(100 + Math.random() * 899),
      mentor: activeMentor.name,
      topic: bookingNotes,
      date: new Date(bookingDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
      time: bookingTime,
      status: "Terjadwal",
      price: activeMentor.price
    };

    setConsultSessions([newSession, ...consultSessions]);
    setBookedFarmers([...bookedFarmers, activeMentor.name]);
    setBookingNotes("");
    setShowBookingModal(false);
    toast.success(`Pembayaran sesi konsultasi bersama ${activeMentor.name} berhasil!`);
    
    // Automatically open chat modal after checkout
    setTimeout(() => {
      setShowChatModal(true);
    }, 400);
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

        {/* Dynamic Halodoc Agricultural consultations layout split */}
        <div className="grid lg:grid-cols-[1fr_2fr] gap-8 items-start">
          
          {/* LEFT COLUMN: HERO GRADIENT INFO CARD & HISTORY */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 rounded-[2.5rem] overflow-hidden shadow-xl border border-emerald-800 relative p-6 sm:p-8 flex flex-col gap-6 text-white min-h-[580px]">
              {/* Background grids */}
              <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: "radial-gradient(white 1px, transparent 1px)", backgroundSize: "16px 16px" }} />
              <div className="absolute -left-[20%] -top-[20%] w-[300px] h-[300px] rounded-full bg-[#b4f05a]/15 blur-[60px] pointer-events-none" />
              <div className="absolute -right-[20%] -bottom-[20%] w-[300px] h-[300px] rounded-full bg-primary/25 blur-[70px] pointer-events-none" />
              
              {/* Farmer Hero Image Box with categories badge */}
              <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden border border-white/10 shadow-lg shrink-0 z-10">
                <img src={fotoPetani} alt="Petani Mentor" className="h-full w-full object-cover transition-transform duration-700 hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-transparent to-transparent" />
                <Badge className="absolute bottom-3 left-3 bg-[#b4f05a]/95 hover:bg-[#b4f05a]/95 text-emerald-950 border-none font-bold text-[9px] uppercase tracking-wider px-2.5 py-1">
                  120+ Mentor Aktif
                </Badge>
              </div>

              {/* Title & quote card */}
              <div className="space-y-3 relative z-10 text-left">
                <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-2xl tracking-tight text-white leading-tight">
                  Tanya Petani Mentor di <span className="text-[#b4f05a]">RumohTani</span>
                </h3>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
                  <p className="text-xs text-emerald-100/90 font-light italic leading-relaxed">
                    “Konsultasi langsung dengan petani berpengalaman untuk meningkatkan hasil panen.”
                  </p>
                </div>
              </div>

              {/* Glass benefit capsules */}
              <div className="space-y-3 relative z-10 text-left">
                {/* Benefit 1 */}
                <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                  <div className="relative flex h-3 w-3 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white">Respon cepat</div>
                    <div className="text-[10px] text-emerald-300 font-light mt-0.5">&lt; 5 menit</div>
                  </div>
                </div>

                {/* Benefit 2 */}
                <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                  <div className="h-8 w-8 shrink-0 rounded-xl bg-white/10 flex items-center justify-center text-lg select-none border border-white/10">🌱</div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white">Petani Terverifikasi</div>
                    <div className="text-[10px] text-emerald-300 font-light mt-0.5">Mentor tersertifikasi & berpengalaman</div>
                  </div>
                </div>

                {/* Benefit 3 */}
                <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                  <div className="h-8 w-8 shrink-0 rounded-xl bg-white/10 flex items-center justify-center text-lg select-none border border-white/10">♻️</div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white">Ekosistem Berkelanjutan</div>
                    <div className="text-[10px] text-emerald-300 font-light mt-0.5">Panduan budidaya & tata kelola limbah tani</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Riwayat sesi tabel */}
            <div className="bg-white border border-border/40 rounded-[2.2rem] p-6 sm:p-8 shadow-sm space-y-4">
              <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-sm text-foreground">Riwayat Sesi Anda</h3>
              <div className="space-y-3">
                {consultSessions.map((ses) => (
                  <div key={ses.id} className="border border-border/20 rounded-2xl p-3.5 flex items-center justify-between text-xs hover:bg-secondary/25 transition">
                    <div className="space-y-1">
                      <div className="font-bold text-foreground">{ses.mentor}</div>
                      <div className="text-[10px] text-muted-foreground line-clamp-1">{ses.topic}</div>
                      <div className="text-[9px] text-muted-foreground">{ses.date} · {ses.time}</div>
                    </div>
                    <Badge className={`rounded px-2 py-0.5 text-[9px] font-bold uppercase shrink-0 ${
                      ses.status === "Terjadwal" 
                        ? "bg-blue-500/10 text-blue-800 border-transparent" 
                        : "bg-emerald-500/10 text-emerald-800 border-transparent"
                    }`}>
                      {ses.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT CATALOG COLUMN */}
          <div className="space-y-6">
            
            {/* SEARCH & FILTERS CONTROLS */}
            <div className="bg-white border border-border/40 rounded-[2.2rem] p-5 shadow-sm">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between w-full select-none">
                
                {/* Search Input bar styled like Marketplace */}
                <div className="flex items-center flex-1 w-full bg-white border border-border/80 rounded-2xl shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-200 h-14">
                  <Search className="h-5 w-5 text-muted-foreground ml-4 shrink-0" />
                  <input 
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Cari nama mentor, komoditas, lokasi..." 
                    className="w-full h-full border-none focus:outline-none bg-transparent text-sm text-foreground px-4 font-light"
                  />
                  <button 
                    type="button"
                    className="bg-[#60a868] hover:bg-[#529359] text-white font-bold text-sm h-full px-8 transition duration-200 shrink-0"
                  >
                    Cari
                  </button>
                </div>

                {/* Filters Pills */}
                <div className="flex flex-wrap gap-1.5 justify-start w-full md:w-auto shrink-0">
                  {["Semua", "Padi", "Sayuran", "Kopi", "Limbah"].map((comm) => (
                    <button
                      key={comm}
                      onClick={() => setSelectedCommodity(comm)}
                      className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase transition duration-200 ${
                        selectedCommodity === comm 
                          ? "bg-primary text-white shadow-soft" 
                          : "bg-secondary hover:bg-secondary-hover text-foreground/80"
                      }`}
                    >
                      {comm}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* MENTOR LIST GRID (Halodoc card layout) */}
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
              <div className="grid gap-5 md:grid-cols-2">
                {filteredMentors.map((m) => {
                  const hasActiveSession = bookedFarmers.includes(m.name);
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
                          <Button 
                            onClick={() => handleChatClick(m)}
                            size="sm" 
                            className="rounded-full text-xs font-bold px-5 bg-primary hover:bg-primary/95 text-white shadow-soft h-8"
                          >
                            {hasActiveSession ? "Chat Sekarang" : "Konsultasi"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
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

        {/* ACTIVE CHAT OVERLAY MODAL */}
        {showChatModal && activeMentor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl flex flex-col h-[520px] overflow-hidden border border-border/30 animate-in zoom-in duration-300 relative">
              
              {/* Chat Header */}
              <div className="p-4 bg-secondary/50 border-b border-border/20 flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3">
                  <img src={activeMentor.image} className="h-10 w-10 rounded-xl object-cover border border-border/20" alt="" />
                  <div className="text-left">
                    <div className="font-bold text-sm text-foreground flex items-center gap-1.5">
                      {activeMentor.name}
                      <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                    </div>
                    <div className="text-[10px] text-muted-foreground font-light">Online · {activeMentor.specialty}</div>
                  </div>
                </div>
                <button 
                  onClick={() => setShowChatModal(false)}
                  className="h-8 w-8 rounded-full hover:bg-secondary grid place-items-center text-muted-foreground transition"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#f8f9f5]">
                {(chatStreams[activeMentor.name] || []).map((msg, i) => {
                  const isStudent = msg.sender === "student";
                  return (
                    <div key={i} className={`flex ${isStudent ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] rounded-2xl p-3 text-xs text-left shadow-sm ${
                        isStudent 
                          ? "bg-primary text-white rounded-tr-none" 
                          : "bg-white text-foreground rounded-tl-none border border-border/20"
                      }`}>
                        <div>{msg.text}</div>
                        <div className={`text-[8px] mt-1 text-right opacity-70 ${isStudent ? "text-white" : "text-muted-foreground"}`}>{msg.time}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Messages Input footer */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-border/20 flex gap-2 shrink-0 bg-white">
                <Input 
                  value={typedMessage} 
                  onChange={(e) => setTypedMessage(e.target.value)} 
                  placeholder={`Ketik pesan untuk ${activeMentor.name}...`} 
                  className="rounded-full flex-1 bg-secondary/50 font-light text-xs h-10 px-4 border-transparent focus-visible:ring-primary/20" 
                />
                <Button type="submit" size="icon" className="rounded-full h-10 w-10 shrink-0 shadow-soft"><Send className="h-4 w-4" /></Button>
              </form>
            </div>
          </div>
        )}

      </div>
    </CustomerLayout>
  );
}
