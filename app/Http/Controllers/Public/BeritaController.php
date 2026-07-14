<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Berita;
use App\Models\KategoriBerita;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Str;

class BeritaController extends Controller
{
    /**
     * Display a listing of public news articles.
     */
    public function index(Request $request): Response
    {
        $search = $request->query('search');
        $kategori = $request->query('kategori');
        $bidang = $request->query('bidang');

        $query = Berita::with(['kategori', 'penulis', 'bidang'])
            ->terpublikasi()
            ->terbaru();

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('judul', 'like', "%{$search}%")
                  ->orWhere('isi', 'like', "%{$search}%");
            });
        }

        if (!empty($kategori) && $kategori !== 'Semua') {
            $query->whereHas('kategori', function ($q) use ($kategori) {
                $q->where('nama', $kategori);
            });
        }

        if (!empty($bidang) && $bidang !== 'Semua') {
            if ($bidang === 'Umum') {
                $query->whereNull('bidang_id');
            } else {
                $query->whereHas('bidang', function ($q) use ($bidang) {
                    $q->where('nama', 'like', "%{$bidang}%");
                });
            }
        }

        $beritas = $query->paginate(9)
            ->withQueryString()
            ->through(function ($item) {
                return [
                    'id' => $item->id,
                    'slug' => $item->slug,
                    'thumbnail' => $item->getFirstMediaUrl('thumbnail', 'thumb') ?: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80',
                    'category' => $item->kategori ? $item->kategori->nama : 'Tanpa Kategori',
                    'bidang' => $item->bidang ? (str_contains($item->bidang->nama, 'Keuangan') ? 'Keuangan' : (str_contains($item->bidang->nama, 'Aset') ? 'Aset' : $item->bidang->nama)) : 'Umum',
                    'title' => $item->judul,
                    'excerpt' => Str::limit(strip_tags($item->isi), 160),
                    'date' => $item->tanggal_publikasi ? $item->tanggal_publikasi->format('Y-m-d') : $item->created_at->format('Y-m-d'),
                    'author' => $item->penulis ? ($item->penulis->name === 'Super Admin' ? 'Administrator' : $item->penulis->name) : 'Admin BKA',
                ];
            });

        $categories = cache()->remember('kategori_beritas', 3600, function () {
            return array_merge(['Semua'], KategoriBerita::orderBy('nama')->pluck('nama')->toArray());
        });

        $bidangs = cache()->remember('public_bidangs_list', 3600, function () {
            $names = \App\Models\Bidang::orderBy('urutan')->pluck('nama')->map(function ($nama) {
                if (str_contains($nama, 'Keuangan')) return 'Keuangan';
                if (str_contains($nama, 'Aset')) return 'Aset';
                return $nama;
            })->toArray();
            return array_merge(['Semua', 'Umum'], $names);
        });

        return Inertia::render('public/berita/index', [
            'beritas' => $beritas,
            'categories' => $categories,
            'bidangs' => $bidangs,
            'filters' => [
                'search' => $search ?? '',
                'kategori' => $kategori ?? 'Semua',
                'bidang' => $bidang ?? 'Semua',
            ]
        ]);
    }

    /**
     * Display the specified news article.
     */
    public function show(string $slug): Response
    {
        $item = Berita::with(['kategori', 'penulis', 'bidang'])
            ->terpublikasi()
            ->where('slug', $slug)
            ->firstOrFail();

        $berita = [
            'slug' => $item->slug,
            'thumbnail' => $item->getFirstMediaUrl('thumbnail') ?: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80',
            'category' => $item->kategori ? $item->kategori->nama : 'Tanpa Kategori',
            'bidang' => $item->bidang ? (str_contains($item->bidang->nama, 'Keuangan') ? 'Keuangan' : (str_contains($item->bidang->nama, 'Aset') ? 'Aset' : $item->bidang->nama)) : 'Umum',
            'title' => $item->judul,
            'date' => $item->tanggal_publikasi ? $item->tanggal_publikasi->format('Y-m-d') : $item->created_at->format('Y-m-d'),
            'author' => $item->penulis ? ($item->penulis->name === 'Super Admin' ? 'Administrator' : $item->penulis->name) : 'Admin BKA',
            'content' => $item->isi,
        ];

        return Inertia::render('public/berita/show', [
            'berita' => $berita,
        ]);
    }
}
