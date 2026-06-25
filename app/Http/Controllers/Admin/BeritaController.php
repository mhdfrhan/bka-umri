<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Berita;
use App\Models\KategoriBerita;
use App\Services\MediaUploadHelper;
use App\Services\RichTextSanitizer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Str;

class BeritaController extends Controller
{
    /**
     * Display a listing of news.
     */
    public function index(Request $request): Response
    {
        $query = Berita::with(['kategori', 'penulis'])->latest();

        if ($request->has('trashed') && $request->trashed === 'true') {
            $query->onlyTrashed();
        }

        $beritas = $query->get()->map(function ($item) {
                return [
                    'id' => $item->id,
                    'slug' => $item->slug,
                    'thumbnail' => $item->getFirstMediaUrl('thumbnail') ?: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80',
                    'category' => $item->kategori ? $item->kategori->nama : 'Tanpa Kategori',
                    'title' => $item->judul,
                    'excerpt' => Str::limit(strip_tags($item->isi), 160),
                    'content' => $item->isi,
                    'date' => $item->tanggal_publikasi ? $item->tanggal_publikasi->format('Y-m-d') : $item->created_at->format('Y-m-d'),
                    'author' => $item->penulis ? $item->penulis->name : 'Admin BKA',
                    'status' => $item->status->value,
                    'deleted_at' => $item->deleted_at,
                ];
            });

        $categories = KategoriBerita::orderBy('nama')
            ->get()
            ->map(function ($cat) {
                return [
                    'id' => $cat->id,
                    'nama' => $cat->nama,
                    'slug' => $cat->slug,
                ];
            });

        return Inertia::render('admin/berita/index', [
            'beritas' => $beritas,
            'categories' => $categories,
        ]);
    }

