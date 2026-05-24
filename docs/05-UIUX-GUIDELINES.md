# 05 — UI/UX Guidelines

Dokumen ini adalah satu-satunya referensi desain untuk proyek ini.
Setiap keputusan visual harus merujuk ke sini sebelum diimplementasikan.
Tidak ada kompromi untuk konsistensi.

---

## Identitas Visual

Website ini adalah wajah digital sebuah biro kelembagaan universitas.
Kesan yang harus ditangkap pengunjung dalam tiga detik pertama:

> **Profesional. Terpercaya. Modern. Terbuka.**

Bukan kesan: kaku seperti portal pemerintah lama, berwarna-warni seperti startup,
atau ramai seperti portal berita.

---

## Dark Mode

**TIDAK ADA dark mode di versi ini.** Jangan implementasikan dark mode,
jangan siapkan CSS variable untuk dark mode, dan jangan tambahkan toggle
dark/light. Seluruh desain menggunakan light mode saja.

---

## Sistem Warna

Semua warna diturunkan langsung dari logo BKA UMRI.
Logo memiliki dua elemen kunci: teks hijau tua dan ikon dengan gradasi
dari hijau tua ke kuning emas.

### Palet Utama

| Token | Nama | Nilai Hex | Penggunaan |
|---|---|---|---|
| `--color-primary` | Forest Green | `#1B5E20` | Elemen utama: tombol, header, aksen nav |
| `--color-primary-hover` | Deep Green | `#145218` | State hover pada elemen primary |
| `--color-primary-light` | Medium Green | `#2E7D46` | Tombol sekunder, border aksen, tag |
| `--color-primary-subtle` | Mint Mist | `#E8F5E9` | Background seksi, hover state ringan |
| `--color-accent` | Golden Amber | `#C8A000` | Aksen dekoratif, highlight, ikon aktif |
| `--color-accent-light` | Soft Gold | `#FFF8DC` | Background untuk area yang diberi aksen |

### Palet Netral

| Token | Nama | Nilai Hex | Penggunaan |
|---|---|---|---|
| `--color-text-primary` | Slate Black | `#1A1A1A` | Teks utama (heading, body) |
| `--color-text-secondary` | Cool Gray | `#5C6B73` | Teks pendukung, keterangan, label |
| `--color-text-muted` | Soft Gray | `#9EAAB2` | Placeholder, teks nonaktif, tanggal |
| `--color-surface` | Pure White | `#FFFFFF` | Background kartu, modal, input |
| `--color-background` | Off White | `#F7F9F7` | Background halaman (sedikit kehijauan) |
| `--color-border` | Light Border | `#DDE5DD` | Border kartu, pemisah, garis |
| `--color-border-strong` | Medium Border | `#B5C5B5` | Border fokus, pemisah kuat |

### Warna Semantik

| Token | Nilai Hex | Penggunaan |
|---|---|---|
| `--color-success` | `#2E7D32` | Pesan berhasil, status aktif |
| `--color-success-light` | `#E8F5E9` | Background untuk pesan sukses |
| `--color-warning` | `#F57F17` | Peringatan, status tertunda |
| `--color-warning-light` | `#FFF8E1` | Background untuk pesan warning |
| `--color-error` | `#C62828` | Error, status gagal |
| `--color-error-light` | `#FFEBEE` | Background untuk pesan error |
| `--color-info` | `#1565C0` | Informasi tambahan |
| `--color-info-light` | `#E3F2FD` | Background untuk pesan info |

### Aturan Penggunaan Warna

- Primary (`#1B5E20`) hanya untuk elemen interaktif utama dan komponen branding
- Jangan gunakan primary sebagai background halaman penuh — terlalu berat
- Accent gold hanya untuk aksen, bukan sebagai warna dominan
- Teks putih di atas background primary harus memiliki kontras minimal 4.5:1
- Background halaman adalah `#F7F9F7`, bukan putih murni — agar tidak terlalu keras

---

## Tipografi

### Font yang Digunakan

**Plus Jakarta Sans** — font utama untuk semua teks.
Import dari Google Fonts. Alasan: clean, modern, sangat terbaca di layar,
memiliki karakter yang sedikit hangat — cocok untuk institusi pendidikan.

