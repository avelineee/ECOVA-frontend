# ♻️ ECOVA Frontend

<p align="center">
  <strong>Eco Collection, Value & Action</strong><br />
  <em>Turn Waste Into Value.</em>
</p>

---

## 🌱 About ECOVA

**ECOVA Frontend** adalah antarmuka web untuk **ECOVA (Eco Collection, Value & Action)**, sebuah aplikasi **Bank Sampah Digital & Daur Ulang (Eco-Waste Management)**.

ECOVA membantu nasabah mengajukan penyetoran sampah, memantau transaksi, memperoleh poin berdasarkan hasil timbang yang telah diverifikasi Admin, serta menukarkan poin dengan berbagai hadiah yang tersedia.

Frontend ini merupakan bagian dari project **Uji Kompetensi Keahlian (UKK) RPL 2026/2027 — SMK Telkom Malang**.

ECOVA menggunakan arsitektur **frontend dan backend terpisah**. Frontend dibangun menggunakan **Next.js** dan berkomunikasi dengan **ECOVA Backend** melalui REST API.

### Eco Collection, Value & Action

Nama **ECOVA** menggambarkan tiga proses utama aplikasi:

- **Eco Collection** — mengumpulkan dan mengelola sampah yang dapat didaur ulang.
- **Value** — mengubah sampah menjadi nilai berupa poin.
- **Action** — mendorong aksi nyata dalam menjaga lingkungan.

Frontend menangani interaksi pengguna dan komunikasi dengan API, sedangkan **backend tetap menjadi source of truth** untuk data transaksi, hasil timbang terverifikasi, saldo poin, dan perhitungan poin final.

---

## ✨ Key Features

ECOVA memiliki dua role utama, yaitu **Nasabah** dan **Admin Bank Sampah**.

### 👤 Nasabah

Nasabah dapat:

- Melihat dashboard saldo poin dan ringkasan transaksi.
- Mengajukan penyetoran sampah secara multi-item.
- Memilih metode setoran **Antar** atau **Jemput**.
- Memilih jadwal penjemputan.
- Memasukkan alamat penjemputan.
- Melihat riwayat dan status setoran.
- Melihat detail dan nota transaksi setoran.
- Melihat rekap setoran berdasarkan bulan.
- Melihat katalog hadiah.
- Menukarkan poin dengan hadiah.
- Melihat riwayat penukaran poin.
- Melihat nota transaksi penukaran.
- Mengelola profil Nasabah.

### 🛠️ Admin Bank Sampah

Admin dapat:

- Melihat dashboard statistik Bank Sampah.
- Melihat aktivitas setoran dan penukaran.
- Mengelola data Nasabah.
- Mengelola kategori sampah.
- Mengelola transaksi setoran.
- Mengonfirmasi pengajuan setoran.
- Melakukan verifikasi hasil timbang.
- Mengelola jadwal penjemputan.
- Mengelola hadiah.
- Mengelola transaksi penukaran poin.
- Melihat rekapitulasi bulanan.
- Mengelola profil dan informasi unit Bank Sampah.

---

## 👥 User Roles

| Role | Description |
| --- | --- |
| **Nasabah** | Mengajukan setoran, memantau transaksi, melihat saldo poin, menukar poin dengan hadiah, dan mengelola profil. |
| **Admin Bank Sampah** | Mengelola Nasabah, kategori sampah, setoran, hasil timbang, jadwal penjemputan, hadiah, penukaran poin, dan rekapitulasi. |

---

## 🛠️ Tech Stack

| Technology | Usage |
| --- | --- |
| **Next.js** | Frontend framework dan App Router |
| **React** | Component-based user interface |
| **TypeScript** | Typed application development |
| **Tailwind CSS** | Styling antarmuka |
| **Lucide React** | Icon library |
| **REST API** | Integrasi dengan ECOVA Backend |
| **JWT / Bearer Token** | Autentikasi request terproteksi |

---

## 🔄 Application Flow

### ♻️ Waste Deposit Flow

Nasabah memasukkan estimasi berat sampah ketika membuat pengajuan.

Setelah sampah diterima, Admin melakukan verifikasi dan memasukkan hasil timbang aktual. Backend kemudian menghitung ulang poin berdasarkan hasil timbang yang telah diverifikasi.

