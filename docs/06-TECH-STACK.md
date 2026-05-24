# 06 — Tech Stack & Keputusan Teknologi

## Stack Utama

| Layer | Teknologi | Versi |
|---|---|---|
| Backend Framework | Laravel | 11.x |
| Frontend Library | React | 18.x |
| Fullstack Bridge | Inertia.js | 2.x |
| Database | MySQL | 8.x |
| Styling | Tailwind CSS | 3.x |
| Build Tool | Vite | 5.x |
| Runtime | Node.js | 20.x (LTS) |
| PHP | PHP | 8.2+ |

---

## Paket & Library Penting

### Backend (Composer / Laravel Ecosystem)

| Paket | Fungsi |
|---|---|
| `laravel/breeze` (Inertia + React) | Scaffold autentikasi awal |
| `spatie/laravel-permission` | Manajemen peran dan hak akses (RBAC) |
| `spatie/laravel-medialibrary` | Upload dan pengelolaan file/media terpusat |
| `spatie/laravel-sluggable` | Auto-generate slug dari judul |
| `spatie/laravel-image-optimizer` | Kompresi otomatis gambar yang diunggah |
| `spatie/laravel-activitylog` | Logging aktivitas admin (audit trail) |

### Frontend (NPM / React Ecosystem)

| Paket | Fungsi |
|---|---|
| `@inertiajs/react` | Integrasi Inertia dengan React |
| `lucide-react` | Library ikon utama |
| `@tiptap/react` | Rich text editor (WYSIWYG) untuk konten berita dan profil |
| `yet-another-react-lightbox` | Lightbox untuk galeri foto |
| `react-hot-toast` | Notifikasi toast yang ringan |
| `clsx` | Utility untuk class conditional yang bersih |

### Paket yang TIDAK Digunakan

Untuk menghindari over-engineering, **jangan gunakan** paket-paket ini:

| Paket | Alasan Tidak Digunakan |
|---|---|
| `@tanstack/react-query` | Tidak perlu — Inertia sudah menangani data fetching |
| `axios` (manual) | Tidak perlu — gunakan `router` dari Inertia untuk request |
| `redux` / `zustand` | Tidak perlu — state cukup dikelola via props Inertia + local React state |
| `framer-motion` | Terlalu berat — cukup CSS transitions |
| `AdminLTE` / `Filament` | Tidak digunakan — admin panel dibangun sendiri |
| `next.js` | Tidak digunakan — ini bukan SPA murni, tapi Laravel + Inertia |

---

## Arsitektur Umum

### Alur Request

```
Browser
  │
  ▼
Laravel Router
  │
  ▼
Middleware (auth, role check, rate limit)
  │
  ▼
Controller → Service / Action
  │
  ▼
Model (Eloquent) → MySQL
  │
  ▼
Inertia Response (kirim data sebagai props ke React)
  │
  ▼
React Component (render halaman)
```

### Inertia.js sebagai Bridge

Dengan Inertia, backend tetap Laravel (routing, controller, auth, middleware)
dan frontend tetap React (komponen, state, UI). Tidak ada REST API terpisah
untuk halaman-halaman internal. Data dikirim dari controller sebagai props
langsung ke komponen React.

**Aturan penting:**
- Gunakan `Inertia::render()` untuk semua response halaman
- Gunakan `router.post()`, `router.put()`, `router.delete()` dari Inertia (bukan axios) untuk form submission
- Flash messages dikirim via `session()->flash()` dan di-share ke React via `HandleInertiaRequests` middleware

---

## Naming Conventions

### Backend (Laravel)

