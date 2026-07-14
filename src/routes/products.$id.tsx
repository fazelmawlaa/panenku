import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { formatRupiah } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  MapPin, Star, Sprout, MessageCircle, ShoppingBag, Calendar,
  Leaf, Award, Shield, QrCode, Minus, Plus, ShoppingCart, Loader2,
  CircleDot, Recycle
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchProductDetail,
  fetchReviewsForProduct,
  insertReviewToSupabase
} from "@/lib/products-db";

export const Route = createFileRoute("/products/$id")({
  loader: async ({ params }) => {
    const details = await fetchProductDetail(params.id);
    return details;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.product?.name ?? "Produk"} — PANENKU` },
      { name: "description", content: loaderData?.product?.description ?? "" },
      { property: "og:image", content: loaderData?.product?.image ?? "" },
    ],
  }),
  component: ProductDetail,
});

function ProductDetail() {
  const { product: initialProduct } = Route.useLoaderData();
  const { user, session, profile } = useAuth();
  const isLoggedIn = !!session;

  // Dynamic state for product info and details
  const [p, setProduct] = useState(initialProduct);
  const [qty, setQty] = useState(1);

  // Reviews states
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Load reviews on mount
  const fetchReviews = async () => {
    setLoadingReviews(true);
    const data = await fetchReviewsForProduct(p.id);
    setReviewsList(data);
    setLoadingReviews(false);
  };

  useEffect(() => {
    fetchReviews();
  }, [p.id]);

  const handleSendReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Silakan masuk terlebih dahulu untuk menulis ulasan.");
      return;
    }
    setIsSubmittingReview(true);
    try {
      const userName = profile?.full_name || user.email?.split("@")[0] || "Pembeli";
      await insertReviewToSupabase(p.id, user.id, userName, newRating, newComment);

      toast.success("Ulasan Anda berhasil disimpan!");
      setNewComment("");
      setNewRating(5);

      // Reload reviews and updated rating details
      fetchReviews();
      const updated = await fetchProductDetail(p.id);
      if (updated?.product) {
        setProduct(updated.product);
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal mengirim ulasan.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <CustomerLayout>
      <div className="mx-auto max-w-full px-4 sm:px-8 md:px-12 py-6 pb-48 sm:pb-32 text-left">
        {/* Breadcrumb */}
        <div className="text-xs text-muted-foreground mb-5 select-none flex items-center gap-1.5">
          <Link to="/products" className="hover:text-foreground transition-colors">Katalog</Link>
          <span>/</span>
          <span>{p.category}</span>
          <span>/</span>
          <span className="text-foreground font-medium truncate max-w-[160px]">{p.name}</span>
        </div>

        <div className="grid lg:grid-cols-[420px_1fr] gap-8 lg:gap-12">
          {/* Gallery */}
          <div className="relative">
            <div className="aspect-square rounded-3xl overflow-hidden border border-border/20 shadow-md w-full max-w-sm lg:max-w-none mx-auto lg:mx-0 bg-white">
              <img src={p.image} alt={p.name} className="h-full w-full object-cover hover:scale-[1.02] transition-transform duration-500" />
            </div>
            {/* floating badge on image */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {p.type === "waste" && (
                <span className="inline-flex items-center gap-1.5 bg-emerald-900/80 backdrop-blur text-white text-[10px] font-bold px-3 py-1.5 rounded-full">
                  <Recycle className="h-3 w-3" /> Limbah Sirkular
                </span>
              )}
              {p.type === "preorder" && (
                <span className="inline-flex items-center gap-1.5 bg-amber-600/80 backdrop-blur text-white text-[10px] font-bold px-3 py-1.5 rounded-full">
                  <CircleDot className="h-3 w-3" /> Pre-Order
                </span>
              )}
            </div>
          </div>

          {/* Info Column */}
          <div className="flex flex-col gap-5">
            {/* Top Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold tracking-widest uppercase text-primary bg-primary/8 border border-primary/15 rounded-full px-3 py-1">{p.category}</span>
              {p.type === "tools" && <span className="text-[10px] font-bold tracking-widest uppercase text-blue-700 bg-blue-500/8 border border-blue-500/15 rounded-full px-3 py-1">Alat Tani</span>}
              <span className="flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
                <Shield className="h-3 w-3" /> Terverifikasi
              </span>
            </div>

            {/* Product Name */}
            <div>
              <h1 className="font-['Plus_Jakarta_Sans',sans-serif] text-3xl sm:text-[2.6rem] font-black text-[#1a2b1b] leading-[1.15] tracking-tight">{p.name}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-3 text-sm">
                <span className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-foreground">{p.rating}</span>
                  <span className="text-muted-foreground">({p.reviews} ulasan)</span>
                </span>
                <span className="text-border">·</span>
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 text-primary/60" /> {p.location}
                </span>
              </div>
            </div>

            {/* Description — diletakkan di atas info petani */}
            <div className="bg-[#f7f8f4] border border-[#e5e8dc] rounded-2xl px-5 py-4">
              <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Leaf className="h-3 w-3 text-primary" /> Tentang Produk
              </div>
              <p className="text-sm text-foreground/80 leading-[1.8]">{p.description}</p>
            </div>

            {/* Price + Ketersediaan dalam satu card */}
            {(() => {
              const remaining = p.ordered !== undefined ? p.stock - p.ordered : p.stock;
              const isOutOfStock = remaining <= 0;
              const showBar = (p.type === "preorder" || p.type === "waste") && p.ordered !== undefined;
              return (
                <div className="bg-white border border-border/30 rounded-2xl px-5 py-4 shadow-sm space-y-3">
                  {/* Harga */}
                  <div>
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Harga Satuan</div>
                    <div className="font-['Plus_Jakarta_Sans',sans-serif] text-3xl sm:text-4xl font-black text-primary leading-none">
                      {formatRupiah(p.price)}
                      <span className="text-base font-semibold text-muted-foreground ml-1">/{p.unit}</span>
                    </div>
                  </div>

                  {/* Bar ketersediaan — langsung di bawah harga */}
                  {showBar && (
                    <div className="pt-1 border-t border-border/20">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className={`font-semibold ${isOutOfStock ? "text-red-500" : "text-emerald-600"}`}>
                          {isOutOfStock ? "Stok Habis" : `Tersedia ${remaining} ${p.unit}`}
                        </span>
                        <span className="text-muted-foreground">{p.stock} {p.unit}</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${isOutOfStock ? "bg-red-400" : "gradient-leaf"}`}
                          style={{ width: `${Math.min(100, (remaining / p.stock) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Seller & Product Details */}
            <div className="grid grid-cols-2 gap-2.5">
              <InfoRow icon={Sprout} label="Petani" value={p.farmer} color="emerald" />
              <InfoRow icon={Leaf} label="Metode" value={p.cultivation ?? "—"} color="teal" />
              <InfoRow icon={Calendar} label="Estimasi Panen" value={p.estimatedHarvest ?? "Siap kirim"} color="amber" />
              <InfoRow icon={MapPin} label="Asal Produk" value={p.location} color="rose" />
            </div>
          </div>
        </div>

        {/* REVIEWS & RATINGS SECTION */}
        <section className="mt-8 border-t border-border/20 pt-6 space-y-6 w-full">
          {/* Combined Card: Statistics & Write Review (Full Width) */}
          <div className="bg-white border border-border/40 rounded-3xl p-5 shadow-sm space-y-5 w-full text-left">
            {/* Part 1: Statistics Block */}
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-border/10">
                <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-sm text-foreground">Nilai & Ulasan</h3>
                <span className="text-xs font-bold text-primary hover:underline cursor-pointer">Lihat Semua</span>
              </div>

              <div className="flex flex-row items-center gap-6 justify-between">
                {/* Left: Overall rating score */}
                <div className="flex items-baseline gap-2 shrink-0">
                  <span className="font-display text-5xl font-black text-foreground">
                    {p.rating ? p.rating.toFixed(1).replace(".", ",") : "5,0"}
                  </span>
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-muted-foreground block">dari 5</span>
                    <span className="text-[10px] font-semibold text-muted-foreground block">
                      {reviewsList.length || p.reviews} Penilaian
                    </span>
                  </div>
                </div>

                {/* Right: Star distribution horizontal progress bars */}
                <div className="flex-1 max-w-md space-y-1">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = reviewsList.length > 0
                      ? reviewsList.filter((r) => Math.round(r.rating) === stars).length
                      : stars === 5 ? (p.reviews || 2) : 0; // fallback to match mock rating
                    const total = reviewsList.length > 0 ? reviewsList.length : (p.reviews || 2);
                    const pct = total > 0 ? (count / total) * 100 : 0;

                    return (
                      <div key={stars} className="flex items-center gap-2 text-[10px]">
                        <div className="flex items-center gap-0.5 w-16 justify-end select-none">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star
                              key={idx}
                              className={`h-2.5 w-2.5 ${idx < stars ? "fill-honey text-honey" : "text-muted-foreground/20"}`}
                            />
                          ))}
                        </div>
                        <div className="flex-1 h-1.5 rounded-full bg-secondary/80 overflow-hidden">
                          <div
                            className="h-full bg-honey rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Thin Separator Line */}
            <div className="border-t border-border/30 -mt-1" />

            {/* Part 2: Submit Review Form */}
            <div className="space-y-3 -mt-2">
              <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-sm text-foreground">Tulis Ulasan Anda</h3>
              {isLoggedIn ? (
                <form onSubmit={handleSendReview} className="space-y-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Beri Bintang</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="focus:outline-none transition transform active:scale-95"
                        >
                          <Star className={`h-5 w-5 ${newRating >= star ? "fill-honey text-honey" : "text-muted-foreground/30"}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 items-end">
                    <div className="flex-1">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Bagikan ulasan Anda"
                        className="w-full min-h-[44px] h-[44px] py-2.5 px-3 border border-border/40 bg-secondary/20 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition text-foreground resize-none"
                        required
                      />
                    </div>
                    <Button type="submit" disabled={isSubmittingReview} className="rounded-xl font-bold shadow-soft h-[44px] px-6 shrink-0 bg-primary hover:bg-primary-hover text-white">
                      {isSubmittingReview ? "..." : "Kirim"}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="bg-secondary/40 border border-border/20 rounded-2xl p-4 text-xs text-muted-foreground text-center font-light">
                  Silakan <Link to="/login" className="font-bold text-primary hover:underline">Masuk</Link> terlebih dahulu untuk mempublikasikan ulasan produk di database.
                </div>
              )}
            </div>
          </div>

          {/* Part 3: Comments Feed List */}
          <div className="space-y-4 text-left">
            <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-sm text-[#1a2b1b] uppercase tracking-wider pl-1">Semua Ulasan</h3>

            {loadingReviews ? (
              <div className="flex items-center gap-2 text-muted-foreground text-xs font-light py-4 pl-1">
                <Loader2 className="h-4 w-4 animate-spin text-primary" /> Memuat ulasan...
              </div>
            ) : reviewsList.length === 0 ? (
              <div className="bg-white border border-border/40 rounded-3xl p-8 text-center text-muted-foreground text-xs font-light">
                Belum ada ulasan untuk produk ini. Jadilah yang pertama memberikan ulasan!
              </div>
            ) : (
              <div className="space-y-4">
                {reviewsList.map((rev) => (
                  <div key={rev.id} className="bg-white border border-border/40 rounded-3xl p-5 shadow-sm space-y-3 hover:shadow-soft transition-all duration-300 text-left">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-sm text-foreground">{rev.user_name}</div>
                        <div className="text-[9px] text-muted-foreground mt-0.5">
                          {new Date(rev.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-bold text-honey">
                        <Star className="h-3.5 w-3.5 fill-honey text-honey" />
                        <span>{rev.rating}.0</span>
                      </div>
                    </div>
                    <p className="text-xs text-foreground/80 leading-relaxed font-light">"{rev.comment}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Sticky/Fixed bottom action bar */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-border/40 pt-3.5 pb-7 sm:pb-3.5 px-4 sm:px-8 md:px-12 shadow-[0_-10px_30px_rgba(0,0,0,0.06)] animate-in slide-in-from-bottom duration-300 select-none">
          <div className="mx-auto max-w-7xl flex flex-col md:flex-row md:items-center md:justify-between gap-3.5">
            {/* Left/Top info (Quantity + Subtotal) */}
            <div className="flex items-center justify-between md:justify-start gap-6">
              {/* Quantity selector */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-muted-foreground uppercase">Jumlah ({p.unit})</span>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    disabled={qty <= 1}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </Button>
                  <span className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-base w-6 text-center">{qty}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                    onClick={() => setQty(qty + 1)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Subtotal */}
              <div className="flex items-center gap-2 border-l border-border/60 pl-6">
                <span className="text-xs font-bold text-muted-foreground uppercase">Subtotal</span>
                <span className="font-black text-primary text-xl">{formatRupiah(p.price * qty)}</span>
              </div>
            </div>

            {/* Right/Bottom info (Action Buttons) */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Button
                onClick={async () => {
                  if (!user) {
                    toast.info("Silakan masuk terlebih dahulu untuk menggunakan keranjang belanja");
                    return;
                  }
                  try {
                    const { data: existing, error: fetchError } = await supabase
                      .from("cart_items")
                      .select("id, qty")
                      .eq("user_id", user.id)
                      .eq("product_id", p.id)
                      .maybeSingle();

                    if (fetchError) throw fetchError;

                    if (existing) {
                      const { error: updateError } = await supabase
                        .from("cart_items")
                        .update({ qty: existing.qty + qty })
                        .eq("id", existing.id);
                      if (updateError) throw updateError;
                    } else {
                      const { error: insertError } = await supabase
                        .from("cart_items")
                        .insert([{
                          user_id: user.id,
                          product_id: p.id,
                          qty: qty
                        }]);
                      if (insertError) throw insertError;
                    }

                    toast.success(`${qty} ${p.unit} ${p.name} berhasil ditambahkan ke keranjang!`);
                  } catch (e: any) {
                    console.error("Error adding to cart:", e);
                    toast.error("Gagal menambahkan ke keranjang: " + (e.message || ""));
                  }
                }}
                variant="outline"
                className="flex-1 md:flex-none rounded-full gap-2 font-bold h-11 px-4 sm:px-6 border-border hover:bg-secondary/40"
              >
                <ShoppingCart className="h-4 w-4" /> <span className="hidden sm:inline">Masukkan</span> Keranjang
              </Button>

              <Link
                to="/checkout/$id"
                params={{ id: p.id }}
                search={{ qty }}
                className="flex-1 md:flex-none"
              >
                <Button className="w-full rounded-full gap-2 shadow-soft font-bold h-11 px-4 sm:px-8">
                  <ShoppingBag className="h-4 w-4" /> <span className="hidden sm:inline">Lanjutkan ke</span> Checkout
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}

const colorMap: Record<string, { icon: string; label: string }> = {
  emerald: { icon: "text-emerald-600", label: "text-emerald-700" },
  teal:    { icon: "text-teal-600",    label: "text-teal-700" },
  amber:   { icon: "text-amber-600",   label: "text-amber-700" },
  rose:    { icon: "text-rose-600",    label: "text-rose-700" },
};

function InfoRow({ icon: Icon, label, value, color = "emerald" }: any) {
  const c = colorMap[color] ?? colorMap.emerald;
  return (
    <div className="bg-white border border-border/30 rounded-xl p-3 flex items-center gap-3 shadow-sm">
      <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-secondary/60 ${c.icon}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className={`text-[10px] font-bold uppercase tracking-wider ${c.label}`}>{label}</div>
        <div className="font-semibold text-sm text-foreground truncate mt-0.5">{value}</div>
      </div>
    </div>
  );
}