```text
Nasabah Mengajukan Setoran
            ↓
   belum_dikonfirmasi
            ↓
      Admin Konfirmasi
            ↓
        diproses
            ↓
Admin Verifikasi Hasil Timbang
            ↓
 Backend Menghitung Poin Final
            ↓
         selesai
            ↓
 Poin Masuk ke Saldo Nasabah
```

Berat yang dimasukkan Nasabah merupakan **estimasi awal**, sedangkan berat hasil verifikasi Admin digunakan untuk menentukan poin final.

Frontend dapat menampilkan preview perhitungan, tetapi **backend tetap menjadi sumber perhitungan dan data final**.

---

## 🚚 Deposit Methods

ECOVA mendukung dua metode penyetoran sampah.

### 🏦 Antar

Nasabah membawa sampah secara langsung ke unit Bank Sampah ECOVA.

Nasabah dapat melihat informasi operasional seperti:

- Nama unit Bank Sampah
- Alamat
- Nomor telepon
- Hari operasional
- Jam buka
- Jam tutup

### 🚚 Jemput

Nasabah dapat meminta sampah dijemput dengan:

1. Memilih jadwal penjemputan yang tersedia.
2. Memasukkan alamat penjemputan.
3. Mengajukan setoran.
4. Memantau proses penjemputan.

Tracking penjemputan:

```text
menunggu
    ↓
menuju_lokasi
    ↓
sudah_diambil
    ↓
selesai
```

> **Catatan:** status penjemputan berbeda dengan status transaksi setoran. Status penjemputan menunjukkan proses pengambilan sampah, sedangkan status setoran menunjukkan proses konfirmasi, verifikasi timbang, dan penyelesaian transaksi.

---

## 🗺️ Pages & Routes

### Public

| Route | Description |
| --- | --- |
| `/` | Landing page ECOVA |
| `/login` | Login Nasabah dan Admin |
| `/register` | Registrasi Nasabah |

### Nasabah

| Route | Description |
| --- | --- |
| `/nasabah/dashboard` | Dashboard dan ringkasan akun |
| `/nasabah/setor` | Pengajuan setor sampah |
| `/nasabah/riwayat` | Riwayat, status, nota, dan rekap setoran |
| `/nasabah/hadiah` | Katalog hadiah |
| `/nasabah/penukaran` | Penukaran poin dan riwayat penukaran |
| `/nasabah/profile` | Profil Nasabah |

### Admin Bank Sampah

| Route | Description |
| --- | --- |
| `/admin/dashboard` | Dashboard Bank Sampah |
| `/admin/users` | Management data Nasabah |
| `/admin/kategori` | Management kategori sampah |
| `/admin/setoran` | Management dan verifikasi setoran |
| `/admin/jadwal-penjemputan` | Management jadwal penjemputan |
| `/admin/hadiah` | Management hadiah |
| `/admin/penukaran` | Management transaksi penukaran poin |
| `/admin/rekap` | Rekapitulasi bulanan |
| `/admin/profile` | Profil dan informasi unit Bank Sampah |

---

## 📁 Project Structure

```text
ecova-frontend/
│
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   │
│   ├── admin/
│   │   ├── dashboard/
│   │   ├── users/
│   │   ├── kategori/
│   │   ├── setoran/
│   │   ├── jadwal-penjemputan/
│   │   ├── hadiah/
│   │   ├── penukaran/
│   │   ├── rekap/
│   │   └── profile/
│   │
│   ├── nasabah/
│   │   ├── dashboard/
│   │   ├── setor/
│   │   ├── riwayat/
│   │   ├── hadiah/
│   │   ├── penukaran/
│   │   └── profile/
│   │
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── admin/
│   ├── nasabah/
│   ├── landing/
│   └── ui/
│
├── lib/
├── public/
│   └── images/
│
├── package.json
└── README.md
```

Folder hasil build, dependency yang telah terinstal, dan environment lokal tidak disimpan di repository.

---

## 🔌 Backend Integration

ECOVA Frontend terintegrasi dengan **ECOVA Backend REST API** yang dikelola pada repository terpisah.

### Development URLs

```text
Frontend : http://localhost:3001
Backend  : http://localhost:3000
```

