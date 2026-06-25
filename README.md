# E-ARSIP ANGKUTAN UDARA OTBAN X ✈️📂

Sistem e-Arsip Dokumen Angkutan Udara Otoritas Bandar Udara (OTBAN) Wilayah X Merauke. Aplikasi web full-stack modern, responsif, berkinerja tinggi, dan aman untuk mendigitalisasi dokumen pengawasan, rapat, program PPRP, lalu lintas udara, dan rekonsiliasi.

---

## 🎨 FITUR UTAMA & DESAIN
*   **Aesthetic Identity**: Antarmuka modern yang disesuaikan dengan skema warna OTBAN X (Hijau, Biru, Putih). Mendukung **Mode Terang (Light Mode)** dan **Mode Gelap (Dark Mode)** dengan penyimpanan preferensi otomatis.
*   **Secure Authentication**: Login multi-level menggunakan JSON Web Token (JWT) yang aman, fitur *Remember Me*, perlindungan rute (*Protected Routes*), opsi *Show/Hide Password*, serta penanganan *Session Timeout* otomatis.
*   **Struktur Arsip Interaktif**: Akses dokumen intuitif mengikuti alur: **Kategori** ➔ **Daftar Bandar Udara** ➔ **Daftar Tahun** ➔ **Manajemen Dokumen**.
*   **Analitik Grafis**: Dasbor interaktif menampilkan metrik dokumen total, unggahan tahun berjalan, serta bagan visual **Dokumen Per Tahun** & **Dokumen Per Kategori** menggunakan library Recharts.
*   **Pencarian & Penyaringan**: Dukungan pencarian *real-time* berskala besar, filter kategori/bandara/tahun, serta paginasi tabel data.
*   **Manajemen Admin & Bandara**: CRUD penuh bagi super-admin untuk menambah/mengedit/menghapus akun pegawai serta daftar bandara di Papua.
*   **Log Aktivitas Lengkap**: Rekaman audit otomatis terhadap semua aktivitas admin (Login, Upload, Edit, Download, Hapus).

---

## 🗄️ STRUKTUR FOLDER PROYEK
```text
├── data/
│   └── db.json              # Local Database (JSON-based persistence untuk dev sandbox)
├── prisma/
│   ├── schema.prisma        # Skema Prisma ORM untuk PostgreSQL (Neon DB)
│   └── schema.sql           # Skema SQL DDL mentah untuk migrasi manual PostgreSQL
├── server/
│   └── db.ts                # Layanan CRUD Database Lokal & Auto-Seeding
├── src/
│   ├── components/
│   │   ├── ActivityLogs.tsx # Viewer Log Aktivitas & Jejak Audit
│   │   ├── AdminManager.tsx # Panel Manajemen CRUD Admin
│   │   ├── AirportManager.tsx# Panel Manajemen CRUD Bandar Udara
│   │   ├── AirportSelector.tsx# Alur Navigasi Folder Bandara & Tahun
│   │   ├── DashboardView.tsx# Dasbor Analitik Utama & Grafik Recharts
│   │   ├── DocumentManager.tsx# CRUD Dokumen, Upload & Preview Modal
│   │   ├── LoginScreen.tsx  # Halaman Gerbang Masuk Aplikasi
│   │   ├── Navbar.tsx       # Header Navigasi, Jam WIT, Tema Toggle
│   │   ├── OtbanLogo.tsx    # Logo Vektor OTBAN Wilayah X
│   │   ├── Sidebar.tsx      # Sidebar Menu Utama
│   │   └── Toast.tsx        # Toast Notifikasi Dinamis
│   ├── App.tsx              # Router Utama, Pengatur State & Tema
│   ├── index.css            # Desain Tipografi (Inter, Space Grotesk)
│   ├── main.tsx             # Entry Point React
│   └── types.ts             # Definisi Tipe Data TypeScript Global
├── .env.example             # Contoh variabel lingkungan
├── package.json             # Konfigurasi dependensi full-stack
├── server.ts                # Entry Point Server Express & Vite Integration
└── vite.config.ts           # Konfigurasi Bundler Vite
```

---

