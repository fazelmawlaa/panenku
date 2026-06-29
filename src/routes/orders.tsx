import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { customerOrders, formatRupiah, orderStatuses } from "@/lib/mock-data";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Package } from "lucide-react";

export const Route = createFileRoute("/orders")({
  head: () => ({ meta: [{ title: "Pesanan Saya — PANENKU" }] }),
  component: Orders,
});

function Orders() {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? customerOrders : customerOrders.filter((o) => o.status === filter);

  return (
    <CustomerLayout>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
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

        <div className="space-y-4">
          {filtered.map((o) => {
            const idx = orderStatuses.indexOf(o.status);
            return (
              <div key={o.id} className="glass-card rounded-2xl p-5">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="text-xs text-muted-foreground">{o.id} · {o.date}</div>
                    <div className="font-display font-bold text-lg mt-1">{o.product}</div>
                    <div className="text-sm text-muted-foreground">{o.qty}</div>
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

                <div className="flex gap-2 pt-3 border-t border-border/60 mt-3">
                  <Link to="/orders/$orderId" params={{ orderId: o.id }}>
                    <Button variant="outline" size="sm" className="rounded-full"><Package className="h-3.5 w-3.5 mr-1" /> Lacak</Button>
                  </Link>
                  <Button variant="outline" size="sm" className="rounded-full">Chat Petani</Button>
                  {o.status === "Selesai" && <Button size="sm" className="rounded-full ml-auto">Beri Ulasan</Button>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </CustomerLayout>
  );
}
