import { createFileRoute } from "@tanstack/react-router";
import { FarmerLayout } from "@/components/layout/FarmerLayout";
import { priceTrend } from "@/lib/mock-data";
import { CloudSun, Droplets, Wind, TrendingUp, Sparkles, Sprout, CalendarDays, Compass } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/farmer/harvest")({
  head: () => ({ meta: [{ title: "Kalender Tanam & Panen — RumohTani" }] }),
  component: HarvestForecast,
});

const days = Array.from({ length: 31 }, (_, i) => i + 1);

// Custom scheduling events (Tanam, Pemupukan, Panen)
const harvestEvents = [
  { day: 4, type: "panen", title: "Panen Padi Pandan Wangi (1.2 Ton)", color: "bg-emerald-600" },
  { day: 12, type: "tanam", title: "Penyemaian Bibit Tomat Baru", color: "bg-blue-600" },
  { day: 19, type: "pupuk", title: "Pemupukan Organik Lahan Cabai", color: "bg-amber-600" },
  { day: 26, type: "panen", title: "Panen Kopi Arabika Gayo (350 kg)", color: "bg-emerald-600" },
];

function HarvestForecast() {
  return (
    <FarmerLayout title="Kalender Tanam & Panen">
      <div className="space-y-8 relative">
        {/* BG details */}
        <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{ backgroundImage: "radial-gradient(#1a2b1b 1.5px, transparent 1.5px)", backgroundSize: "28px 28px" }} />
        <div className="absolute top-[5%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none" />
          
          {/* Header Card */}
          <div className="bg-white border border-border/40 rounded-[2rem] p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <div>
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Perencanaan Lahan</div>
              <h1 className="font-['Plus_Jakarta_Sans',sans-serif] text-3xl font-extrabold text-foreground tracking-tight mt-1">
                Kalender <span className="font-['Playfair_Display',serif] italic font-light text-primary">Tanam & Panen</span>
              </h1>
              <p className="text-sm text-muted-foreground font-light mt-1.5">Rencanakan musim tanam, atur siklus pemupukan organik, dan jadwalkan estimasi panen pre-order komoditas Anda secara presisi.</p>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-white shrink-0"><CalendarDays className="h-6 w-6" /></div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Calendar slot */}
            <div className="lg:col-span-2 bg-white border border-border/40 rounded-[2rem] p-6 sm:p-8 shadow-sm">
              <div className="border-b border-border/20 pb-4 mb-6">
                <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-lg text-foreground">Kalender Aktivitas Kebun — Juli 2026</h2>
                <p className="text-xs text-muted-foreground font-light">Ketuk hari yang diwarnai untuk melihat instruksi dan jadwal tugas</p>
              </div>

              <div className="grid grid-cols-7 gap-2.5 text-center text-xs font-bold mb-4">
                {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((d) => (
                  <div key={d} className="text-muted-foreground uppercase tracking-wider py-1">{d}</div>
                ))}
                
                {days.map((d) => {
                  const ev = harvestEvents.find(e => e.day === d);
                  return (
                    <div 
                      key={d} 
                      className={`aspect-square rounded-2xl grid place-items-center font-bold text-xs relative transition duration-200 cursor-pointer ${
                        ev 
                          ? `${ev.color} text-white shadow-soft hover:scale-105` 
                          : "bg-secondary/50 hover:bg-secondary text-foreground/80"
                      }`}
                      title={ev?.title}
                    >
                      {d}
                      {ev && <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-white animate-ping" />}
                    </div>
                  );
                })}
              </div>

              {/* Event descriptions */}
              <div className="mt-6 pt-4 border-t border-border/30 space-y-3">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Aktivitas Terjadwal Bulan Ini</div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {harvestEvents.map((ev, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/35 border border-border/25 text-xs text-left">
                      <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${ev.color}`} />
                      <div className="min-w-0">
                        <div className="font-bold text-foreground truncate">{ev.title}</div>
                        <div className="text-[10px] text-muted-foreground uppercase mt-0.5">Tanggal {ev.day} Juli 2026</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right section: Weather Widget */}
            <div className="bg-white border border-border/40 rounded-[2rem] p-6 sm:p-8 shadow-sm space-y-6 text-left">
              <div className="flex items-center gap-3 border-b border-border/20 pb-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center"><CloudSun className="h-5 w-5" /></div>
                <div>
                  <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-base text-foreground">Ramalan Cuaca Kebun</h3>
                  <p className="text-[10px] text-muted-foreground">Prediksi iklim mikro 5 hari</p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { day: "Hari ini", temp: "28°C", icon: "☀️", desc: "Cerah / Kelembapan ideal" },
                  { day: "Besok", temp: "27°C", icon: "⛅", desc: "Berawan sebagian" },
                  { day: "Rabu", temp: "25°C", icon: "🌧️", desc: "Hujan ringan sore hari" },
                  { day: "Kamis", temp: "26°C", icon: "⛅", desc: "Berawan tebal" },
                  { day: "Jumat", temp: "29°C", icon: "☀️", desc: "Cerah terik" },
                ].map((w) => (
                  <div key={w.day} className="flex items-center gap-3 rounded-2xl bg-secondary/30 border border-border/10 p-3 hover:bg-secondary/50 transition">
                    <div className="text-2xl shrink-0">{w.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs text-foreground">{w.day}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5 truncate">{w.desc}</div>
                    </div>
                    <div className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-sm text-foreground">{w.temp}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/20">
                <div className="rounded-xl bg-secondary/20 p-3 text-left">
                  <Droplets className="h-4 w-4 text-primary mb-1.5" />
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">Kelembapan</div>
                  <div className="font-extrabold text-sm text-foreground mt-0.5">72%</div>
                </div>
                <div className="rounded-xl bg-secondary/20 p-3 text-left">
                  <Wind className="h-4 w-4 text-primary mb-1.5" />
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">Kec. Angin</div>
                  <div className="font-extrabold text-sm text-foreground mt-0.5">12 km/jam</div>
                </div>
              </div>
            </div>
          </div>

          {/* Commodity trend & AI advice */}
          <div className="grid lg:grid-cols-2 gap-8 text-left">
            <div className="bg-white border border-border/40 rounded-[2rem] p-6 sm:p-8 shadow-sm">
              <div className="border-b border-border/20 pb-4 mb-6">
                <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-lg text-foreground flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" /> Tren Perkembangan Harga Pasar
                </h2>
                <p className="text-xs text-muted-foreground font-light">Informasi komparatif per kg dari pasar induk pangan nasional</p>
              </div>
              
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={priceTrend}>
                    <defs>
                      <linearGradient id="c1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--leaf)" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="var(--leaf)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                    <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                    <Tooltip contentStyle={{ background: "white", border: "1px solid var(--border)", borderRadius: 12 }} />
                    <Line type="monotone" name="Beras Pandan" dataKey="beras" stroke="var(--leaf)" strokeWidth={3} dot={false} />
                    <Line type="monotone" name="Cabai Rawit" dataKey="cabai" stroke="var(--honey)" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white border border-border/40 rounded-[2rem] p-6 sm:p-8 shadow-sm">
              <div className="border-b border-border/20 pb-4 mb-6">
                <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-lg text-foreground flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-honey fill-honey/10" /> AI Kalender Insight
                </h2>
                <p className="text-xs text-muted-foreground font-light">Rekomendasi taktis untuk mengoptimalkan masa panen</p>
              </div>

              <div className="space-y-4">
                {[
                  { t: "Kebutuhan Pasar Meningkat 📈", d: "Beras Pandan Wangi mengalami defisit pasokan di pasar induk. Pasang status Pre-Order Anda dengan harga Rp15.000/kg untuk mendapatkan keuntungan optimal.", tone: "primary" },
                  { t: "Peringatan Hujan Lebat 🌧️", d: "Curah hujan tinggi diproyeksikan pada tanggal 7-9 Juli. Disarankan untuk memundurkan sedikit jadwal panen cabai guna mencegah pembusukan buah pasca-panen.", tone: "honey" },
                ].map((insight, i) => (
                  <div key={i} className="rounded-2xl border border-border/40 p-4 hover:bg-secondary/30 transition">
                    <div className="font-bold text-xs uppercase tracking-wider text-emerald-800">{insight.t}</div>
                    <div className="text-[11px] font-light leading-relaxed text-muted-foreground mt-1">{insight.d}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

      </div>
    </FarmerLayout>
  );
}
