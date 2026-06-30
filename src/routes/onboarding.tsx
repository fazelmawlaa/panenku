import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  Sprout, ShoppingBag, Recycle, TrendingUp, FileSignature, Leaf,
  ArrowRight, Star, Quote, ChevronDown, Sparkles, Users, Award, ShieldCheck,
  ChevronLeft, MessageSquare, BookOpen, Calendar, ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { testimonials } from "@/lib/mock-data";
import logoPanenku from "@/assets/logo_panenku.png";
import farmingBg from "@/assets/farming_bg.png";
import gsap from "gsap";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "PANENKU+ — Belajar, Bertani, Panen, & Berkembang" },
      {
        name: "description",
        content:
          "Platform Agritech untuk belajar bertani, berkonsultasi dengan ahli, memanen, dan menjual hasil pertanian serta limbah secara berkelanjutan.",
      },
    ],
  }),
  component: OnboardingPage,
});

const stats = [
  { value: "10K+", label: "Petani & Ahli Tani" },
  { value: "12,400+", label: "Pengguna Aktif" },
  { value: "850K+", label: "Transaksi Sukses" },
  { value: "98%", label: "Tingkat Kepuasan" },
];

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.05 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

function RevealSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, isVisible } = useScrollReveal();

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(40px)",
        transition: `opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function OnboardingPage() {
  const navigate = useNavigate();
  const { isLoggedIn, isLoading } = useAuth();

  // Redirect to home if already logged in
  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      navigate({ to: "/" });
    }
  }, [isLoggedIn, isLoading, navigate]);

  // States for calculator simulator
  const [activeSimTab, setActiveSimTab] = useState<"preorder" | "waste" | "consult">("preorder");
  const [selectedCrop, setSelectedCrop] = useState("beras");
  const [qty, setQty] = useState(250);
  const [selectedWaste, setSelectedWaste] = useState("sekam");
  const [weight, setWeight] = useState(5);
  const [selectedExpert, setSelectedExpert] = useState("agronomis");
  const [sessionHours, setSessionHours] = useState(2);
  const [isContractSimulated, setIsContractSimulated] = useState(false);

  // States for interactive testimonial carousel
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // States for floating navbar show/hide on scroll direction
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Hide if scrolling down and scrolled past navbar threshold, show if scrolling up
      if (currentScrollY > lastScrollY && currentScrollY > 150) {
        setShowNavbar(false);
      } else {
        setShowNavbar(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // GSAP animations on initial mount (Client-side)
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Entry animations for foreground text elements only (no scale/opacity on background card gsap-hero-card)
      gsap.from(".gsap-hero-badge", {
        y: -30,
        opacity: 0,
        duration: 0.8,
        delay: 0.1,
        ease: "back.out(1.7)"
      });

      gsap.from(".gsap-hero-title", {
        y: 40,
        opacity: 0,
        duration: 1.1,
        delay: 0.3,
        ease: "power3.out"
      });

      gsap.from(".gsap-hero-desc", {
        y: 30,
        opacity: 0,
        duration: 1,
        delay: 0.5,
        ease: "power2.out"
      });

      gsap.from(".gsap-hero-btn", {
        scale: 0.85,
        opacity: 0,
        duration: 0.9,
        delay: 0.7,
        stagger: 0.15,
        ease: "back.out(1.5)"
      });

      gsap.from(".gsap-hero-bottom", {
        y: 20,
        opacity: 0,
        duration: 0.9,
        delay: 0.9,
        ease: "power2.out"
      });
    });

    return () => ctx.revert();
  }, []);

  // Custom anchor link scroll handler to account for floating header offset
  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const target = document.querySelector(id);
    if (target) {
      const offset = 120; // height of floating navbar + padding
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = target.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  const customTestimonials = [
    {
      name: "Sugeng Mulyono",
      role: "Petani Pemula, Cianjur",
      quote: "Saya awalnya tidak punya bekal bertani. Berkat sesi konsultasi ahli agronomis di PANENKU+, saya berhasil mempersiapkan lahan dan memilih pupuk organik yang tepat. Hasil beras Pandan Wangi saya juga laku terjual sebelum panen melalui pre-order!",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
    },
    {
      name: "Dewi Rahayu",
      role: "Pecinta Tanaman & Pembeli Komoditas",
      quote: "Sistem pre-order di PANENKU+ sangat memuaskan. Saya mendapat kepastian sayur dan buah organik segar kualitas premium langsung dari ladang dengan harga bersahabat dan adil bagi petani.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80"
    },
    {
      name: "Hendrik Prasetyo",
      role: "Pengelola Pabrik Kompos",
      quote: "Marketplace limbah pertanian di platform ini adalah solusi luar biasa. Kami sekarang mudah mengamankan bahan baku jerami dan sekam padi kering langsung dari petani secara legal dan ekonomis.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80"
    }
  ];

  // Helper to format currency
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(val);
  };

  // Crop values
  const cropData: Record<string, { name: string; price: number; saving: number; unit: string }> = {
    beras: { name: "Beras Pandan Wangi", price: 14500, saving: 15, unit: "kg" },
    kopi: { name: "Kopi Arabika Gayo", price: 95000, saving: 18, unit: "kg" },
    tomat: { name: "Tomat Cherry Segar", price: 25000, saving: 12, unit: "kg" },
  };

  // Waste values
  const wasteData: Record<string, { name: string; price: number; carbon: number }> = {
    sekam: { name: "Sekam Padi Giling", price: 1200000, carbon: 450 },
    kulit: { name: "Kulit Kopi Kering", price: 1800000, carbon: 550 },
    jerami: { name: "Jerami Padi Kering", price: 900000, carbon: 350 },
  };

  // Expert session values
  const expertData: Record<string, { name: string; pricePerSession: number; role: string }> = {
    agronomis: { name: "Dr. Ir. Wibowo (Agronomis)", pricePerSession: 75000, role: "Ahli Nutrisi Tanah & pH" },
    praktisi: { name: "Pak Sugito (Petani Senior)", pricePerSession: 50000, role: "Ahli Padi & Pemasaran Panen" },
    sirkular: { name: "Bu Indah, M.Si (Ahli Kompos)", pricePerSession: 60000, role: "Pemanfaatan Limbah Organik" },
  };

  const currentCrop = cropData[selectedCrop];
  const totalPriceCrop = currentCrop.price * qty;
  const savingAmount = totalPriceCrop * (currentCrop.saving / 100);
  const dpAmount = totalPriceCrop * 0.3;
  const settlementAmount = totalPriceCrop * 0.7;

  const currentWaste = wasteData[selectedWaste];
  const totalPriceWaste = currentWaste.price * weight;
  const carbonOffset = currentWaste.carbon * weight;

  const currentExpert = expertData[selectedExpert];
  const totalPriceSession = currentExpert.pricePerSession * sessionHours;

  return (
    <div className="min-h-screen bg-[#f4f5f1] text-[#1a2b1b] flex flex-col items-center select-none font-['Inter',sans-serif] overflow-x-hidden relative w-full">
      
      {/* DEKORASI BACKGROUND TIPIS (BACKGROUND PATTERNS & BLOBS) */}
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{ backgroundImage: "radial-gradient(#1a2b1b 1.5px, transparent 1.5px)", backgroundSize: "28px 28px" }} />
      <div className="absolute top-[10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-[75%] left-[-5%] w-[40vw] h-[40vw] rounded-full bg-[#b4f05a]/5 blur-[120px] pointer-events-none" />

      {/* FLOATING CAPSULE NAVBAR (SCROLL HIDE/SHOW ON DIRECTION) */}
      <div className={`fixed top-8 left-6 right-6 z-50 flex justify-center transition-all duration-500 transform ${showNavbar ? "translate-y-0 opacity-100" : "-translate-y-28 opacity-0 pointer-events-none"
        }`}>
        <nav className="flex items-center justify-between w-full max-w-[1520px] bg-[#0c0d0c]/90 backdrop-blur-xl rounded-full px-4 sm:px-8 py-3.5 sm:py-4 border border-white/10 text-white shadow-2xl">
          {/* Logo Brand */}
          <div className="flex items-center gap-2 sm:gap-3">
            <img src={logoPanenku} alt="PANENKU+" className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl object-contain bg-white/20 p-1" />
            <div className="leading-tight text-left">
              <span className="font-['Plus_Jakarta_Sans',sans-serif] font-black tracking-tight text-base sm:text-2xl block">PANENKU+</span>
              <span className="hidden lg:block text-[9px] text-white/50 font-semibold tracking-wider -mt-0.5">Belajar, Bertani, Panen & Berkembang</span>
            </div>
          </div>
          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-10 text-xs sm:text-sm font-semibold tracking-wide text-white/80">
            <a href="#about" onClick={(e) => handleAnchorClick(e, "#about")} className="hover:text-[#b4f05a] transition duration-200">Tentang Kami</a>
            <a href="#features" onClick={(e) => handleAnchorClick(e, "#features")} className="hover:text-[#b4f05a] transition duration-200">Solusi Ekosistem</a>
            <a href="#products" onClick={(e) => handleAnchorClick(e, "#products")} className="hover:text-[#b4f05a] transition duration-200">Layanan & Katalog</a>
            <a href="#simulator" onClick={(e) => handleAnchorClick(e, "#simulator")} className="hover:text-[#b4f05a] transition duration-200">Kalkulator Simulasi</a>
            <a href="#insights" onClick={(e) => handleAnchorClick(e, "#insights")} className="hover:text-[#b4f05a] transition duration-200">Tips Tani</a>
          </div>
          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            <Link to="/login" className="text-[11px] sm:text-sm font-semibold text-white/80 hover:text-white transition">Masuk</Link>
            <Link to="/login">
              <Button size="sm" className="bg-[#b4f05a] hover:bg-[#a3db4e] text-black font-extrabold rounded-full px-4 sm:px-6 py-2 sm:py-2.5 h-8.5 sm:h-10 text-[10px] sm:text-xs tracking-wider transition duration-300">
                Daftar Gratis
              </Button>
            </Link>
          </div>
        </nav>
      </div>

      {/* 1. HERO SECTION (CONTAINED CARD — REFERENSI AGROBLOOM) */}
      <section className="gsap-hero-card relative w-screen overflow-hidden h-screen flex flex-col justify-between text-white shadow-2xl mt-0">
        {/* Sawah Background */}
        <img
          src={farmingBg}
          alt="Terraced Sawah Indonesia"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/25 to-black/65" />

        {/* Padding placeholder for top navbar floating above */}
        <div className="h-16" />

        {/* Central Headline */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-16 max-w-5xl mx-auto space-y-8">
          {/* Tagline Badge */}
          <div className="gsap-hero-badge inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-5 py-2 text-xs font-semibold tracking-wider border border-white/10 uppercase">
            <Star className="h-4 w-4 fill-honey text-honey" />
            <span>Belajar, Bertani, Panen, dan Berkembang Bersama</span>
          </div>

          {/* Elegant mixed font title */}
          <h1 className="gsap-hero-title font-['Plus_Jakarta_Sans',sans-serif] text-5xl sm:text-7xl lg:text-[5rem] font-bold tracking-tight leading-[1.02] text-white">
            Grow Green, <span className="font-['Playfair_Display',serif] italic font-light text-[#b4f05a]">Grow Better</span><br />
            Empowering Indonesian Farmers
          </h1>

          {/* Description */}
          <p className="gsap-hero-desc text-sm sm:text-base lg:text-xl text-white/80 max-w-4xl font-light leading-relaxed">
            PANENKU+ menghubungkan calon petani dan pelaku usaha dalam ekosistem agritech terintegrasi: belajar langsung lewat konsultasi ahli, berdagang hasil bumi via pre-order, dan maksimalkan sirkular limbah tani bernilai tinggi.
          </p>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-5 pt-3">
            <Link to="/login" className="gsap-hero-btn">
              <Button size="lg" className="bg-[#b4f05a] hover:bg-[#a3db4e] text-black font-extrabold rounded-full px-10 h-14 text-sm shadow-xl hover:scale-105 transition-all duration-300">
                Get Started →
              </Button>
            </Link>
            <a href="#features" onClick={(e) => handleAnchorClick(e, "#features")} className="gsap-hero-btn">
              <Button size="lg" variant="ghost" className="bg-black/35 hover:bg-black/60 text-white border border-white/25 rounded-full px-10 h-14 text-sm backdrop-blur-sm transition-all duration-300">
                Learn More
              </Button>
            </a>
          </div>
        </div>

        {/* Hero bottom overlay bar */}
        <div className="gsap-hero-bottom relative z-10 w-full flex items-center justify-between px-8 sm:px-12 pb-10 text-xs text-white/70">
          <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/10 shadow-lg">
            <div className="flex -space-x-1.5">
              <div className="w-6 h-6 rounded-full bg-[#b4f05a] text-black font-bold flex items-center justify-center border border-black text-[9px]">P</div>
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center border border-black text-[9px]">F</div>
              <div className="w-6 h-6 rounded-full bg-honey text-black font-bold flex items-center justify-center border border-black text-[9px]">M</div>
            </div>
            <span className="font-semibold text-white/95 text-[11px] uppercase tracking-wider">12k+ Users</span>
          </div>

          <a href="#about" onClick={(e) => handleAnchorClick(e, "#about")} className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/10 hover:text-white transition shadow-lg text-[11px] font-semibold">
            <span>Stroll Now</span>
            <ChevronDown className="h-4 w-4 animate-bounce" />
          </a>
        </div>
      </section>

      {/* CONTENT SECTIONS WRAPPER TO PREVENT HORIZONTAL SCROLL OVERFLOW ON MOBILE */}
      <div className="w-full px-4 sm:px-6 lg:px-9 flex flex-col items-center">

        {/* 2. DESCRIPTION & STATS SECTION (FULL SCREEN EXPANDED) */}
        <section id="about" className="py-24 w-full max-w-[1560px] mx-auto text-center space-y-16">
          <RevealSection>
            {/* Mixed font taglines */}
            <p className="font-['Plus_Jakarta_Sans',sans-serif] text-2xl sm:text-3xl lg:text-[2.5rem] text-[#1a2b1b]/80 leading-snug font-light max-w-6xl mx-auto">
              PANENKU+ dirancang untuk membantu masyarakat yang ingin <span className="font-semibold text-primary">memulai usaha pertanian tanpa keraguan</span>. Kami menghubungkan Anda dengan <span className="font-['Playfair_Display',serif] italic font-normal text-foreground">pendampingan ahli berbasis sesi, jaminan pasar pre-order</span>, serta pengolahan limbah organik sirkular bernilai ekonomi tinggi.
            </p>
          </RevealSection>

          {/* 4 columns stats */}
          <RevealSection delay={150}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8 pt-6">
              {stats.map((s, i) => (
                <div key={s.label} className="bg-white rounded-[2.5rem] p-10 border border-border/40 hover:shadow-glow hover:-translate-y-1.5 transition-all duration-500 text-center shadow-sm">
                  <div className="font-['Plus_Jakarta_Sans',sans-serif] text-4xl sm:text-6xl font-black text-primary leading-none">{s.value}</div>
                  <div className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest mt-3">{s.label}</div>
                </div>
              ))}
            </div>
          </RevealSection>
        </section>

        {/* 3. MEDIA SHOWCASE BLOCK ("The Power of Organic Farming") */}
        <section className="pb-24 w-full max-w-[1560px] mx-auto px-6 sm:px-8 lg:px-12 text-center space-y-10">
          <RevealSection>
            <div className="space-y-3">
              <h2 className="font-['Plus_Jakarta_Sans',sans-serif] text-3xl sm:text-4xl font-extrabold text-[#1a2b1b] tracking-tight">
                The Power of <span className="font-['Playfair_Display',serif] italic font-normal">Modern & Circular Agritech</span>
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground font-light max-w-2xl mx-auto">
                Dari belajar mempersiapkan lahan hingga memasarkan limbah pascapanen menjadi cuan. Kami mendampingi setiap langkah Anda di sektor agro.
              </p>
            </div>
          </RevealSection>

          <RevealSection delay={200}>
            <div className="relative w-full h-[320px] sm:h-[500px] lg:h-[620px] rounded-[3rem] overflow-hidden shadow-2xl border border-white/50">
              <img
                src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1400&q=85"
                alt="Organic farming hands"
                className="w-full h-full object-cover"
              />
              {/* Play Button Overlay */}
              <div className="absolute inset-0 bg-black/20 hover:bg-black/10 transition duration-300 flex items-center justify-center">
                <div className="h-20 w-20 rounded-full bg-[#b4f05a] text-black flex items-center justify-center shadow-2xl cursor-pointer hover:scale-110 transition duration-300">
                  <div className="w-0 h-0 border-t-8 border-t-transparent border-l-[14px] border-l-black border-b-8 border-b-transparent ml-1.5" />
                </div>
              </div>
            </div>
          </RevealSection>
        </section>

        {/* 4. TRUSTED PARTNERS LOGO ROW */}
        <section className="pb-24 w-full max-w-[1560px] mx-auto px-6 sm:px-8 lg:px-12 text-center">
          <div className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-[0.25em] mb-10">
            Didukung Koperasi & Komunitas Petani Nasional
          </div>
          <div className="flex flex-wrap items-center justify-center gap-10 sm:gap-20 opacity-55 select-none">
            <div className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-xl sm:text-3xl text-[#1a2b1b] hover:opacity-100 transition duration-300">INDOTANI</div>
            <div className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-xl sm:text-3xl text-[#1a2b1b] hover:opacity-100 transition duration-300">AGROKITA</div>
            <div className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-xl sm:text-3xl text-[#1a2b1b] hover:opacity-100 transition duration-300">KOPTI JABAR</div>
            <div className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-xl sm:text-3xl text-[#1a2b1b] hover:opacity-100 transition duration-300">SAYURKU</div>
            <div className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-xl sm:text-3xl text-[#1a2b1b] hover:opacity-100 transition duration-300">KEMENTAN</div>
          </div>
        </section>

        {/* 5. SOLUTIONS FOR MODERN AGRICULTURE (DARK BACKGROUND BOX REFERENSI) */}
        <section id="features" className="bg-[#0b0c0b] text-white rounded-[3rem] sm:rounded-[4rem] py-24 px-8 sm:px-16 lg:px-20 w-full max-w-[1560px] mx-auto my-12 relative overflow-hidden">
          {/* Glow ambient filters */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#b4f05a]/5 blur-[120px] pointer-events-none" />

          <div className="relative z-10 grid gap-10 lg:grid-cols-12 items-start mb-20 text-left">
            <div className="lg:col-span-6 space-y-4">
              <h2 className="font-['Plus_Jakarta_Sans',sans-serif] text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                Solusi Integrasi Tani<br />
                <span className="font-['Playfair_Display',serif] italic font-light text-[#b4f05a]">PANENKU+ Platform</span>
              </h2>
            </div>
            <div className="lg:col-span-6 text-white/60 text-sm sm:text-base leading-relaxed font-light lg:pt-6">
              Kami merancang ekosistem dari hulu ke hilir: membantu calon petani belajar budidaya, menjamin pasar lewat sistem transaksi digital pre-order, dan mengubah limbah pertanian sisa panen menjadi produk sirkular tinggi nilai.
            </div>
          </div>

          {/* 6 Grid cards */}
          <div className="relative z-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 text-left">
            {[
              {
                title: "Edukasi & Pendampingan",
                desc: "Panduan komprehensif bagi masyarakat umum dan petani pemula untuk memulai budidaya secara mandiri berdasarkan karakteristik tanah.",
                img: "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=400&q=70"
              },
              {
                title: "Konsultasi Berbasis Sesi",
                desc: "Interaksi konsultasi 1-on-1 dengan ahli tani dan praktisi senior untuk mengatasi masalah hama, pupuk, pH tanah, hingga pemasaran.",
                img: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=400&q=70"
              },
              {
                title: "Pre-Order Hasil Panen",
                desc: "Kepastian pasar dengan transaksi sebelum panen tiba. Menjamin kestabilan pendapatan petani dan harga terjangkau bagi pembeli.",
                img: "https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?auto=format&fit=crop&w=400&q=70"
              },
              {
                title: "Marketplace Hasil Tani",
                desc: "Toko pemasaran digital untuk sayuran, beras, kopi, dan hortikultura lokal segar yang dipetik higienis dan dikirim langsung ke pembeli.",
                img: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=70"
              },
              {
                title: "Marketplace Limbah Sirkular",
                desc: "Saluran niaga sekam padi, kulit kopi, jerami, dan batang jagung bernilai ekonomis untuk pakan ternak, pupuk kompos, & industri biomassa.",
                isCta: true
              },
              {
                title: "Pemberdayaan Petani Mandiri",
                desc: "Fasilitasi modal sirkular dan sarana pembinaan berkesinambungan untuk melahirkan petani-petani baru yang adaptif terhadap digital.",
                img: "https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&w=400&q=70"
              }
            ].map((item, idx) => (
              <div key={item.title} className="bg-[#141514] border border-zinc-800/90 rounded-[2.5rem] overflow-hidden hover:border-[#b4f05a]/40 transition-all duration-500 group flex flex-col justify-between p-7 shadow-lg">
                {item.isCta ? (
                  <div className="flex flex-col justify-between h-full py-4 space-y-8">
                    <div className="space-y-4">
                      <h3 className="font-['Plus_Jakarta_Sans',sans-serif] text-3xl font-bold text-white leading-tight">{item.title}</h3>
                      <p className="text-xs text-white/50 leading-relaxed font-light">
                        Jerami, sekam padi, batang jagung, kulit kopi, sabut kelapa dipasarkan kembali kepada produsen kompos & biomassa.
                      </p>
                    </div>
                    <Link to="/login" className="block">
                      <Button className="w-full bg-[#b4f05a] hover:bg-[#a3db4e] text-black font-extrabold rounded-full h-12 transition duration-300 text-xs uppercase tracking-wider">
                        Masuk & Jual Limbah
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {item.img && (
                      <div className="h-56 w-full rounded-2xl overflow-hidden relative mb-2">
                        <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      </div>
                    )}
                    <div className="space-y-3">
                      <h3 className="font-['Plus_Jakarta_Sans',sans-serif] text-xl font-bold text-white tracking-tight">{item.title}</h3>
                      <p className="text-xs text-white/55 font-light leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 6. PRODUCTS SHOWCASE SECTION (GROWN WITH CARE - LARGE CONTENT REFERENSI) */}
        <section id="products" className="py-24 w-full max-w-[1560px] mx-auto px-6 sm:px-8 lg:px-12 text-left">
          <div className="grid lg:grid-cols-12 gap-8 items-end mb-20">
            <div className="lg:col-span-8 space-y-4">
              <h2 className="font-['Plus_Jakarta_Sans',sans-serif] text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
                Layanan Terpadu,<br />
                <span className="font-['Playfair_Display',serif] italic font-light text-primary">Dari Ladang ke Konsumen</span>
              </h2>
            </div>
            <div className="lg:col-span-4 text-muted-foreground text-sm sm:text-base font-light leading-relaxed">
              Mulai dari pemesanan konsultasi belajar budidaya dengan praktisi agronomis senior, hingga pembelian hasil bumi segar lokal serta komoditas limbah tani sirkular.
            </div>
          </div>

          {/* Crops Grid (Enlarged) */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: "Konsultasi Sesi Agronomis",
                price: 75000,
                unit: "sesi",
                img: "https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&w=400&q=70",
                desc: "Mentorship langsung 1-on-1 dengan ahli mengenai pH tanah, pupuk, kesuburan lahan, dan penanganan hama komoditas."
              },
              {
                name: "Beras Pandan Wangi Premium",
                price: 14500,
                unit: "kg",
                img: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=70",
                desc: "Beras organik wangi premium Cianjur dari kelompok tani mitra. Sistem Pre-Order menjamin ketersediaan pasokan melimpah."
              },
              {
                name: "Sekam Padi Giling Halus",
                price: 1200,
                unit: "kg",
                img: "https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?auto=format&fit=crop&w=400&q=70",
                desc: "Limbah giling sekam padi murni bermutu tinggi. Sangat tepat digunakan sebagai bahan dasar pupuk kompos atau pakan ternak."
              }
            ].map((crop) => (
              <div key={crop.name} className="flex flex-col space-y-5 group">
                {/* Grey rounded container box for image */}
                <div className="bg-[#e9eae6]/65 rounded-[2.5rem] p-8 flex justify-center items-center h-96 relative overflow-hidden border border-border/20 shadow-sm hover:shadow-soft transition-all duration-300">
                  <img
                    src={crop.img}
                    alt={crop.name}
                    className="max-h-full max-w-full object-contain rounded-3xl group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute bottom-6 right-6 bg-[#b4f05a] text-black text-[11px] font-bold p-3 rounded-full shadow-lg cursor-pointer opacity-0 group-hover:opacity-100 transition duration-300">
                    <ArrowUpRight className="h-5 w-5" />
                  </span>
                </div>
                {/* Product title & price */}
                <div className="flex justify-between items-start px-3">
                  <div className="text-left">
                    <h3 className="font-['Plus_Jakarta_Sans',sans-serif] text-xl font-bold text-foreground line-clamp-1">{crop.name}</h3>
                    <span className="text-sm text-muted-foreground block font-medium mt-0.5">{formatRupiah(crop.price)}/{crop.unit}</span>
                  </div>
                  <Link to="/login">
                    <Button size="sm" className="rounded-full bg-black text-white hover:bg-zinc-800 text-xs px-6 h-10 font-bold shadow-md">
                      Pesan
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Section View All Button */}
          <div className="flex justify-center mt-16">
            <Link to="/login">
              <Button className="bg-[#b4f05a] hover:bg-[#a3db4e] text-black font-extrabold rounded-full px-10 py-3 h-12 text-xs uppercase tracking-wider transition duration-300 shadow-lg">
                View all
              </Button>
            </Link>
          </div>
        </section>

        {/* 7. TESTIMONIALS SECTION ("Growing Trust, One Review at a Time") */}
        <section className="py-24 w-full max-w-[1560px] mx-auto px-6 sm:px-8 lg:px-12 text-center space-y-16">
          <RevealSection>
            <div className="grid lg:grid-cols-12 gap-8 items-end text-left">
              <div className="lg:col-span-8 space-y-3">
                <h2 className="font-['Plus_Jakarta_Sans',sans-serif] text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
                  Tumbuh Bersama,<br />
                  <span className="font-['Playfair_Display',serif] italic font-light text-primary">Saling Memberdayakan</span>
                </h2>
              </div>
              <div className="lg:col-span-4 text-muted-foreground text-sm sm:text-base font-light leading-relaxed">
                Kami mendampingi langkah awal calon petani hingga membuka akses pasar yang adil. Simak kisah sukses dari ekosistem digital kami.
              </div>
            </div>
          </RevealSection>

          {/* Interactive testimonial display */}
          <RevealSection delay={150}>
            <div className="flex flex-col md:flex-row items-center justify-center gap-12">
              {/* Left Decor User */}
              <div className="hidden lg:flex flex-col items-center space-y-3 opacity-30 hover:opacity-60 transition duration-300">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80" alt="Avatar" className="w-20 h-20 rounded-full object-cover border border-primary/20 shadow-md" />
                <div className="text-[10px] font-bold text-foreground tracking-widest uppercase">Calon Petani</div>
              </div>

              {/* Main Testimonial Card */}
              <div className="bg-[#eaece8]/50 border border-border/40 rounded-[3rem] p-10 sm:p-12 max-w-3xl text-center flex flex-col items-center space-y-6 shadow-sm relative">
                <Quote className="h-12 w-12 text-primary/30" />
                <p className="text-base leading-relaxed text-foreground/80 font-light italic">
                  &ldquo;{customTestimonials[activeTestimonial].quote}&rdquo;
                </p>
                
                <div className="space-y-2">
                  <div className="flex justify-center gap-0.5">
                    {Array.from({ length: customTestimonials[activeTestimonial].rating }).map((_, j) => (
                      <Star key={j} className="h-4.5 w-4.5 fill-honey text-honey" />
                    ))}
                  </div>
                  <div className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-foreground text-lg">{customTestimonials[activeTestimonial].name}</div>
                  <div className="text-xs text-muted-foreground font-bold uppercase tracking-widest">{customTestimonials[activeTestimonial].role}</div>
                </div>
              </div>

              {/* Right Decor User */}
              <div className="hidden lg:flex flex-col items-center space-y-3 opacity-30 hover:opacity-60 transition duration-300">
                <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80" alt="Avatar" className="w-20 h-20 rounded-full object-cover border border-primary/20 shadow-md" />
                <div className="text-[10px] font-bold text-foreground tracking-widest uppercase">Pembeli Tani</div>
              </div>
            </div>

            {/* Testimonial slider buttons */}
            <div className="flex justify-center gap-2.5 mt-10">
              {customTestimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`h-3 w-3 rounded-full transition-all duration-300 ${activeTestimonial === i ? "bg-[#b4f05a] w-7" : "bg-[#1a2b1b]/20"
                    }`}
                />
              ))}
            </div>
          </RevealSection>
        </section>

        {/* 8. CROP SIMULATOR SECTION */}
        <section id="simulator" className="py-16 w-full max-w-[1560px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="bg-white border border-border/50 rounded-[3rem] p-8 sm:p-12 lg:p-16 shadow-sm grid lg:grid-cols-12 gap-12 items-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, #22c55e 1.5px, transparent 1.5px)", backgroundSize: "24px 24px" }} />
            
            <div className="lg:col-span-6 space-y-6 text-left relative z-10">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-primary">
                Interactive Simulator
              </div>
              <h2 className="font-['Plus_Jakarta_Sans',sans-serif] text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
                Simulasikan Kebutuhan &<br />
                <span className="font-['Playfair_Display',serif] italic font-normal text-primary">Biaya Tani Anda</span>
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-light">
                Gunakan simulator interaktif PANENKU+ untuk memproyeksikan estimasi biaya sesi konsultasi ahli agronomis, keuntungan pre-order panen padi, atau nilai ekonomi limbah sirkular hasil pertanian Anda secara instan.
              </p>
            </div>

            <div className="lg:col-span-6 relative z-10 w-full">
              <div className="glass-card rounded-[2.5rem] p-8 border border-border/40 shadow-lg space-y-6">
                {/* Tab Selector */}
                <div className="flex bg-[#e9eae6] rounded-full p-1.5 border border-border/40">
                  <button
                    onClick={() => { setActiveSimTab("preorder"); setIsContractSimulated(false); }}
                    className={`flex-1 py-2.5 text-xs font-semibold rounded-full transition ${activeSimTab === "preorder"
                      ? "bg-primary text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    🌾 Pre-Order
                  </button>
                  <button
                    onClick={() => { setActiveSimTab("waste"); }}
                    className={`flex-1 py-2.5 text-xs font-semibold rounded-full transition ${activeSimTab === "waste"
                      ? "bg-primary text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    ♻️ Limbah Tani
                  </button>
                  <button
                    onClick={() => { setActiveSimTab("consult"); }}
                    className={`flex-1 py-2.5 text-xs font-semibold rounded-full transition ${activeSimTab === "consult"
                      ? "bg-primary text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    💬 Sesi Konsultasi
                  </button>
                </div>

                {/* Pre-Order Tab */}
                {activeSimTab === "preorder" && (
                  <div className="space-y-4 text-left animate-in fade-in-50 duration-300">
                    <div className="flex justify-between items-center">
                      <h3 className="font-display font-bold text-xs text-foreground uppercase tracking-wider">Kalkulator Pre-Order</h3>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-600 font-bold px-2 py-0.5 rounded-full">Hemat s/d 18%</span>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">Pilih Komoditas</label>
                      <div className="grid grid-cols-3 gap-2">
                        {Object.entries(cropData).map(([key, crop]) => (
                          <button
                            key={key}
                            onClick={() => { setSelectedCrop(key); setIsContractSimulated(false); }}
                            className={`py-2 px-1 text-[11px] font-semibold border rounded-xl transition ${selectedCrop === key
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border/60 hover:bg-muted text-muted-foreground"
                              }`}
                          >
                            {crop.name.split(" ")[0]}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <label className="text-muted-foreground">Volume Pesanan</label>
                        <span className="text-primary">{qty} {currentCrop.unit}</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="1000"
                        step="50"
                        value={qty}
                        onChange={(e) => { setQty(Number(e.target.value)); setIsContractSimulated(false); }}
                        className="w-full accent-primary h-1.5 bg-[#eaece8] rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div className="bg-secondary/40 rounded-2xl p-5 border border-border/20 space-y-2.5">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Harga (Pre-Order)</span>
                        <span className="font-semibold text-foreground">{formatRupiah(currentCrop.price)}/{currentCrop.unit}</span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Total Pembelian</span>
                        <span className="font-semibold text-foreground">{formatRupiah(totalPriceCrop)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Penghematan Didapat</span>
                        <span className="font-bold text-emerald-600">-{formatRupiah(savingAmount)} ({currentCrop.saving}%)</span>
                      </div>
                      <div className="border-t border-dashed border-border/40 my-2 pt-2 space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-foreground">DP Kontrak Tani (30%)</span>
                          <span className="font-bold text-primary">{formatRupiah(dpAmount)}</span>
                        </div>
                        <div className="flex justify-between text-[10px] text-muted-foreground pl-3">
                          <span>Pelunasan Saat Panen (70%)</span>
                          <span>{formatRupiah(settlementAmount)}</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => setIsContractSimulated(true)}
                      className={`w-full py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition ${isContractSimulated
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "bg-primary text-white shadow-soft"
                        }`}
                    >
                      {isContractSimulated ? "✓ Kontrak Digital Tersimulasi" : "Simulasikan Kontrak Digital"}
                    </Button>
                  </div>
                )}

                {/* Waste Tab */}
                {activeSimTab === "waste" && (
                  <div className="space-y-4 text-left animate-in fade-in-50 duration-300">
                    <div className="flex justify-between items-center">
                      <h3 className="font-display font-bold text-xs text-foreground uppercase tracking-wider">Ekonomi Sirkular Limbah</h3>
                      <span className="text-[10px] bg-cyan-500/10 text-cyan-600 font-bold px-2 py-0.5 rounded-full">Limbah Organik</span>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">Jenis Limbah Tani</label>
                      <div className="grid grid-cols-3 gap-2">
                        {Object.entries(wasteData).map(([key, waste]) => (
                          <button
                            key={key}
                            onClick={() => setSelectedWaste(key)}
                            className={`py-2 px-1 text-[11px] font-semibold border rounded-xl transition ${selectedWaste === key
                              ? "border-cyan-500 bg-cyan-500/10 text-cyan-600"
                              : "border-border/60 hover:bg-muted text-muted-foreground"
                              }`}
                          >
                            {waste.name.split(" ")[0]}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <label className="text-muted-foreground">Volume Limbah</label>
                        <span className="text-cyan-600">{weight} Ton</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="20"
                        step="1"
                        value={weight}
                        onChange={(e) => setWeight(Number(e.target.value))}
                        className="w-full accent-cyan-500 h-1.5 bg-[#eaece8] rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div className="bg-cyan-500/5 rounded-2xl p-5 border border-cyan-500/10 space-y-2.5">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Harga Beli Industri / Ton</span>
                        <span className="font-semibold text-foreground">{formatRupiah(currentWaste.price)}/Ton</span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Pendapatan Tambahan Petani</span>
                        <span className="font-bold text-cyan-600">{formatRupiah(totalPriceWaste)}</span>
                      </div>
                      <div className="border-t border-dashed border-cyan-500/20 my-2 pt-2 flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Potensi Emisi CO2 Dikurangi</span>
                        <span className="font-bold text-emerald-600 flex items-center gap-1">🌱 {carbonOffset.toLocaleString("id-ID")} kg CO2</span>
                      </div>
                    </div>

                    <Link to="/login" className="block w-full">
                      <Button className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold uppercase tracking-wider text-xs shadow-soft">
                        Jual Limbah Sekarang
                      </Button>
                    </Link>
                  </div>
                )}

                {/* Sesi Konsultasi Tab */}
                {activeSimTab === "consult" && (
                  <div className="space-y-4 text-left animate-in fade-in-50 duration-300">
                    <div className="flex justify-between items-center">
                      <h3 className="font-display font-bold text-xs text-foreground uppercase tracking-wider">Simulasi Sesi Konsultasi</h3>
                      <span className="text-[10px] bg-violet-500/10 text-violet-600 font-bold px-2 py-0.5 rounded-full">Belajar Bertani Ahli</span>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">Pilih Ahli Pendamping</label>
                      <div className="space-y-2">
                        {Object.entries(expertData).map(([key, exp]) => (
                          <button
                            key={key}
                            onClick={() => setSelectedExpert(key)}
                            className={`w-full py-2.5 px-3 text-left text-xs font-semibold border rounded-xl flex justify-between items-center transition ${
                              selectedExpert === key
                                ? "border-violet-500 bg-violet-500/5 text-violet-700"
                                : "border-border/60 hover:bg-muted text-muted-foreground"
                            }`}
                          >
                            <div>
                              <div className="font-bold text-foreground">{exp.name}</div>
                              <div className="text-[10px] text-muted-foreground font-light">{exp.role}</div>
                            </div>
                            <div className="font-bold">{formatRupiah(exp.pricePerSession)}/jam</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <label className="text-muted-foreground">Durasi Pendampingan</label>
                        <span className="text-violet-600">{sessionHours} Jam Sesi</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="8"
                        step="1"
                        value={sessionHours}
                        onChange={(e) => setSessionHours(Number(e.target.value))}
                        className="w-full accent-violet-600 h-1.5 bg-[#eaece8] rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div className="bg-violet-500/5 rounded-2xl p-5 border border-violet-500/10 space-y-2.5">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Harga per Jam Sesi</span>
                        <span className="font-semibold text-foreground">{formatRupiah(currentExpert.pricePerSession)}/jam</span>
                      </div>
                      <div className="border-t border-dashed border-violet-500/20 my-2 pt-2 flex justify-between items-center text-xs">
                        <span className="text-muted-foreground font-medium">Estimasi Biaya Konsultasi</span>
                        <span className="font-bold text-violet-600">{formatRupiah(totalPriceSession)}</span>
                      </div>
                    </div>

                    <Link to="/login" className="block w-full">
                      <Button className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold uppercase tracking-wider text-xs shadow-soft">
                        Jadwalkan Konsultasi Belajar
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 9. AGRICULTURE INSIGHTS & TIPS (BLOG GRID REFERENSI AGROBLOOM) */}
        <section id="insights" className="py-24 w-full max-w-[1560px] mx-auto px-6 sm:px-8 lg:px-12 text-left">
          <div className="flex justify-between items-end mb-16">
            <div className="space-y-4">
              <h2 className="font-['Plus_Jakarta_Sans',sans-serif] text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
                Tips Bertani & <span className="font-['Playfair_Display',serif] italic font-light text-primary">Sirkular Edukasi</span>
              </h2>
            </div>
            <Link to="/login" className="hidden sm:block">
              <Button className="bg-[#b4f05a] hover:bg-[#a3db4e] text-black font-extrabold rounded-full px-10 py-3 h-12 text-xs uppercase tracking-wider transition">
                View all
              </Button>
            </Link>
          </div>

          {/* Blog Grid */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Belajar Persiapan Lahan Bagi Pemula",
                desc: "Cara mengukur pH tanah secara mandiri dan teknik penggemburan tanah yang baik untuk komoditas padi dan cherry tomato.",
                date: "June 28, 2026",
                img: "https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&w=400&q=70"
              },
              {
                title: "Pemanfaatan Kulit Kopi Menjadi Kompos",
                desc: "Langkah-langkah fermentasi limbah kulit kopi pascapanen menjadi pupuk organik sirkular yang kaya nitrogen.",
                date: "June 25, 2026",
                img: "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=400&q=70"
              },
              {
                title: "Kunci Sukses Pre-Order Hasil Tani",
                desc: "Tips bernegosiasi dengan pembeli restoran dan penyusunan jaminan kualitas kontrak digital di platform agritech.",
                date: "June 20, 2026",
                img: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=70"
              }
            ].map((blog) => (
              <div key={blog.title} className="flex flex-col space-y-5 group">
                {/* Image Box */}
                <div className="h-64 w-full rounded-[2.5rem] overflow-hidden relative shadow-sm border border-border/20 bg-secondary">
                  <img src={blog.img} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/10" />
                </div>
                {/* Content info */}
                <div className="space-y-2 text-left px-3">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{blog.date}</span>
                  <h3 className="font-['Plus_Jakarta_Sans',sans-serif] text-xl font-bold text-foreground group-hover:text-primary transition">{blog.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground font-light leading-relaxed">{blog.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 10. CALL-TO-ACTION CARD REFERENSI ("The Future of Farming Starts Here!") */}
        <section className="py-12 w-full max-w-[1560px] mx-auto px-6 sm:px-8 lg:px-12 text-left">
          <div className="bg-[#eaece8]/60 border border-border/40 rounded-[3rem] sm:rounded-[4rem] overflow-hidden grid lg:grid-cols-12 gap-10 items-center p-8 sm:p-12 shadow-sm relative">
            
            {/* Left farmer Image */}
            <div className="lg:col-span-6 h-[280px] sm:h-[380px] lg:h-[440px] rounded-3xl overflow-hidden relative bg-secondary shadow-md">
              <img
                src="https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&w=700&q=80"
                alt="Farmer with crops"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Right Text details */}
            <div className="lg:col-span-6 space-y-8 text-left lg:pl-8">
              <h2 className="font-['Plus_Jakarta_Sans',sans-serif] text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#1a2b1b] leading-tight">
                Mulai Belajar &<br />
                <span className="font-['Playfair_Display',serif] italic font-light text-primary">Bertani Hari Ini!</span>
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground font-light leading-relaxed">
                Jadilah bagian dari lahirnya petani baru Indonesia yang mandiri, produktif, adaptif teknologi digital, serta peduli terhadap pelestarian bumi lewat sirkular limbah pascapanen.
              </p>
              <Link to="/login" className="block pt-2">
                <Button className="bg-[#b4f05a] hover:bg-[#a3db4e] text-black font-extrabold rounded-full px-10 py-4 h-13 text-xs uppercase tracking-wider shadow-md transition">
                  Join Us Now
                </Button>
              </Link>
            </div>
          </div>
        </section>

      </div>

      {/* 11. FOOTER (DARK STYLE REFERENSI AGROBLOOM) */}
      <footer className="w-full border-t border-zinc-800 bg-[#0c0d0c] text-white rounded-[3rem] sm:rounded-[4rem] py-20 px-8 sm:px-16 lg:px-20 max-w-[1560px] mx-auto mt-12 text-left relative overflow-hidden">
        <div className="grid gap-10 md:grid-cols-4 relative z-10">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img src={logoPanenku} alt="PANENKU+ Logo" className="h-10 w-10 rounded-xl object-contain bg-white/20 p-1" />
              <div className="font-['Plus_Jakarta_Sans',sans-serif] text-2xl font-black tracking-tight text-white">PANENKU+</div>
            </div>
            <p className="text-xs sm:text-sm text-white/50 max-w-md leading-relaxed font-light">
              Platform digital pertanian terintegrasi. Menghubungkan petani berpengalaman dengan calon petani melalui sesi konsultasi belajar, marketplace panen pre-order, dan jual beli limbah sirkular.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-xs text-[#b4f05a] uppercase tracking-widest">Navigation</h4>
            <ul className="space-y-2.5 text-xs text-white/60 font-light">
              <li><a href="#about" onClick={(e) => handleAnchorClick(e, "#about")} className="hover:text-white transition">Tentang Kami</a></li>
              <li><a href="#features" onClick={(e) => handleAnchorClick(e, "#features")} className="hover:text-white transition">Solusi Ekosistem</a></li>
              <li><a href="#products" onClick={(e) => handleAnchorClick(e, "#products")} className="hover:text-white transition">Katalog Layanan</a></li>
              <li><a href="#insights" onClick={(e) => handleAnchorClick(e, "#insights")} className="hover:text-white transition">Tips Tani</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-xs text-[#b4f05a] uppercase tracking-widest">Hubungi Kami</h4>
            <ul className="space-y-2.5 text-xs text-white/60 font-light">
              <li>info@panenku.id</li>
              <li>+62 821-2345-6789</li>
              <li>Jakarta, Indonesia</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-zinc-800/80 mt-16 pt-8 flex flex-col sm:flex-row justify-between items-center text-[10px] sm:text-xs text-white/40 font-light relative z-10">
          <div>© 2026 PANENKU+. All rights reserved. Dari Belajar Bertani Hingga Menjual Hasil Panen dalam Satu Platform.</div>
          <div className="flex gap-6 mt-4 sm:mt-0">
            <a href="#" className="hover:text-white transition">Terms of Service</a>
            <a href="#" className="hover:text-white transition">Privacy Policy</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
