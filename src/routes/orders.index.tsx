import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { formatRupiah, orderStatuses } from "@/lib/mock-data";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Package, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { fetchCustomerOrders } from "@/lib/products-db";

export const Route = createFileRoute("/orders/")({
  head: () => ({ meta: [{ title: "Pesanan Saya — RumohTani" }] }),
  component: Orders,
});

function Orders() {
  const { user, session, loading } = useAuth();
  const navigate = useNavigate();

  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!loading && !session) {
      navigate({ to: "/login", replace: true });
    }
  }, [loading, session, navigate]);

  useEffect(() => {
    const loadOrders = async () => {
      if (user?.id) {
        setIsLoading(true);
        const data = await fetchCustomerOrders(user.id);
        setOrdersList(data);
        setIsLoading(false);
      }
    };
    loadOrders();
  }, [user]);

  const filtered = filter === "all" ? ordersList : ordersList.filter((o) => o.status === filter);

  return (
    <CustomerLayout>
      <div className="mx-auto max-w-full px-4 sm:px-8 md:px-12 py-8 text-left">
        <h1 className="font-display text-3xl font-bold mb-2">Pesanan Saya</h1>
        <p className="text-muted-foreground mb-6">Pantau status pesanan dari panen hingga sampai tangan Anda.</p>

        <Tabs value={filter} onValueChange={setFilter} className="mb-6">
          <TabsList className="rounded-full p-1 h-auto bg-secondary/60 flex-wrap">
            <TabsTrigger value="all" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2">Semua</TabsTrigger>
            {orderStatuses.map((s) => (
              <TabsTrigger key={s} value={s} className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2">{s}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-light">Memuat riwayat transaksi dari Supabase...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center border border-border/40 bg-white">
            <p className="text-muted-foreground">Tidak ada pesanan.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((o) => {
              const idx = orderStatuses.indexOf(o.status);
              return (
                <div key={o.id} className="glass-card rounded-2xl p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div>
                      <div className="text-xs text-muted-foreground">{o.id} · {o.date}</div>
                      <div className="font-display font-bold text-lg mt-1">{o.product_name}</div>
                      <div className="text-xs text-muted-foreground/80 mt-0.5">Jumlah: {o.qty}</div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-primary/10 text-primary border-primary/20">{o.status}</Badge>
                      <div className="font-bold text-primary mt-1">{formatRupiah(o.total)}</div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="hidden sm:grid grid-cols-6 gap-1 mb-2">
                    {orderStatuses.map((s, i) => (
                      <div key={s} className="flex flex-col items-center text-center gap-1">
                        <div className="flex items-center w-full">
                          {i > 0 && <div className={`h-0.5 flex-1 ${i <= idx ? "bg-primary" : "bg-muted"}`} />}
                          {i <= idx
                            ? <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                            : <Circle className="h-5 w-5 text-muted-foreground/40 shrink-0" />}
                          {i < orderStatuses.length - 1 && <div className={`h-0.5 flex-1 ${i < idx ? "bg-primary" : "bg-muted"}`} />}
                        </div>
                        <div className={`text-[10px] ${i <= idx ? "text-foreground font-medium" : "text-muted-foreground"}`}>{s}</div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border/60 mt-3">
                    <span className="text-xs text-muted-foreground font-light">Penerima: <span className="font-medium text-foreground">{o.buyer_name} ({o.buyer_phone})</span></span>
                    <span className="text-xs text-muted-foreground hidden md:inline">·</span>
                    <span className="text-xs text-muted-foreground font-light truncate max-w-xs md:max-w-md">Alamat: <span className="font-medium text-foreground">{o.shipping_address}</span></span>
                    
                    <div className="flex gap-2 ml-auto w-full md:w-auto pt-2 md:pt-0">
                      <Link to="/products/$id" params={{ id: o.product_id }} className="w-full md:w-auto">
                        <Button variant="outline" size="sm" className="w-full rounded-full"><Package className="h-3.5 w-3.5 mr-1" /> Produk</Button>
                      </Link>
                      <Button variant="outline" size="sm" className="rounded-full flex-1 md:flex-initial">Chat Petani</Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