| Elemen | Konvensi | Contoh |
|---|---|---|
| Model | PascalCase, singular | `Berita`, `Pengumuman`, `KategoriBerita` |
| Controller | PascalCase + Controller | `BeritaController`, `PengumumanController` |
| Controller (admin) | Namespace `Admin\` | `Admin\BeritaController` |
| Controller (publik) | Namespace `Public\` | `Public\BeritaController` |
| Migration | snake_case, deskriptif | `create_beritas_table`, `add_status_to_pengumumans` |
| Tabel DB | snake_case, plural | `beritas`, `pengumumans`, `kategori_beritas` |
| Kolom DB | snake_case | `tanggal_publikasi`, `is_penting`, `created_at` |
| Service | PascalCase + Service | `BeritaService`, `MediaService` |
| Form Request | PascalCase + Request | `StoreBeritaRequest`, `UpdateBeritaRequest` |
| Route name | dot notation | `admin.berita.store`, `public.berita.show` |
| Middleware | camelCase | `checkRole`, `rateLimiter` |
| Seeder | PascalCase + Seeder | `RoleSeeder`, `AdminUserSeeder` |

### Frontend (React)

| Elemen | Konvensi | Contoh |
|---|---|---|
| Page component | PascalCase | `Pages/Admin/Berita/Index.jsx` |
| Reusable component | PascalCase | `Components/Card.jsx`, `Components/Badge.jsx` |
| Layout | PascalCase + Layout | `Layouts/PublicLayout.jsx`, `Layouts/AdminLayout.jsx` |
| Hook | camelCase, prefix `use` | `hooks/useDebounce.js`, `hooks/useMediaQuery.js` |
| Utility | camelCase | `lib/formatDate.js`, `lib/truncateText.js` |
| CSS class (Tailwind) | Langsung di JSX | — |
| Props | camelCase | `berita`, `kategoriList`, `onSubmit` |

---

## Struktur Direktori (Gambaran Umum)

```
app/
  Http/
    Controllers/
      Admin/              ← semua controller panel admin
        BeritaController.php
        PengumumanController.php
        DokumentasiController.php
        LampiranController.php
        BerandaController.php
        ProfilController.php
        PenggunaController.php     ← Super Admin only
        PengaturanController.php
        DashboardController.php
      Public/             ← controller untuk halaman publik
        HomeController.php
        BeritaController.php
        PengumumanController.php
        DokumentasiController.php
        LampiranController.php
        KontakController.php
        ProfilController.php
    Middleware/
      HandleInertiaRequests.php
    Requests/
      Admin/              ← Form Request validations
        StoreBeritaRequest.php
        UpdateBeritaRequest.php
        ...
  Models/
    User.php
    Berita.php
    Pengumuman.php
    KategoriBerita.php
    Album.php
    Foto.php
    KategoriLampiran.php
    Lampiran.php
    PesanKontak.php
    Pengaturan.php
    Banner.php
    StrukturAnggota.php
  Services/               ← logika bisnis yang dipisah dari controller
    BeritaService.php
    MediaService.php
    ...

database/
  migrations/
  seeders/
    RoleSeeder.php
    AdminUserSeeder.php

resources/
  js/
    Components/           ← komponen React yang dapat dipakai ulang
      ui/                 ← komponen dasar (Button, Card, Badge, Input, Modal, dll.)
      layout/             ← komponen layout (Navbar, Footer, Sidebar, Breadcrumb)
    Layouts/
      PublicLayout.jsx    ← layout halaman publik (navbar + footer)
      AdminLayout.jsx     ← layout panel admin (sidebar + topbar)
    Pages/
      Admin/
        Dashboard.jsx
        Berita/
          Index.jsx
          Create.jsx
          Edit.jsx
        Pengumuman/
          Index.jsx
          Create.jsx
          Edit.jsx
        Dokumentasi/
          ...
        Lampiran/
          ...
        Pengguna/         ← Super Admin only
          Index.jsx
          Create.jsx
          Edit.jsx
        Beranda/
          Edit.jsx
        Profil/
          ...
        Pengaturan/
          Edit.jsx
      Public/
        Home.jsx
        Berita/
          Index.jsx
          Show.jsx
        Pengumuman/
          Index.jsx
          Show.jsx
        Dokumentasi/
          Index.jsx
          Show.jsx
        Lampiran/
          Index.jsx
          Kategori.jsx
        Kontak.jsx
        Profil/
          Tentang.jsx
          VisiMisi.jsx
          Struktur.jsx
      Error/
        NotFound.jsx      ← 404
        Forbidden.jsx     ← 403
    hooks/                ← custom React hooks
    lib/                  ← utility functions

routes/
  web.php                 ← semua route (publik dan admin)

storage/
  app/
    public/               ← file yang dapat diakses publik (via symlink)
```

---

## Database Schema Overview

### Tabel Utama dan Relasi

```
users
  ├── id, name, email, password, is_active, timestamps, soft_deletes
  └── ← model_has_roles (spatie/permission)

beritas
  ├── id, judul, slug, isi, thumbnail, status, tanggal_publikasi,
  │   kategori_berita_id (nullable FK), user_id (FK), timestamps, soft_deletes
  └── belongsTo: KategoriBerita, User

kategori_beritas
  ├── id, nama, slug, timestamps
  └── hasMany: Berita

