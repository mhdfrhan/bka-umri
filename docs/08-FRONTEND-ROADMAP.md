# 08 — Frontend Roadmap

Panduan implementasi frontend lengkap untuk seluruh halaman Website BKA UMRI.
Dokumen ini mencakup **halaman publik**, **panel admin**, dan **fitur khusus
Super Admin** — beserta setiap elemen, komponen, state, dan interaksi yang
harus dibangun.

> **Referensi wajib:** Baca `05-UIUX-GUIDELINES.md` untuk token warna,
> tipografi, spasi, dan aturan komponen sebelum mengimplementasikan apapun
> di dokumen ini.

---

## Status Implementasi Saat Ini

Berdasarkan struktur codebase aktif:

| Komponen | Status | Catatan |
|---|---|---|
| `PublicLayout` | ✅ Sudah ada | `layouts/public-layout.tsx` — perlu diperkaya |
| `AdminLayout` (AppLayout) | ✅ Sudah ada | `layouts/app-layout.tsx` — sidebar + topbar |
| `AuthLayout` | ✅ Sudah ada | `layouts/auth-layout.tsx` |
| Halaman Welcome | ✅ Sudah ada | `pages/welcome.tsx` — perlu ditransformasi ke Beranda |
| Halaman Dashboard Admin | ✅ Sudah ada | `pages/dashboard.tsx` — perlu diperkaya |
| Halaman Auth (Login, dll.) | ✅ Sudah ada | `pages/auth/*` |
| Halaman Settings | ✅ Sudah ada | `pages/settings/*` |
| Halaman Bidang | ✅ Sudah ada | `pages/bidang/*` |
| Komponen UI dasar | ✅ Sudah ada | `components/ui/*` — Shadcn-style |
| Halaman Publik lainnya | ❌ Belum | Profil, Berita, Pengumuman, dll. |
| Halaman Admin CRUD | ❌ Belum | Berita, Pengumuman, Dokumentasi, dll. |
| Halaman Super Admin | ❌ Belum | Manajemen Pengguna, Log Aktivitas |

---

## Daftar Isi

