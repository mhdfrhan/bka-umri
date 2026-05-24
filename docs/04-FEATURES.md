# 04 — Spesifikasi Fitur

## Modul 1 — Beranda

Beranda adalah halaman pertama yang dilihat pengunjung. Semua elemen di halaman
ini harus bisa dikelola dari admin panel tanpa menyentuh kode.

### Banner / Hero Slider

Admin dapat menambah, mengubah, menghapus, dan mengatur urutan slide.
Setiap slide memiliki: gambar latar, judul teks, teks deskripsi singkat,
teks tombol, dan tautan tombol (opsional). Jika hanya satu slide, tampilkan
sebagai hero statis, bukan slider.

**Validasi & Aturan:**

| Field | Tipe | Validasi |
|---|---|---|
| Gambar latar | File | Wajib. JPG/PNG/WebP. Max 2 MB. Rasio 16:9 (rekomendasi min 1920×1080px) |
| Judul teks | String | Wajib. Max 100 karakter |
| Deskripsi | String | Opsional. Max 200 karakter |
| Teks tombol | String | Opsional. Max 30 karakter |
| Tautan tombol | URL | Opsional. Harus URL valid (internal atau eksternal) |
| Urutan | Integer | Wajib. Dimulai dari 1. Bisa di-drag & drop di admin |

**Batasan:** Maksimal **5 slide** aktif.

**Edge-case:**
- Jika tidak ada slide: tampilkan hero statis dengan gambar placeholder dan
  judul default "Biro Keuangan & Aset UMRI"
- Jika hanya 1 slide: sembunyikan navigasi slider (dots/arrows), tampilkan sebagai hero statis
- Slider auto-play dengan interval **5 detik**, pause saat hover

### Kata Sambutan Kepala Biro

Menampilkan foto, nama lengkap, jabatan, periode jabatan, dan teks sambutan
dari kepala biro. Ketika terjadi pergantian kepala biro, admin cukup mengubah
data di panel tanpa harus membuat ulang apapun. Desain seksi ini harus terasa
personal dan hangat, bukan kaku seperti pengumuman biasa.

**Validasi & Aturan:**

| Field | Tipe | Validasi |
|---|---|---|
| Foto | File | Wajib. JPG/PNG. Max 1 MB. Rasio 3:4 atau 1:1 |
| Nama lengkap | String | Wajib. Max 100 karakter |
| Jabatan | String | Wajib. Max 100 karakter (contoh: "Kepala Biro Keuangan & Aset") |
| Periode | String | Wajib. Max 50 karakter (contoh: "2023 — Sekarang") |
| Teks sambutan | Rich Text | Wajib. Max 2000 karakter (plain text count). Heading tidak diperbolehkan di sini |

**Edge-case:**
- Jika data belum diisi: sembunyikan seluruh seksi dari beranda (bukan tampilkan kosong)

### Sorotan Berita & Pengumuman Terbaru

Menampilkan **3 berita terbaru** dan **3 pengumuman terbaru** secara otomatis
dari konten yang berstatus `terpublikasi`. Tidak perlu dikelola manual.

**Urutan:** Berdasarkan `tanggal_publikasi DESC` (terbaru dulu).

**Edge-case:**
- Jika berita kurang dari 3: tampilkan yang ada saja (1 atau 2)
- Jika tidak ada berita sama sekali: sembunyikan seluruh seksi berita dari beranda
- Aturan yang sama berlaku untuk pengumuman

### Statistik Kelembagaan (Opsional, Statis)

Beberapa angka ringkas yang mencerminkan BKA — misalnya tahun berdiri,
jumlah program, atau angka relevan lainnya. Diisi manual oleh admin dan
berupa tampilan dekoratif, bukan data real-time.

**Validasi:** Maksimal **4 item** statistik. Setiap item memiliki:

