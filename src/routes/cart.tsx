import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { formatRupiah, type Product } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Trash2, Tag, ShoppingBag, Loader2 } from "lucide-react";
import { fetchProductsFromSupabase } from "@/lib/products-db";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Keranjang — RumohTani" }] }),
  component: Cart,
});

function Cart() {
  const { user } = useAuth();
  const [items, setItems] = useState<{ id: string; product_id: string; qty: number }[]>([]);
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCartData = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const productsData = await fetchProductsFromSupabase();
      setDbProducts(productsData || []);

      const { data, error } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data && !error) {
        setItems(data);
      }
    } catch (err) {
      console.error("Error loading cart:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCartData();
  }, [user]);

  const list = useMemo(() => {
    return items
      .map((i) => {
        const match = dbProducts.find((p) => p.id === i.product_id);
        if (!match) return null;
        return { ...match, qty: i.qty, cartItemId: i.id };
      })
      .filter(Boolean) as (Product & { qty: number; cartItemId: string })[];
  }, [items, dbProducts]);

  const subtotal = useMemo(() => {
    return list.reduce((s: number, p: Product & { qty: number }) => s + p.price * p.qty, 0);
  }, [list]);

  const shipping = 25000;
  const total = subtotal + shipping;

  const setQty = async (productId: string, q: number) => {
    if (!user) return;
    const safeQty = Math.max(1, q);
    
    // Optimistic UI update
    setItems(prev => prev.map(item => item.product_id === productId ? { ...item, qty: safeQty } : item));

    try {
      await supabase
        .from("cart_items")
        .update({ qty: safeQty })
        .eq("user_id", user.id)
        .eq("product_id", productId);
    } catch (err) {
      console.error("Error updating cart quantity:", err);
    }
  };

  const remove = async (productId: string) => {
    if (!user) return;

    // Optimistic UI update
    setItems(prev => prev.filter(item => item.product_id !== productId));

    try {
      await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId);
    } catch (err) {
      console.error("Error removing cart item:", err);
      // Rollback
      loadCartData();
    }
  };

  const groups: Record<string, (Product & { qty: number; cartItemId: string })[]> = { 
    preorder: [], 
    ready: [], 
    waste: [], 
    tools: [] 
  };
  list.forEach((p: Product & { qty: number; cartItemId: string }) => {
    const typeKey = p.type === "tools" ? "tools" : p.type;
    if (!groups[typeKey]) {
      groups[typeKey] = [];
    }
    groups[typeKey].push(p);
  });

  return (
    <CustomerLayout>
      <div className="mx-auto max-w-full px-4 sm:px-8 md:px-12 py-8">
        <h1 className="font-display text-3xl font-bold mb-6">Keranjang Belanja</h1>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-light">Memuat keranjang belanja...</p>
          </div>
        ) : list.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center bg-white border border-border/30">
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-4">Keranjang kosong</p>
            <Link to="/products"><Button className="rounded-full">Mulai Belanja</Button></Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_380px] gap-6 text-left">
            <div className="space-y-5">
              {(["preorder", "ready", "waste", "tools"] as const).map((key) => groups[key] && groups[key].length > 0 && (
                <div key={key} className="glass-card rounded-2xl p-5 bg-white border border-border/30 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge className={
                      key === "preorder" ? "bg-primary/10 text-primary border-primary/20" :
                      key === "ready" ? "bg-honey/15 text-foreground border-honey/30" :
                      key === "tools" ? "bg-blue-500/10 text-blue-800 border-blue-500/20" :
                      "bg-earth/10 text-earth border-earth/20"
                    }>
                      {key === "preorder" ? "Pre-Order" : key === "ready" ? "Ready Stock" : key === "tools" ? "Alat Tani" : "Limbah Pertanian"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{groups[key].length} item</span>
                  </div>
                  <div className="space-y-4">
                    {groups[key].map((p: any) => (
                      <div key={p.id} className="flex flex-wrap items-center gap-4 pb-4 border-b last:border-0 border-border/60">
                        <img src={p.image} className="h-20 w-20 rounded-xl object-cover border border-border/20 shadow-sm" alt={p.name} />
                        <div className="flex-1 min-w-[140px]">
                          <Link to="/products/$id" params={{ id: p.id }} className="font-semibold hover:text-primary transition">{p.name}</Link>
                          <div className="text-xs text-muted-foreground">{p.farmer} · {p.location}</div>
                          <div className="text-primary font-bold mt-1">{formatRupiah(p.price)} / {p.unit}</div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="outline" size="icon" className="rounded-full h-8 w-8" onClick={() => setQty(p.id, p.qty - 1)}>−</Button>
                          <span className="w-10 text-center font-semibold">{p.qty}</span>
                          <Button variant="outline" size="icon" className="rounded-full h-8 w-8" onClick={() => setQty(p.id, p.qty + 1)}>+</Button>
                        </div>
                        <div className="font-bold w-24 text-right">{formatRupiah(p.price * p.qty)}</div>
                        <button onClick={() => remove(p.id)} className="text-muted-foreground hover:text-destructive transition"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Order summary */}
            <div className="glass-card rounded-2xl p-5 bg-white border border-border/30 shadow-sm h-fit space-y-4">
              <h2 className="font-display font-bold text-lg border-b border-border/25 pb-3">Ringkasan Belanja</h2>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ongkos Kirim</span>
                  <span className="font-semibold">{formatRupiah(shipping)}</span>
                </div>
                <div className="flex justify-between border-t pt-3 font-bold text-base">
                  <span>Total Harga</span>
                  <span className="text-primary">{formatRupiah(total)}</span>
                </div>
              </div>

              {/* Promo code */}
              <div className="flex gap-2 pt-2">
                <Input placeholder="Kode promo" className="rounded-xl h-10 border-border/50 text-xs" />
                <Button variant="outline" className="rounded-xl h-10 px-4 font-bold text-xs"><Tag className="h-4 w-4 mr-1" /> Pakai</Button>
              </div>

              {/* Checkout link button */}
              <div className="pt-2">
                {list.length > 0 && (
                  <Link to="/checkout/$id" params={{ id: list[0].id }} search={{ qty: list[0].qty }}>
                    <Button className="w-full rounded-full py-6 font-bold shadow-soft">Lanjut ke Checkout</Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
