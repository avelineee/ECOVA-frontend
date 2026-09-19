♻️ ECOVA Frontend

Eco Collection, Value & Action
Turn Waste Into Value.

ECOVA Frontend adalah antarmuka web untuk ECOVA, aplikasi Bank
Sampah Digital & Daur Ulang (Eco-Waste Management). Aplikasi membantu
nasabah mengajukan penyetoran sampah, memantau transaksi, memperoleh
poin setelah hasil timbang diverifikasi admin, dan menukarkan poin
dengan hadiah.

Frontend ini merupakan bagian dari Uji Kompetensi Keahlian (UKK) RPL
2026/2027 --- SMK Telkom Malang. ECOVA menggunakan arsitektur frontend
dan backend terpisah; frontend berkomunikasi dengan ECOVA Backend
melalui REST API.

🌱 About ECOVA

ECOVA merupakan singkatan dari Eco Collection, Value & Action.

Aplikasi memiliki dua role utama:

Nasabah --- mengajukan setoran, memantau transaksi dan poin,
melihat katalog hadiah, melakukan penukaran poin, serta mengelola
profil.

Admin Bank Sampah --- mengelola nasabah, kategori sampah,
setoran dan verifikasi timbang, jadwal penjemputan, hadiah,
penukaran poin, serta rekapitulasi.

Frontend menangani interaksi pengguna dan komunikasi API. Backend tetap
menjadi source of truth untuk data transaksi, hasil timbang
terverifikasi, dan perhitungan poin final.

✨ Key Features

Nasabah

Dashboard saldo poin dan ringkasan transaksi

Pengajuan setoran sampah multi-item

Metode setoran Antar dan Jemput

Pemilihan jadwal dan alamat penjemputan

Riwayat serta status setoran

Nota setoran dan rekap setoran bulanan

Katalog hadiah

Penukaran poin dan riwayat penukaran

Nota penukaran untuk transaksi selesai

Profil nasabah

Admin Bank Sampah

Dashboard statistik Bank Sampah

Grafik aktivitas setoran dan penukaran

Management data nasabah

Management kategori sampah

Management setoran dan verifikasi hasil timbang

Management jadwal penjemputan

Management hadiah

Management penukaran poin

Rekapitulasi bulanan

Profil admin/informasi unit Bank Sampah

Sidebar admin yang dapat di-collapse

👥 User Roles

Role                                Description

Nasabah                         Mengajukan setoran, memantau
transaksi, melihat saldo poin,
menukar poin, dan mengelola profil.

🛠️ Tech Stack

Technology               Usage

Next.js              Framework frontend dan App Router
React                Component-based user interface
TypeScript           Typed application code
Tailwind CSS         Styling antarmuka
Lucide React         Ikon antarmuka
REST API             Integrasi dengan ECOVA Backend
JWT / Bearer Token   Autentikasi request terproteksi

🔄 Application Flow

Flow Setoran Sampah

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

Berat yang dimasukkan nasabah saat pengajuan merupakan estimasi.
Admin kemudian memverifikasi berat aktual. Perhitungan poin final
dilakukan oleh backend berdasarkan data transaksi yang telah
diverifikasi; frontend bukan sumber perhitungan final.

Metode Setor

♻️ Antar

Nasabah membawa sampah langsung ke unit Bank Sampah ECOVA.

🚚 Jemput

Nasabah memilih jadwal penjemputan yang tersedia dan memasukkan alamat
penjemputan saat mengajukan setoran.

Tracking penjemputan berbeda dari status transaksi setoran:

menunggu
↓
menuju_lokasi
↓
sudah_diambil
↓
selesai

Status penjemputan menggambarkan proses pengambilan sampah, sedangkan
status setoran menggambarkan proses konfirmasi, verifikasi timbang, dan
penyelesaian transaksi.

🗺️ Pages / Routes

Route                         Role                    Description

/                           Public                  Landing page ECOVA

/login                      Public                  Login Nasabah/Admin

/register                   Public                  Registrasi Nasabah

/nasabah/dashboard          Nasabah                 Dashboard dan ringkasan
akun

/nasabah/setor              Nasabah                 Pengajuan setor sampah

/nasabah/riwayat            Nasabah                 Riwayat, status, nota,
dan rekap setoran

/nasabah/hadiah             Nasabah                 Katalog hadiah

/nasabah/penukaran          Nasabah                 Penukaran poin dan
riwayat penukaran

/nasabah/profile            Nasabah                 Profil nasabah