pengumumans
  ├── id, judul, slug, isi, thumbnail (nullable), is_penting,
  │   status, tanggal_publikasi, user_id (FK), timestamps, soft_deletes
  └── belongsTo: User
  └── hasMany: Media (via medialibrary — lampiran per pengumuman)

albums
  ├── id, judul, slug, deskripsi, tanggal_kegiatan,
  │   timestamps, soft_deletes
  └── hasMany: Foto
  └── hasOne: Media (cover via medialibrary)

fotos
  ├── id, album_id (FK), urutan, timestamps
  └── belongsTo: Album
  └── hasOne: Media (via medialibrary)

kategori_lampirans
  ├── id, nama, slug, deskripsi, urutan, timestamps, soft_deletes
  └── hasMany: Lampiran

lampirans
  ├── id, nama_tampilan, deskripsi, kategori_lampiran_id (FK),
  │   timestamps, soft_deletes
  └── belongsTo: KategoriLampiran
  └── hasOne: Media (via medialibrary)

banners
  ├── id, judul, deskripsi, teks_tombol, tautan_tombol,
  │   urutan, is_active, timestamps
  └── hasOne: Media (gambar via medialibrary)

pengaturans
  ├── id, key, value, timestamps
  └── (key-value store untuk semua pengaturan website)

pesan_kontaks
  ├── id, nama, email, subjek, pesan, is_read, timestamps
  └── (standalone, tidak ada relasi)

kepala_biros
  ├── id, nama, jabatan, periode, sambutan, timestamps
  └── hasOne: Media (foto via medialibrary)

struktur_anggotas
  ├── id, nama, jabatan, urutan, timestamps
  └── hasOne: Media (foto via medialibrary)

halaman_statis (untuk Tentang Kami, Visi Misi)
  ├── id, slug, judul, konten, timestamps
  └── (singleton per slug — e.g., 'tentang-kami', 'visi-misi')

misis
  ├── id, isi, urutan, timestamps
  └── (daftar poin misi — dikelola terpisah agar bisa di-reorder)

activity_log (dari spatie/activitylog)
  └── (otomatis — log semua aktivitas admin)
```

### Kolom `status` (Enum)

Untuk tabel `beritas` dan `pengumumans`, gunakan enum:

```php
enum ContentStatus: string {
    case DRAF = 'draf';
    case TERPUBLIKASI = 'terpublikasi';
    case DIARSIPKAN = 'diarsipkan';
}
```

---

## Pengelolaan File & Media

Semua file yang diunggah (gambar, dokumen) dikelola melalui
`spatie/laravel-medialibrary`. Ini memastikan:

- Upload terpusat dari satu antarmuka yang konsisten
- Konversi gambar otomatis (thumbnail, optimasi)
- URL yang bersih dan konsisten
- Mudah dipindahkan ke cloud storage (S3, dll) di masa depan hanya
  dengan mengubah disk konfigurasi

### Media Collections per Model

| Model | Collection | Konversi |
|---|---|---|
| Berita | `thumbnail` | `thumb` (400×225, crop center) |
| Banner | `gambar` | `display` (1920×1080, fit) |
| Album | `cover` | `thumb` (400×225, crop center) |
| Foto | `foto` | `thumb` (400×300, crop center) |
| Lampiran | `berkas` | — (tidak perlu konversi, file dokumen) |
| KepalaBiro | `foto` | `display` (400×533, crop center, 3:4) |
| StrukturAnggota | `foto` | `display` (200×200, crop center, 1:1) |

---

## Autentikasi & Otorisasi

Autentikasi menggunakan sistem bawaan Laravel (session-based).
Otorisasi berbasis peran menggunakan `spatie/laravel-permission`.

Dua peran terautentikasi: `super_admin` dan `admin`.
Middleware akan mengecek peran sebelum mengizinkan akses ke route tertentu
di bawah `/admin`. Halaman `/lampiran` dapat diakses secara publik tanpa
middleware pengecekan peran (tidak membutuhkan autentikasi).

Detail keamanan lengkap: lihat `07-SECURITY.md`.

---

## Shared Data via Inertia

Data yang dibagikan ke **semua halaman** via `HandleInertiaRequests` middleware:

```php
public function share(Request $request): array
{
    return [
        ...parent::share($request),
        'auth' => [
            'user' => $request->user() ? [
                'id' => $request->user()->id,
                'name' => $request->user()->name,
                'email' => $request->user()->email,
                'roles' => $request->user()->getRoleNames(),
            ] : null,
        ],
        'flash' => [
            'success' => fn () => $request->session()->get('success'),
            'error' => fn () => $request->session()->get('error'),
            'warning' => fn () => $request->session()->get('warning'),
            'info' => fn () => $request->session()->get('info'),
        ],
        'pengaturan' => fn () => cache()->remember('pengaturan', 3600, function () {
            return Pengaturan::pluck('value', 'key');
        }),
    ];
}
```

### Flash Messages dari Controller

```php
// Contoh di controller setelah aksi berhasil:
return redirect()->route('admin.berita.index')
    ->with('success', 'Berita berhasil disimpan.');

