# 03 — Sitemap & Struktur Navigasi

## Frontend — Halaman Publik

```
/ ─────────────────────────────────── Beranda
│
├── /profil ───────────────────────── Halaman induk profil
│   ├── /profil/tentang-kami ──────── Sejarah dan deskripsi BKA
│   ├── /profil/visi-misi ─────────── Visi, misi, dan nilai BKA
│   └── /profil/struktur-organisasi ─ Bagan dan daftar anggota
│
├── /berita ────────────────────────── Daftar semua berita
│   └── /berita/{slug} ─────────────── Detail satu berita
│
├── /pengumuman ────────────────────── Daftar semua pengumuman
│   └── /pengumuman/{slug} ─────────── Detail satu pengumuman
│
├── /bidang/{slug} ─────────────────── Detail bidang/bagian BKA
│
├── /dokumentasi ───────────────────── Galeri album kegiatan
│   └── /dokumentasi/{album-slug} ──── Isi foto dalam satu album
│
├── /lampiran ──────────────────────── Daftar kategori lampiran
│   └── /lampiran/{kategori-slug} ───── Daftar berkas per kategori (Publik)
│
└── /kontak ────────────────────────── Informasi kontak & formulir pesan
```

---

## Panel Admin

```
/admin ─────────────────────────────── Dashboard (ringkasan statistik)
│
├── /admin/beranda
│   ├── Banner & Slider
│   ├── Kata Sambutan
│   ├── Bidang / Bagian BKA
│   ├── Layanan BKA
│   └── Pengaturan Tampilan Beranda
│
├── /admin/profil
│   ├── Tentang Kami
│   ├── Visi & Misi
│   ├── Kepala Biro
│   └── Struktur Organisasi
│
├── /admin/berita
│   ├── Daftar Berita
│   ├── Tambah Berita
│   ├── Edit Berita
│   └── Kategori Berita
│
├── /admin/pengumuman
│   ├── Daftar Pengumuman
│   ├── Tambah Pengumuman
│   └── Edit Pengumuman
│
├── /admin/dokumentasi
│   ├── Daftar Album
│   ├── Tambah Album
│   └── Kelola Foto dalam Album
│
├── /admin/lampiran
│   ├── Daftar Kategori
│   ├── Tambah Kategori
│   └── Kelola Berkas per Kategori
│
├── /admin/pengguna                    ← Khusus Super Admin
│   ├── Daftar Administrator
│   ├── Tambah Administrator (Admin)
│   └── Detail & Edit Administrator
│
└── /admin/pengaturan
    ├── Informasi Kontak
    ├── Tautan Media Sosial
    └── (Super Admin) Pengaturan Sistem
```

---

## Route Naming Convention

Semua route Laravel harus mengikuti konvensi penamaan ini agar konsisten di
seluruh codebase. Gunakan dot notation dengan prefix grup.

### Route Publik

| URL | HTTP Method | Route Name | Controller |
|---|---|---|---|
| `/` | GET | `public.home` | `Public\HomeController@index` |
| `/profil/tentang-kami` | GET | `public.profil.tentang` | `Public\ProfilController@tentang` |
| `/profil/visi-misi` | GET | `public.profil.visiMisi` | `Public\ProfilController@visiMisi` |
| `/profil/struktur-organisasi` | GET | `public.profil.struktur` | `Public\ProfilController@struktur` |
| `/berita` | GET | `public.berita.index` | `Public\BeritaController@index` |
| `/berita/{slug}` | GET | `public.berita.show` | `Public\BeritaController@show` |
| `/pengumuman` | GET | `public.pengumuman.index` | `Public\PengumumanController@index` |
| `/pengumuman/{slug}` | GET | `public.pengumuman.show` | `Public\PengumumanController@show` |
| `/dokumentasi` | GET | `public.dokumentasi.index` | `Public\DokumentasiController@index` |
| `/dokumentasi/{album-slug}` | GET | `public.dokumentasi.show` | `Public\DokumentasiController@show` |
| `/lampiran` | GET | `public.lampiran.index` | `Public\LampiranController@index` |
| `/lampiran/{kategori-slug}` | GET | `public.lampiran.kategori` | `Public\LampiranController@kategori` |
| `/bidang/{slug}` | GET | `public.bidang.show` | `Public\BidangController@show` |
| `/kontak` | GET | `public.kontak.index` | `Public\KontakController@index` |
| `/kontak` | POST | `public.kontak.kirim` | `Public\KontakController@kirim` |

### Route Admin (CRUD)

