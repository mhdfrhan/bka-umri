<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ChatbotSetting;

class ChatbotSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            'chatbot_enabled' => '1',
            'primary_provider' => 'nvidia',
            'primary_base_url' => 'https://integrate.api.nvidia.com/v1',
            'primary_api_key' => '',
            'primary_model' => 'openai/gpt-oss-120b',
            
            'fallback_enabled' => '1',
            'fallback_provider' => 'groq',
            'fallback_base_url' => 'https://api.groq.com/openai/v1',
            'fallback_api_key' => '',
            'fallback_model' => 'llama-3.3-70b-versatile',
            
            'temperature' => '1.0',
            'top_p' => '1.0',
            'max_tokens' => '4096',
            'rate_limit' => '10',
            'context_max_messages' => '20',
            'max_input_length' => '500',
            'greeting_message' => 'Halo! 👋 Saya Asisten Virtual BKA UMRI. Ada yang bisa saya bantu hari ini?',
            'system_prompt' => '',
        ];

        foreach ($settings as $key => $value) {
            ChatbotSetting::updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }
    }
}
