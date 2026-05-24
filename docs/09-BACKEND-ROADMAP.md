# 09 — Backend Roadmap

Panduan implementasi backend lengkap untuk Website BKA UMRI.
Dokumen ini mencakup **database migrations**, **models & relasi**, **controllers**,
**form requests**, **services**, **policies**, **middleware**, **seeders**,
**routes**, dan **konfigurasi** — disusun per modul dengan detail implementasi.

> **Referensi wajib:** Baca `06-TECH-STACK.md` untuk arsitektur dan naming
> convention, serta `07-SECURITY.md` untuk kebijakan keamanan sebelum
> mengimplementasikan apapun di dokumen ini.

---

## Status Implementasi Saat Ini

Berdasarkan codebase aktif:

| Komponen | Status | Catatan |
|---|---|---|
| **Framework** | ✅ Laravel 13 | `composer.json` — lebih baru dari spec (11.x), sesuaikan |
| **Auth** | ✅ Fortify + Passkeys + 2FA | Sudah ada, bukan Breeze seperti di spec. Gunakan yang sudah ada |
| **Model User** | ✅ Sudah ada | `app/Models/User.php` — perlu diperkaya (is_active, roles) |
| **Migration Users** | ✅ Sudah ada | Perlu migration baru: tambah `is_active` |
| **Middleware Inertia** | ✅ Sudah ada | `HandleInertiaRequests` — perlu diperkaya (flash, pengaturan, roles) |
| **Routes** | ⚠️ Minimal | Hanya `/` dan `dashboard` — perlu semua route publik & admin |
| **Seeder** | ⚠️ Minimal | Hanya test user — perlu RoleSeeder, AdminUserSeeder |
| **spatie/laravel-permission** | ❌ Belum terinstall | Perlu `composer require` |
| **spatie/laravel-medialibrary** | ❌ Belum terinstall | Perlu `composer require` |
| **spatie/laravel-sluggable** | ❌ Belum terinstall | Perlu `composer require` |
| **spatie/laravel-activitylog** | ❌ Belum terinstall | Perlu `composer require` |
| **spatie/laravel-image-optimizer** | ❌ Belum terinstall | Perlu `composer require` |
| **ezyang/htmlpurifier** | ❌ Belum terinstall | Perlu `composer require` |
| **Models (selain User)** | ❌ Belum ada | Semua model domain perlu dibuat |
| **Controllers Admin/Public** | ❌ Belum ada | Semua controller domain perlu dibuat |
| **Form Requests** | ❌ Belum ada | Semua validasi domain perlu dibuat |
| **Policies** | ❌ Belum ada | Semua policy perlu dibuat |
| **Services** | ❌ Belum ada | Perlu dibuat per modul |

---

## Daftar Isi