| URL | HTTP Method | Route Name | Aksi |
|---|---|---|---|
| `/admin` | GET | `admin.dashboard` | Dashboard |
| `/admin/berita` | GET | `admin.berita.index` | Daftar berita |
| `/admin/berita/create` | GET | `admin.berita.create` | Form tambah |
| `/admin/berita` | POST | `admin.berita.store` | Simpan baru |
| `/admin/berita/{id}/edit` | GET | `admin.berita.edit` | Form edit |
| `/admin/berita/{id}` | PUT | `admin.berita.update` | Update |
| `/admin/berita/{id}` | DELETE | `admin.berita.destroy` | Hapus (soft) |
| `/admin/pengumuman` | GET | `admin.pengumuman.index` | Daftar pengumuman |
| `/admin/pengumuman/create` | GET | `admin.pengumuman.create` | Form tambah |
| `/admin/pengumuman` | POST | `admin.pengumuman.store` | Simpan baru |
| `/admin/pengumuman/{id}/edit` | GET | `admin.pengumuman.edit` | Form edit |
| `/admin/pengumuman/{id}` | PUT | `admin.pengumuman.update` | Update |
| `/admin/pengumuman/{id}` | DELETE | `admin.pengumuman.destroy` | Hapus (soft) |
| `/admin/dokumentasi` | GET | `admin.dokumentasi.index` | Daftar album |
| `/admin/dokumentasi/create` | GET | `admin.dokumentasi.create` | Form tambah album |
| `/admin/dokumentasi` | POST | `admin.dokumentasi.store` | Simpan album |
| `/admin/dokumentasi/{id}/edit` | GET | `admin.dokumentasi.edit` | Edit album |
| `/admin/dokumentasi/{id}` | PUT | `admin.dokumentasi.update` | Update album |
| `/admin/dokumentasi/{id}` | DELETE | `admin.dokumentasi.destroy` | Hapus album |
| `/admin/dokumentasi/{id}/foto` | POST | `admin.dokumentasi.foto.store` | Upload foto ke album |
| `/admin/dokumentasi/{id}/foto/{fotoId}` | DELETE | `admin.dokumentasi.foto.destroy` | Hapus foto |
| `/admin/lampiran/kategori` | GET | `admin.lampiran.kategori.index` | Daftar kategori |
| `/admin/lampiran/kategori` | POST | `admin.lampiran.kategori.store` | Buat kategori |
| `/admin/lampiran/kategori/{id}` | PUT | `admin.lampiran.kategori.update` | Update kategori |
| `/admin/lampiran/kategori/{id}` | DELETE | `admin.lampiran.kategori.destroy` | Hapus kategori |
| `/admin/lampiran/berkas` | POST | `admin.lampiran.berkas.store` | Upload berkas |
| `/admin/lampiran/berkas/{id}` | PUT | `admin.lampiran.berkas.update` | Update berkas |
| `/admin/lampiran/berkas/{id}` | DELETE | `admin.lampiran.berkas.destroy` | Hapus berkas |
| `/admin/bidang` | GET | `admin.bidang.index` | Daftar bidang |
| `/admin/bidang/create` | GET | `admin.bidang.create` | Form tambah bidang |
| `/admin/bidang` | POST | `admin.bidang.store` | Simpan bidang baru |
| `/admin/bidang/{id}/edit` | GET | `admin.bidang.edit` | Form edit bidang |
| `/admin/bidang/{id}` | PUT | `admin.bidang.update` | Update bidang |
| `/admin/bidang/{id}` | DELETE | `admin.bidang.destroy` | Hapus bidang |
| `/admin/bidang/{id}/anggota` | POST | `admin.bidang.anggota.store` | Tambah anggota |
| `/admin/bidang/{id}/anggota/{anggotaId}` | PUT | `admin.bidang.anggota.update` | Update anggota |
| `/admin/bidang/{id}/anggota/{anggotaId}` | DELETE | `admin.bidang.anggota.destroy` | Hapus anggota |
| `/admin/layanan` | GET | `admin.layanan.edit` | Halaman kelola layanan |
| `/admin/layanan` | PUT | `admin.layanan.update` | Simpan perubahan layanan |

### Route Admin — Konten Tunggal (Bukan CRUD Biasa)

Beberapa konten bersifat singleton (hanya 1 record yang dikelola):

| URL | HTTP Method | Route Name | Aksi |
|---|---|---|---|
| `/admin/beranda` | GET | `admin.beranda.edit` | Form edit konten beranda |
| `/admin/beranda` | PUT | `admin.beranda.update` | Simpan perubahan beranda |
| `/admin/profil/tentang` | GET | `admin.profil.tentang.edit` | Edit tentang kami |
| `/admin/profil/tentang` | PUT | `admin.profil.tentang.update` | Simpan tentang kami |
| `/admin/profil/visi-misi` | GET | `admin.profil.visiMisi.edit` | Edit visi & misi |
| `/admin/profil/visi-misi` | PUT | `admin.profil.visiMisi.update` | Simpan visi & misi |
| `/admin/profil/kepala-biro` | GET | `admin.profil.kepalaBiro.edit` | Edit kepala biro |
| `/admin/profil/kepala-biro` | PUT | `admin.profil.kepalaBiro.update` | Simpan kepala biro |
| `/admin/profil/struktur` | GET | `admin.profil.struktur.edit` | Edit struktur org |
| `/admin/profil/struktur` | PUT | `admin.profil.struktur.update` | Simpan struktur org |
| `/admin/pengaturan` | GET | `admin.pengaturan.edit` | Halaman pengaturan |
| `/admin/pengaturan` | PUT | `admin.pengaturan.update` | Simpan pengaturan |

