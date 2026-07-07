import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { formatRupiah } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  MapPin, Star, Sprout, MessageCircle, ShoppingBag, Calendar, 
  Leaf, Award, Shield, QrCode, Minus, Plus, ShoppingCart, Loader2 
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
      { title: `${loaderData?.product?.name ?? "Produk"} — RumohTani` },
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
      <div className="mx-auto max-w-full px-4 sm:px-8 md:px-12 py-8 text-left">
        <div className="text-xs text-muted-foreground mb-4 select-none">
          <Link to="/products" className="hover:text-foreground">Katalog</Link> / {p.category} / <span className="text-foreground">{p.name}</span>
        </div>

        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-8">
          {/* Gallery - Single Image */}
          <div>
            <div className="aspect-square rounded-[2rem] overflow-hidden glass-card border border-border/20 shadow-sm">
              <img src={p.image} alt={p.name} className="h-full w-full object-cover animate-in fade-in duration-300" />
            </div>
          </div>

          {/* Info */}
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-primary/10 text-primary border-primary/20">{p.category}</Badge>
              {p.type === "preorder" && <Badge className="bg-honey/15 text-foreground border-honey/30">Pre-Order</Badge>}
              {p.type === "waste" && <Badge className="bg-earth/10 text-earth border-earth/20">Limbah Pertanian</Badge>}
              {p.type === "tools" && <Badge className="bg-blue-500/10 text-blue-700 border-blue-500/20">Alat Tani</Badge>}
              <Badge variant="outline" className="gap-1"><Shield className="h-3 w-3" /> Petani Terverifikasi</Badge>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground leading-tight">{p.name}</h1>
            
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-honey text-honey" /> 
                {p.rating} 
                <span className="text-muted-foreground">({p.reviews} ulasan)</span>
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" /> {p.location}
              </span>
            </div>

            <div className="glass-card rounded-2xl p-5">
              <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Harga</div>
              <div className="font-display text-4xl font-bold text-primary mt-1">{formatRupiah(p.price)}</div>
              <div className="text-xs text-muted-foreground mt-0.5">per {p.unit}</div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <InfoRow icon={Sprout} label="Petani" value={p.farmer} />
              <InfoRow icon={Leaf} label="Metode" value={p.cultivation ?? "—"} />
              <InfoRow icon={Calendar} label="Estimasi Panen" value={p.estimatedHarvest ?? "Siap kirim"} />
              <InfoRow icon={Award} label="Stok" value={`${p.stock} ${p.unit}`} />
            </div>

            {p.type === "preorder" && p.ordered !== undefined && (
              <div className="glass-card rounded-2xl p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">{p.ordered} {p.unit} terpesan</span>
                  <span className="text-muted-foreground">dari {p.stock} {p.unit}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full gradient-leaf" style={{ width: `${(p.ordered / p.stock) * 100}%` }} />
                </div>
              </div>
            )}

            <p className="text-sm text-foreground/80 leading-relaxed font-light">{p.description}</p>

            {/* Quantity Selector Panel */}
            <div className="flex items-center justify-between border-t border-b border-border/20 py-4 select-none">
              <span className="text-xs font-bold text-muted-foreground uppercase">Jumlah Pembelian ({p.unit})</span>
              <div className="flex items-center gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon" 
                  className="h-9 w-9 rounded-lg"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  disabled={qty <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-lg w-8 text-center">{qty}</span>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon" 
                  className="h-9 w-9 rounded-lg"
                  onClick={() => setQty(qty + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Real-time Subtotal Preview */}
            <div className="flex justify-between items-center bg-secondary/50 p-4 rounded-2xl border border-border/10 text-sm">
              <span className="font-semibold text-muted-foreground">Subtotal Belanja</span>
              <span className="font-black text-primary text-lg">{formatRupiah(p.price * qty)}</span>
            </div>

            {/* Action Buttons: Add to Cart / Checkout */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button 
                onClick={async () => {
                  if (!user) {
                    toast.info("Silakan masuk terlebih dahulu untuk menggunakan keranjang belanja");
                    return;
                  }
                  try {
                    // Check if product is already in database cart_items
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
                size="lg" 
                variant="outline" 
                className="flex-1 rounded-full gap-2 font-bold"
              >
                <ShoppingCart className="h-4 w-4" /> Masukkan Keranjang
              </Button>
              
              <Link 
                to="/checkout/$id" 
                params={{ id: p.id }} 
                search={{ qty }}
                className="flex-1"
              >
                <Button size="lg" className="w-full rounded-full gap-2 shadow-soft font-bold">
                  <ShoppingBag className="h-4 w-4" /> Lanjutkan ke Checkout
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground pt-4 border-t border-border/60">
              <QrCode className="h-4 w-4" /> Traceability QR tersedia · Sustainability Score: <span className="font-semibold text-primary">A+</span>
            </div>
          </div>
        </div>

        {/* REVIEWS & RATINGS SECTION */}
        <section className="mt-16 border-t border-border/20 pt-10 grid md:grid-cols-[1fr_320px] gap-10">
          <div className="space-y-6">
            <h2 className="font-display text-2xl font-bold flex items-center gap-2 text-foreground">
              <span>⭐</span> Ulasan Pengguna ({reviewsList.length} Ulasan)
            </h2>
            
            {loadingReviews ? (
              <div className="flex items-center gap-2 text-muted-foreground text-xs font-light">
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

          {/* Submit Review Form */}
          <div className="h-fit">
            <div className="bg-white border border-border/40 rounded-3xl p-6 shadow-sm space-y-4 text-left">
              <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-sm text-foreground">Tulis Ulasan Anda</h3>
              {isLoggedIn ? (
                <form onSubmit={handleSendReview} className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Beri Bintang</span>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="focus:outline-none transition transform active:scale-95"
                        >
                          <Star className={`h-6 w-6 ${newRating >= star ? "fill-honey text-honey" : "text-muted-foreground/30"}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Komentar Ulasan</span>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Bagikan ulasan jujur Anda tentang kesegaran atau kualitas produk ini..."
                      className="w-full min-h-[90px] border border-border/40 bg-[#e9eae6]/15 rounded-xl text-xs p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition text-foreground"
                      required
                    />
                  </div>

                  <Button type="submit" disabled={isSubmittingReview} className="w-full rounded-full font-bold shadow-soft">
                    {isSubmittingReview ? "Mengirim..." : "Kirim Ulasan"}
                  </Button>
                </form>
              ) : (
                <div className="bg-secondary/40 border border-border/20 rounded-2xl p-4 text-xs text-muted-foreground text-center font-light">
                  Silakan <Link to="/login" className="font-bold text-primary hover:underline">Masuk</Link> terlebih dahulu untuk mempublikasikan ulasan produk di database.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </CustomerLayout>
  );
}

function InfoRow({ icon: Icon, label, value }: any) {
  return (
    <div className="glass-card rounded-xl p-3 flex items-center gap-3">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="h-4 w-4" /></div>
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="font-medium truncate">{value}</div>
      </div>
    </div>
  );
}
