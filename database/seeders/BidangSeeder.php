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

            // 1. Bagian Administrasi Keuangan dan Profit
            $keuangan = new Bidang([
                'nama' => 'Bagian Administrasi Keuangan dan Profit',
                'slug' => 'bidang-keuangan-pembiayaan',
                'deskripsi_singkat' => 'Mengelola aktivitas akuntansi, penyusunan laporan keuangan universitas, penerimaan pendapatan, serta analisis profitabilitas.',
                'deskripsi_lengkap' => 'Bagian Administrasi Keuangan dan Profit Universitas Muhammadiyah Riau bertugas mengelola seluruh aspek administrasi akuntansi, penyusunan laporan keuangan universitas, serta manajemen pendapatan dan profitabilitas. Kami berkomitmen mewujudkan tata kelola keuangan yang transparan, akuntabel, dan efisien.',
                'urutan' => 1,
                'cta_heading' => 'Butuh Bantuan Administrasi Pembayaran Kuliah?',
                'cta_sub' => 'Hubungi loket keuangan BKA atau buka panduan pembayaran online.',
                'cta_teks_tombol' => 'Lihat Panduan Pembayaran',
                'cta_tautan' => '#panduan',
            ]);
            $keuangan->saveQuietly();

            try {
                $keuangan->addMediaFromUrl('https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=80')->toMediaCollection('banner');
            } catch (\Exception $e) {
                // Ignore
            }

            $kepalaKeuangan = $keuangan->kepalaBagian()->create([
                'nama' => 'Mailukni, SE',
                'jabatan' => 'Kepala Bagian Keuangan',
                'deskripsi_tugas' => 'Kepala Bagian Keuangan memiliki tugas untuk mengelola dan mengawasi seluruh aktivitas keuangan universitas, termasuk perencanaan, penganggaran, pelaporan, dan pemantauan transaksi keuangan. Kepala Bagian bertanggungjawab memastikan bahwa semua kegiatan keuangan dilakukan secara akurat dan sesuai dengan kebijakan serta peraturan yang berlaku.',
                'media_sosial' => [
                    ['platform' => 'facebook', 'url' => '#'],
                    ['platform' => 'twitter', 'url' => '#'],
                    ['platform' => 'instagram', 'url' => '#'],
                    ['platform' => 'linkedin', 'url' => '#'],
                ],
            ]);

            try {
                $kepalaKeuangan->addMediaFromUrl('https://bka.umri.ac.id/wp-content/uploads/2025/03/mailukni.jpg')->toMediaCollection('foto');
            } catch (\Exception $e) {
                // Ignore
            }

            // Seed division members (anggotas)
            $musa = $keuangan->anggotas()->create([
                'nama' => 'Musa Nurwahid Kifli, SE',
                'jabatan' => 'Kepala Sub Bagian Akuntansi dan Pelaporan',
                'urutan' => 1,
                'media_sosial' => [
                    ['platform' => 'facebook', 'url' => '#'],
                    ['platform' => 'twitter', 'url' => '#'],
                    ['platform' => 'instagram', 'url' => '#'],
                    ['platform' => 'linkedin', 'url' => '#'],
                ]
            ]);
            try {
                $musa->addMediaFromUrl('https://bka.umri.ac.id/wp-content/uploads/2025/03/musa.jpg')->toMediaCollection('foto');
            } catch (\Exception $e) {}

            $rahmiati = $keuangan->anggotas()->create([
                'nama' => 'Rahmiati, SE',
                'jabatan' => 'Kepala Sub Bagian Penerimaan dan Profit',
                'urutan' => 2,
                'media_sosial' => [
                    ['platform' => 'facebook', 'url' => '#'],
                    ['platform' => 'twitter', 'url' => '#'],
                    ['platform' => 'instagram', 'url' => '#'],
                    ['platform' => 'linkedin', 'url' => '#'],
                ]
            ]);
            try {
                $rahmiati->addMediaFromUrl('https://bka.umri.ac.id/wp-content/uploads/2025/03/Rahmiati.jpg')->toMediaCollection('foto');
            } catch (\Exception $e) {}

            $syauqi = $keuangan->anggotas()->create([
                'nama' => 'Syauqi Nazwar, SE',
                'jabatan' => 'Staf Bagian Penerimaan dan Profit',
                'urutan' => 3,
                'media_sosial' => [
                    ['platform' => 'facebook', 'url' => '#'],
                    ['platform' => 'twitter', 'url' => '#'],
                    ['platform' => 'instagram', 'url' => '#'],
                    ['platform' => 'linkedin', 'url' => '#'],
                ]
            ]);
            try {
                $syauqi->addMediaFromUrl('https://bka.umri.ac.id/wp-content/uploads/2025/03/syauqi.jpg')->toMediaCollection('foto');
            } catch (\Exception $e) {}

            // 2. Bagian Administrasi dan Pengadaan Aset
            $aset = new Bidang([
                'nama' => 'Bagian Administrasi dan Pengadaan Aset',
                'slug' => 'bidang-aset-logistik',
                'deskripsi_singkat' => 'Mengelola proses pengadaan, penerimaan, pencatatan, pengelolaan data aset, serta penyusunan laporan di universitas.',
                'deskripsi_lengkap' => 'Bagian Administrasi dan Pengadaan Aset Universitas Muhammadiyah Riau bertugas dalam pengelolaan aset fisik universitas, termasuk proses perencanaan pengadaan barang dan jasa, penerimaan dan pencatatan aset, inventarisasi sarana prasarana, serta optimalisasi pemanfaatan fasilitas kampus secara berkala.',
                'urutan' => 2,
                'cta_heading' => 'Ingin Mengajukan Peminjaman Ruang atau Fasilitas Kampus?',
                'cta_sub' => 'Gunakan sistem peminjaman aset online untuk respons yang lebih cepat.',
                'cta_teks_tombol' => 'Sistem Peminjaman Aset',
                'cta_tautan' => '/admin/settings',
            ]);
            $aset->saveQuietly();

            try {
                $aset->addMediaFromUrl('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80')->toMediaCollection('banner');
            } catch (\Exception $e) {
                // Ignore
            }

            $kepalaAset = $aset->kepalaBagian()->create([
                'nama' => 'Delvien Oktalisa, A.Md',
                'jabatan' => 'Plt. Kepala Bagian Administrasi Aset',
                'deskripsi_tugas' => 'Kepala Bagian Administrasi dan Pengadaan Aset bertugas dalam kegiatan administrasi terkait pengelolaan aset universitas, termasuk pencatatan, pengelolaan data aset, dan penyusunan laporan. Kepala Bidang bertanggungjawab mendukung Kepala Bagian Aset dalam memastikan semua aset tercatat dengan akurat dan dikelola sesuai kebijakan yang berlaku.',
                'media_sosial' => [
                    ['platform' => 'facebook', 'url' => '#'],
                    ['platform' => 'twitter', 'url' => '#'],
                    ['platform' => 'instagram', 'url' => '#'],
                    ['platform' => 'linkedin', 'url' => '#'],
                ],
            ]);

            try {
                $kepalaAset->addMediaFromUrl('https://bka.umri.ac.id/wp-content/uploads/2025/03/09_ok-768x806.jpg')->toMediaCollection('foto');
            } catch (\Exception $e) {
                // Ignore
            }

            // Seed division members (anggotas)
            $wira = $aset->anggotas()->create([
                'nama' => 'Wira Kurniawan, SE, CHSE, CPOf',
                'jabatan' => 'Kepala Sub Bagian Pengadaan dan Penerimaan Aset',
                'urutan' => 1,
                'media_sosial' => [
                    ['platform' => 'facebook', 'url' => '#'],
                    ['platform' => 'twitter', 'url' => '#'],
                    ['platform' => 'instagram', 'url' => '#'],
                    ['platform' => 'linkedin', 'url' => '#'],
                ]
            ]);
            try {
                $wira->addMediaFromUrl('https://bka.umri.ac.id/wp-content/uploads/2025/03/Wira-768x806.jpg')->toMediaCollection('foto');
            } catch (\Exception $e) {}

            $indrabella = $aset->anggotas()->create([
                'nama' => 'Indra Bella, SH',
                'jabatan' => 'Staff Bagian Administrasi Aset',
                'urutan' => 2,
                'media_sosial' => [
                    ['platform' => 'facebook', 'url' => '#'],
                    ['platform' => 'twitter', 'url' => '#'],
                    ['platform' => 'instagram', 'url' => '#'],
                    ['platform' => 'linkedin', 'url' => '#'],
                ]
            ]);
            try {
                $indrabella->addMediaFromUrl('https://bka.umri.ac.id/wp-content/uploads/2025/03/Indra-Bela-768x806.jpg')->toMediaCollection('foto');
            } catch (\Exception $e) {}
        });
    }
}
