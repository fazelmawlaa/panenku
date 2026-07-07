import { Link } from "@tanstack/react-router";
import { MapPin, Star, Sprout, Package, Recycle, Wrench } from "lucide-react";
import { formatRupiah, type Product } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";

const typeMeta: Record<Product["type"], { label: string; icon: any; cls: string }> = {
  preorder: { label: "Pre-Order", icon: Sprout, cls: "bg-primary/10 text-primary border-primary/20" },
  ready: { label: "Ready Stock", icon: Package, cls: "bg-honey/15 text-foreground border-honey/30" },
  waste: { label: "Limbah", icon: Recycle, cls: "bg-earth/10 text-earth border-earth/20" },
  tools: { label: "Alat Tani", icon: Wrench, cls: "bg-blue-500/10 text-blue-700 border-blue-500/20" },
};

export function ProductCard({ product }: { product: Product }) {
  const meta = typeMeta[product.type];
  const Icon = meta.icon;

  return (
    <Link
      to="/products/$id"
      params={{ id: product.id }}
      className="group glass-card rounded-2xl overflow-hidden flex flex-col hover:shadow-glow transition-all hover:-translate-y-1 cursor-pointer"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <Badge className={`absolute top-3 left-3 ${meta.cls} border backdrop-blur-md gap-1`}>
          <Icon className="h-3 w-3" /> {meta.label}
        </Badge>
        <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-background/85 backdrop-blur px-2 py-1 text-xs font-medium">
          <Star className="h-3 w-3 fill-honey text-honey" /> {product.rating}
        </div>
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors text-left text-foreground">
          {product.name}
        </h3>
        <div className="text-xs text-muted-foreground flex items-center gap-1 text-left">
          <MapPin className="h-3 w-3" /> {product.location}
        </div>
        <div className="text-xs text-foreground/70 text-left">oleh <span className="font-medium">{product.farmer}</span></div>
        {product.type === "preorder" && product.ordered !== undefined && (
          <div className="mt-1 text-left">
            <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
              <span>Terpesan {product.ordered} kg</span>
              <span>{product.stock} kg</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full gradient-leaf" style={{ width: `${(product.ordered / product.stock) * 100}%` }} />
            </div>
          </div>
        )}
        <div className="mt-auto pt-2 flex items-end justify-between">
          <div className="text-left">
            <div className="font-display text-lg font-bold text-primary">{formatRupiah(product.price)}</div>
            <div className="text-[10px] text-muted-foreground">per {product.unit}</div>
          </div>
          {product.estimatedHarvest && (
            <Badge variant="outline" className="text-[10px]">{product.estimatedHarvest}</Badge>
          )}
        </div>
      </div>
    </Link>
  );
}
