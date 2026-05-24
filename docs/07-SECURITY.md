# 07 — Keamanan Sistem

Dokumen ini mendefinisikan semua kebijakan dan implementasi keamanan
untuk Website BKA UMRI. Setiap fitur yang berhubungan dengan autentikasi,
otorisasi, input pengguna, file upload, dan akses data **wajib** mengikuti
aturan di dokumen ini.

---

## Prinsip Keamanan

1. **Defense in Depth** — Jangan mengandalkan satu lapisan keamanan saja.
   Validasi dilakukan di frontend DAN backend. Middleware mengecek akses
   DAN controller memverifikasi ulang.

2. **Principle of Least Privilege** — Setiap peran hanya mendapat akses
   minimum yang dibutuhkan. Admin tidak bisa akses fitur Super Admin.
   Publik tidak bisa akses admin panel.

3. **Fail Secure** — Jika terjadi error atau kondisi tidak terduga,
   sistem harus menolak akses (deny by default), bukan mengizinkan.

4. **Never Trust User Input** — Semua input dari pengguna (form, URL, file)
   dianggap berbahaya sampai divalidasi dan disanitasi.

---

## Autentikasi

### Password Policy

| Aturan | Nilai |
|---|---|
| Panjang minimum | 8 karakter |
| Panjang maksimum | 128 karakter |
| Harus mengandung | Huruf besar, huruf kecil, dan angka |
| Karakter khusus | Direkomendasikan, tidak diwajibkan |
| Password common | Ditolak (gunakan `Password::defaults()` Laravel) |

Implementasi di Form Request:

```php
use Illuminate\Validation\Rules\Password;

'password' => [
    'required',
    'string',
    Password::min(8)
        ->mixedCase()
        ->numbers()
        ->uncompromised(), // cek terhadap database password yang bocor
    'confirmed',
],
```

### Hashing

- Algoritma: **bcrypt** (default Laravel)
- Jangan pernah simpan password dalam bentuk plain text
- Jangan pernah log password, bahkan dalam pesan error

### Login Throttling

| Parameter | Nilai |
|---|---|
| Max percobaan gagal | 5 kali |
| Periode | Per menit |
| Lockout | 60 detik setelah melebihi limit |
| Identifikasi | Kombinasi email + IP address |
| Pesan ke user | "Terlalu banyak percobaan. Silakan coba lagi dalam X detik." |

Implementasi menggunakan `RateLimiter` bawaan Laravel via `ThrottleRequests` middleware
di route login.

### Password Reset

| Parameter | Nilai |
|---|---|
| Token expiry | 60 menit |
| Token panjang | Default Laravel (64 karakter random) |
| Rate limit | Max 3 request per 15 menit per email |
| Email | Dikirim via SMTP (konfigurasi di `.env`) |

Flow:
1. User submit email di form "Lupa Password"
2. Sistem cek email ada di database → jika tidak ada, tetap tampilkan pesan
   sukses generik (jangan bocorkan info apakah email terdaftar)
3. Token dikirim ke email
4. User klik link → form password baru
5. Password di-update, token dihapus, sesi lama di-invalidate

---

## Otorisasi

### Middleware Chain

```php
// Route publik — tidak ada middleware auth
Route::group([], function () { ... });

// Route admin — auth + role check
Route::middleware(['auth', 'verified'])->prefix('admin')->group(function () {
    // Semua route admin
});

// Route Super Admin only
Route::middleware(['auth', 'verified', 'role:super_admin'])->prefix('admin')->group(function () {
    // admin.pengguna.*
});
```

### Policy Classes

Setiap model utama harus memiliki Policy class untuk mengontrol aksi:

| Model | Policy | Aksi yang Dikontrol |
|---|---|---|
| `Berita` | `BeritaPolicy` | `create`, `update`, `delete` |
| `Pengumuman` | `PengumumanPolicy` | `create`, `update`, `delete` |
| `Album` | `AlbumPolicy` | `create`, `update`, `delete` |
| `Lampiran` | `LampiranPolicy` | `create`, `update`, `delete` |
| `User` | `UserPolicy` | `viewAny`, `create`, `update`, `toggleStatus` |

Contoh implementasi:

```php
class UserPolicy
{
    // Hanya super_admin yang bisa mengelola pengguna
    public function viewAny(User $user): bool
    {
        return $user->hasRole('super_admin');
    }

    // Super Admin tidak bisa menonaktifkan diri sendiri
    public function toggleStatus(User $authUser, User $targetUser): bool
    {
        return $authUser->hasRole('super_admin')
            && $authUser->id !== $targetUser->id;
    }
}
```

### Gate untuk Aksi Sensitif

