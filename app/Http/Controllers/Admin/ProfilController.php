<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\HalamanStatis;
use App\Models\Misi;
use App\Models\Pengaturan;
use App\Models\StrukturAnggota;
use App\Services\MediaUploadHelper;
use App\Services\RichTextSanitizer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfilController extends Controller
{
    /**
     * Show Tentang Kami edit form.
     */
    public function editTentang(): Response
    {
        $halaman = HalamanStatis::firstOrCreate(
            ['slug' => 'tentang-kami'],
            [
                'judul' => 'Tentang Kami',
                'konten' => '',
            ]
        );

        return Inertia::render('admin/profil/tentang-edit', [
            'halaman' => $halaman,
        ]);
    }

    /**
     * Update Tentang Kami.
     */
    public function updateTentang(Request $request)
    {
        $request->validate([
            'konten' => 'required|string',
        ]);

        $halaman = HalamanStatis::where('slug', 'tentang-kami')->firstOrFail();
        $halaman->update([
            'konten' => RichTextSanitizer::sanitize($request->konten),
        ]);

        return redirect()->back()->with('success', 'Konten Tentang Kami berhasil diperbarui.');
    }

    /**
     * Show Visi & Misi edit form.
     */
    public function editVisiMisi(): Response
    {
        $halaman = HalamanStatis::firstOrCreate(
            ['slug' => 'visi-misi'],
            [
                'judul' => 'Visi & Misi',
                'konten' => '',
            ]
        );

        $misiList = Misi::orderBy('urutan')->get();

        return Inertia::render('admin/profil/visi-misi-edit', [
            'visi' => $halaman->konten ?? '',
            'misiList' => $misiList,
        ]);
    }

    /**
     * Update Visi & Misi.
     */
    public function updateVisiMisi(Request $request)
    {
        $request->validate([
            'visi' => 'required|string|max:2000',
            'misiItems' => 'required|array|min:1',
            'misiItems.*.isi' => 'required|string|max:200',
            'misiItems.*.urutan' => 'required|integer',
        ]);

        DB::transaction(function () use ($request) {
            // Update Visi
            $halaman = HalamanStatis::where('slug', 'visi-misi')->firstOrFail();
            $halaman->update([
                'konten' => RichTextSanitizer::sanitize($request->visi),
            ]);

            // Sync Misi
            $misiItems = $request->misiItems;
            $sentIds = collect($misiItems)->pluck('id')->filter()->toArray();

            // Delete missing misis
            Misi::whereNotIn('id', $sentIds)->delete();

            // Insert/Update misis
            foreach ($misiItems as $item) {
                Misi::updateOrCreate(
                    ['id' => $item['id'] ?? null],
                    [
                        'isi' => $item['isi'],
                        'urutan' => $item['urutan'],
                    ]
                );
            }
        });

        return redirect()->back()->with('success', 'Visi & Misi berhasil diperbarui.');
    }

    /**
     * Show Struktur Organisasi edit form.
     */
    public function editStruktur(): Response
    {
        $gambarBagan = Pengaturan::getValue('struktur_organisasi_bagan', '');

        $anggotaList = StrukturAnggota::orderBy('urutan')->get()->map(function ($anggota) {
            return [
                'id' => $anggota->id,
                'nama' => $anggota->nama,
                'jabatan' => $anggota->jabatan,
                'foto' => $anggota->getFirstMediaUrl('foto') ?: '',
                'urutan' => $anggota->urutan,
            ];
        });

        return Inertia::render('admin/profil/struktur-edit', [
            'gambarBagan' => $gambarBagan,
            'anggotaList' => $anggotaList,
        ]);
    }

    /**
     * Update Struktur Organisasi.
     */
    public function updateStruktur(Request $request)
    {
        $request->validate([
            'gambarBagan' => 'nullable|string',
            'anggotaList' => 'present|array',
            'anggotaList.*.nama' => 'required|string|max:100',
            'anggotaList.*.jabatan' => 'required|string|max:100',
            'anggotaList.*.urutan' => 'required|integer',
            'anggotaList.*.foto' => 'nullable|string',
        ]);

        DB::transaction(function () use ($request) {
            $gambarBaganUrl = $request->gambarBagan ?? '';

            if (!empty($gambarBaganUrl) && str_starts_with($gambarBaganUrl, 'data:')) {
                try {
                    $parts = explode(',', $gambarBaganUrl);
                    $decoded = base64_decode($parts[1] ?? '');
                    
                    $extension = 'png';
                    if (preg_match('/^data:image\/(\w+);base64/', $gambarBaganUrl, $matches)) {
                        $extension = $matches[1];
                    }
                    
                    $filename = 'bagan_' . time() . '_' . uniqid() . '.' . $extension;
                    Storage::disk('public')->put('bagan/' . $filename, $decoded);
                    $gambarBaganUrl = Storage::disk('public')->url('bagan/' . $filename);
                } catch (\Exception $e) {
                    // fallback to original string if failed
                }
            }

            // Save Bagan URL to Settings
            Pengaturan::setValue('struktur_organisasi_bagan', $gambarBaganUrl);

            // Sync Staff Members
            $anggotaList = $request->anggotaList;
            
            // Collect IDs that are still present
            $sentIds = collect($anggotaList)->pluck('id')->filter()->toArray();

            // Delete missing staff members
            StrukturAnggota::whereNotIn('id', $sentIds)->delete();

            // Create/Update members
            foreach ($anggotaList as $item) {
                $anggota = StrukturAnggota::updateOrCreate(
                    ['id' => $item['id'] ?? null],
                    [
                        'nama' => $item['nama'],
                        'jabatan' => $item['jabatan'],
                        'urutan' => $item['urutan'],
                    ]
                );

                // Handle profile photo upload if it's base64 or remote URL
                if (!empty($item['foto'])) {
                    $fotoData = $item['foto'];
                    $currentMediaUrl = $anggota->getFirstMediaUrl('foto');

                    if (MediaUploadHelper::isNewUpload($fotoData, $currentMediaUrl)) {
                        MediaUploadHelper::addFromDataOrUrl($anggota, $fotoData, 'foto', 'anggota-' . $anggota->id);
                    }
                } else {
                    // If photo is empty, clear current media
                    $anggota->clearMediaCollection('foto');
                }
            }
        });

        return redirect()->back()->with('success', 'Struktur Organisasi berhasil diperbarui.');
    }
}
