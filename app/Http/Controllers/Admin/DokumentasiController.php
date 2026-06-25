<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Album;
use App\Models\Foto;
use App\Models\KategoriDokumentasi;
use App\Services\MediaUploadHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Str;

class DokumentasiController extends Controller
{
    /**
     * Display a listing of albums.
     */
    public function index(Request $request): Response
    {
        $query = Album::with(['kategori', 'fotos'])->latest();

        if ($request->has('trashed') && $request->trashed === 'true') {
            $query->onlyTrashed();
        }

        $albums = $query->get()->map(function ($item) {
                return [
                    'id' => $item->id,
                    'title' => $item->judul,
                    'slug' => $item->slug,
                    'description' => $item->deskripsi,
                    'date' => $item->tanggal_kegiatan ? $item->tanggal_kegiatan->format('Y-m-d') : $item->created_at->format('Y-m-d'),
                    'category' => $item->kategori ? $item->kategori->nama : 'Tanpa Kategori',
                    'coverUrl' => $item->getFirstMediaUrl('cover') ?: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&q=80',
                    'photos' => $item->fotos->map(function ($foto) {
                        return [
                            'id' => (string)$foto->id,
                            'url' => $foto->getFirstMediaUrl('foto'),
                            'order' => $foto->urutan,
                        ];
                    })->toArray(),
                    'deleted_at' => $item->deleted_at,
                ];
            });

        $categories = KategoriDokumentasi::orderBy('nama')
            ->get()
            ->map(function ($cat) {
                return $cat->nama;
            })
            ->toArray();

        // Get categories with their ID to make deleting easier
        $categoriesWithId = KategoriDokumentasi::orderBy('nama')
            ->get()
            ->map(function ($cat) {
                return [
                    'id' => $cat->id,
                    'nama' => $cat->nama,
                ];
            });

        return Inertia::render('admin/dokumentasi/index', [
            'albums' => $albums,
            'categories' => $categories,
            'categoriesWithId' => $categoriesWithId,
        ]);
    }

