import { createFileRoute } from "@tanstack/react-router";
import { FarmerLayout } from "@/components/layout/FarmerLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileSignature, Download, Shield, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/farmer/contracts")({
  head: () => ({ meta: [{ title: "Kontrak Digital — PANENKU" }] }),
  component: Contracts,
});

function Contracts() {
  return (
    <FarmerLayout title="Kontrak Digital">
      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/60">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl gradient-leaf text-white shadow-soft"><FileSignature className="h-6 w-6" /></div>
              <div>
                <h2 className="font-display font-bold text-xl">Kontrak Pre-Order #KTR-2406</h2>
                <p className="text-xs text-muted-foreground">PANENKU Smart Contract · Diterbitkan 28 Juni 2026</p>
              </div>
            </div>
            <Button variant="outline" className="rounded-full gap-2"><Download className="h-4 w-4" /> Unduh PDF</Button>
          </div>

          <Section title="Informasi Pembeli">
            <Grid>
              <Field label="Nama" value="PT Sumber Tani Sejahtera" />
              <Field label="No. HP" value="0812-3456-7890" />
              <Field label="NPWP" value="01.234.567.8-901.000" />
              <Field label="Alamat" value="Jl. Industri No. 12, Bekasi" />
            </Grid>
          </Section>

          <Section title="Informasi Produk">
            <Grid>
              <Field label="Produk" value="Beras Pandan Wangi Premium" />
              <Field label="Kuantitas" value="200 kg" />
              <Field label="Grade" value="Premium A" />
              <Field label="Metode" value="Organik (Bersertifikat)" />
            </Grid>
          </Section>

          <Section title="Kesepakatan Harga & Pengiriman">
            <Grid>
              <Field label="Harga per kg" value="Rp 14.500" />
              <Field label="Total" value="Rp 2.900.000" highlight />
              <Field label="DP (30%)" value="Rp 870.000" />
              <Field label="Tanggal Pengiriman" value="15 Juli 2026" />
            </Grid>
          </Section>

          <Section title="Syarat & Ketentuan">
            <Textarea rows={4} className="rounded-xl" defaultValue="1. Pembeli wajib membayar DP 30% setelah kontrak ditandatangani.&#10;2. Sisa pembayaran dilakukan saat penerimaan produk.&#10;3. Petani menjamin kualitas grade Premium A sesuai standar.&#10;4. Sengketa diselesaikan melalui mediasi PANENKU." />
          </Section>

          <Section title="Tanda Tangan Digital">
            <div className="grid sm:grid-cols-2 gap-4">
              <SignBox name="Pak Sugeng" role="Petani" signed />
              <SignBox name="PT Sumber Tani" role="Pembeli" />
            </div>
          </Section>
        </div>

        <div className="lg:sticky lg:top-24 h-fit space-y-4">
          <div className="glass-card rounded-2xl p-5">
            <Shield className="h-6 w-6 text-primary mb-2" />
            <h3 className="font-display font-bold mb-1">Kontrak Terenkripsi</h3>
            <p className="text-xs text-muted-foreground">Disimpan di blockchain & berkekuatan hukum. Aman dari perubahan sepihak.</p>
          </div>
          <div className="glass-card rounded-2xl p-5 space-y-2">
            <h3 className="font-display font-bold text-sm mb-2">Riwayat Kontrak</h3>
            {["KTR-2406 · Aktif", "KTR-2403 · Selesai", "KTR-2398 · Selesai"].map((c) => (
              <div key={c} className="rounded-xl bg-secondary/40 p-2.5 text-xs flex items-center justify-between">
                <span>{c}</span>
                <Download className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </FarmerLayout>
  );
}

function Section({ title, children }: any) { return <div className="mb-6"><Label className="mb-2 block font-display font-bold">{title}</Label>{children}</div>; }
function Grid({ children }: any) { return <div className="grid sm:grid-cols-2 gap-3">{children}</div>; }
function Field({ label, value, highlight }: any) {
  return (
    <div className="rounded-xl bg-secondary/40 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`font-semibold ${highlight ? "text-primary font-display text-lg" : ""}`}>{value}</div>
    </div>
  );
}
function SignBox({ name, role, signed }: any) {
  return (
    <div className={`rounded-2xl border-2 p-4 ${signed ? "border-primary bg-primary/5" : "border-dashed border-border"}`}>
      <div className="h-16 grid place-items-center">
        {signed ? <CheckCircle2 className="h-8 w-8 text-primary" /> : <span className="text-xs text-muted-foreground">Menunggu tanda tangan</span>}
      </div>
      <div className="border-t border-border/60 pt-2 mt-2 text-center">
        <div className="font-medium text-sm">{name}</div>
        <div className="text-xs text-muted-foreground">{role}</div>
      </div>
    </div>
  );
}
