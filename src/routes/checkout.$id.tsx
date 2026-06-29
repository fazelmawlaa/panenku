import { createFileRoute, notFound, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { products, formatRupiah, shippingMethods } from "@/lib/mock-data";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  ArrowLeft, ArrowRight, CreditCard, Wallet, Building2, MapPin, ShoppingBag,
  Truck, Check, Package, ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout/$id")({
  loader: ({ params }) => {
    const p = products.find((x) => x.id === params.id);
    if (!p) throw notFound();
    return p;
  },
  head: () => ({ meta: [{ title: "Checkout — PANENKU" }] }),
  component: Checkout,
});

type Step = 1 | 2 | 3;

const steps = [
  { n: 1 as const, label: "Alamat", icon: MapPin },
  { n: 2 as const, label: "Pengiriman", icon: Truck },
  { n: 3 as const, label: "Pembayaran", icon: CreditCard },
];

const payments = [
  { v: "ewallet", icon: Wallet, t: "E-Wallet", d: "GoPay, OVO, DANA, ShopeePay" },
  { v: "va", icon: Building2, t: "Virtual Account", d: "BCA, BNI, BRI, Mandiri" },
  { v: "card", icon: CreditCard, t: "Kartu Kredit/Debit", d: "Visa, Mastercard, JCB" },
  { v: "cod", icon: Package, t: "Bayar di Tempat (COD)", d: "Khusus area Jabodetabek" },
];