```
Weights yang diload: 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)
```

### Skala Tipografi

| Token | Ukuran | Weight | Line Height | Penggunaan |
|---|---|---|---|---|
| `--text-xs` | 12px | 400 | 1.5 | Label kecil, caption |
| `--text-sm` | 14px | 400/500 | 1.5 | Metadata, keterangan, teks kartu kecil |
| `--text-base` | 16px | 400 | 1.6 | Body text standar |
| `--text-lg` | 18px | 500 | 1.5 | Lead paragraph, intro text |
| `--text-xl` | 20px | 600 | 1.4 | Judul kartu, sub-heading |
| `--text-2xl` | 24px | 600/700 | 1.3 | Section heading kecil |
| `--text-3xl` | 30px | 700 | 1.2 | Section heading utama |
| `--text-4xl` | 36px | 700 | 1.15 | Judul hero, page heading |
| `--text-5xl` | 48px | 700 | 1.1 | Display text (sangat jarang) |

### Aturan Tipografi

- Heading halaman maksimal 2 level dalam satu halaman
- Panjang baris teks body ideal antara 60–75 karakter — gunakan `max-w` yang sesuai
- Hindari ALL CAPS untuk kalimat panjang — hanya untuk label pendek
- Letter-spacing sedikit melebar (`0.02em`) untuk teks uppercase atau label kecil
- Gunakan `font-weight: 600` untuk semua heading, bukan 700 kecuali benar-benar perlu menonjol

---

## Sistem Spasi

Gunakan kelipatan 4px sebagai dasar sistem spasi.
Terjemahan ke Tailwind:

```
4px  = spacing-1    (margin/padding sangat kecil, gap dalam komponen padat)
8px  = spacing-2    (gap antar elemen dalam satu komponen)
12px = spacing-3    (padding dalam badge, tag)
16px = spacing-4    (padding komponen standar)
24px = spacing-6    (gap antar komponen dalam satu seksi)
32px = spacing-8    (padding dalam kartu, spacing antar kartu)
48px = spacing-12   (padding seksi pada mobile)
64px = spacing-16   (padding seksi pada tablet)
80px = spacing-20   (padding seksi pada desktop)
96px = spacing-24   (padding seksi besar pada desktop)
```

### Prinsip Whitespace

- Beri ruang napas — whitespace bukan pemborosan, tapi alat desain
- Jarak antar seksi halaman minimal 64px di desktop, 48px di mobile
- Jangan penuhi setiap area dengan konten — empty space di sekitar elemen penting justru membuatnya menonjol
- Gunakan padding vertikal yang konsisten per seksi

---

## Sistem Grid & Layout

### Container

```
Max width container: 1200px
Padding horizontal (mobile):  16px kiri-kanan
Padding horizontal (tablet):  24px kiri-kanan
Padding horizontal (desktop): 32px kiri-kanan
```

### Grid Responsif

Gunakan CSS Grid atau Flexbox. Pola yang dipakai:

| Konteks | Mobile | Tablet (768px+) | Desktop (1024px+) |
|---|---|---|---|
| Kartu berita | 1 kolom | 2 kolom | 3 kolom |
| Kartu pengumuman | 1 kolom | 2 kolom | 3 kolom |
| Kartu album dokumentasi | 1 kolom | 2 kolom | 3–4 kolom |
| Kartu lampiran | 1 kolom | 2 kolom | 3 kolom |
| Struktur organisasi | 1 kolom | 2 kolom | 3–4 kolom |
| Grid statistik beranda | 2 kolom | 2 kolom | 4 kolom |

### Breakpoint

```
sm:  640px
md:  768px
lg:  1024px
xl:  1280px
2xl: 1536px
```

---

## Komponen

### Tombol (Button)

**Primary Button**
- Background: `--color-primary`
- Teks: putih
- Border radius: 8px
- Padding: 10px 20px (base), 12px 24px (large)
- Hover: background gelap, sedikit naik (translateY -1px)
- Aktif: background lebih gelap, sedikit turun

**Secondary Button**
- Background: transparan
- Border: 1.5px solid `--color-primary`
- Teks: `--color-primary`
- Hover: background `--color-primary-subtle`

