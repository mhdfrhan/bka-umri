<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AsetMedia;
use App\Services\MediaUploadHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AsetController extends Controller
{
    /**
     * Display a listing of assets.
     */
    public function index(): Response
    {
        $assets = AsetMedia::latest()->get();

        $totalOptimized = $assets->sum('ukuran');
        $totalOriginal = $assets->sum('ukuran_asli');
        $savePercent = $totalOriginal > 0 ? (int)round((($totalOriginal - $totalOptimized) / $totalOriginal) * 100) : 0;

        $mappedAssets = $assets->map(function ($item) {
            return [
                'id' => (string)$item->id,
                'name' => $item->nama,
                'url' => $item->getFirstMediaUrl('berkas') ?: 'https://placehold.co/600x400?text=' . urlencode($item->nama),
                'type' => $item->tipe,
                'extension' => $item->ekstensi,
                'size' => (int)$item->ukuran,
                'originalSize' => (int)$item->ukuran_asli,
                'isVisible' => (bool)$item->is_visible,
                'createdAt' => $item->created_at->format('Y-m-d'),
            ];
        })->toArray();

        return Inertia::render('admin/aset/index', [
            'assets' => $mappedAssets,
            'totalOptimized' => $totalOptimized,
            'totalOriginal' => $totalOriginal,
            'savePercent' => $savePercent,
        ]);
    }

    /**
     * Store a newly created asset.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'url' => 'required|string',
            'type' => 'required|string|in:image,file',
            'extension' => 'required|string|max:10',
            'size' => 'required|integer',
            'originalSize' => 'required|integer',
            'isVisible' => 'required|boolean',
        ]);

        DB::transaction(function () use ($request) {
            $aset = AsetMedia::create([
                'nama' => $request->name,
                'tipe' => $request->type,
                'ekstensi' => $request->extension,
                'ukuran' => $request->size,
                'ukuran_asli' => $request->originalSize,
                'is_visible' => $request->isVisible,
            ]);

            if (str_starts_with($request->url, 'data:')) {
                $filename = $request->name;
                // Ensure filename has extension
                if (!pathinfo($filename, PATHINFO_EXTENSION)) {
                    $filename .= '.' . $request->extension;
                }
                $aset->addMediaFromBase64($request->url)
                    ->usingFileName($filename)
                    ->toMediaCollection('berkas');
            } elseif (str_starts_with($request->url, 'http')) {
                MediaUploadHelper::addFromUrl($aset, $request->url, 'berkas');
            }
        });

        return redirect()->back()->with('success', 'File berhasil diunggah & dioptimasi.');
    }

    /**
     * Update the specified asset.
     */
    public function update(Request $request, $id)
    {
        $aset = AsetMedia::findOrFail($id);

        $request->validate([
            'name' => 'nullable|string|max:255',
            'is_visible' => 'required|boolean',
        ]);

        $aset->update([
            'nama' => $request->name ?? $aset->nama,
            'is_visible' => $request->is_visible,
        ]);

        return redirect()->back()->with('success', 'Aset berhasil diperbarui.');
    }

    /**
     * Remove the specified asset.
     */
    public function destroy($id)
    {
        $aset = AsetMedia::findOrFail($id);
        $aset->delete();

        return redirect()->back()->with('success', 'Aset berhasil dihapus.');
    }

    /**
     * Fetch API list of visible images for global pickers.
     */
    public function apiList()
    {
        $assets = AsetMedia::where('is_visible', true)
            ->where('tipe', 'image')
            ->latest()
            ->get()
            ->map(function ($item) {
                return [
                    'id' => (string)$item->id,
                    'name' => $item->nama,
                    'url' => $item->getFirstMediaUrl('berkas'),
                    'extension' => $item->ekstensi,
                ];
            });

        return response()->json($assets);
    }

    /**
     * Upload an image from the rich text editor.
     */
    public function editorUpload(Request $request)
    {
        $request->validate([
            'image' => 'required|string', // base64 data URL
            'name' => 'required|string|max:255',
            'size' => 'nullable|integer',
            'originalSize' => 'nullable|integer',
        ]);

        $aset = AsetMedia::create([
            'nama' => $request->name,
            'tipe' => 'image',
            'ekstensi' => 'webp',
            'ukuran' => $request->input('size', 0),
            'ukuran_asli' => $request->input('originalSize', 0),
            'is_visible' => true,
        ]);

        $filename = \Illuminate\Support\Str::slug(pathinfo($request->name, PATHINFO_FILENAME)) . '_' . time() . '.webp';

        $aset->addMediaFromBase64($request->image)
            ->usingFileName($filename)
            ->toMediaCollection('berkas');

        $url = $aset->getFirstMediaUrl('berkas');
        
        $media = $aset->getFirstMedia('berkas');
        if ($media) {
            $aset->update([
                'ukuran' => $request->input('size', $media->size),
                'ukuran_asli' => $request->input('originalSize', $media->size),
            ]);
        }

        return response()->json([
            'url' => $url,
        ]);
    }

    /**
     * Delete an image uploaded via the rich text editor, by its URL.
     */
    public function editorImageDelete(Request $request)
    {
        $request->validate([
            'url' => 'required|string',
        ]);

        try {
            MediaUploadHelper::deleteMediaByUrl($request->url);
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