| Field | Tipe | Validasi |
|---|---|---|
| Angka | String | Wajib. Max 10 karakter (contoh: "2015", "12+", "500+") |
| Label | String | Wajib. Max 50 karakter (contoh: "Tahun Berdiri") |
| Ikon (opsional) | Select | Pilihan dari daftar ikon Lucide yang sudah dikurasi |

### Bidang / Bagian BKA (Dinamis)

Menampilkan daftar bidang atau bagian yang ada di BKA. Setiap bidang memiliki
halaman detail sendiri yang bisa diakses dari tombol "Lebih Banyak".
Admin dapat menambah, mengubah, menghapus, dan mengatur urutan bidang.

Di beranda, bidang ditampilkan sebagai grid 2 kolom dengan nomor urut,
nama bidang, deskripsi singkat, dan tombol aksi.

**Validasi per bidang:**

| Field | Tipe | Validasi |
|---|---|---|
| Nama bidang | String | Wajib. Max 100 karakter |
| Slug | String | Auto-generate dari nama. Bisa diedit. Harus unik |
| Deskripsi singkat | String | Wajib. Max 200 karakter (ditampilkan di card beranda) |
| Deskripsi lengkap | Rich Text | Wajib. Max 2000 karakter (ditampilkan di halaman detail). Heading H2 dan H3 saja |
| Banner | File | Opsional. JPG/PNG/WebP. Max 2 MB. Rasio 16:9 |
| Urutan | Integer | Wajib. Dimulai dari 1 |

**Batasan:** Maksimal **6 bidang** aktif.

**Edge-case:**
- Jika tidak ada bidang: sembunyikan seluruh seksi dari beranda
- Jika hanya 1 bidang: tetap tampilkan sebagai card tunggal

#### Halaman Detail Bidang (`/bidang/{slug}`)

Setiap bidang memiliki halaman detail tersendiri yang berisi:
banner, deskripsi lengkap, struktur (kepala bagian + anggota), dan CTA.

**Validasi kepala bagian per bidang:**

| Field | Tipe | Validasi |
|---|---|---|
| Foto | File | Wajib. JPG/PNG. Max 1 MB. Rasio 3:4 atau 1:1 |
| Nama lengkap | String | Wajib. Max 100 karakter |
| Jabatan | String | Wajib. Max 100 karakter |
| Deskripsi tugas | Textarea | Opsional. Max 500 karakter |
| Media sosial | JSON/Array | Opsional. Masing-masing: platform (select: Facebook, Twitter, Instagram, LinkedIn) + URL |

**Validasi anggota per bidang:**

| Field | Tipe | Validasi |
|---|---|---|
| Foto | File | Opsional. JPG/PNG. Max 1 MB. Rasio 1:1 |
| Nama | String | Wajib. Max 100 karakter |
| Jabatan | String | Wajib. Max 100 karakter |
| Urutan | Integer | Wajib. Untuk mengatur posisi di grid |

**Batasan anggota:** Maksimal **20 anggota** per bidang (tidak termasuk kepala bagian).

**Validasi CTA per bidang:**

| Field | Tipe | Validasi |
|---|---|---|
| Teks CTA heading | String | Opsional. Max 100 karakter |
| Teks CTA sub | String | Opsional. Max 100 karakter |
| Teks tombol | String | Opsional. Max 30 karakter |
| Tautan tombol | URL | Opsional. Harus URL valid |

**Edge-case:**
- Jika kepala bagian belum diisi: sembunyikan seksi struktur dari halaman detail
- Jika tidak ada anggota: sembunyikan grid anggota, tampilkan kepala bagian saja
- Jika CTA kosong: sembunyikan seksi CTA dari halaman detail

### Layanan BKA (Dinamis)

Menampilkan layanan utama yang disediakan BKA untuk civitas akademika.
Ditampilkan sebagai daftar item layanan di sisi kiri dan embed video YouTube
di sisi kanan. Admin dapat mengelola item layanan dan URL video.

