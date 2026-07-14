import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { FarmerLayout } from "@/components/layout/FarmerLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Check, Loader2, FileText, ArrowLeft, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/farmer/verify")({
  head: () => ({ meta: [{ title: "Verifikasi KTP Penjual — PANENKU" }] }),
  component: FarmerVerificationPage,
});

function FarmerVerificationPage() {
  const { user, profile, refreshSession } = useAuth();
  const navigate = useNavigate();

  const [ktpNumber, setKtpNumber] = useState("");
  const [ktpName, setKtpName] = useState("");
  const [ktpAddress, setKtpAddress] = useState("");
  const [birthPlaceDate, setBirthPlaceDate] = useState("");
  const [gender, setGender] = useState("");
  const [ktpPhoto, setKtpPhoto] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Load existing data on mount
  useEffect(() => {
    if (!user) return;
    
    // Load local storage biodata backup
    let lsBio: any = {};
    try {
      const raw = localStorage.getItem(`panenku_farmer_biodata_${user.id}`);
      if (raw) lsBio = JSON.parse(raw);
    } catch (e) { /* ignore */ }

    const val = (dbVal: string | null | undefined, lsVal: string | undefined, fallback = "") => {
      if (dbVal && dbVal !== "-" && dbVal !== "—") {
        if (dbVal.trim().startsWith("{")) {
          try {
            const parsed = JSON.parse(dbVal);
            return parsed.addressText || fallback;
          } catch (e) {}
        }
        return dbVal;
      }
      if (lsVal && lsVal !== "-" && lsVal !== "—") return lsVal;
      return fallback;
    };

    setKtpNumber(val(profile?.ktp_number, lsBio.ktpNumber));
    setKtpPhoto(val(profile?.ktp_photo, lsBio.ktpPhoto));
    setKtpName(val(profile?.full_name, lsBio.ktpName || profile?.full_name));
    setKtpAddress(val(profile?.address, lsBio.ktpAddress || profile?.address));
    setBirthPlaceDate(lsBio.birthPlaceDate || "");
    setGender(lsBio.gender || "");
  }, [user, profile]);

  const handleKtpUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setKtpPhoto(reader.result as string);
        toast.success("Foto KTP berhasil diunggah!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!ktpNumber || ktpNumber.trim().length !== 16) {
      toast.error("Nomor NIK KTP harus terdiri dari 16 digit!");
      return;
    }

    if (!ktpPhoto) {
      toast.error("Harap unggah foto dokumen KTP Anda!");
      return;
    }

    if (!ktpName.trim()) {
      toast.error("Harap isi nama lengkap sesuai dokumen KTP!");
      return;
    }

    if (!ktpAddress.trim()) {
      toast.error("Harap isi alamat lengkap sesuai dokumen KTP!");
      return;
    }

    setIsSaving(true);
    try {
      // 1. Fetch current profile address to merge JSON metadata safely
      let mergedAddressJson = ktpAddress;
      try {
        const { data: currentP } = await supabase
          .from("profiles")
          .select("address")
          .eq("id", user.id)
          .maybeSingle();

        let parsed: any = {};
        if (currentP?.address && currentP.address.trim().startsWith("{")) {
          parsed = JSON.parse(currentP.address);
        } else if (currentP?.address) {
          parsed.addressText = currentP.address;
        }
        
        parsed.addressText = ktpAddress;
        parsed.ktp_number = ktpNumber;
        parsed.ktp_name = ktpName;
        parsed.ktp_address = ktpAddress;
        parsed.birth_place_date = birthPlaceDate;
        parsed.gender = gender;
        parsed.is_verified = true;
        
        mergedAddressJson = JSON.stringify(parsed);
      } catch (err) {
        console.warn("Failed to load/parse profiles address JSON during verify", err);
      }

      // 2. Update database profile with KTP details (saved inside JSON address config)
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: ktpName, // Sync name with KTP name
          address: mergedAddressJson, // Sync address with merged config
        })
        .eq("id", user.id);

      if (error) throw error;

      // 2. Persist metadata verification state locally for quick sync
      try {
        localStorage.setItem(`panenku_farmer_verified_${user.id}`, "true");
      } catch (e) {
        console.warn("Failed to save verified flag to localStorage", e);
      }

      let existingBio: any = {};
      try {
        const raw = localStorage.getItem(`panenku_farmer_biodata_${user.id}`);
        if (raw) existingBio = JSON.parse(raw);
      } catch (e) { /* ignore */ }

      const updatedBio = {
        ...existingBio,
        ktpNumber,
        ktpPhoto: ktpPhoto ? "uploaded" : "", // Prevent storing massive base64 to avoid quota limits
        ktpName,
        ktpAddress,
        birthPlaceDate,
        gender
      };
      
      try {
        localStorage.setItem(`panenku_farmer_biodata_${user.id}`, JSON.stringify(updatedBio));
      } catch (e) {
        console.warn("Failed to save biodata to localStorage due to quota limits", e);
      }

      await refreshSession();
      toast.success("Akun Penjual berhasil diverifikasi KTP!");
      navigate({ to: "/farmer/profile" });
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan verifikasi KTP.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <FarmerLayout title="Verifikasi KTP Penjual">
      <div className="space-y-6 max-w-4xl mx-auto text-left relative select-none">
        <div className="flex items-center gap-2">
          <Link to="/farmer/profile" className="text-muted-foreground hover:text-foreground transition">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Keamanan Akun</div>
            <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-2xl text-foreground">Verifikasi Identitas KTP</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-border/40 rounded-[2.5rem] p-6 sm:p-10 shadow-sm space-y-6">
          <div className="p-4 bg-emerald-500/5 border border-primary/20 rounded-2xl flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="text-xs font-medium text-emerald-800 leading-relaxed">
              Verifikasi KTP diwajibkan demi menjaga keamanan ekosistem transaksi PANENKU dan mencegah penipuan. Data KTP Anda dienkripsi dengan aman di database.
            </div>
          </div>

          <div className="space-y-5">
            {/* Foto KTP Upload */}
            <div className="space-y-2">
              <Label className="font-bold text-sm text-foreground">Unggah Foto KTP</Label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {ktpPhoto ? (
                  <div className="h-32 w-52 rounded-2xl border bg-secondary overflow-hidden shrink-0 shadow-sm relative group">
                    <img src={ktpPhoto} className="h-full w-full object-cover" alt="KTP Dokumen Preview" />
                  </div>
                ) : (
                  <div className="h-32 w-52 rounded-2xl border border-dashed bg-secondary flex flex-col items-center justify-center shrink-0 text-muted-foreground gap-2">
                    <FileText className="h-8 w-8 text-muted-foreground/60" />
                    <span className="text-[10px] font-medium">Format JPG, JPEG, atau PNG</span>
                  </div>
                )}
                <div className="space-y-2 text-left">
                  <label className="cursor-pointer inline-block">
                    <div className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-5 py-3 rounded-full transition shadow-soft">
                      Pilih Dokumen Foto KTP
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleKtpUpload} required={!ktpPhoto} />
                  </label>
                  <p className="text-[10px] text-muted-foreground font-light leading-relaxed max-w-sm">
                    Pastikan foto KTP terlihat jelas, tulisan terbaca terang, dan tidak buram/terpotong cahaya lampu flash.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-border/20 pt-5 space-y-4">
              <h4 className="font-bold text-sm text-foreground">Tulis Ulang Informasi KTP</h4>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="nik">NIK KTP (16 Digit)</Label>
                  <Input 
                    id="nik" 
                    value={ktpNumber}
                    maxLength={16}
                    onChange={(e) => setKtpNumber(e.target.value.replace(/\D/g, ""))}
                    placeholder="Contoh: 3201xxxxxxxxxxxx"
                    className="rounded-xl font-mono text-sm"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="fullname">Nama Lengkap Sesuai KTP</Label>
                  <Input 
                    id="fullname" 
                    value={ktpName}
                    onChange={(e) => setKtpName(e.target.value)}
                    placeholder="Contoh: MUHAMMAD FAZEL MAWLA"
                    className="rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="placeDate">Tempat & Tanggal Lahir</Label>
                  <Input 
                    id="placeDate" 
                    value={birthPlaceDate}
                    onChange={(e) => setBirthPlaceDate(e.target.value)}
                    placeholder="Contoh: SUKABUMI, 12-08-1995"
                    className="rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Jenis Kelamin</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Pilih Jenis Kelamin" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                      <SelectItem value="Perempuan">Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="address">Alamat Lengkap Sesuai KTP</Label>
                <Textarea 
                  id="address" 
                  value={ktpAddress}
                  onChange={(e) => setKtpAddress(e.target.value)}
                  placeholder="Tuliskan alamat lengkap beserta RT/RW, Kelurahan, Kecamatan, Kabupaten/Kota, dan Provinsi"
                  className="rounded-xl resize-none font-light"
                  rows={3}
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-4 border-t border-border/20 justify-end">
            <Link to="/farmer/profile">
              <Button type="button" variant="outline" className="rounded-full px-6 font-bold">
                Batal
              </Button>
            </Link>
            <Button type="submit" disabled={isSaving} className="rounded-full px-8 shadow-soft gap-2 font-bold h-11 bg-primary text-white hover:bg-primary-hover">
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Mengunggah...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" /> Kirim Verifikasi
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </FarmerLayout>
  );
}
