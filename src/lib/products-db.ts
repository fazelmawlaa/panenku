import { supabase } from "@/integrations/supabase/client";
import { products, type Product } from "@/lib/mock-data";

export function mapDbProductToMock(db: any): Product {
  return {
    id: db.id,
    name: db.name,
    category: db.category,
    type: db.type as any,
    farmer: db.farmer,
    farmerId: db.farmer_id || "mock",
    location: db.location,
    price: Number(db.price),
    unit: db.unit,
    stock: Number(db.stock),
    ordered: db.ordered ? Number(db.ordered) : 0,
    estimatedHarvest: db.estimated_harvest || undefined,
    cultivation: db.cultivation || undefined,
    rating: Number(db.rating),
    reviews: Number(db.reviews),
    image: db.image,
    description: db.description,
  };
}

export async function fetchProductsFromSupabase(includeArchived: boolean = false): Promise<Product[]> {
  // Migrate any leftover localStorage products into the database (one-time)
  try {
    const raw = localStorage.getItem("panenku_custom_products");
    if (raw) {
      const localList: any[] = JSON.parse(raw);
      if (localList.length > 0) {
        for (const p of localList) {
          const dbFormat = {
            id: p.id,
            name: p.name,
            category: p.category,
            type: p.type,
            farmer: p.farmer,
            farmer_id: p.farmerId || p.farmer_id || null,
            location: p.location,
            price: p.price,
            unit: p.unit,
            stock: p.stock,
            ordered: p.ordered || 0,
            estimated_harvest: p.estimatedHarvest || p.estimated_harvest || null,
            cultivation: p.cultivation || null,
            rating: p.rating || 5.0,
            reviews: p.reviews || 0,
            image: p.image,
            description: p.description,
          };
          // Upsert: insert if not exists, ignore duplicates
          await supabase.from("products").upsert([dbFormat], { onConflict: "id", ignoreDuplicates: true });
        }
        // Clear localStorage after successful migration
        localStorage.removeItem("panenku_custom_products");
        console.log("Migrated", localList.length, "localStorage products to Supabase and cleared local cache.");
      }
    }
  } catch (e) {
    console.warn("localStorage product migration attempt:", e);
  }

  // Perform quick database cleanup of any mock products (null farmer_id)
  try {
    await supabase.from("products").delete().is("farmer_id", null);
  } catch (e) { /* ignore */ }

  // Fetch ALL products from Supabase database (single source of truth)
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Table 'products' query error:", error);
      return [];
    }

    if (!data) return [];

    const dbProducts = data.map(mapDbProductToMock);

    if (!includeArchived) {
      // Filter out archived products (stock === 0 as archive indicator)
      return dbProducts.filter((p: Product) => p.stock > 0);
    }

    return dbProducts;
  } catch (err) {
    console.error("fetchProductsFromSupabase error:", err);
    return [];
  }
}

async function seedMockProducts() {
  try {
    const dbFormat = products.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      type: p.type,
      farmer: p.farmer,
      farmer_id: null,
      location: p.location,
      price: p.price,
      unit: p.unit,
      stock: p.stock,
      ordered: p.ordered || 0,
      estimated_harvest: p.estimatedHarvest || null,
      cultivation: p.cultivation || null,
      rating: p.rating,
      reviews: p.reviews,
      image: p.image,
      description: p.description,
    }));

    const { error } = await supabase.from("products").insert(dbFormat);
    if (error) console.error("Error seeding products to Supabase:", error);
  } catch (err) {
    console.error("seedMockProducts exception:", err);
  }
}

export async function fetchProductDetail(id: string): Promise<{ product: Product; farmerProfile?: any }> {
  try {
    const { data: dbProduct, error: pError } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (pError || !dbProduct) {
      throw new Error("Product not found");
    }

    const product = mapDbProductToMock(dbProduct);

    // Fetch matching farmer profile dynamically if farmer_id exists
    if (dbProduct.farmer_id) {
      const { data: profile, error: fError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", dbProduct.farmer_id)
        .maybeSingle();

      if (profile && !fError) {
        product.farmer = profile.full_name || product.farmer;
        product.location = profile.address || product.location;
        return { product, farmerProfile: profile };
      }
    }

    return { product };
  } catch (err) {
    console.error("fetchProductDetail error:", err);
    throw err;
  }
}

export async function saveProductToSupabase(productData: {
  name: string;
  category: string;
  type: string;
  farmer: string;
  farmer_id: string;
  location: string;
  price: number;
  unit: string;
  stock: number;
  description: string;
  image: string;
  estimated_harvest?: string | null;
  cultivation?: string | null;
}): Promise<void> {
  const { error } = await supabase.from("products").insert([productData]);
  if (error) {
    console.error("Supabase products insert error:", error);
    throw new Error("Gagal menyimpan produk ke database: " + error.message);
  }
}

export async function fetchReviewsForProduct(productId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from("product_reviews")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Table 'product_reviews' does not exist yet. Returning empty reviews.", error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error("fetchReviewsForProduct error:", err);
    return [];
  }
}

