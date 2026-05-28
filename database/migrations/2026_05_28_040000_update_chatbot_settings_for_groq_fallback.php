<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $settings = [
            'fallback_enabled' => '1',
            'fallback_provider' => 'groq',
            'fallback_base_url' => 'https://api.groq.com/openai/v1',
            'fallback_api_key' => '', // Set via admin panel or environment config
            'fallback_model' => 'llama-3.3-70b-versatile',
        ];

        foreach ($settings as $key => $value) {
            DB::table('chatbot_settings')->updateOrInsert(
                ['key' => $key],
                ['value' => $value, 'updated_at' => now()]
            );
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $settings = [
            'fallback_enabled' => '0',
            'fallback_provider' => 'nvidia',
            'fallback_base_url' => 'https://integrate.api.nvidia.com/v1',
            'fallback_api_key' => '',
            'fallback_model' => 'meta/llama-3.1-8b-instruct',
        ];

        foreach ($settings as $key => $value) {
            DB::table('chatbot_settings')->updateOrInsert(
                ['key' => $key],
                ['value' => $value, 'updated_at' => now()]
            );
        }
    }
};
