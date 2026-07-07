export type ProductType = "preorder" | "ready" | "waste" | "tools";

export interface Product {
  id: string;
  name: string;
  category: string;
  type: ProductType;
  farmer: string;
  farmerId: string;
  location: string;
  price: number;
  unit: string;
  stock: number;
  ordered?: number;
  estimatedHarvest?: string;
  cultivation?: string;
  rating: number;
  reviews: number;
  image: string;
  description: string;
}

const img = (q: string) =>
  `https://images.unsplash.com/${q}?auto=format&fit=crop&w=800&q=70`;

export const products: Product[] = [
  {
    id: "p1", name: "Beras Pandan Wangi Premium", category: "Beras", type: "preorder",
    farmer: "Pak Sugeng", farmerId: "f1", location: "Cianjur, Jawa Barat",
    price: 14500, unit: "kg", stock: 600, ordered: 420,
    estimatedHarvest: "14 hari lagi", cultivation: "Organik",
    rating: 4.9, reviews: 128, image: img("photo-1586201375761-83865001e31c"),
    description: "Beras pandan wangi organik dengan aroma khas dan tekstur pulen. Dipanen langsung dari sawah dengan metode tradisional ramah lingkungan.",
  },
  {
    id: "p2", name: "Kopi Arabika Gayo", category: "Kopi", type: "preorder",
    farmer: "Bu Rahma", farmerId: "f2", location: "Aceh Tengah",
    price: 95000, unit: "kg", stock: 250, ordered: 180,
    estimatedHarvest: "21 hari lagi", cultivation: "Shade Grown",
    rating: 4.8, reviews: 89, image: img("photo-1611854779393-1b2da9d400fe"),
    description: "Biji kopi arabika single origin dari dataran tinggi Gayo, profil rasa fruity dengan body medium.",
  },
  {
    id: "p3", name: "Tomat Cherry Segar", category: "Sayuran", type: "ready",
    farmer: "Pak Joko", farmerId: "f3", location: "Lembang, Bandung",
    price: 22000, unit: "kg", stock: 85,
    cultivation: "Hidroponik", rating: 4.7, reviews: 56,
    image: img("photo-1592924357228-91a4daadcfea"),
    description: "Tomat cherry hidroponik manis dan segar, dipanen pagi hari dan langsung dikirim.",
  },
  {
    id: "p4", name: "Cabai Merah Keriting", category: "Sayuran", type: "ready",
    farmer: "Pak Hasan", farmerId: "f4", location: "Magelang",
    price: 38000, unit: "kg", stock: 120,
    cultivation: "Konvensional", rating: 4.6, reviews: 34,
    image: img("photo-1583119022894-919a68a3d0e3"),
    description: "Cabai merah keriting pedas khas Magelang, cocok untuk sambal dan masakan rumahan.",
  },
  {
    id: "p5", name: "Alpukat Mentega", category: "Buah", type: "preorder",
    farmer: "Bu Yanti", farmerId: "f5", location: "Garut",
    price: 28000, unit: "kg", stock: 400, ordered: 150,
    estimatedHarvest: "30 hari lagi", cultivation: "Organik",
    rating: 4.9, reviews: 92, image: img("photo-1601039641847-7857b994d704"),
    description: "Alpukat mentega tekstur lembut, kuning, dan creamy. Cocok untuk jus dan toast.",
  },
  {
    id: "p6", name: "Madu Hutan Murni", category: "Lainnya", type: "ready",
    farmer: "Pak Tomi", farmerId: "f6", location: "Sumbawa",
    price: 120000, unit: "botol 500ml", stock: 60,
    cultivation: "Hutan", rating: 5.0, reviews: 41,
    image: img("photo-1587049352846-4a222e784d38"),
    description: "Madu hutan asli dari lebah liar Sumbawa, 100% murni tanpa campuran.",
  },
  {
    id: "w1", name: "Sekam Padi", category: "Sekam Padi", type: "waste",
    farmer: "Pak Sugeng", farmerId: "f1", location: "Cianjur",
    price: 1500, unit: "kg", stock: 2000,
    rating: 4.7, reviews: 23, image: img("photo-1574323347407-f5e1ad6d020b"),
    description: "Sekam padi kering, cocok untuk media tanam, pupuk organik, atau bahan biomassa.",
  },
  {
    id: "w2", name: "Ampas Tebu", category: "Ampas Tebu", type: "waste",
    farmer: "Pak Bambang", farmerId: "f7", location: "Lampung",
    price: 800, unit: "kg", stock: 5000,
    rating: 4.5, reviews: 12, image: img("photo-1626268225338-44e9adb39c12"),
    description: "Ampas tebu untuk industri biomassa dan pakan ternak.",
  },
  {
    id: "w3", name: "Kulit Kopi", category: "Kulit Kopi", type: "waste",
    farmer: "Bu Rahma", farmerId: "f2", location: "Aceh Tengah",
    price: 2500, unit: "kg", stock: 800,
    rating: 4.8, reviews: 18, image: img("photo-1559525839-d9acfd527f67"),
    description: "Kulit kopi kering untuk pakan ternak dan kompos kaya nutrisi.",
  },
  {
    id: "w4", name: "Batok Kelapa", category: "Batok Kelapa", type: "waste",
    farmer: "Pak Iwan", farmerId: "f8", location: "Lampung Selatan",
    price: 3500, unit: "kg", stock: 1200,
    rating: 4.9, reviews: 31, image: img("photo-1580984969071-a8da5656c2fb"),
    description: "Batok kelapa kering, bahan utama briket dan arang aktif.",
  },
  {
    id: "w5", name: "Jerami Padi", category: "Jerami", type: "waste",
    farmer: "Pak Sugeng", farmerId: "f1", location: "Cianjur",
    price: 1200, unit: "kg", stock: 3500,
    rating: 4.6, reviews: 9, image: img("photo-1500076656116-558758c991c1"),
    description: "Jerami padi kering untuk pakan sapi, kompos, dan mulsa organik.",
  },
  {
    id: "w6", name: "Batang Pisang", category: "Batang Pisang", type: "waste",
    farmer: "Bu Yanti", farmerId: "f5", location: "Garut",
    price: 2000, unit: "kg", stock: 600,
    rating: 4.7, reviews: 14, image: img("photo-1543872084-c7bd3822856f"),
    description: "Batang pisang segar untuk industri serat alami dan kerajinan.",
  },
  {
    id: "t1", name: "Cangkul Baja Modern", category: "Alat", type: "tools",
    farmer: "CV Tani Maju", farmerId: "f9", location: "Sidoarjo, Jawa Timur",
    price: 65000, unit: "pcs", stock: 150,
    rating: 4.8, reviews: 24, image: img("photo-1595974482597-4b8da8879bc5"),
    description: "Cangkul berbahan baja karbon tinggi, awet, kuat, dan pas untuk pengolahan tanah keras.",
  },
  {
    id: "t2", name: "Sprayer Elektrik 16L", category: "Alat", type: "tools",
    farmer: "AgriTech Mandiri", farmerId: "f10", location: "Semarang, Jawa Tengah",
    price: 275000, unit: "unit", stock: 45,
    rating: 4.9, reviews: 37, image: img("photo-1585320806297-9794b3e4eeae"),
    description: "Alat penyemprot hama elektrik baterai charge berkapasitas 16 liter dengan nozzle kuningan premium.",
  },
  {
    id: "t3", name: "Benih Padi Unggul Ciherang", category: "Benih", type: "tools",
    farmer: "Koperasi Benih Unggul", farmerId: "f11", location: "Sukabumi, Jawa Barat",
    price: 85000, unit: "sak 5kg", stock: 200,
    rating: 4.9, reviews: 52, image: img("photo-1574323347407-f5e1ad6d020b"),
    description: "Benih padi Ciherang bersertifikat, potensi hasil tinggi dan tahan hama wereng coklat.",
  },
  {
    id: "t4", name: "Pupuk Organik Cair 1L", category: "Pupuk", type: "tools",
    farmer: "BioOrganik Nusantara", farmerId: "f12", location: "Sleman, DIY",
    price: 35000, unit: "botol 1L", stock: 350,
    rating: 4.8, reviews: 64, image: img("photo-1587049352846-4a222e784d38"),
    description: "Pupuk organik cair multivitamin untuk memicu pertumbuhan vegetatif dan buah secara maksimal.",
  }
];