**Validasi section:**

| Field | Tipe | Validasi |
|---|---|---|
| Judul section | String | Wajib. Max 100 karakter |
| Deskripsi section | String | Opsional. Max 300 karakter |
| URL YouTube embed | URL | Opsional. Harus URL embed YouTube valid (`youtube.com/embed/...`) |

**Validasi per item layanan:**

| Field | Tipe | Validasi |
|---|---|---|
| Judul | String | Wajib. Max 100 karakter |
| Deskripsi | String | Wajib. Max 300 karakter |
| Ikon (opsional) | Select | Pilihan dari daftar ikon Lucide yang sudah dikurasi |
| Urutan | Integer | Wajib. Dimulai dari 1 |

**Batasan:** Maksimal **6 item** layanan.

**Edge-case:**
- Jika tidak ada item layanan: sembunyikan seluruh seksi dari beranda
- Jika URL YouTube kosong: sembunyikan area video, item layanan tampil full-width
- Jika hanya ada 1–2 item: tetap tampilkan dengan layout yang sama

## Modul 2 — Profil

### Tentang Kami

Teks panjang yang mendeskripsikan BKA: latar belakang, fungsi, dan peran
dalam universitas. Diedit menggunakan rich text editor.

**Validasi:** Konten wajib diisi. Tidak ada batas karakter ketat, tapi
editor membatasi heading hanya H2 dan H3 (bukan H1 — itu milik judul halaman).

**Edge-case:** Jika konten kosong, halaman tetap bisa diakses tapi tampilkan
pesan: "Konten sedang diperbarui."

### Visi & Misi

Field terpisah untuk visi (satu paragraf atau beberapa kalimat) dan misi
(daftar poin yang bisa ditambah, diedit, atau dihapus satu per satu).
Tampilan di frontend harus bersih dan mudah dibaca, bukan sekadar daftar teks.

**Validasi:**

| Field | Tipe | Validasi |
|---|---|---|
| Visi | Textarea | Wajib. Max 500 karakter |
| Misi (item) | String | Wajib per item. Max 200 karakter |
| Jumlah misi | — | Min 1 item, max 10 item |

### Kepala Biro

Data kepala biro yang dikelola di panel admin dan ditampilkan di halaman
profil maupun beranda. Satu record yang sama — bukan duplikat.

**Validasi:** Sama dengan yang tertera di seksi beranda.

### Struktur Organisasi

Dua opsi yang bisa dipakai bersamaan atau salah satu:

- **Gambar bagan:** Upload gambar bagan organisasi (PNG/JPG, max 5 MB) yang
  bisa diklik untuk zoom (lightbox)
- **Daftar anggota:** Grid kartu dengan jabatan, nama, dan foto per orang

**Validasi anggota:**

| Field | Tipe | Validasi |
|---|---|---|
| Foto | File | Opsional. JPG/PNG. Max 1 MB. Rasio 1:1 |
| Nama | String | Wajib. Max 100 karakter |
| Jabatan | String | Wajib. Max 100 karakter |
| Urutan | Integer | Wajib. Untuk mengatur posisi di grid |

---

## Modul 3 — Berita

Sistem publikasi berita kelembagaan BKA.

### Daftar Berita (Frontend)

Tampil sebagai grid kartu dengan thumbnail, kategori, judul, tanggal,
dan kutipan singkat. Ada fitur pencarian dan filter berdasarkan kategori.
Pagination tersedia di bagian bawah.

**Urutan default:** `tanggal_publikasi DESC` (terbaru dulu).
**Item per halaman:** 9 (3×3 grid di desktop).
**Pencarian:** Berdasarkan judul berita (LIKE query, case-insensitive).
**Filter kategori:** Dropdown atau pill buttons di atas grid.

### Detail Berita (Frontend)

