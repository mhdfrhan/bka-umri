<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Models\KepalaBiro;
use App\Models\Bidang;
use App\Models\Layanan;
use App\Models\Statistik;
use App\Models\Pengaturan;
use App\Models\Berita;
use App\Models\Pengumuman;
use App\Models\Album;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    /**
     * Display the public homepage.
     */
    public function index(): Response
    {
        $data = cache()->remember('beranda_data', 1800, function () {
            // 1. Banners
            $banners = Banner::where('is_active', true)
                ->orderBy('urutan')
                ->get()
                ->map(function ($banner) {
                    return [
                        'id' => $banner->id,
                        'image' => $banner->getFirstMediaUrl('gambar', 'display') ?: '',
                        'title' => $banner->judul,
                        'description' => $banner->deskripsi ?? '',
                        'ctaText' => $banner->teks_tombol ?? '',
                        'ctaHref' => $banner->tautan_tombol ?? '',
                    ];
                })
                ->toArray();

            // 2. Kepala Biro
            $kepalaBiroModel = KepalaBiro::first();
            $kepalaBiro = $kepalaBiroModel ? [
                'nama' => $kepalaBiroModel->nama,
                'jabatan' => $kepalaBiroModel->jabatan,
                'periode' => $kepalaBiroModel->periode,
                'foto' => $kepalaBiroModel->getFirstMediaUrl('foto', 'display') ?: '',
                'sambutan' => $kepalaBiroModel->sambutan,
            ] : null;

            // 3. Bidang BKA
            $bidangs = Bidang::orderBy('urutan')
                ->get()
                ->map(function ($bid) {
                    return [
                        'slug' => $bid->slug,
                        'nama' => $bid->nama,
                        'deskripsiSingkat' => $bid->deskripsi_singkat,
                    ];
                })
                ->toArray();

            // 4. Layanan BKA Settings & Items
            $layananSection = [
                'judul_section' => Pengaturan::getValue('layanan_judul_section', 'Kemudahan Layanan Finansial & Administrasi'),
                'deskripsi_section' => Pengaturan::getValue('layanan_deskripsi_section', 'BKA memahami kemudahan transaksi adalah kunci kenyamanan akademik. Kami memfasilitasi berbagai bentuk kemudahan administrasi berikut.'),
                'youtube_url' => Pengaturan::getValue('layanan_youtube_url', 'https://www.youtube.com/embed/4SI1Q-JkVm8?si=aSmMt81oihsA4yLQ'),
            ];

            $layananItems = Layanan::orderBy('urutan')
                ->get()
                ->map(function ($lay) {
                    return [
                        'icon' => $lay->ikon ?? 'CheckCircle2',
                        'title' => $lay->judul,
                        'description' => $lay->deskripsi,
                    ];
                })
                ->toArray();

            $layanan = array_merge($layananSection, ['items' => $layananItems]);

            // 5. Statistik Kelembagaan
            $stats = Statistik::orderBy('urutan')
                ->get()
                ->map(function ($stat) {
                    return [
                        'icon' => $stat->ikon ?? 'Award',
                        'value' => $stat->angka,
                        'label' => $stat->label,
                    ];
                })
                ->toArray();

            // 6. Latest News (Limit 3, status terpublikasi if model scope is available, or latest)
            $beritaQuery = Berita::query();
            if (method_exists(Berita::class, 'scopeTerpublikasi')) {
                $beritaQuery->terpublikasi();
            } else {
                $beritaQuery->where('status', 'terpublikasi');
            }
            $beritaTerbaru = $beritaQuery->latest()
                ->limit(5)
                ->get()
                ->map(function ($news) {
                    return [
                        'slug' => $news->slug,
                        'thumbnail' => $news->getFirstMediaUrl('thumbnail', 'thumb') ?: '',
                        'category' => $news->kategori?->nama ?? 'Layanan',
                        'title' => $news->judul,
                        'excerpt' => strip_tags(substr($news->isi, 0, 150)) . '...',
                        'date' => $news->tanggal_publikasi ? $news->tanggal_publikasi->format('Y-m-d') : $news->created_at->format('Y-m-d'),
                        'author' => $news->penulis?->name ?? 'Admin BKA',
                    ];
                })
                ->toArray();

            // 7. Latest Announcements (Limit 3, status terpublikasi if model scope is available, or latest)
            $pengumumanQuery = Pengumuman::query();
            if (method_exists(Pengumuman::class, 'scopeTerpublikasi')) {
                $pengumumanQuery->terpublikasi();
            } else {
                $pengumumanQuery->where('status', 'terpublikasi');
            }
            $pengumumanTerbaru = $pengumumanQuery->pentingFirst()
                ->limit(3)
                ->get()
                ->map(function ($ann) {
                    return [
                        'slug' => $ann->slug,
                        'title' => $ann->judul,
                        'date' => $ann->tanggal_publikasi ? $ann->tanggal_publikasi->format('Y-m-d') : $ann->created_at->format('Y-m-d'),
                        'isPenting' => (bool)$ann->is_penting,
                        'excerpt' => strip_tags(substr($ann->isi, 0, 120)) . '...',
                    ];
                })
                ->toArray();

            // 8. Galeri Dokumentasi (Album Covers & Photos)
            $albumCount = Album::count();
            $galeriTerbaru = [];

            if ($albumCount < 5) {
                // Ambil album beserta isian foto-fotonya
                $albums = Album::with('fotos')->latest()->get();
                foreach ($albums as $album) {
                    // Tambahkan cover utama
                    $galeriTerbaru[] = [
                        'src' => $album->getFirstMediaUrl('cover') ?: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&q=80',
                        'title' => $album->judul,
                    ];
                    // Tambahkan isi foto-foto dari album tersebut
                    foreach ($album->fotos as $foto) {
                        $url = $foto->getFirstMediaUrl('foto');
                        if ($url) {
                            $galeriTerbaru[] = [
                                'src' => $url,
                                'title' => $album->judul . ' - Dokumentasi',
                            ];
                        }
                    }
                }
            } else {
                // Jika album >= 5, hanya ambil cover dari 8 album terbaru
                $albums = Album::latest()->limit(8)->get();
                foreach ($albums as $album) {
                    $galeriTerbaru[] = [
                        'src' => $album->getFirstMediaUrl('cover') ?: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&q=80',
                        'title' => $album->judul,
                    ];
                }
            }

            // Pastikan tidak ada array yang src-nya kosong
            $galeriTerbaru = array_values(array_filter($galeriTerbaru, function($img) {
                return !empty($img['src']);
            }));

            return [
                'banners' => $banners,
                'kepalaBiro' => $kepalaBiro,
                'bidangs' => $bidangs,
                'layanan' => $layanan,
                'stats' => $stats,
                'beritaTerbaru' => $beritaTerbaru,
                'pengumumanTerbaru' => $pengumumanTerbaru,
                'galeriTerbaru' => $galeriTerbaru,
            ];
        });

        if (!empty($data['banners'])) {
            \Illuminate\Support\Facades\View::share('first_banner_image', $data['banners'][0]['image']);
        }

        return Inertia::render('public/home', $data);
    }
}
