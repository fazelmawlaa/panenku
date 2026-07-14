import { Link } from "@tanstack/react-router";
import { MapPin, Star, Sprout, Package, Recycle, Wrench, CircleDot } from "lucide-react";
import { formatRupiah, type Product } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";

const typeMeta: Record<Product["type"], { label: string; icon: any; cls: string }> = {
  preorder: { label: "Pre-Order", icon: CircleDot, cls: "bg-amber-600/90 text-white border-transparent backdrop-blur" },
  ready: { label: "Ready Stock", icon: Package, cls: "bg-emerald-700/90 text-white border-transparent backdrop-blur" },
  waste: { label: "Limbah", icon: Recycle, cls: "bg-emerald-900/85 text-white border-transparent backdrop-blur" },
  tools: { label: "Alat Tani", icon: Wrench, cls: "bg-blue-600/90 text-white border-transparent backdrop-blur" },
};


export function ProductCard({ product }: { product: Product }) {
  const meta = typeMeta[product.type] || { label: "Produk", icon: Package, cls: "bg-primary/10 text-primary border-primary/20" };
  const Icon = meta.icon || Package;
  const remaining = product.ordered !== undefined ? product.stock - product.ordered : product.stock;
  const isOutOfStock = remaining <= 0;
  const unit = product.unit || "kg";

  return (
    <Link
      to="/products/$id"
      params={{ id: product.id }}
      className={`group relative glass-card rounded-2xl overflow-hidden flex flex-col transition-all duration-300 cursor-pointer bg-white border shadow-sm h-full ${
        isOutOfStock
          ? "border-border/30 opacity-80 hover:opacity-100"
          : "border-border/45 hover:shadow-glow hover:-translate-y-1"
      }`}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className={`h-full w-full object-cover transition-transform duration-500 ${isOutOfStock ? "grayscale-[30%]" : "group-hover:scale-105"}`}
        />

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <span className="bg-white/90 text-red-600 font-black text-xs px-4 py-1.5 rounded-full border border-red-200 shadow">
              Stok Habis
            </span>
          </div>
        )}

        {/* Type Badge */}
        <Badge className={`absolute top-2 left-2 sm:top-3 sm:left-3 ${meta.cls} border gap-0.5 text-[9px] sm:text-[10px] py-0.5 px-1.5 font-bold`}>
          <Icon className="h-2.5 w-2.5" /> {meta.label}
        </Badge>

        {/* Rating */}
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex items-center gap-0.5 rounded-full bg-black/40 backdrop-blur-sm px-1.5 py-0.5 text-[10px] font-bold text-white">
          <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" /> {product.rating}
        </div>
      </div>

      {/* Info */}
      <div className="p-3 sm:p-4 flex flex-col gap-1.5 sm:gap-2 flex-1 min-w-0 text-left">
        <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-sm sm:text-[0.95rem] leading-snug line-clamp-2 group-hover:text-primary transition-colors text-foreground">
          {product.name}
        </h3>

        <div className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-0.5">
          <MapPin className="h-3 w-3 shrink-0 text-primary/50" />
          <span className="truncate">{product.location}</span>
        </div>

        <div className="text-[10px] sm:text-xs text-foreground/60 truncate">
          oleh <span className="font-semibold text-foreground/75">{product.farmer}</span>
        </div>

        {/* Stock progress bar for preorder/waste */}
        {(product.type === "preorder" || product.type === "waste") && product.ordered !== undefined && (
          <div className="mt-0.5">
            <div className="flex justify-between text-[9px] sm:text-[10px] mb-1 font-semibold">
              <span className={isOutOfStock ? "text-red-500" : "text-emerald-600"}>
                {isOutOfStock ? "Stok Habis" : `Tersedia ${remaining} ${unit}`}
              </span>
              <span className="text-muted-foreground">{product.stock} {unit}</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full ${isOutOfStock ? "bg-red-400" : "gradient-leaf"}`}
                style={{ width: `${Math.min(100, (remaining / product.stock) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Price row */}
        <div className="mt-auto pt-2 border-t border-border/20 flex items-end justify-between gap-1.5">
          <div>
            <div className={`font-['Plus_Jakarta_Sans',sans-serif] text-sm sm:text-lg font-black leading-tight ${isOutOfStock ? "text-muted-foreground line-through" : "text-primary"}`}>
              {formatRupiah(product.price)}
            </div>
            <div className="text-[9px] sm:text-[10px] text-muted-foreground">per {product.unit}</div>
          </div>
          {product.estimatedHarvest && (
            <Badge variant="outline" className="text-[9px] sm:text-[10px] py-0 px-1.5 shrink-0 font-medium">
              {product.estimatedHarvest}
            </Badge>
          )}
        </div>
      </div>
    </Link>
  );
}
