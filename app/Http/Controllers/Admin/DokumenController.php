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
    public function index(Request $request): Response
    {
        $catQuery = KategoriLampiran::orderBy('urutan', 'asc');
        $fileQuery = Lampiran::orderBy('kategori_lampiran_id')->orderBy('urutan', 'asc')->orderBy('created_at', 'desc');

        if ($request->has('trashed') && $request->trashed === 'true') {
            $catQuery->onlyTrashed();
            $fileQuery->onlyTrashed();
        }

        $categories = $catQuery->get()->map(function ($cat) {
            return [
                'id' => (string)$cat->id,
                'nama' => $cat->nama,
                'slug' => $cat->slug,
                'deskripsi' => $cat->deskripsi ?: '',
                'urutan' => (int)$cat->urutan,
                'parent_id' => $cat->parent_id ? (string)$cat->parent_id : null,
                'deleted_at' => $cat->deleted_at,
            ];
        });

        $files = $fileQuery->get()->map(function ($item) {
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
                'deleted_at' => $item->deleted_at,
                'urutan' => (int)$item->urutan,
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
            'parent_id' => 'nullable|exists:kategori_lampirans,id',
        ]);

        $maxUrutan = KategoriLampiran::where('parent_id', $request->parent_id)->max('urutan') ?: 0;

        KategoriLampiran::create([
            'nama' => $request->nama,
            'deskripsi' => $request->deskripsi,
            'parent_id' => $request->parent_id,
            'urutan' => $maxUrutan + 1,
        ]);

        cache()->forget('kategori_lampirans');
        cache()->forget('kategori_lampirans_root');

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
            'parent_id' => 'nullable|exists:kategori_lampirans,id|not_in:' . $id,
        ]);

        $category->update([
            'nama' => $request->nama,
            'deskripsi' => $request->deskripsi,
            'parent_id' => $request->parent_id,
        ]);

        cache()->forget('kategori_lampirans');
        cache()->forget('kategori_lampirans_root');

        return redirect()->back()->with('success', 'Kategori berhasil diperbarui.');
    }

    /**
     * Remove the specified category.
     */
    public function destroyKategori($id)
    {
        $category = KategoriLampiran::withTrashed()->findOrFail($id);

        if ($category->trashed()) {
            // Delete all child files individually to trigger Spatie media deletion events
            foreach ($category->lampirans()->withTrashed()->get() as $lampiran) {
                $lampiran->forceDelete();
            }

            $category->forceDelete();
            $message = 'Kategori beserta semua berkas di dalamnya berhasil dihapus permanen.';
        } else {
            foreach ($category->lampirans as $lampiran) {
                $lampiran->delete();
            }
            $category->delete();
            $message = 'Kategori beserta semua berkas di dalamnya berhasil dipindahkan ke Tong Sampah.';
        }

        cache()->forget('kategori_lampirans');
        cache()->forget('kategori_lampirans_root');

        return redirect()->back()->with('success', $message);
    }

    /**
     * Restore the specified category.
     */
    public function restoreKategori($id)
    {
        $category = KategoriLampiran::onlyTrashed()->findOrFail($id);
        
        $category->restore();
        foreach ($category->lampirans()->onlyTrashed()->get() as $lampiran) {
            $lampiran->restore();
        }

        cache()->forget('kategori_lampirans');
        cache()->forget('kategori_lampirans_root');

        return redirect()->back()->with('success', 'Kategori beserta berkas di dalamnya berhasil dipulihkan.');
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
        cache()->forget('kategori_lampirans_root');

        return redirect()->back()->with('success', 'Urutan kategori berhasil diperbarui.');
    }

    /**
     * Reorder files.
     */
    public function reorderBerkas(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'required|exists:lampirans,id',
        ]);

        DB::transaction(function () use ($request) {
            foreach ($request->ids as $index => $id) {
                Lampiran::where('id', $id)->update(['urutan' => $index + 1]);
            }
        });

        return redirect()->back()->with('success', 'Urutan berkas berhasil diperbarui.');
    }

    /**
     * Reorder unified list of folders and files.
     */
    public function reorderUnified(Request $request)
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|string',
            'items.*.type' => 'required|in:folder,file',
        ]);

        DB::transaction(function () use ($request) {
            foreach ($request->items as $index => $item) {
                if ($item['type'] === 'folder') {
                    KategoriLampiran::where('id', $item['id'])->update(['urutan' => $index + 1]);
                } else {
                    Lampiran::where('id', $item['id'])->update(['urutan' => $index + 1]);
                }
            }
        });

        cache()->forget('kategori_lampirans');
        cache()->forget('kategori_lampirans_root');

        return redirect()->back()->with('success', 'Urutan berhasil diperbarui.');
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
            'berkas' => 'nullable|file|max:51200',
            'fileDataUrl' => 'nullable|string',
            'fileName' => 'required|string|max:255',
            'compress' => 'nullable|boolean',
        ]);

        $kategori = KategoriLampiran::findOrFail($request->kategori_id);
        $maxUrutan = Lampiran::where('kategori_lampiran_id', $kategori->id)->max('urutan') ?? 0;

        DB::transaction(function () use ($request, $kategori, $maxUrutan) {
            $lampiran = Lampiran::create([
                'kategori_lampiran_id' => $kategori->id,
                'nama_tampilan' => $request->nama_tampilan,
                'deskripsi' => $request->deskripsi,
                'urutan' => $maxUrutan + 1,
            ]);

            if ($request->hasFile('berkas')) {
                $file = $request->file('berkas');
                if ($request->compress) {
                    $tempPath = $file->getRealPath();
                    $compressedPath = \App\Services\PdfCompressorService::compress($tempPath);
                    
                    $lampiran->addMedia($compressedPath)
                        ->usingFileName($request->fileName)
                        ->toMediaCollection('berkas');
                        
                    if (file_exists($compressedPath) && $compressedPath !== $tempPath) {
                        @unlink($compressedPath);
                    }
                } else {
                    $lampiran->addMedia($file)
                        ->usingFileName($request->fileName)
                        ->toMediaCollection('berkas');
                }
            } else if ($request->fileDataUrl && str_starts_with($request->fileDataUrl, 'data:')) {
                if ($request->compress) {
                    $base64 = substr($request->fileDataUrl, strpos($request->fileDataUrl, ',') + 1);
                    $tempFile = sys_get_temp_dir() . '/' . uniqid('upload_') . '.pdf';
                    file_put_contents($tempFile, base64_decode($base64));
                    
                    $compressedPath = \App\Services\PdfCompressorService::compress($tempFile);
                    
                    $lampiran->addMedia($compressedPath)
                        ->usingFileName($request->fileName)
                        ->toMediaCollection('berkas');
                        
                    if (file_exists($compressedPath)) @unlink($compressedPath);
                    if ($compressedPath !== $tempFile && file_exists($tempFile)) @unlink($tempFile);
                } else {
                    $lampiran->addMediaFromBase64($request->fileDataUrl)
                        ->usingFileName($request->fileName)
                        ->toMediaCollection('berkas');
                }
            }
        });

        cache()->forget('kategori_lampirans');
        cache()->forget('kategori_lampirans_root');

        return redirect()->route('admin.dokumen.index')->with('success', 'Berkas berhasil diunggah.');
    }

    /**
     * Store multiple newly created files.
     */
    public function storeMultipleBerkas(Request $request)
    {
        $request->validate([
            'kategori_id' => 'required|exists:kategori_lampirans,id',
            'berkas_files' => 'required|array|min:1',
            'berkas_files.*.fileDataUrl' => 'required|string',
            'berkas_files.*.fileName' => 'required|string|max:255',
            'berkas_files.*.nama_tampilan' => 'required|string|max:150',
            'berkas_files.*.deskripsi' => 'nullable|string|max:300',
            'compress' => 'nullable|boolean',
        ]);

        DB::transaction(function () use ($request) {
            foreach ($request->input('berkas_files') as $fileItem) {
                $lampiran = Lampiran::create([
                    'nama_tampilan' => $fileItem['nama_tampilan'],
                    'deskripsi' => $fileItem['deskripsi'] ?? null,
                    'kategori_lampiran_id' => $request->kategori_id,
                ]);

                if (str_starts_with($fileItem['fileDataUrl'], 'data:')) {
                    if ($request->compress) {
                        $base64 = substr($fileItem['fileDataUrl'], strpos($fileItem['fileDataUrl'], ',') + 1);
                        $tempFile = sys_get_temp_dir() . '/' . uniqid('upload_') . '.pdf';
                        file_put_contents($tempFile, base64_decode($base64));
                        
                        $compressedPath = \App\Services\PdfCompressorService::compress($tempFile);
                        
                        $lampiran->addMedia($compressedPath)
                            ->usingFileName($fileItem['fileName'])
                            ->toMediaCollection('berkas');
                            
                        if (file_exists($compressedPath)) @unlink($compressedPath);
                        if ($compressedPath !== $tempFile && file_exists($tempFile)) @unlink($tempFile);
                    } else {
                        $lampiran->addMediaFromBase64($fileItem['fileDataUrl'])
                            ->usingFileName($fileItem['fileName'])
                            ->toMediaCollection('berkas');
                    }
                }
            }
        });

        cache()->forget('kategori_lampirans');
        cache()->forget('kategori_lampirans_root');

        return redirect()->back()->with('success', count($request->input('berkas_files')) . ' berkas berhasil diunggah.');
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
            'berkas' => 'nullable|file|max:51200',
            'fileDataUrl' => 'nullable|string',
            'fileName' => 'nullable|string|max:255',
            'compress' => 'nullable|boolean',
        ]);

        DB::transaction(function () use ($request, $lampiran) {
            $lampiran->update([
                'nama_tampilan' => $request->nama_tampilan,
                'deskripsi' => $request->deskripsi,
            ]);

            if ($request->hasFile('berkas')) {
                $file = $request->file('berkas');
                if ($request->compress) {
                    $tempPath = $file->getRealPath();
                    $compressedPath = \App\Services\PdfCompressorService::compress($tempPath);
                    
                    $lampiran->addMedia($compressedPath)
                        ->usingFileName($request->fileName ?? $file->getClientOriginalName())
                        ->toMediaCollection('berkas');
                        
                    if (file_exists($compressedPath) && $compressedPath !== $tempPath) {
                        @unlink($compressedPath);
                    }
                } else {
                    $lampiran->addMedia($file)
                        ->usingFileName($request->fileName ?? $file->getClientOriginalName())
                        ->toMediaCollection('berkas');
                }
            } else if ($request->fileDataUrl && str_starts_with($request->fileDataUrl, 'data:')) {
                if ($request->compress) {
                    $base64 = substr($request->fileDataUrl, strpos($request->fileDataUrl, ',') + 1);
                    $tempFile = sys_get_temp_dir() . '/' . uniqid('upload_') . '.pdf';
                    file_put_contents($tempFile, base64_decode($base64));
                    
                    $compressedPath = \App\Services\PdfCompressorService::compress($tempFile);
                    
                    $lampiran->addMedia($compressedPath)
                        ->usingFileName($request->fileName ?? $request->nama_tampilan)
                        ->toMediaCollection('berkas');
                        
                    if (file_exists($compressedPath)) @unlink($compressedPath);
                    if ($compressedPath !== $tempFile && file_exists($tempFile)) @unlink($tempFile);
                } else {
                    $lampiran->addMediaFromBase64($request->fileDataUrl)
                        ->usingFileName($request->fileName ?? $request->nama_tampilan)
                        ->toMediaCollection('berkas');
                }
            }
        });

        cache()->forget('kategori_lampirans');
        cache()->forget('kategori_lampirans_root');

        return redirect()->back()->with('success', 'Informasi berkas berhasil diperbarui.');
    }

    /**
     * Remove the specified file.
     */
    public function destroyBerkas($id)
    {
        $lampiran = Lampiran::withTrashed()->findOrFail($id);
        
        if ($lampiran->trashed()) {
            $lampiran->forceDelete();
            $message = 'Berkas berhasil dihapus permanen.';
        } else {
            $lampiran->delete();
            $message = 'Berkas berhasil dipindahkan ke Tong Sampah.';
        }

        cache()->forget('kategori_lampirans');
        cache()->forget('kategori_lampirans_root');

        return redirect()->back()->with('success', $message);
    }

    /**
     * Restore the specified file.
     */
    public function restoreBerkas($id)
    {
        $lampiran = Lampiran::onlyTrashed()->findOrFail($id);
        $lampiran->restore();

        cache()->forget('kategori_lampirans');

        return redirect()->back()->with('success', 'Berkas berhasil dipulihkan.');
    }
}
