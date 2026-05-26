<?php

namespace Database\Seeders;

use App\Models\Bidang;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BidangSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::transaction(function () {
            // Delete existing to avoid duplicates
            DB::table('bidang_anggotas')->delete();
            DB::table('bidang_kepala_bagians')->delete();
            Bidang::query()->forceDelete();

            // 1. Bidang Keuangan & Pembiayaan
            $keuangan = Bidang::create([
                'nama' => 'Bidang Keuangan & Pembiayaan',
                'slug' => 'keuangan',
                'deskripsi_singkat' => 'Mengelola penganggaran, pembukuan, pelaporan keuangan universitas, verifikasi transaksi, serta pelayanan administrasi pembayaran mahasiswa.',
                'deskripsi_lengkap' => 'Bidang Keuangan & Pembiayaan bertanggung jawab penuh atas pengelolaan arus kas masuk dan keluar universitas secara transparan dan akuntabel. Kami mengintegrasikan sistem pembayaran digital bekerjasama dengan bank mitra untuk memberikan kemudahan bagi mahasiswa dalam melunasi kewajiban akademik.',
                'urutan' => 1,
                'cta_heading' => 'Butuh Bantuan Administrasi Pembayaran Kuliah?',
                'cta_sub' => 'Hubungi loket keuangan BKA atau buka panduan pembayaran online.',
                'cta_teks_tombol' => 'Lihat Panduan Pembayaran',
                'cta_tautan' => '#panduan',
            ]);

            try {
                $keuangan->addMediaFromUrl('https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=80')->toMediaCollection('banner');
            } catch (\Exception $e) {
                // Ignore download failure in offline environment
            }

            $kepalaKeuangan = $keuangan->kepalaBagian()->create([
                'nama' => 'Heni Marlina, S.Ak.',
                'jabatan' => 'Kepala Urusan Keuangan & Pembiayaan',
                'deskripsi_tugas' => 'Mengoordinasikan penganggaran tahunan, menyusun laporan keuangan bulanan/tahunan, serta memvalidasi pengeluaran operasional universitas.',
                'media_sosial' => [
                    ['platform' => 'instagram', 'url' => '#'],
                    ['platform' => 'linkedin', 'url' => '#'],
                ],
            ]);

            try {
                $kepalaKeuangan->addMediaFromUrl('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80')->toMediaCollection('foto');
            } catch (\Exception $e) {
                // Ignore
            }

            $keuangan->anggotas()->createMany([
                ['nama' => 'Rika Amalia', 'jabatan' => 'Staf Kasir & Pembayaran', 'urutan' => 1],
                ['nama' => 'Dedi Rahman', 'jabatan' => 'Staf Verifikasi & Anggaran', 'urutan' => 2],
            ]);

            // 2. Bidang Aset & Logistik
            $aset = Bidang::create([
                'nama' => 'Bidang Aset & Logistik',
                'slug' => 'aset',
                'deskripsi_singkat' => 'Mengatur inventarisasi, distribusi, pemeliharaan sarana prasarana, pengadaan barang, serta optimalisasi pemanfaatan aset fisik Universitas Muhammadiyah Riau.',
                'deskripsi_lengkap' => 'Bidang Aset & Logistik berfokus pada pemeliharaan seluruh fasilitas fisik kampus, pencatatan inventaris berkala, serta digitalisasi pengadaan barang. Kami memastikan sarana perkuliahan selalu dalam kondisi prima demi menunjang kenyamanan kegiatan belajar mengajar.',
                'urutan' => 2,
                'cta_heading' => 'Ingin Mengajukan Peminjaman Ruang atau Fasilitas Kampus?',
                'cta_sub' => 'Gunakan sistem peminjaman aset online untuk respons yang lebih cepat.',
                'cta_teks_tombol' => 'Sistem Peminjaman Aset',
                'cta_tautan' => '/admin/settings',
            ]);

            try {
                $aset->addMediaFromUrl('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80')->toMediaCollection('banner');
            } catch (\Exception $e) {
                // Ignore
            }

            $kepalaAset = $aset->kepalaBagian()->create([
                'nama' => 'M. Taufik, S.T.',
                'jabatan' => 'Kepala Urusan Aset & Logistik',
                'deskripsi_tugas' => 'Merencanakan program pemeliharaan berkala gedung, mengawasi pengadaan sarana perkuliahan, serta mengelola inventarisasi digital aset universitas.',
                'media_sosial' => [
                    ['platform' => 'instagram', 'url' => '#'],
                    ['platform' => 'linkedin', 'url' => '#'],
                ],
            ]);

            try {
                $kepalaAset->addMediaFromUrl('https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80')->toMediaCollection('foto');
            } catch (\Exception $e) {
                // Ignore
            }

            $aset->anggotas()->createMany([
                ['nama' => 'Ahmad Syarif', 'jabatan' => 'Staf Inventarisasi Fisik', 'urutan' => 1],
                ['nama' => 'Zulfahmi', 'jabatan' => 'Staf Teknisi & Pemeliharaan', 'urutan' => 2],
            ]);
        });
    }
}