## 🔑 KREDENSIAL LOGIN DEFAULT
*   **Username**: `angud2026`
*   **Password**: `otban10`

---

## ⚙️ INTEGRASI POSTGRESQL (NEON DATABASE) & PRISMA ORM

Aplikasi ini siap digunakan langsung dengan Neon PostgreSQL. Ikuti langkah di bawah untuk beralih dari database lokal ke PostgreSQL:

1.  **Daftar Akun Neon Database**:
    *   Kunjungi [Neon.tech](https://neon.tech) dan buat database PostgreSQL baru.
    *   Salin baris **Connection String** yang diberikan.

2.  **Konfigurasi `.env`**:
    Tambahkan variabel lingkungan di proyek Anda:
    ```env
    DATABASE_URL="postgresql://[user]:[password]@[host]/neondb?sslmode=require"
    JWT_SECRET="kunci-rahasia-otbanx-anda"
    ```

3.  **Inisialisasi Prisma & Sinkronisasi Skema**:
    Jalankan perintah berikut di terminal Anda untuk menginstal client dan mendorong skema ke Neon DB:
    ```bash
    # Install Prisma CLI
    npm install prisma --save-dev
    
    # Generate Prisma Client
    npx prisma generate
    
    # Push skema langsung ke Neon DB
    npx prisma db push
    
    # Lakukan seeding awal data admin, bandara, tahun & kategori
    npx prisma db seed
    ```

---

## ☁️ INTEGRASI CLOUD FILE STORAGE (UPLOADTHING / CLOUDINARY)

Untuk penyimpanan file skala besar di Vercel, disarankan menggunakan **UploadThing** atau **Cloudinary** agar dokumen PDF/Excel aman:

### Menggunakan UploadThing (Rekomendasi Vercel)
1.  Daftar akun gratis di [UploadThing.com](https://uploadthing.com).
2.  Dapatkan `UPLOADTHING_SECRET` dan `UPLOADTHING_APP_ID`.
3.  Ubah baris unggahan di `/server.ts` bagian endpoint `/api/dokumen` untuk menggunakan API UploadThing:
    ```typescript
    import { utapi } from "./server/uploadthing"; // Buat konfigurasi UploadThing
    
    // Upload file ke awan
    const response = await utapi.uploadFiles(req.file);
    const fileUrl = response.data.url; // Gunakan URL awan untuk disimpan di database
    ```

---

## 🚀 PANDUAN DEPLOYMENT

### A. Deploy ke GitHub
1.  Buat repositori baru di GitHub (misal: `e-arsip-otbanx`).
2.  Buka terminal pada direktori lokal proyek dan jalankan perintah:
    ```bash
    git init
    git add .
    git commit -m "Initial commit: E-Arsip OTBAN X"
    git branch -M main
    git remote add origin https://github.com/USERNAME/e-arsip-otbanx.git
    git push -u origin main
    ```

### B. Deploy ke Vercel (Full-Stack Support)
Vercel mendukung deployment server Express melalui **Serverless Functions** menggunakan file konfigurasi `vercel.json` di root folder:

1.  **Buat file `vercel.json`** di root folder:
    ```json
    {
      "version": 2,
      "builds": [
        {
          "src": "server.ts",
          "use": "@vercel/node"
        },
        {
          "src": "package.json",
          "use": "@vercel/next"
        }
      ],
      "routes": [
        {
          "src": "/api/(.*)",
          "dest": "server.ts"
        },
        {
          "src": "/uploads/(.*)",
          "dest": "server.ts"
        },
        {
          "src": "/(.*)",
          "dest": "/dist/$1"
        }
      ]
    }
    ```
2.  **Hubungkan Akun Vercel**:
    *   Buka dasbor Vercel dan klik **Add New Project**.
    *   Impor repositori GitHub `e-arsip-otbanx` yang sudah Anda buat.
3.  **Isi Environment Variables** di Vercel Settings:
    *   `DATABASE_URL` = (Salinan tautan Neon DB Anda)
    *   `JWT_SECRET` = (Kunci rahasia JWT Anda)
    *   `NODE_ENV` = `production`
4.  Klik **Deploy**! Proyek Anda akan aktif dalam beberapa detik.
