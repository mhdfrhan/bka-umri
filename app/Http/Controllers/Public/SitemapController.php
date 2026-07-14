<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Berita;
use App\Models\Pengumuman;
use App\Models\Album;
use App\Models\Bidang;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\URL;

class SitemapController extends Controller
{
    /**
     * Generate the sitemap XML.
     *
     * @return Response
     */
    public function index(): Response
    {
        $urls = [];

        // Halaman Statis / Static Pages
        $staticPages = [
            'home' => ['priority' => '1.0', 'changefreq' => 'daily'],
            'public.profil.tentang' => ['priority' => '0.8', 'changefreq' => 'monthly'],
            'public.profil.visi-misi' => ['priority' => '0.8', 'changefreq' => 'monthly'],
            'public.profil.struktur' => ['priority' => '0.8', 'changefreq' => 'monthly'],
            'public.berita.index' => ['priority' => '0.9', 'changefreq' => 'daily'],
            'public.pengumuman.index' => ['priority' => '0.9', 'changefreq' => 'daily'],
            'public.dokumentasi.index' => ['priority' => '0.8', 'changefreq' => 'weekly'],
            'public.lampiran.index' => ['priority' => '0.8', 'changefreq' => 'weekly'],
            'public.kontak.index' => ['priority' => '0.8', 'changefreq' => 'monthly'],
        ];

        foreach ($staticPages as $route => $config) {
            $urls[] = [
                'loc' => route($route),
                'lastmod' => now()->startOfDay()->toAtomString(),
                'changefreq' => $config['changefreq'],
                'priority' => $config['priority'],
            ];
        }

        // Berita (News)
        $beritas = Berita::where('status', 'published')
            ->where('tanggal_publikasi', '<=', now())
            ->orderBy('tanggal_publikasi', 'desc')
            ->get();

        foreach ($beritas as $berita) {
            $urls[] = [
                'loc' => route('public.berita.show', $berita->slug),
                'lastmod' => $berita->updated_at->toAtomString(),
                'changefreq' => 'weekly',
                'priority' => '0.7',
            ];
        }

        // Pengumuman (Announcements)
        $pengumumans = Pengumuman::where('status', 'published')
            ->where('tanggal_publikasi', '<=', now())
            ->orderBy('tanggal_publikasi', 'desc')
            ->get();

        foreach ($pengumumans as $pengumuman) {
            $urls[] = [
                'loc' => route('public.pengumuman.show', $pengumuman->slug),
                'lastmod' => $pengumuman->updated_at->toAtomString(),
                'changefreq' => 'weekly',
                'priority' => '0.7',
            ];
        }

        // Dokumentasi (Albums)
        $albums = Album::orderBy('tanggal_kegiatan', 'desc')->get();

        foreach ($albums as $album) {
            $urls[] = [
                'loc' => route('public.dokumentasi.show', $album->slug),
                'lastmod' => $album->updated_at->toAtomString(),
                'changefreq' => 'monthly',
                'priority' => '0.6',
            ];
        }

        // Bidang (Departments/Sections)
        if (\Illuminate\Support\Facades\Schema::hasTable('bidangs')) {
            $bidangs = Bidang::all();
            foreach ($bidangs as $bidang) {
                if ($bidang->slug) {
                    $urls[] = [
                        'loc' => route('public.bidang.show', $bidang->slug),
                        'lastmod' => $bidang->updated_at->toAtomString(),
                        'changefreq' => 'monthly',
                        'priority' => '0.8',
                    ];
                }
            }
        }

        $xml = view('public.sitemap', compact('urls'))->render();

        return response($xml, 200, [
            'Content-Type' => 'text/xml'
        ]);
    }
}