export async function insertReviewToSupabase(
  productId: string,
  userId: string,
  userName: string,
  rating: number,
  comment: string
): Promise<void> {
  const { error } = await supabase
    .from("product_reviews")
    .insert([
      {
        product_id: productId,
        user_id: userId,
        user_name: userName,
        rating,
        comment,
      }
    ]);
  if (error) throw error;

  // Increment review count and recalculate average rating in Supabase
  try {
    const { data: currentProduct } = await supabase
      .from("products")
      .select("rating, reviews")
      .eq("id", productId)
      .maybeSingle();

    if (currentProduct) {
      const newCount = (currentProduct.reviews || 0) + 1;
      const newRating = Number((( (Number(currentProduct.rating || 5.0) * (currentProduct.reviews || 0)) + rating ) / newCount).toFixed(1));
      
      await supabase
        .from("products")
        .update({ rating: newRating, reviews: newCount })
        .eq("id", productId);
    }
  } catch (err) {
    console.error("Error updating product rating stats in database:", err);
  }
}

// ==========================================
// SUPABASE ORDERS & TRANSACTIONS MANAGEMENT
// ==========================================

export async function fetchCustomerOrders(userId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Orders table does not exist or connection failed. Returning empty orders.", error);
      return [];
    }

    if (data && data.length > 0) {
      return data;
    }

    // Seed mock orders for new user history
    console.log("No orders in Supabase. Auto-seeding mock orders for current user...");
    await seedMockOrders(userId);

    const { data: seeded } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    return seeded || [];
  } catch (err) {
    console.error("fetchCustomerOrders error:", err);
    return [];
  }
}

export async function fetchFarmerOrders(farmerId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("farmer_id", farmerId)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Orders table does not exist or connection failed. Returning empty orders.", error);
      return [];
    }

    if (data && data.length > 0) {
      return data;
    }

    // Seed mock orders for farmer dashboard view
    console.log("No orders in Supabase. Auto-seeding mock orders for farmer ID...");
    await seedMockOrders(farmerId, true);

    const { data: seeded } = await supabase
      .from("orders")
      .select("*")
      .eq("farmer_id", farmerId)
      .order("created_at", { ascending: false });

    return seeded || [];
  } catch (err) {
    console.error("fetchFarmerOrders error:", err);
    return [];
  }
}

export async function placeOrderInSupabase(order: {
  id: string;
  user_id: string;
  product_id: string;
  product_name: string;
  qty: string;
  total: number;
  status: string;
  date: string;
  farmer_id: string | null;
  shipping_address: string;
  buyer_name: string;
  buyer_phone: string;
}): Promise<void> {
  const { error } = await supabase.from("orders").insert([order]);
  if (error) throw error;
}

export async function updateOrderStatusInSupabase(orderId: string, status: string): Promise<void> {
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);
  if (error) throw error;
}

export async function fetchOrderDetail(orderId: string): Promise<any | null> {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .maybeSingle();
    return data;
  } catch (err) {
    console.error("fetchOrderDetail error:", err);
    return null;
  }
}

async function seedMockOrders(userId: string, isFarmer: boolean = false) {
  try {
    const mockDbOrders = [
      {
        id: "ORD-2401",
        user_id: isFarmer ? "00000000-0000-0000-0000-000000000000" : userId,
        product_id: "p1",
        product_name: "Beras Pandan Wangi",
        qty: "10 kg",
        total: 145000,
        status: "Sedang Panen",
        date: "12 Jun 2026",
        farmer_id: isFarmer ? userId : "00000000-0000-0000-0000-000000000000",
        shipping_address: "Cianjur, Jawa Barat",
        buyer_name: "Andi Pratama",
        buyer_phone: "08123456789"
      },
      {
        id: "ORD-2398",
        user_id: isFarmer ? "00000000-0000-0000-0000-000000000000" : userId,
        product_id: "p3",
        product_name: "Tomat Cherry Segar",
        qty: "3 kg",
        total: 66000,
        status: "Selesai",
        date: "08 Jun 2026",
        farmer_id: isFarmer ? userId : "00000000-0000-0000-0000-000000000000",
        shipping_address: "Lembang, Bandung",
        buyer_name: "Andi Pratama",
        buyer_phone: "08123456789"
      },
      {
        id: "ORD-2389",
        user_id: isFarmer ? "00000000-0000-0000-0000-000000000000" : userId,
        product_id: "p2",
        product_name: "Kopi Arabika Gayo",
        qty: "2 kg",
        total: 190000,
        status: "Pengiriman",
        date: "05 Jun 2026",
        farmer_id: isFarmer ? userId : "00000000-0000-0000-0000-000000000000",
        shipping_address: "Aceh Tengah",
        buyer_name: "Andi Pratama",
        buyer_phone: "08123456789"
      },
      {
        id: "ORD-2375",
        user_id: isFarmer ? "00000000-0000-0000-0000-000000000000" : userId,
        product_id: "w1",
        product_name: "Sekam Padi",
        qty: "50 kg",
        total: 75000,
        status: "Diproses",
        date: "02 Jun 2026",
        farmer_id: isFarmer ? userId : "00000000-0000-0000-0000-000000000000",
        shipping_address: "Cianjur",
        buyer_name: "Andi Pratama",
        buyer_phone: "08123456789"
      }
    ];

    await supabase.from("orders").insert(mockDbOrders);
  } catch (err) {
    console.error("seedMockOrders exception:", err);
  }
}