Halaman penuh satu berita: judul, tanggal, kategori, thumbnail besar,
isi lengkap (hasil dari rich text editor), dan tombol berbagi ke media sosial.
Di bagian bawah, tampilkan tiga berita terkait (dari kategori yang sama)
atau terbaru jika tidak cukup.

**Berbagi:** Tombol share ke WhatsApp, Facebook, dan copy link.

### Pengelolaan Berita (Admin)

Admin dapat membuat, mengubah, menghapus (soft delete) berita.

**Validasi per field:**

| Field | Tipe | Validasi |
|---|---|---|
| Judul | String | Wajib. Min 10, max 200 karakter |
| Slug | String | Auto-generate dari judul. Bisa diedit. Harus unik. Hanya huruf kecil, angka, dash |
| Kategori | Select | Opsional. Pilih dari kategori yang ada |
| Thumbnail | File | Wajib. JPG/PNG/WebP. Max 2 MB. Rasio 16:9 |
| Isi | Rich Text | Wajib. Min 50 karakter (plain text count) |
| Status | Enum | `draf` / `terpublikasi` / `diarsipkan`. Default: `draf` |
| Tanggal publikasi | DateTime | Opsional. Jika diisi masa depan, berita tidak tampil sampai waktu tersebut |

**Soft delete behavior:**
- Berita yang dihapus tidak tampil di frontend
- URL `/berita/{slug}` dari berita yang sudah dihapus menampilkan **404**
- Berita yang dihapus tetap ada di database (recoverable via database jika diperlukan)

### Kategori Berita

Admin dapat membuat dan menghapus kategori berita secara bebas.

**Validasi:**

| Field | Tipe | Validasi |
|---|---|---|
| Nama | String | Wajib. Max 50 karakter. Harus unik |
| Slug | String | Auto-generate dari nama |

**Edge-case:** Jika kategori dihapus tapi masih ada berita yang terkait,
berita tersebut menjadi "tanpa kategori" (kolom `kategori_id` di-null-kan).

---

## Modul 4 — Pengumuman

Hampir identik dengan modul Berita, namun dengan karakteristik berbeda:
Pengumuman bersifat lebih singkat, mendesak, dan biasanya berisi
instruksi atau informasi penting yang perlu segera diketahui.

### Perbedaan dari Berita

- Thumbnail **opsional** (bukan wajib)
- Mendukung **lampiran berkas** per pengumuman (misal: PDF surat, max 10 MB)
- Di beranda, pengumuman ditampilkan lebih menonjol (dengan label atau warna aksen)
- Bisa ditandai sebagai **"penting"** — ditampilkan dengan badge khusus dan urutan prioritas

### Validasi per Field

| Field | Tipe | Validasi |
|---|---|---|
| Judul | String | Wajib. Min 10, max 200 karakter |
| Slug | String | Auto-generate dari judul. Bisa diedit. Harus unik |
| Thumbnail | File | Opsional. JPG/PNG/WebP. Max 2 MB |
| Isi | Rich Text | Wajib. Min 20 karakter (plain text count) |
| Lampiran | File | Opsional. PDF/DOCX/XLSX. Max 10 MB. Max 3 file per pengumuman |
| Status | Enum | `draf` / `terpublikasi` / `diarsipkan`. Default: `draf` |
| Penting | Boolean | Default: false |

**Urutan di frontend:** Pengumuman dengan flag `penting = true` selalu di atas,
kemudian sisanya diurutkan `tanggal_publikasi DESC`.

---

## Modul 5 — Dokumentasi

Galeri kegiatan BKA yang ditampilkan dalam bentuk album foto.

### Daftar Album (Frontend)

Grid kartu album dengan foto sampul, judul kegiatan, tanggal, dan jumlah foto.
**Urutan:** `tanggal_kegiatan DESC`.
**Item per halaman:** 12.

### Isi Album (Frontend)