export const wasteCategories = [
  { name: "Sekam Padi", icon: "🌾", use: "Pupuk Organik" },
  { name: "Batang Jagung", icon: "🌽", use: "Biomassa" },
  { name: "Kulit Kopi", icon: "☕", use: "Pakan Ternak" },
  { name: "Batok Kelapa", icon: "🥥", use: "Briket Arang" },
  { name: "Ampas Tebu", icon: "🎋", use: "Bioenergi" },
  { name: "Batang Pisang", icon: "🍌", use: "Industri Serat" },
  { name: "Jerami", icon: "🌾", use: "Mulsa & Pakan" },
  { name: "Kompos Organik", icon: "🍂", use: "Pupuk Tanaman" },
];

export const buyerTypes = [
  { name: "Peternak", icon: "🐄" },
  { name: "Produsen Kompos", icon: "🌱" },
  { name: "UMKM", icon: "🏪" },
  { name: "Industri Biomassa", icon: "⚡" },
  { name: "Industri Pakan", icon: "🌾" },
];

export const testimonials = [
  { name: "Andi Pratama", role: "Pembeli Reguler", quote: "Sayur dari PANENKU jauh lebih segar dan harganya transparan. Saya tahu petani yang menanam!", rating: 5 },
  { name: "Bu Sari", role: "Pemilik Warung", quote: "Sistem pre-order membantu saya stok dengan harga lebih hemat. Recommended banget.", rating: 5 },
  { name: "Pak Sugeng", role: "Petani Padi", quote: "Pendapatan saya naik 40% sejak gabung PANENKU. Limbah panen juga jadi pemasukan tambahan.", rating: 5 },
];

