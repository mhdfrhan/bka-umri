# 02 — User Roles & Hak Akses

## Struktur Peran

Sistem ini memiliki dua peran utama yang memerlukan autentikasi (untuk pengelolaan),
sedangkan akses pengunjung bersifat terbuka untuk umum tanpa login.

```
┌──────────────────────────────────────────────────────────────────┐
│                        HIERARKI PERAN                            │
│                                                                  │
│   Super Admin  ──►  Akses penuh ke semua fitur dan pengaturan   │
│        │                                                         │
│      Admin     ──►  Kelola konten, unggah berkas, moderasi       │
│                                                                  │
│      Publik    ──►  Akses semua halaman + unduh lampiran         │
│                   (Tanpa perlu login / memiliki akun)            │
└──────────────────────────────────────────────────────────────────┘
```

---

## Definisi Peran

### Super Admin
Peran tertinggi, idealnya dipegang oleh developer atau koordinator IT BKA.
Memiliki akses ke seluruh fitur termasuk pengaturan sistem, manajemen semua
pengguna termasuk akun admin lain, dan konfigurasi teknis website.

**Batasan jumlah:** Maksimal **2 akun** Super Admin dalam sistem.
**Pembuatan akun pertama:** Via database seeder saat instalasi awal (`php artisan db:seed`).
Super Admin **tidak dapat dibuat melalui UI** — hanya via seeder atau command artisan khusus.

### Admin
Staf BKA yang diberi kepercayaan untuk mengelola konten website sehari-hari.
Admin dapat memperbarui semua konten — dari banner beranda hingga dokumen
lampiran — namun tidak dapat mengubah konfigurasi sistem atau mengelola
akun Super Admin lain.

**Batasan jumlah:** Maksimal **10 akun** Admin aktif.
**Pembuatan akun:** Hanya oleh Super Admin melalui panel admin.

### Publik (Pengunjung Umum & Anggota BKA)
Semua pengunjung website, baik civitas akademika UMRI, anggota internal BKA,
maupun masyarakat umum. Mereka tidak memiliki akun dan tidak perlu login untuk
mengakses seluruh halaman informasi serta mengunduh dokumen/lampiran yang tersedia.

---

## Matriks Hak Akses

### Frontend (Halaman Website)

| Halaman / Fitur | Publik (Tanpa Login) | Admin (Login) | Super Admin (Login) |
|---|:---:|:---:|:---:|
| Beranda | ✅ | ✅ | ✅ |
| Profil & Visi Misi | ✅ | ✅ | ✅ |
| Struktur Organisasi | ✅ | ✅ | ✅ |
| Kepala Biro & Sambutan | ✅ | ✅ | ✅ |
| Daftar & Detail Berita | ✅ | ✅ | ✅ |
| Daftar & Detail Pengumuman | ✅ | ✅ | ✅ |
| Galeri Dokumentasi | ✅ | ✅ | ✅ |
| Halaman Kontak | ✅ | ✅ | ✅ |
| **Lampiran & Unduhan** | ✅ | ✅ | ✅ |

### Panel Admin

| Fitur Admin | Admin | Super Admin |
|---|:---:|:---:|
| Akses dashboard | ✅ | ✅ |
| Edit konten beranda | ✅ | ✅ |
| Kelola profil & visi misi | ✅ | ✅ |
| Kelola kepala biro | ✅ | ✅ |
| Kelola struktur organisasi | ✅ | ✅ |
| CRUD berita | ✅ | ✅ |
| CRUD pengumuman | ✅ | ✅ |
| Kelola galeri dokumentasi | ✅ | ✅ |
| Upload & kelola lampiran | ✅ | ✅ |
| Kelola kategori lampiran | ✅ | ✅ |
| Pengaturan kontak & media sosial | ✅ | ✅ |
| Kelola akun Admin (buat, edit, nonaktifkan) | ❌ | ✅ |
| Pengaturan sistem (nama situs, logo, SEO) | ❌ | ✅ |
| Lihat log aktivitas | ❌ | ✅ |
| Ubah role diri sendiri | ❌ | ❌ |
| Hapus akun sendiri | ❌ | ❌ |

---

## Alur Autentikasi

### Login
- Halaman login hanya diperuntukkan bagi Administrator (Admin & Super Admin)
- Setelah berhasil login, pengguna diarahkan ke `/admin` (Dashboard)
- Jika sudah login dan mengakses `/login`, redirect ke `/admin`
- Guest yang mengakses route `/admin/*` di-redirect ke `/login`

### Pengelolaan Akun Administrator
- Hanya Super Admin yang memiliki wewenang untuk mengelola akun Admin
- Tidak tersedia fitur registrasi mandiri di sistem ini
- Admin **tidak dapat** mengubah role atau status akunnya sendiri
- Super Admin **tidak dapat** menonaktifkan akunnya sendiri

### Lupa Password
Tersedia fitur reset password bagi Administrator via tautan yang dikirim ke
email terdaftar. Token reset berlaku selama **60 menit** setelah dikirim.

### Logout
- Setelah logout, pengguna diarahkan ke halaman login (`/login`)
- Sesi dihancurkan sepenuhnya (session invalidate + regenerate token)

---

## Aturan Sesi & Keamanan Akun

| Aspek | Nilai |
|---|---|
| **Durasi sesi** | 120 menit (2 jam) tanpa aktivitas |
| **Concurrent sessions** | Diperbolehkan (tidak ada limit per akun) |
| **Auto-logout** | Setelah 120 menit idle, redirect ke login |
| **Login throttling** | Max 5 percobaan gagal per menit, lalu lockout 60 detik |
| **Session driver** | `database` (agar bisa di-track dan di-invalidate) |

---

## Skenario Edge-Case yang Harus Ditangani

| Skenario | Perilaku Sistem |
|---|---|
| Super Admin terakhir mencoba menonaktifkan dirinya | **Ditolak** — minimal 1 Super Admin harus aktif |
| Admin dinonaktifkan saat sedang login | Sesi tetap aktif sampai habis, tapi login berikutnya ditolak |
| Super Admin menghapus akun Admin yang sedang login | Sesi Admin yang bersangkutan langsung di-invalidate |
| Jumlah Admin sudah mencapai batas (10) | Tombol "Tambah Admin" dinonaktifkan + pesan informasi |
| User mencoba mengakses `/admin/pengguna` sebagai Admin biasa | Return **403 Forbidden** |
| Login dari perangkat berbeda | Diperbolehkan, sesi lama tetap aktif |

---

## Catatan Implementasi untuk Developer

### Laravel Permission (spatie/laravel-permission)

Peran yang harus dibuat di seeder:

```
Roles: super_admin, admin
```

Middleware yang digunakan di route admin:

```php
// Semua route admin
Route::middleware(['auth', 'verified'])->prefix('admin')->group(...)

// Route khusus Super Admin
Route::middleware(['auth', 'role:super_admin'])->group(...)
```

### Seeder Akun Pertama

Saat `php artisan db:seed`, buat satu akun Super Admin default:

```
Email: admin@bka-umri.ac.id
Password: (diambil dari .env: DEFAULT_ADMIN_PASSWORD)
Role: super_admin
```

Password default **wajib diganti** setelah login pertama.