```php
// Mencegah penghapusan Super Admin terakhir
Gate::define('delete-admin', function (User $user, User $target) {
    if ($target->hasRole('super_admin')) {
        $superAdminCount = User::role('super_admin')->where('is_active', true)->count();
        return $superAdminCount > 1;
    }
    return $user->hasRole('super_admin');
});
```

---

## Proteksi CSRF

### Laravel CSRF Token

- Semua form POST/PUT/DELETE **wajib** menyertakan CSRF token
- Inertia.js secara otomatis mengirim CSRF token di setiap request
- Pastikan `VerifyCsrfToken` middleware aktif (sudah default di Laravel)
- Jangan pernah disable CSRF protection untuk route manapun

### Token Mismatch Handling

Jika terjadi CSRF token mismatch (misalnya sesi expired):
- Tampilkan halaman error yang informatif
- Berikan tombol untuk reload halaman (bukan pesan teknis mentah)
- Inertia secara default akan refresh halaman otomatis pada 419 response

---

## Proteksi XSS (Cross-Site Scripting)

### Input Sanitasi untuk Rich Text

Konten dari rich text editor (Tiptap) berisi HTML. Sebelum disimpan ke database,
**wajib** disanitasi menggunakan whitelist tag yang diizinkan.

**Tag HTML yang diizinkan:**

```
Diizinkan:
  <p>, <br>, <strong>, <em>, <u>, <s>,
  <h2>, <h3>,
  <ul>, <ol>, <li>,
  <blockquote>,
  <a href="..." target="...">,
  <img src="..." alt="...">,
  <hr>

DITOLAK (strip/hapus):
  <script>, <iframe>, <object>, <embed>,
  <form>, <input>, <button>,
  <style>, <link>,
  <svg>, <math>,
  event handlers (onclick, onerror, onload, dll.)
```

Implementasi sanitasi di backend menggunakan library PHP:

```php
// Gunakan HTMLPurifier atau package serupa
// Install: composer require ezyang/htmlpurifier

use HTMLPurifier;

class RichTextSanitizer
{
    public static function sanitize(string $html): string
    {
        $config = \HTMLPurifier_Config::createDefault();
        $config->set('HTML.Allowed',
            'p,br,strong,em,u,s,h2,h3,ul,ol,li,blockquote,a[href|target],img[src|alt],hr'
        );
        $config->set('HTML.TargetBlank', true);
        $config->set('URI.AllowedSchemes', ['http' => true, 'https' => true]);

        $purifier = new HTMLPurifier($config);
        return $purifier->purify($html);
    }
}
```

### Output Encoding

- Semua data dinamis yang di-render di React sudah di-escape secara otomatis
  oleh JSX (React default behavior)
- Jangan gunakan `dangerouslySetInnerHTML` kecuali untuk output rich text
  yang sudah di-sanitasi di backend
- Untuk menampilkan konten rich text, gunakan pola ini:

```jsx
// HANYA untuk konten yang sudah disanitasi di backend
<div
  className="prose"
  dangerouslySetInnerHTML={{ __html: berita.isi }}
/>
```

---

## Validasi & Sanitasi Input

### Prinsip Umum

- **Semua input wajib** melewati Laravel Form Request validation
- Validasi dilakukan di backend (server-side) — validasi frontend hanya untuk UX
- Jangan pernah percaya data dari client, termasuk hidden fields dan select options

### Form Request Pattern

Setiap form submission harus memiliki Form Request class terpisah:

```php
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
            'slug' => ['required', 'string', 'unique:beritas,slug', 'regex:/^[a-z0-9-]+$/'],
            'isi' => ['required', 'string', 'min:50'],
            'kategori_berita_id' => ['nullable', 'exists:kategori_beritas,id'],
            'thumbnail' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'status' => ['required', 'in:draf,terpublikasi,diarsipkan'],
            'tanggal_publikasi' => ['nullable', 'date', 'after_or_equal:today'],
        ];
    }
}
```

### SQL Injection Prevention

- **Selalu gunakan Eloquent ORM** atau Query Builder dengan parameter binding
- **Jangan pernah** menggunakan `DB::raw()` dengan input user yang tidak di-escape
- **Jangan pernah** melakukan string concatenation untuk membuat SQL query

```php
// ✅ BENAR — parameterized query
Berita::where('judul', 'LIKE', '%' . $search . '%')->get();

// ❌ SALAH — rentan SQL injection
DB::select("SELECT * FROM beritas WHERE judul LIKE '%" . $search . "%'");
```

---

## File Upload Security

### Validasi File

