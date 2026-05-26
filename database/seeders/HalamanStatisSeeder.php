<?php

namespace Database\Seeders;

use App\Models\HalamanStatis;
use Illuminate\Database\Seeder;

class HalamanStatisSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        HalamanStatis::updateOrCreate(
            ['slug' => 'tentang-kami'],
            [
                'judul' => 'Tentang Kami',
                'konten' => '<h3>Profil BKA</h3><p>Biro Keuangan dan Aset (BKA) Universitas Muhammadiyah Riau didirikan untuk menyelenggarakan administrasi keuangan dan aset secara profesional, transparan, dan akuntabel di lingkungan universitas.</p>',
            ]
        );

        HalamanStatis::updateOrCreate(
            ['slug' => 'visi-misi'],
            [
                'judul' => 'Visi & Misi',
                'konten' => 'Menjadi penyelenggara administrasi keuangan dan pengelolaan aset yang unggul, terpercaya, transparan, dan akuntabel berbasis digitalisasi layanan demi mendukung Universitas Muhammadiyah Riau yang cerdas, inovatif, dan berkemajuan pada tahun 2028.',
            ]
        );

        $misiItems = [
            'Menyelenggarakan sistem perencanaan, penganggaran, dan pengendalian keuangan yang efisien, transparan, dan akuntabel.',
            'Mengembangkan digitalisasi administrasi layanan keuangan terintegrasi guna memberikan kemudahan pelayanan terbaik bagi seluruh mahasiswa dan civitas akademika.',
            'Melaksanakan penataan, pembukuan, dan pelaporan sarana, prasarana, serta aset fisik universitas secara profesional dan akurat.',
            'Mengoptimalkan pemanfaatan dan produktivitas aset fisik maupun finansial kampus untuk keberlangsungan finansial universitas yang mandiri.',
            'Membina kualitas sumber daya manusia pengelola keuangan dan logistik yang berintegritas tinggi, kompeten, dan memegang teguh nilai-nilai Al-Islam Kemuhammadiyahan.',
        ];

        foreach ($misiItems as $index => $isi) {
            \App\Models\Misi::firstOrCreate(
                ['isi' => $isi],
                ['urutan' => $index + 1]
            );
        }
    }
}
