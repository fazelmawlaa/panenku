import { supabase } from "@/integrations/supabase/client";

export interface ShippingAddress {
  id: string;
  user_id: string;
  recipient_name: string;
  recipient_phone: string;
  province: string;
  city: string;
  district: string;
  postal_code: string;
  street_address: string;
  details: string | null;
  is_default: boolean;
  created_at: string;
}

// Global flag to remember if table is missing
let useProfileFallback = false;

// Check if error is due to missing shipping_addresses table
function isTableMissingError(error: any): boolean {
  if (!error) return false;
  const msg = String(error.message || "").toLowerCase();
  return (
    error.code === "42P01" || 
    error.code === "PGRST116" ||
    msg.includes("shipping_addresses") || 
    msg.includes("relation") ||
    msg.includes("schema cache")
  );
}

// Fetch all saved addresses
export async function fetchShippingAddresses(userId: string): Promise<ShippingAddress[]> {
  if (useProfileFallback) {
    return fetchFromProfile(userId);
  }

  try {
    const { data, error } = await supabase
      .from("shipping_addresses")
      .select("*")
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      if (isTableMissingError(error)) {
        useProfileFallback = true;
        return fetchFromProfile(userId);
      }
      throw error;
    }
    return (data as ShippingAddress[]) || [];
  } catch (err) {
    console.warn("DB table error, falling back to Profile address JSON", err);
    useProfileFallback = true;
    return fetchFromProfile(userId);
  }
}

// Insert a new address
export async function insertShippingAddress(
  userId: string,
  addr: Omit<ShippingAddress, "id" | "user_id" | "created_at">
): Promise<ShippingAddress> {
  if (useProfileFallback) {
    return insertIntoProfile(userId, addr);
  }

  try {
    const { data: newAddr, error: insertError } = await supabase
      .from("shipping_addresses")
      .insert([{
        user_id: userId,
        recipient_name: addr.recipient_name,
        recipient_phone: addr.recipient_phone,
        province: addr.province,
        city: addr.city,
        district: addr.district,
        postal_code: addr.postal_code,
        street_address: addr.street_address,
        details: addr.details,
        is_default: addr.is_default,
      }])
      .select()
      .single();

    if (insertError) {
      if (isTableMissingError(insertError)) {
        useProfileFallback = true;
        return insertIntoProfile(userId, addr);
      }
      throw insertError;
    }

    const inserted = newAddr as ShippingAddress;

    // If this is default, set others to non-default in DB
    if (inserted.is_default) {
      await supabase
        .from("shipping_addresses")
        .update({ is_default: false })
        .eq("user_id", userId)
        .not("id", "eq", inserted.id);
    }

    return inserted;
  } catch (err) {
    console.warn("DB table error on insert, falling back to Profile address JSON", err);
    useProfileFallback = true;
    return insertIntoProfile(userId, addr);
  }
}

// Set default address
export async function setDefaultShippingAddress(userId: string, addressId: string): Promise<ShippingAddress> {
  if (useProfileFallback) {
    return setDefaultInProfile(userId, addressId);
  }

  try {
    const { data: updated, error: updateError } = await supabase
      .from("shipping_addresses")
      .update({ is_default: true })
      .eq("id", addressId)
      .select()
      .single();

    if (updateError) {
      if (isTableMissingError(updateError)) {
        useProfileFallback = true;
        return setDefaultInProfile(userId, addressId);
      }
      throw updateError;
    }

    // Set others to false
    await supabase
      .from("shipping_addresses")
      .update({ is_default: false })
      .eq("user_id", userId)
      .not("id", "eq", addressId);

    return updated as ShippingAddress;
  } catch (err) {
    console.warn("DB table error on set default, falling back to Profile address JSON", err);
    useProfileFallback = true;
    return setDefaultInProfile(userId, addressId);
  }
}

// Delete an address
export async function deleteShippingAddress(userId: string, addressId: string): Promise<void> {
  if (useProfileFallback) {
    return deleteFromProfile(userId, addressId);
  }

  try {
    const { error } = await supabase
      .from("shipping_addresses")
      .delete()
      .eq("id", addressId);

    if (error) {
      if (isTableMissingError(error)) {
        useProfileFallback = true;
        await deleteFromProfile(userId, addressId);
        return;
      }
      throw error;
    }
  } catch (err) {
    console.warn("DB table error on delete, falling back to Profile address JSON", err);
    useProfileFallback = true;
    await deleteFromProfile(userId, addressId);
  }
}