| Aspek | Aturan |
|---|---|
| Validasi MIME type | Di server-side menggunakan `mimes` rule (bukan hanya ekstensi) |
| Ekstensi yang diizinkan (gambar) | `jpg`, `jpeg`, `png`, `webp` |
| Ekstensi yang diizinkan (dokumen) | `pdf`, `docx`, `xlsx`, `pptx` |
| Max size gambar | 2 MB (2048 KB) |
| Max size dokumen | 10 MB (10240 KB) |
| Max size logo/favicon | 500 KB / 100 KB |
| Nama file | **Rename saat upload** — jangan gunakan nama asli dari user |

### Penamaan File

File yang diunggah **wajib** di-rename menggunakan format:

```
{timestamp}_{random_hash}.{extension}
Contoh: 1716357600_a3f4b2c1d5e6.jpg
```

Spatie Media Library sudah melakukan ini secara otomatis. Pastikan tidak
mengoverride perilaku ini.

### Penyimpanan File

- File disimpan di `storage/app/public/` (symlink ke `public/storage`)
- File lampiran (dokumen yang bisa diunduh) di-serve melalui controller,
  **bukan** direct public URL — agar bisa di-track dan diproteksi jika
  diperlukan di masa depan
- Jangan pernah simpan file di dalam direktori `public/` secara langsung

### Validasi Konten File

- Jangan hanya periksa ekstensi — periksa juga MIME type sebenarnya
- Laravel `mimes` rule sudah melakukan ini
- Untuk keamanan ekstra, tolak file dengan double extension (misalnya `file.php.jpg`)

```php
// Validasi file upload
'thumbnail' => [
    'required',
    'image',                    // harus file gambar
    'mimes:jpg,jpeg,png,webp',  // MIME type check
    'max:2048',                 // max 2 MB
],

'berkas' => [
    'required',
    'file',
    'mimes:pdf,docx,xlsx,pptx',
    'max:10240',                // max 10 MB
],
```

---

## Session & Cookie Security

### Session Configuration

| Parameter | Nilai | Lokasi |
|---|---|---|
| `SESSION_DRIVER` | `database` | `.env` |
| `SESSION_LIFETIME` | `120` (menit) | `config/session.php` |
| `SESSION_EXPIRE_ON_CLOSE` | `false` | `config/session.php` |

Menggunakan `database` driver agar sesi bisa di-track dan di-invalidate
secara programatis (misalnya saat Super Admin menonaktifkan akun Admin).

### Cookie Flags

```php
// config/session.php
'secure' => env('SESSION_SECURE_COOKIE', true),   // Hanya kirim via HTTPS
'http_only' => true,                               // Tidak bisa diakses via JavaScript
'same_site' => 'lax',                              // Proteksi CSRF tambahan
```

### Session Regeneration

- Regenerasi session ID **setelah login** (sudah default di Laravel Breeze)
- Invalidasi session **setelah logout**
- Jangan simpan data sensitif di session (password, token, dll.)

---

## Rate Limiting

### Konfigurasi Rate Limit

| Endpoint / Fitur | Max Request | Periode | Identifikasi |
|---|---|---|---|
| Login (`/login` POST) | 5 | Per menit | Email + IP |
| Password reset request | 3 | Per 15 menit | Email |
| Formulir kontak | 3 | Per 10 menit | IP address |
| Download lampiran | 30 | Per menit | IP address |
| API/Route umum (jika ada) | 60 | Per menit | IP address |

Implementasi di `RouteServiceProvider` atau `bootstrap/app.php`:

```php
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;

RateLimiter::for('kontak', function (Request $request) {
    return Limit::perMinutes(10, 3)->by($request->ip());
});

RateLimiter::for('download', function (Request $request) {
    return Limit::perMinute(30)->by($request->ip());
});
```

---

## HTTP Security Headers

Tambahkan header keamanan di setiap response melalui middleware:

```php
class SecurityHeaders
{
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        $response->headers->set('X-XSS-Protection', '1; mode=block');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

        // HSTS — hanya aktifkan jika sudah production + HTTPS
        if (app()->environment('production')) {
            $response->headers->set(
                'Strict-Transport-Security',
                'max-age=31536000; includeSubDomains'
            );
        }

        return $response;
    }
}
```

Register middleware ini di `bootstrap/app.php` sebagai global middleware.

### Penjelasan Header

| Header | Fungsi |
|---|---|
| `X-Content-Type-Options: nosniff` | Mencegah browser menebak MIME type |
| `X-Frame-Options: SAMEORIGIN` | Mencegah clickjacking via iframe |
| `X-XSS-Protection: 1; mode=block` | Aktifkan filter XSS browser |
| `Referrer-Policy` | Batasi informasi referer yang dikirim |
| `Permissions-Policy` | Nonaktifkan akses kamera, mikrofon, geolokasi |
| `Strict-Transport-Security` | Paksa HTTPS di semua request |