export const priceTrend = [
  { month: "Jan", beras: 13500, cabai: 32000, tomat: 18000 },
  { month: "Feb", beras: 13800, cabai: 36000, tomat: 19500 },
  { month: "Mar", beras: 14000, cabai: 42000, tomat: 21000 },
  { month: "Apr", beras: 14200, cabai: 38000, tomat: 20000 },
  { month: "Mei", beras: 14500, cabai: 35000, tomat: 22000 },
  { month: "Jun", beras: 14500, cabai: 38000, tomat: 22000 },
];

export const farmers = [
  { id: "f1", name: "Pak Sugeng", farm: "Kebun Tani Subur", location: "Cianjur, Jawa Barat", landSize: "2.5 Ha", commodities: ["Padi", "Sayuran"], rating: 4.9, harvests: 142, certification: "Organik Indonesia", image: img("photo-1500648767791-00dcc994a43e") },
  { id: "f2", name: "Bu Rahma", farm: "Kopi Gayo Asli", location: "Aceh Tengah", landSize: "1.8 Ha", commodities: ["Kopi Arabika"], rating: 4.8, harvests: 68, certification: "Fair Trade", image: img("photo-1494790108377-be9c29b29330") },
  { id: "f3", name: "Pak Joko", farm: "Lembang Hidroponik", location: "Lembang, Bandung", landSize: "0.8 Ha", commodities: ["Tomat", "Selada"], rating: 4.7, harvests: 95, certification: "GAP", image: img("photo-1507003211169-0a1dd7228f2d") },
];

