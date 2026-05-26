<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\KategoriLampiran;
use App\Models\Lampiran;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DokumenController extends Controller
{
    /**
     * Display a listing of categories and files.
     */
    public function index(): Response
    {
        $categories = KategoriLampiran::orderBy('urutan', 'asc')->get()->map(function ($cat) {
            return [
                'id' => (string)$cat->id,
                'nama' => $cat->nama,
                'slug' => $cat->slug,
                'deskripsi' => $cat->deskripsi,
                'urutan' => (int)$cat->urutan,
            ];
        });

        $files = Lampiran::latest()->get()->map(function ($item) {
            $media = $item->getFirstMedia('berkas');
            return [
                'id' => (string)$item->id,
                'kategori_id' => (string)$item->kategori_lampiran_id,
                'nama_tampilan' => $item->nama_tampilan,
                'deskripsi' => $item->deskripsi,
                'tipe_file' => strtolower(pathinfo($media?->file_name, PATHINFO_EXTENSION) ?: 'pdf'),
                'ukuran' => (int)($media?->size ?: 0),
                'tanggal_upload' => $item->created_at->format('Y-m-d'),
                'download_url' => $media?->getUrl() ?: '',
            ];
        });

        return Inertia::render('admin/dokumen/index', [
            'categories' => $categories,
            'files' => $files,
        ]);
    }

    /**
     * Store a newly created category.
     */
    public function storeKategori(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:100|unique:kategori_lampirans,nama',
            'deskripsi' => 'nullable|string|max:300',
        ]);

        $maxUrutan = KategoriLampiran::max('urutan') ?: 0;

        KategoriLampiran::create([
            'nama' => $request->nama,
            'deskripsi' => $request->deskripsi,
            'urutan' => $maxUrutan + 1,
        ]);

        cache()->forget('kategori_lampirans');

        return redirect()->back()->with('success', 'Folder kategori berhasil ditambahkan.');
    }

    /**
     * Update the specified category.
     */
    public function updateKategori(Request $request, $id)
    {
        $category = KategoriLampiran::findOrFail($id);

        $request->validate([
            'nama' => 'required|string|max:100|unique:kategori_lampirans,nama,' . $id,
            'deskripsi' => 'nullable|string|max:300',
        ]);

        $category->update([
            'nama' => $request->nama,
            'deskripsi' => $request->deskripsi,
        ]);

        cache()->forget('kategori_lampirans');

        return redirect()->back()->with('success', 'Kategori berhasil diperbarui.');
    }

    /**
     * Remove the specified category.
     */
    public function destroyKategori($id)
    {
        $category = KategoriLampiran::findOrFail($id);

        // Delete all child files individually to trigger Spatie media deletion events
        foreach ($category->lampirans as $lampiran) {
            $lampiran->delete();
        }

        $category->delete();

        cache()->forget('kategori_lampirans');

        return redirect()->back()->with('success', 'Kategori beserta semua berkas di dalamnya berhasil dihapus.');
    }

    /**
     * Reorder categories.
     */
    public function reorderKategori(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'required|exists:kategori_lampirans,id',
        ]);

        DB::transaction(function () use ($request) {
            foreach ($request->ids as $index => $id) {
                KategoriLampiran::where('id', $id)->update(['urutan' => $index + 1]);
            }
        });

        cache()->forget('kategori_lampirans');

        return redirect()->back()->with('success', 'Urutan kategori berhasil diperbarui.');
    }

    /**
     * Store a newly created file.
     */
    public function storeBerkas(Request $request)
    {
        $request->validate([
            'kategori_id' => 'required|exists:kategori_lampirans,id',
            'nama_tampilan' => 'required|string|max:150',
            'deskripsi' => 'nullable|string|max:300',
            'fileDataUrl' => 'required|string',
            'fileName' => 'required|string|max:255',
        ]);

        DB::transaction(function () use ($request) {
            $lampiran = Lampiran::create([
                'nama_tampilan' => $request->nama_tampilan,
                'deskripsi' => $request->deskripsi,
                'kategori_lampiran_id' => $request->kategori_id,
            ]);

            if (str_starts_with($request->fileDataUrl, 'data:')) {
                $lampiran->addMediaFromBase64($request->fileDataUrl)
                    ->usingFileName($request->fileName)
                    ->toMediaCollection('berkas');
            }
        });

        cache()->forget('kategori_lampirans');

        return redirect()->back()->with('success', 'Berkas berhasil diunggah.');
    }

    /**
     * Update the specified file.
     */
    public function updateBerkas(Request $request, $id)
    {
        $lampiran = Lampiran::findOrFail($id);

        $request->validate([
            'nama_tampilan' => 'required|string|max:150',
            'deskripsi' => 'nullable|string|max:300',
            'fileDataUrl' => 'nullable|string',
            'fileName' => 'nullable|string|max:255',
        ]);

        DB::transaction(function () use ($request, $lampiran) {
            $lampiran->update([
                'nama_tampilan' => $request->nama_tampilan,
                'deskripsi' => $request->deskripsi,
            ]);

            if ($request->fileDataUrl && str_starts_with($request->fileDataUrl, 'data:')) {
                $lampiran->addMediaFromBase64($request->fileDataUrl)
                    ->usingFileName($request->fileName ?? $request->nama_tampilan)
                    ->toMediaCollection('berkas');
            }
        });

        cache()->forget('kategori_lampirans');

        return redirect()->back()->with('success', 'Informasi berkas berhasil diperbarui.');
    }

    /**
     * Remove the specified file.
     */
    public function destroyBerkas($id)
    {
        $lampiran = Lampiran::findOrFail($id);
        $lampiran->delete();

        cache()->forget('kategori_lampirans');

        return redirect()->back()->with('success', 'Berkas berhasil dihapus.');
    }
}
