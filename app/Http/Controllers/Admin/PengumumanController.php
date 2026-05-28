<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pengumuman;
use App\Services\MediaUploadHelper;
use App\Services\RichTextSanitizer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Str;

class PengumumanController extends Controller
{
    /**
     * Display a listing of announcements.
     */
    public function index(): Response
    {
        $announcements = Pengumuman::with('penulis')
            ->latest()
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'slug' => $item->slug,
                    'title' => $item->judul,
                    'excerpt' => Str::limit(strip_tags($item->isi), 160),
                    'content' => $item->isi,
                    'date' => $item->tanggal_publikasi ? $item->tanggal_publikasi->format('Y-m-d') : $item->created_at->format('Y-m-d'),
                    'author' => $item->penulis ? $item->penulis->name : 'Admin BKA',
                    'status' => $item->status->value,
                    'isPenting' => (bool)$item->is_penting,
                    'thumbnail' => $item->getFirstMediaUrl('thumbnail') ?: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=80',
                    'attachments' => $item->getMedia('lampirans')->map(function ($media) {
                        return [
                            'name' => $media->file_name,
                            'url' => $media->getUrl(),
                            'size' => $media->size,
                            'extension' => $media->extension,
                        ];
                    })->toArray(),
                ];
            });

        return Inertia::render('admin/pengumuman/index', [
            'announcements' => $announcements,
        ]);
    }

    /**
     * Show the form for creating.
     */
    public function create(): Response
    {
        return Inertia::render('admin/pengumuman/create');
    }

    /**
     * Store a newly created announcement.
     */
    public function store(Request $request)
    {
        $request->validate([
            'judul' => 'required|string|min:10|max:200',
            'slug' => 'required|string|max:220|unique:pengumumans,slug|regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
            'status' => 'required|string|in:draf,terpublikasi,diarsipkan',
            'is_penting' => 'required|boolean',
            'tanggal_publikasi' => 'nullable|date',
            'thumbnail' => 'nullable|string',
            'isi' => 'required|string',
            'attachments' => 'present|array|max:3',
            'attachments.*.name' => 'required_with:attachments.*.url|string',
            'attachments.*.url' => 'required_with:attachments.*.name|string',
        ]);

        $plainTextContent = trim(strip_tags($request->isi));
        if (mb_strlen($plainTextContent) < 20) {
            return redirect()->back()->withErrors(['isi' => 'Isi pengumuman minimal harus 20 karakter!'])->withInput();
        }

        DB::transaction(function () use ($request) {
            $pengumuman = Pengumuman::create([
                'judul' => $request->judul,
                'slug' => $request->slug,
                'isi' => RichTextSanitizer::sanitize($request->isi),
                'status' => $request->status,
                'is_penting' => $request->is_penting,
                'tanggal_publikasi' => $request->tanggal_publikasi ?: now(),
                'user_id' => $request->user()->id,
            ]);

            // Save cover image
            if (!empty($request->thumbnail)) {
                MediaUploadHelper::addFromDataOrUrl($pengumuman, $request->thumbnail, 'thumbnail', 'pengumuman-thumb');
            }

            // Save attachments
            if (!empty($request->attachments)) {
                foreach ($request->attachments as $fileData) {
                    if (!empty($fileData['url']) && str_starts_with($fileData['url'], 'data:')) {
                        $pengumuman->addMediaFromBase64($fileData['url'])
                            ->usingFileName($fileData['name'])
                            ->toMediaCollection('lampirans');
                    }
                }
            }
        });

        return redirect()->route('admin.pengumuman.index')->with('success', 'Pengumuman baru berhasil diterbitkan.');
    }

    /**
     * Show the form for editing.
     */
    public function edit($id): Response
    {
        $item = Pengumuman::findOrFail($id);

        $announcement = [
            'id' => $item->id,
            'title' => $item->judul,
            'slug' => $item->slug,
            'content' => $item->isi,
            'status' => $item->status->value,
            'isPenting' => (bool)$item->is_penting,
            'date' => $item->tanggal_publikasi ? $item->tanggal_publikasi->format('Y-m-d') : $item->created_at->format('Y-m-d'),
            'thumbnail' => $item->getFirstMediaUrl('thumbnail') ?: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=80',
            'attachments' => $item->getMedia('lampirans')->map(function ($media) {
                return [
                    'name' => $media->file_name,
                    'url' => $media->getUrl(),
                    'size' => $media->size,
                    'extension' => $media->extension,
                ];
            })->toArray(),
        ];

        return Inertia::render('admin/pengumuman/edit', [
            'announcement' => $announcement,
        ]);
    }

    /**
     * Update the specified announcement.
     */
    public function update(Request $request, $id)
    {
        $pengumuman = Pengumuman::findOrFail($id);

        $request->validate([
            'judul' => 'required|string|min:10|max:200',
            'slug' => 'required|string|max:220|unique:pengumumans,slug,' . $id . '|regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
            'status' => 'required|string|in:draf,terpublikasi,diarsipkan',
            'is_penting' => 'required|boolean',
            'tanggal_publikasi' => 'nullable|date',
            'thumbnail' => 'nullable|string',
            'isi' => 'required|string',
            'attachments' => 'present|array|max:3',
            'attachments.*.name' => 'required_with:attachments.*.url|string',
            'attachments.*.url' => 'required_with:attachments.*.name|string',
        ]);

        $plainTextContent = trim(strip_tags($request->isi));
        if (mb_strlen($plainTextContent) < 20) {
            return redirect()->back()->withErrors(['isi' => 'Isi pengumuman minimal harus 20 karakter!'])->withInput();
        }

        DB::transaction(function () use ($request, $pengumuman) {
            MediaUploadHelper::cleanupContentImages($pengumuman->isi, $request->isi);

            $pengumuman->update([
                'judul' => $request->judul,
                'slug' => $request->slug,
                'isi' => RichTextSanitizer::sanitize($request->isi),
                'status' => $request->status,
                'is_penting' => $request->is_penting,
                'tanggal_publikasi' => $request->tanggal_publikasi ?: now(),
            ]);

            // Update cover image
            if (!empty($request->thumbnail)) {
                $thumbnail = $request->thumbnail;
                $currentMediaUrl = $pengumuman->getFirstMediaUrl('thumbnail');

                if (MediaUploadHelper::isNewUpload($thumbnail, $currentMediaUrl)) {
                    MediaUploadHelper::addFromDataOrUrl($pengumuman, $thumbnail, 'thumbnail', 'pengumuman-thumb');
                }
            }

            // Sync attachments
            $existingMedia = $pengumuman->getMedia('lampirans');
            $updatedUrls = collect($request->attachments)->pluck('url')->toArray();

            // Delete media not in the updated list
            foreach ($existingMedia as $media) {
                if (!in_array($media->getUrl(), $updatedUrls)) {
                    $media->delete();
                }
            }

            // Add new media
            if (!empty($request->attachments)) {
                foreach ($request->attachments as $fileData) {
                    if (!empty($fileData['url']) && str_starts_with($fileData['url'], 'data:')) {
                        $pengumuman->addMediaFromBase64($fileData['url'])
                            ->usingFileName($fileData['name'])
                            ->toMediaCollection('lampirans');
                    }
                }
            }
        });

        return redirect()->route('admin.pengumuman.index')->with('success', 'Pengumuman berhasil diperbarui.');
    }

    /**
     * Remove the specified announcement.
     */
    public function destroy($id)
    {
        $pengumuman = Pengumuman::findOrFail($id);
        
        DB::transaction(function () use ($pengumuman) {
            // Delete all embedded images in rich text content
            MediaUploadHelper::deleteAllContentImages($pengumuman->isi);
            
            // Force delete the model to purge Spatie attachments (thumbnail and lampirans)
            $pengumuman->forceDelete();
        });

        return redirect()->route('admin.pengumuman.index')->with('success', 'Pengumuman berhasil dihapus.');
    }
}