**Ghost Button**
- Background: transparan
- Tanpa border
- Teks: `--color-primary`
- Hover: background `--color-primary-subtle`

**Danger Button** (untuk aksi destruktif: hapus, nonaktifkan)
- Background: `--color-error`
- Teks: putih
- Hover: background gelap
- Hanya digunakan di panel admin, bukan frontend publik

**Aturan Tombol:**
- Satu halaman maksimal satu primary button CTA yang mencolok
- Ukuran tombol harus cukup besar untuk disentuh di mobile (minimal 44px height)
- Label tombol menggunakan kata kerja yang jelas: "Unduh", "Baca Selengkapnya", "Kirim Pesan"
- Hindari label ambigu seperti "Klik di sini" atau "Lanjut"
- Tombol dalam kondisi loading: tampilkan spinner kecil + teks berubah ("Menyimpan..."), tombol disabled

---

### Kartu (Card)

Kartu adalah komponen terbanyak di website ini (berita, pengumuman, album, lampiran).

**Anatomi Kartu Berita / Pengumuman:**
```
┌─────────────────────────┐
│  [Thumbnail 16:9]       │  ← aspect ratio konsisten
├─────────────────────────┤
│  [Kategori Badge]       │  ← kecil, warna accent atau primary-subtle
│  Judul Artikel          │  ← 2 baris maks, ellipsis jika lebih
│  Kutipan singkat...     │  ← 2-3 baris, warna text-secondary
│  [Tanggal] · [Penulis]  │  ← text-sm, text-muted
└─────────────────────────┘
```

**Styling Kartu:**
- Background: `--color-surface` (putih)
- Border: 1px solid `--color-border`
- Border radius: 12px
- Box shadow: ringan dan halus — `0 1px 4px rgba(0,0,0,0.06)`
- Hover: shadow sedikit lebih kuat, translate naik 2px (transisi smooth 200ms)
- Jangan gunakan shadow yang terlalu dramatis atau border yang terlalu tebal
- Seluruh area kartu bisa diklik (bukan hanya judul)

---

### Navigation Bar

**Desktop:**
- Background putih dengan border bawah tipis
- Logo di kiri, menu di kanan
- Saat di-scroll, navbar tetap terlihat (sticky) dengan shadow halus
- Menu aktif ditandai dengan teks berwarna primary dan underline kecil
- Dropdown submenu muncul smooth dengan animasi fade+slide ke bawah

**Mobile:**
- Hamburger icon di kanan
- Menu muncul sebagai drawer dari kanan (slide in)
- Overlay gelap semi-transparan di belakang drawer
- Semua item menu terlihat jelas, ukuran touch target minimal 48px

---

### Badge / Label / Tag

- Border radius: 999px (pill shape)
- Padding: 2px 10px
- Font size: 12px, weight 600
- Uppercase dengan letter-spacing 0.04em
- Warna disesuaikan dengan konteks:
  - Kategori berita → `--color-primary-subtle` + teks primary
  - Pengumuman penting → `--color-accent-light` + teks amber
  - Status aktif → success colors
  - Status draf → neutral colors

---

### Form & Input

- Border radius: 8px
- Border: 1.5px solid `--color-border`
- Padding: 10px 14px
- Fokus: border berubah ke `--color-primary`, ring tipis primary-subtle
- Error: border merah, pesan error di bawah field (warna `--color-error`, font 12px)
- Label di atas input (bukan placeholder sebagai label)
- Placeholder menggunakan `--color-text-muted`
- Input disabled: background `#F0F0F0`, cursor not-allowed

---

### Section Header

Setiap seksi utama di beranda menggunakan pola heading yang konsisten:

```
[Label kecil uppercase berwarna primary]  ←  opsional
Judul Seksi yang Besar
Deskripsi seksi satu atau dua kalimat     ←  opsional, warna text-secondary
```

Perataan bisa tengah atau kiri tergantung konteks seksi.

---

### Modal / Dialog

