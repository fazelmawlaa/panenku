import { createFileRoute } from "@tanstack/react-router";
import { FarmerLayout } from "@/components/layout/FarmerLayout";
import { priceTrend } from "@/lib/mock-data";
import { CloudSun, Droplets, Wind, TrendingUp, Sparkles } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/farmer/harvest")({
  head: () => ({ meta: [{ title: "Prediksi Panen — PANENKU" }] }),
  component: HarvestForecast,
});

const days = Array.from({ length: 30 }, (_, i) => i + 1);
const harvestDays = [4, 12, 19, 25];

function HarvestForecast() {
  return (
    <FarmerLayout title="Prediksi Panen">
      <div className="space-y-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-card rounded-2xl p-5">
            <h2 className="font-display font-bold mb-4">Kalender Panen — Juli 2026</h2>
            <div className="grid grid-cols-7 gap-2 text-center text-xs">
              {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((d) => <div key={d} className="font-semibold text-muted-foreground py-2">{d}</div>)}
              {days.map((d) => {
                const has = harvestDays.includes(d);
                return (
                  <div key={d} className={`aspect-square rounded-xl grid place-items-center font-medium relative ${has ? "gradient-leaf text-white shadow-soft" : "bg-secondary/50 hover:bg-secondary"}`}>
                    {d}
                    {has && <span className="absolute bottom-1 h-1 w-1 rounded-full bg-white" />}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3"><CloudSun className="h-5 w-5 text-primary" /><h2 className="font-display font-bold">Cuaca 7 Hari</h2></div>
            <div className="space-y-2">
              {[
                { day: "Hari ini", temp: "28°", icon: "☀️", desc: "Cerah" },
                { day: "Besok", temp: "27°", icon: "⛅", desc: "Berawan" },
                { day: "Rabu", temp: "25°", icon: "🌧️", desc: "Hujan ringan" },
                { day: "Kamis", temp: "26°", icon: "⛅", desc: "Berawan" },
                { day: "Jumat", temp: "29°", icon: "☀️", desc: "Cerah" },
              ].map((w) => (
                <div key={w.day} className="flex items-center gap-3 rounded-xl bg-secondary/40 p-2.5">
                  <div className="text-2xl">{w.icon}</div>
                  <div className="flex-1 min-w-0"><div className="font-medium text-sm">{w.day}</div><div className="text-xs text-muted-foreground">{w.desc}</div></div>
                  <div className="font-display font-bold">{w.temp}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="rounded-xl bg-secondary/40 p-2.5"><Droplets className="h-3.5 w-3.5 text-primary mb-1" /><div className="text-xs text-muted-foreground">Kelembapan</div><div className="font-bold text-sm">72%</div></div>
              <div className="rounded-xl bg-secondary/40 p-2.5"><Wind className="h-3.5 w-3.5 text-primary mb-1" /><div className="text-xs text-muted-foreground">Angin</div><div className="font-bold text-sm">12 km/j</div></div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display font-bold flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" /> Tren Harga Komoditas</h2>
                <p className="text-xs text-muted-foreground">Update realtime dari pasar induk</p>
              </div>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={priceTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} tickFormatter={(v) => `${v / 1000}k`} />
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }} />
                  <Line type="monotone" dataKey="beras" stroke="var(--leaf)" strokeWidth={3} />
                  <Line type="monotone" dataKey="cabai" stroke="var(--honey)" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3"><Sparkles className="h-5 w-5 text-honey" /><h2 className="font-display font-bold">AI Insight</h2></div>
            <div className="space-y-3">
              {[
                { t: "Permintaan Tinggi 🔥", d: "Beras pandan wangi naik 18% minggu ini. Siapkan stok panen Juli.", tone: "primary" },
                { t: "Harga Optimal", d: "Jual cabai pada pekan ke-3 Juli — prediksi harga puncak Rp42.500/kg.", tone: "honey" },
                { t: "Risiko Cuaca", d: "Hujan deras 3 hari kedepan. Tunda panen padi yang belum matang penuh.", tone: "earth" },
              ].map((i) => (
                <div key={i.t} className="rounded-2xl border border-border/60 p-4">
                  <div className="font-display font-bold text-sm mb-1">{i.t}</div>
                  <div className="text-xs text-muted-foreground">{i.d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </FarmerLayout>
  );
}
