# 01 — Product Overview

## Identitas Produk

| | |
|---|---|
| **Nama Sistem** | Website Resmi Biro Keuangan & Aset (BKA) UMRI |
| **Institusi** | Universitas Muhammadiyah Riau |
| **Tipe Produk** | Website Informasi Kelembagaan Dinamis |
| **Bahasa Antarmuka** | Indonesia |
| **Audiens Utama** | Civitas akademika UMRI, publik umum, anggota internal BKA |

---

## Pernyataan Masalah

BKA UMRI belum memiliki kanal informasi digital resmi yang terpusat. Informasi
kelembagaan seperti visi misi, struktur organisasi, berita kegiatan, dan
pengumuman tersebar atau tidak mudah diakses oleh civitas akademika maupun
publik. Selain itu, distribusi dokumen dan lampiran internal kepada anggota BKA
masih dilakukan secara manual.

---

## Tujuan Produk

1. Menyediakan satu pintu informasi resmi BKA UMRI yang dapat diakses publik
2. Memudahkan pengelolaan dan pembaruan konten oleh staf non-developer
3. Menjadi media publikasi resmi untuk berita dan pengumuman kelembagaan
4. Menyediakan akses terpusat untuk lampiran dan dokumen internal bagi anggota
5. Meningkatkan citra kelembagaan BKA sebagai biro yang profesional dan transparan

---

## Visi Produk

Menjadi platform digital resmi yang mencerminkan profesionalisme dan keterbukaan
informasi Biro Keuangan & Aset Universitas Muhammadiyah Riau.

---

## Definisi "Konten Dinamis"

Istilah "dinamis" dalam proyek ini berarti **CMS-driven** — seluruh konten
disimpan di database dan dapat diubah melalui panel admin tanpa menyentuh kode.

**Bukan berarti:**
- Real-time update (WebSocket, Server-Sent Events, polling)
- Live notification kepada pengunjung
- Konten yang berubah otomatis berdasarkan perilaku pengguna (personalisasi)

Semua perubahan konten baru terlihat setelah admin menyimpan dan halaman
di-refresh oleh pengunjung. Tidak ada mekanisme push update.

---

## Ruang Lingkup Sistem

### Termasuk dalam sistem ini

- Halaman profil kelembagaan (visi misi, tentang kami, sejarah)
- Informasi kepala biro beserta kata sambutan — dapat diganti sewaktu-waktu
- Struktur organisasi yang dapat diperbarui
- Manajemen berita dan pengumuman
- Galeri dokumentasi kegiatan
- Lampiran dan dokumen yang dapat diunduh secara bebas oleh publik
- Informasi kontak dan peta lokasi
- Panel admin untuk mengelola seluruh konten di atas
- Manajemen pengguna berdasarkan peran

### Tidak termasuk dalam sistem ini

- Pengelolaan anggaran atau pencatatan keuangan
- Sistem inventaris atau manajemen aset fisik
- Pengajuan atau persetujuan permintaan dana
- Integrasi dengan sistem akademik kampus (SIAK, SIMAK, dll)
- Forum diskusi, komentar, atau fitur komunitas
- Multi-bahasa (hanya Bahasa Indonesia)
- Dark mode
- Push notification / real-time update
- API publik untuk konsumsi pihak ketiga
- Fitur pencarian global full-text (cukup filter dan pencarian sederhana per modul)

---

## Target Pengguna

### Publik / Civitas Akademika (Termasuk Anggota BKA)
Siapa saja yang ingin mengetahui informasi tentang BKA UMRI — mahasiswa, dosen,
tenaga kependidikan, anggota internal BKA, maupun masyarakat umum. Mereka dapat
mengakses seluruh halaman informasi, termasuk mengunduh dokumen di modul Lampiran
tanpa perlu memiliki akun atau melakukan login.

### Admin & Super Admin
Staf BKA yang diberi wewenang untuk mengelola seluruh konten website melalui
panel admin. Mereka dapat memperbarui semua informasi, mengunggah berkas,
dan mengelola akun administrator lainnya.

---

## Batasan Non-Fungsional

| Aspek | Target |
|---|---|
| **Waktu muat halaman** | < 3 detik pada koneksi 3G (First Contentful Paint) |
| **Max upload gambar** | 2 MB per file |
| **Max upload dokumen** | 10 MB per file |
| **Format gambar** | JPG, PNG, WebP |
| **Format dokumen** | PDF, DOCX, XLSX, PPTX |
| **Browser support** | Chrome 90+, Firefox 90+, Safari 15+, Edge 90+ |
| **Responsivitas** | Mobile (360px+), Tablet (768px+), Desktop (1024px+) |
| **Concurrent users** | Didesain untuk skala kecil-menengah (< 500 concurrent) |
| **Aksesibilitas** | WCAG 2.1 Level AA minimal |
| **SEO** | Meta tags, Open Graph, sitemap.xml, robots.txt |

---

## Indikator Keberhasilan

- Seluruh konten dapat diperbarui tanpa intervensi developer
- Waktu muat halaman utama di bawah tiga detik pada jaringan rata-rata
- Tampilan tetap optimal di perangkat mobile, tablet, dan desktop
- Staf admin dapat mengoperasikan panel tanpa pelatihan teknis khusus
- Informasi yang ditampilkan selalu sinkron dengan kondisi terkini BKA

---

## Fase Pengembangan

### Phase 1 — Core (MVP)

Sistem dapat diakses publik dengan konten dasar dan panel admin fungsional.

| Fitur | Prioritas |
|---|---|
| Beranda (hero, sambutan, highlight berita/pengumuman) | WAJIB |
| Halaman Profil (tentang kami, visi misi, kepala biro, struktur org) | WAJIB |
| Modul Berita (CRUD + halaman publik) | WAJIB |
| Modul Pengumuman (CRUD + halaman publik) | WAJIB |
| Halaman Kontak (info + formulir pesan) | WAJIB |
| Panel Admin (dashboard, manajemen konten) | WAJIB |
| Autentikasi (login, logout, lupa password) | WAJIB |
| Statistik kelembagaan di beranda | OPSIONAL |

### Phase 2 — Extended

Fitur tambahan yang memperkaya website.

| Fitur | Prioritas |
|---|---|
| Galeri dokumentasi / album foto | WAJIB |
| Modul lampiran (kategori + berkas unduhan publik) | WAJIB |
| Manajemen akun Admin oleh Super Admin | WAJIB |
| Kategori berita | OPSIONAL |
| Jadwal publikasi berita (tunda publikasi) | OPSIONAL |

### Phase 3 — Polish

Optimasi dan penyempurnaan.

| Fitur | Prioritas |
|---|---|
| SEO (meta tags, Open Graph, sitemap.xml) | WAJIB |
| Optimasi performa (lazy load, image compression) | WAJIB |
| Statistik pengunjung sederhana di dashboard admin | OPSIONAL |
| Embed media sosial di footer | OPSIONAL |
| Pengalaman pengguna (animasi halus, skeleton loading) | OPSIONAL |
