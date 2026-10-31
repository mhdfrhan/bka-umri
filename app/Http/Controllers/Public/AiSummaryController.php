<?php

namespace App\Http\Controllers\Public;

use App\Enums\ContentStatus;
use App\Http\Controllers\Controller;
use App\Models\Berita;
use App\Models\Pengumuman;
use App\Services\ChatbotService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class AiSummaryController extends Controller
{
    /**
     * Generate or fetch cached AI summary for public news or announcement.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function summarize(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id' => 'required|integer',
            'type' => 'required|in:berita,pengumuman',
        ]);

        $id = (int) $validated['id'];
        $type = $validated['type'];

        // 1. Fetch entity & verify published status
        if ($type === 'berita') {
            $item = Berita::find($id);
            $content = $item?->isi ?? '';
        } else {
            $item = Pengumuman::find($id);
            $content = $item?->isi ?? '';
        }

        if (!$item || $item->status !== ContentStatus::TERPUBLIKASI) {
            return response()->json([
                'success' => false,
                'message' => 'Artikel atau pengumuman tidak ditemukan atau belum dipublikasikan.',
            ], 404);
        }

        $updatedAt = $item->updated_at ? $item->updated_at->timestamp : 0;
        $cacheKey = "ai_summary_{$type}_{$id}_{$updatedAt}";

        // 2. Fetch from server cache or generate fresh summary
        $summary = Cache::remember($cacheKey, now()->addDays(30), function () use ($item, $content, $type) {
            return ChatbotService::generateArticleSummary($item->judul, $content, $type);
        });

        if (!$summary) {
            // Remove failed cache entry so it can retry cleanly next time
            Cache::forget($cacheKey);

            return response()->json([
                'success' => false,
                'message' => 'Maaf, ringkasan AI belum dapat diproses saat ini. Silakan coba beberapa saat lagi.',
            ], 503);
        }

        return response()->json([
            'success' => true,
            'summary' => $summary,
            'updated_at' => $updatedAt,
            'type' => $type,
            'id' => $id,
        ]);
    }
}
