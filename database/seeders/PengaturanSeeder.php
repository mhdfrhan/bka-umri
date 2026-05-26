<?php

namespace Database\Seeders;

use App\Models\Pengaturan;
use Illuminate\Database\Seeder;

class PengaturanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            'nama_website' => 'Biro Keuangan & Aset UMRI',
            'deskripsi_seo' => 'Portal Resmi Biro Keuangan dan Aset Universitas Muhammadiyah Riau - Pelayanan SPP Online, Surat Dispensasi, SOP, dan Informasi Keuangan Kampus.',
            'alamat' => "Ruang Biro Keuangan dan Aset, Gedung Rektorat Universitas Muhammadiyah Riau\nJl. T. Tambusai, Kota Pekanbaru",
            'telepon' => '+62 761 35008 / +62 811-7676-000',
            'email' => 'bka@umri.ac.id',
            'jam_operasional' => "Sen - Jum : 08.00 - 16.00 WIB\nSabtu : 08.00 - 13.00 WIB",
            'google_maps_embed' => 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d997.4167965592992!2d101.41546138047615!3d0.49870495320004715!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31d5a940e01df989%3A0xdc96c279c6f07bc3!2sUniversitas%20Muhammadiyah%20Riau!5e0!3m2!1sid!2sid!4v1779673086975!5m2!1sid!2sid',
            'media_sosial' => json_encode([
                ['platform' => 'Facebook', 'url' => 'https://facebook.com/umri.official'],
                ['platform' => 'Instagram', 'url' => 'https://instagram.com/umri.official'],
                ['platform' => 'YouTube', 'url' => 'https://youtube.com'],
                ['platform' => 'Twitter', 'url' => 'https://twitter.com']
            ]),
            'logo_base64' => null,
            'favicon_base64' => null,
        ];

        foreach ($settings as $key => $value) {
            Pengaturan::updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }
    }
}
