<?php

namespace Database\Seeders;

use App\Models\Berita;
use App\Models\KategoriBerita;
use App\Models\User;
use App\Enums\ContentStatus;
use Illuminate\Database\Seeder;

class BeritaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get author
        $admin = User::where('email', 'staff@bka.umri.ac.id')->first() 
            ?? User::where('email', 'admin@bka.umri.ac.id')->first()
            ?? User::first();

        if (!$admin) {
            return;
        }

        // 1. Seed Categories
        $categories = [
            'Kegiatan',
            'Layanan',
            'Mitra',
            'Prestasi',
            'Aturan',
        ];

        $categoryModels = [];
        foreach ($categories as $catName) {
            $categoryModels[$catName] = KategoriBerita::firstOrCreate([
                'nama' => $catName,
            ]);
        }

        // 2. Seed Default News Articles
        $newsData = [
            [
                'judul' => 'BKA UMRI Luncurkan Portal Keuangan Terintegrasi untuk Mahasiswa',
                'slug' => 'bka-luncurkan-sistem-keuangan-baru-2026',
                'category' => 'Layanan',
                'isi' => '
                    <p>Universitas Muhammadiyah Riau (UMRI) melalui Biro Keuangan dan Aset (BKA) secara resmi meluncurkan Portal Keuangan Terintegrasi. Inovasi ini ditujukan khusus untuk mempermudah proses administrasi keuangan dan pembayaran biaya kuliah bagi seluruh mahasiswa aktif.</p>
                    <p>Dalam acara sosialisasi yang diselenggarakan secara hybrid di Aula Utama UMRI, Kepala BKA menyampaikan bahwa digitalisasi layanan administrasi adalah keniscayaan di era modern. "Kami memahami bahwa efisiensi waktu sangat berharga bagi civitas akademika. Dengan sistem baru ini, mahasiswa tidak perlu lagi mengantre panjang di loket pembayaran," ujarnya.</p>
                    <h3>Fitur Utama Portal Terintegrasi</h3>
                    <p>Sistem ini dirancang dengan antarmuka yang ramah pengguna (user-friendly) dan dilengkapi dengan beberapa fitur unggulan, antara lain:</p>
                    <ul>
                        <li><strong>Pembayaran Real-Time:</strong> Status pembayaran akan langsung diperbarui dalam sistem segera setelah transaksi berhasil melalui bank mitra (BSI, Bank Muamalat, Bank Riau Kepri Syariah).</li>
                        <li><strong>Riwayat Tagihan Transparan:</strong> Mahasiswa dapat mengunduh invoice digital dan melihat rincian riwayat pembayaran dari semester pertama hingga saat ini.</li>
                        <li><strong>Pengajuan Dispensasi Online:</strong> Proses pengajuan keringanan biaya kuliah kini dapat dilakukan dengan mengunggah berkas persyaratan langsung melalui portal tanpa perlu membawa dokumen fisik.</li>
                    </ul>
                    <blockquote>
                        "Transformasi digital bukan sekadar mengubah dokumen fisik menjadi elektronik, tetapi mengubah paradigma pelayanan birokrasi menjadi lebih transparan, cepat, dan akuntabel."
                    </blockquote>
                ',
                'thumbnail' => 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80',
                'status' => ContentStatus::TERPUBLIKASI,
                'tanggal_publikasi' => now()->subDays(2),
            ],
            [
                'judul' => 'Workshop Sinergi & Optimalisasi Aset Kampus bersama Wilayah Muhammadiyah',
                'slug' => 'workshop-pengelolaan-aset-muhammadiyah',
                'category' => 'Kegiatan',
                'isi' => '
                    <p>Biro Keuangan dan Aset UMRI menggelar workshop intensif membahas standarisasi pencatatan dan optimalisasi sarana fisik guna mencapai predikat kampus unggul.</p>
                    <p>Workshop ini dihadiri oleh jajaran rektorat, dekanat, kepala program studi, serta pengurus aset Muhammadiyah wilayah Riau. Standarisasi dan sinkronisasi ini penting agar pelaporan aset kampus dapat dilakukan secara transparan dan akuntabel guna mendukung proses akreditasi universitas.</p>
                    <h3>Optimalisasi Pemanfaatan Fasilitas Fisik</h3>
                    <p>Dalam pemaparannya, Kepala Bagian Aset BKA UMRI menekankan pentingnya siklus hidup aset (asset lifecycle) mulai dari perencanaan, pengadaan, inventarisasi, pemeliharaan, hingga penghapusan aset.</p>
                ',
                'thumbnail' => 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&q=80',
                'status' => ContentStatus::TERPUBLIKASI,
                'tanggal_publikasi' => now()->subDays(5),
            ],
            [
                'judul' => 'Perluas Akses, UMRI Jalin Kerja Kerja Sama dengan 4 Bank Rekanan Baru',
                'slug' => 'sosialisasi-pembayaran-mitra-perbankan',
                'category' => 'Mitra',
                'isi' => '
                    <p>Kini mahasiswa dapat melakukan pembayaran SPP dan uang pembangunan melalui jaringan ATM, M-Banking, maupun teller di empat bank mitra resmi nasional.</p>
                    <p>Kerja sama ini diresmikan dalam penandatanganan Memorandum of Understanding (MoU) di Gedung Rektorat UMRI. Dengan penambahan mitra perbankan ini, diharapkan kendala keterlambatan pembayaran biaya kuliah yang disebabkan terbatasnya kanal pembayaran dapat diminimalisir seminimal mungkin.</p>
                ',
                'thumbnail' => 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&q=80',
                'status' => ContentStatus::TERPUBLIKASI,
                'tanggal_publikasi' => now()->subDays(10),
            ]
        ];

        foreach ($newsData as $data) {
            $catModel = $categoryModels[$data['category']] ?? null;

            $berita = Berita::create([
                'judul' => $data['judul'],
                'slug' => $data['slug'],
                'isi' => $data['isi'],
                'status' => $data['status'],
                'tanggal_publikasi' => $data['tanggal_publikasi'],
                'kategori_berita_id' => $catModel ? $catModel->id : null,
                'user_id' => $admin->id,
            ]);

            // Seed media thumbnail
            if (!empty($data['thumbnail'])) {
                try {
                    $berita->addMediaFromUrl($data['thumbnail'])
                        ->toMediaCollection('thumbnail');
                } catch (\Exception $e) {
                    // Ignore download failure in offline/limited network environments
                }
            }
        }
    }
}
