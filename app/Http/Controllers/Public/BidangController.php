<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Bidang;
use Inertia\Inertia;
use Inertia\Response;

class BidangController extends Controller
{
    /**
     * Display the specified public division page.
     */
    public function show(string $slug): Response
    {
        $bid = Bidang::where('slug', $slug)
            ->with(['kepalaBagian', 'anggotas'])
            ->firstOrFail();

        $bidang = [
            'nama' => $bid->nama,
            'slug' => $bid->slug,
            'deskripsiLengkap' => $bid->deskripsi_lengkap,
            'banner' => $bid->getFirstMediaUrl('banner') ?: null,
            'kepalaBagian' => $bid->kepalaBagian ? [
                'nama' => $bid->kepalaBagian->nama,
                'jabatan' => $bid->kepalaBagian->jabatan,
                'foto' => $bid->kepalaBagian->getFirstMediaUrl('foto') ?: 'https://smart.umri.ac.id/application/modules/personalia/assets/uploads/foto/default.jpg',
                'deskripsiTugas' => $bid->kepalaBagian->deskripsi_tugas,
                'socialMedia' => $bid->kepalaBagian->media_sosial ?? [],
            ] : null,
            'anggota' => $bid->anggotas->map(function ($ang) {
                return [
                    'nama' => $ang->nama,
                    'jabatan' => $ang->jabatan,
                    'foto' => $ang->getFirstMediaUrl('foto') ?: null,
                    'socialMedia' => $ang->media_sosial ?? [],
                ];
            })->toArray(),
            'cta' => $bid->cta_heading ? [
                'heading' => $bid->cta_heading,
                'sub' => $bid->cta_sub,
                'buttonText' => $bid->cta_teks_tombol,
                'buttonHref' => $bid->cta_tautan,
            ] : null,
        ];

        return Inertia::render('public/bidang/show', [
            'bidang' => $bidang,
        ]);
    }
}
