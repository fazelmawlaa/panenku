import { createFileRoute, Link } from "@tanstack/react-router";
import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { customerOrders, formatRupiah, trackingEvents } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, MapPin, Truck, Package, Phone, MessageSquare, Copy, ShieldCheck, Sprout,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/orders/$orderId")({
  head: ({ params }) => ({ meta: [{ title: `${params.orderId} — Pelacakan Pengiriman` }] }),
  component: OrderDetail,
});

function OrderDetail() {
  const { orderId } = Route.useParams();
  const mock = customerOrders[0];
  const order = {
    id: orderId,
    product: mock.product,
    qty: mock.qty,
    total: mock.total,
    date: mock.date,
    status: "Pengiriman",
    courier: "JNE REG",
    awb: "JN0024801XK",
    eta: "Rabu, 26 Jun 2026",
    address: {
      name: "Andi Pratama",
      phone: "0812-3456-7890",
      detail: "Jl. Sudirman No. 42, RT 03/RW 05, Kel. Karet Tengsin, Kec. Tanah Abang",
      city: "Jakarta Pusat",
      postal: "10220",
    },
    farmer: { name: "Pak Sugeng", farm: "Kebun Tani Subur", location: "Cianjur, Jawa Barat" },
  };

  const lastDoneIdx = trackingEvents.map((e) => e.done).lastIndexOf(true);

  function copyAwb() {
    navigator.clipboard.writeText(order.awb).then(() => toast.success("Resi disalin"));
  }

  return (
    <CustomerLayout>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
        <Link to="/orders" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Semua Pesanan
        </Link>

        {/* Header */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground">Pesanan</div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold">{order.id}</h1>
              <div className="text-sm text-muted-foreground mt-1">Dipesan {order.date}</div>
            </div>
            <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1.5 text-sm">
              <Truck className="h-3.5 w-3.5 mr-1" /> {order.status}
            </Badge>
          </div>

          <div className="mt-5 grid sm:grid-cols-3 gap-3 text-sm">
            <InfoTile icon={Package} label="Kurir" value={order.courier} />
            <InfoTile
              icon={Copy}
              label="Nomor Resi"
              value={order.awb}
              action={<button onClick={copyAwb} className="text-xs text-primary hover:underline">Salin</button>}
            />
            <InfoTile icon={Truck} label="Estimasi tiba" value={order.eta} highlight />
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-6">
          {/* Timeline */}
          <div className="glass-card rounded-2xl p-5 sm:p-6">
            <h2 className="font-display font-bold mb-1">Riwayat Pengiriman</h2>
            <p className="text-xs text-muted-foreground mb-5">Update real-time dari sistem & kurir.</p>

            <ol className="relative space-y-5">
              {trackingEvents.map((ev, i) => {
                const isCurrent = i === lastDoneIdx;
                return (
                  <li key={i} className="relative pl-9">
                    {i < trackingEvents.length - 1 && (
                      <span
                        className={`absolute left-[14px] top-7 bottom-[-28px] w-0.5 ${
                          ev.done ? "bg-primary/50" : "bg-muted"
                        }`}
                      />
                    )}
                    <span
                      className={`absolute left-0 top-0.5 grid h-7 w-7 place-items-center rounded-full ring-4 ring-background ${
                        ev.done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      } ${isCurrent ? "animate-pulse" : ""}`}
                    >
                      {ev.done ? <span className="text-[10px]">✓</span> : <span className="h-2 w-2 rounded-full bg-current" />}
                    </span>
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <div className={`font-semibold text-sm ${ev.done ? "text-foreground" : "text-muted-foreground"}`}>
                        {ev.status}
                        {isCurrent && <span className="ml-2 text-[10px] font-medium text-primary bg-primary/10 rounded-full px-2 py-0.5">Saat ini</span>}
                      </div>
                      <div className="text-xs text-muted-foreground">{ev.time}</div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{ev.desc}</div>
                  </li>
                );
              })}
            </ol>

            <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-border/60">
              <Button variant="outline" size="sm" className="rounded-full gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" /> Chat Petani
              </Button>
              <Button variant="outline" size="sm" className="rounded-full gap-1.5">
                <Phone className="h-3.5 w-3.5" /> Hubungi Kurir
              </Button>
              <Button size="sm" className="rounded-full ml-auto gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" /> Konfirmasi Diterima
              </Button>
            </div>
          </div>

          {/* Side */}
          <div className="space-y-5">
            <div className="glass-card rounded-2xl p-5">
              <h3 className="font-display font-bold text-sm mb-3 flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-primary" /> Alamat Pengiriman
              </h3>
              <div className="text-sm space-y-0.5">
                <div className="font-semibold">{order.address.name}</div>
                <div className="text-muted-foreground">{order.address.phone}</div>
                <div className="text-muted-foreground mt-2 leading-relaxed">
                  {order.address.detail}<br />
                  {order.address.city} {order.address.postal}
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5">
              <h3 className="font-display font-bold text-sm mb-3 flex items-center gap-1.5">
                <Sprout className="h-4 w-4 text-primary" /> Dari Petani
              </h3>
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-xl gradient-leaf text-white font-bold">
                  {order.farmer.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-sm">{order.farmer.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{order.farmer.farm}</div>
                  <div className="text-xs text-muted-foreground">{order.farmer.location}</div>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5">
              <h3 className="font-display font-bold text-sm mb-3">Rincian Pesanan</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Produk</span><span className="font-medium text-right truncate ml-2">{order.product}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Jumlah</span><span>{order.qty}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatRupiah(order.total - 18000)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Ongkir</span><span>{formatRupiah(18000)}</span></div>
                <div className="border-t border-border pt-2 mt-2 flex justify-between font-display font-bold">
                  <span>Total</span><span className="text-primary">{formatRupiah(order.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}

function InfoTile({
  icon: Icon, label, value, action, highlight,
}: { icon: any; label: string; value: string; action?: React.ReactNode; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border p-3 ${highlight ? "border-primary/30 bg-primary/5" : "border-border/60 bg-muted/30"}`}>
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className={`font-semibold text-sm truncate ${highlight ? "text-primary" : ""}`}>{value}</div>
        {action}
      </div>
    </div>
  );
}
