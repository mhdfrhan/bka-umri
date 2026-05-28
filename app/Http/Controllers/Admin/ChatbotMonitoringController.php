<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ChatbotConversation;
use App\Models\ChatbotMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ChatbotMonitoringController extends Controller
{
    /**
     * Display chatbot monitoring dashboard.
     */
    public function index(Request $request): Response
    {
        $stats = $this->getStatsData();

        // Get paginated conversations list
        $conversations = ChatbotConversation::orderBy('last_activity_at', 'desc')
            ->withCount(['messages' => function ($q) {
                $q->whereIn('role', ['user', 'assistant']);
            }])
            ->paginate(10)
            ->through(function ($convo) {
                // Calculate duration between first and last message
                $firstMsg = $convo->messages()->orderBy('created_at', 'asc')->first();
                $lastMsg = $convo->messages()->orderBy('created_at', 'desc')->first();
                $duration = 0;
                if ($firstMsg && $lastMsg) {
                    $duration = $lastMsg->created_at->diffInSeconds($firstMsg->created_at);
                }

                return [
                    'id' => $convo->id,
                    'session_id' => $convo->session_id,
                    'ip_address' => $convo->ip_address ?? 'Unknown',
                    'user_agent' => $convo->user_agent ? substr($convo->user_agent, 0, 50) . '...' : 'Unknown',
                    'messages_count' => $convo->messages_count,
                    'duration_seconds' => $duration,
                    'last_activity_at' => $convo->last_activity_at->toIso8601String(),
                ];
            });

        return Inertia::render('admin/chatbot/monitoring', [
            'stats' => $stats,
            'conversations' => $conversations,
        ]);
    }

    /**
     * Fetch list of conversations (paginated/filtered).
     */
    public function conversations(Request $request)
    {
        $query = ChatbotConversation::orderBy('last_activity_at', 'desc');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('session_id', 'like', "%{$search}%")
                  ->orWhere('ip_address', 'like', "%{$search}%")
                  ->orWhere('user_agent', 'like', "%{$search}%");
            });
        }

        $conversations = $query->withCount(['messages' => function ($q) {
                $q->whereIn('role', ['user', 'assistant']);
            }])
            ->paginate(15)
            ->through(function ($convo) {
                $firstMsg = $convo->messages()->orderBy('created_at', 'asc')->first();
                $lastMsg = $convo->messages()->orderBy('created_at', 'desc')->first();
                $duration = 0;
                if ($firstMsg && $lastMsg) {
                    $duration = $lastMsg->created_at->diffInSeconds($firstMsg->created_at);
                }

                return [
                    'id' => $convo->id,
                    'session_id' => $convo->session_id,
                    'ip_address' => $convo->ip_address ?? 'Unknown',
                    'user_agent' => $convo->user_agent ?? 'Unknown',
                    'messages_count' => $convo->messages_count,
                    'duration_seconds' => $duration,
                    'last_activity_at' => $convo->last_activity_at->toIso8601String(),
                ];
            });

        return response()->json($conversations);
    }

    /**
     * Display specific conversation transcript.
     */
    public function showConversation(int $id): Response
    {
        $conversation = ChatbotConversation::findOrFail($id);

        $messages = $conversation->messages()
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($msg) {
                return [
                    'id' => $msg->id,
                    'role' => $msg->role,
                    'content' => $msg->content,
                    'token_count' => $msg->token_count,
                    'model_used' => $msg->model_used,
                    'response_time_ms' => $msg->response_time_ms,
                    'was_fallback' => $msg->was_fallback,
                    'was_blocked' => $msg->was_blocked,
                    'created_at' => $msg->created_at->toIso8601String(),
                ];
            });

        $firstMsg = $conversation->messages()->orderBy('created_at', 'asc')->first();
        $lastMsg = $conversation->messages()->orderBy('created_at', 'desc')->first();
        $duration = 0;
        if ($firstMsg && $lastMsg) {
            $duration = $lastMsg->created_at->diffInSeconds($firstMsg->created_at);
        }

        $convoData = [
            'id' => $conversation->id,
            'session_id' => $conversation->session_id,
            'ip_address' => $conversation->ip_address ?? 'Unknown',
            'user_agent' => $conversation->user_agent ?? 'Unknown',
            'created_at' => $conversation->created_at->toIso8601String(),
            'last_activity_at' => $conversation->last_activity_at->toIso8601String(),
            'duration_seconds' => $duration,
            'messages_count' => $messages->count(),
        ];

        return Inertia::render('admin/chatbot/conversation-detail', [
            'conversation' => $convoData,
            'messages' => $messages,
        ]);
    }

    /**
     * Clear all conversations logs.
     */
    public function clearConversations(): RedirectResponse
    {
        ChatbotConversation::query()->delete(); // Cascades deletes to messages via database constraint
        
        activity('chatbot_monitoring')
            ->causedBy(auth()->user())
            ->log('Menghapus semua riwayat percakapan chatbot');

        return redirect()->route('admin.chatbot.monitoring')->with('success', 'Semua riwayat percakapan chatbot berhasil dibersihkan.');
    }

    /**
     * JSON API Endpoint for live monitoring statistics.
     */
    public function apiStats(): JsonResponse
    {
        return response()->json($this->getStatsData());
    }

    /**
     * Helper to compute chatbot monitoring statistics.
     */
    private function getStatsData(): array
    {
        $today = now()->startOfDay();

        $totalConversations = ChatbotConversation::count();
        $todayConversations = ChatbotConversation::where('created_at', '>=', $today)->count();

        $totalMessages = ChatbotMessage::whereIn('role', ['user', 'assistant'])->count();
        $todayMessages = ChatbotMessage::whereIn('role', ['user', 'assistant'])
            ->where('created_at', '>=', $today)
            ->count();

        $avgLatency = ChatbotMessage::where('role', 'assistant')
            ->whereNotNull('response_time_ms')
            ->average('response_time_ms') ?? 0;

        $totalFallback = ChatbotMessage::where('role', 'assistant')
            ->where('was_fallback', true)
            ->count();

        $totalBlocked = ChatbotMessage::where('was_blocked', true)->count();

        $totalTokens = ChatbotMessage::sum('token_count') ?? 0;

        // Message volume trend for the last 7 days
        $trend = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $start = now()->subDays($i)->startOfDay();
            $end = now()->subDays($i)->endOfDay();

            $count = ChatbotMessage::whereIn('role', ['user', 'assistant'])
                ->whereBetween('created_at', [$start, $end])
                ->count();

            $trend[] = [
                'date' => $date,
                'count' => $count,
                'label' => now()->subDays($i)->translatedFormat('d M'),
            ];
        }

        return [
            'totalConversations' => $totalConversations,
            'todayConversations' => $todayConversations,
            'totalMessages' => $totalMessages,
            'todayMessages' => $todayMessages,
            'avgLatencyMs' => round($avgLatency),
            'totalFallback' => $totalFallback,
            'totalBlocked' => $totalBlocked,
            'totalTokens' => $totalTokens,
            'trend' => $trend,
        ];
    }
}
