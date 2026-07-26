import { supabase } from "@/integrations/supabase/client";
import { type Product } from "@/lib/mock-data";

export function mapDbProductToMock(db: any): Product {
  let payMethodsStr = db.payment_methods || "";
  let cleanDescription = db.description || "";
  
  if (cleanDescription) {
    const metaRegex = /\[METADATA:\s*([^\]]+)\]/;
    const match = cleanDescription.match(metaRegex);
    if (match) {
      try {
        const metadata = JSON.parse(match[1]);
        if (metadata.payment_methods) payMethodsStr = metadata.payment_methods;
      } catch (e) {}
      cleanDescription = cleanDescription.replace(metaRegex, "").trim();
    } else {
      const oldRegex = /\[PAYMENT_METHODS:\s*([^\]]+)\]/;
      const oldMatch = cleanDescription.match(oldRegex);
      if (oldMatch) {
        payMethodsStr = oldMatch[1].trim();
        cleanDescription = cleanDescription.replace(oldRegex, "").trim();
      }
    }
  }

  const dbStock = Number(db.stock || 0);
  const dbOrdered = Number(db.ordered || 0);
  const initialStock = dbStock + dbOrdered;

  let cleanLocation = db.location || "Indonesia";
  if (cleanLocation && cleanLocation.trim().startsWith("{")) {
    try {
      const parsed = JSON.parse(cleanLocation);
      cleanLocation = parsed.addressText || "Indonesia";
    } catch (e) {}
  }

  return {
    id: db.id,
    name: db.name,
    category: db.category,
    type: db.type as any,
    farmer: db.farmer,
    farmerId: db.farmer_id || "mock",
    location: cleanLocation,
    price: Number(db.price),
    unit: db.unit,
    stock: initialStock,
    ordered: dbOrdered,
    estimatedHarvest: db.estimated_harvest || undefined,
    cultivation: db.cultivation || undefined,
    rating: Number(db.rating),
    reviews: Number(db.reviews),
    image: db.image,
    description: cleanDescription,
    paymentMethods: payMethodsStr 
      ? payMethodsStr.split(",").map((m: string) => m.split(":")[0]) 
      : ["ewallet", "va", "card"],
    paymentAccounts: payMethodsStr 
      ? payMethodsStr.split(",").reduce((acc: Record<string, string>, m: string) => {
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

    // Filter out consultation products from marketplace catalog
    const dbProducts = data
      .map(mapDbProductToMock)
      .filter((p: Product) => p.type !== "consultation");

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

        // Parse profile.address if it is a JSON config to extract clean location text
        if (profile.address && profile.address.trim().startsWith("{")) {
          try {
            const addrConfig = JSON.parse(profile.address);
            product.location = addrConfig.addressText || product.location;
          } catch (e) {
            product.location = product.location; // keep original
          }
        } else if (profile.address) {
          product.location = profile.address;
        }

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
  const metadata = {
    payment_methods: productData.payment_methods || ""
  };
  const enrichedDescription = `${productData.description}\n\n[METADATA: ${JSON.stringify(metadata)}]`;

  const { payment_methods, description, ...rest } = productData;
  const { error } = await supabase.from("products").insert([{
    ...rest,
    description: enrichedDescription,
    ordered: 0
  }]);

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

export async function fetchRegisteredFarmers(): Promise<any[]> {
  try {
    // Primary source: products table with type='consultation' (publicly readable, no RLS block).
    // This table is populated when a farmer saves their consultation settings.
    const { data: consultProducts, error: prodError } = await supabase
      .from("products")
      .select("farmer_id, farmer, name, price, description, location, stock, cultivation, image")
      .eq("type", "consultation");

    console.log("Consultation products from DB:", consultProducts, "error:", prodError);

    if (prodError) {
      console.warn("Error querying consultation products:", prodError);
      return [];
    }

    if (!consultProducts || consultProducts.length === 0) return [];

    // Get unique farmer_ids
    const farmerIds = [...new Set(consultProducts.map((p: any) => p.farmer_id).filter(Boolean))];

    // Try to enrich with profiles (may be blocked by RLS for some users — non-fatal)
    let profilesMap: Record<string, any> = {};
    try {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, address, avatar_url, experience")
        .in("id", farmerIds);

      if (profiles) {
        profiles.forEach((p: any) => { profilesMap[p.id] = p; });
      }
    } catch (_) {
      // RLS may block this — we fall back to products data only
    }

    const mentors: any[] = [];

    farmerIds.forEach((farmerId: string) => {
      const product = consultProducts.find((p: any) => p.farmer_id === farmerId);
      if (!product) return;

      const prof = profilesMap[farmerId];

      // Start with defaults from the consultation product
      let parsedAddressText = product.location || "Indonesia";
      let price = product.price || 75000;
      let specialty = product.description || "Spesialis Budidaya";
      let experience = "1 tahun";
      let satisfaction = "99%";
      let isOpen = (product.stock || 0) > 0;
      let payments = ["BCA", "Mandiri", "DANA"];
      let bankDetails = { name: "BCA", number: "", holder: product.farmer || "Petani Mentor" };
      let paymentDetails = {};
      let farmerName = product.farmer || "Petani Mentor";

      let productAvatar = product.image;
      let profileAvatar = "";

      // 1. Read config from product.cultivation JSON string (Always available publicly)
      if (product.cultivation && product.cultivation.trim().startsWith("{")) {
        try {
          const parsed = JSON.parse(product.cultivation);
          parsedAddressText = parsed.addressText || parsedAddressText;
          price = parsed.rate || price;
          specialty = parsed.expertise || specialty;
          experience = parsed.experienceYears ? `${parsed.experienceYears} tahun` : experience;
          isOpen = parsed.isOpenForConsultation !== undefined ? parsed.isOpenForConsultation : isOpen;
          payments = parsed.payments || payments;
          bankDetails = parsed.bankDetails || bankDetails;
          paymentDetails = parsed.paymentDetails || {};
          if (parsed.avatar_url) productAvatar = parsed.avatar_url;
        } catch (_) {}
      } 
      // 2. Fallback to profile address JSON if available and product.cultivation was empty
      else if (prof?.address && prof.address.trim().startsWith("{")) {
        try {
          const parsed = JSON.parse(prof.address);
          parsedAddressText = parsed.addressText || parsedAddressText;
          price = parsed.rate || price;
          specialty = parsed.expertise || specialty;
          experience = parsed.experienceYears ? `${parsed.experienceYears} tahun` : experience;
          isOpen = parsed.isOpenForConsultation !== undefined ? parsed.isOpenForConsultation : isOpen;
          payments = parsed.payments || payments;
          bankDetails = parsed.bankDetails || bankDetails;
          paymentDetails = parsed.paymentDetails || {};
          if (parsed.avatar_url) profileAvatar = parsed.avatar_url;
        } catch (_) {}
      }

      if (prof?.full_name) farmerName = prof.full_name;
      if (prof?.experience && !experience) {
        experience = prof.experience.includes("tahun") ? prof.experience : `${prof.experience} tahun`;
      }

      // Determine real profile image
      let realAvatar = productAvatar;
      if (!realAvatar && prof?.address && prof.address.trim().startsWith("{")) {
        try {
          const parsed = JSON.parse(prof.address);
          if (parsed.avatar_url) realAvatar = parsed.avatar_url;
        } catch (_) {}
      }
      if (!realAvatar && prof?.avatar_url) realAvatar = prof.avatar_url;
      if (!realAvatar) {
        realAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(farmerName)}`;
      }

      mentors.push({
        id: farmerId,
        name: farmerName,
        location: parsedAddressText,
        image: realAvatar,
        specialty,
        experience,
        satisfaction,
        price,
        isOpenForConsultation: isOpen,
        payments,
        bankDetails,
        paymentDetails,
        bioText: specialty
      });
    });

    console.log("Mapped mentors:", mentors.length);
    return mentors;
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
  let existingPaymentMethods = updatedFields.payment_methods || "";

  try {
    const { data: current } = await supabase
      .from("products")
      .select("description")
      .eq("id", id)
      .maybeSingle();

    if (current?.description) {
      const metaRegex = /\[METADATA:\s*([^\]]+)\]/;
      const match = current.description.match(metaRegex);
      if (match) {
        try {
          const parsed = JSON.parse(match[1]);
          if (parsed.payment_methods && !updatedFields.payment_methods) {
            existingPaymentMethods = parsed.payment_methods;
          }
        } catch (e) {}
      }
    }
  } catch (e) {
    console.warn("Failed to fetch/parse current product metadata during update", e);
  }

  // If farmer updated the stock quantity, we reset the ordered count to 0
  let newOrdered = undefined;
  try {
    const { data: dbProd } = await supabase.from("products").select("stock").eq("id", id).maybeSingle();
    if (dbProd && Number(dbProd.stock) !== updatedFields.stock) {
      newOrdered = 0;
    }
  } catch (e) {}

  const metadata = {
    payment_methods: existingPaymentMethods
  };
  const enrichedDescription = `${updatedFields.description}\n\n[METADATA: ${JSON.stringify(metadata)}]`;

  const dbFormat: any = {
    name: updatedFields.name,
    category: updatedFields.category.charAt(0).toUpperCase() + updatedFields.category.slice(1),
    price: updatedFields.price,
    stock: updatedFields.stock,
    unit: updatedFields.unit,
    cultivation: updatedFields.cultivation,
    description: enrichedDescription,
  };
  if (newOrdered !== undefined) {
    dbFormat.ordered = newOrdered;
  }

  const { error } = await supabase
    .from("products")
    .update(dbFormat)
    .eq("id", id);

  if (error) {
    if (error.code === "P0012" || error.message.includes("payment_methods")) {
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
  // Deduct stock and increment ordered in Supabase products table
  try {
    const { data: current, error: fetchErr } = await supabase
      .from("products")
      .select("stock, ordered")
      .eq("id", productId)
      .maybeSingle();

    if (!fetchErr && current) {
      const currentStock = Number(current.stock || 0);
      const currentOrdered = Number(current.ordered || 0);
      
      const newStock = Math.max(0, currentStock - qty);
      const newOrdered = currentOrdered + qty;
      
      const { error: updateErr } = await supabase
        .from("products")
        .update({ 
          stock: newStock,
          ordered: newOrdered
        })
        .eq("id", productId);
        
      if (updateErr) {
        console.warn("Supabase stock deduction update failed:", updateErr);
      } else {
        console.log("Stock deducted in Supabase:", productId, newStock, newOrdered);
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
