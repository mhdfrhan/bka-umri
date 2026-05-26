<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Pengaturan;
use App\Models\PesanKontak;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KontakController extends Controller
{
    /**
     * Display the public contact page.
     *
     * @return Response
     */
    public function index(): Response
    {
        $mediaSosial = [];
        $rawSosmed = Pengaturan::getValue('media_sosial');
        if ($rawSosmed) {
            $decoded = json_decode($rawSosmed, true);
            if (is_array($decoded)) {
                $mediaSosial = $decoded;
            }
        }

        $kontak = [
            'alamat' => Pengaturan::getValue('alamat', "Ruang Biro Keuangan dan Aset, Gedung Rektorat Universitas Muhammadiyah Riau\nJl. T. Tambusai, Kota Pekanbaru"),
            'telepon' => Pengaturan::getValue('telepon', '+62 761 35008 / +62 811-7676-000'),
            'email' => Pengaturan::getValue('email', 'bka@umri.ac.id'),
            'jam_operasional' => Pengaturan::getValue('jam_operasional', "Sen - Jum : 08.00 - 16.00 WIB\nSabtu : 08.00 - 13.00 WIB"),
            'google_maps_embed' => Pengaturan::getValue('google_maps_embed', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d997.4167965592992!2d101.41546138047615!3d0.49870495320004715!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31d5a940e01df989%3A0xdc96c279c6f07bc3!2sUniversitas%20Muhammadiyah%20Riau!5e0!3m2!1sid!2sid!4v1779673086975!5m2!1sid!2sid'),
            'mediaSosial' => $mediaSosial,
        ];

        return Inertia::render('public/kontak/index', [
            'kontak' => $kontak,
        ]);
    }

    /**
     * Store a contact message.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:100',
            'email' => 'required|email|max:255',
            'subjek' => 'required|string|max:150',
            'pesan' => 'required|string|min:20',
        ]);

        PesanKontak::create([
            'nama' => $validated['nama'],
            'email' => $validated['email'],
            'subjek' => $validated['subjek'],
            'pesan' => $validated['pesan'],
            'is_read' => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pesan Anda berhasil terkirim ke sistem BKA UMRI.',
        ]);
    }
}