// Contoh setelah gagal:
return back()->with('error', 'Terjadi kesalahan saat menyimpan.');
```

Di React, flash messages ditangkap dan ditampilkan sebagai toast notification
menggunakan `react-hot-toast`.

---

## Database

Semua relasi mengikuti konvensi Eloquent Laravel.
Gunakan soft deletes (`SoftDeletes`) untuk data yang mungkin perlu dipulihkan:
berita, pengumuman, lampiran, album, kategori lampiran.

Setiap tabel yang menyimpan konten yang tampil ke publik harus memiliki
kolom `status` untuk membedakan antara draf dan terpublikasi.

---

## Caching Strategy

| Data | Metode | TTL | Invalidasi |
|---|---|---|---|
| Pengaturan website | `cache()->remember()` | 1 jam | Saat admin update pengaturan |
| Data beranda (banner, sambutan, statistik) | `cache()->remember()` | 30 menit | Saat admin update konten beranda |
| Daftar kategori berita | `cache()->remember()` | 1 jam | Saat CRUD kategori |
| Daftar kategori lampiran | `cache()->remember()` | 1 jam | Saat CRUD kategori |
| Halaman detail berita/pengumuman | Tidak di-cache | — | — |
| Data admin panel | Tidak di-cache | — | — |

Cache driver: `file` (default Laravel). Cukup untuk skala website ini.

---

## Environment & Konfigurasi

- Gunakan `.env` untuk semua konfigurasi sensitif
- Jangan pernah hardcode nilai konfigurasi di dalam kode
- File `.env.example` harus selalu diperbarui ketika ada variabel baru

### Variabel .env Khusus Proyek

```env
APP_NAME="BKA UMRI"
APP_URL=https://bka.umri.ac.id

# Akun admin default (hanya dipakai saat seeding)
DEFAULT_ADMIN_EMAIL=admin@bka-umri.ac.id
DEFAULT_ADMIN_PASSWORD=ChangeThisPassword123!

# Mail (untuk reset password)
MAIL_MAILER=smtp
MAIL_HOST=
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM_ADDRESS=noreply@bka-umri.ac.id
MAIL_FROM_NAME="BKA UMRI"
```

---

## Deployment Target

Website ini didesain untuk di-deploy di **VPS** (Virtual Private Server)
atau shared hosting yang mendukung PHP 8.2+ dan MySQL 8.

**Bukan Docker.** Jangan buat Dockerfile atau docker-compose.
**Bukan serverless.** Jangan desain arsitektur untuk cloud functions.

Deployment flow standar:
```
git pull → composer install → npm install → npm run build → php artisan migrate → php artisan optimize
```

---

## Testing Strategy

Testing bersifat **opsional** di fase awal. Jika diimplementasikan:

| Layer | Tool | Scope |
|---|---|---|
| Backend unit test | PHPUnit (bawaan Laravel) | Model, Service, Form Request |
| Backend feature test | PHPUnit | Controller endpoint, auth flow |
| Frontend | Tidak diperlukan di versi awal | — |

Prioritas testing (jika dilakukan):
1. Auth flow (login, logout, reset password, middleware guard)
2. CRUD berita dan pengumuman
3. File upload validation

---

## Catatan Pengembangan

- Tidak menggunakan template UI apapun (AdminLTE, Filament, dll) —
  semua komponen dibangun dari nol dengan Tailwind CSS
- Semua komponen React harus functional component dengan hooks
- Pisahkan logika bisnis dari controller ke class Service atau Action
  agar controller tetap ramping
- Gunakan Laravel Form Request untuk validasi input yang kompleks
- Pastikan semua input yang masuk ke database melalui validasi yang ketat
- Jangan gunakan `DB::raw()` — selalu gunakan Eloquent query builder
- Selalu gunakan parameterized queries untuk mencegah SQL injection