### Route Admin — Manajemen Pengguna (Super Admin Only)

| URL | HTTP Method | Route Name | Aksi |
|---|---|---|---|
| `/admin/pengguna` | GET | `admin.pengguna.index` | Daftar admin |
| `/admin/pengguna/create` | GET | `admin.pengguna.create` | Form tambah admin |
| `/admin/pengguna` | POST | `admin.pengguna.store` | Buat akun admin |
| `/admin/pengguna/{id}/edit` | GET | `admin.pengguna.edit` | Form edit admin |
| `/admin/pengguna/{id}` | PUT | `admin.pengguna.update` | Update admin |
| `/admin/pengguna/{id}/toggle-status` | PATCH | `admin.pengguna.toggleStatus` | Aktifkan/nonaktifkan |

---

## Middleware Stack per Route Group

```php
// ─── Halaman Publik ───
// Tidak ada middleware auth. Semua bisa diakses tanpa login.
Route::group([], function () {
    // public.home, public.berita.*, public.pengumuman.*, dll.
});

// ─── Autentikasi ───
Route::middleware('guest')->group(function () {
    // login, lupa-password, reset-password
});

// ─── Panel Admin (Semua Role Terautentikasi) ───
Route::middleware(['auth', 'verified'])
    ->prefix('admin')
    ->group(function () {
        // admin.dashboard, admin.berita.*, admin.pengumuman.*,
        // admin.dokumentasi.*, admin.lampiran.*, admin.beranda.*,
        // admin.profil.*, admin.pengaturan.*
    });

// ─── Panel Admin (Super Admin Only) ───
Route::middleware(['auth', 'verified', 'role:super_admin'])
    ->prefix('admin')
    ->group(function () {
        // admin.pengguna.*
    });
```

---

## Aturan Redirect

| Kondisi | Redirect ke |
|---|---|
| Guest mengakses `/admin/*` | `/login` |
| User sudah login mengakses `/login` | `/admin` |
| Setelah login berhasil | `/admin` (Dashboard) |
| Setelah logout | `/login` |
| Admin mengakses route Super Admin | **403** (bukan redirect) |
| URL tidak ditemukan | **404** halaman khusus |
| Slug berita/pengumuman tidak ditemukan | **404** halaman khusus |

---

## Navigasi Utama (Header)

Menu navigasi utama yang tampil di semua halaman publik:

```
[Logo BKA]    Beranda   Profil ▾   Berita   Pengumuman   Dokumentasi   Lampiran   Kontak
                        └── Tentang Kami
                        └── Visi & Misi
                        └── Struktur Organisasi
```

Pada layar mobile, menu ini berubah menjadi hamburger menu yang slide dari sisi kanan.

---

## Footer

Footer tampil di semua halaman publik dan berisi:

- Logo BKA + deskripsi singkat
- Tautan cepat ke halaman-halaman utama
- Informasi kontak ringkas (alamat, telepon, email)
- Ikon media sosial
- Teks hak cipta

---

## Breadcrumb

Semua halaman di bawah level kedua menampilkan breadcrumb navigasi.
Contoh: `Beranda > Berita > Judul Berita`

Format data breadcrumb dikirim dari controller sebagai shared prop Inertia:

```php
// Contoh di controller:
return Inertia::render('Public/Berita/Show', [
    'berita' => $berita,
    'breadcrumbs' => [
        ['label' => 'Beranda', 'url' => route('public.home')],
        ['label' => 'Berita', 'url' => route('public.berita.index')],
        ['label' => $berita->judul, 'url' => null], // halaman aktif
    ],
]);
```

---

## Sidebar Admin Panel

Panel admin menggunakan layout **sidebar kiri** (bukan top navigation):

```
┌──────────┬─────────────────────────────────────┐
│ SIDEBAR  │  TOP BAR (nama user, logout)         │
│          ├─────────────────────────────────────┤
│ Dashboard│                                      │
│ Beranda  │          KONTEN UTAMA                │
│ Profil ▾ │                                      │
│ Berita   │                                      │
│ Pengumum.│                                      │
│ Dokument.│                                      │
│ Lampiran │                                      │
│ ──────── │                                      │
│ Pengguna │  ← hanya tampil untuk Super Admin    │
│ Pengatur.│                                      │
└──────────┴─────────────────────────────────────┘
```

Di mobile, sidebar menjadi drawer yang bisa ditoggle dengan hamburger icon.

---

## Halaman Khusus

| Halaman | URL | Deskripsi |
|---|---|---|
| Login | `/login` | Halaman masuk khusus untuk Admin dan Super Admin |
| Lupa Password | `/lupa-password` | Form input email untuk reset |
| Reset Password | `/reset-password/{token}` | Form password baru |
| 404 | — | Halaman tidak ditemukan dengan tombol kembali ke beranda |
| 403 | — | Akses ditolak, dengan penjelasan singkat |
