<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\KategoriLampiran;
use App\Models\Lampiran;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class LampiranController extends Controller
{
    /**
     * Display a listing of categories.
     */
    public function index(): Response
    {
        $kategoriLampirans = cache()->remember('kategori_lampirans_root', 3600, function () {
            return KategoriLampiran::whereNull('parent_id')->orderBy('urutan', 'asc')->get()->map(function ($cat) {
                return [
                    'nama' => $cat->nama,
                    'slug' => $cat->slug,
                    'deskripsi' => $cat->deskripsi ?: '',
                    'jumlah_berkas' => $cat->lampirans()->count(),
                ];
            })->toArray();
        });

        return Inertia::render('public/lampiran/index', [
            'kategoriLampirans' => $kategoriLampirans,
        ]);
    }

    /**
     * Display the specified category and its documents.
     */
    public function show(string $slug): Response
    {
        $category = KategoriLampiran::where('slug', $slug)->firstOrFail();

        $kategori = [
            'nama' => $category->nama,
            'slug' => $category->slug,
            'deskripsi' => $category->deskripsi ?: '',
        ];

        $berkas = $category->lampirans()->orderBy('urutan', 'asc')->latest()->get()->map(function ($item) {
            $media = $item->getFirstMedia('berkas');
            return [
                'id' => (string)$item->id,
                'nama_tampilan' => $item->nama_tampilan,
                'deskripsi' => $item->deskripsi ?: '',
                'tipe_file' => strtolower(pathinfo($media?->file_name, PATHINFO_EXTENSION) ?: 'pdf'),
                'ukuran' => (int)($media?->size ?: 0),
                'tanggal_upload' => $item->created_at->format('Y-m-d'),
                'download_url' => $media?->getUrl() ?: '',
                'urutan' => (int)$item->urutan,
            ];
        });

        $subcategories = $category->children()->orderBy('urutan', 'asc')->get()->map(function ($cat) {
            return [
                'nama' => $cat->nama,
                'slug' => $cat->slug,
                'deskripsi' => $cat->deskripsi ?: '',
                'jumlah_berkas' => $cat->lampirans()->count(),
                'urutan' => (int)$cat->urutan,
            ];
        });

        return Inertia::render('public/lampiran/kategori', [
            'kategori' => $kategori,
            'berkas' => $berkas,
            'subcategories' => $subcategories,
        ]);
    }

    /**
     * Download the specified document.
     */
    public function download(string $id)
    {
        $lampiran = Lampiran::findOrFail($id);
        $media = $lampiran->getFirstMedia('berkas');

        if (!$media) {
            abort(404, 'Berkas tidak ditemukan.');
        }

        return redirect($media->getUrl());
    }
}
