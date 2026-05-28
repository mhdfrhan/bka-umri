<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Services\ChatbotService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChatbotController extends Controller
{
    /**
     * Stream a chatbot response via SSE.
     */
    public function send(Request $request)
    {
        $request->validate([
            'session_id' => 'required|string|max:100',
            'message' => 'required|string',
        ]);

        $result = ChatbotService::sendMessage(
            $request,
            $request->input('session_id'),
            $request->input('message'),
        );

        // If result is an array, it's an error response
        if (is_array($result)) {
            return response()->json([
                'error' => $result['error'],
                'blocked' => $result['blocked'] ?? false,
            ], $result['code']);
        }

        // Otherwise it's a StreamedResponse
        return $result;
    }

    /**
     * Create a new chat session.
     */
    public function newSession(Request $request): JsonResponse
    {
        return response()->json([
            'session_id' => \Illuminate\Support\Str::uuid()->toString(),
        ]);
    }

    /**
     * Get popular Chatbot FAQs.
     */
    public function faqs(): JsonResponse
    {
        $faqs = \App\Models\ChatbotFaq::where('is_popular', true)
            ->orderBy('urutan')
            ->get(['id', 'label', 'question']);

        return response()->json($faqs);
    }
}