    /**
     * Show the form for creating a new news article.
     */
    public function create(): Response
    {
        $categories = KategoriBerita::orderBy('nama')
            ->get()
            ->map(function ($cat) {
                return [
                    'id' => $cat->id,
                    'nama' => $cat->nama,
                ];
            });

        return Inertia::render('admin/berita/create', [
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created news article.
     */
    public function store(Request $request)
    {
        $request->validate([
            'judul' => 'required|string|min:10|max:200',
            'slug' => 'required|string|max:220|unique:beritas,slug|regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
            'kategori' => 'required|string',
            'status' => 'required|string|in:draf,terpublikasi,diarsipkan',
            'tanggal_publikasi' => 'nullable|date',
            'thumbnail' => 'required|string',
            'isi' => 'required|string',
        ]);

        $plainTextContent = trim(strip_tags($request->isi));
        if (mb_strlen($plainTextContent) < 50) {
            return redirect()->back()->withErrors(['isi' => 'Isi berita minimal harus 50 karakter!'])->withInput();
        }

        DB::transaction(function () use ($request) {
            $kategoriId = null;
            if ($request->kategori !== 'Tanpa Kategori' && !empty($request->kategori)) {
                $kat = KategoriBerita::where('nama', $request->kategori)->first();
                if ($kat) {
                    $kategoriId = $kat->id;
                }
            }

            $berita = Berita::create([
                'judul' => $request->judul,
                'slug' => $request->slug,
                'isi' => RichTextSanitizer::sanitize($request->isi),
                'status' => $request->status,
                'tanggal_publikasi' => $request->tanggal_publikasi ?: now(),
                'kategori_berita_id' => $kategoriId,
                'user_id' => $request->user()->id,
            ]);

            if (!empty($request->thumbnail)) {
                MediaUploadHelper::addFromDataOrUrl($berita, $request->thumbnail, 'thumbnail', 'berita-thumb');
            }
        });

        cache()->forget('beranda_data');
        cache()->forget('kategori_beritas');

        return redirect()->route('admin.berita.index')->with('success', 'Berita baru berhasil diterbitkan.');
    }

    /**
     * Show the form for editing.
     */
    public function edit($id): Response
    {
        $item = Berita::findOrFail($id);

        $categories = KategoriBerita::orderBy('nama')
            ->get()
            ->map(function ($cat) {
                return [
                    'id' => $cat->id,
                    'nama' => $cat->nama,
                ];
            });

        $berita = [
            'id' => $item->id,
            'judul' => $item->judul,
            'slug' => $item->slug,
            'kategori' => $item->kategori ? $item->kategori->nama : 'Tanpa Kategori',
            'thumbnail' => $item->getFirstMediaUrl('thumbnail') ?: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80',
            'isi' => $item->isi,
            'status' => $item->status->value,
            'tanggal_publikasi' => $item->tanggal_publikasi ? $item->tanggal_publikasi->format('Y-m-d') : $item->created_at->format('Y-m-d'),
        ];

        return Inertia::render('admin/berita/edit', [
            'berita' => $berita,
            'categories' => $categories,
        ]);
    }

    /**
     * Update the news article.
     */
    public function update(Request $request, $id)
    {
        $berita = Berita::findOrFail($id);

        $request->validate([
            'judul' => 'required|string|min:10|max:200',
            'slug' => 'required|string|max:220|unique:beritas,slug,' . $id . '|regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
            'kategori' => 'required|string',
            'status' => 'required|string|in:draf,terpublikasi,diarsipkan',
            'tanggal_publikasi' => 'nullable|date',
            'thumbnail' => 'required|string',
            'isi' => 'required|string',
        ]);

        $plainTextContent = trim(strip_tags($request->isi));
        if (mb_strlen($plainTextContent) < 50) {
            return redirect()->back()->withErrors(['isi' => 'Isi berita minimal harus 50 karakter!'])->withInput();
        }

        DB::transaction(function () use ($request, $berita) {
            $kategoriId = null;
            if ($request->kategori !== 'Tanpa Kategori' && !empty($request->kategori)) {
                $kat = KategoriBerita::where('nama', $request->kategori)->first();
                if ($kat) {
                    $kategoriId = $kat->id;
                }
            }

            MediaUploadHelper::cleanupContentImages($berita->isi, $request->isi);

            $berita->update([
                'judul' => $request->judul,
                'slug' => $request->slug,
                'isi' => RichTextSanitizer::sanitize($request->isi),
                'status' => $request->status,
                'tanggal_publikasi' => $request->tanggal_publikasi ?: now(),
                'kategori_berita_id' => $kategoriId,
            ]);

            if (!empty($request->thumbnail)) {
                $thumbnail = $request->thumbnail;
                $currentMediaUrl = $berita->getFirstMediaUrl('thumbnail');

                if (MediaUploadHelper::isNewUpload($thumbnail, $currentMediaUrl)) {
                    MediaUploadHelper::addFromDataOrUrl($berita, $thumbnail, 'thumbnail', 'berita-thumb');
                }
            }
        });

        cache()->forget('beranda_data');
        cache()->forget('kategori_beritas');

        return redirect()->route('admin.berita.index')->with('success', 'Berita berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $berita = Berita::withTrashed()->findOrFail($id);
        
        if ($berita->trashed()) {
            DB::transaction(function () use ($berita) {
                // Delete all embedded images in rich text content
                MediaUploadHelper::deleteAllContentImages($berita->isi);
                
                // Force delete the model to purge Spatie attachments & record
                $berita->forceDelete();
            });
            $message = 'Berita berhasil dihapus permanen.';
        } else {
            $berita->delete();
            $message = 'Berita berhasil dipindahkan ke Tong Sampah.';
        }

        cache()->forget('beranda_data');
        cache()->forget('kategori_beritas');

        return redirect()->route('admin.berita.index')->with('success', $message);
    }

    /**
     * Restore the specified soft-deleted news.
     */
    public function restore($id)
    {
        $berita = Berita::onlyTrashed()->findOrFail($id);
        $berita->restore();

        cache()->forget('beranda_data');
        cache()->forget('kategori_beritas');

        return redirect()->route('admin.berita.index')->with('success', 'Berita berhasil dipulihkan.');
    }

    /**
     * Store new category.
     */
    public function storeKategori(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:50|unique:kategori_beritas,nama',
        ]);

        KategoriBerita::create([
            'nama' => $request->nama,
        ]);

        cache()->forget('kategori_beritas');

        return redirect()->back()->with('success', 'Kategori baru berhasil ditambahkan.');
    }

    /**
     * Destroy category.
     */
    public function destroyKategori($id)
    {
        $kat = KategoriBerita::findOrFail($id);
        $kat->delete();

        cache()->forget('kategori_beritas');

        return redirect()->back()->with('success', 'Kategori berhasil dihapus.');
    }
}
