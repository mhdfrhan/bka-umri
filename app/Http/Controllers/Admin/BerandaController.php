<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Models\KepalaBiro;
use App\Models\Statistik;
use App\Models\Layanan;
use App\Models\Pengaturan;
use App\Services\MediaUploadHelper;
use App\Services\RichTextSanitizer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class BerandaController extends Controller
{
    /**
     * Show Beranda edit form.
     */
    public function edit(): Response
    {
        $banners = Banner::orderBy('urutan')->get()->map(function ($banner) {
            return [
                'id' => $banner->id,
                'title' => $banner->judul,
                'desc' => $banner->deskripsi ?? '',
                'btnText' => $banner->teks_tombol ?? '',
                'btnUrl' => $banner->tautan_tombol ?? '',
                'imgUrl' => $banner->getFirstMediaUrl('gambar') ?: '',
                'active' => (bool)$banner->is_active,
                'urutan' => (int)$banner->urutan,
            ];
        });

        $kepalaBiroModel = KepalaBiro::first();
        $kepalaBiro = $kepalaBiroModel ? [
            'nama' => $kepalaBiroModel->nama,
            'jabatan' => $kepalaBiroModel->jabatan,
            'periode' => $kepalaBiroModel->periode,
            'sambutan' => $kepalaBiroModel->sambutan,
            'fotoUrl' => $kepalaBiroModel->getFirstMediaUrl('foto') ?: '',
        ] : [
            'nama' => '',
            'jabatan' => '',
            'periode' => '',
            'sambutan' => '',
            'fotoUrl' => '',
        ];

        $stats = Statistik::orderBy('urutan')->get()->map(function ($stat) {
            return [
                'id' => $stat->id,
                'angka' => $stat->angka,
                'label' => $stat->label,
                'icon' => $stat->ikon ?? 'Award',
                'urutan' => (int)$stat->urutan,
            ];
        });

        $layananSection = [
            'judul' => Pengaturan::getValue('layanan_judul_section', 'Kemudahan Layanan Finansial & Administrasi'),
            'desc' => Pengaturan::getValue('layanan_deskripsi_section', 'BKA memahami kemudahan transaksi adalah kunci kenyamanan akademik. Kami memfasilitasi berbagai bentuk kemudahan administrasi berikut.'),
            'youtubeUrl' => Pengaturan::getValue('layanan_youtube_url', 'https://www.youtube.com/embed/4SI1Q-JkVm8?si=aSmMt81oihsA4yLQ'),
        ];

        $layananItems = Layanan::orderBy('urutan')->get()->map(function ($lay) {
            return [
                'id' => $lay->id,
                'title' => $lay->judul,
                'desc' => $lay->deskripsi,
                'icon' => $lay->ikon ?? 'CheckCircle2',
                'urutan' => (int)$lay->urutan,
            ];
        });

        return Inertia::render('admin/beranda/edit', [
            'banners' => $banners,
            'kepalaBiro' => $kepalaBiro,
            'stats' => $stats,
            'layananSection' => $layananSection,
            'layananItems' => $layananItems,
        ]);
    }

    /**
     * Store new slide banner.
     */
    public function storeBanner(Request $request)
    {
        if (Banner::count() >= 5) {
            return redirect()->back()->with('error', 'Batas maksimum 5 slide banner telah tercapai.');
        }

        $request->validate([
            'title' => 'nullable|string|max:100',
            'desc' => 'nullable|string|max:200',
            'btnText' => 'nullable|string|max:30',
            'btnUrl' => 'nullable|string|max:500',
            'imgUrl' => 'required|string',
            'active' => 'required|boolean',
        ]);

        $maxUrutan = Banner::max('urutan') ?? 0;

        $banner = Banner::create([
            'judul' => $request->title,
            'deskripsi' => $request->desc,
            'teks_tombol' => $request->btnText,
            'tautan_tombol' => $request->btnUrl,
            'urutan' => $maxUrutan + 1,
            'is_active' => $request->active,
        ]);

        if (!empty($request->imgUrl)) {
            MediaUploadHelper::addFromDataOrUrl($banner, $request->imgUrl, 'gambar', 'banner');
        }

        cache()->forget('beranda_data');

        return redirect()->route('admin.beranda.edit')->with('success', 'Slide banner baru berhasil ditambahkan.');
    }

    /**
     * Update slide banner.
     */
    public function updateBanner(Request $request, $id)
    {
        $banner = Banner::findOrFail($id);

        $request->validate([
            'title' => 'nullable|string|max:100',
            'desc' => 'nullable|string|max:200',
            'btnText' => 'nullable|string|max:30',
            'btnUrl' => 'nullable|string|max:500',
            'imgUrl' => 'required|string',
            'active' => 'required|boolean',
        ]);

        $banner->update([
            'judul' => $request->title,
            'deskripsi' => $request->desc,
            'teks_tombol' => $request->btnText,
            'tautan_tombol' => $request->btnUrl,
            'is_active' => $request->active,
        ]);

        if (!empty($request->imgUrl)) {
            $imgUrl = $request->imgUrl;
            $currentMediaUrl = $banner->getFirstMediaUrl('gambar');

            if (MediaUploadHelper::isNewUpload($imgUrl, $currentMediaUrl)) {
                MediaUploadHelper::addFromDataOrUrl($banner, $imgUrl, 'gambar', 'banner');
            }
        }

        cache()->forget('beranda_data');

        return redirect()->route('admin.beranda.edit')->with('success', 'Slide banner berhasil diperbarui.');
    }

    /**
     * Delete slide banner.
     */
    public function destroyBanner($id)
    {
        $banner = Banner::findOrFail($id);
        
        // Clear banner image from storage before deleting the record
        $banner->clearMediaCollection('gambar');
        $banner->delete();

        // Adjust urutan
        $banners = Banner::orderBy('urutan')->get();
        foreach ($banners as $index => $b) {
            $b->update(['urutan' => $index + 1]);
        }

        cache()->forget('beranda_data');

        return redirect()->route('admin.beranda.edit')->with('success', 'Slide banner berhasil dihapus.');
    }

    /**
     * Toggle active state of slide banner.
     */
    public function toggleBanner($id)
    {
        $banner = Banner::findOrFail($id);
        $banner->update(['is_active' => !$banner->is_active]);

        cache()->forget('beranda_data');

        return redirect()->route('admin.beranda.edit')->with('success', 'Status slide banner berhasil diubah.');
    }

    /**
     * Reorder slide banners.
     */
    public function reorderBanners(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'required|integer|exists:banners,id',
        ]);

        foreach ($request->ids as $index => $id) {
            Banner::where('id', $id)->update(['urutan' => $index + 1]);
        }

        cache()->forget('beranda_data');

        return redirect()->route('admin.beranda.edit')->with('success', 'Urutan banner berhasil disimpan.');
    }

    /**
     * Update Kepala Biro profile & sambutan.
     */
    public function updateKepalaBiro(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:100',
            'jabatan' => 'required|string|max:100',
            'periode' => 'required|string|max:50',
            'sambutan' => 'required|string|max:2000',
            'fotoUrl' => 'nullable|string',
        ]);

        $kepalaBiro = KepalaBiro::firstOrCreate([], [
            'nama' => $request->nama,
            'jabatan' => $request->jabatan,
            'periode' => $request->periode,
            'sambutan' => RichTextSanitizer::sanitize($request->sambutan),
        ]);

        $kepalaBiro->update([
            'nama' => $request->nama,
            'jabatan' => $request->jabatan,
            'periode' => $request->periode,
            'sambutan' => RichTextSanitizer::sanitize($request->sambutan),
        ]);

        if (!empty($request->fotoUrl)) {
            $fotoUrl = $request->fotoUrl;
            $currentMediaUrl = $kepalaBiro->getFirstMediaUrl('foto');

            if (MediaUploadHelper::isNewUpload($fotoUrl, $currentMediaUrl)) {
                MediaUploadHelper::addFromDataOrUrl($kepalaBiro, $fotoUrl, 'foto', 'kepala-biro');
            }
        }

        cache()->forget('beranda_data');

        return redirect()->route('admin.beranda.edit')->with('success', 'Profil Kepala Biro berhasil diperbarui.');
    }

    /**
     * Update Statistik Kelembagaan batch.
     */
    public function updateStatistik(Request $request)
    {
        $request->validate([
            'stats' => 'present|array|max:4',
            'stats.*.angka' => 'required|string|max:10',
            'stats.*.label' => 'required|string|max:50',
            'stats.*.icon' => 'required|string|max:50',
            'stats.*.urutan' => 'required|integer',
        ]);

        DB::transaction(function () use ($request) {
            $stats = $request->stats;
            $sentIds = collect($stats)->pluck('id')->filter()->toArray();

            // Delete missing
            Statistik::whereNotIn('id', $sentIds)->delete();

            // Create/Update
            foreach ($stats as $item) {
                Statistik::updateOrCreate(
                    ['id' => $item['id'] ?? null],
                    [
                        'angka' => $item['angka'],
                        'label' => $item['label'],
                        'ikon' => $item['icon'],
                        'urutan' => $item['urutan'],
                    ]
                );
            }
        });

        cache()->forget('beranda_data');

        return redirect()->route('admin.beranda.edit')->with('success', 'Statistik Beranda berhasil disimpan.');
    }

    /**
     * Update Layanan section settings & list.
     */
    public function updateLayanan(Request $request)
    {
        $request->validate([
            'judul' => 'required|string|max:100',
            'desc' => 'nullable|string|max:300',
            'youtubeUrl' => 'nullable|string|max:500',
            'items' => 'present|array|max:6',
            'items.*.title' => 'required|string|max:100',
            'items.*.desc' => 'required|string|max:300',
            'items.*.icon' => 'required|string|max:50',
            'items.*.urutan' => 'required|integer',
        ]);

        DB::transaction(function () use ($request) {
            // Save global settings
            Pengaturan::setValue('layanan_judul_section', $request->judul);
            Pengaturan::setValue('layanan_deskripsi_section', $request->desc ?? '');
            Pengaturan::setValue('layanan_youtube_url', $request->youtubeUrl ?? '');

            // Sync items
            $items = $request->items;
            $sentIds = collect($items)->pluck('id')->filter()->toArray();

            // Delete missing
            Layanan::whereNotIn('id', $sentIds)->delete();

            // Create/Update
            foreach ($items as $item) {
                Layanan::updateOrCreate(
                    ['id' => $item['id'] ?? null],
                    [
                        'judul' => $item['title'],
                        'deskripsi' => $item['desc'],
                        'ikon' => $item['icon'],
                        'urutan' => $item['urutan'],
                    ]
                );
            }
        });

        cache()->forget('beranda_data');

        return redirect()->route('admin.beranda.edit')->with('success', 'Pengaturan Layanan berhasil disimpan.');
    }
}
