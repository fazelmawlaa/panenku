import { createFileRoute } from "@tanstack/react-router";
import { FarmerLayout } from "@/components/layout/FarmerLayout";
import { useState } from "react";
import { toast } from "sonner";
import {
  MessageSquare, DollarSign, Calendar, Clock, Star,
  ShieldCheck, HelpCircle, Check, X, Sparkles, User, Settings2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatRupiah } from "@/lib/mock-data";

export const Route = createFileRoute("/farmer/consultations")({
  head: () => ({ meta: [{ title: "Sesi Konsultasi & Mentorship — RumohTani" }] }),
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

  // Mock incoming bookings
  const [bookings, setBookings] = useState<BookingRequest[]>([
    {
      id: "CON-938",
      studentName: "Andi Pratama",
      topic: "Persiapan lahan lempung berpasir untuk jagung",
      date: "02 Jul 2026",
      time: "10:00",
      duration: 2,
      status: "pending",
      price: 150000,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80"
    },
    {
      id: "CON-482",
      studentName: "Budi Santoso",
      topic: "Formula pupuk kompos dari jerami fermentasi",
      date: "04 Jul 2026",
      time: "13:30",
      duration: 1,
      status: "pending",
      price: 75000,
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=100&q=80"
    },
    {
      id: "CON-109",
      studentName: "Rina Kartika",
      topic: "Penanganan hama wereng secara alami",
      date: "05 Jul 2026",
      time: "09:00",
      duration: 2,
      status: "approved",
      price: 150000,
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80"
    }
  ]);

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleBookingAction = (id: string, action: "approve" | "reject") => {
    setBookings(prev => 
      prev.map(b => b.id === id ? { ...b, status: action === "approve" ? "approved" : "rejected" } : b)
    );
    toast.success(action === "approve" ? "Sesi konsultasi disetujui" : "Sesi konsultasi ditolak");
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Pengaturan & Tarif Sesi Konsultasi Berhasil Disimpan!");
  };

  return (
    <FarmerLayout title="Sesi Konsultasi & Mentorship">
      <div className="space-y-8 relative">
        {/* BG decoration patterns */}
        <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{ backgroundImage: "radial-gradient(#1a2b1b 1.5px, transparent 1.5px)", backgroundSize: "28px 28px" }} />
        <div className="absolute top-[5%] left-[-10%] w-[35vw] h-[35vw] rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[5%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-[#b4f05a]/5 blur-[100px] pointer-events-none" />
          
          {/* Header Banner */}
          <div className="bg-white border border-border/40 rounded-[2rem] p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <div>
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Layanan Konsultasi</div>
              <h1 className="font-['Plus_Jakarta_Sans',sans-serif] text-3xl font-extrabold text-foreground tracking-tight mt-1">
                Kelola Mentorship & <span className="font-['Playfair_Display',serif] italic font-light text-primary">Sesi Tanya Jawab</span>
              </h1>
              <p className="text-sm text-muted-foreground font-light mt-1.5">Membantu calon petani pemula dengan menetapkan tarif sesi, mengatur jadwal mingguan, dan mengelola pendaftaran.</p>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-white shrink-0"><MessageSquare className="h-6 w-6" /></div>
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

                    <Button type="submit" className="rounded-full px-8 shadow-soft">
                      Simpan Jadwal & Tarif Sesi
                    </Button>
                  </div>
                )}
              </form>

              {/* Consultation requests list */}
              <div className="bg-white border border-border/40 rounded-[2rem] p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-lg text-foreground">Permintaan Sesi Masuk</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Sesi konsultasi baru dari calon petani yang membutuhkan persetujuan.</p>
                </div>

                <div className="space-y-4">
                  {bookings.map((b) => (
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

                      <div className="mt-4 p-3 rounded-xl bg-secondary/30 border border-border/20 text-left">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase">Topik Bahasan</div>
                        <div className="text-xs font-semibold text-foreground mt-0.5">{b.topic}</div>
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
                            className="rounded-full gap-1 text-[11px] px-4 font-bold"
                          >
                            <Check className="h-3.5 w-3.5" /> Setujui
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
                          <span className="text-emerald-700 font-bold flex items-center gap-1"><Check className="h-4 w-4" /> Sesi Disetujui</span>
                          <Button variant="outline" size="sm" className="rounded-full text-[10px] font-bold">Kirim Link Ruang Chat</Button>
                        </div>
                      )}

                      {b.status === "rejected" && (
                        <div className="mt-4 pt-3 border-t border-red-100/50 text-xs text-left">
                          <span className="text-red-700 font-bold flex items-center gap-1"><X className="h-4 w-4" /> Sesi Ditolak</span>
                        </div>
                      )}
                    </div>
                  ))}
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
