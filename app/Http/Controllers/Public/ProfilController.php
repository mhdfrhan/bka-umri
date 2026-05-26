<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\HalamanStatis;
use App\Models\KepalaBiro;
use App\Models\Misi;
use App\Models\Pengaturan;
use App\Models\StrukturAnggota;
use Inertia\Inertia;
use Inertia\Response;

class ProfilController extends Controller
{
    /**
     * Show Tentang Kami page.
     */
    public function tentang(): Response
    {
        $halaman = HalamanStatis::where('slug', 'tentang-kami')->first();
        $konten = $halaman ? $halaman->konten : null;

        return Inertia::render('public/profil/tentang', [
            'konten' => $konten,
        ]);
    }

    /**
     * Show Visi & Misi page.
     */
    public function visiMisi(): Response
    {
        $halaman = HalamanStatis::where('slug', 'visi-misi')->first();
        $visi = $halaman ? $halaman->konten : null;

        $misiItems = Misi::orderBy('urutan')->get()->map(function ($misi) {
            return [
                'id' => $misi->id,
                'isi' => $misi->isi,
                'urutan' => $misi->urutan,
            ];
        });

        return Inertia::render('public/profil/visi-misi', [
            'visi' => $visi,
            'misiItems' => $misiItems,
        ]);
    }

    /**
     * Show Struktur Organisasi page.
     */
    public function struktur(): Response
    {
        $gambarBagan = Pengaturan::getValue('struktur_organisasi_bagan');

        $kepalaBiroModel = KepalaBiro::first();
        $kepalaBiro = $kepalaBiroModel ? [
            'nama' => $kepalaBiroModel->nama,
            'jabatan' => $kepalaBiroModel->jabatan,
            'periode' => $kepalaBiroModel->periode,
            'foto' => $kepalaBiroModel->getFirstMediaUrl('foto') ?: null,
        ] : null;

        $anggotaList = StrukturAnggota::orderBy('urutan')->get()->map(function ($anggota) {
            return [
                'id' => $anggota->id,
                'nama' => $anggota->nama,
                'jabatan' => $anggota->jabatan,
                'foto' => $anggota->getFirstMediaUrl('foto') ?: null,
                'urutan' => $anggota->urutan,
            ];
        });

        return Inertia::render('public/profil/struktur', [
            'gambarBagan' => $gambarBagan,
            'kepalaBiro' => $kepalaBiro,
            'anggotaList' => $anggotaList,
        ]);
    }
}