- Background overlay: `rgba(0, 0, 0, 0.5)`
- Modal box: putih, border-radius 16px, padding 24px
- Lebar: 480px (small), 640px (medium), 800px (large)
- Animasi masuk: fade + scale dari 95% ke 100% (200ms)
- Tombol close di sudut kanan atas
- Klik overlay = tutup modal
- Escape key = tutup modal
- Focus trap: tab hanya berputar di dalam modal saat aktif

### Konfirmasi Hapus

Selalu gunakan modal konfirmasi sebelum aksi destruktif:

```
┌──────────────────────────────────────────┐
│  ⚠️  Hapus Berita?                       │
│                                          │
│  Berita "Judul Berita" akan dihapus.     │
│  Tindakan ini tidak dapat dibatalkan.    │
│                                          │
│              [Batal]  [Hapus]            │
│                        ↑ danger button   │
└──────────────────────────────────────────┘
```

---

## Toast / Notifikasi

Menggunakan `react-hot-toast`. Konfigurasi:

| Properti | Nilai |
|---|---|
| Posisi | Top-right |
| Durasi | 4000ms (auto-dismiss) |
| Max visible | 3 toast sekaligus |
| Animasi | Slide dari kanan |

Styling per tipe:

| Tipe | Border-left | Ikon |
|---|---|---|
| Success | 4px solid `--color-success` | ✓ (check) |
| Error | 4px solid `--color-error` | ✕ (x) |
| Warning | 4px solid `--color-warning` | ⚠ (alert) |
| Info | 4px solid `--color-info` | ℹ (info) |

---

## Loading & Skeleton States

### Skeleton Screen (Prioritas utama, bukan spinner)

Gunakan skeleton loading untuk semua halaman yang memuat data:

```
┌─────────────────────────┐
│  ██████████████████████  │  ← animated pulse (opacity 0.3 → 0.7)
├─────────────────────────┤
│  ████████                │
│  ██████████████████      │
│  ████████████            │
│  ████  ·  ████           │
└─────────────────────────┘
```

- Warna skeleton: `#E5E7EB` (light gray) dengan pulse animation
- Animasi: opacity bergerak dari 0.3 ke 0.7 dengan durasi 1.5s, infinite
- Bentuk skeleton mengikuti bentuk konten yang akan tampil (rounded untuk gambar, persegi panjang untuk teks)

### Spinner

Spinner hanya digunakan untuk:
- Tombol dalam proses (di dalam tombol, ukuran kecil 16px)
- Upload file (progress indicator)

Jangan gunakan spinner full-page.

### Inertia.js Progress Bar

Gunakan progress bar bawaan Inertia di bagian atas halaman (NProgress-style).
Warna: `--color-primary`. Ketebalan: 3px.

---

## Empty States

Jika halaman belum memiliki data, tampilkan empty state yang informatif:

```
┌─────────────────────────────────────────────────┐
│                                                 │
│              [Ilustrasi/Ikon]                   │
│                                                 │
│           Belum Ada Berita                      │
│    Berita akan tampil di sini setelah           │
│    dipublikasikan oleh admin.                   │
│                                                 │
└─────────────────────────────────────────────────┘
```

Ikon dari Lucide (sesuai konteks), ukuran 48px, warna `--color-text-muted`.
Judul: `--text-xl`, weight 600.
Deskripsi: `--text-base`, warna `--color-text-secondary`.

**Konteks empty state per modul:**

| Halaman | Judul | Deskripsi |
|---|---|---|
| Berita (publik) | Belum Ada Berita | Berita akan tampil setelah dipublikasikan oleh admin |
| Pengumuman (publik) | Belum Ada Pengumuman | Pengumuman akan tampil setelah dipublikasikan |
| Dokumentasi (publik) | Belum Ada Album | Album dokumentasi kegiatan akan segera ditampilkan |
| Lampiran (publik) | Belum Ada Lampiran | Berkas lampiran akan segera tersedia untuk diunduh |
| Foto dalam album | Belum Ada Foto | Foto kegiatan akan segera diunggah |
| Admin — Daftar berita | Belum Ada Berita | Klik "Tambah Berita" untuk membuat berita pertama |
| Admin — Pesan masuk | Belum Ada Pesan | Pesan dari pengunjung akan tampil di sini |

---

## Halaman Error

### 404 — Tidak Ditemukan

