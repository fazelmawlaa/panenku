import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { ProductCard } from "@/components/ProductCard";
import { fetchProductsFromSupabase } from "@/lib/products-db";
import { type Product } from "@/lib/mock-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Loader2 } from "lucide-react";

export const Route = createFileRoute("/products")({
  head: () => ({ 
    meta: [
      { title: "Marketplace — RumohTani" }, 
      { name: "description", content: "Temukan hasil panen pre-order, ready stock, limbah tani, dan alat tani berkualitas." }
    ] 
  }),
  component: Catalog,
});

function Catalog() {
  // Check if child route (e.g. details page) is active
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (pathname !== "/products" && pathname !== "/products/") {
    return <Outlet />;
  }

  // Supabase dynamic products state
  const [productList, setProductList] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search query states
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearchQuery, setActiveSearchQuery] = useState("");

  // Product type filter state (Hasil Tani, Limbah Tani, Alat Tani)
  const [selectedType, setSelectedType] = useState("all");

  // Product availability filter state
  const [selectedAvailability, setSelectedAvailability] = useState("all");

  // Sorting state
  const [sortBy, setSortBy] = useState("unggulan");

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      const data = await fetchProductsFromSupabase();
      setProductList(data);
      setIsLoading(false);
    };
    loadProducts();
  }, []);

  // Handle trigger search (Cari button clicked)
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearchQuery(searchQuery);
  };

  // Apply filters and sorting in real-time
  const filteredProducts = useMemo(() => {
    let result = productList.filter((p) => {
      // Search matching
      if (activeSearchQuery && !p.name.toLowerCase().includes(activeSearchQuery.toLowerCase())) {
        return false;
      }
      // Product Type matching
      if (selectedType !== "all") {
        if (selectedType === "hasil" && p.type !== "ready" && p.type !== "preorder") return false;
        if (selectedType === "limbah" && p.type !== "waste") return false;
        if (selectedType === "alat" && p.type !== "tools") return false;
      }
      // Availability matching
      if (selectedAvailability !== "all") {
        if (selectedAvailability === "ready" && p.type !== "ready") return false;
        if (selectedAvailability === "preorder" && p.type !== "preorder") return false;
      }
      return true;
    });

    // Sorting
    if (sortBy === "unggulan") {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "murah") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "mahal") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [productList, activeSearchQuery, selectedType, selectedAvailability, sortBy]);

  return (
    <CustomerLayout>
      {/* Main Page Product Grid Content Container (Aligned with Image 2 Full Width Margins) */}
      <div className="mx-auto max-w-full px-4 sm:px-8 md:px-12 py-8 min-h-screen text-left space-y-6">
        
        {/* Search & Filters Row (stretches to occupy full width, with larger heights) */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4 items-center w-full select-none">
          {/* Left side: Search input stretched dynamically, height h-14 */}
          <div className="flex items-center flex-1 w-full bg-white border border-border/80 rounded-2xl shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-200 h-14">
            <Search className="h-5 w-5 text-muted-foreground ml-4 shrink-0" />
            <input 
              type="text"
              placeholder="Cari produk pertanian..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-full border-none focus:outline-none bg-transparent text-sm md:text-base text-foreground px-4 font-light"
            />
            <button 
              type="submit"
              className="bg-[#60a868] hover:bg-[#529359] text-white font-bold text-sm md:text-base h-full px-8 transition duration-200 shrink-0"
            >
              Cari
            </button>
          </div>

          {/* Right side: Taller dropdowns (h-14) */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto shrink-0 md:justify-end font-sans">
            {/* Filter Product Type (Hasil Tani, Limbah Tani, Alat Tani) */}
            <div className="w-full sm:w-[175px]">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="h-14 rounded-2xl bg-white border border-border/85 hover:bg-secondary/40 text-sm text-foreground/80 transition flex items-center justify-between px-5 font-sans">
                  <SelectValue placeholder="Tipe Produk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tipe</SelectItem>
                  <SelectItem value="hasil">🛒 Hasil Tani</SelectItem>
                  <SelectItem value="limbah">♻️ Limbah Tani</SelectItem>
                  <SelectItem value="alat">🛠️ Alat Tani</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filter availability/ketersediaan */}
            <div className="w-full sm:w-[210px]">
              <Select value={selectedAvailability} onValueChange={setSelectedAvailability}>
                <SelectTrigger className="h-14 rounded-2xl bg-white border border-border/85 hover:bg-secondary/40 text-sm text-foreground/80 transition flex items-center justify-between px-5 font-sans">
                  <SelectValue placeholder="Ketersediaan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Ketersediaan</SelectItem>
                  <SelectItem value="ready">Ready Stock</SelectItem>
                  <SelectItem value="preorder">Pre-Order</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort dropdown */}
            <div className="w-full sm:w-[160px]">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-14 rounded-2xl bg-white border border-border/85 hover:bg-secondary/40 text-sm text-foreground/80 transition flex items-center justify-between px-5 font-sans">
                  <SelectValue placeholder="Urutkan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unggulan">Terpopuler</SelectItem>
                  <SelectItem value="murah">Harga Terendah</SelectItem>
                  <SelectItem value="mahal">Harga Tertinggi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </form>

        {/* Counter Display */}
        <div className="text-xs text-muted-foreground/80 font-light flex items-center gap-1.5 pl-1 select-none">
          <span>📦</span>
          <span>Menampilkan <b>{filteredProducts.length}</b> dari <b>{productList.length}</b> produk</span>
        </div>

        {/* Products Grid */}
        <div>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-light">Memuat produk dari database...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="glass-card rounded-3xl p-12 text-center border border-border/40 bg-white shadow-sm">
              <p className="text-muted-foreground text-sm font-light">Tidak ada produk yang cocok dengan kriteria pencarian Anda.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
}
