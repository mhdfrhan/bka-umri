<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Bidang;
use App\Models\BidangKepalaBagian;
use App\Models\BidangAnggota;
use App\Services\MediaUploadHelper;
use App\Services\RichTextSanitizer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class BidangController extends Controller
{
    /**
     * Display a listing of divisions.
     */
    public function index(): Response
    {
        $bidangs = Bidang::orderBy('urutan')
            ->get()
            ->map(function ($bid) {
                return [
                    'id' => (string)$bid->id,
                    'nama' => $bid->nama,
                    'slug' => $bid->slug,
                    'deskripsiSingkat' => $bid->deskripsi_singkat,
                    'deskripsiLengkap' => html_entity_decode($bid->deskripsi_lengkap),
                    'urutan' => (int)$bid->urutan,
                    'kepalaBagian' => $bid->kepalaBagian ? [
                        'nama' => $bid->kepalaBagian->nama,
                        'jabatan' => $bid->kepalaBagian->jabatan,
                        'foto' => $bid->kepalaBagian->getFirstMediaUrl('foto') ?: 'https://smart.umri.ac.id/application/modules/personalia/assets/uploads/foto/default.jpg',
                        'deskripsiTugas' => $bid->kepalaBagian->deskripsi_tugas ?? '',
                    ] : [
                        'nama' => '',
                        'jabatan' => '',
                        'foto' => 'https://smart.umri.ac.id/application/modules/personalia/assets/uploads/foto/default.jpg',
                        'deskripsiTugas' => '',
                    ],
                    'anggota' => $bid->anggotas->map(function ($ang) {
                        return [
                            'nama' => $ang->nama,
                            'jabatan' => $ang->jabatan,
                            'foto' => $ang->getFirstMediaUrl('foto') ?: '',
                            'media_sosial' => $ang->media_sosial ?? [],
                        ];
                    })->toArray(),
                    'cta' => $bid->cta_heading ? [
                        'heading' => $bid->cta_heading,
                        'subCta' => $bid->cta_sub ?? '',
                        'btnText' => $bid->cta_teks_tombol ?? 'Hubungi Kami',
                        'btnUrl' => $bid->cta_tautan ?? '',
                    ] : null,
                ];
            });

        return Inertia::render('admin/bidang/index', [
            'bidangs' => $bidangs,
        ]);
    }

    /**
     * Show the form for creating a new division.
     */
    public function create(): Response
    {
        return Inertia::render('admin/bidang/create');
    }

    /**
     * Store a newly created division.
     */
    public function store(Request $request)
    {
        if (Bidang::count() >= 6) {
            return redirect()->back()->with('error', 'Batas maksimum 6 bidang telah tercapai.');
        }

        $request->validate([
            'nama' => 'required|string|max:100',
            'slug' => 'required|string|max:120|unique:bidangs,slug|regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
            'deskripsiSingkat' => 'required|string|max:200',
            'deskripsiLengkap' => 'required|string|max:2000',
            'bannerUrl' => 'required|string',
            'kepalaNama' => 'required|string|max:100',
            'kepalaJabatan' => 'required|string|max:100',
            'kepalaFoto' => 'required|string',
            'kepalaTugas' => 'nullable|string|max:500',
            'kepalaWa' => 'nullable|string|max:200',
            'kepalaEmail' => 'nullable|string|max:200',
            'kepalaLinkedin' => 'nullable|string|max:300',
            'kepalaInstagram' => 'nullable|string|max:300',
            'anggota' => 'present|array|max:20',
            'anggota.*.nama' => 'required_with:anggota.*.jabatan|string|max:100',
            'anggota.*.jabatan' => 'required_with:anggota.*.nama|string|max:100',
            'anggota.*.foto' => 'nullable|string',
            'anggota.*.media_sosial' => 'nullable|array',
            'ctaHeading' => 'nullable|string|max:100',
            'ctaSub' => 'nullable|string|max:100',
            'ctaBtnText' => 'nullable|string|max:30',
            'ctaBtnUrl' => 'nullable|string|max:500',
        ]);

        DB::transaction(function () use ($request) {
            $maxUrutan = Bidang::max('urutan') ?? 0;

            $bidang = Bidang::create([
                'nama' => $request->nama,
                'slug' => $request->slug,
                'deskripsi_singkat' => $request->deskripsiSingkat,
                'deskripsi_lengkap' => RichTextSanitizer::sanitize($request->deskripsiLengkap),
                'urutan' => $maxUrutan + 1,
                'cta_heading' => $request->ctaHeading,
                'cta_sub' => $request->ctaSub,
                'cta_teks_tombol' => $request->ctaBtnText ?? 'Hubungi Kami',
                'cta_tautan' => $request->ctaBtnUrl,
            ]);

            // Save Banner Media
            if (!empty($request->bannerUrl)) {
                MediaUploadHelper::addFromDataOrUrl($bidang, $request->bannerUrl, 'banner', 'bidang-banner');
            }

            // Format Kepala Bagian Media Sosial
            $kepalaMediaSosial = [];
            if (!empty($request->kepalaWa)) {
                $wa = $request->kepalaWa;
                if (!str_starts_with($wa, 'http')) {
                    $clean = preg_replace('/[^0-9+]/', '', $wa);
                    if (str_starts_with($clean, '0')) {
                        $clean = '62' . substr($clean, 1);
                    } else {
                        $clean = ltrim($clean, '+');
                    }
                    $wa = 'https://wa.me/' . $clean;
                }
                $kepalaMediaSosial[] = ['platform' => 'whatsapp', 'url' => $wa];
            }
            if (!empty($request->kepalaEmail)) {
                $email = $request->kepalaEmail;
                if (!str_starts_with($email, 'mailto:')) {
                    $email = 'mailto:' . $email;
                }
                $kepalaMediaSosial[] = ['platform' => 'email', 'url' => $email];
            }
            if (!empty($request->kepalaLinkedin)) {
                $kepalaMediaSosial[] = ['platform' => 'linkedin', 'url' => $request->kepalaLinkedin];
            }
            if (!empty($request->kepalaInstagram)) {
                $ig = trim($request->kepalaInstagram);
                if (str_starts_with($ig, '@')) {
                    $ig = substr($ig, 1);
                }
                if (str_contains($ig, 'instagram.com/')) {
                    $parts = explode('instagram.com/', $ig);
                    $ig = rtrim(end($parts), '/');
                }
                $kepalaMediaSosial[] = ['platform' => 'instagram', 'url' => 'https://instagram.com/' . $ig];
            }

            // Save Kepala Bagian
            $kepala = $bidang->kepalaBagian()->create([
                'nama' => $request->kepalaNama,
                'jabatan' => $request->kepalaJabatan,
                'deskripsi_tugas' => $request->kepalaTugas,
                'media_sosial' => $kepalaMediaSosial,
            ]);

            // Save Kepala Bagian Foto Media
            if (!empty($request->kepalaFoto)) {
                MediaUploadHelper::addFromDataOrUrl($kepala, $request->kepalaFoto, 'foto', 'kepala-bagian');
            }

            // Save Anggotas
            if (!empty($request->anggota)) {
                foreach ($request->anggota as $index => $ang) {
                    if (!empty($ang['nama']) && !empty($ang['jabatan'])) {
                        $anggota = $bidang->anggotas()->create([
                            'nama' => $ang['nama'],
                            'jabatan' => $ang['jabatan'],
                            'urutan' => $index + 1,
                            'media_sosial' => $ang['media_sosial'] ?? [],
                        ]);

                        if (!empty($ang['foto'])) {
                            MediaUploadHelper::addFromDataOrUrl($anggota, $ang['foto'], 'foto', 'anggota-staf');
                        }
                    }
                }
            }
        });

        return redirect()->route('admin.bidang.index')->with('success', 'Bidang baru berhasil didaftarkan.');
    }

    /**
     * Show the form for editing the specified division.
     */
    public function edit($id): Response
    {
        $bid = Bidang::findOrFail($id);

        $bidang = [
            'id' => (string)$bid->id,
            'nama' => $bid->nama,
            'slug' => $bid->slug,
            'deskripsiSingkat' => $bid->deskripsi_singkat,
            'deskripsiLengkap' => html_entity_decode($bid->deskripsi_lengkap),
            'bannerUrl' => $bid->getFirstMediaUrl('banner') ?: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800',
            'kepalaBagian' => $bid->kepalaBagian ? [
                'nama' => $bid->kepalaBagian->nama,
                'jabatan' => $bid->kepalaBagian->jabatan,
                'foto' => $bid->kepalaBagian->getFirstMediaUrl('foto') ?: 'https://smart.umri.ac.id/application/modules/personalia/assets/uploads/foto/default.jpg',
                'deskripsiTugas' => $bid->kepalaBagian->deskripsi_tugas ?? '',
                'media_sosial' => $bid->kepalaBagian->media_sosial ?? [],
            ] : [
                'nama' => '',
                'jabatan' => '',
                'foto' => 'https://smart.umri.ac.id/application/modules/personalia/assets/uploads/foto/default.jpg',
                'deskripsiTugas' => '',
                'media_sosial' => [],
            ],
            'anggota' => $bid->anggotas->map(function ($ang) {
                return [
                    'nama' => $ang->nama,
                    'jabatan' => $ang->jabatan,
                    'foto' => $ang->getFirstMediaUrl('foto') ?: '',
                    'media_sosial' => $ang->media_sosial ?? [],
                ];
            })->toArray(),
            'cta' => $bid->cta_heading ? [
                'heading' => $bid->cta_heading,
                'subCta' => $bid->cta_sub ?? '',
                'btnText' => $bid->cta_teks_tombol ?? 'Hubungi Kami',
                'btnUrl' => $bid->cta_tautan ?? '',
            ] : null,
        ];

        return Inertia::render('admin/bidang/edit', [
            'bidang' => $bidang,
        ]);
    }

    /**
     * Update the specified division.
     */
    public function update(Request $request, $id)
    {
        $bidang = Bidang::findOrFail($id);

        $request->validate([
            'nama' => 'required|string|max:100',
            'slug' => 'required|string|max:120|unique:bidangs,slug,' . $id . '|regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
            'deskripsiSingkat' => 'required|string|max:200',
            'deskripsiLengkap' => 'required|string|max:2000',
            'bannerUrl' => 'required|string',
            'kepalaNama' => 'required|string|max:100',
            'kepalaJabatan' => 'required|string|max:100',
            'kepalaFoto' => 'required|string',
            'kepalaTugas' => 'nullable|string|max:500',
            'kepalaWa' => 'nullable|string|max:200',
            'kepalaEmail' => 'nullable|string|max:200',
            'kepalaLinkedin' => 'nullable|string|max:300',
            'kepalaInstagram' => 'nullable|string|max:300',
            'anggota' => 'present|array|max:20',
            'anggota.*.nama' => 'required_with:anggota.*.jabatan|string|max:100',
            'anggota.*.jabatan' => 'required_with:anggota.*.nama|string|max:100',
            'anggota.*.foto' => 'nullable|string',
            'anggota.*.media_sosial' => 'nullable|array',
            'ctaHeading' => 'nullable|string|max:100',
            'ctaSub' => 'nullable|string|max:100',
            'ctaBtnText' => 'nullable|string|max:30',
            'ctaBtnUrl' => 'nullable|string|max:500',
        ]);

        DB::transaction(function () use ($request, $bidang) {
            $bidang->update([
                'nama' => $request->nama,
                'slug' => $request->slug,
                'deskripsi_singkat' => $request->deskripsiSingkat,
                'deskripsi_lengkap' => RichTextSanitizer::sanitize($request->deskripsiLengkap),
                'cta_heading' => $request->ctaHeading,
                'cta_sub' => $request->ctaSub,
                'cta_teks_tombol' => $request->ctaBtnText ?? 'Hubungi Kami',
                'cta_tautan' => $request->ctaBtnUrl,
            ]);

            // Update Banner Media
            if (!empty($request->bannerUrl)) {
                $bannerUrl = $request->bannerUrl;
                $currentMediaUrl = $bidang->getFirstMediaUrl('banner');

                if (MediaUploadHelper::isNewUpload($bannerUrl, $currentMediaUrl)) {
                    MediaUploadHelper::addFromDataOrUrl($bidang, $bannerUrl, 'banner', 'bidang-banner');
                }
            }

            // Format Kepala Bagian Media Sosial
            $kepalaMediaSosial = [];
            if (!empty($request->kepalaWa)) {
                $wa = $request->kepalaWa;
                if (!str_starts_with($wa, 'http')) {
                    $clean = preg_replace('/[^0-9+]/', '', $wa);
                    if (str_starts_with($clean, '0')) {
                        $clean = '62' . substr($clean, 1);
                    } else {
                        $clean = ltrim($clean, '+');
                    }
                    $wa = 'https://wa.me/' . $clean;
                }
                $kepalaMediaSosial[] = ['platform' => 'whatsapp', 'url' => $wa];
            }
            if (!empty($request->kepalaEmail)) {
                $email = $request->kepalaEmail;
                if (!str_starts_with($email, 'mailto:')) {
                    $email = 'mailto:' . $email;
                }
                $kepalaMediaSosial[] = ['platform' => 'email', 'url' => $email];
            }
            if (!empty($request->kepalaLinkedin)) {
                $kepalaMediaSosial[] = ['platform' => 'linkedin', 'url' => $request->kepalaLinkedin];
            }
            if (!empty($request->kepalaInstagram)) {
                $ig = trim($request->kepalaInstagram);
                if (str_starts_with($ig, '@')) {
                    $ig = substr($ig, 1);
                }
                if (str_contains($ig, 'instagram.com/')) {
                    $parts = explode('instagram.com/', $ig);
                    $ig = rtrim(end($parts), '/');
                }
                $kepalaMediaSosial[] = ['platform' => 'instagram', 'url' => 'https://instagram.com/' . $ig];
            }

            // Update Kepala Bagian
            $kepala = $bidang->kepalaBagian()->updateOrCreate(
                ['bidang_id' => $bidang->id],
                [
                    'nama' => $request->kepalaNama,
                    'jabatan' => $request->kepalaJabatan,
                    'deskripsi_tugas' => $request->kepalaTugas,
                    'media_sosial' => $kepalaMediaSosial,
                ]
            );

            // Update Kepala Bagian Foto Media
            if (!empty($request->kepalaFoto)) {
                $kepalaFoto = $request->kepalaFoto;
                $currentMediaUrl = $kepala->getFirstMediaUrl('foto');

                if (MediaUploadHelper::isNewUpload($kepalaFoto, $currentMediaUrl)) {
                    MediaUploadHelper::addFromDataOrUrl($kepala, $kepalaFoto, 'foto', 'kepala-bagian');
                }
            }

            // Sync Anggotas: delete all (with media cleanup) and recreate
            $existingAnggotas = $bidang->anggotas()->get();
            foreach ($existingAnggotas as $oldAnggota) {
                $oldAnggota->clearMediaCollection('foto');
                $oldAnggota->delete();
            }

            if (!empty($request->anggota)) {
                foreach ($request->anggota as $index => $ang) {
                    if (!empty($ang['nama']) && !empty($ang['jabatan'])) {
                        $anggota = $bidang->anggotas()->create([
                            'nama' => $ang['nama'],
                            'jabatan' => $ang['jabatan'],
                            'urutan' => $index + 1,
                            'media_sosial' => $ang['media_sosial'] ?? [],
                        ]);

                        if (!empty($ang['foto'])) {
                            MediaUploadHelper::addFromDataOrUrl($anggota, $ang['foto'], 'foto', 'anggota-staf');
                        }
                    }
                }
            }
        });

        return redirect()->route('admin.bidang.index')->with('success', 'Data bidang berhasil diperbarui.');
    }

    /**
     * Remove the specified division.
     */
    public function destroy($id)
    {
        $bidang = Bidang::with(['kepalaBagian', 'anggotas'])->findOrFail($id);

        DB::transaction(function () use ($bidang) {
            // Clear media on all anggota
            foreach ($bidang->anggotas as $anggota) {
                $anggota->clearMediaCollection('foto');
                $anggota->delete();
            }

            // Clear kepala bagian foto
            if ($bidang->kepalaBagian) {
                $bidang->kepalaBagian->clearMediaCollection('foto');
                $bidang->kepalaBagian->delete();
            }

            // Force delete the bidang (also clears banner media via Spatie)
            $bidang->forceDelete();
        });

        // Adjust urutan on remaining bidangs
        $bidangs = Bidang::orderBy('urutan')->get();
        foreach ($bidangs as $index => $b) {
            $b->update(['urutan' => $index + 1]);
        }

        return redirect()->route('admin.bidang.index')->with('success', 'Bidang berhasil dihapus.');
    }

    /**
     * Reorder divisions list.
     */
    public function reorder(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'required|integer|exists:bidangs,id',
        ]);

        foreach ($request->ids as $index => $id) {
            Bidang::where('id', $id)->update(['urutan' => $index + 1]);
        }

        return redirect()->route('admin.bidang.index')->with('success', 'Urutan bidang berhasil diperbarui.');
    }
}
