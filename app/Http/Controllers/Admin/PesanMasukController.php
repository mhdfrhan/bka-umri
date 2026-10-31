<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PesanKontak;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PesanMasukController extends Controller
{
    /**
     * Display a listing of incoming contact messages.
     */
    public function index(Request $request): Response
    {
        $query = PesanKontak::latest('created_at');

        if ($request->filled('filter')) {
            if ($request->filter === 'unread') {
                $query->where('is_read', false);
            } elseif ($request->filter === 'read') {
                $query->where('is_read', true);
            }
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('nomor_wa', 'like', "%{$search}%")
                  ->orWhere('subjek', 'like', "%{$search}%")
                  ->orWhere('pesan', 'like', "%{$search}%");
            });
        }

        $messages = $query->get()->map(function ($msg) {
            return [
                'id' => (string) $msg->id,
                'nama' => $msg->nama,
                'email' => $msg->email,
                'nomor_wa' => $msg->nomor_wa ?? '',
                'subjek' => $msg->subjek,
                'pesan' => $msg->pesan,
                'dibaca' => (bool) $msg->is_read,
                'tanggal' => $msg->created_at ? $msg->created_at->toISOString() : null,
            ];
        })->toArray();

        $stats = [
            'total' => PesanKontak::count(),
            'unread' => PesanKontak::where('is_read', false)->count(),
            'read' => PesanKontak::where('is_read', true)->count(),
        ];

        return Inertia::render('admin/kontak-masuk/index', [
            'messages' => $messages,
            'stats' => $stats,
            'filters' => [
                'search' => $request->search ?? '',
                'filter' => $request->filter ?? 'all',
            ],
        ]);
    }

    /**
     * Toggle read status of a message.
     */
    public function toggleRead($id)
    {
        $message = PesanKontak::findOrFail($id);
        $message->is_read = ! $message->is_read;
        $message->save();

        $statusStr = $message->is_read ? 'sudah dibaca' : 'belum dibaca';

        return redirect()->route('admin.kontak-masuk.index')->with('success', "Pesan ditandai sebagai {$statusStr}.");
    }

    /**
     * Delete an incoming message.
     */
    public function destroy($id)
    {
        $message = PesanKontak::findOrFail($id);
        $message->delete();

        return redirect()->route('admin.kontak-masuk.index')->with('success', 'Pesan kontak berhasil dihapus.');
    }
}