Grid foto dalam satu album. Foto bisa diklik untuk membuka lightbox
(tampilan foto besar dengan navigasi kiri-kanan antar foto).
Lightbox mendukung navigasi keyboard (← →) dan swipe di mobile.

### Pengelolaan Album (Admin)

Admin membuat album dengan judul, deskripsi, tanggal kegiatan, dan foto sampul.
Foto dapat diunggah sekaligus banyak (bulk upload). Urutan foto dalam album
dapat diatur ulang (drag & drop).

**Validasi:**

| Field | Tipe | Validasi |
|---|---|---|
| Judul album | String | Wajib. Max 150 karakter |
| Slug | String | Auto-generate dari judul. Harus unik |
| Deskripsi | Textarea | Opsional. Max 500 karakter |
| Tanggal kegiatan | Date | Wajib |
| Foto sampul | File | Wajib. JPG/PNG/WebP. Max 2 MB |
| Foto album | File[] | JPG/PNG/WebP. Max 2 MB per foto. Max **50 foto** per album |

**Edge-case:**
- Album tanpa foto (hanya sampul): tetap tampil di daftar, tapi isi album menampilkan
  pesan "Belum ada foto dalam album ini"
- Jika foto sampul dihapus: gunakan foto pertama dalam album sebagai pengganti

---

## Modul 6 — Lampiran

Modul ini dapat diakses secara bebas oleh seluruh pengunjung (publik/anggota BKA)
tanpa perlu login. Berfungsi sebagai repositori dokumen resmi BKA.

### Kategori Lampiran

Admin membuat kategori sesuai kebutuhan, misalnya: SKA, Form Pengajuan,
SOP, Surat Edaran, Regulasi, Panduan, dan sebagainya.

**Validasi:**

| Field | Tipe | Validasi |
|---|---|---|
| Nama kategori | String | Wajib. Max 100 karakter. Harus unik |
| Slug | String | Auto-generate dari nama |
| Deskripsi | Textarea | Opsional. Max 300 karakter |
| Urutan | Integer | Wajib. Untuk mengatur posisi di halaman |

**Edge-case:** Jika kategori dihapus dan masih ada berkas di dalamnya,
tampilkan konfirmasi: "Kategori ini memiliki X berkas. Semua berkas akan
ikut terhapus. Lanjutkan?" (soft delete kategori + berkas-berkasnya).

### Daftar Berkas per Kategori (Frontend)

Pengunjung melihat daftar kategori, lalu saat membuka kategori
tampil daftar berkas dengan: nama berkas, deskripsi singkat, tipe file,
ukuran (format ramah: KB/MB), dan tanggal diunggah.
Tombol unduh tersedia di tiap berkas.

**Urutan default:** `tanggal_upload DESC` (terbaru dulu).
**Pencarian:** Berdasarkan nama berkas (pencarian sederhana dalam kategori).

### Pengelolaan Lampiran (Admin)

Admin mengunggah berkas, mengisi nama tampilan, deskripsi, dan memilih
kategori. Admin juga bisa menghapus atau memperbarui berkas yang sudah ada.

**Validasi:**

| Field | Tipe | Validasi |
|---|---|---|
| Nama tampilan | String | Wajib. Max 150 karakter |
| Deskripsi | Textarea | Opsional. Max 300 karakter |
| Kategori | Select | Wajib. Pilih dari kategori yang ada |
| File | File | Wajib. PDF/DOCX/XLSX/PPTX. Max 10 MB |

**Unduh:** File di-serve melalui controller (bukan direct public URL).
Nama file saat diunduh menggunakan nama tampilan (bukan nama file asli di server).

---

## Modul 7 — Kontak

### Halaman Kontak (Frontend)

Menampilkan informasi kontak lengkap BKA: alamat, nomor telepon, email,
jam operasional, dan embed Google Maps. Di bawahnya terdapat formulir
kirim pesan untuk pengunjung.

### Formulir Pesan

