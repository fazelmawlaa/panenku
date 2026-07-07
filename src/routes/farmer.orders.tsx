import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { FarmerLayout } from "@/components/layout/FarmerLayout";
import { formatRupiah } from "@/lib/mock-data";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, MessageSquare, X, ShoppingBag, Loader2, Truck, Sprout, Package } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { fetchFarmerOrders, updateOrderStatusInSupabase } from "@/lib/products-db";

const tabs = ["Semua", "Menunggu", "Dibayar", "Diproses", "Sedang Panen", "Pengiriman", "Selesai", "Ditolak"] as const;

export const Route = createFileRoute("/farmer/orders")({
  head: () => ({ meta: [{ title: "Kelola Pesanan Tani — RumohTani" }] }),
  component: FarmerOrders,
});

function FarmerOrders() {
  const { user } = useAuth();
  const [tab, setTab] = useState<typeof tabs[number]>("Semua");
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadOrders = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await fetchFarmerOrders(user.id);
      setOrders(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat pesanan.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [user]);

  const handleUpdateStatus = async (id: string, nextStatus: string) => {
    try {
      await updateOrderStatusInSupabase(id, nextStatus);
      toast.success(`Status pesanan ${id} berhasil diperbarui menjadi ${nextStatus}`);
      loadOrders();
    } catch (err: any) {
      toast.error(err.message || "Gagal mengubah status pesanan.");
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (tab === "Semua") return true;
    return o.status === tab;
  });

  return (
    <FarmerLayout title="Kelola Pesanan">
      <div className="space-y-8 relative">
        {/* BG designs */}
        <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{ backgroundImage: "radial-gradient(#1a2b1b 1.5px, transparent 1.5px)", backgroundSize: "28px 28px" }} />
        <div className="absolute top-[5%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none" />
          
        {/* Header Card */}
        <div className="bg-white border border-border/40 rounded-[2rem] p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4 shadow-sm">
          <div>
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Kelola Transaksi</div>
            <h1 className="font-['Plus_Jakarta_Sans',sans-serif] text-3xl font-extrabold text-foreground tracking-tight mt-1">
              Kelola <span className="font-['Playfair_Display',serif] italic font-light text-primary">Pesanan Tani</span>
            </h1>
            <p className="text-sm text-muted-foreground font-light mt-1.5">Pantau, terima, dan kelola proses pemenuhan pesanan panen pre-order serta limbah pertanian dari mitra usaha.</p>
          </div>
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-white shrink-0">
            <ShoppingBag className="h-6 w-6" />
          </div>
        </div>

        {/* Tabs Filter */}
        <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="mb-6">
          <TabsList className="rounded-full p-1 h-auto bg-secondary/70 border border-border/20 flex-wrap">
            {tabs.map((t) => (
              <TabsTrigger 
                key={t} 
                value={t} 
                className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-5 py-2 font-bold text-xs uppercase tracking-wider"
              >
                {t}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Orders list */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-light">Memuat pesanan masuk...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white border border-border/40 rounded-[2rem] p-12 text-center text-muted-foreground font-light">
              Tidak ada pesanan dengan status "{tab}".
            </div>
          ) : (
            filteredOrders.map((o) => {
              const getStatusBadgeStyles = (status: string) => {
                switch (status) {
                  case "Menunggu":
                    return "bg-amber-500/10 text-amber-900 border-amber-500/20";
                  case "Dibayar":
                    return "bg-blue-500/10 text-blue-800 border-blue-500/20";
                  case "Diproses":
                    return "bg-teal-500/10 text-teal-800 border-teal-500/20";
                  case "Sedang Panen":
                    return "bg-emerald-500/10 text-emerald-800 border-emerald-500/20";
                  case "Pengiriman":
                    return "bg-indigo-500/10 text-indigo-800 border-indigo-500/20";
                  case "Selesai":
                    return "bg-green-500/10 text-green-800 border-green-500/20";
                  default:
                    return "bg-red-500/10 text-red-800 border-red-500/20";
                }
              };

              return (
                <div key={o.id} className="bg-white border border-border/40 rounded-[2.5rem] p-6 sm:p-8 shadow-sm hover:shadow-soft transition duration-300 text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/25 pb-4">
                    <div>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">ID Pesanan · {o.id}</div>
                      <div className="font-['Plus_Jakarta_Sans',sans-serif] font-extrabold text-base text-foreground mt-1">{o.product_name}</div>
                    </div>
                    
                    <div className="text-left sm:text-right shrink-0">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Tagihan</div>
                      <div className="font-extrabold text-primary text-lg mt-0.5">{formatRupiah(o.total)}</div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 py-4 text-xs font-semibold">
                    <div className="rounded-xl bg-secondary/30 border border-border/20 p-3">
                      <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Pembeli / Mitra</div>
                      <div className="text-foreground mt-0.5">{o.buyer_name || "Pembeli"}</div>
                    </div>
                    <div className="rounded-xl bg-secondary/30 border border-border/20 p-3">
                      <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Volume Pesanan</div>
                      <div className="text-foreground mt-0.5">{o.qty}</div>
                    </div>
                    <div className="rounded-xl bg-secondary/30 border border-border/20 p-3 flex items-center justify-between">
                      <div>
                        <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Status Pemrosesan</div>
                        <div className="text-foreground mt-0.5">{o.status}</div>
                      </div>
                      <Badge className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase ${getStatusBadgeStyles(o.status)}`}>
                        {o.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Actions to progress order status step-by-step */}
                  <div className="flex flex-wrap gap-2.5 mt-2 pt-4 border-t border-border/30 items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {o.status === "Menunggu" && (
                        <>
                          <Button 
                            onClick={() => handleUpdateStatus(o.id, "Dibayar")}
                            size="sm" 
                            className="rounded-full gap-1 text-xs px-5 font-bold bg-amber-600 hover:bg-amber-700 text-white"
                          >
                            <Check className="h-4 w-4" /> Verifikasi Pembayaran
                          </Button>
                          <Button 
                            onClick={() => handleUpdateStatus(o.id, "Ditolak")}
                            size="sm" 
                            variant="outline" 
                            className="rounded-full gap-1 text-xs px-5 font-bold text-destructive border-destructive/20 hover:bg-destructive/10"
                          >
                            <X className="h-4 w-4" /> Tolak Pesanan
                          </Button>
                        </>
                      )}

                      {o.status === "Dibayar" && (
                        <Button 
                          onClick={() => handleUpdateStatus(o.id, "Diproses")}
                          size="sm" 
                          className="rounded-full gap-1 text-xs px-5 font-bold bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Package className="h-4 w-4" /> Proses Pesanan
                        </Button>
                      )}

                      {o.status === "Diproses" && (
                        <Button 
                          onClick={() => handleUpdateStatus(o.id, "Sedang Panen")}
                          size="sm" 
                          className="rounded-full gap-1 text-xs px-5 font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <Sprout className="h-4 w-4" /> Mulai Panen
                        </Button>
                      )}

                      {o.status === "Sedang Panen" && (
                        <Button 
                          onClick={() => handleUpdateStatus(o.id, "Pengiriman")}
                          size="sm" 
                          className="rounded-full gap-1 text-xs px-5 font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                          <Truck className="h-4 w-4" /> Kirim Pesanan
                        </Button>
                      )}

                      {o.status === "Pengiriman" && (
                        <Button 
                          onClick={() => handleUpdateStatus(o.id, "Selesai")}
                          size="sm" 
                          className="rounded-full gap-1 text-xs px-5 font-bold bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Check className="h-4 w-4" /> Selesaikan Pesanan
                        </Button>
                      )}

                      {o.status === "Selesai" && (
                        <span className="text-emerald-700 font-bold flex items-center gap-1 text-xs bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                          <Check className="h-4 w-4" /> Pesanan Selesai
                        </span>
                      )}

                      {o.status === "Ditolak" && (
                        <span className="text-red-700 font-bold flex items-center gap-1 text-xs bg-red-50 px-3 py-1 rounded-full border border-red-200">
                          <X className="h-4 w-4" /> Pesanan Ditolak
                        </span>
                      )}
                    </div>

                    <Button size="sm" variant="outline" className="rounded-full gap-1.5 text-[10px] font-bold">
                      <MessageSquare className="h-3.5 w-3.5" /> Chat Pembeli
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </FarmerLayout>
  );
}