1. [Shared Components (Foundation)](#1-shared-components-foundation)
2. [Layout System](#2-layout-system)
3. [Halaman Publik](#3-halaman-publik)
4. [Panel Admin (Admin & Super Admin)](#4-panel-admin)
5. [Halaman Super Admin Only](#5-halaman-super-admin-only)
6. [Halaman Error & Auth](#6-halaman-error--auth)
7. [Prioritas & Urutan Pengerjaan](#7-prioritas--urutan-pengerjaan)

---

## 1. Shared Components (Foundation)

Komponen reusable yang menjadi fondasi seluruh halaman. Harus dikerjakan
**sebelum** halaman manapun.

### 1.1 Komponen UI Dasar

Sebagian sudah tersedia di `components/ui/`. Yang perlu ditambah/dipastikan:

| Komponen | File Target | Elemen & Fitur |
|---|---|---|
| **Button** | `ui/button.tsx` | Varian: `primary`, `secondary`, `ghost`, `danger`. State: `default`, `hover`, `active`, `disabled`, `loading` (spinner + teks berubah). Ukuran: `sm`, `md`, `lg`. Min height 44px di mobile |
| **Card** | `ui/card.tsx` | Background putih, border 1px `--color-border`, radius 12px, shadow ringan. Hover: shadow naik + translateY -2px (200ms). Seluruh area clickable. Varian: `default`, `horizontal` |
| **Badge** | `ui/badge.tsx` | Pill shape (radius 999px). Varian warna: `primary`, `accent`, `success`, `warning`, `error`, `neutral`. Uppercase, letter-spacing 0.04em, font-size 12px |
| **Input** | `ui/input.tsx` | Border 1.5px, radius 8px, padding 10px 14px. State: `default`, `focus` (ring primary), `error` (border merah + pesan error), `disabled`. Label di atas input |
| **Textarea** | `ui/textarea.tsx` | Sama seperti Input, tapi multiline. Auto-resize opsional. Character counter opsional |
| **Select** | `ui/select.tsx` | Dropdown native atau custom. Placeholder state. Error state. Searchable opsional |
| **Modal** | `ui/modal.tsx` | Overlay semi-transparan, radius 16px, padding 24px. Ukuran: `sm` (480px), `md` (640px), `lg` (800px). Animasi fade+scale. Close: klik overlay / Escape / tombol X. Focus trap |
| **ConfirmDialog** | `ui/confirm-dialog.tsx` | Extends Modal. Judul + pesan + dua tombol (Batal + Aksi). Varian: `danger` (untuk hapus), `warning`, `info` |
| **Toast** | `ui/toast.tsx` | Menggunakan `react-hot-toast`. Posisi top-right. Durasi 4s. Max 3 visible. Tipe: `success`, `error`, `warning`, `info`. Border-left 4px sesuai tipe |
| **Pagination** | `ui/pagination.tsx` | Navigasi halaman: First, Prev, nomor halaman, Next, Last. Info "Menampilkan X–Y dari Z". Kompatibel dengan Inertia pagination links |
| **Skeleton** | `ui/skeleton.tsx` | Animated pulse (opacity 0.3→0.7, 1.5s). Varian bentuk: `text`, `circle`, `rectangle`, `card`. Warna: `#E5E7EB` |
| **EmptyState** | `ui/empty-state.tsx` | Ikon Lucide (48px, muted), judul (`text-xl`), deskripsi (`text-base`, secondary). CTA button opsional |
| **FileUpload** | `ui/file-upload.tsx` | Drag & drop zone. Preview gambar sebelum upload. Progress bar upload. Validasi tipe + ukuran di client. Multi-file opsional |
| **DataTable** | `ui/data-table.tsx` | Header sticky, alternating row colors. Kolom sortable. Kolom aksi (icon buttons). Loading skeleton state. Empty state. Responsive: horizontal scroll di mobile |
| **Lightbox** | `ui/lightbox.tsx` | Menggunakan `yet-another-react-lightbox`. Navigasi keyboard ← →, swipe mobile, zoom, counter foto |
| **RichTextEditor** | `ui/rich-text-editor.tsx` | Menggunakan `@tiptap/react`. Toolbar: H2, H3, bold, italic, underline, strikethrough, ordered/unordered list, blockquote, link, image upload, horizontal rule. **Tanpa:** H1, H4–H6, table, code block, embed, custom HTML, font color/size |
| **SearchInput** | `ui/search-input.tsx` | Input dengan ikon search. Debounce 300ms. Clear button. Integrasi Inertia router untuk query param |
| **StatusBadge** | `ui/status-badge.tsx` | Badge khusus untuk status konten. Mapping: `draf` → neutral, `terpublikasi` → success, `diarsipkan` → warning |
| **Tooltip** | `ui/tooltip.tsx` | Muncul saat hover. Posisi: top/bottom/left/right. Delay 200ms |
| **Tabs** | `ui/tabs.tsx` | Underline style. Warna primary untuk tab aktif. Animasi transisi konten |

### 1.2 Komponen Layout

| Komponen | File Target | Elemen & Fitur |
|---|---|---|
| **Navbar (Publik)** | `components/layout/navbar.tsx` | **Desktop:** Logo kiri, menu kanan. Sticky saat scroll + shadow halus. Menu: Beranda, Profil (dropdown: Tentang Kami, Visi Misi, Struktur Org), Berita, Pengumuman, Dokumentasi, Lampiran, Kontak. Menu aktif: teks primary + underline. Dropdown: fade + slide animasi. **Mobile:** Hamburger icon kanan. Drawer slide dari kanan. Overlay gelap. Touch target 48px |
| **Footer (Publik)** | `components/layout/footer.tsx` | Grid 3-4 kolom di desktop, 1 kolom di mobile. Kolom 1: Logo BKA + deskripsi singkat. Kolom 2: Tautan cepat (Beranda, Profil, Berita, dll). Kolom 3: Info kontak (alamat, telepon, email). Kolom 4: Ikon media sosial. Bottom bar: teks hak cipta + tahun |
| **Breadcrumb** | `components/layout/breadcrumb.tsx` | Separator chevron. Item terakhir non-clickable (halaman aktif). Data dari shared Inertia props |
| **PageHero** | `components/layout/page-hero.tsx` | Background solid `--color-primary`. Tinggi: 200px desktop, 150px mobile. Teks putih. Judul halaman (H1) + breadcrumb. Untuk semua halaman daftar (bukan beranda) |
| **SectionHeader** | `components/layout/section-header.tsx` | Label kecil uppercase primary (opsional) + judul besar + deskripsi (opsional, text-secondary). Perataan: center atau left |
| **Sidebar Admin** | `components/layout/admin-sidebar.tsx` | Sudah ada di `app-sidebar.tsx`. Perlu ditambah: menu items lengkap sesuai sitemap, ikon per menu (Lucide), submenu collapsible untuk Profil, separator visual, badge "Super Admin" pada menu Pengguna, role-based visibility. Lebar: 260px desktop, drawer di mobile |
| **Topbar Admin** | `components/layout/admin-topbar.tsx` | Sudah ada di `app-header.tsx`. Perlu: nama user, role badge (admin/super_admin), tombol logout, hamburger icon (mobile toggle sidebar) |

### 1.3 Custom Hooks

| Hook | File | Fungsi |
|---|---|---|
| `useDebounce` | `hooks/use-debounce.ts` | Debounce nilai input (default 300ms) untuk pencarian |
| `useMediaQuery` | `hooks/use-media-query.ts` | Deteksi breakpoint responsif |
| `useFlashToast` | `hooks/use-flash-toast.ts` | Menangkap flash messages dari Inertia shared data dan menampilkan toast via `react-hot-toast` |
| `useConfirmDialog` | `hooks/use-confirm-dialog.ts` | State management untuk modal konfirmasi hapus |
| `usePagination` | `hooks/use-pagination.ts` | Wrapper Inertia pagination untuk navigasi halaman |

### 1.4 Utility Functions

| Utility | File | Fungsi |
|---|---|---|
| `formatDate` | `lib/format-date.ts` | Format tanggal ke bahasa Indonesia (e.g., "22 Mei 2026") |
| `formatRelativeDate` | `lib/format-date.ts` | "2 jam yang lalu", "3 hari yang lalu" |
| `formatFileSize` | `lib/format-file-size.ts` | Bytes → "1.5 MB", "320 KB" |
| `truncateText` | `lib/truncate-text.ts` | Potong teks dengan ellipsis sesuai limit karakter |
| `slugify` | `lib/slugify.ts` | Generate slug dari judul (untuk preview di form) |
| `getFileIcon` | `lib/get-file-icon.ts` | Mapping ekstensi file ke ikon Lucide (pdf, docx, xlsx, pptx) |

---

## 2. Layout System

### 2.1 PublicLayout (`layouts/public-layout.tsx`)

```
┌─────────────────────────────────────────────┐
│ [Navbar]                                     │
├─────────────────────────────────────────────┤
│                                             │
│              {children}                      │
│                                             │
├─────────────────────────────────────────────┤
│ [Footer]                                     │
└─────────────────────────────────────────────┘
```

**Props:**
- `children` — konten halaman
- `title` — untuk `<title>` tag dan meta
- `description` — meta description

**Fitur:**
- Inertia progress bar di atas (NProgress-style, warna primary, 3px)
- Flash toast listener (via `useFlashToast`)
- Scroll to top on page change

### 2.2 AdminLayout (`layouts/app-layout.tsx`)

```
┌──────────┬─────────────────────────────────┐
│ SIDEBAR  │  TOPBAR (nama, role, logout)     │
│ 260px    ├─────────────────────────────────┤
│          │                                  │
│ Menu     │         {children}               │
│ Items    │                                  │
│          │   padding: 24px                  │
│          │   bg: --color-background         │
│          │                                  │
└──────────┴─────────────────────────────────┘
```

**Props:**
- `children` — konten halaman admin
- `title` — judul halaman (untuk breadcrumb & `<title>`)
- `breadcrumbs` — array breadcrumb items

**Fitur:**
- Sidebar collapsible di desktop (ikon mode)
- Sidebar menjadi drawer di mobile (< 1024px)
- Flash toast listener
- Role-based menu filtering (sembunyikan menu Pengguna untuk Admin biasa)

---

## 3. Halaman Publik

Semua halaman publik menggunakan `PublicLayout` dan dapat diakses tanpa login.

---

### 3.1 Beranda (`/`)

**File:** `pages/public/home.tsx`
**Route name:** `public.home`

Halaman landing utama website. Harus memberikan kesan profesional dan terpercaya
dalam 3 detik pertama.

#### Seksi 1: Hero / Banner Slider

| Elemen | Detail |
|---|---|
| **Container** | Full-width, tinggi 500–600px desktop, 350–400px mobile |
| **Slide content** | Gambar latar (cover, darkened overlay 40%), judul teks (putih, `text-4xl`), deskripsi singkat (putih, `text-lg`), tombol CTA (primary button, teks dari data) |
| **Navigasi slider** | Dots indicator di bawah tengah. Panah kiri/kanan di desktop (hover show). Auto-play 5 detik, pause saat hover |
| **Edge-case: 0 slide** | Hero statis: background gradient primary, judul "Biro Keuangan & Aset UMRI", tanpa navigasi |
| **Edge-case: 1 slide** | Tampilkan sebagai hero statis tanpa dots/arrows |
| **Data dari backend** | `banners[]` — `{ gambar_url, judul, deskripsi, teks_tombol, tautan_tombol, urutan }` |

**Interaksi:**
- Swipe kiri/kanan di mobile
- Keyboard navigation (← →) saat fokus
- Pause autoplay saat hover
- Transisi slide: crossfade 500ms atau slide horizontal

#### Seksi 2: Kata Sambutan Kepala Biro

| Elemen | Detail |
|---|---|
| **Layout** | 2 kolom desktop (foto kiri 40%, teks kanan 60%). 1 kolom mobile (foto di atas, teks di bawah) |
| **Foto** | Rasio 3:4 atau 1:1, rounded-lg, shadow ringan. Fallback: ikon avatar placeholder |
| **Nama** | `text-2xl`, font-weight 700, color text-primary |
| **Jabatan** | `text-base`, color text-secondary |
| **Periode** | `text-sm`, color text-muted |
| **Teks sambutan** | Rich text render (via `dangerouslySetInnerHTML`). Prose styling. Max 2000 karakter |
| **Section header** | Label: "KATA SAMBUTAN", Judul: "Sambutan Kepala Biro" |
| **Edge-case** | Jika data kosong: **sembunyikan seluruh seksi** |
| **Data dari backend** | `kepalaBiro` — `{ nama, jabatan, periode, sambutan, foto_url }` atau `null` |

#### Seksi 3: Bidang / Bagian BKA

| Elemen | Detail |
|---|---|
| **Layout** | Grid 2 kolom desktop, 1 kolom mobile |
| **Card per bidang** | Nomor urut (accent color, bold), nama bidang (`text-xl`), deskripsi singkat (text-secondary, max 200 karakter), tombol "Selengkapnya" (ghost button → `/bidang/{slug}`) |
| **Section header** | Label: "ORGANISASI", Judul: "Bidang & Bagian BKA" |
| **Batasan** | Max 6 bidang ditampilkan |
| **Edge-case** | 0 bidang: sembunyikan seksi. 1 bidang: card tunggal full-width |
| **Data dari backend** | `bidangs[]` — `{ nama, slug, deskripsi_singkat, urutan }` |

#### Seksi 4: Layanan BKA

| Elemen | Detail |
|---|---|
| **Layout** | 2 kolom desktop: daftar layanan (kiri 50%), embed YouTube (kanan 50%). 1 kolom mobile: layanan di atas, video di bawah |
| **Section header** | Judul dan deskripsi section dari data admin |
| **Item layanan** | Ikon Lucide (24px, primary), judul (`text-lg`, semibold), deskripsi (`text-sm`, secondary). Accordion-style atau list biasa |
| **YouTube embed** | `<iframe>` responsive (16:9 aspect ratio). Lazy load. Rounded-lg, shadow |
| **Batasan** | Max 6 item layanan |
| **Edge-case** | 0 item: sembunyikan seksi. Tanpa URL YouTube: item layanan full-width |
| **Data dari backend** | `layanan` — `{ judul_section, deskripsi_section, youtube_url, items[] }` |

#### Seksi 5: Sorotan Berita Terbaru

| Elemen | Detail |
|---|---|
| **Layout** | Grid 3 kolom desktop, 2 kolom tablet, 1 kolom mobile |
| **Card berita** | Thumbnail 16:9 (atas), badge kategori (pill, primary-subtle), judul (max 2 baris, ellipsis), kutipan singkat (max 3 baris, text-secondary), tanggal (text-sm, text-muted). Seluruh card clickable → `/berita/{slug}` |
| **Section header** | Label: "BERITA", Judul: "Berita Terbaru" |
| **Tombol CTA** | "Lihat Semua Berita →" (secondary button, link ke `/berita`) |
| **Data** | 3 berita terbaru, status `terpublikasi`, urutan `tanggal_publikasi DESC` |
| **Edge-case** | < 3 berita: tampilkan yang ada. 0 berita: sembunyikan seluruh seksi |
| **Data dari backend** | `beritaTerbaru[]` — `{ judul, slug, kutipan, thumbnail_url, kategori, tanggal_publikasi }` |

#### Seksi 6: Sorotan Pengumuman Terbaru

| Elemen | Detail |
|---|---|
| **Layout** | List view (bukan grid card). Setiap item: ikon megaphone, judul, tanggal, badge "PENTING" (jika `is_penting`). Clickable → `/pengumuman/{slug}` |
| **Visual** | Background `--color-primary-subtle` untuk seksi. Badge penting: accent gold background |
| **Section header** | Label: "PENGUMUMAN", Judul: "Pengumuman Terbaru" |
| **Tombol CTA** | "Lihat Semua Pengumuman →" |
| **Data** | 3 pengumuman terbaru. `is_penting` tampil di atas |
| **Edge-case** | 0 pengumuman: sembunyikan seksi |
| **Data dari backend** | `pengumumanTerbaru[]` — `{ judul, slug, tanggal_publikasi, is_penting }` |

#### Seksi 7: Statistik Kelembagaan (Opsional)

| Elemen | Detail |
|---|---|
| **Layout** | 4 kolom desktop, 2 kolom mobile |
| **Item** | Angka besar (`text-3xl`, bold, primary), label (`text-sm`, secondary), ikon Lucide opsional (48px, accent) |
| **Animasi** | Counter animasi (count-up) saat seksi pertama kali terlihat (IntersectionObserver) |
| **Batasan** | Max 4 item |
| **Edge-case** | 0 item: sembunyikan seksi |
| **Data dari backend** | `statistik[]` — `{ angka, label, ikon }` |

---

### 3.2 Halaman Profil

Halaman profil menggunakan navigasi tab horizontal di bawah PageHero.

#### 3.2.1 Tentang Kami (`/profil/tentang-kami`)

**File:** `pages/public/profil/tentang.tsx`
**Route name:** `public.profil.tentang`

| Elemen | Detail |
|---|---|
| **PageHero** | Judul: "Profil BKA", breadcrumb: Beranda > Profil > Tentang Kami |
| **Tab navigasi** | 3 tab: Tentang Kami (aktif), Visi & Misi, Struktur Organisasi. Underline style, warna primary untuk aktif. Klik tab → navigasi Inertia ke route masing-masing |
| **Konten** | Render rich text dari admin (`dangerouslySetInnerHTML`). Prose styling: max-width 768px, centered, heading H2/H3, paragraf, list, blockquote, gambar, link |
| **Edge-case** | Konten kosong: "Konten sedang diperbarui." (centered, text-secondary) |
| **Data dari backend** | `tentangKami` — `{ konten }` |

#### 3.2.2 Visi & Misi (`/profil/visi-misi`)

**File:** `pages/public/profil/visi-misi.tsx`
**Route name:** `public.profil.visiMisi`

| Elemen | Detail |
|---|---|
| **PageHero** | Judul: "Profil BKA", breadcrumb: Beranda > Profil > Visi & Misi |
| **Tab navigasi** | Sama, tab "Visi & Misi" aktif |
| **Seksi Visi** | Heading "Visi", teks paragraf dalam card atau blockquote stylized. Font lebih besar (`text-lg`), italic opsional |
| **Seksi Misi** | Heading "Misi", daftar bernomor. Setiap item misi tampil sebagai card kecil atau list item dengan ikon checkmark/circle. Desain harus bersih dan mudah dibaca |
| **Data dari backend** | `visi` — `string`, `misiItems[]` — `{ isi, urutan }` |

#### 3.2.3 Struktur Organisasi (`/profil/struktur-organisasi`)

**File:** `pages/public/profil/struktur.tsx`
**Route name:** `public.profil.struktur`

| Elemen | Detail |
|---|---|
| **PageHero** | Judul: "Profil BKA", breadcrumb: Beranda > Profil > Struktur Organisasi |
| **Tab navigasi** | Tab "Struktur Organisasi" aktif |
| **Gambar bagan** | Jika ada: gambar full-width (max 1200px), klik untuk buka lightbox (zoom). Responsive |
| **Grid anggota** | Grid 3–4 kolom desktop, 2 kolom tablet, 1 kolom mobile. Card per anggota: foto (1:1, rounded-full), nama (semibold), jabatan (text-secondary). Fallback foto: ikon avatar |
| **Kepala Biro** | Ditampilkan terpisah di atas grid anggota, card lebih besar, highlight visual (border accent atau background accent-light) |
| **Data dari backend** | `gambarBagan` — `string|null`, `anggota[]` — `{ nama, jabatan, foto_url, urutan }`, `kepalaBiro` — `{ nama, jabatan, foto_url }` |

---

### 3.3 Halaman Bidang Detail (`/bidang/{slug}`)

**File:** `pages/public/bidang/show.tsx`
**Route name:** `public.bidang.show`

| Elemen | Detail |
|---|---|
| **PageHero** | Judul: nama bidang. Breadcrumb: Beranda > {Nama Bidang}. Background: banner bidang (jika ada) dengan overlay, fallback solid primary |
| **Deskripsi lengkap** | Render rich text. Prose styling. Max-width 768px |
| **Struktur bidang** | **Kepala Bagian:** Card besar — foto 3:4, nama, jabatan, deskripsi tugas, ikon media sosial (link). **Anggota:** Grid 3–4 kolom — foto 1:1 (rounded-full), nama, jabatan. Urutan sesuai field `urutan` |
| **CTA** | Jika data CTA tersedia: seksi full-width dengan heading, sub-heading, dan tombol. Background primary-subtle atau accent-light |
| **Edge-case** | Kepala bagian kosong: sembunyikan seksi struktur. Anggota kosong: tampilkan kepala bagian saja. CTA kosong: sembunyikan seksi CTA |
| **Data dari backend** | `bidang` — `{ nama, slug, deskripsi_lengkap, banner_url, kepala_bagian, anggota[], cta }` |

---

### 3.4 Daftar Berita (`/berita`)

**File:** `pages/public/berita/index.tsx`
**Route name:** `public.berita.index`

| Elemen | Detail |
|---|---|
| **PageHero** | Judul: "Berita", breadcrumb: Beranda > Berita |
| **Filter & Pencarian** | Bar horizontal di atas grid. **Pencarian:** SearchInput (debounce 300ms, query param `?search=`). **Filter kategori:** pill buttons atau dropdown. Semua filter diproses server-side via Inertia router |
| **Grid konten** | 3 kolom desktop, 2 kolom tablet, 1 kolom mobile. Card berita: thumbnail 16:9, badge kategori, judul (max 2 baris), kutipan singkat (max 3 baris), tanggal + penulis (text-muted). Seluruh card clickable |
| **Pagination** | Navigasi halaman di bawah grid. 9 item per halaman. Info "Menampilkan X–Y dari Z" |
| **Loading state** | Skeleton grid (3 skeleton cards) saat loading |
| **Empty state** | Ikon Newspaper, "Belum Ada Berita", "Berita akan tampil setelah dipublikasikan oleh admin" |
| **Data dari backend** | Paginated `beritas` — `{ data[], links, meta }`, `kategoriList[]`, `filters` — `{ search, kategori }` |

---

### 3.5 Detail Berita (`/berita/{slug}`)

**File:** `pages/public/berita/show.tsx`
**Route name:** `public.berita.show`

| Elemen | Detail |
|---|---|
| **Breadcrumb** | Beranda > Berita > {Judul Berita} |
| **Layout** | 2 kolom desktop (8:4). 1 kolom mobile (sidebar di bawah) |
| **Konten utama (kiri)** | Judul (`text-3xl`, semibold), meta (tanggal, kategori badge, nama penulis), thumbnail besar (16:9, rounded-lg), isi artikel (prose rich text), tombol share |
| **Tombol share** | 3 ikon: WhatsApp (deep link), Facebook (share URL), Copy Link (clipboard API + toast "Link disalin!") |
| **Sidebar (kanan)** | **Berita Terkait:** 3 card mini (thumbnail kecil + judul + tanggal). Dari kategori sama, fallback terbaru. **Kategori:** list link ke `/berita?kategori={slug}` |
| **Data dari backend** | `berita` — `{ judul, slug, isi, thumbnail_url, kategori, tanggal_publikasi, penulis }`, `beritaTerkait[]` |

---

### 3.6 Daftar Pengumuman (`/pengumuman`)

**File:** `pages/public/pengumuman/index.tsx`
**Route name:** `public.pengumuman.index`

| Elemen | Detail |
|---|---|
| **PageHero** | Judul: "Pengumuman", breadcrumb: Beranda > Pengumuman |
| **Pencarian** | SearchInput sederhana (cari berdasarkan judul) |
| **Grid konten** | 3 kolom desktop, 2 tablet, 1 mobile. Card: thumbnail opsional (jika ada), judul, tanggal, kutipan singkat, badge "PENTING" (accent gold) jika `is_penting`. Card clickable |
| **Urutan** | `is_penting` di atas, lalu `tanggal_publikasi DESC` |
| **Pagination** | 9 item per halaman |
| **Empty state** | Ikon Bell, "Belum Ada Pengumuman" |
| **Data dari backend** | Paginated `pengumumans`, `filters` |

---

### 3.7 Detail Pengumuman (`/pengumuman/{slug}`)

**File:** `pages/public/pengumuman/show.tsx`
**Route name:** `public.pengumuman.show`

| Elemen | Detail |
|---|---|
| **Layout** | Single column, max-width 768px, centered |
| **Konten** | Judul, badge "PENTING" (jika ya), tanggal, isi rich text |
| **Lampiran** | Jika ada file lampiran: list berkas dengan ikon tipe file, nama, ukuran, tombol "Unduh". Max 3 file |
| **Tombol share** | WhatsApp, Facebook, Copy Link |
| **Pengumuman terkait** | 3 pengumuman terbaru lainnya di bawah konten |
| **Data dari backend** | `pengumuman` — `{ judul, slug, isi, thumbnail_url, is_penting, tanggal_publikasi, lampiran[] }`, `pengumumanTerkait[]` |

---

### 3.8 Galeri Dokumentasi (`/dokumentasi`)

**File:** `pages/public/dokumentasi/index.tsx`
**Route name:** `public.dokumentasi.index`

| Elemen | Detail |
|---|---|
| **PageHero** | Judul: "Dokumentasi", breadcrumb: Beranda > Dokumentasi |
| **Grid album** | 3–4 kolom desktop, 2 tablet, 1 mobile. Card album: foto sampul (16:9), judul kegiatan, tanggal kegiatan (format Indonesia), badge jumlah foto (e.g., "12 Foto"). Card clickable |
| **Pagination** | 12 item per halaman |
| **Empty state** | Ikon Image, "Belum Ada Album" |
| **Data dari backend** | Paginated `albums` — `{ judul, slug, cover_url, tanggal_kegiatan, jumlah_foto }` |

---

### 3.9 Detail Album (`/dokumentasi/{album-slug}`)

**File:** `pages/public/dokumentasi/show.tsx`
**Route name:** `public.dokumentasi.show`

| Elemen | Detail |
|---|---|
| **Breadcrumb** | Beranda > Dokumentasi > {Judul Album} |
| **Header** | Judul album (`text-3xl`), tanggal kegiatan, deskripsi (jika ada) |
| **Grid foto** | Masonry atau grid 3–4 kolom. Thumbnail per foto. Hover: overlay gelap + ikon zoom. Klik → buka lightbox |
| **Lightbox** | Navigasi: keyboard ← →, swipe mobile. Counter: "3 / 12". Zoom. Close: Escape / klik X |
| **Empty state** | "Belum ada foto dalam album ini" |
| **Data dari backend** | `album` — `{ judul, slug, deskripsi, tanggal_kegiatan, fotos[] }` |

---

### 3.10 Daftar Lampiran (`/lampiran`)

**File:** `pages/public/lampiran/index.tsx`
**Route name:** `public.lampiran.index`

| Elemen | Detail |
|---|---|
| **PageHero** | Judul: "Lampiran & Dokumen", breadcrumb: Beranda > Lampiran |
| **Daftar kategori** | Grid 3 kolom desktop, 2 tablet, 1 mobile. Card per kategori: ikon folder (Lucide), nama kategori (`text-xl`), deskripsi singkat, jumlah berkas badge. Card clickable → `/lampiran/{kategori-slug}` |
| **Empty state** | Ikon FileBox, "Belum Ada Lampiran" |
| **Data dari backend** | `kategoriLampirans[]` — `{ nama, slug, deskripsi, jumlah_berkas }` |

---

### 3.11 Berkas per Kategori (`/lampiran/{kategori-slug}`)

**File:** `pages/public/lampiran/kategori.tsx`
**Route name:** `public.lampiran.kategori`

| Elemen | Detail |
|---|---|
| **Breadcrumb** | Beranda > Lampiran > {Nama Kategori} |
| **Header** | Nama kategori, deskripsi |
| **Pencarian** | SearchInput (cari berdasarkan nama berkas dalam kategori) |
| **Daftar berkas** | Table-like list atau card list. Per berkas: ikon tipe file (PDF merah, DOCX biru, XLSX hijau, PPTX orange), nama tampilan, deskripsi singkat, ukuran file (format ramah: "1.5 MB"), tanggal upload, tombol "Unduh" (primary small button) |
| **Urutan** | `tanggal_upload DESC` |
| **Empty state** | "Belum ada berkas dalam kategori ini" |
| **Data dari backend** | `kategori` — `{ nama, slug, deskripsi }`, `berkas[]` — `{ nama_tampilan, deskripsi, tipe_file, ukuran, tanggal_upload, download_url }` |

---

### 3.12 Halaman Kontak (`/kontak`)

**File:** `pages/public/kontak/index.tsx`
**Route name:** `public.kontak.index`

| Elemen | Detail |
|---|---|
| **PageHero** | Judul: "Hubungi Kami", breadcrumb: Beranda > Kontak |
| **Layout** | 2 kolom desktop (info kiri, form kanan). 1 kolom mobile (info atas, form bawah) |
| **Info kontak (kiri)** | Ikon MapPin + alamat lengkap. Ikon Phone + nomor telepon. Ikon Mail + email. Ikon Clock + jam operasional. Ikon media sosial (link ke platform masing-masing) |
| **Google Maps** | Embed iframe responsif (16:9). Rounded-lg. Lazy load. Di bawah info kontak |
| **Formulir pesan (kanan)** | 4 field: Nama (input text), Email (input email), Subjek (input text), Pesan (textarea, min 20 karakter). Tombol "Kirim Pesan" (primary button). Loading state saat submit |
| **Validasi client-side** | Semua field wajib. Email format valid. Pesan min 20 karakter. Real-time error messages di bawah field |
| **Setelah submit** | Toast success "Pesan berhasil dikirim!", form di-reset. Tidak ada redirect |
| **Rate limit feedback** | Jika kena rate limit (3/10 menit): toast error "Terlalu banyak pesan. Silakan coba lagi nanti." |
| **Data dari backend** | `kontak` — `{ alamat, telepon, email, jam_operasional, google_maps_embed, mediaSosial[] }` |

---

## 4. Panel Admin

Semua halaman admin menggunakan `AdminLayout` dan membutuhkan autentikasi.
Route prefix: `/admin`. Middleware: `auth`, `verified`.

---

### 4.1 Dashboard (`/admin`)

**File:** `pages/admin/dashboard.tsx`
**Route name:** `admin.dashboard`

| Elemen | Detail |
|---|---|
| **Heading** | "Dashboard", breadcrumb: Dashboard |
| **Statistik cards** | Grid 3-4 kolom desktop, 2 mobile. Card per statistik: ikon (Lucide, 24px), angka besar (`text-3xl`, bold), label (`text-sm`, secondary). Cards: **Berita Terpublikasi** (ikon Newspaper, hijau), **Pengumuman Aktif** (ikon Bell, biru), **Pesan Belum Dibaca** (ikon Mail, amber), **Total Album** (ikon Image, ungu opsional) |
| **Aktivitas terbaru** | Tabel/list 10 log aktivitas terbaru (dari `spatie/activitylog`). Kolom: waktu (relative), pelaku (nama admin), aksi (deskripsi singkat: "Membuat berita: Judul...", "Menghapus pengumuman: ..."). **Hanya tampil untuk Super Admin** |
| **Quick actions** | Tombol shortcut: "Tambah Berita", "Tambah Pengumuman", "Lihat Pesan". Link ke halaman terkait |
| **Data dari backend** | `stats` — `{ beritaCount, pengumumanCount, pesanBelumDibaca, albumCount }`, `aktivitasTerbaru[]` (Super Admin only) |

---

### 4.2 Kelola Beranda (`/admin/beranda`)

**File:** `pages/admin/beranda/edit.tsx`
**Route name:** `admin.beranda.edit`

Halaman form tunggal untuk mengelola semua konten beranda.
Dibagi dalam section/tab atau accordion.

#### Sub-section: Banner / Slider

| Elemen | Detail |
|---|---|
| **Daftar banner** | Sortable list (drag & drop untuk reorder). Per item: preview thumbnail kecil, judul, status aktif/nonaktif, tombol edit, tombol hapus |
| **Tambah banner** | Tombol "Tambah Slide" → buka modal form. Form: upload gambar (preview, validasi 2MB, 16:9), judul (max 100), deskripsi (max 200), teks tombol (max 30), tautan tombol (URL valid) |
| **Batasan** | Max 5 slide aktif. Jika sudah 5: tombol "Tambah" disabled + pesan info |
| **Hapus** | Konfirmasi modal: "Hapus slide ini?" |
| **Submit** | Inertia `router.put()` per aksi (reorder, create, update, delete) |

#### Sub-section: Kata Sambutan Kepala Biro

| Elemen | Detail |
|---|---|
| **Form fields** | Upload foto (preview, 1MB, 3:4 atau 1:1), nama lengkap (max 100), jabatan (max 100), periode (max 50), teks sambutan (Rich Text Editor, max 2000 karakter) |
| **Preview** | Live preview kecil di samping form, menunjukkan bagaimana tampilan di beranda |
| **Submit** | Tombol "Simpan Perubahan" |

#### Sub-section: Statistik Kelembagaan

| Elemen | Detail |
|---|---|
| **Form** | Repeater field: max 4 item. Per item: angka (max 10 karakter), label (max 50), ikon (select dari daftar Lucide yang dikurasi) |
| **Interaksi** | Tambah/hapus item. Drag & drop reorder |

#### Sub-section: Bidang / Bagian BKA

| Elemen | Detail |
|---|---|
| **Management** | Link ke halaman `/admin/bidang` untuk CRUD penuh |
| **Quick info** | Tampilkan jumlah bidang aktif dan preview urutan |

#### Sub-section: Layanan BKA

| Elemen | Detail |
|---|---|
| **Form section** | Judul section (max 100), deskripsi section (max 300), URL YouTube embed (URL valid) |
| **Item layanan** | Repeater field: max 6 item. Per item: judul (max 100), deskripsi (max 300), ikon (select Lucide). Drag & drop reorder |

---

### 4.3 Kelola Bidang (`/admin/bidang`)

#### Daftar Bidang (`/admin/bidang`)

**File:** `pages/admin/bidang/index.tsx`
**Route name:** `admin.bidang.index`

| Elemen | Detail |
|---|---|
| **DataTable** | Kolom: Urutan (drag handle), Nama Bidang, Slug, Jumlah Anggota, Aksi (edit, hapus) |
| **Tombol** | "Tambah Bidang" → `/admin/bidang/create` |
| **Hapus** | Konfirmasi dialog |
| **Max** | 6 bidang. Jika penuh: tombol tambah disabled |

#### Tambah/Edit Bidang (`/admin/bidang/create`, `/admin/bidang/{id}/edit`)

**File:** `pages/admin/bidang/create.tsx`, `pages/admin/bidang/edit.tsx`
**Route name:** `admin.bidang.create`, `admin.bidang.edit`

| Elemen | Detail |
|---|---|
| **Form fields** | Nama bidang (max 100), slug (auto-generate, editable, unique), deskripsi singkat (max 200), deskripsi lengkap (Rich Text Editor, max 2000), banner (upload gambar, opsional), urutan |
| **Sub-section: Kepala Bagian** | Foto (wajib, 1MB, 3:4), nama (max 100), jabatan (max 100), deskripsi tugas (max 500), media sosial (repeater: platform select + URL) |
| **Sub-section: Anggota** | Repeater/sortable list. Per anggota: foto (opsional, 1MB, 1:1), nama (max 100), jabatan (max 100). Max 20 anggota. Drag & drop reorder |
| **Sub-section: CTA** | Heading CTA (max 100), sub CTA (max 100), teks tombol (max 30), tautan (URL valid). Semua opsional |
| **Submit** | "Simpan" / "Perbarui" + "Batal" (back to index) |

---

### 4.4 Kelola Profil (`/admin/profil/*`)

#### Tentang Kami (`/admin/profil/tentang`)

**File:** `pages/admin/profil/tentang-edit.tsx`
**Route name:** `admin.profil.tentang.edit`

| Elemen | Detail |
|---|---|
| **Form** | Rich Text Editor full-width. Heading hanya H2, H3. Tombol "Simpan" |
| **Preview** | Link "Lihat di website" (buka tab baru ke `/profil/tentang-kami`) |

#### Visi & Misi (`/admin/profil/visi-misi`)

**File:** `pages/admin/profil/visi-misi-edit.tsx`
**Route name:** `admin.profil.visiMisi.edit`

| Elemen | Detail |
|---|---|
| **Visi** | Textarea (max 500 karakter). Character counter |
| **Misi** | Repeater field sortable. Per item: input text (max 200). Min 1 item, max 10. Tombol tambah/hapus. Drag & drop reorder |
| **Submit** | Tombol "Simpan Perubahan" |

#### Kepala Biro (`/admin/profil/kepala-biro`)

**File:** `pages/admin/profil/kepala-biro-edit.tsx`
**Route name:** `admin.profil.kepalaBiro.edit`

| Elemen | Detail |
|---|---|
| **Form** | Upload foto (preview, 1MB), nama (max 100), jabatan (max 100), periode (max 50), sambutan (Rich Text Editor, max 2000). Sama dengan data di beranda — satu record |
| **Submit** | "Simpan Perubahan" |

#### Struktur Organisasi (`/admin/profil/struktur`)

**File:** `pages/admin/profil/struktur-edit.tsx`
**Route name:** `admin.profil.struktur.edit`

| Elemen | Detail |
|---|---|
| **Gambar bagan** | Upload gambar (max 5MB, PNG/JPG). Preview current. Tombol hapus |
| **Daftar anggota** | Sortable list/table. Per anggota: foto (1:1, opsional), nama, jabatan, urutan. Tombol: tambah, edit (modal), hapus |
| **Submit** | "Simpan Perubahan" untuk bagan. CRUD individual untuk anggota |

---

### 4.5 Kelola Berita (`/admin/berita`)

#### Daftar Berita (`/admin/berita`)

**File:** `pages/admin/berita/index.tsx`
**Route name:** `admin.berita.index`

| Elemen | Detail |
|---|---|
| **Toolbar** | SearchInput (cari judul), filter status (draf/terpublikasi/diarsipkan), filter kategori. Tombol "Tambah Berita" |
| **DataTable** | Kolom: Thumbnail (kecil), Judul (truncate), Kategori (badge), Status (StatusBadge), Tanggal Publikasi, Aksi (edit, hapus). Alternating row colors. Sortable by tanggal |
| **Pagination** | 10 item per halaman |
| **Hapus** | Soft delete. Konfirmasi modal: "Berita '{judul}' akan dihapus." |
| **Empty state** | "Belum Ada Berita. Klik 'Tambah Berita' untuk membuat berita pertama." |
| **Loading** | Skeleton table rows |

#### Tambah Berita (`/admin/berita/create`)

**File:** `pages/admin/berita/create.tsx`
**Route name:** `admin.berita.create`

| Elemen | Detail |
|---|---|
| **Form layout** | Single column, max-width 640px |
| **Fields** | Judul (min 10, max 200. Di bawah: slug preview auto-generate). Slug (editable, regex alphanumeric + dash). Kategori (select dropdown, opsional). Thumbnail (upload gambar, wajib, 2MB, 16:9, preview). Isi (Rich Text Editor, min 50 karakter). Status (select: draf/terpublikasi/diarsipkan, default draf). Tanggal publikasi (date-time picker, opsional, must be ≥ today if set) |
| **Validasi client-side** | Real-time. Slug auto-update saat judul berubah (kecuali sudah di-edit manual). Character counter untuk judul. Error messages di bawah field |
| **Submit** | "Simpan Berita" (primary) + "Batal" (secondary, back to index). Loading state saat submit |
| **Success** | Redirect ke `/admin/berita` + toast "Berita berhasil disimpan." |

#### Edit Berita (`/admin/berita/{id}/edit`)

**File:** `pages/admin/berita/edit.tsx`
**Route name:** `admin.berita.edit`

| Elemen | Detail |
|---|---|
| **Form** | Sama dengan create, tapi pre-filled dengan data existing. Thumbnail: tampilkan current + opsi ganti |
| **Slug** | Unique check exclude current ID |
| **Submit** | "Perbarui Berita". Success: redirect + toast "Berita berhasil diperbarui." |

#### Kategori Berita (`/admin/berita` — sub-section atau tab)

| Elemen | Detail |
|---|---|
| **Management** | Inline management di halaman daftar berita, atau halaman terpisah. Daftar kategori: nama, slug, jumlah berita. Tombol tambah (modal form), edit (modal), hapus (konfirmasi) |
| **Validasi** | Nama max 50, unique. Slug auto-generate |
| **Edge-case hapus** | "Kategori ini memiliki X berita. Berita akan menjadi 'tanpa kategori'. Lanjutkan?" |

---

### 4.6 Kelola Pengumuman (`/admin/pengumuman`)

#### Daftar Pengumuman (`/admin/pengumuman`)

**File:** `pages/admin/pengumuman/index.tsx`
**Route name:** `admin.pengumuman.index`

| Elemen | Detail |
|---|---|
| **Toolbar** | SearchInput, filter status, toggle filter "Hanya Penting". Tombol "Tambah Pengumuman" |
| **DataTable** | Kolom: Judul, Status (StatusBadge), Penting (ikon star/badge), Tanggal Publikasi, Aksi |
| **Pagination** | 10 item per halaman |

#### Tambah/Edit Pengumuman

**File:** `pages/admin/pengumuman/create.tsx`, `pages/admin/pengumuman/edit.tsx`
**Route name:** `admin.pengumuman.create`, `admin.pengumuman.edit`

| Elemen | Detail |
|---|---|
| **Fields** | Judul (min 10, max 200), slug (auto-generate), thumbnail (opsional, 2MB), isi (Rich Text Editor, min 20), lampiran (multi-file upload, max 3 file, PDF/DOCX/XLSX, 10MB each), status (select), penting (toggle/switch boolean) |
| **Lampiran** | Daftar file yang sudah diupload (nama, ukuran, tombol hapus). Area upload baru. Preview nama file sebelum upload |

---

### 4.7 Kelola Dokumentasi (`/admin/dokumentasi`)

#### Daftar Album (`/admin/dokumentasi`)

**File:** `pages/admin/dokumentasi/index.tsx`
**Route name:** `admin.dokumentasi.index`

| Elemen | Detail |
|---|---|
| **Grid atau Table** | Card/row per album: cover thumbnail, judul, tanggal kegiatan, jumlah foto, aksi (edit, kelola foto, hapus) |
| **Tombol** | "Tambah Album" |

#### Tambah/Edit Album

**File:** `pages/admin/dokumentasi/create.tsx`, `pages/admin/dokumentasi/edit.tsx`

| Elemen | Detail |
|---|---|
| **Fields** | Judul album (max 150), slug (auto-generate), deskripsi (max 500), tanggal kegiatan (date picker, wajib), foto sampul (upload, 2MB, wajib) |

#### Kelola Foto dalam Album (`/admin/dokumentasi/{id}/edit` — sub-section)

| Elemen | Detail |
|---|---|
| **Upload foto** | Bulk upload area (drag & drop multiple files). Progress bar per file. Validasi: JPG/PNG/WebP, max 2MB per foto, max 50 foto per album |
| **Grid foto** | Sortable grid (drag & drop reorder). Per foto: thumbnail preview, tombol hapus (konfirmasi). Counter "X / 50 foto" |
| **Hapus foto** | Konfirmasi: "Hapus foto ini dari album?" |

---

### 4.8 Kelola Lampiran (`/admin/lampiran`)

#### Daftar Kategori & Berkas

**File:** `pages/admin/lampiran/index.tsx`
**Route name:** `admin.lampiran.kategori.index`

| Elemen | Detail |
|---|---|
| **Layout** | Master-detail atau tab: daftar kategori (kiri/atas), berkas per kategori (kanan/bawah) |
| **Kategori list** | Sortable list. Per kategori: nama, deskripsi singkat, jumlah berkas, aksi (edit, hapus). Tombol "Tambah Kategori" → modal form |
| **Tambah kategori** | Modal: nama (max 100, unique), deskripsi (max 300), urutan |
| **Hapus kategori** | Konfirmasi: "Kategori ini memiliki X berkas. Semua berkas akan ikut terhapus. Lanjutkan?" |
| **Berkas per kategori** | Saat kategori dipilih: tampilkan daftar berkas. Per berkas: ikon tipe file, nama tampilan, deskripsi, ukuran, tanggal upload, aksi (edit, hapus, preview link) |
| **Tambah berkas** | Form (inline atau modal): upload file (PDF/DOCX/XLSX/PPTX, 10MB), nama tampilan (max 150), deskripsi (max 300), kategori (pre-selected) |
| **Edit berkas** | Modal: edit nama tampilan, deskripsi, ganti file (opsional) |

---

### 4.9 Pengaturan (`/admin/pengaturan`)

**File:** `pages/admin/pengaturan/edit.tsx`
**Route name:** `admin.pengaturan.edit`

#### Sub-section: Informasi Kontak (Admin & Super Admin)

| Elemen | Detail |
|---|---|
| **Fields** | Alamat (textarea, max 300), telepon (max 20), email (format valid), jam operasional (max 100), embed Google Maps (textarea untuk kode iframe) |
| **Submit** | "Simpan Perubahan" |

#### Sub-section: Tautan Media Sosial (Admin & Super Admin)

| Elemen | Detail |
|---|---|
| **Repeater** | Per item: platform (select: Facebook, Twitter/X, Instagram, LinkedIn, YouTube, TikTok), URL (valid URL). Tambah/hapus dinamis |

#### Sub-section: Pengaturan Sistem (Super Admin Only)

| Elemen | Detail |
|---|---|
| **Visibilitas** | Hanya render jika `auth.user.roles` contains `super_admin` |
| **Fields** | Nama website (max 100), deskripsi SEO (max 160, character counter), logo (upload PNG/SVG, 500KB), favicon (upload ICO/PNG, 100KB, 32×32 atau 64×64) |
| **Preview** | Live preview logo dan favicon |

---

### 4.10 Pesan Kontak (Inbox) (`/admin/pengaturan` — sub-tab atau halaman terpisah)

**File:** `pages/admin/pesan/index.tsx` (atau sub-section pengaturan)

| Elemen | Detail |
|---|---|
| **Daftar pesan** | Table/list. Kolom: Nama pengirim, Email, Subjek, Tanggal, Status (dibaca/belum dibaca — bold untuk belum dibaca). Klik baris → buka detail di modal atau expand |
| **Detail pesan** | Modal: nama, email (mailto link), subjek, tanggal lengkap, isi pesan. Tombol "Tandai Dibaca" / "Tandai Belum Dibaca" |
| **Filter** | Toggle: "Semua" / "Belum Dibaca" |
| **Badge** | Jumlah pesan belum dibaca di sidebar menu item |

---

## 5. Halaman Super Admin Only

Route middleware tambahan: `role:super_admin`.
Menu "Pengguna" di sidebar **hanya tampil** untuk Super Admin.

---

### 5.1 Manajemen Pengguna (`/admin/pengguna`)

#### Daftar Administrator (`/admin/pengguna`)

**File:** `pages/admin/pengguna/index.tsx`
**Route name:** `admin.pengguna.index`

| Elemen | Detail |
|---|---|
| **Guard** | Middleware `role:super_admin`. Admin biasa → 403 |
| **DataTable** | Kolom: Nama, Email, Role (badge: super_admin hijau tua, admin hijau muda), Status (badge: aktif hijau, nonaktif merah), Terakhir Login (relative date), Aksi |
| **Aksi per row** | Edit (link ke form), Toggle Status (switch/tombol aktifkan-nonaktifkan) |
| **Tombol** | "Tambah Administrator". Disabled + tooltip jika sudah 10 admin aktif |
| **Toggle status** | Konfirmasi modal: "Nonaktifkan akun {nama}? Admin ini tidak akan bisa login." / "Aktifkan kembali akun {nama}?" |
| **Edge-case** | Super Admin terakhir mencoba menonaktifkan diri: tombol toggle disabled + tooltip "Minimal 1 Super Admin harus aktif". Admin yang dinonaktifkan: sesi di-invalidate |
| **Data dari backend** | `administrators[]` — `{ id, name, email, roles, is_active, last_login_at }`, `adminCount`, `maxAdmin` (10) |

#### Tambah Administrator (`/admin/pengguna/create`)

**File:** `pages/admin/pengguna/create.tsx`
**Route name:** `admin.pengguna.create`

| Elemen | Detail |
|---|---|
| **Guard** | Super Admin only |
| **Form** | Nama (max 100), email (unique, format valid), password (min 8, mixed case + numbers, strength indicator), konfirmasi password, role (select: hanya `admin` — Super Admin tidak bisa dibuat via UI) |
| **Password strength** | Visual indicator: weak/medium/strong. Checklist: min 8 char, huruf besar, huruf kecil, angka |
| **Submit** | "Buat Akun". Success: redirect + toast "Akun administrator berhasil dibuat." |

#### Edit Administrator (`/admin/pengguna/{id}/edit`)

**File:** `pages/admin/pengguna/edit.tsx`
**Route name:** `admin.pengguna.edit`

| Elemen | Detail |
|---|---|
| **Guard** | Super Admin only |
| **Form** | Nama, email (unique exclude current). Password opsional (kosongkan jika tidak ingin mengubah). Role: readonly display (tidak bisa diubah via form ini) |
| **Batasan** | Tidak bisa mengedit akun Super Admin lain. Tidak bisa mengubah role sendiri |
| **Submit** | "Perbarui Akun" |

---

### 5.2 Log Aktivitas (Dashboard — Super Admin View)

| Elemen | Detail |
|---|---|
| **Lokasi** | Ditampilkan di dashboard, bagian bawah, hanya untuk Super Admin |
| **Konten** | 10 entry terbaru dari `activity_log`. Per entry: timestamp (relative), nama pelaku, deskripsi aksi, ikon sesuai tipe aksi |
| **Tipe aksi & ikon** | Login → LogIn, Buat konten → Plus, Edit konten → Pencil, Hapus konten → Trash, Upload file → Upload, Kelola pengguna → UserCog |
| **Tidak ada halaman terpisah** | Cukup di dashboard (versi awal) |

---

## 6. Halaman Error & Auth

### 6.1 Halaman 404

**File:** `pages/error/not-found.tsx`

| Elemen | Detail |
|---|---|
| **Layout** | PublicLayout (dengan navbar + footer) |
| **Konten** | Angka "404" (`text-5xl`, text-muted, semitransparan). Judul: "Halaman Tidak Ditemukan". Deskripsi: "Halaman yang Anda cari tidak tersedia atau telah dipindahkan." Tombol: "← Kembali ke Beranda" (primary) |

### 6.2 Halaman 403

**File:** `pages/error/forbidden.tsx`

| Elemen | Detail |
|---|---|
| **Layout** | PublicLayout |
| **Konten** | Angka "403" (`text-5xl`). Judul: "Akses Ditolak". Deskripsi: "Anda tidak memiliki izin untuk mengakses halaman ini." Tombol: "Kembali ke Beranda" atau "Login" (jika belum login) |

### 6.3 Login (`/login`)

**File:** `pages/auth/login.tsx` (sudah ada)

| Elemen | Detail |
|---|---|
| **Layout** | AuthLayout (centered card, logo BKA di atas) |
| **Form** | Email, password (toggle show/hide), tombol "Masuk" (primary, full-width), link "Lupa password?" |
| **Throttle feedback** | Setelah 5 gagal/menit: "Terlalu banyak percobaan. Silakan coba lagi dalam X detik." dengan countdown |
| **Redirect** | Sukses → `/admin`. Sudah login → redirect ke `/admin` |

### 6.4 Lupa Password (`/lupa-password`)

**File:** `pages/auth/forgot-password.tsx`

| Elemen | Detail |
|---|---|
| **Form** | Email input, tombol "Kirim Link Reset". Loading state. Pesan sukses generik (jangan bocorkan info email terdaftar atau tidak) |

### 6.5 Reset Password (`/reset-password/{token}`)

**File:** `pages/auth/reset-password.tsx`

| Elemen | Detail |
|---|---|
| **Form** | Email (readonly/hidden), password baru (strength indicator), konfirmasi password. Tombol "Atur Password Baru". Sukses → redirect ke login + toast |

---

## 7. Prioritas & Urutan Pengerjaan

### Phase 1 — Foundation & Core (MVP)

Urutan pengerjaan yang direkomendasikan:

```
1.  Shared Components (Button, Card, Badge, Input, Modal, Toast, Skeleton, EmptyState)
2.  Layout: Navbar Publik + Footer + PublicLayout diperkaya
3.  Layout: Sidebar Admin + Topbar diperkaya + AdminLayout diperkaya
4.  Beranda (semua seksi)
5.  Profil (Tentang Kami, Visi Misi, Struktur Organisasi)
6.  Berita (Daftar + Detail publik)
7.  Pengumuman (Daftar + Detail publik)
8.  Kontak (Info + Formulir)
9.  Auth (Login, Lupa Password, Reset Password) — sudah ada, polish
10. Admin Dashboard (statistik cards + quick actions)
11. Admin: Kelola Beranda (banner, sambutan, statistik)
12. Admin: Kelola Profil (tentang, visi misi, kepala biro, struktur)
13. Admin: CRUD Berita (daftar, tambah, edit, kategori)
14. Admin: CRUD Pengumuman (daftar, tambah, edit)
15. Halaman Error (404, 403)
```

### Phase 2 — Extended Features

```
16. Bidang BKA (Halaman detail publik + CRUD admin)
17. Layanan BKA (CRUD admin + tampilan beranda)
18. Dokumentasi / Galeri (Daftar album + Detail album + Lightbox + CRUD admin)
19. Lampiran (Daftar kategori + Berkas per kategori + CRUD admin)
20. Pesan Kontak (Inbox admin)
21. Super Admin: Manajemen Pengguna (daftar, tambah, edit, toggle status)
22. Admin: Pengaturan (kontak, media sosial, pengaturan sistem)
```

### Phase 3 — Polish & Optimization

```
23. SEO: Meta tags, Open Graph, sitemap.xml per halaman
24. Performa: Lazy load gambar, image compression, skeleton loading semua halaman
25. UX: Animasi halus (scroll-triggered fade-in, hover micro-interactions)
26. Responsivitas: Audit semua halaman di 360px, 768px, 1024px, 1280px
27. Aksesibilitas: Focus ring, alt text, heading hierarchy, ARIA labels
28. Log Aktivitas di dashboard Super Admin
29. SearchInput global refinement
30. Polish loading states, error states, edge-case handling di semua form
```

---

## Checklist Kualitas Frontend

Sebelum menganggap sebuah halaman "selesai", pastikan:

- [ ] Semua elemen mengikuti token warna dari `05-UIUX-GUIDELINES.md`
- [ ] Tipografi menggunakan Plus Jakarta Sans dengan skala yang benar
- [ ] Responsif: tampil baik di 360px, 768px, 1024px, 1280px
- [ ] Loading state: skeleton atau spinner sesuai konteks
- [ ] Empty state: pesan informatif + ikon
- [ ] Error state: pesan error di bawah field, toast untuk aksi gagal
- [ ] Success state: toast notification setelah aksi berhasil
- [ ] Konfirmasi modal untuk semua aksi destruktif
- [ ] Touch target minimal 44px di mobile
- [ ] Semua gambar memiliki `alt` text
- [ ] Heading hierarchy benar (1 H1 per halaman)
- [ ] Flash messages dari Inertia ditangkap dan ditampilkan sebagai toast
- [ ] Form validation berjalan di client-side (UX) DAN server-side (security)
- [ ] Tidak ada console error atau warning
- [ ] Progress bar Inertia berfungsi saat navigasi antar halaman