Request ke endpoint yang membutuhkan autentikasi menggunakan JWT Bearer Token:

```text
Authorization: Bearer <access_token>
```

Pada flow autentikasi client-side, access token dan informasi user digunakan untuk mempertahankan sesi pengguna dan melakukan request ke endpoint protected.

Jika autentikasi tidak valid atau session berakhir, pengguna diarahkan kembali ke halaman login.

Path gambar dari backend seperti:

```text
/uploads/...
```

diselesaikan menggunakan base URL backend sebelum ditampilkan pada frontend.

> Jangan menyimpan JWT asli, password, `DATABASE_URL`, API secret, atau credential lainnya di repository frontend.

---

## 🔐 Authentication & Authorization

Role yang digunakan ECOVA:

```text
nasabah
admin_bank
```

Redirect setelah login:

```text
nasabah
→ /nasabah/dashboard

admin_bank
→ /admin/dashboard
```

Frontend menggunakan role pengguna untuk menentukan navigasi dan halaman yang sesuai.

Validasi keamanan dan otorisasi final tetap dilakukan oleh **ECOVA Backend**.

---

## ⚙️ Environment Variables

Base URL ECOVA Backend dapat dikonfigurasi melalui environment variable Next.js:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Buat file `.env` atau `.env.local` pada environment development sesuai konfigurasi project.

> File environment lokal tidak boleh di-commit apabila berisi informasi sensitif.

Karena variable dengan prefix `NEXT_PUBLIC_` dapat digunakan di browser, variable tersebut **tidak boleh digunakan untuk menyimpan password, JWT secret, database URL, atau private API key**.

---

## 📦 Installation

### 1. Clone Repository

```bash
git clone <frontend-repository-url>
```

Masuk ke directory project:

```bash
cd ecova-frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Buat konfigurasi environment:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Pastikan **ECOVA Backend** juga sudah dikonfigurasi dan berjalan.

---

## 💻 Running Development Server

Jalankan:

```bash
npm run dev
```

Frontend dapat diakses melalui:

```text
http://localhost:3001
```

Sedangkan backend berjalan secara terpisah pada:

```text
http://localhost:3000
```

---

## 🚀 Build for Production

Build aplikasi:

```bash
npm run build
```

Kemudian jalankan production server:

```bash
npm run start
```

Untuk deployment, sesuaikan:

```env
NEXT_PUBLIC_API_URL=<deployed-backend-url>
```

dengan URL ECOVA Backend yang telah di-deploy.

---

## 🔗 Related Repository

ECOVA menggunakan arsitektur frontend dan backend terpisah.

- **Frontend:** Repository ini
- **Backend:** `ECOVA-backend`

Backend ECOVA dikembangkan menggunakan **NestJS, TypeScript, Prisma ORM, dan PostgreSQL/Supabase** serta menyediakan REST API yang digunakan oleh frontend.

---

## 🖼️ Screenshots

Screenshots tampilan ECOVA dapat ditambahkan pada bagian ini setelah dokumentasi visual project tersedia.

Contoh halaman yang dapat didokumentasikan:

- Landing Page
- Login & Register
- Nasabah Dashboard
- Pengajuan Setoran
- Riwayat Setoran
- Katalog Hadiah
- Admin Dashboard
- Management Setoran
- Rekapitulasi

---

## 📚 Project Information

| Information | Detail |
| --- | --- |
| **Project Name** | ECOVA |
| **Full Name** | Eco Collection, Value & Action |
| **Tagline** | Turn Waste Into Value. |
| **Category** | Digital Waste Bank / Eco-Waste Management |
| **Frontend Architecture** | Next.js App Router |
| **API Architecture** | REST API |
| **Authentication** | JWT Bearer Authentication |
| **Project Type** | Uji Kompetensi Keahlian RPL 2026/2027 |
| **School** | SMK Telkom Malang |

---

## 👩‍💻 Developer

**Aveline Voleta Wardani**  
Software Engineering Student  
SMK Telkom Malang

**Project:** Uji Kompetensi Keahlian RPL 2026/2027

---

<p align="center">
  <strong>♻️ ECOVA — Eco Collection, Value & Action</strong>
  <br />
  <em>Turn Waste Into Value.</em>
</p>
