<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Pengumuman;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Str;

class PengumumanController extends Controller
{
    /**
     * Display a listing of public announcements.
     */
    public function index(Request $request): Response
    {
        $search = $request->query('search');

        $query = Pengumuman::with('penulis')
            ->terpublikasi()
            ->pentingFirst();

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('judul', 'like', "%{$search}%")
                  ->orWhere('isi', 'like', "%{$search}%");
            });
        }

        $pengumumans = $query->paginate(6)
            ->withQueryString()
            ->through(function ($item) {
                return [
                    'slug' => $item->slug,
                    'title' => $item->judul,
                    'date' => $item->tanggal_publikasi ? $item->tanggal_publikasi->format('Y-m-d') : $item->created_at->format('Y-m-d'),
                    'isPenting' => (bool)$item->is_penting,
                    'excerpt' => Str::limit(strip_tags($item->isi), 160),
                ];
            });

        return Inertia::render('public/pengumuman/index', [
            'pengumumans' => $pengumumans,
            'filters' => [
                'search' => $search ?? '',
            ]
        ]);
    }

    /**
     * Display the specified announcement.
     */
    public function show(string $slug): Response
    {
        $item = Pengumuman::with('penulis')
            ->terpublikasi()
            ->where('slug', $slug)
            ->firstOrFail();

        $announcement = [
            'title' => $item->judul,
            'slug' => $item->slug,
            'content' => $item->isi,
            'isPenting' => (bool)$item->is_penting,
            'date' => $item->tanggal_publikasi ? $item->tanggal_publikasi->format('Y-m-d') : $item->created_at->format('Y-m-d'),
            'thumbnail' => $item->getFirstMediaUrl('thumbnail') ?: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&q=80',
            'attachments' => $item->getMedia('lampirans')->map(function ($media) {
                return [
                    'name' => $media->file_name,
                    'url' => $media->getUrl(),
                    'size' => $media->human_readable_size,
                    'extension' => $media->extension,
                ];
            })->toArray(),
        ];

        return Inertia::render('public/pengumuman/show', [
            'announcement' => $announcement,
        ]);
    }
}
