import { createFileRoute } from "@tanstack/react-router";
import { FarmerLayout } from "@/components/layout/FarmerLayout";
import { farmers, products } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Award, Star, Shield, Calendar, Leaf, Trophy } from "lucide-react";

export const Route = createFileRoute("/farmer/profile")({
  head: () => ({ meta: [{ title: "Profil Petani — PANENKU" }] }),
  component: Profile,
});

function Profile() {
  const f = farmers[0];
  const gallery = products.slice(0, 6);

  return (
    <FarmerLayout title="Profil Petani">
      <div className="space-y-6">
        {/* Header */}
        <div className="glass-card rounded-3xl overflow-hidden">
          <div className="h-40 sm:h-56 relative gradient-leaf">
            <img src="https://images.unsplash.com/photo-1500076656116-558758c991c1?auto=format&fit=crop&w=1600&q=70" className="h-full w-full object-cover opacity-50" alt="" />
          </div>
          <div className="p-6 -mt-12 sm:-mt-16 relative">
            <div className="flex flex-wrap items-end gap-4">
              <img src={f.image} alt={f.name} className="h-24 w-24 sm:h-32 sm:w-32 rounded-3xl border-4 border-background object-cover shadow-glow" />
              <div className="flex-1 min-w-[200px]">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-2xl sm:text-3xl font-bold">{f.name}</h2>
                  <Badge className="bg-primary text-primary-foreground gap-1"><Shield className="h-3 w-3" /> Terverifikasi</Badge>
                </div>
                <div className="text-muted-foreground">{f.farm}</div>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {f.location}</span>
                  <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-honey text-honey" /> {f.rating} ({f.harvests} panen)</span>
                </div>
              </div>
              <Button className="rounded-full">Edit Profil</Button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Farm info */}
            <div className="glass-card rounded-2xl p-5">
              <h3 className="font-display font-bold mb-4">Informasi Kebun</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field icon={Leaf} label="Luas Lahan" value={f.landSize} />
                <Field icon={Calendar} label="Pengalaman" value="12 tahun" />
                <Field icon={Award} label="Sertifikasi" value={f.certification} />
                <Field icon={MapPin} label="Komoditas" value={f.commodities.join(", ")} />
              </div>
            </div>

            {/* Gallery */}
            <div className="glass-card rounded-2xl p-5">
              <h3 className="font-display font-bold mb-4">Galeri Kebun</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {gallery.map((g) => (
                  <div key={g.id} className="aspect-square rounded-2xl overflow-hidden">
                    <img src={g.image} className="h-full w-full object-cover hover:scale-105 transition-transform duration-500" alt={g.name} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Achievements */}
            <div className="glass-card rounded-2xl p-5">
              <h3 className="font-display font-bold mb-4 flex items-center gap-2"><Trophy className="h-5 w-5 text-honey" /> Pencapaian</h3>
              <div className="space-y-3">
                {[
                  { t: "Petani Bulan Ini", d: "Juni 2026", color: "bg-honey/15" },
                  { t: "100+ Panen Sukses", d: "Milestone", color: "bg-primary/10" },
                  { t: "Sustainability A+", d: "Skor lingkungan", color: "bg-leaf-soft/20" },
                ].map((a) => (
                  <div key={a.t} className={`rounded-xl p-3 ${a.color}`}>
                    <div className="font-semibold text-sm">{a.t}</div>
                    <div className="text-xs text-muted-foreground">{a.d}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5">
              <h3 className="font-display font-bold mb-3">Sustainability Score</h3>
              <div className="text-center">
                <div className="inline-grid h-24 w-24 place-items-center rounded-full gradient-leaf text-white">
                  <div>
                    <div className="font-display text-3xl font-bold">A+</div>
                    <div className="text-[10px]">94/100</div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">Praktik pertanian ramah lingkungan</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FarmerLayout>
  );
}

function Field({ icon: Icon, label, value }: any) {
  return (
    <div className="rounded-xl bg-secondary/40 p-3 flex items-center gap-3">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="h-4 w-4" /></div>
      <div className="min-w-0"><div className="text-xs text-muted-foreground">{label}</div><div className="font-semibold truncate">{value}</div></div>
    </div>
  );
}