Pengunjung mengisi nama, email, subjek, dan pesan. Setelah dikirim,
pesan masuk ke panel admin (disimpan di database).

**Validasi:**

| Field | Tipe | Validasi |
|---|---|---|
| Nama | String | Wajib. Max 100 karakter |
| Email | Email | Wajib. Format email valid |
| Subjek | String | Wajib. Max 150 karakter |
| Pesan | Textarea | Wajib. Min 20, max 2000 karakter |

**Rate limiting:** Max **3 pesan per 10 menit** per IP address.

**Setelah berhasil kirim:** Tampilkan pesan sukses (toast), form di-reset.
Tidak ada redirect.

### Pengaturan Kontak (Admin)

Semua informasi kontak — alamat, telepon, email, jam operasional, embed Maps,
dan tautan media sosial — dapat diubah dari panel admin kapan saja.

**Validasi:**

| Field | Tipe | Validasi |
|---|---|---|
| Alamat | Textarea | Wajib. Max 300 karakter |
| Telepon | String | Wajib. Max 20 karakter |
| Email | Email | Wajib. Format email valid |
| Jam operasional | String | Opsional. Max 100 karakter (contoh: "Senin–Jumat, 08:00–16:00") |
| Embed Google Maps | Text | Opsional. Kode embed iframe dari Google Maps |
| Media sosial | JSON/Array | Opsional. Masing-masing: platform (select) + URL |

---

## Modul 8 — Panel Admin

### Dashboard

Halaman pertama setelah login admin. Menampilkan ringkasan:

| Statistik | Sumber |
|---|---|
| Jumlah berita terpublikasi | Count berita berstatus `terpublikasi` |
| Jumlah pengumuman aktif | Count pengumuman berstatus `terpublikasi` |
| Pesan masuk belum dibaca | Count pesan kontak berstatus `belum_dibaca` |
| Aktivitas terbaru | 10 log terbaru (admin menambah/mengubah konten) |

### Pengelolaan Pengguna (Super Admin Only)

Super Admin dapat melihat daftar administrator, membuat akun baru (untuk peran
Admin), mengubah data pengguna, dan menonaktifkan akun Admin. Admin biasa
tidak memiliki akses untuk mengelola pengguna.

### Pengaturan Website

Termasuk: nama website, deskripsi singkat untuk SEO, informasi kontak,
tautan media sosial, dan logo (jika ada kebutuhan update logo).

| Field | Tipe | Validasi |
|---|---|---|
| Nama website | String | Wajib. Max 100 karakter |
| Deskripsi SEO | String | Wajib. Max 160 karakter (sesuai best practice meta description) |
| Logo | File | Opsional. PNG/SVG. Max 500 KB |
| Favicon | File | Opsional. ICO/PNG. Max 100 KB. Ukuran 32×32 atau 64×64 |

---

## Rich Text Editor — Aturan Konfigurasi

Editor WYSIWYG (Tiptap) digunakan di: Tentang Kami, Isi Berita, Isi Pengumuman,
dan Sambutan Kepala Biro.

### Format yang Diizinkan

- Heading: **H2 dan H3 saja** (H1 sudah dipakai oleh judul halaman)
- Paragraph, bold, italic, underline, strikethrough
- Ordered list, unordered list
- Blockquote
- Link (bisa set target `_blank`)
- Image (sisipan gambar di tengah konten — upload langsung dari editor, max 2 MB)
- Horizontal rule (pemisah)

### Format yang TIDAK Diizinkan

- H1, H4, H5, H6
- Tabel (terlalu kompleks untuk dikelola non-developer)
- Code block
- Embed video/iframe
- Custom HTML
- Font color / font size (menggunakan style bawaan tema)

### Sanitasi Output

Semua output rich text **wajib di-sanitize** sebelum disimpan ke database.
Hapus tag HTML yang tidak ada di whitelist. Lihat `07-SECURITY.md` untuk detail.
