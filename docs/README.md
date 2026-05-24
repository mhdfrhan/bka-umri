# Website Resmi BKA — Biro Keuangan & Aset UMRI

Website informasi resmi Biro Keuangan dan Aset Universitas Muhammadiyah Riau.
Dibangun sebagai platform terpusat untuk menyampaikan informasi kelembagaan,
berita, pengumuman, dokumentasi kegiatan, dan distribusi lampiran internal kepada
civitas akademika dan publik.

---

## Gambaran Singkat

Website ini bukan sistem pengelolaan keuangan. Fokusnya adalah menjadi
**wajah digital resmi BKA UMRI** — informatif, mudah dikelola, dan dapat
diperbarui kapan saja tanpa bantuan developer.

Semua konten bersifat dinamis: banner, kata sambutan kepala biro, visi misi,
berita, pengumuman, lampiran, hingga informasi kontak — semuanya dapat diubah
melalui panel admin.

---

## Dokumentasi Proyek

| File | Isi |
|------|-----|
| [`docs/01-PRODUCT-OVERVIEW.md`](docs/01-PRODUCT-OVERVIEW.md) | Visi produk, tujuan, ruang lingkup, batasan, dan target non-fungsional |
| [`docs/02-USER-ROLES.md`](docs/02-USER-ROLES.md) | Definisi peran pengguna, matriks hak akses, dan aturan sesi |
| [`docs/03-SITEMAP.md`](docs/03-SITEMAP.md) | Struktur halaman, route naming, middleware, dan aturan redirect |
| [`docs/04-FEATURES.md`](docs/04-FEATURES.md) | Spesifikasi fitur per modul dengan validasi dan edge-case |
| [`docs/05-UIUX-GUIDELINES.md`](docs/05-UIUX-GUIDELINES.md) | Sistem desain: warna, tipografi, komponen, loading states, dan aturan visual |
| [`docs/06-TECH-STACK.md`](docs/06-TECH-STACK.md) | Stack teknologi, database schema, naming convention, dan arsitektur |
| [`docs/07-SECURITY.md`](docs/07-SECURITY.md) | Kebijakan keamanan: autentikasi, XSS/CSRF, file upload, rate limiting, audit |
| [`docs/08-FRONTEND-ROADMAP.md`](docs/08-FRONTEND-ROADMAP.md) | Roadmap frontend: halaman publik, admin panel, super admin, komponen, dan prioritas |
| [`docs/09-BACKEND-ROADMAP.md`](docs/09-BACKEND-ROADMAP.md) | Roadmap backend: migrations, models, controllers, services, policies, routes, dan prioritas |

---

## Tech Stack

- **Backend:** Laravel 11
- **Frontend:** React 18 + Inertia.js
- **Database:** MySQL 8
- **Styling:** Tailwind CSS (dari nol, tanpa template)
- **Auth:** Laravel Breeze (Inertia/React)

---

## Fase Pengembangan

```
Phase 1 — Core & CMS
  Beranda dinamis, Profil, Berita, Pengumuman, Kontak, Admin Panel

Phase 2 — Extended Features
  Dokumentasi/Galeri, Modul Lampiran, Manajemen Pengguna (Admin)

Phase 3 — Polish & Optimization
  SEO, statistik pengunjung, integrasi media sosial
```

---

## Catatan Penting

- Baca `05-UIUX-GUIDELINES.md` sebelum menulis satu baris kode frontend
- Baca `07-SECURITY.md` sebelum mengimplementasikan autentikasi dan form input
- Semua keputusan desain mengacu pada identitas visual logo BKA UMRI
- Konten website harus dapat dikelola 100% oleh staf non-developer