// --- Cloud Profile Fallback Helpers (Cross-Browser Persistence) ---

async function fetchFromProfile(userId: string): Promise<ShippingAddress[]> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("address, full_name, phone, created_at")
      .eq("id", userId)
      .maybeSingle();

    if (error || !data) return [];

    const addrStr = data.address || "";
    
    // Check if the address column is a serialized JSON array
    if (addrStr.trim().startsWith("[") && addrStr.trim().endsWith("]")) {
      try {
        const list = JSON.parse(addrStr) as ShippingAddress[];
        return list.sort((a, b) => (a.is_default === b.is_default ? 0 : a.is_default ? -1 : 1));
      } catch (parseErr) {
        console.warn("Failed to parse JSON address, falling back to legacy single address format", parseErr);
      }
    }

    // Fallback: If it's a legacy plain text string address, construct a single ShippingAddress
    if (addrStr.trim()) {
      const recipientRegex = /\(Penerima:\s*([^,]+),\s*Telp:\s*([^)]+)\)/;
      const regionRegex = /, Kec\.\s+([^,]+),\s+Kota\s+([^,]+),\s+Prov\.\s+([^,]+),\s+(\d+)/i;

      let extractedName = data.full_name || "Penerima";
      let extractedPhone = data.phone || "";
      let province = "";
      let city = "";
      let district = "";
      let postal_code = "";
      let street_address = addrStr;
      let details: string | null = null;

      const repMatch = addrStr.match(recipientRegex);
      if (repMatch) {
        extractedName = repMatch[1].trim();
        extractedPhone = repMatch[2].trim();
        street_address = street_address.replace(recipientRegex, "").trim();
      }

      const regMatch = street_address.match(regionRegex);
      if (regMatch) {
        district = regMatch[1].trim();
        city = regMatch[2].trim();
        province = regMatch[3].trim();
        postal_code = regMatch[4].trim();
        street_address = street_address.replace(regionRegex, "").trim();
      }

      // Clean up trailing commas in street_address
      street_address = street_address.replace(/,\s*$/, "").trim();

      // If we have details separate, but they were compiled in, we can let details be null since we stripped them
      return [{
        id: "legacy",
        user_id: userId,
        recipient_name: extractedName,
        recipient_phone: extractedPhone,
        province: province,
        city: city,
        district: district,
        postal_code: postal_code,
        street_address: street_address,
        details: details,
        is_default: true,
        created_at: data.created_at || new Date().toISOString()
      }];
    }

    return [];
  } catch (err) {
    console.error("Failed to read profile address", err);
    return [];
  }
}

async function saveToProfile(userId: string, list: ShippingAddress[]): Promise<void> {
  try {
    const serialized = JSON.stringify(list);
    await supabase
      .from("profiles")
      .update({ address: serialized })
      .eq("id", userId);
  } catch (err) {
    console.error("Failed to save addresses to profile", err);
  }
}

async function insertIntoProfile(
  userId: string,
  addr: Omit<ShippingAddress, "id" | "user_id" | "created_at">
): Promise<ShippingAddress> {
  const list = await fetchFromProfile(userId);
  
  const newAddr: ShippingAddress = {
    ...addr,
    id: `cloud-profile-${Math.random().toString(36).substring(2)}-${Date.now()}`,
    user_id: userId,
    created_at: new Date().toISOString()
  };

  if (newAddr.is_default) {
    list.forEach(a => { a.is_default = false; });
  }

  list.push(newAddr);
  await saveToProfile(userId, list);
  return newAddr;
}

async function setDefaultInProfile(userId: string, addressId: string): Promise<ShippingAddress> {
  const list = await fetchFromProfile(userId);
  let target: ShippingAddress | null = null;

  list.forEach(a => {
    if (a.id === addressId) {
      a.is_default = true;
      target = a;
    } else {
      a.is_default = false;
    }
  });

  await saveToProfile(userId, list);
  if (!target) throw new Error("Address not found locally");
  return target;
}

async function deleteFromProfile(userId: string, addressId: string): Promise<void> {
  const list = await fetchFromProfile(userId);
  const filtered = list.filter(a => a.id !== addressId);
  await saveToProfile(userId, filtered);
}