/admin/dashboard            Admin                   Dashboard Bank Sampah

/admin/users                Admin                   Management nasabah

/admin/kategori             Admin                   Management kategori
sampah

/admin/setoran              Admin                   Management dan
verifikasi setoran

/admin/jadwal-penjemputan   Admin                   Management jadwal
penjemputan

/admin/hadiah               Admin                   Management hadiah

/admin/penukaran            Admin                   Management penukaran
poin

/admin/rekap                Admin                   Rekapitulasi bulanan

📁 Project Structure

ecova-frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
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
│   ├── nasabah/
│   │   ├── dashboard/
│   │   ├── setor/
│   │   ├── riwayat/
│   │   ├── hadiah/
│   │   ├── penukaran/
│   │   └── profile/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── admin/
│   ├── nasabah/
│   ├── landing/
│   └── ui/
├── lib/
├── public/
│   └── images/
├── package.json
└── README.md

Folder hasil build, dependency terinstal, dan file environment lokal
tidak ditampilkan.

🔌 Backend Integration

ECOVA Frontend terintegrasi dengan ECOVA Backend REST API yang
dikelola pada repository terpisah.

Frontend Development : http://localhost:3001
Backend Development  : http://localhost:3000

Request ke endpoint terproteksi menggunakan:

Authorization: Bearer <access_token>

Pada flow autentikasi client-side yang diimplementasikan, access token
dan informasi user disimpan di localStorage. Ketika request
menghasilkan status unauthorized, data autentikasi dibersihkan dan
pengguna diarahkan kembali ke halaman login.

Path gambar backend seperti /uploads/... diselesaikan menggunakan base
URL backend sebelum ditampilkan.

Jangan pernah menyimpan JWT asli, password, DATABASE_URL, API
secret, atau credential lain di repository frontend.

🔐 Authentication & Authorization

Role aplikasi yang digunakan frontend:

nasabah
admin_bank

Redirect setelah login:

nasabah    → /nasabah/dashboard
admin_bank → /admin/dashboard

Frontend mengirim JWT melalui Bearer token untuk request yang
membutuhkan autentikasi. Validasi akses dan otorisasi final tetap
menjadi tanggung jawab backend.

⚙️ Environment Variables

Base URL REST API dikonfigurasi melalui environment variable Next.js:

NEXT_PUBLIC_API_URL=http://localhost:3000

Simpan file .env secara lokal dan jangan commit credential atau
secret.

NEXT_PUBLIC_ berarti nilainya dapat digunakan pada
browser/client-side. Karena itu, variabel tersebut hanya digunakan untuk
base URL API publik dan bukan untuk password, JWT secret, database
URL, atau private API key.

📦 Installation

Pastikan Node.js, npm, dan ECOVA Backend tersedia.

git clone <frontend-repository-url>
cd ecova-frontend
npm install

Siapkan .env:

NEXT_PUBLIC_API_URL=http://localhost:3000

💻 Running Development Server

npm run dev

Buka:

http://localhost:3001

Backend development harus berjalan secara terpisah pada:

http://localhost:3000

🚀 Build for Production

npm run build
npm run start

Untuk deployment, ubah NEXT_PUBLIC_API_URL pada environment hosting
agar mengarah ke ECOVA Backend yang sudah di-deploy.

🔗 Related Repository

ECOVA menggunakan arsitektur frontend dan backend terpisah.

Frontend: repository ini

Backend: ECOVA
Backend

Backend ECOVA dibuat menggunakan NestJS, Prisma, dan
PostgreSQL/Supabase serta menyediakan REST API yang digunakan
frontend.

🖼️ Screenshots

Screenshots of the ECOVA interface will be added here.

👩‍💻 Developer

Aveline Voleta Wardani
Software Engineering Student
SMK Telkom Malang

Project:
Uji Kompetensi Keahlian RPL 2026/2027

📚 Project Information

Information                 Detail

Project Name            ECOVA
Full Name               Eco Collection, Value & Action
Tagline                 Turn Waste Into Value.
Category                Digital Waste Bank / Eco-Waste Management
Frontend Architecture   Next.js App Router
API Architecture        REST API
Authentication          JWT Bearer Authentication
Project Type            Uji Kompetensi Keahlian RPL 2026/2027
School                  SMK Telkom Malang

<p align="center">

<strong>{=html}ECOVA --- Eco Collection, Value &
Action</strong>{=html}<br />{=html} <em>{=html}Turn Waste Into
Value.</em>{=html}

</p>
