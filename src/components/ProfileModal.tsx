import { useState, useEffect } from "react";
import { User, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useRouter } from "@tanstack/react-router";

interface ProfileModalProps {
  user: { id?: string; email?: string; name?: string } | null;
  onClose: () => void;
}

export function ProfileModal({ user, onClose }: ProfileModalProps) {
  const router = useRouter();
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileOldPassword, setProfileOldPassword] = useState("");
  const [profilePassword, setProfilePassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  useEffect(() => {
    if (user?.id) {
      setProfileEmail(user.email || "");
      setProfilePassword("");
      setProfileOldPassword("");
      const localAvatar = localStorage.getItem(`panenku_avatar_${user.id}`);
      setAvatarUrl(localAvatar || "");
      const fetchProfile = async () => {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id!)
            .maybeSingle();
          if (data && !error) {
            setProfileName(data.full_name || user.name || "");
            setProfilePhone(data.phone || "");
            setAvatarUrl(data.avatar_url || localStorage.getItem(`panenku_avatar_${user.id}`) || "");
          } else {
            setProfileName(user.name || "");
          }
        } catch {
          setProfileName(user.name || "");
        }
      };
      void fetchProfile();
    }
  }, [user]);


  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
        toast.success("Foto profil berhasil dipilih!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setIsSavingProfile(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: profileName, phone: profilePhone, avatar_url: avatarUrl })
        .eq("id", user.id);

      if (error) throw error;

      if (avatarUrl) {
        localStorage.setItem(`panenku_avatar_${user.id}`, avatarUrl);
      } else {
        localStorage.removeItem(`panenku_avatar_${user.id}`);
      }

      if (profilePassword || profileOldPassword) {
        if (!profileOldPassword) {
          toast.error("Harap masukkan kata sandi lama Anda!");
          setIsSavingProfile(false);
          return;
        }
        if (!profilePassword) {
          toast.error("Harap masukkan kata sandi baru Anda!");
          setIsSavingProfile(false);
          return;
        }
        if (profilePassword.trim().length < 6) {
          toast.error("Kata sandi baru minimal harus 6 karakter!");
          setIsSavingProfile(false);
          return;
        }
        const { error: pwdError } = await supabase.auth.updateUser({ password: profilePassword });
        if (pwdError) throw pwdError;
        toast.success("Kata sandi berhasil diperbarui!");
      }

      toast.success("Profil Anda berhasil diperbarui!");
      onClose();
      setTimeout(() => { router.invalidate(); }, 300);
    } catch (err: any) {
      toast.error(err.message || "Gagal memperbarui profil.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] w-full max-w-xl p-6 sm:p-8 space-y-6 shadow-2xl relative animate-in zoom-in duration-300 text-left border border-border/30">
        <div className="space-y-1">
          <h3 className="font-['Plus_Jakarta_Sans',sans-serif] text-xl font-black text-foreground">Edit Profil</h3>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 font-sans">
          {/* Foto Profil */}
          <div className="flex flex-col items-center justify-center gap-2 mb-2">
            <div className="relative group/avatar cursor-pointer">
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <label htmlFor="avatar-upload" className="cursor-pointer block relative">
                <div className="h-20 w-20 rounded-full border-2 border-primary/30 shadow-md bg-secondary overflow-hidden flex items-center justify-center text-foreground font-black text-xl select-none">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar Preview" className="h-full w-full object-cover" />
                  ) : (
                    <span>{initial}</span>
                  )}
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-all duration-200">
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">Ubah</span>
                </div>
              </label>
            </div>
            <span className="text-[10px] text-muted-foreground/85">Klik untuk mengganti foto profil</span>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="m-name" className="text-xs font-bold text-muted-foreground uppercase">Nama Lengkap</Label>
            <Input id="m-name" value={profileName} onChange={(e) => setProfileName(e.target.value)} placeholder="Nama lengkap Anda" className="rounded-xl border-border/50 text-xs h-10" required />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="m-email" className="text-xs font-bold text-muted-foreground uppercase">Email Akun (Tidak dapat diubah)</Label>
            <Input id="m-email" value={profileEmail} disabled className="rounded-xl bg-secondary/50 text-muted-foreground border-border/30 text-xs h-10 cursor-not-allowed" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="m-phone" className="text-xs font-bold text-muted-foreground uppercase">Nomor WhatsApp / Telp</Label>
            <Input id="m-phone" value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} placeholder="e.g. 08123456789" className="rounded-xl border-border/50 text-xs h-10" required />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="m-old-pwd" className="text-xs font-bold text-muted-foreground uppercase">Kata Sandi Lama</Label>
            <Input id="m-old-pwd" type="password" value={profileOldPassword} onChange={(e) => setProfileOldPassword(e.target.value)} placeholder="Masukkan kata sandi saat ini" className="rounded-xl border-border/50 text-xs h-10" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="m-pwd" className="text-xs font-bold text-muted-foreground uppercase">Kata Sandi Baru</Label>
            <Input id="m-pwd" type="password" value={profilePassword} onChange={(e) => setProfilePassword(e.target.value)} placeholder="Masukkan kata sandi baru Anda" className="rounded-xl border-border/50 text-xs h-10" />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-full flex-1">Batal</Button>
            <Button type="submit" disabled={isSavingProfile} className="rounded-full flex-1 font-bold shadow-soft">
              {isSavingProfile ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
