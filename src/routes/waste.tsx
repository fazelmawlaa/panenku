import { createFileRoute } from "@tanstack/react-router";
import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { ProductCard } from "@/components/ProductCard";
import { products, wasteCategories, buyerTypes } from "@/lib/mock-data";
import { Recycle, Leaf, Factory, Sparkles } from "lucide-react";

export const Route = createFileRoute("/waste")({
  head: () => ({ meta: [{ title: "Limbah Pertanian — PANENKU" }, { name: "description", content: "Marketplace limbah pertanian untuk ekonomi sirkular. Sekam padi, kulit kopi, batok kelapa, dan lainnya." }] }),
  component: WastePage,
});

function WastePage() {
  const waste = products.filter((p) => p.type === "waste");

  return (
    <CustomerLayout>
      {/* Hero */}
      <section className="gradient-hero py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full glass-card px-4 py-1.5 text-xs font-medium mb-4">
              <Recycle className="h-3.5 w-3.5 text-primary" /> Ekonomi Sirkular
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">Limbah Pertanian, <span className="text-gradient">Sumber Cuan Baru</span></h1>
            <p className="text-foreground/70 mb-6">Dari sekam padi sampai batang pisang — temukan bahan baku untuk pakan ternak, pupuk, biomassa, dan industri serat langsung dari petani.</p>
            <div className="grid grid-cols-3 gap-3 max-w-md">
              <Stat icon={Leaf} label="Ton Diolah" value="14.2k" />
              <Stat icon={Factory} label="Mitra Industri" value="380+" />
              <Stat icon={Sparkles} label="CO₂ Dihemat" value="2.1k t" />
            </div>
          </div>
          <div className="glass-card rounded-3xl p-6">
            <div className="grid grid-cols-4 gap-3">
              {wasteCategories.map((c) => (
                <div key={c.name} className="text-center rounded-2xl bg-background/60 p-3 hover:bg-primary/10 transition cursor-pointer">
                  <div className="text-3xl mb-1">{c.icon}</div>
                  <div className="text-[10px] font-medium leading-tight">{c.name}</div>
                  <div className="text-[9px] text-muted-foreground mt-0.5">{c.use}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Buyer types */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <h2 className="font-display text-xl font-bold mb-4">Cocok untuk</h2>
        <div className="flex flex-wrap gap-3">
          {buyerTypes.map((b) => (
            <div key={b.name} className="glass-card rounded-full px-5 py-2.5 flex items-center gap-2 text-sm font-medium">
              <span>{b.icon}</span> {b.name}
            </div>
          ))}
        </div>
      </section>

      {/* Products */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
        <h2 className="font-display text-2xl font-bold mb-5">Limbah Tersedia</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {waste.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
    </CustomerLayout>
  );
}

function Stat({ icon: Icon, label, value }: any) {
  return (
    <div className="glass-card rounded-2xl p-3">
      <Icon className="h-4 w-4 text-primary mb-1" />
      <div className="font-display text-xl font-bold">{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}
