import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FarmerLayout } from "@/components/layout/FarmerLayout";
import farmingBg from "@/assets/farming_bg.png";
import { useState, useEffect } from "react";
import {
  MapPin, Award, Star, ShieldCheck, Calendar, Leaf, Trophy,
  StarOff, Heart, Sparkles, User, BadgeCheck, Sprout
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/farmer/profile")({
  head: () => ({ meta: [{ title: "Profil Penjual & Ulasan — PANENKU" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  
  // Profile state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  
  // Custom Farmer Biodata
  const [experience, setExperience] = useState("-");
  const [certification, setCertification] = useState("-");
  const [bio, setBio] = useState("-");
  const [focusArea, setFocusArea] = useState("-");
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const resetScroll = () => {
      document.documentElement.scrollLeft = 0;
      document.body.scrollLeft = 0;
      const elements = document.querySelectorAll(".overflow-x-hidden, [class*='overflow-y-auto'], [class*='overflow-x-hidden']");
      elements.forEach((el) => {
        if (el instanceof HTMLElement) {
          el.scrollLeft = 0;
        }
      });
    };
    resetScroll();
    requestAnimationFrame(resetScroll);
    const timer = setTimeout(resetScroll, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!user) return;

    // Load localStorage biodata as fallback
    let lsBio: any = {};
    try {
      const raw = localStorage.getItem(`panenku_farmer_biodata_${user.id}`);
      if (raw) lsBio = JSON.parse(raw);
    } catch (e) { /* ignore */ }

    const val = (dbVal: string | null | undefined, lsKey: string) => {
      if (dbVal && dbVal !== "-") {
        if (dbVal.trim().startsWith("{")) {
          try {
            const parsed = JSON.parse(dbVal);
            return parsed.addressText || "-";
          } catch (e) {}
        }
        return dbVal;
      }
      if (lsBio[lsKey] && lsBio[lsKey] !== "-" && lsBio[lsKey] !== "—") return lsBio[lsKey];
      return "-";
    };

    setName(profile?.full_name || user.email?.split("@")[0] || "Penjual Mitra");
    setPhone(val(profile?.phone, "phone"));
    setLocation(val(profile?.address, "location"));
    setExperience(val(profile?.experience, "experience"));
    setFocusArea(val(profile?.focus_area, "focusArea"));
    setCertification(val(profile?.certification, "certification"));
    setBio(val(profile?.bio, "bio"));
    setAvatarUrl(profile?.avatar_url || localStorage.getItem(`panenku_avatar_${user.id}`) || "");

    let isKtpVerifiedFromDbAddress = false;
    if (profile?.address && profile.address.trim().startsWith("{")) {
      try {
        const parsed = JSON.parse(profile.address);
        isKtpVerifiedFromDbAddress = !!parsed.is_verified || (parsed.ktp_number && String(parsed.ktp_number).length === 16);
      } catch (e) {}
    }

    const hasKtpDb = (profile?.ktp_number && profile.ktp_number !== "-") || isKtpVerifiedFromDbAddress;
    const hasKtpLs = lsBio.ktpNumber && String(lsBio.ktpNumber).length === 16;
    const verifiedFlag = localStorage.getItem(`panenku_farmer_verified_${user.id}`);
    setIsVerified(!!hasKtpDb || !!hasKtpLs || verifiedFlag === "true");
  }, [user, profile]);

  const reviews = [
    {
      id: 1,
      author: "Hendra Wijaya",
      role: "Pembeli Hasil Panen",
      rating: 5,
      date: "28 Juni 2026",
      comment: "Kualitas beras pandan wangi sangat memuaskan, wangi alami dan bulirnya pulen. Pengiriman pre-order selalu tepat waktu sesuai estimasi panen.",
      likes: 12
    },
    {
      id: 2,
      author: "Siti Rahma",
      role: "Petani Pemula (Mentee)",
      rating: 5,
      date: "24 Juni 2026",
      comment: "Sesi konsultasi dengan Pak Sugeng sangat informatif. Saya dibimbing step-by-step dari persiapan tanah lempung hingga pembuatan pupuk organik dari jerami padi.",
      likes: 8
    },
    {
      id: 3,
      author: "Dian Pratama",
      role: "Pembeli Limbah Sekam",
      rating: 4,
      date: "19 Juni 2026",
      comment: "Membeli sekam mentah untuk media tanam hias. Kering, bersih, dan harganya sangat bersahabat. Recommended seller untuk limbah organik!",
      likes: 5
    }
  ];

  return (
    <FarmerLayout title="Profil Penjual & Ulasan">
      <div className="space-y-8 relative">
        {/* Decorative backdrop blobs */}
        <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{ backgroundImage: "radial-gradient(#1a2b1b 1.5px, transparent 1.5px)", backgroundSize: "28px 28px" }} />
        <div className="absolute top-[10%] right-[-10%] w-[30vw] h-[30vw] rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[20%] left-[-10%] w-[35vw] h-[35vw] rounded-full bg-[#b4f05a]/5 blur-[100px] pointer-events-none" />
          
        {/* Cover Photo and Centered Main Info Header card */}
        <div className="bg-white border border-border/40 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-soft transition-all duration-300">
          <div 
            className="h-44 sm:h-60 relative flex items-center justify-center overflow-hidden bg-cover bg-center"
            style={{ backgroundImage: `url(${farmingBg})` }}
          >
            <div className="absolute inset-0 bg-emerald-900/75 mix-blend-multiply" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
          </div>
          
          <div className="p-6 sm:p-10 -mt-24 sm:-mt-32 relative flex flex-col items-center text-center">
            <div className="relative group mb-6">
              <div className="absolute -inset-1.5 rounded-[3rem] bg-gradient-to-r from-emerald-400 to-[#b4f05a] opacity-75 blur-md group-hover:opacity-100 transition duration-300" />
              <div className="relative h-40 w-40 sm:h-48 sm:w-48 rounded-[2.8rem] border-[6px] border-white object-cover bg-secondary overflow-hidden flex items-center justify-center text-foreground font-black text-5xl shadow-md">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
                ) : (
                  <span>{name.charAt(0).toUpperCase() || "P"}</span>
                )}
              </div>
            </div>
            
            <div className="space-y-3 max-w-2xl">
              <h2 className="font-['Plus_Jakarta_Sans',sans-serif] text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight">{name}</h2>
              
              <div className="flex items-center justify-center pt-0.5">
                {isVerified ? (
                  <Badge className="bg-primary/10 hover:bg-primary/20 text-emerald-800 border-primary/20 gap-1.5 rounded-full px-3.5 py-1 font-extrabold text-[10px] uppercase tracking-wider">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Mitra Terverifikasi
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-red-500/10 text-red-800 border-red-500/20 gap-1.5 rounded-full px-3.5 py-1 font-extrabold text-[10px] uppercase tracking-wider">
                    🔒 Verifikasi Diperlukan
                  </Badge>
                )}
              </div>
              <div className="text-sm font-bold text-primary flex items-center justify-center gap-1">
                <Sprout className="h-4 w-4" /> {focusArea}
              </div>
              
              <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-muted-foreground pt-1">
                <span className="flex items-center gap-1.5"><MapPin className="h-4.5 w-4.5 text-emerald-600" /> {location}</span>
                <span className="flex items-center gap-1.5">
                  <Star className="h-4.5 w-4.5 fill-honey text-honey" /> 
                  <span className="font-extrabold text-foreground">4.9</span> (36 Ulasan)
                </span>
                <span className="flex items-center gap-1.5"><BadgeCheck className="h-4.5 w-4.5 text-emerald-600" /> {experience} Pengalaman</span>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button 
                onClick={() => navigate({ to: "/farmer/profile-edit" })}
                className="rounded-full px-8 py-6 font-bold shadow-soft hover:scale-[1.02] transition gap-2"
                variant="outline"
              >
                Edit Profil Penjual
              </Button>
              {!isVerified && (
                <Button 
                  onClick={() => navigate({ to: "/farmer/verify" })}
                  className="rounded-full px-8 py-6 font-bold shadow-soft hover:scale-[1.02] transition gap-2 bg-red-600 hover:bg-red-700 text-white"
                >
                  🔒 Verifikasi KTP Sekarang
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Verification Warning Banner */}
        {!isVerified && (
          <div className="bg-red-500/5 border border-red-500/20 rounded-[2rem] p-6 text-left flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-bold text-red-800 text-sm flex items-center gap-2">
                <span>⚠️ Verifikasi Akun Penjual Tertunda</span>
              </h3>
              <p className="text-xs text-red-800/80 font-light leading-relaxed">
                Untuk dapat mulai mendaftarkan produk hasil tani atau limbah pertanian di marketplace, silakan selesaikan verifikasi KTP Anda di halaman verifikasi.
              </p>
            </div>
            <Button 
              onClick={() => navigate({ to: "/farmer/verify" })}
              className="rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-6 py-2 shadow-sm shrink-0"
            >
              Lengkapi KTP Sekarang
            </Button>
          </div>
        )}

        <div className="space-y-8">
          {/* Main profile content */}
          <div className="space-y-8">
            <div className="bg-white border border-emerald-800/30 rounded-[2rem] p-6 sm:p-8 shadow-md hover:shadow-lg transition-all duration-300 space-y-6 text-left relative overflow-hidden bg-gradient-to-br from-white to-emerald-500/[0.015]">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-[#b4f05a]" />
              <div>
                <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-xl text-foreground mb-3 border-l-4 border-primary pl-3">Tentang Petani</h3>
                <p className="text-sm font-light leading-relaxed text-muted-foreground">{bio}</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-border/30">
                <ProfileField icon={Sprout} label="Fokus Pertanian" value={focusArea} />
                <ProfileField icon={Calendar} label="Pengalaman Bertani" value={experience} />
                <ProfileField icon={Award} label="Sertifikasi" value={certification} />
                <ProfileField icon={Leaf} label="Nomor WhatsApp" value={phone || "Belum diatur"} />
              </div>
            </div>

            {/* Review and Rating Section */}
            <div className="bg-white border border-border/40 rounded-[2rem] p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-5">
                <div>
                  <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-xl text-foreground">Sistem Rating & Ulasan</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Ulasan otentik dari sesi konsultasi dan transaksi pasar</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-2xl font-black text-foreground">4.9 / 5.0</div>
                    <div className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 rounded-full px-2 py-0.5">98% Kepuasan</div>
                  </div>
                  <div className="flex text-honey text-lg">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="h-5 w-5 fill-current" />
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r.id} className="border border-border/40 rounded-2xl p-5 sm:p-6 hover:border-primary/20 hover:bg-secondary/10 transition duration-300 text-left">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center font-bold text-sm">
                          {r.author[0]}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-foreground">{r.author}</div>
                          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{r.role}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex text-honey">
                          {Array.from({ length: r.rating }).map((_, i) => (
                            <Star key={i} className="h-3.5 w-3.5 fill-current" />
                          ))}
                          {Array.from({ length: 5 - r.rating }).map((_, i) => (
                            <StarOff key={i} className="h-3.5 w-3.5 text-muted-foreground/30" />
                          ))}
                        </div>
                        <span className="text-[10px] text-muted-foreground font-medium">{r.date}</span>
                      </div>
                    </div>
                    <p className="text-sm font-light text-muted-foreground leading-relaxed">{r.comment}</p>
                    
                    <div className="flex items-center gap-2 mt-4 text-xs font-semibold text-emerald-700 bg-emerald-500/5 hover:bg-emerald-500/10 transition cursor-pointer w-fit px-3 py-1 rounded-full">
                      <Heart className="h-3.5 w-3.5 fill-current animate-pulse" /> Bermanfaat ({r.likes})
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </FarmerLayout>
  );
}

function ProfileField({ icon: Icon, label, value }: any) {
  return (
    <div className="rounded-2xl bg-white border border-emerald-800/10 p-4 flex items-center gap-3.5 hover:border-emerald-600/35 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 shadow-sm">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-800 shadow-inner">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest leading-none mb-1">{label}</div>
        <div className="font-extrabold text-sm text-foreground leading-normal">{value}</div>
      </div>
    </div>
  );
}
