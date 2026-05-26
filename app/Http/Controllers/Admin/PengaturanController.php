<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pengaturan;
use App\Models\PesanKontak;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PengaturanController extends Controller
{
    /**
     * Display the settings page.
     *
     * @param Request $request
     * @return Response
     */
    public function index(Request $request): Response
    {
        $rawSosmed = Pengaturan::getValue('media_sosial');
        $mediaSosial = [];
        if ($rawSosmed) {
            $decoded = json_decode($rawSosmed, true);
            if (is_array($decoded)) {
                $mediaSosial = $decoded;
            }
        }

        $dbSettings = [
            'alamat' => Pengaturan::getValue('alamat', ''),
            'telepon' => Pengaturan::getValue('telepon', ''),
            'email' => Pengaturan::getValue('email', ''),
            'jam_operasional' => Pengaturan::getValue('jam_operasional', ''),
            'google_maps_embed' => Pengaturan::getValue('google_maps_embed', ''),
            'mediaSosial' => $mediaSosial,
            'nama_website' => Pengaturan::getValue('nama_website', 'Biro Keuangan & Aset UMRI'),
            'deskripsi_seo' => Pengaturan::getValue('deskripsi_seo', ''),
            'logo_base64' => Pengaturan::getValue('logo_base64'),
            'favicon_base64' => Pengaturan::getValue('favicon_base64'),
            'pemberitahuan_aktif' => Pengaturan::getValue('pemberitahuan_aktif', '0'),
            'pemberitahuan_gambar' => Pengaturan::getValue('pemberitahuan_gambar'),
            'pemberitahuan_link_url' => Pengaturan::getValue('pemberitahuan_link_url', ''),
            'pemberitahuan_link_teks' => Pengaturan::getValue('pemberitahuan_link_teks', ''),
            'pemberitahuan_tombol_teks' => Pengaturan::getValue('pemberitahuan_tombol_teks', ''),
        ];

        $dbInbox = PesanKontak::orderBy('created_at', 'desc')
            ->get()
            ->map(function ($msg) {
                return [
                    'id' => (string)$msg->id,
                    'nama' => $msg->nama,
                    'email' => $msg->email,
                    'subjek' => $msg->subjek,
                    'pesan' => $msg->pesan,
                    'tanggal' => $msg->created_at->toIso8601String(),
                    'dibaca' => $msg->is_read,
                ];
            })
            ->toArray();

        return Inertia::render('admin/settings/index', [
            'dbSettings' => $dbSettings,
            'dbInbox' => $dbInbox,
        ]);
    }

    /**
     * Update settings.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateSettings(Request $request)
    {
        // 1. If modifying system settings (nama_website, deskripsi_seo, logo, favicon), restrict to Super Admin
        $isSuperAdmin = auth()->user()->hasRole('super_admin');
        
        $keysToUpdate = [];
        
        if ($request->has('alamat')) {
            $request->validate([
                'alamat' => 'required|string',
                'telepon' => 'required|string',
                'email' => 'required|email',
                'jam_operasional' => 'required|string',
                'google_maps_embed' => 'required|string',
            ]);
            $keysToUpdate = [
                'alamat' => $request->input('alamat'),
                'telepon' => $request->input('telepon'),
                'email' => $request->input('email'),
                'jam_operasional' => $request->input('jam_operasional'),
                'google_maps_embed' => $request->input('google_maps_embed'),
            ];
        } elseif ($request->has('mediaSosial')) {
            $request->validate([
                'mediaSosial' => 'required|array',
                'mediaSosial.*.platform' => 'required|string',
                'mediaSosial.*.url' => 'required|url',
            ]);
            $keysToUpdate = [
                'media_social_raw' => $request->input('mediaSosial') // helper mapping
            ];
        } elseif ($request->has('nama_website')) {
            if (!$isSuperAdmin) {
                return response()->json(['error' => 'Akses ditolak.'], 403);
            }
            $request->validate([
                'nama_website' => 'required|string|max:100',
                'deskripsi_seo' => 'required|string|max:160',
                'logo_base64' => 'nullable|string',
                'favicon_base64' => 'nullable|string',
            ]);
            $keysToUpdate = [
                'nama_website' => $request->input('nama_website'),
                'deskripsi_seo' => $request->input('deskripsi_seo'),
            ];
            if ($request->has('logo_base64')) {
                $keysToUpdate['logo_base64'] = $request->input('logo_base64');
            }
            if ($request->has('favicon_base64')) {
                $keysToUpdate['favicon_base64'] = $request->input('favicon_base64');
            }
        } elseif ($request->has('pemberitahuan_aktif')) {
            $request->validate([
                'pemberitahuan_aktif' => 'required|in:0,1',
                'pemberitahuan_gambar' => 'nullable|string',
                'pemberitahuan_link_url' => 'nullable|string',
                'pemberitahuan_link_teks' => 'nullable|string|max:100',
                'pemberitahuan_tombol_teks' => 'nullable|string|max:50',
            ]);
            $keysToUpdate = [
                'pemberitahuan_aktif' => $request->input('pemberitahuan_aktif'),
                'pemberitahuan_link_url' => $request->input('pemberitahuan_link_url') ?? '',
                'pemberitahuan_link_teks' => $request->input('pemberitahuan_link_teks') ?? '',
                'pemberitahuan_tombol_teks' => $request->input('pemberitahuan_tombol_teks') ?? '',
            ];
            if ($request->has('pemberitahuan_gambar')) {
                $keysToUpdate['pemberitahuan_gambar'] = $request->input('pemberitahuan_gambar');
            }
        }

        foreach ($keysToUpdate as $key => $val) {
            if ($key === 'media_social_raw') {
                Pengaturan::setValue('media_sosial', json_encode($val));
            } else {
                Pengaturan::setValue($key, $val);
            }
        }

        // Record activity log
        activity('pengaturan')
            ->causedBy(auth()->user())
            ->log('Mengubah pengaturan sistem');

        return redirect()->back()->with('success', 'Pengaturan berhasil diperbarui.');
    }

    /**
     * Toggle read status of inbox message.
     *
     * @param int $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function toggleRead($id)
    {
        $message = PesanKontak::findOrFail($id);
        $message->is_read = !$message->is_read;
        $message->save();

        $statusStr = $message->is_read ? 'sudah dibaca' : 'belum dibaca';
        return redirect()->back()->with('success', "Pesan ditandai sebagai {$statusStr}.");
    }

    /**
     * Delete an inbox message.
     *
     * @param int $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroyMessage($id)
    {
        $message = PesanKontak::findOrFail($id);
        $message->delete();

        return redirect()->back()->with('success', 'Pesan berhasil dihapus.');
    }
}