function Checkout() {
  const p = Route.useLoaderData();
  const navigate = useNavigate();
  const { profile, user, session, loading } = useAuth();

  const [step, setStep] = useState<Step>(1);
  const [qty, setQty] = useState(2);

  // address
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [addr, setAddr] = useState("");
  const [city, setCity] = useState("");
  const [postal, setPostal] = useState("");
  const [notes, setNotes] = useState("");

  // shipping & payment
  const [shipId, setShipId] = useState<string>("regular");
  const [pay, setPay] = useState("ewallet");

  useEffect(() => {
    if (!loading && !session) {
      toast.info("Silakan masuk untuk melanjutkan checkout");
      navigate({ to: "/auth", replace: true });
    }
  }, [loading, session, navigate]);

  useEffect(() => {
    if (profile?.full_name && !name) setName(profile.full_name);
    if (profile?.phone && !phone) setPhone(profile.phone);
    if (profile?.address && !addr) setAddr(profile.address);
  }, [profile]); // eslint-disable-line

  const ship = shippingMethods.find((s) => s.id === shipId) ?? shippingMethods[0];
  const subtotal = p.price * qty;
  const total = subtotal + ship.price;

  function validateStep1() {
    if (!name.trim() || !phone.trim() || !addr.trim() || !city.trim() || !postal.trim()) {
      toast.error("Mohon lengkapi alamat pengiriman");
      return false;
    }
    return true;
  }

  function next() {
    if (step === 1 && !validateStep1()) return;
    setStep((s) => (s < 3 ? ((s + 1) as Step) : s));
  }

  function placeOrder() {
    const orderId = "ORD-" + Math.floor(2500 + Math.random() * 999);
    toast.success(`Pesanan ${orderId} berhasil dibuat!`);
    navigate({ to: "/orders/$orderId", params: { orderId } });
  }

  return (
    <CustomerLayout>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        <Link to="/products/$id" params={{ id: p.id }} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Kembali
        </Link>
        <h1 className="font-display text-3xl font-bold mb-6">Checkout</h1>

        {/* Stepper */}
        <div className="glass-card rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between gap-2">
            {steps.map((s, i) => {
              const Icon = s.icon;
              const done = step > s.n;
              const active = step === s.n;
              return (
                <div key={s.n} className="flex items-center flex-1 last:flex-none">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`grid h-9 w-9 place-items-center rounded-full shrink-0 transition ${
                      done ? "bg-primary text-primary-foreground" :
                      active ? "bg-primary/15 text-primary ring-2 ring-primary" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                    </div>
                    <div className="hidden sm:block">
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Langkah {s.n}</div>
                      <div className={`text-sm font-semibold ${active || done ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</div>
                    </div>
                  </div>
                  {i < steps.length - 1 && <div className={`flex-1 mx-3 h-0.5 rounded-full ${step > s.n ? "bg-primary" : "bg-muted"}`} />}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-6">
          <div className="space-y-5">
            {step === 1 && (
              <div className="glass-card rounded-2xl p-5 sm:p-6">
                <div className="flex items-center gap-2 font-display font-bold text-lg mb-1"><MapPin className="h-5 w-5 text-primary" /> Alamat Pengiriman</div>
                <p className="text-sm text-muted-foreground mb-5">Pastikan alamat lengkap agar paket tidak salah kirim.</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-1.5 block">Nama Penerima *</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama lengkap" className="rounded-xl" />
                  </div>
                  <div>
                    <Label className="mb-1.5 block">No. HP *</Label>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08xxxxxxxxxx" className="rounded-xl" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="mb-1.5 block">Alamat Lengkap *</Label>
                    <Textarea value={addr} onChange={(e) => setAddr(e.target.value)} placeholder="Jalan, no. rumah, RT/RW, kelurahan, kecamatan" className="rounded-xl" rows={3} />
                  </div>
                  <div>
                    <Label className="mb-1.5 block">Kota/Kabupaten *</Label>
                    <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Jakarta Pusat" className="rounded-xl" />
                  </div>
                  <div>
                    <Label className="mb-1.5 block">Kode Pos *</Label>
                    <Input value={postal} onChange={(e) => setPostal(e.target.value)} placeholder="10220" className="rounded-xl" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="mb-1.5 block">Catatan untuk Kurir (opsional)</Label>
                    <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Contoh: titip ke security jika tidak ada di rumah" className="rounded-xl" rows={2} />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="glass-card rounded-2xl p-5 sm:p-6">
                <div className="flex items-center gap-2 font-display font-bold text-lg mb-1"><Truck className="h-5 w-5 text-primary" /> Metode Pengiriman</div>
                <p className="text-sm text-muted-foreground mb-5">Pilih layanan kurir sesuai kebutuhan Anda.</p>
                <RadioGroup value={shipId} onValueChange={setShipId} className="space-y-2.5">
                  {shippingMethods.map((m) => (
                    <label
                      key={m.id}
                      className={`flex items-center gap-4 rounded-2xl border p-4 cursor-pointer transition ${
                        shipId === m.id ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border hover:bg-muted/40"
                      }`}
                    >
                      <RadioGroupItem value={m.id} />
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary shrink-0">
                        <Truck className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold">{m.name}</span>
                          <span className="text-xs text-muted-foreground">· {m.courier}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">{m.desc}</div>
                        <div className="text-xs mt-1"><span className="text-primary font-medium">Estimasi {m.eta}</span></div>
                      </div>
                      <div className="font-display font-bold text-right shrink-0">{formatRupiah(m.price)}</div>
                    </label>
                  ))}
                </RadioGroup>
              </div>
            )}

            {step === 3 && (
              <div className="glass-card rounded-2xl p-5 sm:p-6">
                <div className="flex items-center gap-2 font-display font-bold text-lg mb-1"><CreditCard className="h-5 w-5 text-primary" /> Metode Pembayaran</div>
                <p className="text-sm text-muted-foreground mb-5">Pembayaran diamankan oleh sistem PANENKU.</p>
                <RadioGroup value={pay} onValueChange={setPay} className="space-y-2.5">
                  {payments.map((m) => {
                    const Icon = m.icon;
                    return (
                      <label
                        key={m.v}
                        className={`flex items-center gap-4 rounded-2xl border p-4 cursor-pointer transition ${
                          pay === m.v ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border hover:bg-muted/40"
                        }`}
                      >
                        <RadioGroupItem value={m.v} />
                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary shrink-0">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold">{m.t}</div>
                          <div className="text-xs text-muted-foreground">{m.d}</div>
                        </div>
                      </label>
                    );
                  })}
                </RadioGroup>
                <div className="mt-4 flex items-start gap-2 rounded-xl bg-leaf-soft/15 border border-primary/15 p-3 text-xs text-foreground/80">
                  <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>Dana Anda ditahan sistem PANENKU dan baru diteruskan ke petani setelah pesanan diterima dengan baik.</div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between gap-3">
              <Button
                variant="outline"
                className="rounded-full"
                disabled={step === 1}
                onClick={() => setStep((s) => (s > 1 ? ((s - 1) as Step) : s))}
              >
                <ArrowLeft className="h-4 w-4 mr-1" /> Kembali
              </Button>
              {step < 3 ? (
                <Button className="rounded-full gap-1" onClick={next}>
                  Lanjut <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button className="rounded-full gap-2 shadow-soft" size="lg" onClick={placeOrder}>
                  <ShoppingBag className="h-4 w-4" /> Bayar {formatRupiah(total)}
                </Button>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="glass-card rounded-2xl p-5 space-y-4">
              <h3 className="font-display font-bold">Ringkasan Pesanan</h3>

              <div className="flex items-center gap-3 pb-4 border-b border-border/60">
                <img src={p.image} className="h-16 w-16 rounded-xl object-cover" alt={p.name} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{formatRupiah(p.price)} / {p.unit}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">oleh {p.farmer}</div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="outline" size="icon" className="rounded-full h-7 w-7" onClick={() => setQty(Math.max(1, qty - 1))}>−</Button>
                  <span className="w-6 text-center text-sm font-semibold">{qty}</span>
                  <Button variant="outline" size="icon" className="rounded-full h-7 w-7" onClick={() => setQty(qty + 1)}>+</Button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal ({qty} {p.unit})</span><span>{formatRupiah(subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Ongkir ({ship.name})</span><span>{formatRupiah(ship.price)}</span></div>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Estimasi tiba</span><span className="text-primary font-medium">{ship.eta}</span></div>
              </div>

              <div className="border-t border-border pt-3 flex justify-between font-display text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">{formatRupiah(total)}</span>
              </div>

              {step >= 1 && name && (
                <div className="rounded-xl bg-muted/40 p-3 text-xs space-y-1">
                  <div className="font-semibold text-foreground">{name} · {phone}</div>
                  <div className="text-muted-foreground line-clamp-2">{addr}{city ? `, ${city}` : ""} {postal}</div>
                </div>
              )}
              <div className="text-[11px] text-muted-foreground text-center">
                Login sebagai <span className="font-medium text-foreground">{user?.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
