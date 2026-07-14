import { supabase } from "@/integrations/supabase/client";
import { type Product } from "@/lib/mock-data";

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
    paymentMethods: db.payment_methods 
      ? db.payment_methods.split(",").map((m: string) => m.split(":")[0]) 
      : ["ewallet", "va", "card"],
    paymentAccounts: db.payment_methods 
      ? db.payment_methods.split(",").reduce((acc: Record<string, string>, m: string) => {
          const [method, account] = m.split(":");
          if (account) acc[method] = account;
          return acc;
        }, {})
      : {},
  };
}

export async function fetchProductsFromSupabase(includeArchived: boolean = false): Promise<Product[]> {
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
      return dbProducts.filter((p: Product) => p.stock > 0);
    }

    return dbProducts;
  } catch (err) {
    console.error("fetchProductsFromSupabase error:", err);
    return [];
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
  payment_methods?: string;
}): Promise<void> {
  const { error } = await supabase.from("products").insert([productData]);
  if (error) {
    if (error.code === "P0012" || error.message.includes("payment_methods")) {
      console.warn("Table does not have 'payment_methods' column. Retrying without it...");
      const { payment_methods, ...rest } = productData;
      const { error: retryError } = await supabase.from("products").insert([rest]);
      if (!retryError) return;
      throw retryError;
    }
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
      console.warn("Orders table query error:", error);
      return [];
    }

    return data || [];
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
      console.warn("Orders table query error:", error);
      return [];
    }

    return data || [];
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

// Query active farmers who have the role 'petani' in Supabase
export async function fetchRegisteredFarmers(): Promise<any[]> {
  try {
    // 1. Fetch user ids that have role 'petani'
    const { data: roleData, error: rError } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "petani");

    if (rError) {
      console.warn("Error querying user roles for petani:", rError);
      return [];
    }

    if (!roleData || roleData.length === 0) {
      return [];
    }

    const userIds = roleData.map(r => r.user_id);

    // 2. Fetch profiles for these users
    const { data: profiles, error: pError } = await supabase
      .from("profiles")
      .select("*")
      .in("id", userIds);

    if (pError) {
      console.warn("Error querying profiles for userIds:", pError);
      return [];
    }

    if (!profiles) return [];

    // 3. Map profiles directly into mentor objects without mock dummy data
    return profiles.map((p: any) => {
      // Parse the address if it is JSON, otherwise keep defaults
      let parsedAddressText = p.address || "Indonesia";
      let price = 75000;
      let specialty = p.focus_area || "Spesialis Budidaya Padi & Pangan";
      let experience = p.experience || "15 tahun";
      let satisfaction = "99%";
      let isOpen = true;
      let payments = ["BCA", "Mandiri", "DANA"];
      let bankDetails = {
        name: "BCA",
        number: "123-456-7890",
        holder: p.full_name || "Petani Mentor"
      };
      let paymentDetails = {};

      try {
        if (p.address && p.address.trim().startsWith("{")) {
          const parsed = JSON.parse(p.address);
          parsedAddressText = parsed.addressText || "Indonesia";
          price = parsed.rate || price;
          specialty = parsed.expertise || specialty;
          experience = parsed.experienceYears ? `${parsed.experienceYears} tahun` : (p.experience || "15 tahun");
          isOpen = parsed.isOpenForConsultation !== undefined ? parsed.isOpenForConsultation : isOpen;
          payments = parsed.payments || payments;
          bankDetails = parsed.bankDetails || bankDetails;
          paymentDetails = parsed.paymentDetails || {};
        } else if (p.bio && p.bio.trim().startsWith("{")) {
          // Backup fallback to bio if bio exists
          const parsed = JSON.parse(p.bio);
          price = parsed.rate || price;
          specialty = parsed.expertise || specialty;
          experience = parsed.experienceYears ? `${parsed.experienceYears} tahun` : (p.experience || "15 tahun");
          isOpen = parsed.isOpenForConsultation !== undefined ? parsed.isOpenForConsultation : isOpen;
          payments = parsed.payments || payments;
          bankDetails = parsed.bankDetails || bankDetails;
          paymentDetails = parsed.paymentDetails || {};
        }
      } catch (e) {
        console.warn("Failed to parse bio/address JSON for farmer:", p.id, e);
      }

      // Format experience if numeric
      if (/^\d+$/.test(experience)) {
        experience = `${experience} tahun`;
      }

      return {
        id: p.id,
        name: p.full_name || "Petani Mentor",
        location: parsedAddressText,
        image: p.avatar_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
        specialty,
        experience,
        satisfaction,
        price,
        isOpenForConsultation: isOpen,
        payments,
        bankDetails,
        paymentDetails,
        bioText: p.bio || parsedAddressText,
        rawProfile: p
      };
    });
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
  payment_methods?: string;
}): Promise<void> {
  const dbFormat: any = {
    name: updatedFields.name,
    category: updatedFields.category.charAt(0).toUpperCase() + updatedFields.category.slice(1),
    price: updatedFields.price,
    stock: updatedFields.stock,
    unit: updatedFields.unit,
    cultivation: updatedFields.cultivation,
    description: updatedFields.description,
  };
  if (updatedFields.payment_methods !== undefined) {
    dbFormat.payment_methods = updatedFields.payment_methods;
  }
  const { error } = await supabase
    .from("products")
    .update(dbFormat)
    .eq("id", id);
    
  if (error) {
    if (error.code === "P0012" || error.message.includes("payment_methods")) {
      console.warn("Table does not have 'payment_methods' column. Retrying update without it...");
      const { payment_methods, ...rest } = dbFormat;
      const { error: retryError } = await supabase
        .from("products")
        .update(rest)
        .eq("id", id);
      if (!retryError) return;
      throw retryError;
    }
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
