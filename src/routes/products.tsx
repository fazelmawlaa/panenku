import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { ProductCard } from "@/components/ProductCard";
import { fetchProductsFromSupabase } from "@/lib/products-db";
import { type Product } from "@/lib/mock-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Loader2, SlidersHorizontal, Check, ChevronDown } from "lucide-react";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "Marketplace — PANENKU" },
      { name: "description", content: "Temukan hasil panen pre-order, ready stock, limbah tani, dan alat tani berkualitas." }
    ]
  }),
  component: CatalogRouter,
});

function FilterItem({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between py-1.5 px-2.5 rounded-xl hover:bg-secondary/60 text-xs font-semibold text-foreground/80 hover:text-foreground transition-all duration-200"
    >
      <span>{label}</span>
      <div className={`h-4.5 w-4.5 rounded-md border flex items-center justify-center transition-all ${active
          ? "border-primary bg-primary text-white"
          : "border-border/80 bg-white"
        }`}>
        {active && <Check className="h-3 w-3 stroke-[3]" />}
      </div>
    </button>
  );
}

function CatalogRouter() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname !== "/products" && pathname !== "/products/") {
    return <Outlet />;
  }
  return <Catalog />;
}

function Catalog() {
  // All hooks always called — no early returns before hooks
  const [productList, setProductList] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearchQuery, setActiveSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedAvailability, setSelectedAvailability] = useState("all");
  const [sortBy, setSortBy] = useState("unggulan");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      const data = await fetchProductsFromSupabase();
      setProductList(data);
      setIsLoading(false);
    };
    loadProducts();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearchQuery(searchQuery);
  };

  const filteredProducts = useMemo(() => {
    let result = productList.filter((p) => {
      if (activeSearchQuery && !p.name.toLowerCase().includes(activeSearchQuery.toLowerCase())) {
        return false;
      }
      if (selectedType !== "all") {
        if (selectedType === "hasil" && p.type !== "ready" && p.type !== "preorder") return false;
        if (selectedType === "limbah" && p.type !== "waste") return false;
        if (selectedType === "alat" && p.type !== "tools") return false;
      }
      if (selectedAvailability !== "all") {
        if (selectedAvailability === "ready" && p.type !== "ready") return false;
        if (selectedAvailability === "preorder" && p.type !== "preorder") return false;
      }
      return true;
    });

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
      <div className="mx-auto max-w-full px-4 sm:px-8 md:px-12 py-8 min-h-screen text-left space-y-6">        {/* Search & Filters Row */}
        <form onSubmit={handleSearchSubmit} className="flex flex-row gap-3 items-center w-full select-none">
          {/* Left side: Premium Enlarge Search bar */}
          <div className="flex items-center flex-1 bg-white border border-border/60 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-300 h-14 sm:h-16 pl-4 sm:pl-5 overflow-hidden min-w-0">
            <Search className="h-5 w-5 sm:h-5.5 sm:w-5.5 text-primary shrink-0 mr-1" />
            <input 
              type="text"
              placeholder="Cari hasil panen segar, limbah tani..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-full border-none focus:outline-none bg-transparent text-sm md:text-base text-foreground px-3 font-medium placeholder:text-muted-foreground/60"
            />
            <button 
              type="submit"
              className="bg-[#60a868] hover:bg-[#529359] text-white font-extrabold text-xs md:text-sm uppercase tracking-wider h-full px-5 sm:px-10 transition duration-300 shrink-0"
            >
              Cari
            </button>
          </div>

          {/* Right side: Single Consolidated Filter Trigger with Checkbox Popover */}
          <div className="relative shrink-0 font-sans">
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="w-14 h-14 sm:w-[200px] sm:h-16 rounded-2xl bg-white border border-border/85 hover:bg-secondary/40 text-sm font-semibold text-foreground/80 transition flex items-center justify-center sm:justify-between px-0 sm:px-5 font-sans shadow-sm select-none"
            >
              <span className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 sm:h-4 sm:w-4 text-muted-foreground" />
                <span className="hidden sm:inline">Filter</span>
              </span>
              <ChevronDown className={`hidden sm:block h-4 w-4 text-muted-foreground transition-transform duration-200 ${isFilterOpen ? "rotate-180" : ""}`} />
            </button>

            {isFilterOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)} />
                <div className="absolute right-0 top-full mt-2 bg-white border border-border/40 rounded-3xl shadow-xl p-5 z-50 w-full sm:w-[280px] text-left space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Section 1: Tipe Produk */}
                  <div className="space-y-2">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Tipe Produk</div>
                    <div className="space-y-1">
                      <FilterItem label="Semua Tipe" active={selectedType === "all"} onClick={() => setSelectedType("all")} />
                      <FilterItem label="Hasil Tani" active={selectedType === "hasil"} onClick={() => setSelectedType("hasil")} />
                      <FilterItem label="Limbah Tani" active={selectedType === "limbah"} onClick={() => setSelectedType("limbah")} />
                      <FilterItem label="Alat Tani" active={selectedType === "alat"} onClick={() => setSelectedType("alat")} />
                    </div>
                  </div>

                  <hr className="border-border/20" />

                  {/* Section 2: Ketersediaan */}
                  <div className="space-y-2">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Ketersediaan</div>
                    <div className="space-y-1">
                      <FilterItem label="Semua Ketersediaan" active={selectedAvailability === "all"} onClick={() => setSelectedAvailability("all")} />
                      <FilterItem label="Ready Stock" active={selectedAvailability === "ready"} onClick={() => setSelectedAvailability("ready")} />
                      <FilterItem label="Pre-Order" active={selectedAvailability === "preorder"} onClick={() => setSelectedAvailability("preorder")} />
                    </div>
                  </div>

                  <hr className="border-border/20" />

                  {/* Section 3: Urutkan */}
                  <div className="space-y-2">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Urutkan</div>
                    <div className="space-y-1">
                      <FilterItem label="Terpopuler" active={sortBy === "unggulan"} onClick={() => setSortBy("unggulan")} />
                      <FilterItem label="Harga Terendah" active={sortBy === "murah"} onClick={() => setSortBy("murah")} />
                      <FilterItem label="Harga Tertinggi" active={sortBy === "mahal"} onClick={() => setSortBy("mahal")} />
                    </div>
                  </div>
                </div>
              </>
            )}
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
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
}