---

## Logging & Audit Trail

### Aktivitas yang Di-log

Menggunakan `spatie/laravel-activitylog`:

| Aksi | Log? | Detail yang Disimpan |
|---|---|---|
| Login berhasil | ✅ | User ID, IP, timestamp |
| Login gagal | ✅ | Email yang dicoba, IP, timestamp |
| Logout | ✅ | User ID, timestamp |
| Buat berita/pengumuman | ✅ | User ID, judul konten, timestamp |
| Edit berita/pengumuman | ✅ | User ID, field yang berubah (old → new) |
| Hapus konten | ✅ | User ID, judul konten yang dihapus |
| Upload file | ✅ | User ID, nama file, ukuran |
| Buat/edit/nonaktifkan admin | ✅ | User ID pelaku, target admin, aksi |
| Update pengaturan website | ✅ | User ID, key yang berubah |
| Password reset request | ✅ | Email, IP, timestamp |

### Data yang TIDAK BOLEH Di-log

- Password (baik plain text maupun hash)
- Token reset password
- Session ID
- Cookie values

### Penyimpanan Log

- Log aktivitas disimpan di tabel `activity_log` (bawaan spatie/activitylog)
- Log aplikasi (error, debug) di `storage/logs/` menggunakan log channel default Laravel
- Retensi log: minimal 90 hari (bisa di-prune via artisan command)

### Tampilan di Admin Panel

- Hanya Super Admin yang bisa melihat log aktivitas
- Ditampilkan di dashboard sebagai "Aktivitas Terbaru" (10 entry terakhir)
- Tidak perlu halaman log terpisah di versi awal

---

## Proteksi terhadap Serangan Umum

### Mass Assignment Protection

Semua model Eloquent **wajib** menggunakan `$fillable` (whitelist) atau
`$guarded` untuk mencegah mass assignment attack:

```php
class Berita extends Model
{
    protected $fillable = [
        'judul', 'slug', 'isi', 'status',
        'tanggal_publikasi', 'kategori_berita_id', 'user_id',
    ];

    // Jangan pernah izinkan mass assign untuk:
    // id, created_at, updated_at, deleted_at
}
```

### Path Traversal

- Nama file user **tidak pernah** digunakan langsung untuk path file di server
- Spatie Media Library sudah menangani ini — jangan override
- Jangan izinkan `../` atau path absolut dalam input apapun

### Open Redirect

- Jangan redirect ke URL yang berasal dari input user tanpa validasi
- Redirect setelah login hanya ke route internal yang sudah didefinisikan
- Gunakan `route()` helper, bukan URL mentah dari request

---

## Backup & Recovery

### Strategi Backup

| Data | Frekuensi | Metode |
|---|---|---|
| Database MySQL | Harian | `mysqldump` via cron job atau artisan command |
| File media (storage/) | Mingguan | Rsync ke lokasi backup terpisah |
| File `.env` | Manual | Simpan di tempat aman, bukan di repository |

### Rekomendasi Backup Tools

Untuk Laravel, bisa gunakan `spatie/laravel-backup` (opsional, tidak wajib di fase awal):

```
composer require spatie/laravel-backup
php artisan backup:run
```

### Recovery Plan

1. Restore database dari backup terbaru
2. Restore file media dari backup
3. Pastikan `.env` sesuai environment target
4. Jalankan `php artisan migrate` (jika ada migrasi baru)
5. Clear cache: `php artisan optimize:clear`
6. Verifikasi website berjalan normal

---

## Checklist Keamanan untuk Developer

Sebelum deploy ke production, pastikan semua item berikut terpenuhi:

- [ ] `.env` file tidak ter-commit ke repository
- [ ] `APP_DEBUG=false` di production
- [ ] `APP_ENV=production` di production
- [ ] Password default admin sudah diganti
- [ ] CSRF protection aktif di semua form
- [ ] Rate limiting aktif di endpoint login dan kontak
- [ ] File upload hanya menerima tipe yang diizinkan
- [ ] Rich text output di-sanitasi sebelum disimpan
- [ ] Security headers middleware terpasang
- [ ] HTTPS aktif di production (+ HSTS header)
- [ ] Session menggunakan database driver
- [ ] Cookie flags: secure, httpOnly, sameSite
- [ ] Semua query menggunakan Eloquent (bukan raw SQL)
- [ ] Semua model menggunakan `$fillable`
- [ ] Log tidak berisi data sensitif
- [ ] Backup database terjadwal
- [ ] `storage:link` sudah dijalankan