export const customerOrders = [
  { id: "ORD-2401", product: "Beras Pandan Wangi", qty: "10 kg", total: 145000, status: "Sedang Panen", date: "12 Jun 2026", type: "preorder" as const },
  { id: "ORD-2398", product: "Tomat Cherry Segar", qty: "3 kg", total: 66000, status: "Selesai", date: "08 Jun 2026", type: "ready" as const },
  { id: "ORD-2389", product: "Kopi Arabika Gayo", qty: "2 kg", total: 190000, status: "Pengiriman", date: "05 Jun 2026", type: "preorder" as const },
  { id: "ORD-2375", product: "Sekam Padi", qty: "50 kg", total: 75000, status: "Diproses", date: "02 Jun 2026", type: "waste" as const },
];

export const farmerOrders = [
  { id: "ORD-2401", buyer: "Andi P.", product: "Beras Pandan Wangi", qty: "10 kg", total: 145000, status: "Sedang Panen" },
  { id: "ORD-2402", buyer: "PT Sumber Tani", product: "Beras Pandan Wangi", qty: "200 kg", total: 2900000, status: "Negosiasi" },
  { id: "ORD-2403", buyer: "Warung Bu Sari", product: "Sekam Padi", qty: "100 kg", total: 150000, status: "Diterima" },
  { id: "ORD-2404", buyer: "Koperasi Maju", product: "Beras", qty: "500 kg", total: 7250000, status: "Selesai" },
];

export const salesData = [
  { day: "Sen", revenue: 1200000 },
  { day: "Sel", revenue: 1850000 },
  { day: "Rab", revenue: 1450000 },
  { day: "Kam", revenue: 2100000 },
  { day: "Jum", revenue: 2400000 },
  { day: "Sab", revenue: 2800000 },
  { day: "Min", revenue: 1950000 },
];

export const orderStatuses = ["Menunggu", "Dibayar", "Diproses", "Sedang Panen", "Pengiriman", "Selesai"];

export const shippingMethods = [
  { id: "cod", name: "COD (Bayar di Tempat)", courier: "Kurir Internal / COD", eta: "Bayar tunai saat barang sampai", price: 15000, desc: "Bayar di tempat saat barang diterima" },
  { id: "jnt", name: "J&T Express", courier: "J&T EZ", eta: "2-3 hari", price: 18000, desc: "Pengiriman cepat dan terpercaya" },
  { id: "jne", name: "JNE Express", courier: "JNE YES", eta: "1-2 hari", price: 28000, desc: "Layanan ekspres satu hari sampai" },
  { id: "pos", name: "Pos Indonesia", courier: "Pos Kilat Khusus", eta: "3-5 hari", price: 12000, desc: "Layanan pos menjangkau seluruh pelosok" },
] as const;

export const trackingEvents = [
  { time: "Senin, 24 Jun · 08:15", status: "Pesanan dibuat", desc: "Pesanan telah diterima sistem PANENKU", done: true },
  { time: "Senin, 24 Jun · 09:42", status: "Pembayaran dikonfirmasi", desc: "Pembayaran berhasil melalui GoPay", done: true },
  { time: "Senin, 24 Jun · 14:20", status: "Pesanan diproses petani", desc: "Pak Sugeng menyiapkan pesanan Anda", done: true },
  { time: "Selasa, 25 Jun · 07:30", status: "Paket diserahkan ke kurir", desc: "JNE REG · resi JN0024801XK", done: true },
  { time: "Selasa, 25 Jun · 11:05", status: "Dalam perjalanan", desc: "Tiba di gudang sortir Bandung", done: true },
  { time: "Rabu, 26 Jun · estimasi 14:00", status: "Tiba di tujuan", desc: "Jakarta Pusat", done: false },
  { time: "—", status: "Diterima penerima", desc: "Konfirmasi penerimaan", done: false },
];

export const formatRupiah = (n: number) =>
  "Rp" + n.toLocaleString("id-ID");
