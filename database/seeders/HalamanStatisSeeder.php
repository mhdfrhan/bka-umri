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
                'konten' => '<h3>Profil BKA</h3><p>Biro Administrasi Keuangan dan Aset (BKA) Universitas Muhammadiyah Riau merupakan unit strategis yang didirikan untuk menyelenggarakan pengelolaan tata administrasi keuangan serta perancangan aset secara profesional, transparan, dan akuntabel di lingkungan universitas. Sebagai salah satu pilar penopang unit vital operasional kampus, BKA bertugas merencanakan anggaran, mengendalikan arus kas, dan melaporkan seluruh aktivitas finansial serta memastikan pemeliharaan, optimalisasi sarana, dan prasarana universitas guna menunjang keberhasilan pelaksanaan tridharma perguruan tinggi secara komprehensif.</p><p>Dalam menjalankan berbagai fungsinya, Biro Administrasi Keuangan dan Aset memiliki komitmen untuk terus melakukan transformasi digitalisasi pelayanan keuangan dan perbendaharaan terintegrasi yang berkelanjutan. Implementasi sistem cerdas ditujukan guna memberikan kemudahan operasional, serta layanan terbaik, cepat, efisien, dan presisi bagi seluruh sivitas akademika, baik itu mahasiswa, tenaga pendidik, tenaga kependidikan, serta elemen mitra kerja institusi lainnya secara luas.</p><p>BKA juga senantiasa berinovasi dalam menguatkan regulasi serta standard operating procedures (SOP) internal di bidang kebendaharaan agar selaras dengan ketetapan Majelis Diktilitbang PP Muhammadiyah dan kementerian terkait. Hal ini demi merealisasikan target-target besar rencana strategis UMRI dan visi jangka panjang kampus yang unggul, berkemajuan, serta berdaya saing global pada tingkat nasional maupun internasional.</p>',
            ]
        );

        HalamanStatis::updateOrCreate(
            ['slug' => 'visi-misi'],
            [
                'judul' => 'Visi & Misi',
                'konten' => '<p>Menjadikan Universitas Muhammadiyah Riau sebagai lembaga pendidikan yang bermarwah dan bermartabat dalam menghasilkan sumber daya manusia yang menguasai IPTEK berlandaskan IMTAQ tahun 2030.</p><p style="margin-top: 1.5rem;">Motto: UMRI BERMARWAH DAN BERMARTABAT 2030</p>',
            ]
        );

        // Clear existing missions to avoid duplication
        \App\Models\Misi::query()->delete();

        $misiItems = [
            'Mewujudkan keunggulan bidang pendidikan, pengajaran, penelitian, pengabdian kepada masyarakat dan Al-Islam Kemuhammadiyahan.',
            'Menguasai dan memanfaatkan Ilmu Pengetahuan dan Teknologi dalam pendidikan, pengajaran, penelitian, pengabdian kepada masyarakat dan Al-Islam Kemuhammadiyahan.',
            'Menyelenggarakan pendidikan, pengajaran, penelitian, pengabdian kepada masyarakat yang dilandasi etika, nilai dan moral Islami.',
            'Menciptakan iklim kondusif untuk tumbuh dan berkembangnya budaya mutu, pengembangan IPTEK dan implementasi iman dan taqwa.',
        ];

        foreach ($misiItems as $index => $isi) {
            \App\Models\Misi::create([
                'isi' => $isi,
                'urutan' => $index + 1,
            ]);
        }
    }
}