    /**
     * Show the form for creating a new album.
     */
    public function create(): Response
    {
        $categories = KategoriDokumentasi::orderBy('nama')
            ->get()
            ->map(function ($cat) {
                return $cat->nama;
            })
            ->toArray();

        return Inertia::render('admin/dokumentasi/create', [
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created album.
     */
    public function store(Request $request)
    {
        $request->validate([
            'judul' => 'required|string|min:5|max:150',
            'slug' => 'required|string|max:170|unique:albums,slug|regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
            'deskripsi' => 'nullable|string|max:500',
            'tanggal_kegiatan' => 'required|date',
            'kategori' => 'required|string',
            'coverUrl' => 'nullable|string',
        ]);

        DB::transaction(function () use ($request) {
            $kategoriId = null;
            if ($request->kategori !== 'Tanpa Kategori' && !empty($request->kategori)) {
                $kat = KategoriDokumentasi::where('nama', $request->kategori)->first();
                if ($kat) {
                    $kategoriId = $kat->id;
                }
            }

            $album = Album::create([
                'judul' => $request->judul,
                'slug' => $request->slug,
                'deskripsi' => $request->deskripsi,
                'tanggal_kegiatan' => $request->tanggal_kegiatan,
                'kategori_dokumentasi_id' => $kategoriId,
            ]);

            if (!empty($request->coverUrl)) {
                MediaUploadHelper::addFromDataOrUrl($album, $request->coverUrl, 'cover', 'album-cover');
            }
        });

        return redirect()->route('admin.dokumentasi.index')->with('success', 'Album baru berhasil dibuat.');
    }

    /**
     * Show the form for editing.
     */
    public function edit($id): Response
    {
        $item = Album::with('fotos')->findOrFail($id);

        $categories = KategoriDokumentasi::orderBy('nama')
            ->get()
            ->map(function ($cat) {
                return $cat->nama;
            })
            ->toArray();

        $album = [
            'id' => $item->id,
            'title' => $item->judul,
            'slug' => $item->slug,
            'description' => $item->deskripsi,
            'date' => $item->tanggal_kegiatan ? $item->tanggal_kegiatan->format('Y-m-d') : $item->created_at->format('Y-m-d'),
            'category' => $item->kategori ? $item->kategori->nama : 'Tanpa Kategori',
            'coverUrl' => $item->getFirstMediaUrl('cover') ?: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&q=80',
            'photos' => $item->fotos->map(function ($foto) {
                return [
                    'id' => (string)$foto->id,
                    'url' => $foto->getFirstMediaUrl('foto'),
                    'order' => $foto->urutan,
                ];
            })->toArray(),
        ];

        return Inertia::render('admin/dokumentasi/edit', [
            'album' => $album,
            'categories' => $categories,
        ]);
    }

    /**
     * Update the album.
     */
    public function update(Request $request, $id)
    {
        $album = Album::findOrFail($id);

        $request->validate([
            'judul' => 'required|string|min:5|max:150',
            'slug' => 'required|string|max:170|unique:albums,slug,' . $id . '|regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
            'deskripsi' => 'nullable|string|max:500',
            'tanggal_kegiatan' => 'required|date',
            'kategori' => 'required|string',
            'coverUrl' => 'nullable|string',
            'photos' => 'present|array',
            'photos.*.id' => 'required|string',
            'photos.*.url' => 'required|string',
            'photos.*.order' => 'required|integer',
        ]);

        DB::transaction(function () use ($request, $album) {
            $kategoriId = null;
            if ($request->kategori !== 'Tanpa Kategori' && !empty($request->kategori)) {
                $kat = KategoriDokumentasi::where('nama', $request->kategori)->first();
                if ($kat) {
                    $kategoriId = $kat->id;
                }
            }

            $album->update([
                'judul' => $request->judul,
                'slug' => $request->slug,
                'deskripsi' => $request->deskripsi,
                'tanggal_kegiatan' => $request->tanggal_kegiatan,
                'kategori_dokumentasi_id' => $kategoriId,
            ]);

            // Sync cover image
            if (!empty($request->coverUrl)) {
                $coverUrl = $request->coverUrl;
                $currentCoverUrl = $album->getFirstMediaUrl('cover');

                if (MediaUploadHelper::isNewUpload($coverUrl, $currentCoverUrl)) {
                    MediaUploadHelper::addFromDataOrUrl($album, $coverUrl, 'cover', 'album-cover');
                }
            }

            // Sync photos inside album
            $existingPhotos = $album->fotos;
            $updatedUrls = collect($request->photos)->pluck('url')->toArray();

            // 1. Delete photos that are no longer present in request
            foreach ($existingPhotos as $photo) {
                if (!in_array($photo->getFirstMediaUrl('foto'), $updatedUrls)) {
                    $photo->clearMediaCollection('foto');
                    $photo->delete();
                }
            }

            // 2. Process photos from request
            foreach ($request->photos as $photoData) {
                $url = $photoData['url'];
                $order = $photoData['order'];

                if (str_starts_with($url, 'data:')) {
                    // This is a new photo in base64 format
                    $newPhoto = Foto::create([
                        'album_id' => $album->id,
                        'urutan' => $order,
                    ]);
                    MediaUploadHelper::addFromBase64($newPhoto, $url, 'foto', 'album-foto');
                } else {
                    // Existing photo, update its order
                    // Find by media URL
                    $matchedPhoto = $existingPhotos->first(function ($p) use ($url) {
                        return $p->getFirstMediaUrl('foto') === $url;
                    });

                    if ($matchedPhoto) {
                        $matchedPhoto->update(['urutan' => $order]);
                    } elseif (str_starts_with($url, 'http') || str_starts_with($url, '/storage/')) {
                        // This is a new photo selected from the media asset library
                        $newPhoto = Foto::create([
                            'album_id' => $album->id,
                            'urutan' => $order,
                        ]);
                        MediaUploadHelper::addFromDataOrUrl($newPhoto, $url, 'foto', 'album-foto');
                    }
                }
            }
        });

        return redirect()->route('admin.dokumentasi.index')->with('success', 'Album berhasil diperbarui.');
    }

    /**
     * Remove the specified album.
     */
    public function destroy($id)
    {
        $album = Album::withTrashed()->with('fotos')->findOrFail($id);

        if ($album->trashed()) {
            DB::transaction(function () use ($album) {
                // Clear all individual photo media from storage
                foreach ($album->fotos as $foto) {
                    $foto->clearMediaCollection('foto');
                    $foto->delete();
                }

                // Force delete the album (also clears cover media via Spatie)
                $album->forceDelete();
            });
            $message = 'Album berhasil dihapus permanen.';
        } else {
            $album->delete();
            $message = 'Album berhasil dipindahkan ke Tong Sampah.';
        }

        return redirect()->route('admin.dokumentasi.index')->with('success', $message);
    }

    /**
     * Restore the specified soft-deleted album.
     */
    public function restore($id)
    {
        $album = Album::onlyTrashed()->findOrFail($id);
        $album->restore();

        return redirect()->route('admin.dokumentasi.index')->with('success', 'Album berhasil dipulihkan.');
    }

    /**
     * Store new category.
     */
    public function storeKategori(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:50|unique:kategori_dokumentasis,nama',
        ]);

        KategoriDokumentasi::create([
            'nama' => $request->nama,
        ]);

        return redirect()->back()->with('success', 'Kategori baru berhasil ditambahkan.');
    }

    /**
     * Destroy category.
     */
    public function destroyKategori($id)
    {
        $kat = KategoriDokumentasi::findOrFail($id);
        $kat->delete();

        return redirect()->back()->with('success', 'Kategori berhasil dihapus.');
    }
}