// Query active farmers who have posted products in Supabase
export async function fetchRegisteredFarmers(): Promise<any[]> {
  try {
    const { data: dbProducts, error: pError } = await supabase
      .from("products")
      .select("farmer_id, farmer, location, image");
    
    if (pError) throw pError;
    
    const uniqueFarmersMap = new Map<string, any>();
    
    dbProducts?.forEach((p: any) => {
      const name = p.farmer || "Petani Mitra";
      const id = p.farmer_id || name; // Use farmer name as ID if no farmer_id is set (for seeded products)
      
      if (!uniqueFarmersMap.has(id)) {
        uniqueFarmersMap.set(id, {
          id: id,
          name: name,
          location: p.location || "Indonesia",
          image: p.image || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
          commodity: "Sayuran",
          commodities: ["Sayuran"]
        });
      }
    });
    
    const farmersList = Array.from(uniqueFarmersMap.values());
    
    // Resolve registered profiles details
    const resolvedFarmers = await Promise.all(
      farmersList.map(async (f) => {
        if (f.id && f.id.length > 20 && f.id !== f.name) { // Valid UUID checks
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", f.id)
            .maybeSingle();
          if (profile) {
            return {
              ...f,
              name: profile.full_name || f.name,
              location: profile.address || f.location
            };
          }
        }
        return f;
      })
    );
    
    return resolvedFarmers;
  } catch (err) {
    console.error("fetchRegisteredFarmers error:", err);
    return [];
  }
}

export async function deleteProductFromSupabase(id: string): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) {
    console.error("Supabase products delete error:", error);
    throw new Error("Gagal menghapus produk dari database.");
  }
}

export async function archiveProductInSupabase(id: string): Promise<void> {
  const { error } = await supabase
    .from("products")
    .update({ stock: 0 })
    .eq("id", id);
  if (error) {
    console.error("Supabase products archive error:", error);
    throw new Error("Gagal mengarsipkan produk.");
  }
}

export async function updateProductInSupabase(id: string, updatedFields: {
  name: string;
  category: string;
  price: number;
  stock: number;
  unit: string;
  cultivation: string;
  description: string;
}): Promise<void> {
  const dbFormat = {
    name: updatedFields.name,
    category: updatedFields.category.charAt(0).toUpperCase() + updatedFields.category.slice(1),
    price: updatedFields.price,
    stock: updatedFields.stock,
    unit: updatedFields.unit,
    cultivation: updatedFields.cultivation,
    description: updatedFields.description,
  };
  const { error } = await supabase
    .from("products")
    .update(dbFormat)
    .eq("id", id);
    
  if (error) {
    console.error("Supabase products update error:", error);
    throw new Error("Gagal memperbarui produk di database.");
  }
}

export async function deductProductStock(productId: string, qty: number): Promise<void> {
  // Deduct stock in Supabase products table
  try {
    const { data: current, error: fetchErr } = await supabase
      .from("products")
      .select("stock")
      .eq("id", productId)
      .maybeSingle();

    if (!fetchErr && current) {
      const currentStock = Number(current.stock || 0);
      const newStock = Math.max(0, currentStock - qty);
      
      const { error: updateErr } = await supabase
        .from("products")
        .update({ stock: newStock })
        .eq("id", productId);
        
      if (updateErr) {
        console.warn("Supabase stock deduction update failed:", updateErr);
      } else {
        console.log("Stock deducted in Supabase:", productId, newStock);
      }
    }
  } catch (err) {
    console.warn("Supabase stock deduction exception:", err);
  }
}

export async function restoreProductFromArchive(id: string): Promise<void> {
  // Restore stock to 1 in database to un-archive
  const { error } = await supabase
    .from("products")
    .update({ stock: 1 })
    .eq("id", id);
  if (error) {
    console.error("Supabase restore from archive error:", error);
    throw new Error("Gagal memulihkan produk dari arsip.");
  }
}