```
┌─────────────────────────────────────────────────┐
│  [Navbar]                                       │
│                                                 │
│                   404                            │
│           Halaman Tidak Ditemukan                │
│                                                 │
│    Halaman yang Anda cari tidak tersedia         │
│    atau telah dipindahkan.                       │
│                                                 │
│           [← Kembali ke Beranda]                │
│                                                 │
│  [Footer]                                       │
└─────────────────────────────────────────────────┘
```

- Angka "404" menggunakan `--text-5xl`, warna `--color-text-muted`
- Background tetap `--color-background`
- Tetap menggunakan layout publik (dengan navbar dan footer)

### 403 — Akses Ditolak

Sama seperti 404, tapi teksnya: "Anda tidak memiliki izin untuk mengakses halaman ini."
Tombol: "Kembali ke Beranda" atau "Login" (jika belum login).

---

## Admin Panel — Design Brief

Panel admin menggunakan paradigma desain yang berbeda dari frontend publik,
tapi tetap menggunakan sistem warna dan tipografi yang sama.

### Layout

- **Sidebar kiri** dengan lebar 260px (desktop), collapsible
- **Top bar** dengan nama user, role badge, dan tombol logout
- **Content area** dengan padding 24px
- Background content area: `--color-background`
- Background sidebar: putih dengan border kanan tipis

### Tabel Data (Admin)

- Header: background `--color-primary-subtle`, teks `--color-text-primary`, weight 600
- Row: alternating background (putih dan `#FAFAFA`)
- Hover row: background `--color-primary-subtle` (sangat ringan)
- Aksi per row: icon buttons (edit, hapus) di kolom terakhir
- Pagination di bawah tabel
- Empty state jika tidak ada data

### Form Layout (Admin)

- Form menggunakan single column layout (max-width 640px)
- Label di atas input, font 14px weight 500
- Jarak antar field: 20px
- Tombol "Simpan" di kanan bawah
- Tombol "Batal" di sebelah kiri tombol "Simpan" (secondary button)

---

## Pola Layout Halaman

### Beranda

```
[Navbar]
[Hero / Banner Slider]            ← penuh lebar, tinggi 500-600px desktop
[Kata Sambutan Kepala Biro]       ← layout dua kolom: foto kiri, teks kanan
[Berita Terbaru]                  ← 3 kartu dalam grid
[Pengumuman Terbaru]              ← tampil berbeda dari berita (lebih ringkas)
[Statistik Kelembagaan]           ← 4 angka dalam satu baris
[CTA Dokumentasi]                 ← seksi mengajak ke galeri
[Footer]
```

### Halaman Daftar (Berita / Pengumuman / Dokumentasi)

```
[Navbar]
[Page Hero kecil]                 ← judul halaman, breadcrumb, background hijau
[Filter & Pencarian]              ← horizontal, di atas grid
[Grid Konten]                     ← responsif 1-2-3 kolom
[Pagination]
[Footer]
```

**Page Hero kecil:** Background `--color-primary`, tinggi 200px desktop / 150px mobile,
teks putih, judul halaman + breadcrumb. Bukan full-width image — solid color.

### Halaman Detail (Berita / Pengumuman)

```
[Navbar]
[Breadcrumb]
[Konten Utama (8 kolom)]  |  [Sidebar (4 kolom)]
  - Judul                 |    - Berita terkait
  - Meta (tanggal, kat)   |    - Kategori
  - Thumbnail besar       |
  - Isi artikel           |
  - Tombol share          |
[Footer]
```

Pada mobile, sidebar pindah ke bawah konten utama.

### Halaman Profil

```
[Navbar]
[Page Hero kecil]
[Tab navigasi sub-halaman]        ← Tentang Kami | Visi Misi | Struktur Org
[Konten sub-halaman]
[Footer]
```

Tab menggunakan underline style (bukan kotak), warna primary untuk tab aktif.

---

## Prinsip Desain

### Yang Harus Dilakukan

