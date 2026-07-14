import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { formatRupiah } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { fetchOrderDetail, updateOrderStatusInSupabase } from "@/lib/products-db";
import {
  ArrowLeft, MapPin, Truck, Package, Phone, MessageSquare, Copy, ShieldCheck, Sprout, Loader2, Award
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/orders/$orderId")({
  head: ({ params }) => ({ meta: [{ title: `${params.orderId} — Pelacakan Pengiriman` }] }),
  component: OrderDetail,
});

function OrderDetail() {
  const { orderId } = Route.useParams();
  const { user, session, loading } = useAuth();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadOrderDetail = async () => {
    setIsLoading(true);
    const data = await fetchOrderDetail(orderId);
    setOrder(data);
    setIsLoading(false);
  };

  useEffect(() => {
    if (!loading && !session) {
      navigate({ to: "/login", replace: true });
      return;
    }
    if (user?.id) {
      loadOrderDetail();
    }
  }, [loading, session, navigate, user, orderId]);

  const handleConfirmReceived = async () => {
    try {
      await updateOrderStatusInSupabase(orderId, "Selesai");
      toast.success("Pesanan telah Anda terima dengan baik! Terima kasih.");
      loadOrderDetail();
    } catch (err: any) {
      toast.error(err.message || "Gagal memperbarui status pesanan.");
    }
  };

  function copyAwb() {
    if (order?.id) {
      navigator.clipboard.writeText(orderId).then(() => toast.success("ID Pesanan disalin"));
    }
  }

  if (isLoading) {
    return (
      <CustomerLayout>
        <div className="flex flex-col items-center justify-center py-40 gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-light">Memuat detail transaksi dari database...</p>
        </div>
      </CustomerLayout>
    );
  }

  if (!order) {
    return (
      <CustomerLayout>
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-20 text-center">
          <h2 className="text-2xl font-bold mb-2">Pesanan Tidak Ditemukan</h2>
          <p className="text-muted-foreground mb-6">Pesanan dengan ID tersebut tidak terdaftar atau Anda tidak memiliki izin akses.</p>
          <Link to="/orders">
            <Button className="rounded-full">Kembali ke Daftar Pesanan</Button>
          </Link>
        </div>
      </CustomerLayout>
    );
  }

  const steps = ["Menunggu", "Dibayar", "Diproses", "Sedang Panen", "Pengiriman", "Selesai"];
  const currentIdx = steps.indexOf(order.status);
  
  const trackingTimeline = steps.map((stepName, i) => {
    let desc = "";
    switch (stepName) {
      case "Menunggu":
        desc = "Pesanan telah dibuat, menunggu verifikasi pembayaran oleh penjual";
        break;
      case "Dibayar":
        desc = "Pembayaran telah terverifikasi oleh penjual";
        break;
      case "Diproses":
        desc = "Pesanan sedang dipersiapkan dan dikemas oleh penjual";
        break;
      case "Sedang Panen":
        desc = "Hasil bumi sedang dipanen segar langsung dari ladang";
        break;
      case "Pengiriman":
        desc = "Pesanan diserahkan ke kurir dan sedang dalam perjalanan";
        break;
      case "Selesai":
        desc = "Pesanan telah diterima dengan baik oleh pembeli";
        break;
    }
    return {
      status: stepName,
      desc,
      done: i <= currentIdx,
      time: i <= currentIdx ? (i === currentIdx ? "Saat ini" : "Selesai") : "Belum mulai"
    };
  });

  return (
    <CustomerLayout>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
        <Link to="/orders" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Semua Pesanan
        </Link>

        {/* Header */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 mb-6 text-left">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground">Pesanan</div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold">{order.id}</h1>
              <div className="text-sm text-muted-foreground mt-1">Dipesan {order.date}</div>
            </div>
            <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1.5 text-sm uppercase font-bold">
              <Truck className="h-3.5 w-3.5 mr-1" /> {order.status}
            </Badge>
          </div>

          <div className="mt-5 grid sm:grid-cols-3 gap-3 text-sm">
            <InfoTile icon={Package} label="Pengiriman" value={order.shipping_address ? "Kurir / COD" : "COD"} />
            <InfoTile
              icon={Copy}
              label="ID Transaksi"
              value={order.id}
              action={<button onClick={copyAwb} className="text-xs text-primary hover:underline">Salin</button>}
            />
            <InfoTile icon={Truck} label="Status Sekarang" value={order.status} highlight />
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-6 text-left">
          {/* Timeline */}
          <div className="glass-card rounded-2xl p-5 sm:p-6">
            <h2 className="font-display font-bold mb-1">Riwayat Pengiriman</h2>
            <p className="text-xs text-muted-foreground mb-5">Update real-time status pemrosesan penjual.</p>

            <ol className="relative space-y-5">
              {trackingTimeline.map((ev, i) => {
                const isCurrent = i === currentIdx;
                return (
                  <li key={i} className="relative pl-9">
                    {i < trackingTimeline.length - 1 && (
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
              {order.status === "Pengiriman" && (
                <Button onClick={handleConfirmReceived} size="sm" className="rounded-full ml-auto gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" /> Konfirmasi Diterima
                </Button>
              )}
            </div>
          </div>

          {/* Side */}
          <div className="space-y-5">
            <div className="glass-card rounded-2xl p-5">
              <h3 className="font-display font-bold text-sm mb-3 flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-primary" /> Alamat Pengiriman
              </h3>
              <div className="text-sm space-y-0.5">
                <div className="font-semibold">{order.buyer_name || "Penerima"}</div>
                <div className="text-muted-foreground">{order.buyer_phone || "No HP"}</div>
                <div className="text-muted-foreground mt-2 leading-relaxed">
                  {order.shipping_address}
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5">
              <h3 className="font-display font-bold text-sm mb-3 flex items-center gap-1.5">
                <Sprout className="h-4 w-4 text-primary" /> Informasi Transaksi
              </h3>
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary font-bold">
                  {order.product_name?.charAt(0) || "P"}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-sm">PANENKU Hub</div>
                  <div className="text-xs text-muted-foreground">Pembayaran terverifikasi penjual</div>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5">
              <h3 className="font-display font-bold text-sm mb-3">Rincian Pesanan</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Produk</span><span className="font-medium text-right truncate ml-2">{order.product_name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Jumlah</span><span>{order.qty}</span></div>
                <div className="border-t border-border pt-2 mt-2 flex justify-between font-display font-bold">
                  <span>Total Tagihan</span><span className="text-primary">{formatRupiah(order.total)}</span>
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
