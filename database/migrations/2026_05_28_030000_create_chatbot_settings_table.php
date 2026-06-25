<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chatbot_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->longText('value')->nullable();
            $table->timestamps();
        });

        // Seed default values
        $defaults = [
            'chatbot_enabled' => '1',
            'primary_provider' => 'nvidia',
            'primary_base_url' => 'https://integrate.api.nvidia.com/v1',
            'primary_api_key' => '',
            'primary_model' => 'openai/gpt-oss-120b',
            'fallback_enabled' => '0',
            'fallback_provider' => 'nvidia',
            'fallback_base_url' => 'https://integrate.api.nvidia.com/v1',
            'fallback_api_key' => '',
            'fallback_model' => 'meta/llama-3.1-8b-instruct',
            'temperature' => '0.2',
            'top_p' => '0.7',
            'max_tokens' => '1024',
            'rate_limit' => '10',
            'context_max_messages' => '20',
            'max_input_length' => '500',
            'greeting_message' => 'Halo! 👋 Saya Asisten Virtual BKA UMRI. Ada yang bisa saya bantu hari ini?',
            'system_prompt' => '',
        ];

        $now = now();
        foreach ($defaults as $key => $value) {
            \DB::table('chatbot_settings')->insert([
                'key' => $key,
                'value' => $value,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('chatbot_settings');
    }
};
