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
import readyStock from "@/assets/ready_stock.png";
import konsultasi from "@/assets/konsultasi.png";
import logoPanenkuOriginal from "@/assets/logo_panenku_original.png";
import video0711 from "@/assets/video/0711.mov";
import gsap from "gsap";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "PANENKU — Marketplace & Konsultasi Pertanian Terintegrasi" },
      {
        name: "description",
        content:
          "PANENKU menghubungkan petani berpengalaman dengan pembeli untuk transaksi hasil panen, alat tani, limbah sirkular, dan konsultasi interaktif.",
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
        transform: isVisible ? "scale(1) translateY(0)" : "scale(0.96) translateY(30px)",
        transition: `opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 1.2s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

const smoothScrollTo = (targetY: number, duration: number = 1600) => {
  const startY = window.scrollY;
  const difference = targetY - startY;
  const startTime = performance.now();

  const easeInOutCubic = (t: number) => {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  };

  const step = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeInOutCubic(progress);

    window.scrollTo(0, startY + difference * easedProgress);

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  };

  requestAnimationFrame(step);
};

function OnboardingPage() {
  const navigate = useNavigate();
  const { isLoggedIn, isLoading, user } = useAuth();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (!isLoading && isLoggedIn && user) {
      if (user.role === "petani") {
        navigate({ to: "/farmer" });
      } else {
        navigate({ to: "/dashboard" });
      }
    }
  }, [isLoggedIn, isLoading, user, navigate]);



  // States for interactive testimonial carousel


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
      const targetY = elementPosition - offset;
      smoothScrollTo(targetY, 1600);
    }
  };



  const statIcons = [Sprout, Users, TrendingUp, Award];
  const statColors = [
    { text: "text-emerald-700", bg: "bg-emerald-50/80 border-emerald-100/60", hoverGlow: "hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.15)] hover:border-emerald-200" },
    { text: "text-blue-700", bg: "bg-blue-50/80 border-blue-100/60", hoverGlow: "hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.15)] hover:border-blue-200" },
    { text: "text-emerald-600", bg: "bg-[#b4f05a]/10 border-[#b4f05a]/20", hoverGlow: "hover:shadow-[0_20px_40px_-15px_rgba(180,240,90,0.3)] hover:border-[#b4f05a]/40" },
    { text: "text-amber-700", bg: "bg-amber-50/80 border-amber-100/60", hoverGlow: "hover:shadow-[0_20px_40px_-15px_rgba(245,158,11,0.15)] hover:border-amber-200" }
  ];

  // Helper to format currency
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(val);
  };



  return (
    <div className="min-h-screen bg-[#f4f5f1] text-[#1a2b1b] flex flex-col items-center select-none font-['Inter',sans-serif] overflow-x-hidden relative w-full">

      {/* DEKORASI BACKGROUND TIPIS (BACKGROUND PATTERNS & BLOBS) */}
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{ backgroundImage: "radial-gradient(#1a2b1b 1.5px, transparent 1.5px)", backgroundSize: "28px 28px" }} />
      <div className="absolute top-[10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-[75%] left-[-5%] w-[40vw] h-[40vw] rounded-full bg-[#b4f05a]/5 blur-[120px] pointer-events-none" />

      {/* FLOATING CAPSULE NAVBAR (SCROLL HIDE/SHOW ON DIRECTION) */}
      <div className={`fixed top-4 sm:top-8 left-4 sm:left-6 right-4 sm:right-6 z-50 flex justify-center transition-all duration-500 transform ${showNavbar ? "translate-y-0 opacity-100" : "-translate-y-28 opacity-0 pointer-events-none"
        }`}>
        <nav className="flex items-center justify-between w-full max-w-[1520px] bg-[#0c0d0c]/90 backdrop-blur-xl rounded-full px-3.5 sm:px-8 py-2 sm:py-3 border border-white/10 text-white shadow-2xl">
          {/* Logo Brand */}
          <Link to="/" className="flex items-center pl-1.5 sm:pl-6">
            <img src={logoPanenku} alt="PANENKU" className="h-7 sm:h-10 object-contain" />
          </Link>
          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-10 text-xs sm:text-sm font-semibold tracking-wide text-white/80">
            <a href="#about" onClick={(e) => handleAnchorClick(e, "#about")} className="hover:text-[#b4f05a] transition duration-200">Tentang Kami</a>
            <a href="#products" onClick={(e) => handleAnchorClick(e, "#products")} className="hover:text-[#b4f05a] transition duration-200">Layanan & Katalog</a>
            <a href="#faq" onClick={(e) => handleAnchorClick(e, "#faq")} className="hover:text-[#b4f05a] transition duration-200">FAQ</a>
          </div>
          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/login" className="text-[10px] sm:text-sm font-semibold text-white/80 hover:text-white transition">Masuk</Link>
            <Link to="/login">
              <Button size="sm" className="bg-[#b4f05a] hover:bg-[#a3db4e] text-black font-extrabold rounded-full px-3.5 sm:px-6 py-1.5 sm:py-2 h-7.5 sm:h-10 text-[9px] sm:text-xs tracking-wider transition duration-300">
                Daftar Gratis
              </Button>
            </Link>
          </div>
        </nav>
      </div>

      {/* 1. HERO SECTION (CONTAINED CARD — REFERENSI AGROBLOOM) */}
      <section className="gsap-hero-card relative w-full overflow-hidden h-screen flex flex-col justify-between text-white shadow-2xl mt-0">
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
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 py-16 max-w-5xl mx-auto space-y-6 sm:space-y-8">

          {/* Elegant mixed font title */}
          <h1 className="gsap-hero-title font-['Plus_Jakarta_Sans',sans-serif] text-3xl sm:text-7xl lg:text-[5rem] font-bold tracking-tight leading-[1.1] sm:leading-[1.02] text-white px-2 sm:px-0">
            Grow Green, <span className="font-['Playfair_Display',serif] italic font-light text-[#b4f05a]">Grow Better</span><br />
            Empowering Indonesian Farmers
          </h1>

          {/* Description */}
          <p className="gsap-hero-desc text-xs sm:text-base lg:text-xl text-white/80 max-w-4xl font-light leading-relaxed px-4 sm:px-0">
            PANENKU menghubungkan petani berpengalaman dengan pembeli untuk transaksi hasil panen, perlengkapan budidaya, limbah sirkular, dan konsultasi interaktif dalam satu ekosistem terintegrasi.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 pt-3">
            <Link to="/login" className="gsap-hero-btn">
              <Button size="lg" className="bg-[#b4f05a] hover:bg-[#a3db4e] text-black font-extrabold rounded-full px-6 sm:px-10 h-11 sm:h-14 text-xs sm:text-sm shadow-xl hover:scale-105 transition-all duration-300">
                Mulai Sekarang →
              </Button>
            </Link>
            <a href="#about" onClick={(e) => handleAnchorClick(e, "#about")} className="gsap-hero-btn">
              <Button size="lg" variant="ghost" className="bg-black/35 hover:bg-black/60 text-white border border-white/25 rounded-full px-6 sm:px-10 h-11 sm:h-14 text-xs sm:text-sm backdrop-blur-sm transition-all duration-300">
                Pelajari Lebih Lanjut
              </Button>
            </a>
          </div>
        </div>

        {/* Hero bottom overlay bar */}
        <div className="gsap-hero-bottom relative z-10 w-full flex flex-col sm:flex-row items-center justify-between gap-4 px-6 sm:px-12 pb-6 sm:pb-10 text-xs text-white/70">
          <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border border-white/10 shadow-lg">
            <div className="flex -space-x-1.5">
              <div className="w-6 h-6 rounded-full bg-[#b4f05a] text-black font-bold flex items-center justify-center border border-black text-[9px]">P</div>
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center border border-black text-[9px]">F</div>
              <div className="w-6 h-6 rounded-full bg-honey text-black font-bold flex items-center justify-center border border-black text-[9px]">M</div>
            </div>
            <span className="font-semibold text-white/95 text-[11px] uppercase tracking-wider">12k+ Users</span>
          </div>

          <a href="#about" onClick={(e) => handleAnchorClick(e, "#about")} className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border border-white/10 hover:text-white transition shadow-lg text-[10px] sm:text-[11px] font-semibold">
            <span>Stroll Now</span>
            <ChevronDown className="h-4 w-4 animate-bounce" />
          </a>
        </div>
      </section>

      {/* CONTENT SECTIONS WRAPPER TO PREVENT HORIZONTAL SCROLL OVERFLOW ON MOBILE */}
      <div className="w-full px-0 sm:px-6 lg:px-9 flex flex-col items-center">

        {/* 2. DESCRIPTION & STATS SECTION (FULL SCREEN EXPANDED) */}
        <section id="about" className="py-16 sm:py-24 w-full max-w-[1560px] mx-auto px-4 sm:px-8 lg:px-10 space-y-12 sm:space-y-16 text-left">
          <RevealSection>
            <div className="space-y-8 text-left">
              {/* Judul */}
              <div className="space-y-4">
                <h3 className="font-['Plus_Jakarta_Sans',sans-serif] text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1a2b1b] leading-tight">
                  Semua Kebutuhan Pertanian, <span className="font-['Playfair_Display',serif] italic font-normal">dari Konsultasi hingga Marketplace</span> dalam Satu Platform.
                </h3>
              </div>

              {/* Dua Card Di Bawah Judul */}
              <div className="grid md:grid-cols-2 gap-6 sm:gap-8 pt-4">
                {/* Card Kiri: Konsultasi */}
                <div className="relative rounded-[2rem] overflow-hidden border-2 border-emerald-500/50 aspect-[4/5] sm:aspect-[4/3] md:aspect-[4/5] lg:aspect-[4/3.8] flex flex-col justify-between p-6 sm:p-8 shadow-xl group">
                  {/* Background Image */}
                  <img
                    src={konsultasi}
                    alt="Konsultasi Ahli Pertanian"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Green Dark overlay 55% */}
                  <div className="absolute inset-0 bg-[#062412]/55 mix-blend-multiply" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Top content */}
                  <div className="relative z-10">
                    <img src={logoPanenkuOriginal} alt="PANENKU" className="h-8 sm:h-12 object-contain mb-3" />
                    <h4 className="font-['Plus_Jakarta_Sans',sans-serif] text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight">
                      Konsultasi <span className="font-['Playfair_Display',serif] italic font-light text-[#b4f05a]">Bersama Ahli Pertanian</span>
                    </h4>
                  </div>

                  {/* Bottom glass container */}
                  <div className="relative z-10 bg-black/40 backdrop-blur-md border border-white/10 p-5 rounded-2xl h-[190px] sm:h-[160px] md:h-[190px] lg:h-[160px] flex flex-col justify-between">
                    <p className="text-xs sm:text-sm text-white/90 font-light leading-relaxed">
                      Dapatkan solusi cepat untuk hama, penyakit tanaman, pemupukan, hingga strategi budidaya langsung dari penyuluh dan pakar pertanian terpercaya.
                    </p>
                    <div className="pt-2">
                      <Link to="/login" className="inline-block">
                        <Button className="bg-[#38bdf8] hover:bg-[#0ea5e9] text-slate-950 font-extrabold rounded-full px-5 py-2 sm:py-2.5 h-9 sm:h-10 text-xs transition duration-300">
                          Konsultasi Sekarang →
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Card Kanan: Marketplace */}
                <div className="relative rounded-[2rem] overflow-hidden border-2 border-[#b4f05a]/50 aspect-[4/5] sm:aspect-[4/3] md:aspect-[4/5] lg:aspect-[4/3.8] flex flex-col justify-between p-6 sm:p-8 shadow-xl group">
                  {/* Background Image */}
                  <img
                    src={readyStock}
                    alt="Marketplace Produk Pertanian"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Green overlay 45% */}
                  <div className="absolute inset-0 bg-[#0a351c]/45 mix-blend-multiply" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Top content */}
                  <div className="relative z-10">
                    <img src={logoPanenkuOriginal} alt="PANENKU" className="h-8 sm:h-12 object-contain mb-3" />
                    <h4 className="font-['Plus_Jakarta_Sans',sans-serif] text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight">
                      Marketplace <span className="font-['Playfair_Display',serif] italic font-light text-[#b4f05a]">Produk Pertanian</span>
                    </h4>
                  </div>

                  {/* Bottom glass container */}
                  <div className="relative z-10 bg-black/40 backdrop-blur-md border border-white/10 p-5 rounded-2xl h-[190px] sm:h-[160px] md:h-[190px] lg:h-[160px] flex flex-col justify-between">
                    <p className="text-xs sm:text-sm text-white/90 font-light leading-relaxed">
                      Belanja hasil panen segar, alat pertanian, pupuk, bibit, hingga limbah pertanian berkualitas langsung dari petani dan mitra terpercaya.
                    </p>
                    <div className="pt-2">
                      <Link to="/login" className="inline-block">
                        <Button className="bg-[#1e4620]/80 hover:bg-[#1a3d1c] text-white font-extrabold rounded-full px-5 py-2 sm:py-2.5 h-9 sm:h-10 text-xs transition duration-300">
                          Jelajahi Marketplace →
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </RevealSection>

          {/* 4 columns stats */}
          <RevealSection delay={150}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 pt-6">
              {stats.map((s, i) => {
                const Icon = statIcons[i];
                const theme = statColors[i];
                return (
                  <div
                    key={s.label}
                    className={`bg-white/80 backdrop-blur-md rounded-[1.5rem] sm:rounded-[3rem] p-4 sm:p-8 lg:p-10 border border-zinc-200/60 transition-all duration-500 text-center shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:-translate-y-2 hover:bg-white ${theme.hoverGlow} group`}
                  >
                    <div className="flex justify-center mb-4 sm:mb-6">
                      <div className={`p-3 sm:p-4 rounded-[1rem] sm:rounded-[1.5rem] border ${theme.bg} transition-all duration-500 group-hover:scale-110`}>
                        <Icon className={`h-5 w-5 sm:h-7 sm:w-7 ${theme.text}`} />
                      </div>
                    </div>
                    <div className="font-['Plus_Jakarta_Sans',sans-serif] text-2xl sm:text-4xl lg:text-5xl font-black text-[#1a2b1b] tracking-tight leading-none">
                      {s.value}
                    </div>
                    <div className="text-[9px] sm:text-[11px] text-muted-foreground font-black uppercase tracking-widest mt-2 sm:mt-4">
                      {s.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </RevealSection>
        </section>

      </div> {/* Close the main wrapper to go 100% full screen width */}

      {/* 3. MEDIA SHOWCASE BLOCK - IMMERSIVE FULL SCREEN BANNER */}
      <section className="w-full bg-[#0a0f0b] text-white overflow-hidden py-16 sm:py-24 relative">
        <div className="w-full max-w-[1560px] mx-auto px-4 sm:px-12 lg:px-20 flex flex-col items-center text-center space-y-10 sm:space-y-14">
          <RevealSection>
            <div className="max-w-4xl mx-auto space-y-4">
              <h2 className="font-['Plus_Jakarta_Sans',sans-serif] text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Menghubungkan Petani, Pembeli, dan Pengetahuan <span className="font-['Playfair_Display',serif] italic font-normal text-[#b4f05a]">dalam Satu Platform</span>
              </h2>
              <p className="text-xs sm:text-base text-zinc-300 font-light max-w-3xl mx-auto leading-relaxed">
                Dari jual beli hasil panen, pemanfaatan limbah pertanian, penyediaan sarana produksi, hingga konsultasi bersama petani berpengalaman, PANENKU menghadirkan seluruh kebutuhan pertanian dalam satu ekosistem digital.
              </p>
            </div>
          </RevealSection>

          {/* Unified Video element inside the same dark block */}
          <RevealSection delay={200} className="w-full">
            <div className="w-full h-[240px] sm:h-[500px] lg:h-[650px] rounded-[1.5rem] sm:rounded-[3.5rem] overflow-hidden shadow-2xl border border-white/10 relative bg-black">
              <video
                src={video0711}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f0b]/30 via-transparent to-[#0a0f0b]/20 pointer-events-none" />
            </div>
          </RevealSection>
        </div>
      </section>

      {/* Reopen the main wrapper for the next sections */}
      <div className="w-full px-0 sm:px-6 lg:px-9 flex flex-col items-center">

        {/* 6. PRODUCTS SHOWCASE SECTION (GROWN WITH CARE - LARGE CONTENT REFERENSI) */}
        <section id="products" className="py-16 sm:py-24 w-full max-w-[1560px] mx-auto px-4 sm:px-8 lg:px-12 text-left">
          <div className="grid lg:grid-cols-12 gap-8 items-end mb-20">
            <div className="lg:col-span-8 space-y-4">
              <h2 className="font-['Plus_Jakarta_Sans',sans-serif] text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
                Layanan Terpadu,<br />
                <span className="font-['Playfair_Display',serif] italic font-light text-primary">Dari Ladang ke Konsumen</span>
              </h2>
            </div>
            <div className="lg:col-span-4 text-muted-foreground text-sm sm:text-base font-light leading-relaxed">
              Mulai dari pemesanan konsultasi belajar budidaya dengan praktisi agronomis senior, hingga pembelian hasil bumi segar lokal serta komoditas limbah tani sirkular.
            </div>
          </div>

          {/* Crops Grid (Enlarged) */}
          <div className="grid gap-3 sm:gap-8 grid-cols-2 lg:grid-cols-3">
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
              <div key={crop.name} className="flex flex-col space-y-2 sm:space-y-5 group">
                {/* Grey rounded container box for image */}
                <div className="bg-[#e9eae6]/65 rounded-[1rem] sm:rounded-[2.5rem] p-2 sm:p-8 flex justify-center items-center h-36 sm:h-96 relative overflow-hidden border border-border/20 shadow-sm hover:shadow-soft transition-all duration-300">
                  <img
                    src={crop.img}
                    alt={crop.name}
                    className="max-h-full max-w-full object-contain rounded-2xl sm:rounded-3xl group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute bottom-2 right-2 sm:bottom-6 sm:right-6 bg-[#b4f05a] text-black text-[11px] font-bold p-1.5 sm:p-3 rounded-full shadow-lg cursor-pointer opacity-0 group-hover:opacity-100 transition duration-300">
                    <ArrowUpRight className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                  </span>
                </div>
                {/* Product title & price */}
                <div className="flex justify-between items-start px-1.5 sm:px-3">
                  <div className="text-left">
                    <h3 className="font-['Plus_Jakarta_Sans',sans-serif] text-xs sm:text-xl font-bold text-foreground line-clamp-1">{crop.name}</h3>
                    <span className="text-[10px] sm:text-sm text-muted-foreground block font-medium mt-0.5">{formatRupiah(crop.price)}/{crop.unit}</span>
                  </div>
                  <Link to="/login" className="shrink-0 ml-1">
                    <Button size="sm" className="rounded-full bg-black text-white hover:bg-zinc-800 text-[10px] sm:text-xs px-3 sm:px-6 h-7 sm:h-10 font-bold shadow-md">
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

        {/* 9. FAQ SECTION (ACCORDION DROPDOWN MODEL) */}
        <section id="faq" className="py-16 sm:py-24 w-full max-w-[1560px] mx-auto px-4 sm:px-16 lg:px-20 text-left">
          <div className="space-y-4 mb-16 text-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#b4f05a] bg-primary px-4 py-1.5 rounded-full inline-block">
              Pertanyaan Umum
            </span>
            <h2 className="font-['Plus_Jakarta_Sans',sans-serif] text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
              Frequently Asked <span className="font-['Playfair_Display',serif] italic font-light text-primary">Questions</span>
            </h2>
            <div className="h-1.5 w-20 bg-[#b4f05a] rounded-full mx-auto" />
          </div>

          <FAQAccordion />
        </section>

        {/* 10. CALL-TO-ACTION CARD REFERENSI ("The Future of Farming Starts Here!") */}
        <section className="py-8 sm:py-12 w-full max-w-[1560px] mx-auto px-4 sm:px-8 lg:px-12 text-left">
          <div className="bg-[#eaece8]/60 border border-border/40 rounded-[1.5rem] sm:rounded-[4rem] overflow-hidden grid lg:grid-cols-12 gap-6 sm:gap-10 items-center p-5 sm:p-12 shadow-sm relative">

            {/* Left farmer Image */}
            <div className="lg:col-span-6 h-[200px] sm:h-[380px] lg:h-[440px] rounded-2xl sm:rounded-3xl overflow-hidden relative bg-secondary shadow-md">
              <img
                src="https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&w=700&q=80"
                alt="Farmer with crops"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Right Text details */}
            <div className="lg:col-span-6 space-y-8 text-left lg:pl-8">
              <h2 className="font-['Plus_Jakarta_Sans',sans-serif] text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#1a2b1b] leading-tight">
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
      <footer className="w-full border-t border-zinc-800 bg-[#0c0d0c] text-white rounded-[1.5rem] sm:rounded-[4rem] py-12 sm:py-20 px-4 sm:px-16 lg:px-20 max-w-[1560px] mx-auto mt-6 sm:mt-12 text-left relative overflow-hidden">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4 relative z-10">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img src={logoPanenku} alt="PANENKU" className="h-8 sm:h-12 object-contain" />
            </div>
            <p className="text-xs sm:text-sm text-white/50 max-w-md leading-relaxed font-light">
              Platform digital pertanian terintegrasi. Menghubungkan petani berpengalaman dengan pembeli untuk transaksi hasil panen, perlengkapan budidaya, limbah sirkular, dan sesi konsultasi.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-xs text-[#b4f05a] uppercase tracking-widest">Navigation</h4>
            <ul className="space-y-2.5 text-xs text-white/60 font-light">
              <li><a href="#about" onClick={(e) => handleAnchorClick(e, "#about")} className="hover:text-white transition">Tentang Kami</a></li>
              <li><a href="#products" onClick={(e) => handleAnchorClick(e, "#products")} className="hover:text-white transition">Katalog Layanan</a></li>
              <li><a href="#faq" onClick={(e) => handleAnchorClick(e, "#faq")} className="hover:text-white transition">FAQ</a></li>
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

        <div className="border-t border-zinc-800/80 mt-10 sm:mt-16 pt-6 sm:pt-8 flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between items-center text-[10px] sm:text-xs text-white/40 font-light relative z-10">
          <div>© 2026 PANENKU. All rights reserved. Platform Marketplace & Konsultasi Pertanian Terintegrasi.</div>
          <div className="flex gap-6 mt-4 sm:mt-0">
            <a href="#" className="hover:text-white transition">Terms of Service</a>
            <a href="#" className="hover:text-white transition">Privacy Policy</a>
          </div>
        </div>
      </footer>

    </div>
  );
}

const faqData = [
  {
    q: "Apa itu PANENKU?",
    a: "PANENKU adalah platform marketplace pertanian terintegrasi yang menghubungkan petani dan masyarakat dalam satu ekosistem digital. Melalui PANENKU, pengguna dapat membeli hasil panen, limbah pertanian, alat dan kebutuhan budidaya, serta berkonsultasi dengan petani berpengalaman."
  },
  {
    q: "Siapa saja yang dapat menggunakan PANENKU?",
    a: "PANENKU dapat digunakan oleh semua kalangan, mulai dari petani, pelaku UMKM pertanian, masyarakat umum, hingga siapa saja yang ingin membeli produk pertanian atau memperoleh konsultasi seputar budidaya."
  },
  {
    q: "Produk apa saja yang tersedia di PANENKU?",
    a: "PANENKU menyediakan berbagai kategori produk, seperti hasil panen segar, limbah pertanian yang masih bernilai ekonomis, alat dan perlengkapan pertanian, serta kebutuhan budidaya lainnya."
  },
  {
    q: "Bagaimana cara membeli produk di PANENKU?",
    a: "Pengguna cukup membuat akun, memilih produk yang diinginkan, memasukkannya ke keranjang belanja, kemudian menyelesaikan proses checkout sesuai metode pembayaran yang tersedia."
  },
  {
    q: "Bagaimana cara menjual produk di PANENKU?",
    a: "Petani atau penjual dapat mendaftarkan akun sebagai penjual, melengkapi informasi toko, kemudian mengunggah produk beserta deskripsi, harga, stok, dan foto produk agar dapat dibeli oleh pengguna lain."
  },
  {
    q: "Apa itu layanan konsultasi di PANENKU?",
    a: "Layanan konsultasi memungkinkan pengguna berkonsultasi langsung dengan petani berpengalaman mengenai teknik budidaya, pengendalian hama dan penyakit, pengelolaan lahan, hingga strategi pemasaran hasil pertanian."
  },
  {
    q: "Apakah konsultasi dilakukan secara gratis?",
    a: "Tersedia konsultasi gratis maupun berbayar, tergantung pada jenis layanan dan petani yang dipilih. Informasi biaya akan ditampilkan sebelum pengguna melakukan pemesanan sesi konsultasi."
  },
  {
    q: "Bagaimana jika produk yang saya terima tidak sesuai?",
    a: "Pengguna dapat menghubungi penjual melalui fitur yang tersedia atau mengajukan komplain sesuai dengan kebijakan pengembalian dan penyelesaian sengketa yang berlaku di PANENKU."
  },
  {
    q: "Apakah data pribadi saya aman?",
    a: "Ya. PANENKU berkomitmen menjaga keamanan data pengguna dengan menerapkan sistem keamanan yang sesuai untuk melindungi informasi pribadi dan aktivitas transaksi."
  }
];

function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-4 w-full">
      {faqData.map((faq, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            key={i}
            className={`border border-border/40 bg-white rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-300 shadow-sm ${isOpen ? "ring-2 ring-primary/20 shadow-md" : "hover:border-primary/30"
              }`}
          >
            <button
              onClick={() => toggle(i)}
              className="flex justify-between items-center w-full px-4 py-4 sm:px-8 sm:py-6 text-left font-['Plus_Jakarta_Sans',sans-serif] font-black text-sm sm:text-lg text-foreground focus:outline-none transition-colors duration-200"
            >
              <span>{i + 1}. {faq.q}</span>
              <span className={`flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-primary transition-transform duration-300 ${isOpen ? "rotate-180 bg-primary text-white" : ""}`}>
                <ChevronDown className="h-4 w-4" />
              </span>
            </button>
            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? "max-h-[300px] border-t border-border/20 opacity-100" : "max-h-0 opacity-0"
                }`}
            >
              <div className="px-4 py-4 sm:px-8 sm:py-6 text-xs sm:text-sm text-muted-foreground font-light leading-relaxed">
                {faq.a}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
