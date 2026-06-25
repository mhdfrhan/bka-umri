<?php

namespace Database\Seeders;

use App\Models\Banner;
use App\Models\KepalaBiro;
use App\Models\Statistik;
use App\Models\Layanan;
use App\Models\Pengaturan;
use Illuminate\Database\Seeder;

class BerandaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Seed Banners
        $banners = [
            [
                'judul' => 'Biro Keuangan & Aset UMRI',
                'deskripsi' => 'Mengelola keuangan dan aset secara transparan, akuntabel, dan profesional demi kemajuan civitas akademika Universitas Muhammadiyah Riau.',
                'teks_tombol' => 'Layanan Mahasiswa',
                'tautan_tombol' => '#layanan-bka',
                'img_url' => 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800',
            ],
            [
                'judul' => 'Transformasi Layanan Keuangan Digital',
                'deskripsi' => 'Kemudahan pembayaran uang kuliah dan administrasi civitas akademika melalui integrasi sistem online yang handal dan aman.',
                'teks_tombol' => 'Panduan Pembayaran',
                'tautan_tombol' => '#pengumuman-terbaru',
                'img_url' => 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800',
            ],
            [
                'judul' => 'Sinergi & Akuntabilitas Aset',
                'deskripsi' => 'Mengoptimalkan pemanfaatan dan pencatatan aset universitas secara sistematis guna mendukung sarana prasarana perkuliahan yang unggul.',
                'teks_tombol' => 'Profil BKA',
                'tautan_tombol' => '/profil/tentang-kami',
                'img_url' => 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=800',
            ],
        ];

        foreach ($banners as $index => $b) {
            $banner = Banner::updateOrCreate(
                ['judul' => $b['judul']],
                [
                    'deskripsi' => $b['deskripsi'],
                    'teks_tombol' => $b['teks_tombol'],
                    'tautan_tombol' => $b['tautan_tombol'],
                    'urutan' => $index + 1,
                    'is_active' => true,
                ]
            );

            // Add media if empty
            if ($banner->getMedia('gambar')->isEmpty()) {
                try {
                    $banner->addMediaFromUrl($b['img_url'])->toMediaCollection('gambar');
                } catch (\Exception $e) {
                    // Ignore internet/fetch issues in seeder
                }
            }
        }

        // 2. Seed Kepala Biro
        KepalaBiro::query()->each(function ($kb) {
            $kb->clearMediaCollection('foto');
            $kb->delete();
        });

        $kepalaBiro = KepalaBiro::create([
            'nama' => 'Rahmawita, SE',
            'jabatan' => 'Kepala Biro Administrasi Keuangan dan Aset',
            'periode' => 'Periode 2024 - 2028',
            'sambutan' => "Assalam’alaikum Warahmatullah Wabarokatuh.\n\nKehadiran website Biro Keuangan dan Aset Universitas Muhammadiyah Riau memiliki peran yang sangat penting sebagai sarana informasi yang transparan dan terpercaya, khususnya dalam hal keuangan dan aset perguruan tinggi. Dengan adanya website ini, kami berkomitmen untuk memberikan akses yang mudah dan cepat bagi seluruh stakeholder, mulai dari mahasiswa, dosen, hingga pihak-pihak terkait lainnya, dalam memperoleh informasi yang relevan dan up-to-date mengenai pengelolaan keuangan dan aset kampus.\n\nWebsite ini juga menjadi wadah untuk meningkatkan akuntabilitas dan transparansi dalam pengelolaan sumber daya yang ada di perguruan tinggi. Sebagai lembaga pendidikan, kami percaya bahwa akses informasi yang terbuka dan jelas akan memperkuat kepercayaan dan kolaborasi antara seluruh pihak. Melalui platform ini, diharapkan seluruh komunitas akademik dapat lebih mudah memahami bagaimana pengelolaan dana dan aset dilakukan secara efektif dan efisien demi kemajuan bersama.",
        ]);

        if ($kepalaBiro->getMedia('foto')->isEmpty()) {
            try {
                $kepalaBiro->addMediaFromUrl('https://smart.umri.ac.id/application/modules/personalia/assets/uploads/foto/f405f-rahmawita-se.jpg')
                    ->toMediaCollection('foto');
            } catch (\Exception $e) {
                // Ignore
            }
        }

        // 3. Seed Statistik
        $stats = [
            ['angka' => '2015', 'label' => 'Tahun Berdiri', 'ikon' => 'Building2'],
            ['angka' => '25+', 'label' => 'Staf Berpengalaman', 'ikon' => 'Users'],
            ['angka' => '40+', 'label' => 'Unit Kerja Dilayani', 'ikon' => 'Award'],
            ['angka' => '1.000+', 'label' => 'Dokumen Dikelola', 'ikon' => 'BookOpen'],
        ];

        foreach ($stats as $index => $s) {
            Statistik::updateOrCreate(
                ['label' => $s['label']],
                [
                    'angka' => $s['angka'],
                    'ikon' => $s['ikon'],
                    'urutan' => $index + 1,
                ]
            );
        }

        // 4. Seed Layanan BKA
        $layanans = [
            [
                'judul' => 'Sistemasi Administrasi Keuangan',
                'deskripsi' => 'Kepengurusan pembayaran tidak perlu membawa kertas/berkas lagi, semua sudah tercatat dalam sistem online.',
                'ikon' => 'CheckCircle2',
            ],
            [
                'judul' => 'Pembayaran Uang Kuliah Online Maupun Di Kampus',
                'deskripsi' => 'Kami memberi keleluasaan pembayaran instan via online maupun langsung datang ke kampus melalui teller Bank rekanan.',
                'ikon' => 'CreditCard',
            ],
            [
                'judul' => 'Pilihan Bank Rekanan',
                'deskripsi' => 'Pembayaran online bisa dibayarkan melalui banyak pilihan bank rekanan yang tersebar di pelosok daerah.',
                'ikon' => 'Landmark',
            ],
        ];

        foreach ($layanans as $index => $l) {
            Layanan::updateOrCreate(
                ['judul' => $l['judul']],
                [
                    'deskripsi' => $l['deskripsi'],
                    'ikon' => $l['ikon'],
                    'urutan' => $index + 1,
                ]
            );
        }

        // Global settings for Layanan section
        Pengaturan::setValue('layanan_judul_section', 'Kemudahan Layanan Finansial & Administrasi');
        Pengaturan::setValue('layanan_deskripsi_section', 'BKA memahami kemudahan transaksi adalah kunci kenyamanan akademik. Kami memfasilitasi berbagai bentuk kemudahan administrasi berikut.');
        Pengaturan::setValue('layanan_youtube_url', 'https://www.youtube.com/embed/4SI1Q-JkVm8?si=aSmMt81oihsA4yLQ');
    }
}
