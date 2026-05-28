<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ChatbotSetting;
use App\Services\ChatbotService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ChatbotSettingController extends Controller
{
    /**
     * Display chatbot settings page.
     */
    public function index(): Response
    {
        $settings = [
            'chatbot_enabled' => ChatbotSetting::getValue('chatbot_enabled', '1'),
            'primary_provider' => ChatbotSetting::getValue('primary_provider', 'nvidia'),
            'primary_base_url' => ChatbotSetting::getValue('primary_base_url', 'https://integrate.api.nvidia.com/v1'),
            'primary_api_key' => ChatbotSetting::getValue('primary_api_key', ''),
            'primary_model' => ChatbotSetting::getValue('primary_model', 'meta/llama-3.3-70b-instruct'),
            'fallback_enabled' => ChatbotSetting::getValue('fallback_enabled', '0'),
            'fallback_provider' => ChatbotSetting::getValue('fallback_provider', 'nvidia'),
            'fallback_base_url' => ChatbotSetting::getValue('fallback_base_url', 'https://integrate.api.nvidia.com/v1'),
            'fallback_api_key' => ChatbotSetting::getValue('fallback_api_key', ''),
            'fallback_model' => ChatbotSetting::getValue('fallback_model', 'nvidia/nemotron-3-super-120b-a12b'),
            'temperature' => ChatbotSetting::getValue('temperature', '0.2'),
            'top_p' => ChatbotSetting::getValue('top_p', '0.7'),
            'max_tokens' => ChatbotSetting::getValue('max_tokens', '1024'),
            'rate_limit' => ChatbotSetting::getValue('rate_limit', '10'),
            'context_max_messages' => ChatbotSetting::getValue('context_max_messages', '20'),
            'max_input_length' => ChatbotSetting::getValue('max_input_length', '500'),
            'greeting_message' => ChatbotSetting::getValue('greeting_message', 'Halo! 👋 Saya Asisten Virtual BKA UMRI. Ada yang bisa saya bantu hari ini?'),
            'system_prompt' => ChatbotSetting::getValue('system_prompt', ''),
        ];

        return Inertia::render('admin/chatbot/index', [
            'settings' => $settings,
        ]);
    }

    /**
     * Update chatbot settings.
     */
    public function updateSettings(Request $request): RedirectResponse
    {
        $request->validate([
            'chatbot_enabled' => 'required|in:0,1',
            'primary_provider' => 'required|string',
            'primary_base_url' => 'required|string',
            'primary_api_key' => 'nullable|string',
            'primary_model' => 'required|string',
            'fallback_enabled' => 'required|in:0,1',
            'fallback_provider' => 'required|string',
            'fallback_base_url' => 'required|string',
            'fallback_api_key' => 'nullable|string',
            'fallback_model' => 'required|string',
            'temperature' => 'required|numeric|min:0|max:1',
            'top_p' => 'required|numeric|min:0|max:1',
            'max_tokens' => 'required|integer|min:1|max:4096',
            'rate_limit' => 'required|integer|min:1',
            'context_max_messages' => 'required|integer|min:1',
            'max_input_length' => 'required|integer|min:10',
            'greeting_message' => 'required|string',
            'system_prompt' => 'nullable|string',
        ]);

        $settings = $request->except(['_token', 'primary_api_key', 'fallback_api_key']);

        foreach ($settings as $key => $value) {
            ChatbotSetting::setValue($key, (string)$value);
        }

        // Update API keys only if they were modified from obfuscated state
        if ($request->filled('primary_api_key') && $request->input('primary_api_key') !== '••••••••') {
            ChatbotSetting::setValue('primary_api_key', $request->input('primary_api_key'));
        }
        if ($request->filled('fallback_api_key') && $request->input('fallback_api_key') !== '••••••••') {
            ChatbotSetting::setValue('fallback_api_key', $request->input('fallback_api_key'));
        }

        // Record activity log
        activity('chatbot_setting')
            ->causedBy(auth()->user())
            ->log('Mengubah pengaturan Chatbot AI');

        return redirect()->back()->with('success', 'Pengaturan Chatbot berhasil diperbarui.');
    }

    /**
     * Test connection to LLM API.
     */
    public function testConnection(Request $request): JsonResponse
    {
        $request->validate([
            'base_url' => 'required|string',
            'api_key' => 'required|string',
            'model' => 'required|string',
        ]);

        $apiKey = $request->input('api_key');
        if ($apiKey === '••••••••') {
            $isPrimary = $request->input('type') === 'primary';
            $apiKey = ChatbotSetting::getValue($isPrimary ? 'primary_api_key' : 'fallback_api_key', '');
        }

        $result = ChatbotService::testConnection(
            $request->input('base_url'),
            $apiKey,
            $request->input('model')
        );

        return response()->json($result);
    }
}