1. [Dependensi & Instalasi Paket](#1-dependensi--instalasi-paket)
2. [Database Migrations](#2-database-migrations)
3. [Models & Relasi](#3-models--relasi)
4. [Enums](#4-enums)
5. [Seeders & Factories](#5-seeders--factories)
6. [Form Requests (Validasi)](#6-form-requests-validasi)
7. [Services (Logika Bisnis)](#7-services-logika-bisnis)
8. [Policies (Otorisasi)](#8-policies-otorisasi)
9. [Controllers — Publik](#9-controllers--publik)
10. [Controllers — Admin](#10-controllers--admin)
11. [Controllers — Super Admin](#11-controllers--super-admin)
12. [Routes](#12-routes)
13. [Middleware](#13-middleware)
14. [Shared Data (Inertia)](#14-shared-data-inertia)
15. [Caching Strategy](#15-caching-strategy)
16. [File & Media Management](#16-file--media-management)
17. [Helpers & Utilities](#17-helpers--utilities)
18. [Konfigurasi Lingkungan](#18-konfigurasi-lingkungan)
19. [Testing Strategy](#19-testing-strategy)
20. [Prioritas & Urutan Pengerjaan](#20-prioritas--urutan-pengerjaan)

---

## 1. Dependensi & Instalasi Paket

### Paket yang harus diinstall via Composer

```bash
# RBAC — manajemen peran & hak akses
composer require spatie/laravel-permission

# Media Library — upload & pengelolaan file terpusat
composer require spatie/laravel-medialibrary

# Slug — auto-generate slug dari judul
composer require spatie/laravel-sluggable

# Activity Log — audit trail aktivitas admin
composer require spatie/laravel-activitylog

# Image Optimizer — kompresi otomatis gambar
composer require spatie/laravel-image-optimizer

# HTML Purifier — sanitasi rich text (anti-XSS)
composer require ezyang/htmlpurifier
```

### Publish & Migrasi Paket

```bash
# Publish migration & config spatie/permission
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"

# Publish migration & config spatie/medialibrary
php artisan vendor:publish --provider="Spatie\MediaLibrary\MediaLibraryServiceProvider" --tag="medialibrary-migrations"

# Publish migration & config spatie/activitylog
php artisan vendor:publish --provider="Spatie\Activitylog\ActivitylogServiceProvider" --tag="activitylog-migrations"

# Jalankan semua migrasi paket
php artisan migrate
```

### Validasi Setelah Instalasi

- [ ] Tabel `roles`, `permissions`, `model_has_roles` sudah ada
- [ ] Tabel `media` sudah ada
- [ ] Tabel `activity_log` sudah ada
- [ ] Config `permission.php`, `media-library.php`, `activitylog.php` ada di `config/`

---

## 2. Database Migrations

Semua migration menggunakan naming convention: `snake_case`, deskriptif.
Urutan eksekusi penting — migration dengan foreign key harus dijalankan
setelah tabel yang direferensi.

### 2.1 Modifikasi Tabel Users

**File:** `database/migrations/xxxx_xx_xx_add_is_active_to_users_table.php`

```php
Schema::table('users', function (Blueprint $table) {
    $table->boolean('is_active')->default(true)->after('email');
    $table->timestamp('last_login_at')->nullable()->after('is_active');
});
```

**Kolom yang ditambahkan:**

| Kolom | Tipe | Default | Keterangan |
|---|---|---|---|
| `is_active` | boolean | `true` | Status aktif/nonaktif akun admin |
| `last_login_at` | timestamp nullable | `null` | Waktu login terakhir |

---

### 2.2 Tabel `banners`

**File:** `database/migrations/xxxx_xx_xx_create_banners_table.php`

| Kolom | Tipe | Constraint | Keterangan |
|---|---|---|---|
| `id` | bigIncrements | PK | |
| `judul` | string(100) | required | Judul teks slide |
| `deskripsi` | string(200) | nullable | Deskripsi singkat |
| `teks_tombol` | string(30) | nullable | Label tombol CTA |
| `tautan_tombol` | string(500) | nullable | URL tombol CTA |
| `urutan` | unsignedSmallInteger | required, default 1 | Urutan tampil |
| `is_active` | boolean | default true | Status aktif |
| `timestamps` | | | `created_at`, `updated_at` |

**Relasi media:** Gambar latar via `spatie/medialibrary` (collection: `gambar`).

---

### 2.3 Tabel `kepala_biros`

**File:** `database/migrations/xxxx_xx_xx_create_kepala_biros_table.php`

| Kolom | Tipe | Constraint | Keterangan |
|---|---|---|---|
| `id` | bigIncrements | PK | |
| `nama` | string(100) | required | Nama lengkap |
| `jabatan` | string(100) | required | Jabatan |
| `periode` | string(50) | required | Periode jabatan |
| `sambutan` | text | required | Teks sambutan (rich text HTML) |
| `timestamps` | | | |

**Catatan:** Tabel ini bersifat singleton (hanya 1 record aktif). Implementasi
di controller memastikan hanya ada satu record — `firstOrCreate` / `updateOrCreate`.

**Relasi media:** Foto via `spatie/medialibrary` (collection: `foto`).

---

### 2.4 Tabel `halaman_statis`

**File:** `database/migrations/xxxx_xx_xx_create_halaman_statis_table.php`

| Kolom | Tipe | Constraint | Keterangan |
|---|---|---|---|
| `id` | bigIncrements | PK | |
| `slug` | string(100) | required, unique | Identifier: `tentang-kami`, `visi-misi` |
| `judul` | string(200) | required | Judul halaman |
| `konten` | longText | nullable | Konten rich text HTML |
| `timestamps` | | | |

**Seeder awal:** 2 record — `tentang-kami` dan `visi-misi`.

---

### 2.5 Tabel `misis`

**File:** `database/migrations/xxxx_xx_xx_create_misis_table.php`

| Kolom | Tipe | Constraint | Keterangan |
|---|---|---|---|
| `id` | bigIncrements | PK | |
| `isi` | string(200) | required | Satu poin misi |
| `urutan` | unsignedSmallInteger | required | Posisi tampil |
| `timestamps` | | | |

---

### 2.6 Tabel `struktur_anggotas`

**File:** `database/migrations/xxxx_xx_xx_create_struktur_anggotas_table.php`

| Kolom | Tipe | Constraint | Keterangan |
|---|---|---|---|
| `id` | bigIncrements | PK | |
| `nama` | string(100) | required | Nama anggota |
| `jabatan` | string(100) | required | Jabatan |
| `urutan` | unsignedSmallInteger | required | Posisi di grid |
| `timestamps` | | | |

**Relasi media:** Foto via medialibrary (collection: `foto`).

---

### 2.7 Tabel `bidangs`

**File:** `database/migrations/xxxx_xx_xx_create_bidangs_table.php`

| Kolom | Tipe | Constraint | Keterangan |
|---|---|---|---|
| `id` | bigIncrements | PK | |
| `nama` | string(100) | required | Nama bidang |
| `slug` | string(120) | required, unique | Auto-generate dari nama |
| `deskripsi_singkat` | string(200) | required | Tampil di card beranda |
| `deskripsi_lengkap` | text | required | Tampil di halaman detail (rich text) |
| `urutan` | unsignedSmallInteger | required | Urutan tampil |
| `cta_heading` | string(100) | nullable | Heading CTA |
| `cta_sub` | string(100) | nullable | Sub-heading CTA |
| `cta_teks_tombol` | string(30) | nullable | Label tombol CTA |
| `cta_tautan` | string(500) | nullable | URL CTA |
| `timestamps` | | | |
| `soft_deletes` | | | |

**Relasi media:** Banner via medialibrary (collection: `banner`).

---

### 2.8 Tabel `bidang_kepala_bagians`

**File:** `database/migrations/xxxx_xx_xx_create_bidang_kepala_bagians_table.php`

| Kolom | Tipe | Constraint | Keterangan |
|---|---|---|---|
| `id` | bigIncrements | PK | |
| `bidang_id` | foreignId | FK → bidangs.id, cascade delete | |
| `nama` | string(100) | required | |
| `jabatan` | string(100) | required | |
| `deskripsi_tugas` | string(500) | nullable | |
| `media_sosial` | json | nullable | Array: `[{platform, url}]` |
| `timestamps` | | | |

**Relasi media:** Foto via medialibrary (collection: `foto`).

---

### 2.9 Tabel `bidang_anggotas`

**File:** `database/migrations/xxxx_xx_xx_create_bidang_anggotas_table.php`

| Kolom | Tipe | Constraint | Keterangan |
|---|---|---|---|
| `id` | bigIncrements | PK | |
| `bidang_id` | foreignId | FK → bidangs.id, cascade delete | |
| `nama` | string(100) | required | |
| `jabatan` | string(100) | required | |
| `urutan` | unsignedSmallInteger | required | |
| `timestamps` | | | |

**Relasi media:** Foto via medialibrary (collection: `foto`, opsional).

---

### 2.10 Tabel `layanans`

**File:** `database/migrations/xxxx_xx_xx_create_layanans_table.php`

| Kolom | Tipe | Constraint | Keterangan |
|---|---|---|---|
| `id` | bigIncrements | PK | |
| `judul` | string(100) | required | |
| `deskripsi` | string(300) | required | |
| `ikon` | string(50) | nullable | Nama ikon Lucide |
| `urutan` | unsignedSmallInteger | required | |
| `timestamps` | | | |

---

### 2.11 Tabel `layanan_settings` (Singleton)

**File:** Gunakan tabel `pengaturans` (key-value store) dengan key:
- `layanan_judul_section`
- `layanan_deskripsi_section`
- `layanan_youtube_url`

Atau buat tabel dedicated:

| Kolom | Tipe | Constraint | Keterangan |
|---|---|---|---|
| `id` | bigIncrements | PK | |
| `judul_section` | string(100) | required | |
| `deskripsi_section` | string(300) | nullable | |
| `youtube_url` | string(500) | nullable | URL embed YouTube |
| `timestamps` | | | |

---

### 2.12 Tabel `statistiks`

**File:** `database/migrations/xxxx_xx_xx_create_statistiks_table.php`

| Kolom | Tipe | Constraint | Keterangan |
|---|---|---|---|
| `id` | bigIncrements | PK | |
| `angka` | string(10) | required | e.g., "2015", "12+", "500+" |
| `label` | string(50) | required | e.g., "Tahun Berdiri" |
| `ikon` | string(50) | nullable | Nama ikon Lucide |
| `urutan` | unsignedSmallInteger | required | |
| `timestamps` | | | |

---

### 2.13 Tabel `kategori_beritas`

**File:** `database/migrations/xxxx_xx_xx_create_kategori_beritas_table.php`

| Kolom | Tipe | Constraint | Keterangan |
|---|---|---|---|
| `id` | bigIncrements | PK | |
| `nama` | string(50) | required, unique | |
| `slug` | string(60) | required, unique | Auto-generate |
| `timestamps` | | | |

---

### 2.14 Tabel `beritas`

**File:** `database/migrations/xxxx_xx_xx_create_beritas_table.php`

| Kolom | Tipe | Constraint | Keterangan |
|---|---|---|---|
| `id` | bigIncrements | PK | |
| `judul` | string(200) | required | |
| `slug` | string(220) | required, unique | Auto-generate dari judul |
| `isi` | longText | required | Rich text HTML (sanitized) |
| `status` | string(20) | required, default `draf` | Enum: draf, terpublikasi, diarsipkan |
| `tanggal_publikasi` | timestamp | nullable | Jadwal publikasi |
| `kategori_berita_id` | foreignId | nullable, FK → kategori_beritas.id, set null on delete | |
| `user_id` | foreignId | FK → users.id | Penulis/pembuat |
| `timestamps` | | | |
| `soft_deletes` | | | |

**Index:** `status`, `tanggal_publikasi`, `slug`.
**Relasi media:** Thumbnail via medialibrary (collection: `thumbnail`).

---

### 2.15 Tabel `pengumumans`

**File:** `database/migrations/xxxx_xx_xx_create_pengumumans_table.php`

| Kolom | Tipe | Constraint | Keterangan |
|---|---|---|---|
| `id` | bigIncrements | PK | |
| `judul` | string(200) | required | |
| `slug` | string(220) | required, unique | Auto-generate |
| `isi` | longText | required | Rich text HTML |
| `is_penting` | boolean | default false | Flag prioritas |
| `status` | string(20) | required, default `draf` | Enum |
| `tanggal_publikasi` | timestamp | nullable | |
| `user_id` | foreignId | FK → users.id | |
| `timestamps` | | | |
| `soft_deletes` | | | |

**Index:** `status`, `is_penting`, `tanggal_publikasi`, `slug`.
**Relasi media:** Thumbnail via medialibrary (collection: `thumbnail`, opsional).
Lampiran per pengumuman via medialibrary (collection: `lampiran`, max 3 file).

---

### 2.16 Tabel `albums`

**File:** `database/migrations/xxxx_xx_xx_create_albums_table.php`

| Kolom | Tipe | Constraint | Keterangan |
|---|---|---|---|
| `id` | bigIncrements | PK | |
| `judul` | string(150) | required | |
| `slug` | string(170) | required, unique | Auto-generate |
| `deskripsi` | string(500) | nullable | |
| `tanggal_kegiatan` | date | required | |
| `timestamps` | | | |
| `soft_deletes` | | | |

**Relasi media:** Cover via medialibrary (collection: `cover`).

---

### 2.17 Tabel `fotos`

**File:** `database/migrations/xxxx_xx_xx_create_fotos_table.php`

| Kolom | Tipe | Constraint | Keterangan |
|---|---|---|---|
| `id` | bigIncrements | PK | |
| `album_id` | foreignId | FK → albums.id, cascade delete | |
| `urutan` | unsignedSmallInteger | required | |
| `timestamps` | | | |

**Relasi media:** Foto via medialibrary (collection: `foto`).

---

### 2.18 Tabel `kategori_lampirans`

**File:** `database/migrations/xxxx_xx_xx_create_kategori_lampirans_table.php`

| Kolom | Tipe | Constraint | Keterangan |
|---|---|---|---|
| `id` | bigIncrements | PK | |
| `nama` | string(100) | required, unique | |
| `slug` | string(120) | required, unique | Auto-generate |
| `deskripsi` | string(300) | nullable | |
| `urutan` | unsignedSmallInteger | required | |
| `timestamps` | | | |
| `soft_deletes` | | | |

---

### 2.19 Tabel `lampirans`

**File:** `database/migrations/xxxx_xx_xx_create_lampirans_table.php`

| Kolom | Tipe | Constraint | Keterangan |
|---|---|---|---|
| `id` | bigIncrements | PK | |
| `nama_tampilan` | string(150) | required | Nama saat diunduh |
| `deskripsi` | string(300) | nullable | |
| `kategori_lampiran_id` | foreignId | FK → kategori_lampirans.id, cascade delete | |
| `timestamps` | | | |
| `soft_deletes` | | | |

**Relasi media:** Berkas via medialibrary (collection: `berkas`).

---

### 2.20 Tabel `pengaturans`

**File:** `database/migrations/xxxx_xx_xx_create_pengaturans_table.php`

| Kolom | Tipe | Constraint | Keterangan |
|---|---|---|---|
| `id` | bigIncrements | PK | |
| `key` | string(100) | required, unique | Identifier pengaturan |
| `value` | text | nullable | Nilai pengaturan |
| `timestamps` | | | |

**Key yang harus di-seed:**

| Key | Default Value | Keterangan |
|---|---|---|
| `nama_website` | "BKA UMRI" | |
| `deskripsi_seo` | "Website Resmi Biro Keuangan & Aset UMRI" | Max 160 karakter |
| `alamat` | "" | Alamat fisik |
| `telepon` | "" | |
| `email` | "" | |
| `jam_operasional` | "" | |
| `google_maps_embed` | "" | Kode iframe |
| `media_sosial` | "[]" | JSON array |
| `layanan_judul_section` | "" | |
| `layanan_deskripsi_section` | "" | |
| `layanan_youtube_url` | "" | |

**Relasi media:** Logo dan favicon via medialibrary (collection: `logo`, `favicon`)
— atau simpan sebagai file biasa di `storage/`.

---

### 2.21 Tabel `pesan_kontaks`

**File:** `database/migrations/xxxx_xx_xx_create_pesan_kontaks_table.php`

| Kolom | Tipe | Constraint | Keterangan |
|---|---|---|---|
| `id` | bigIncrements | PK | |
| `nama` | string(100) | required | |
| `email` | string(255) | required | |
| `subjek` | string(150) | required | |
| `pesan` | text | required | |
| `is_read` | boolean | default false | Status baca |
| `timestamps` | | | |

**Index:** `is_read`, `created_at`.

---

### Diagram Ringkasan Relasi

```
users ─────────────────┬── beritas (user_id FK)
  └── model_has_roles   └── pengumumans (user_id FK)

kategori_beritas ──────── beritas (kategori_berita_id FK, nullable)

albums ────────────────── fotos (album_id FK, cascade)

kategori_lampirans ────── lampirans (kategori_lampiran_id FK, cascade)

bidangs ───────────────┬── bidang_kepala_bagians (bidang_id FK, cascade)
                       └── bidang_anggotas (bidang_id FK, cascade)

--- Standalone (tanpa FK) ---
banners, kepala_biros, halaman_statis, misis,
struktur_anggotas, layanans, statistiks,
pengaturans, pesan_kontaks
```

---

## 3. Models & Relasi

### 3.1 Modifikasi Model `User`

**File:** `app/Models/User.php`

**Perubahan yang diperlukan:**

```php
use Spatie\Permission\Traits\HasRoles;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

#[Fillable(['name', 'email', 'password', 'is_active', 'last_login_at'])]
class User extends Authenticatable implements PasskeyUser
{
    use HasFactory, Notifiable, HasRoles, LogsActivity;
    // ... traits lain yang sudah ada

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'last_login_at' => 'datetime',
        ];
    }

    // Relasi
    public function beritas(): HasMany { ... }
    public function pengumumans(): HasMany { ... }

    // Scope
    public function scopeActive($query) { return $query->where('is_active', true); }
    public function scopeAdmin($query) { return $query->role(['admin', 'super_admin']); }

    // Activity Log
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'email', 'is_active'])
            ->logOnlyDirty();
    }
}
```

---

### 3.2 Model Baru — Ringkasan

Semua model dibuat di `app/Models/`. Setiap model harus memiliki:
- `$fillable` (whitelist mass-assignment)
- Relasi Eloquent
- Scope query yang relevan
- Cast yang sesuai
- Trait `HasSlug` (dari spatie/sluggable) jika memiliki kolom slug
- Trait `InteractsWithMedia` (dari spatie/medialibrary) jika memiliki file
- Trait `SoftDeletes` jika diperlukan
- Trait `LogsActivity` untuk model yang dikelola admin

| Model | File | Traits Wajib | Relasi Utama |
|---|---|---|---|
| `Banner` | `Banner.php` | InteractsWithMedia, LogsActivity | — |
| `KepalaBiro` | `KepalaBiro.php` | InteractsWithMedia, LogsActivity | — |
| `HalamanStatis` | `HalamanStatis.php` | LogsActivity | — |
| `Misi` | `Misi.php` | LogsActivity | — |
| `StrukturAnggota` | `StrukturAnggota.php` | InteractsWithMedia, LogsActivity | — |
| `Bidang` | `Bidang.php` | HasSlug, InteractsWithMedia, SoftDeletes, LogsActivity | hasOne KepalaBagian, hasMany BidangAnggota |
| `BidangKepalaBagian` | `BidangKepalaBagian.php` | InteractsWithMedia | belongsTo Bidang |
| `BidangAnggota` | `BidangAnggota.php` | InteractsWithMedia | belongsTo Bidang |
| `Layanan` | `Layanan.php` | LogsActivity | — |
| `Statistik` | `Statistik.php` | — | — |
| `KategoriBerita` | `KategoriBerita.php` | HasSlug | hasMany Berita |
| `Berita` | `Berita.php` | HasSlug, InteractsWithMedia, SoftDeletes, LogsActivity | belongsTo KategoriBerita, belongsTo User |
| `Pengumuman` | `Pengumuman.php` | HasSlug, InteractsWithMedia, SoftDeletes, LogsActivity | belongsTo User |
| `Album` | `Album.php` | HasSlug, InteractsWithMedia, SoftDeletes, LogsActivity | hasMany Foto |
| `Foto` | `Foto.php` | InteractsWithMedia | belongsTo Album |
| `KategoriLampiran` | `KategoriLampiran.php` | HasSlug, SoftDeletes | hasMany Lampiran |
| `Lampiran` | `Lampiran.php` | InteractsWithMedia, SoftDeletes, LogsActivity | belongsTo KategoriLampiran |
| `Pengaturan` | `Pengaturan.php` | LogsActivity | — |
| `PesanKontak` | `PesanKontak.php` | — | — |

---

### 3.3 Detail Model — Contoh Implementasi Kunci

#### Model `Berita`

```php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\Sluggable\HasSlug;
use Spatie\Sluggable\SlugOptions;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
use App\Enums\ContentStatus;

class Berita extends Model implements HasMedia
{
    use SoftDeletes, InteractsWithMedia, HasSlug, LogsActivity;

    protected $fillable = [
        'judul', 'slug', 'isi', 'status',
        'tanggal_publikasi', 'kategori_berita_id', 'user_id',
    ];

    protected function casts(): array
    {
        return [
            'status' => ContentStatus::class,
            'tanggal_publikasi' => 'datetime',
        ];
    }

    // === Slug ===
    public function getSlugOptions(): SlugOptions
    {
        return SlugOptions::create()
            ->generateSlugsFrom('judul')
            ->saveSlugsTo('slug')
            ->doNotGenerateSlugsOnUpdate(); // slug bisa diedit manual
    }

    // === Media Collections ===
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('thumbnail')
            ->singleFile()
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp']);
    }

    public function registerMediaConversions(Media $media = null): void
    {
        $this->addMediaConversion('thumb')
            ->width(400)
            ->height(225)
            ->sharpen(10)
            ->performOnCollections('thumbnail');
    }

    // === Relasi ===
    public function kategori(): BelongsTo
    {
        return $this->belongsTo(KategoriBerita::class, 'kategori_berita_id');
    }

    public function penulis(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // === Scopes ===
    public function scopeTerpublikasi($query)
    {
        return $query->where('status', ContentStatus::TERPUBLIKASI)
            ->where(function ($q) {
                $q->whereNull('tanggal_publikasi')
                  ->orWhere('tanggal_publikasi', '<=', now());
            });
    }

    public function scopeTerbaru($query)
    {
        return $query->orderByDesc('tanggal_publikasi')
                     ->orderByDesc('created_at');
    }

    // === Activity Log ===
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['judul', 'status', 'kategori_berita_id'])
            ->logOnlyDirty()
            ->setDescriptionForEvent(fn (string $eventName) =>
                "Berita \"{$this->judul}\" telah di-{$eventName}"
            );
    }
}
```

#### Model `Pengaturan` (Key-Value Store)

```php
class Pengaturan extends Model
{
    protected $fillable = ['key', 'value'];

    // Helper statis untuk get/set
    public static function getValue(string $key, $default = null): ?string
    {
        return static::where('key', $key)->value('value') ?? $default;
    }

    public static function setValue(string $key, $value): void
    {
        static::updateOrCreate(['key' => $key], ['value' => $value]);
        cache()->forget('pengaturan'); // invalidasi cache
    }

    public static function getAllCached(): array
    {
        return cache()->remember('pengaturan', 3600, function () {
            return static::pluck('value', 'key')->toArray();
        });
    }
}
```

---

## 4. Enums

### `ContentStatus`

**File:** `app/Enums/ContentStatus.php`

```php
namespace App\Enums;

enum ContentStatus: string
{
    case DRAF = 'draf';
    case TERPUBLIKASI = 'terpublikasi';
    case DIARSIPKAN = 'diarsipkan';

    public function label(): string
    {
        return match ($this) {
            self::DRAF => 'Draf',
            self::TERPUBLIKASI => 'Terpublikasi',
            self::DIARSIPKAN => 'Diarsipkan',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::DRAF => 'neutral',
            self::TERPUBLIKASI => 'success',
            self::DIARSIPKAN => 'warning',
        };
    }
}
```

---

## 5. Seeders & Factories

### 5.1 `RoleSeeder`

**File:** `database/seeders/RoleSeeder.php`

```php
public function run(): void
{
    Role::create(['name' => 'super_admin']);
    Role::create(['name' => 'admin']);
}
```

### 5.2 `AdminUserSeeder`

**File:** `database/seeders/AdminUserSeeder.php`

```php
public function run(): void
{
    $user = User::create([
        'name' => 'Super Admin',
        'email' => env('DEFAULT_ADMIN_EMAIL', 'admin@bka-umri.ac.id'),
        'password' => Hash::make(env('DEFAULT_ADMIN_PASSWORD', 'ChangeThisPassword123!')),
        'email_verified_at' => now(),
        'is_active' => true,
    ]);

    $user->assignRole('super_admin');
}
```

### 5.3 `PengaturanSeeder`

**File:** `database/seeders/PengaturanSeeder.php`

Seed semua key dari tabel `pengaturans` dengan nilai default kosong atau
nilai placeholder.

### 5.4 `HalamanStatisSeeder`

**File:** `database/seeders/HalamanStatisSeeder.php`

```php
public function run(): void
{
    HalamanStatis::create(['slug' => 'tentang-kami', 'judul' => 'Tentang Kami', 'konten' => null]);
    HalamanStatis::create(['slug' => 'visi-misi', 'judul' => 'Visi & Misi', 'konten' => null]);
}
```

### 5.5 `DatabaseSeeder` (Update)

```php
public function run(): void
{
    $this->call([
        RoleSeeder::class,
        AdminUserSeeder::class,
        PengaturanSeeder::class,
        HalamanStatisSeeder::class,
    ]);
}
```

### 5.6 Factories (Opsional — untuk development/testing)

| Factory | Model | Data yang Di-generate |
|---|---|---|
| `BeritaFactory` | Berita | Judul faker, isi paragraf, status random, tanggal random |
| `PengumumanFactory` | Pengumuman | Judul faker, isi, is_penting random |
| `AlbumFactory` | Album | Judul faker, tanggal random |
| `KategoriBeritaFactory` | KategoriBerita | Nama unique |

---

## 6. Form Requests (Validasi)

Setiap form submission harus memiliki Form Request class di `app/Http/Requests/Admin/`.
Validasi server-side adalah **mandatory** — validasi client-side hanya UX.

### 6.1 Daftar Form Requests

| Form Request | Aksi | Lokasi |
|---|---|---|
| `StoreBannerRequest` | Tambah slide banner | `Requests/Admin/StoreBannerRequest.php` |
| `UpdateBannerRequest` | Edit slide banner | `Requests/Admin/UpdateBannerRequest.php` |
| `UpdateKepalaBiroRequest` | Edit data kepala biro | `Requests/Admin/UpdateKepalaBiroRequest.php` |
| `UpdateTentangKamiRequest` | Edit halaman tentang kami | `Requests/Admin/UpdateTentangKamiRequest.php` |
| `UpdateVisiMisiRequest` | Edit visi & misi | `Requests/Admin/UpdateVisiMisiRequest.php` |
| `StoreStrukturAnggotaRequest` | Tambah anggota struktur | `Requests/Admin/StoreStrukturAnggotaRequest.php` |
| `UpdateStrukturAnggotaRequest` | Edit anggota struktur | `Requests/Admin/UpdateStrukturAnggotaRequest.php` |
| `StoreBidangRequest` | Tambah bidang | `Requests/Admin/StoreBidangRequest.php` |
| `UpdateBidangRequest` | Edit bidang | `Requests/Admin/UpdateBidangRequest.php` |
| `StoreBeritaRequest` | Tambah berita | `Requests/Admin/StoreBeritaRequest.php` |
| `UpdateBeritaRequest` | Edit berita | `Requests/Admin/UpdateBeritaRequest.php` |
| `StoreKategoriBeritaRequest` | Tambah kategori berita | `Requests/Admin/StoreKategoriBeritaRequest.php` |
| `StorePengumumanRequest` | Tambah pengumuman | `Requests/Admin/StorePengumumanRequest.php` |
| `UpdatePengumumanRequest` | Edit pengumuman | `Requests/Admin/UpdatePengumumanRequest.php` |
| `StoreAlbumRequest` | Tambah album | `Requests/Admin/StoreAlbumRequest.php` |
| `UpdateAlbumRequest` | Edit album | `Requests/Admin/UpdateAlbumRequest.php` |
| `StoreFotoRequest` | Upload foto ke album | `Requests/Admin/StoreFotoRequest.php` |
| `StoreKategoriLampiranRequest` | Tambah kategori lampiran | `Requests/Admin/StoreKategoriLampiranRequest.php` |
| `UpdateKategoriLampiranRequest` | Edit kategori lampiran | `Requests/Admin/UpdateKategoriLampiranRequest.php` |
| `StoreLampiranRequest` | Upload berkas lampiran | `Requests/Admin/StoreLampiranRequest.php` |
| `UpdateLampiranRequest` | Edit berkas lampiran | `Requests/Admin/UpdateLampiranRequest.php` |
| `UpdatePengaturanRequest` | Edit pengaturan website | `Requests/Admin/UpdatePengaturanRequest.php` |
| `KirimPesanRequest` | Kirim pesan kontak (publik) | `Requests/Public/KirimPesanRequest.php` |
| `StoreAdminRequest` | Buat akun admin (Super Admin) | `Requests/Admin/StoreAdminRequest.php` |
| `UpdateAdminRequest` | Edit akun admin (Super Admin) | `Requests/Admin/UpdateAdminRequest.php` |
| `StoreLayananRequest` | Tambah/edit item layanan | `Requests/Admin/StoreLayananRequest.php` |
| `UpdateStatistikRequest` | Edit statistik beranda | `Requests/Admin/UpdateStatistikRequest.php` |

### 6.2 Contoh Implementasi Kunci

#### `StoreBeritaRequest`

```php
namespace App\Http\Requests\Admin;

use App\Enums\ContentStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBeritaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Berita::class);
    }

    public function rules(): array
    {
        return [
            'judul' => ['required', 'string', 'min:10', 'max:200'],
            'slug' => ['required', 'string', 'max:220', 'unique:beritas,slug', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/'],
            'isi' => ['required', 'string', 'min:50'],
            'kategori_berita_id' => ['nullable', 'exists:kategori_beritas,id'],
            'thumbnail' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'status' => ['required', Rule::enum(ContentStatus::class)],
            'tanggal_publikasi' => ['nullable', 'date', 'after_or_equal:today'],
        ];
    }

    public function messages(): array
    {
        return [
            'judul.min' => 'Judul berita minimal 10 karakter.',
            'slug.regex' => 'Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung.',
            'slug.unique' => 'Slug ini sudah digunakan oleh berita lain.',
            'isi.min' => 'Isi berita minimal 50 karakter.',
            'thumbnail.max' => 'Ukuran gambar maksimal 2 MB.',
        ];
    }
}
```

#### `KirimPesanRequest` (Publik)

```php
namespace App\Http\Requests\Public;

use Illuminate\Foundation\Http\FormRequest;

class KirimPesanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // publik, tanpa auth
    }

    public function rules(): array
    {
        return [
            'nama' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email:rfc,dns', 'max:255'],
            'subjek' => ['required', 'string', 'max:150'],
            'pesan' => ['required', 'string', 'min:20', 'max:2000'],
        ];
    }
}
```

#### `StoreAdminRequest` (Super Admin Only)

```php
namespace App\Http\Requests\Admin;

use Illuminate\Validation\Rules\Password;

class StoreAdminRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('super_admin');
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email:rfc,dns', 'unique:users,email'],
            'password' => [
                'required', 'string', 'confirmed',
                Password::min(8)->mixedCase()->numbers()->uncompromised(),
            ],
        ];
    }
}
```

---

## 7. Services (Logika Bisnis)

Setiap modul yang memiliki logika bisnis kompleks harus dipindahkan dari
controller ke Service class di `app/Services/`.

| Service | File | Tanggung Jawab |
|---|---|---|
| `BeritaService` | `Services/BeritaService.php` | Buat, update, hapus berita. Sanitasi rich text. Attach thumbnail via medialibrary. Handle scheduled publish. Ambil berita terkait |
| `PengumumanService` | `Services/PengumumanService.php` | CRUD pengumuman. Attach lampiran multi-file. Prioritas sorting (penting dulu) |
| `BerandaService` | `Services/BerandaService.php` | Ambil semua data beranda (banners, kepala biro, statistik, berita terbaru, pengumuman terbaru, bidang, layanan). Return cached |
| `MediaService` | `Services/MediaService.php` | Wrapper untuk upload, hapus, reorder media via spatie/medialibrary. Validasi tipe dan ukuran |
| `DokumentasiService` | `Services/DokumentasiService.php` | CRUD album, bulk upload foto, reorder foto, hapus foto |
| `LampiranService` | `Services/LampiranService.php` | CRUD kategori & berkas. Handle download (serve file via controller, bukan direct URL) |
| `PengaturanService` | `Services/PengaturanService.php` | Get/set pengaturan. Cache invalidation. Batch update |
| `AdminUserService` | `Services/AdminUserService.php` | Buat admin, update admin, toggle status, validasi batas (max 10 admin, min 1 super admin aktif), invalidasi sesi |
| `RichTextSanitizer` | `Services/RichTextSanitizer.php` | Sanitasi HTML dari rich text editor menggunakan HTMLPurifier. Whitelist tag yang diizinkan |
| `BidangService` | `Services/BidangService.php` | CRUD bidang, kelola kepala bagian, kelola anggota per bidang, reorder |

### 7.1 Contoh: `RichTextSanitizer`

```php
namespace App\Services;

use HTMLPurifier;
use HTMLPurifier_Config;

class RichTextSanitizer
{
    public static function sanitize(string $html): string
    {
        $config = HTMLPurifier_Config::createDefault();
        $config->set('HTML.Allowed',
            'p,br,strong,em,u,s,h2,h3,ul,ol,li,blockquote,a[href|target],img[src|alt],hr'
        );
        $config->set('HTML.TargetBlank', true);
        $config->set('URI.AllowedSchemes', ['http' => true, 'https' => true]);
        $config->set('Attr.AllowedFrameTargets', ['_blank']);
        $config->set('AutoFormat.RemoveEmpty', true);

        $purifier = new HTMLPurifier($config);
        return $purifier->purify($html);
    }
}
```

### 7.2 Contoh: `BerandaService`

```php
namespace App\Services;

class BerandaService
{
    public function getBerandaData(): array
    {
        return cache()->remember('beranda_data', 1800, function () {
            return [
                'banners' => Banner::where('is_active', true)
                    ->orderBy('urutan')
                    ->with('media')
                    ->get(),

                'kepalaBiro' => KepalaBiro::with('media')->first(),

                'bidangs' => Bidang::orderBy('urutan')
                    ->select('id', 'nama', 'slug', 'deskripsi_singkat', 'urutan')
                    ->get(),

                'layanans' => Layanan::orderBy('urutan')->get(),

                'layananSettings' => [
                    'judul' => Pengaturan::getValue('layanan_judul_section'),
                    'deskripsi' => Pengaturan::getValue('layanan_deskripsi_section'),
                    'youtube_url' => Pengaturan::getValue('layanan_youtube_url'),
                ],

                'beritaTerbaru' => Berita::terpublikasi()
                    ->terbaru()
                    ->with(['media', 'kategori'])
                    ->limit(3)
                    ->get(),

                'pengumumanTerbaru' => Pengumuman::terpublikasi()
                    ->orderByDesc('is_penting')
                    ->orderByDesc('tanggal_publikasi')
                    ->limit(3)
                    ->get(),

                'statistik' => Statistik::orderBy('urutan')->get(),
            ];
        });
    }

    public function invalidateCache(): void
    {
        cache()->forget('beranda_data');
    }
}
```

---

## 8. Policies (Otorisasi)

Setiap model utama harus memiliki Policy class di `app/Policies/`.

| Policy | Model | Aksi yang Dikontrol |
|---|---|---|
| `BeritaPolicy` | Berita | `viewAny`, `create`, `update`, `delete` |
| `PengumumanPolicy` | Pengumuman | `viewAny`, `create`, `update`, `delete` |
| `AlbumPolicy` | Album | `viewAny`, `create`, `update`, `delete` |
| `LampiranPolicy` | Lampiran | `viewAny`, `create`, `update`, `delete` |
| `KategoriLampiranPolicy` | KategoriLampiran | `viewAny`, `create`, `update`, `delete` |
| `UserPolicy` | User | `viewAny`, `create`, `update`, `toggleStatus` |
| `BidangPolicy` | Bidang | `viewAny`, `create`, `update`, `delete` |

### Aturan Otorisasi Umum

- **Admin & Super Admin** dapat `viewAny`, `create`, `update`, `delete` pada konten (berita, pengumuman, album, lampiran, bidang)
- **Hanya Super Admin** yang dapat `viewAny`, `create`, `update`, `toggleStatus` pada User
- **Tidak ada** yang bisa mengubah role sendiri
- **Super Admin terakhir** tidak bisa dinonaktifkan

### Contoh: `UserPolicy`

```php
namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    // Hanya super_admin yang bisa melihat daftar admin
    public function viewAny(User $user): bool
    {
        return $user->hasRole('super_admin');
    }

    // Hanya super_admin yang bisa membuat admin baru
    public function create(User $user): bool
    {
        if (!$user->hasRole('super_admin')) return false;

        // Cek batas 10 admin aktif
        $adminCount = User::role('admin')->where('is_active', true)->count();
        return $adminCount < 10;
    }

    // Hanya super_admin, dan tidak bisa edit Super Admin lain
    public function update(User $user, User $target): bool
    {
        return $user->hasRole('super_admin')
            && !$target->hasRole('super_admin');
    }

    // Toggle status: tidak bisa toggle diri sendiri
    public function toggleStatus(User $user, User $target): bool
    {
        if (!$user->hasRole('super_admin')) return false;
        if ($user->id === $target->id) return false;

        // Jika target super_admin, cek minimal 1 harus aktif
        if ($target->hasRole('super_admin') && $target->is_active) {
            $activeCount = User::role('super_admin')
                ->where('is_active', true)->count();
            return $activeCount > 1;
        }

        return true;
    }
}
```

### Register Policies

Di `AppServiceProvider` atau `AuthServiceProvider`:

```php
Gate::policy(Berita::class, BeritaPolicy::class);
Gate::policy(Pengumuman::class, PengumumanPolicy::class);
Gate::policy(Album::class, AlbumPolicy::class);
Gate::policy(Lampiran::class, LampiranPolicy::class);
Gate::policy(User::class, UserPolicy::class);
Gate::policy(Bidang::class, BidangPolicy::class);
```

---

## 9. Controllers — Publik

Semua controller publik di `app/Http/Controllers/Public/`.
Tidak ada middleware auth. Response via `Inertia::render()`.

### 9.1 `HomeController`

**File:** `app/Http/Controllers/Public/HomeController.php`

| Method | Route | Fitur |
|---|---|---|
| `index()` | GET `/` | Ambil semua data beranda via `BerandaService`. Return Inertia render `public/home` |

**Data yang dikirim ke React:**
```php
return Inertia::render('public/home', [
    'banners' => ...,
    'kepalaBiro' => ...,
    'bidangs' => ...,
    'layanans' => ...,
    'layananSettings' => ...,
    'beritaTerbaru' => ...,
    'pengumumanTerbaru' => ...,
    'statistik' => ...,
]);
```

### 9.2 `ProfilController`

**File:** `app/Http/Controllers/Public/ProfilController.php`

| Method | Route | Fitur |
|---|---|---|
| `tentang()` | GET `/profil/tentang-kami` | Ambil HalamanStatis by slug `tentang-kami`. Breadcrumb |
| `visiMisi()` | GET `/profil/visi-misi` | Ambil HalamanStatis `visi-misi` + Misi items ordered |
| `struktur()` | GET `/profil/struktur-organisasi` | Ambil gambar bagan (dari pengaturan/media), daftar StrukturAnggota, KepalaBiro |

### 9.3 `BeritaController`

**File:** `app/Http/Controllers/Public/BeritaController.php`

| Method | Route | Fitur |
|---|---|---|
| `index()` | GET `/berita` | Paginate berita (9/page). Filter: `?search=`, `?kategori=`. Scope: `terpublikasi()`, `terbaru()`. Kirim: paginated data + kategoriList + filters |
| `show($slug)` | GET `/berita/{slug}` | Find by slug. Scope: `terpublikasi()`. 404 jika tidak ditemukan / soft deleted. Berita terkait (3, kategori sama, fallback terbaru). Breadcrumb |

### 9.4 `PengumumanController`

**File:** `app/Http/Controllers/Public/PengumumanController.php`

| Method | Route | Fitur |
|---|---|---|
| `index()` | GET `/pengumuman` | Paginate (9/page). Filter: `?search=`. Sort: `is_penting DESC, tanggal_publikasi DESC`. Scope: `terpublikasi()` |
| `show($slug)` | GET `/pengumuman/{slug}` | Find by slug. Scope: `terpublikasi()`. Include lampiran (media collection). Pengumuman terkait (3) |

### 9.5 `DokumentasiController`

**File:** `app/Http/Controllers/Public/DokumentasiController.php`

| Method | Route | Fitur |
|---|---|---|
| `index()` | GET `/dokumentasi` | Paginate album (12/page). Sort: `tanggal_kegiatan DESC`. Include: cover media, fotos count |
| `show($slug)` | GET `/dokumentasi/{album-slug}` | Find album by slug. Load fotos (ordered by urutan) with media. Breadcrumb |

### 9.6 `LampiranController`

**File:** `app/Http/Controllers/Public/LampiranController.php`

| Method | Route | Fitur |
|---|---|---|
| `index()` | GET `/lampiran` | Daftar kategori lampiran. Include: jumlah berkas per kategori. Sort: `urutan ASC` |
| `kategori($slug)` | GET `/lampiran/{kategori-slug}` | Find kategori by slug. Daftar berkas dalam kategori. Filter: `?search=`. Sort: `created_at DESC`. Include: media (untuk info ukuran, tipe) |
| `download($id)` | GET `/lampiran/download/{id}` | Serve file via controller (bukan direct URL). Set nama file download = `nama_tampilan`. Rate limit: 30/menit per IP |

### 9.7 `BidangController`

**File:** `app/Http/Controllers/Public/BidangController.php`

| Method | Route | Fitur |
|---|---|---|
| `show($slug)` | GET `/bidang/{slug}` | Find bidang by slug. Load: kepala bagian (with media), anggota (ordered, with media), CTA data. Breadcrumb |

### 9.8 `KontakController`

**File:** `app/Http/Controllers/Public/KontakController.php`

| Method | Route | Fitur |
|---|---|---|
| `index()` | GET `/kontak` | Ambil data kontak dari pengaturan (alamat, telepon, email, jam, maps, medsos) |
| `kirim(KirimPesanRequest)` | POST `/kontak` | Validasi. Simpan ke `pesan_kontaks`. Rate limit: 3/10 menit per IP. Flash success. No redirect (Inertia back) |

---

## 10. Controllers — Admin

Semua controller admin di `app/Http/Controllers/Admin/`.
Middleware: `auth`, `verified`. Route prefix: `/admin`.

### 10.1 `DashboardController`

**File:** `app/Http/Controllers/Admin/DashboardController.php`

| Method | Route | Fitur |
|---|---|---|
| `index()` | GET `/admin` | Stats: count berita terpublikasi, pengumuman aktif, pesan belum dibaca, album. Aktivitas terbaru (10 log, **hanya untuk Super Admin**). Quick actions links |

**Data:**
```php
return Inertia::render('admin/dashboard', [
    'stats' => [
        'beritaCount' => Berita::terpublikasi()->count(),
        'pengumumanCount' => Pengumuman::terpublikasi()->count(),
        'pesanBelumDibaca' => PesanKontak::where('is_read', false)->count(),
        'albumCount' => Album::count(),
    ],
    'aktivitasTerbaru' => $user->hasRole('super_admin')
        ? Activity::latest()->limit(10)->get()
        : null,
]);
```

### 10.2 `BerandaController`

**File:** `app/Http/Controllers/Admin/BerandaController.php`

| Method | Route | Fitur |
|---|---|---|
| `edit()` | GET `/admin/beranda` | Ambil semua data beranda (banners, kepala biro, statistik, layanan) |
| `update(Request)` | PUT `/admin/beranda` | Update konten beranda (batch). Invalidasi cache beranda |

**Sub-routes (atau method terpisah) untuk komponen individual:**

| Method | Aksi |
|---|---|
| `storeBanner(StoreBannerRequest)` | Tambah slide. Validasi max 5 |
| `updateBanner(UpdateBannerRequest, $id)` | Edit slide |
| `destroyBanner($id)` | Hapus slide |
| `reorderBanners(Request)` | Update urutan via drag & drop |
| `updateKepalaBiro(UpdateKepalaBiroRequest)` | Update data kepala biro (singleton) |
| `updateStatistik(UpdateStatistikRequest)` | Update batch statistik (max 4 items) |
| `updateLayanan(Request)` | Update section settings + item layanan |

### 10.3 `ProfilController`

**File:** `app/Http/Controllers/Admin/ProfilController.php`

| Method | Route | Fitur |
|---|---|---|
| `editTentang()` | GET `/admin/profil/tentang` | Load konten HalamanStatis `tentang-kami` |
| `updateTentang(Request)` | PUT `/admin/profil/tentang` | Sanitasi rich text via `RichTextSanitizer`. Update. Flash success |
| `editVisiMisi()` | GET `/admin/profil/visi-misi` | Load visi (dari HalamanStatis) + misi items |
| `updateVisiMisi(Request)` | PUT `/admin/profil/visi-misi` | Update visi text + sync misi items (create/update/delete) |
| `editKepalaBiro()` | GET `/admin/profil/kepala-biro` | Load KepalaBiro with media |
| `updateKepalaBiro(Request)` | PUT `/admin/profil/kepala-biro` | Update or create. Handle foto upload. Sanitasi sambutan |
| `editStruktur()` | GET `/admin/profil/struktur` | Load gambar bagan + daftar anggota |
| `updateStruktur(Request)` | PUT `/admin/profil/struktur` | Update bagan image. CRUD anggota (sync) |

### 10.4 `BeritaController`

**File:** `app/Http/Controllers/Admin/BeritaController.php`

| Method | Route | HTTP | Fitur |
|---|---|---|---|
| `index()` | `/admin/berita` | GET | Paginate (10/page). Filter: search, status, kategori. Include: media, kategori |
| `create()` | `/admin/berita/create` | GET | Form data: kategori list |
| `store(StoreBeritaRequest)` | `/admin/berita` | POST | Validasi. Sanitasi `isi`. Set `user_id`. Upload thumbnail. Flash & redirect |
| `edit($id)` | `/admin/berita/{id}/edit` | GET | Load berita with media. Kategori list |
| `update(UpdateBeritaRequest, $id)` | `/admin/berita/{id}` | PUT | Validasi. Sanitasi. Replace thumbnail if new. Flash & redirect |
| `destroy($id)` | `/admin/berita/{id}` | DELETE | Soft delete. Log activity. Flash & redirect |

**Kategori Berita (inline atau method terpisah):**

| Method | Aksi |
|---|---|
| `storeKategori(StoreKategoriBeritaRequest)` | Tambah kategori |
| `destroyKategori($id)` | Hapus kategori. Set `kategori_berita_id = null` pada berita terkait |

### 10.5 `PengumumanController`

**File:** `app/Http/Controllers/Admin/PengumumanController.php`

Sama dengan BeritaController, dengan perbedaan:
- Thumbnail **opsional**
- Ada field `is_penting` (boolean)
- Ada multi-file lampiran (max 3, PDF/DOCX/XLSX, 10MB each)
- Tidak ada kategori

| Method | Route | HTTP | Fitur |
|---|---|---|---|
| `index()` | `/admin/pengumuman` | GET | Paginate. Filter: search, status, penting |
| `create()` | `/admin/pengumuman/create` | GET | Form kosong |
| `store(StorePengumumanRequest)` | `/admin/pengumuman` | POST | Validasi. Sanitasi. Upload thumbnail + lampiran |
| `edit($id)` | `/admin/pengumuman/{id}/edit` | GET | Load with media |
| `update(UpdatePengumumanRequest, $id)` | `/admin/pengumuman/{id}` | PUT | Update. Handle file changes |
| `destroy($id)` | `/admin/pengumuman/{id}` | DELETE | Soft delete |

### 10.6 `DokumentasiController`

**File:** `app/Http/Controllers/Admin/DokumentasiController.php`

| Method | Route | HTTP | Fitur |
|---|---|---|---|
| `index()` | `/admin/dokumentasi` | GET | Daftar album. Include: cover, fotos count |
| `create()` | `/admin/dokumentasi/create` | GET | Form kosong |
| `store(StoreAlbumRequest)` | `/admin/dokumentasi` | POST | Buat album + upload cover |
| `edit($id)` | `/admin/dokumentasi/{id}/edit` | GET | Load album + fotos with media |
| `update(UpdateAlbumRequest, $id)` | `/admin/dokumentasi/{id}` | PUT | Update album data + cover |
| `destroy($id)` | `/admin/dokumentasi/{id}` | DELETE | Soft delete album + cascade fotos |
| `storeFoto(StoreFotoRequest, $id)` | `/admin/dokumentasi/{id}/foto` | POST | Bulk upload foto. Max 50 per album. Validasi: 2MB each |
| `destroyFoto($id, $fotoId)` | `/admin/dokumentasi/{id}/foto/{fotoId}` | DELETE | Hapus satu foto |
| `reorderFotos(Request, $id)` | `/admin/dokumentasi/{id}/foto/reorder` | PATCH | Update urutan foto |

### 10.7 `LampiranController`

**File:** `app/Http/Controllers/Admin/LampiranController.php`

| Method | Route | HTTP | Fitur |
|---|---|---|---|
| `index()` | `/admin/lampiran` | GET | Daftar kategori + berkas. Nested data |
| `storeKategori(Request)` | `/admin/lampiran/kategori` | POST | Buat kategori. Validasi unique |
| `updateKategori(Request, $id)` | `/admin/lampiran/kategori/{id}` | PUT | Update kategori |
| `destroyKategori($id)` | `/admin/lampiran/kategori/{id}` | DELETE | Soft delete kategori + berkas (cascade). Konfirmasi count |
| `storeBerkas(StoreLampiranRequest)` | `/admin/lampiran/berkas` | POST | Upload file + metadata |
| `updateBerkas(UpdateLampiranRequest, $id)` | `/admin/lampiran/berkas/{id}` | PUT | Update metadata. Opsional ganti file |
| `destroyBerkas($id)` | `/admin/lampiran/berkas/{id}` | DELETE | Hapus berkas + media |

### 10.8 `BidangController`

**File:** `app/Http/Controllers/Admin/BidangController.php`

| Method | Route | HTTP | Fitur |
|---|---|---|---|
| `index()` | `/admin/bidang` | GET | Daftar bidang. Sort by urutan. Include anggota count |
| `create()` | `/admin/bidang/create` | GET | Form kosong |
| `store(StoreBidangRequest)` | `/admin/bidang` | POST | Buat bidang + banner. Max 6 check |
| `edit($id)` | `/admin/bidang/{id}/edit` | GET | Load bidang + kepala bagian + anggota with media |
| `update(UpdateBidangRequest, $id)` | `/admin/bidang/{id}` | PUT | Update bidang |
| `destroy($id)` | `/admin/bidang/{id}` | DELETE | Soft delete |
| `storeAnggota(Request, $id)` | `/admin/bidang/{id}/anggota` | POST | Tambah anggota. Max 20 check |
| `updateAnggota(Request, $id, $anggotaId)` | `/admin/bidang/{id}/anggota/{anggotaId}` | PUT | Update anggota |
| `destroyAnggota($id, $anggotaId)` | `/admin/bidang/{id}/anggota/{anggotaId}` | DELETE | Hapus anggota |

### 10.9 `PengaturanController`

**File:** `app/Http/Controllers/Admin/PengaturanController.php`

| Method | Route | HTTP | Fitur |
|---|---|---|---|
| `edit()` | `/admin/pengaturan` | GET | Load semua pengaturan. Role-based: Super Admin lihat pengaturan sistem |
| `update(UpdatePengaturanRequest)` | `/admin/pengaturan` | PUT | Batch update key-value. Invalidasi cache. Log activity |

### 10.10 `PesanKontakController`

**File:** `app/Http/Controllers/Admin/PesanKontakController.php`

| Method | Route | HTTP | Fitur |
|---|---|---|---|
| `index()` | `/admin/pesan` | GET | Daftar pesan. Filter: semua / belum dibaca. Sort: `created_at DESC` |
| `show($id)` | `/admin/pesan/{id}` | GET | Detail pesan. Auto-mark as read |
| `toggleRead($id)` | `/admin/pesan/{id}/toggle-read` | PATCH | Toggle status baca |
| `destroy($id)` | `/admin/pesan/{id}` | DELETE | Hapus pesan |

---

## 11. Controllers — Super Admin

### 11.1 `PenggunaController`

**File:** `app/Http/Controllers/Admin/PenggunaController.php`
**Middleware tambahan:** `role:super_admin`

| Method | Route | HTTP | Fitur |
|---|---|---|---|
| `index()` | `/admin/pengguna` | GET | Daftar admin (roles: admin, super_admin). Include: role, status, last login |
| `create()` | `/admin/pengguna/create` | GET | Form tambah admin. Check batas 10 |
| `store(StoreAdminRequest)` | `/admin/pengguna` | POST | Buat user. Assign role `admin`. Hash password. Log activity |
| `edit($id)` | `/admin/pengguna/{id}/edit` | GET | Load admin data. Policy check |
| `update(UpdateAdminRequest, $id)` | `/admin/pengguna/{id}` | PUT | Update name, email. Password opsional. Policy: cannot edit super_admin |
| `toggleStatus($id)` | `/admin/pengguna/{id}/toggle-status` | PATCH | Toggle `is_active`. Policy check. Invalidasi sesi jika dinonaktifkan. Min 1 super_admin aktif check |

**Sesi invalidation saat admin dinonaktifkan:**

```php
// Hapus semua sesi user yang dinonaktifkan
DB::table('sessions')
    ->where('user_id', $target->id)
    ->delete();
```

---

## 12. Routes

### 12.1 File Route Utama

Semua route didefinisikan di `routes/web.php`. Dipisah menjadi 4 grup:

```php
<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Route Publik — Tanpa Auth
|--------------------------------------------------------------------------
*/
Route::group([], function () {
    // Beranda
    Route::get('/', [Public\HomeController::class, 'index'])
        ->name('public.home');

    // Profil
    Route::prefix('profil')->group(function () {
        Route::get('/tentang-kami', [Public\ProfilController::class, 'tentang'])
            ->name('public.profil.tentang');
        Route::get('/visi-misi', [Public\ProfilController::class, 'visiMisi'])
            ->name('public.profil.visiMisi');
        Route::get('/struktur-organisasi', [Public\ProfilController::class, 'struktur'])
            ->name('public.profil.struktur');
    });

    // Berita
    Route::get('/berita', [Public\BeritaController::class, 'index'])
        ->name('public.berita.index');
    Route::get('/berita/{slug}', [Public\BeritaController::class, 'show'])
        ->name('public.berita.show');

    // Pengumuman
    Route::get('/pengumuman', [Public\PengumumanController::class, 'index'])
        ->name('public.pengumuman.index');
    Route::get('/pengumuman/{slug}', [Public\PengumumanController::class, 'show'])
        ->name('public.pengumuman.show');

    // Bidang
    Route::get('/bidang/{slug}', [Public\BidangController::class, 'show'])
        ->name('public.bidang.show');

    // Dokumentasi
    Route::get('/dokumentasi', [Public\DokumentasiController::class, 'index'])
        ->name('public.dokumentasi.index');
    Route::get('/dokumentasi/{slug}', [Public\DokumentasiController::class, 'show'])
        ->name('public.dokumentasi.show');

    // Lampiran
    Route::get('/lampiran', [Public\LampiranController::class, 'index'])
        ->name('public.lampiran.index');
    Route::get('/lampiran/download/{id}', [Public\LampiranController::class, 'download'])
        ->name('public.lampiran.download')
        ->middleware('throttle:download');
    Route::get('/lampiran/{slug}', [Public\LampiranController::class, 'kategori'])
        ->name('public.lampiran.kategori');

    // Kontak
    Route::get('/kontak', [Public\KontakController::class, 'index'])
        ->name('public.kontak.index');
    Route::post('/kontak', [Public\KontakController::class, 'kirim'])
        ->name('public.kontak.kirim')
        ->middleware('throttle:kontak');
});

/*
|--------------------------------------------------------------------------
| Route Admin — Auth Required (Admin & Super Admin)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])
    ->prefix('admin')
    ->group(function () {
        // Dashboard
        Route::get('/', [Admin\DashboardController::class, 'index'])
            ->name('admin.dashboard');

        // Beranda (konten)
        Route::get('/beranda', [Admin\BerandaController::class, 'edit'])
            ->name('admin.beranda.edit');
        Route::put('/beranda', [Admin\BerandaController::class, 'update'])
            ->name('admin.beranda.update');
        // Banner sub-routes
        Route::post('/beranda/banner', [Admin\BerandaController::class, 'storeBanner'])
            ->name('admin.beranda.banner.store');
        Route::put('/beranda/banner/{id}', [Admin\BerandaController::class, 'updateBanner'])
            ->name('admin.beranda.banner.update');
        Route::delete('/beranda/banner/{id}', [Admin\BerandaController::class, 'destroyBanner'])
            ->name('admin.beranda.banner.destroy');
        Route::patch('/beranda/banner/reorder', [Admin\BerandaController::class, 'reorderBanners'])
            ->name('admin.beranda.banner.reorder');

        // Profil
        Route::prefix('profil')->group(function () {
            Route::get('/tentang', [Admin\ProfilController::class, 'editTentang'])
                ->name('admin.profil.tentang.edit');
            Route::put('/tentang', [Admin\ProfilController::class, 'updateTentang'])
                ->name('admin.profil.tentang.update');
            Route::get('/visi-misi', [Admin\ProfilController::class, 'editVisiMisi'])
                ->name('admin.profil.visiMisi.edit');
            Route::put('/visi-misi', [Admin\ProfilController::class, 'updateVisiMisi'])
                ->name('admin.profil.visiMisi.update');
            Route::get('/kepala-biro', [Admin\ProfilController::class, 'editKepalaBiro'])
                ->name('admin.profil.kepalaBiro.edit');
            Route::put('/kepala-biro', [Admin\ProfilController::class, 'updateKepalaBiro'])
                ->name('admin.profil.kepalaBiro.update');
            Route::get('/struktur', [Admin\ProfilController::class, 'editStruktur'])
                ->name('admin.profil.struktur.edit');
            Route::put('/struktur', [Admin\ProfilController::class, 'updateStruktur'])
                ->name('admin.profil.struktur.update');
        });

        // Berita CRUD
        Route::resource('berita', Admin\BeritaController::class)
            ->names('admin.berita');
        Route::post('/berita/kategori', [Admin\BeritaController::class, 'storeKategori'])
            ->name('admin.berita.kategori.store');
        Route::delete('/berita/kategori/{id}', [Admin\BeritaController::class, 'destroyKategori'])
            ->name('admin.berita.kategori.destroy');

        // Pengumuman CRUD
        Route::resource('pengumuman', Admin\PengumumanController::class)
            ->names('admin.pengumuman');

        // Dokumentasi CRUD
        Route::resource('dokumentasi', Admin\DokumentasiController::class)
            ->names('admin.dokumentasi');
        Route::post('/dokumentasi/{id}/foto', [Admin\DokumentasiController::class, 'storeFoto'])
            ->name('admin.dokumentasi.foto.store');
        Route::delete('/dokumentasi/{id}/foto/{fotoId}', [Admin\DokumentasiController::class, 'destroyFoto'])
            ->name('admin.dokumentasi.foto.destroy');
        Route::patch('/dokumentasi/{id}/foto/reorder', [Admin\DokumentasiController::class, 'reorderFotos'])
            ->name('admin.dokumentasi.foto.reorder');

        // Bidang CRUD
        Route::resource('bidang', Admin\BidangController::class)
            ->names('admin.bidang');
        Route::post('/bidang/{id}/anggota', [Admin\BidangController::class, 'storeAnggota'])
            ->name('admin.bidang.anggota.store');
        Route::put('/bidang/{id}/anggota/{anggotaId}', [Admin\BidangController::class, 'updateAnggota'])
            ->name('admin.bidang.anggota.update');
        Route::delete('/bidang/{id}/anggota/{anggotaId}', [Admin\BidangController::class, 'destroyAnggota'])
            ->name('admin.bidang.anggota.destroy');

        // Lampiran
        Route::get('/lampiran', [Admin\LampiranController::class, 'index'])
            ->name('admin.lampiran.index');
        Route::post('/lampiran/kategori', [Admin\LampiranController::class, 'storeKategori'])
            ->name('admin.lampiran.kategori.store');
        Route::put('/lampiran/kategori/{id}', [Admin\LampiranController::class, 'updateKategori'])
            ->name('admin.lampiran.kategori.update');
        Route::delete('/lampiran/kategori/{id}', [Admin\LampiranController::class, 'destroyKategori'])
            ->name('admin.lampiran.kategori.destroy');
        Route::post('/lampiran/berkas', [Admin\LampiranController::class, 'storeBerkas'])
            ->name('admin.lampiran.berkas.store');
        Route::put('/lampiran/berkas/{id}', [Admin\LampiranController::class, 'updateBerkas'])
            ->name('admin.lampiran.berkas.update');
        Route::delete('/lampiran/berkas/{id}', [Admin\LampiranController::class, 'destroyBerkas'])
            ->name('admin.lampiran.berkas.destroy');

        // Layanan
        Route::get('/layanan', [Admin\LayananController::class, 'edit'])
            ->name('admin.layanan.edit');
        Route::put('/layanan', [Admin\LayananController::class, 'update'])
            ->name('admin.layanan.update');

        // Pesan Kontak
        Route::get('/pesan', [Admin\PesanKontakController::class, 'index'])
            ->name('admin.pesan.index');
        Route::get('/pesan/{id}', [Admin\PesanKontakController::class, 'show'])
            ->name('admin.pesan.show');
        Route::patch('/pesan/{id}/toggle-read', [Admin\PesanKontakController::class, 'toggleRead'])
            ->name('admin.pesan.toggleRead');
        Route::delete('/pesan/{id}', [Admin\PesanKontakController::class, 'destroy'])
            ->name('admin.pesan.destroy');

        // Pengaturan
        Route::get('/pengaturan', [Admin\PengaturanController::class, 'edit'])
            ->name('admin.pengaturan.edit');
        Route::put('/pengaturan', [Admin\PengaturanController::class, 'update'])
            ->name('admin.pengaturan.update');
    });

/*
|--------------------------------------------------------------------------
| Route Super Admin Only
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified', 'role:super_admin'])
    ->prefix('admin')
    ->group(function () {
        Route::get('/pengguna', [Admin\PenggunaController::class, 'index'])
            ->name('admin.pengguna.index');
        Route::get('/pengguna/create', [Admin\PenggunaController::class, 'create'])
            ->name('admin.pengguna.create');
        Route::post('/pengguna', [Admin\PenggunaController::class, 'store'])
            ->name('admin.pengguna.store');
        Route::get('/pengguna/{id}/edit', [Admin\PenggunaController::class, 'edit'])
            ->name('admin.pengguna.edit');
        Route::put('/pengguna/{id}', [Admin\PenggunaController::class, 'update'])
            ->name('admin.pengguna.update');
        Route::patch('/pengguna/{id}/toggle-status', [Admin\PenggunaController::class, 'toggleStatus'])
            ->name('admin.pengguna.toggleStatus');
    });

/*
|--------------------------------------------------------------------------
| Auth & Settings (sudah ada)
|--------------------------------------------------------------------------
*/
require __DIR__.'/settings.php';
```

---

## 13. Middleware

### 13.1 `SecurityHeaders` (BARU)

**File:** `app/Http/Middleware/SecurityHeaders.php`

Tambahkan header keamanan ke semua response (lihat `07-SECURITY.md`):
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Strict-Transport-Security` (production only)

Register sebagai **global middleware** di `bootstrap/app.php`.

### 13.2 `HandleInertiaRequests` (UPDATE)

**File:** `app/Http/Middleware/HandleInertiaRequests.php`

Update method `share()` untuk menyertakan:

```php
public function share(Request $request): array
{
    return [
        ...parent::share($request),
        'name' => config('app.name'),
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
        'pengaturan' => fn () => Pengaturan::getAllCached(),
        'sidebarOpen' => ! $request->hasCookie('sidebar_state')
            || $request->cookie('sidebar_state') === 'true',
    ];
}
```

### 13.3 Rate Limiters (Konfigurasi)

Di `AppServiceProvider` atau `bootstrap/app.php`:

```php
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;

// Formulir kontak: 3 per 10 menit
RateLimiter::for('kontak', function (Request $request) {
    return Limit::perMinutes(10, 3)->by($request->ip());
});

// Download lampiran: 30 per menit
RateLimiter::for('download', function (Request $request) {
    return Limit::perMinute(30)->by($request->ip());
});
```

### 13.4 Login Event Listener

Untuk update `last_login_at` dan log login:

**File:** `app/Listeners/UpdateLastLogin.php`

```php
public function handle(Login $event): void
{
    $event->user->update(['last_login_at' => now()]);

    activity()
        ->causedBy($event->user)
        ->log('Login berhasil');
}
```

Register di `EventServiceProvider`:
```php
Login::class => [UpdateLastLogin::class],
```

---

## 14. Shared Data (Inertia)

Data yang dikirim ke **semua halaman** via HandleInertiaRequests middleware:

| Key | Tipe | Sumber | Keterangan |
|---|---|---|---|
| `auth.user` | object / null | `$request->user()` | ID, name, email, roles |
| `flash.success` | string / null | Session flash | Pesan sukses |
| `flash.error` | string / null | Session flash | Pesan error |
| `flash.warning` | string / null | Session flash | Pesan warning |
| `flash.info` | string / null | Session flash | Pesan info |
| `pengaturan` | object | Cache 1 jam | Key-value semua pengaturan |
| `sidebarOpen` | boolean | Cookie | State sidebar admin |

### Flash Messages Pattern

Di controller, setelah aksi berhasil:
```php
return redirect()->route('admin.berita.index')
    ->with('success', 'Berita berhasil disimpan.');
```

Setelah gagal:
```php
return back()->with('error', 'Terjadi kesalahan saat menyimpan.');
```

Di React, flash messages ditangkap oleh `useFlashToast` hook dan ditampilkan
via `react-hot-toast`.

---

## 15. Caching Strategy

| Data | Key | TTL | Invalidasi |
|---|---|---|---|
| Pengaturan website | `pengaturan` | 1 jam | Saat admin update via `PengaturanController` |
| Data beranda (semua) | `beranda_data` | 30 menit | Saat admin update konten beranda |
| Daftar kategori berita | `kategori_beritas` | 1 jam | Saat CRUD kategori |
| Daftar kategori lampiran | `kategori_lampirans` | 1 jam | Saat CRUD kategori |
| Data halaman statis | Tidak di-cache | — | Query langsung (1 record) |
| Halaman detail berita | Tidak di-cache | — | Selalu fresh |
| Data admin panel | Tidak di-cache | — | Selalu fresh |

### Pattern Invalidasi

Setiap controller yang mengubah data cached harus memanggil invalidasi:

```php
// Di BerandaController setelah update:
cache()->forget('beranda_data');

// Di PengaturanController setelah update:
cache()->forget('pengaturan');

// Di KategoriBerita CRUD:
cache()->forget('kategori_beritas');
```

### Cache Driver

```env
CACHE_STORE=file
```

File cache cukup untuk skala website ini. Tidak perlu Redis atau Memcached.

---

## 16. File & Media Management

### Konfigurasi Spatie Media Library

#### Collection Definitions per Model

| Model | Collection | Single File? | Conversions | Accepted MIME |
|---|---|---|---|---|
| `Berita` | `thumbnail` | Ya | `thumb` (400×225) | jpeg, png, webp |
| `Pengumuman` | `thumbnail` | Ya | `thumb` (400×225) | jpeg, png, webp |
| `Pengumuman` | `lampiran` | Tidak (max 3) | — | pdf, docx, xlsx |
| `Banner` | `gambar` | Ya | `display` (1920×1080) | jpeg, png, webp |
| `Album` | `cover` | Ya | `thumb` (400×225) | jpeg, png, webp |
| `Foto` | `foto` | Ya | `thumb` (400×300) | jpeg, png, webp |
| `KepalaBiro` | `foto` | Ya | `display` (400×533) | jpeg, png |
| `StrukturAnggota` | `foto` | Ya | `display` (200×200) | jpeg, png |
| `BidangKepalaBagian` | `foto` | Ya | `display` (400×533) | jpeg, png |
| `BidangAnggota` | `foto` | Ya | `display` (200×200) | jpeg, png |
| `Bidang` | `banner` | Ya | `display` (1920×600) | jpeg, png, webp |
| `Lampiran` | `berkas` | Ya | — | pdf, docx, xlsx, pptx |

#### Storage Disk

```php
// config/filesystems.php — menggunakan 'public' disk
'public' => [
    'driver' => 'local',
    'root' => storage_path('app/public'),
    'url' => env('APP_URL').'/storage',
    'visibility' => 'public',
],
```

Pastikan symlink sudah dibuat:
```bash
php artisan storage:link
```

#### Image Optimization

Setelah install `spatie/laravel-image-optimizer`, gambar yang diunggah akan
otomatis dioptimasi (kompresi lossless). Pastikan binary optimizer tersedia
di server (jpegoptim, optipng, pngquant, gifsicle, webp).

#### Download File (Lampiran)

File lampiran **tidak** di-serve langsung dari URL publik. Gunakan controller:

```php
public function download($id)
{
    $lampiran = Lampiran::findOrFail($id);
    $media = $lampiran->getFirstMedia('berkas');

    return response()->download(
        $media->getPath(),
        $lampiran->nama_tampilan . '.' . $media->extension
    );
}
```

---

## 17. Helpers & Utilities

### 17.1 `RichTextSanitizer`

Sudah didefinisikan di Section 7.1. Digunakan di setiap controller yang
menerima input rich text (`isi` berita, `isi` pengumuman, `sambutan` kepala biro,
`konten` halaman statis, `deskripsi_lengkap` bidang).

### 17.2 Artisan Command: `CreateSuperAdmin`

**File:** `app/Console/Commands/CreateSuperAdmin.php`

```php
php artisan admin:create-superadmin
```

Command interaktif untuk membuat akun Super Admin baru via terminal
(alternative dari seeder). Cek max 2 Super Admin.

### 17.3 Artisan Command: `PruneActivityLog`

**File:** atau gunakan bawaan spatie/activitylog

```bash
# Hapus log lebih dari 90 hari
php artisan activitylog:clean --days=90
```

Jadwalkan di `app/Console/Kernel.php` (atau `routes/console.php`):

```php
Schedule::command('activitylog:clean --days=90')->weekly();
```

---

## 18. Konfigurasi Lingkungan

### Variabel `.env` yang Harus Ditambahkan

```env
# === App ===
APP_NAME="BKA UMRI"
APP_URL=https://bka.umri.ac.id

# === Database ===
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=bka_umri
DB_USERNAME=root
DB_PASSWORD=

# === Session ===
SESSION_DRIVER=database
SESSION_LIFETIME=120

# === Cache ===
CACHE_STORE=file

# === Admin Default (hanya untuk seeding) ===
DEFAULT_ADMIN_EMAIL=admin@bka-umri.ac.id
DEFAULT_ADMIN_PASSWORD=ChangeThisPassword123!

# === Mail (reset password) ===
MAIL_MAILER=smtp
MAIL_HOST=
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM_ADDRESS=noreply@bka-umri.ac.id
MAIL_FROM_NAME="BKA UMRI"
```

### Konfigurasi Session

```php
// config/session.php
'driver' => env('SESSION_DRIVER', 'database'),
'lifetime' => env('SESSION_LIFETIME', 120),
'expire_on_close' => false,
'secure' => env('SESSION_SECURE_COOKIE', true),
'http_only' => true,
'same_site' => 'lax',
```

### Session Table Migration

Pastikan migration session table sudah ada (sudah default di Laravel).

---

## 19. Testing Strategy

### Prioritas Testing (Jika Diimplementasikan)

#### Prioritas 1 — Auth & Security

| Test | Tipe | Yang Diuji |
|---|---|---|
| `LoginTest` | Feature | Login berhasil, login gagal, throttle setelah 5x, redirect setelah login |
| `LogoutTest` | Feature | Logout, session destroyed, redirect ke login |
| `PasswordResetTest` | Feature | Request reset, token valid, token expired, password updated |
| `RoleMiddlewareTest` | Feature | Admin akses route admin ✅, Admin akses route super_admin ❌ 403, Guest akses admin ❌ redirect login |
| `CsrfTest` | Feature | Request tanpa CSRF token → 419 |

#### Prioritas 2 — CRUD Berita & Pengumuman

| Test | Tipe | Yang Diuji |
|---|---|---|
| `BeritaCrudTest` | Feature | Create, read, update, soft delete berita via controller |
| `BeritaValidationTest` | Unit | Form Request validasi: judul min/max, slug unique, file size |
| `PengumumanCrudTest` | Feature | Create, read, update, delete pengumuman |
| `BeritaPublicTest` | Feature | Daftar berita publik, detail, hanya terpublikasi yang tampil, 404 untuk slug tidak ada |

#### Prioritas 3 — File Upload

| Test | Tipe | Yang Diuji |
|---|---|---|
| `FileUploadTest` | Feature | Upload gambar valid, tolak file terlalu besar, tolak tipe salah, nama file di-rename |
| `LampiranDownloadTest` | Feature | Download berhasil, rate limit, file not found |

#### Prioritas 4 — Super Admin Features

| Test | Tipe | Yang Diuji |
|---|---|---|
| `UserManagementTest` | Feature | Buat admin, toggle status, batas 10 admin, min 1 super admin |

### Menjalankan Tests

```bash
php artisan test
php artisan test --filter=BeritaCrudTest
php artisan test --coverage
```

---

## 20. Prioritas & Urutan Pengerjaan

### Phase 0 — Setup (Prerequisite)

```
 1. Install semua paket Composer (spatie/permission, medialibrary, dll.)
 2. Publish & jalankan migrasi paket
 3. Buat migration: add is_active & last_login_at ke users
 4. Buat enum ContentStatus
 5. Buat RoleSeeder + AdminUserSeeder
 6. Update DatabaseSeeder
 7. Jalankan: php artisan migrate --seed
 8. Update HandleInertiaRequests (shared data: flash, pengaturan, roles)
 9. Buat middleware SecurityHeaders + register global
10. Konfigurasi rate limiters (kontak, download)
11. Buat event listener UpdateLastLogin
12. Buat RichTextSanitizer service
13. Buat storage:link
```

### Phase 1 — Core Models & Migrations

```
14. Migration: banners, kepala_biros, halaman_statis, misis
15. Migration: struktur_anggotas, pengaturans, pesan_kontaks
16. Migration: kategori_beritas, beritas
17. Migration: pengumumans
18. Model: Banner, KepalaBiro, HalamanStatis, Misi, StrukturAnggota
19. Model: Pengaturan, PesanKontak
20. Model: KategoriBerita, Berita (with medialibrary, sluggable, activity log)
21. Model: Pengumuman (with medialibrary, sluggable, activity log)
22. Model: User update (HasRoles, is_active, scopes)
23. Seeder: PengaturanSeeder, HalamanStatisSeeder
```

### Phase 2 — Core Controllers & Routes

```
24. Form Requests: StoreBeritaRequest, UpdateBeritaRequest, KirimPesanRequest
25. Form Requests: StorePengumumanRequest, UpdatePengumumanRequest
26. Service: BerandaService, BeritaService, PengumumanService
27. Controller: Public\HomeController
28. Controller: Public\ProfilController
29. Controller: Public\BeritaController
30. Controller: Public\PengumumanController
31. Controller: Public\KontakController
32. Controller: Admin\DashboardController
33. Controller: Admin\BerandaController
34. Controller: Admin\ProfilController
35. Controller: Admin\BeritaController
36. Controller: Admin\PengumumanController
37. Routes: semua route publik + admin untuk modul di atas
38. Policies: BeritaPolicy, PengumumanPolicy
```

### Phase 3 — Extended Models & Controllers

```
39. Migration: bidangs, bidang_kepala_bagians, bidang_anggotas
40. Migration: layanans, statistiks
41. Migration: albums, fotos
42. Migration: kategori_lampirans, lampirans
43. Model: Bidang, BidangKepalaBagian, BidangAnggota, Layanan, Statistik
44. Model: Album, Foto, KategoriLampiran, Lampiran
45. Service: BidangService, DokumentasiService, LampiranService, MediaService
46. Form Requests: semua form requests extended
47. Controller: Public\BidangController
48. Controller: Public\DokumentasiController
49. Controller: Public\LampiranController
50. Controller: Admin\BidangController
51. Controller: Admin\DokumentasiController
52. Controller: Admin\LampiranController
53. Controller: Admin\LayananController
54. Controller: Admin\PesanKontakController
55. Routes: semua route extended
56. Policies: AlbumPolicy, LampiranPolicy, BidangPolicy
```

### Phase 4 — Super Admin & Settings

```
57. Form Requests: StoreAdminRequest, UpdateAdminRequest
58. Service: AdminUserService
59. Controller: Admin\PenggunaController
60. Controller: Admin\PengaturanController
61. Policy: UserPolicy
62. Routes: super admin routes
63. Artisan Command: CreateSuperAdmin
```

### Phase 5 — Polish & Optimization

```
64. Caching: implementasi cache di semua service (beranda, pengaturan, kategori)
65. Testing: auth flow, CRUD berita, file upload, super admin features
66. Activity Log: konfigurasi log untuk semua model yang dikelola
67. Schedule: activity log pruning (90 hari)
68. SEO: meta tags via Inertia Head, sitemap.xml generation, robots.txt
69. Error handling: custom 404/403 via Inertia render
70. Performance: eager loading (with) di semua query, pagination optimization
```

---

## Checklist Kualitas Backend

Sebelum menganggap sebuah modul "selesai", pastikan:

- [ ] Migration sudah dibuat dan bisa di-rollback (`migrate:rollback`)
- [ ] Model memiliki `$fillable` yang benar (bukan `$guarded = []`)
- [ ] Semua relasi Eloquent didefinisikan di kedua sisi
- [ ] Form Request memiliki validasi lengkap sesuai spesifikasi `04-FEATURES.md`
- [ ] Rich text di-sanitasi sebelum disimpan (`RichTextSanitizer`)
- [ ] File upload divalidasi tipe DAN ukuran di server-side
- [ ] Controller menggunakan Policy untuk otorisasi
- [ ] Semua query menggunakan Eloquent (bukan `DB::raw()`)
- [ ] Flash messages dikirim setelah setiap aksi berhasil/gagal
- [ ] Soft delete digunakan untuk data yang perlu recoverable
- [ ] Activity log aktif untuk aksi admin (create, update, delete)
- [ ] Cache di-invalidasi saat data berubah
- [ ] Rate limiting aktif di endpoint publik yang rentan
- [ ] Security headers middleware terpasang
- [ ] Route names mengikuti konvensi dot notation
- [ ] Tidak ada data sensitif (password, token) di log