- **Konsisten** — komponen yang sama harus selalu terlihat sama di seluruh halaman
- **Hierarki visual yang jelas** — mata pengunjung harus tahu harus melihat ke mana dulu
- **Ruang napas** — beri margin dan padding yang cukup, jangan takut whitespace
- **Kontras yang baik** — semua teks harus mudah dibaca dengan kontras minimal WCAG AA
- **Gambar yang diproporsikan** — gunakan aspect ratio yang konsisten per jenis konten
- **Loading state** — setiap aksi yang butuh waktu harus menampilkan indikator
- **Feedback instan** — setiap aksi user harus menghasilkan respons visual (toast, animasi, state change)

### Yang Tidak Boleh Dilakukan

- **Jangan gunakan lebih dari 3 font weight berbeda** dalam satu area visual
- **Jangan pakai warna terlalu banyak** — ikuti palet yang sudah ditentukan
- **Jangan tampilkan teks di atas gambar tanpa overlay** yang memadai
- **Jangan gunakan shadow yang terlalu tebal** — kesan jadi berat dan usang
- **Jangan buat tombol yang terlalu kecil** di mobile
- **Jangan pakai border-radius 0** (kotak sempurna terasa kaku dan tidak modern)
- **Jangan pakai animasi yang berlebihan** — subtle transitions saja, bukan bouncing
- **Jangan copy pola portal pemerintah lama** — tabel di mana-mana, banyak garis, warna mencolok
- **Jangan gunakan alert/confirm bawaan browser** — selalu pakai modal/toast kustom
- **Jangan tampilkan broken image** — selalu sediakan fallback/placeholder

---

## Animasi & Transisi

Prinsip: halus, bermakna, tidak mengganggu.

| Konteks | Durasi | Easing |
|---|---|---|
| Hover tombol / kartu | 150–200ms | ease-out |
| Dropdown navbar | 200ms | ease-out |
| Slide drawer mobile | 300ms | ease-in-out |
| Fade konten halaman | 250ms | ease-in |
| Lightbox foto | 200ms | ease-out |
| Modal masuk | 200ms | ease-out |
| Toast masuk | 300ms | ease-out |
| Skeleton pulse | 1500ms | ease-in-out, infinite |

Jangan gunakan animasi untuk elemen yang tidak diinteraksi pengguna.
Scroll-triggered animation (fade-in saat scroll) boleh digunakan dengan sangat hemat
dan hanya sekali per kunjungan halaman.

---

## Ikon

Gunakan **Lucide React** sebagai library ikon utama.
Ikon hanya digunakan sebagai pendukung — jangan menggantikan teks label.
Ukuran standar: 16px (kecil), 20px (sedang), 24px (besar).
Warna ikon mengikuti warna teks atau warna aksen di sekitarnya.

---

## Gambar & Media

- Semua thumbnail berita dan cover album menggunakan aspect ratio 16:9
- Foto profil (kepala biro, anggota) menggunakan aspect ratio 3:4 atau 1:1
- Gambar yang diunggah admin harus di-optimize sebelum disimpan (kompresi otomatis)
- Jika gambar belum diunggah, tampilkan placeholder yang bersih (bukan broken image)
- Lightbox untuk galeri foto harus mendukung navigasi keyboard dan swipe mobile
- Placeholder gambar: kotak abu-abu (`#E5E7EB`) dengan ikon gambar Lucide di tengah

---

## Responsivitas

- Desain pertama di layar 1280px desktop, lalu turunkan ke mobile
- Tidak ada elemen yang overflow horizontal di mobile
- Teks tidak pernah lebih kecil dari 14px di mobile
- Touch target minimal 44×44px untuk semua elemen interaktif
- Tabel yang panjang harus bisa di-scroll horizontal di mobile, bukan dipaksa masuk

---

## Aksesibilitas

- Semua gambar memiliki atribut `alt` yang deskriptif
- Struktur heading logis: H1 satu per halaman, H2 untuk seksi, H3 untuk sub-seksi
- Link dan tombol punya label yang jelas (bukan hanya ikon tanpa teks)
- Form memiliki label yang terhubung dengan benar ke input-nya
- Fokus keyboard harus terlihat jelas (gunakan custom focus ring yang konsisten)
- Warna focus ring: `--color-primary` dengan offset 2px
- ARIA labels pada elemen interaktif yang hanya berupa ikon
