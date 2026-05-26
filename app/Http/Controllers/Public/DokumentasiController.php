<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Album;
use App\Models\KategoriDokumentasi;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DokumentasiController extends Controller
{
    /**
     * Display a listing of public albums.
     */
    public function index(Request $request): Response
    {
        $search = $request->query('search');
        $category = $request->query('category');

        $query = Album::with(['kategori', 'fotos'])->latest();

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('judul', 'like', "%{$search}%")
                  ->orWhere('deskripsi', 'like', "%{$search}%");
            });
        }

        if (!empty($category) && $category !== 'Semua') {
            $query->whereHas('kategori', function ($q) use ($category) {
                $q->where('nama', $category);
            });
        }

        $albums = $query->paginate(12)
            ->withQueryString()
            ->through(function ($item) {
                return [
                    'judul' => $item->judul,
                    'slug' => $item->slug,
                    'cover_url' => $item->getFirstMediaUrl('cover') ?: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80',
                    'tanggal_kegiatan' => $item->tanggal_kegiatan ? $item->tanggal_kegiatan->format('Y-m-d') : $item->created_at->format('Y-m-d'),
                    'jumlah_foto' => $item->fotos->count(),
                    'deskripsi' => $item->deskripsi,
                    'kategori' => $item->kategori ? $item->kategori->nama : 'Tanpa Kategori',
                ];
            });

        $categories = KategoriDokumentasi::orderBy('nama')
            ->get()
            ->map(function ($cat) {
                return $cat->nama;
            })
            ->toArray();

        return Inertia::render('public/dokumentasi/index', [
            'albums' => $albums,
            'categories' => $categories,
            'filters' => [
                'search' => $search ?? '',
                'category' => $category ?? 'Semua',
            ]
        ]);
    }

    /**
     * Display the specified album.
     */
    public function show(string $slug): Response
    {
        $item = Album::with(['kategori', 'fotos' => function ($query) {
                $query->orderBy('urutan');
            }])
            ->where('slug', $slug)
            ->firstOrFail();

        $album = [
            'judul' => $item->judul,
            'slug' => $item->slug,
            'deskripsi' => $item->deskripsi,
            'tanggal_kegiatan' => $item->tanggal_kegiatan ? $item->tanggal_kegiatan->format('Y-m-d') : $item->created_at->format('Y-m-d'),
            'kategori' => $item->kategori ? $item->kategori->nama : 'Tanpa Kategori',
            'fotos' => $item->fotos->map(function ($foto) {
                return [
                    'url' => $foto->getFirstMediaUrl('foto'),
                    'caption' => '',
                ];
            })->toArray(),
        ];

        return Inertia::render('public/dokumentasi/show', [
            'album' => $album,
        ]);
    }
}
