# 🌾 PANENKU Hub ID — Dari Petani, Untuk Indonesia

**PANENKU Hub ID** adalah platform agritech inovatif yang dirancang untuk menghubungkan petani Indonesia secara langsung dengan konsumen, pengecer, dan industri bisnis. Platform ini memfasilitasi transaksi hasil panen secara transparan melalui sistem pre-order (sebelum panen), pembelian stok siap kirim (ready stock), serta pemanfaatan limbah pertanian (agricultural waste) demi mendukung ekosistem pertanian yang berkelanjutan.

---

## ✨ Fitur Utama

- 📅 **Pre-Order Hasil Panen**: Pembeli dapat memesan hasil panen sebelum masa panen tiba, membantu petani mendapatkan kepastian pasar dan pembiayaan awal.
- 📦 **Produk Siap Kirim (Ready Stock)**: Pembelian produk pertanian segar berkualitas tinggi yang siap langsung dikirim ke pembeli.
- ♻️ **Marketplace Limbah Pertanian**: Mengurangi limbah dengan memperjualbelikan sisa pertanian untuk kebutuhan industri, pakan ternak, atau pupuk organik.
- 📈 **Harga Pasar Real-time**: Grafik tren harga komoditas pertanian secara langsung untuk membantu pengambilan keputusan yang adil bagi petani dan pembeli.
- 📄 **Kontrak Digital & Transparansi**: Sistem pencatatan kontrak yang aman untuk transaksi skala besar.
- 🧑‍🌾 **Dashboard Petani & Pembeli**: Halaman pengelolaan produk, pesanan, kontrak, dan keuangan pertanian secara terintegrasi.

---

## 🛠️ Teknologi yang Digunakan

Aplikasi ini dibangun menggunakan teknologi modern dengan performa tinggi:

- **Framework**: [TanStack Start](https://tanstack.com/router/v1/docs/start/overview) (React + TypeScript)
- **Routing**: [TanStack Router](https://tanstack.com/router/v1/docs/guide/routing/introduction) (File-based Routing)
- **Styling**: [TailwindCSS v4](https://tailwindcss.com/) & [Lucide React](https://lucide.dev/) (Icons)
- **Komponen UI**: [shadcn/ui](https://ui.shadcn.com/) (Radix UI)
- **State & Data Fetching**: [TanStack React Query](https://tanstack.com/query/latest) & [Zod](https://zod.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Package Manager**: [Bun](https://bun.sh/) (Sangat direkomendasikan karena file `bun.lock` telah tersedia)

---

## 🚀 Cara Menjalankan Aplikasi

Ikuti langkah-langkah berikut untuk menjalankan proyek ini secara lokal:

### 1. Prasyarat (Prerequisites)
Pastikan Anda sudah menginstal alat-alat berikut di komputer Anda:
- [Node.js](https://nodejs.org/) (versi LTS terbaru)
- [Bun](https://bun.sh/) (Sangat direkomendasikan) atau Node Package Manager (npm/yarn/pnpm)

### 2. Instalasi Dependensi
Jalankan perintah berikut di terminal untuk menginstal semua dependensi proyek menggunakan Bun:

```bash
bun install
```

*Jika Anda menggunakan npm:*
```bash
npm install
```

### 3. Menjalankan Server Pengembangan (Development Server)
Jalankan server pengembangan lokal dengan perintah berikut:

```bash
bun run dev
```

*Jika Anda menggunakan npm:*
```bash
npm run dev
```

Setelah server berjalan, buka browser Anda dan akses:
👉 **[http://localhost:3000](http://localhost:3000)** (atau port yang tertera di terminal Anda).

---

## 📦 Build untuk Produksi

Untuk membuat bundle produksi yang dioptimalkan, jalankan perintah:

```bash
bun run build
```

Setelah build selesai, Anda dapat menguji hasil build produksi secara lokal menggunakan perintah:

```bash
bun run preview
```

---

## 📂 Struktur Folder Proyek

```text
├── .lovable/             # Konfigurasi Lovable integrations
├── public/               # Asset statis publik
└── src/
    ├── components/       # Komponen UI reusable (layout, ProductCard, dll.)
    │   ├── layout/       # Template layout halaman
    │   └── ui/           # Komponen UI dasar dari shadcn/ui
    ├── hooks/            # Custom React hooks (seperti use-mobile)
    ├── lib/              # Data tiruan (mock-data), error handlers, & utilitas
    └── routes/           # Routing berbasis file (TanStack Router)
        ├── __root.tsx    # Root layout dari aplikasi
        ├── index.tsx     # Halaman Beranda (Landing Page)
        ├── products.tsx  # Halaman Produk (Pre-Order & Ready Stock)
        ├── farmer.tsx    # Halaman/Dashboard Khusus Petani
        └── ...
```

---

*PANENKU Hub ID dikembangkan untuk mendukung ketahanan pangan dan kesejahteraan petani Indonesia. 🇮🇩*
