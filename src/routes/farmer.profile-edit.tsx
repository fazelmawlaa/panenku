import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FarmerLayout } from "@/components/layout/FarmerLayout";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Check, Camera, User, FileText, ArrowLeft, Loader2, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/farmer/profile-edit")({
  head: () => ({ meta: [{ title: "Sunting Profil Penjual — RumohTani" }] }),
  component: EditProfilePage,
});

function EditProfilePage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  // Editable fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  
  // Custom Farmer Biodata fields
  const [experience, setExperience] = useState("15 Tahun");
  const [certification, setCertification] = useState("Sertifikasi Organik SNI (No: 893/SNI/2024)");
  const [bio, setBio] = useState(
    "Petani padi senior dengan 15 tahun pengalaman bertani di Sukabumi & Cianjur. Fokus pada ekosistem pertanian sirkular bebas limbah."
  );
  const [focusArea, setFocusArea] = useState("Pertanian Organik & Sirkular");
  
  const [isSaving, setIsSaving] = useState(false);

  // Load profile data on mount or changes
  useEffect(() => {
    if (!user) return;

    // Load localStorage biodata as fallback
    let lsBio: any = {};
    try {
      const raw = localStorage.getItem(`panenku_farmer_biodata_${user.id}`);
      if (raw) lsBio = JSON.parse(raw);
    } catch (e) { /* ignore */ }

    const val = (dbVal: string | null | undefined, lsKey: string, fallback = "") => {
      if (dbVal && dbVal !== "-" && dbVal !== "—") return dbVal;
      if (lsBio[lsKey] && lsBio[lsKey] !== "-" && lsBio[lsKey] !== "—") return lsBio[lsKey];
      return fallback;
    };

    setName(profile?.full_name || user.email?.split("@")[0] || "Penjual Mitra");
    setPhone(val(profile?.phone, "phone"));
    setLocation(val(profile?.address, "location"));
    setAvatarUrl(profile?.avatar_url || localStorage.getItem(`panenku_avatar_${user.id}`) || "");
    setExperience(val(profile?.experience, "experience"));
    setCertification(val(profile?.certification, "certification"));
    setBio(val(profile?.bio, "bio"));
    setFocusArea(val(profile?.focus_area, "focusArea"));
  }, [user, profile]);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
        toast.success("Foto profil terpilih!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      // 1. Update Supabase profile table with all profile fields
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: name,
          phone: phone,
          address: location,
          experience: experience,
          focus_area: focusArea,
          certification: certification,
          bio: bio,
          avatar_url: avatarUrl
        })
        .eq("id", user.id);

      if (error) {
        // If columns don't exist in cache yet, fallback to standard profile save
        if (error.message.includes("column") || error.message.includes("cache") || error.message.includes("avatar_url")) {
          const { error: fallbackError } = await supabase
            .from("profiles")
            .update({
              full_name: name,
              phone: phone,
              address: location
            })
            .eq("id", user.id);
          
          if (fallbackError) throw fallbackError;
        } else {
          throw error;
        }
      }

      // 2. Fallback backup to local storage
      try {
        if (avatarUrl) {
          // If avatar is small or fits, store it; otherwise handled gracefully by try-catch
          localStorage.setItem(`panenku_avatar_${user.id}`, avatarUrl);
        } else {
          localStorage.removeItem(`panenku_avatar_${user.id}`);
        }
      } catch (e) {
        console.warn("Failed to save avatar to localStorage due to quota limits", e);
      }

      // Load existing biodata first to preserve NIK/KTP
      let lsBio: any = {};
      try {
        const raw = localStorage.getItem(`panenku_farmer_biodata_${user.id}`);
        if (raw) lsBio = JSON.parse(raw);
      } catch (e) { /* ignore */ }

      const biodata = {
        ...lsBio,
        phone,
        location,
        experience,
        certification,
        bio,
        focusArea
      };

      try {
        localStorage.setItem(`panenku_farmer_biodata_${user.id}`, JSON.stringify(biodata));
      } catch (e) {
        console.warn("Failed to save biodata to localStorage due to quota limits", e);
      }

      toast.success("Profil Penjual berhasil diperbarui!");
      navigate({ to: "/farmer/profile" });
    } catch (err: any) {
      toast.error(err.message || "Gagal memperbarui profil.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <FarmerLayout title="Sunting Profil Penjual">
      <div className="space-y-6 max-w-4xl mx-auto text-left relative">
        <div className="flex items-center gap-2">
          <Link to="/farmer/profile">
            <Button variant="ghost" size="sm" className="gap-1 rounded-full text-xs">
              <ArrowLeft className="h-4 w-4" /> Kembali ke Profil
            </Button>
          </Link>
        </div>

        <form onSubmit={handleSave} className="bg-white border border-border/40 rounded-[2rem] p-6 sm:p-10 shadow-sm space-y-8">
          <div>
            <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-2xl text-foreground tracking-tight">Sunting Profil Penjual</h3>
            <p className="text-sm font-light text-muted-foreground mt-1">Lengkapi biodata dan informasi KTP Anda secara akurat untuk memverifikasi toko Anda.</p>
          </div>

          {/* Centered and Enlarged Profil Photo edit uploader */}
          <div className="space-y-4 pb-6 border-b border-border/25 flex flex-col items-center text-center">
            <Label className="block font-bold text-foreground text-sm uppercase tracking-wider">Foto Profil Penjual</Label>
            <div className="relative group">
              <div className="absolute -inset-1.5 rounded-[3rem] bg-gradient-to-r from-emerald-400 to-[#b4f05a] opacity-75 blur-md group-hover:opacity-100 transition duration-300" />
              <div className="relative h-36 w-36 sm:h-44 sm:w-44 rounded-[2.8rem] border-[6px] border-white object-cover bg-secondary overflow-hidden flex items-center justify-center text-foreground font-black text-5xl shadow-md">
                {avatarUrl ? (
                  <img src={avatarUrl} className="h-full w-full object-cover" alt="Preview" />
                ) : (
                  <User className="h-12 w-12 text-muted-foreground" />
                )}
              </div>
            </div>
            <div className="space-y-1.5 flex flex-col items-center">
              <label className="cursor-pointer inline-block">
                <div className="bg-secondary hover:bg-secondary/80 text-foreground text-xs font-semibold px-4 py-2.5 rounded-full flex items-center gap-1.5 transition border border-border/50 shadow-sm">
                  <Camera className="h-4 w-4 text-primary" /> Pilih Foto Baru
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </label>
              <p className="text-[10px] text-muted-foreground">Format JPG, PNG atau WEBP. Maksimal 2MB.</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Nomor WhatsApp / HP</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Contoh: 0812345678" className="rounded-xl" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="location">Lokasi / Wilayah</Label>
              <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} className="rounded-xl" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="experience">Lama Pengalaman</Label>
              <Input id="experience" value={experience} onChange={(e) => setExperience(e.target.value)} className="rounded-xl" required />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="focusArea">Fokus Bidang Pertanian</Label>
              <Input 
                id="focusArea" 
                value={focusArea} 
                onChange={(e) => setFocusArea(e.target.value)} 
                placeholder="Contoh: Pertanian Organik, Hidroponik Sayuran, Padi & Palawija" 
                className="rounded-xl" 
                required 
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="certification">Sertifikasi & Penghargaan</Label>
            <Input id="certification" value={certification} onChange={(e) => setCertification(e.target.value)} className="rounded-xl" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bio">Biografi Singkat</Label>
            <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className="rounded-xl font-light" required />
          </div>

          <div className="flex flex-wrap gap-3 pt-4 border-t border-border/20 justify-end">
            <Link to="/farmer/profile">
              <Button type="button" variant="outline" className="rounded-full px-6 font-bold">
                Batal
              </Button>
            </Link>
            <Button type="submit" disabled={isSaving} className="rounded-full px-8 shadow-soft gap-2 font-bold h-11">
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Menyimpan...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" /> Simpan Perubahan
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </FarmerLayout>
  );
}
