import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FarmerLayout } from "@/components/layout/FarmerLayout";
import { farmerOrders, formatRupiah } from "@/lib/mock-data";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, MessageSquare, X } from "lucide-react";

const tabs = ["Masuk", "Diterima", "Negosiasi", "Ditolak", "Selesai"] as const;

export const Route = createFileRoute("/farmer/orders")({
  head: () => ({ meta: [{ title: "Pesanan — PANENKU" }] }),
  component: FarmerOrders,
});

function FarmerOrders() {
  const [tab, setTab] = useState<typeof tabs[number]>("Masuk");
  return (
    <FarmerLayout title="Manajemen Pesanan">
      <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="mb-6">
        <TabsList className="rounded-full p-1 h-auto bg-secondary/60 flex-wrap">
          {tabs.map((t) => (
            <TabsTrigger key={t} value={t} className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-1.5">{t}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="space-y-3">
        {farmerOrders.map((o) => (
          <div key={o.id} className="glass-card rounded-2xl p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-xs text-muted-foreground">{o.id}</div>
                <div className="font-display font-bold mt-1">{o.product}</div>
                <div className="text-sm text-muted-foreground">{o.buyer} · {o.qty}</div>
              </div>
              <div className="text-right">
                <div className="font-display text-lg font-bold text-primary">{formatRupiah(o.total)}</div>
                <Badge variant="outline" className="mt-1">{o.status}</Badge>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-border/60">
              <Button size="sm" className="rounded-full gap-1"><Check className="h-3.5 w-3.5" /> Terima</Button>
              <Button size="sm" variant="outline" className="rounded-full gap-1"><MessageSquare className="h-3.5 w-3.5" /> Negosiasi</Button>
              <Button size="sm" variant="outline" className="rounded-full gap-1 text-destructive border-destructive/30 hover:bg-destructive/10"><X className="h-3.5 w-3.5" /> Tolak</Button>
            </div>
          </div>
        ))}
      </div>
    </FarmerLayout>
  );
}
