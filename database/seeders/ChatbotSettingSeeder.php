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
            'primary_api_key' => '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',
            'primary_model' => 'nvidia/nemotron-3.5-super-vl-120b-a12b',
            
            'fallback_enabled' => '1',
            'fallback_provider' => 'nvidia',
            'fallback_base_url' => 'https://integrate.api.nvidia.com/v1',
            'fallback_api_key' => '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',
            'fallback_model' => 'nvidia/nemotron-3-super-120b-a12b',
            
            'temperature' => '0.3',
            'top_p' => '0.95',
            'max_tokens' => '16384',
            'rate_limit' => '10',
            'context_max_messages' => '20',
            'max_input_length' => '500',
            'greeting_message' => 'Halo! 👋 Saya Asisten Virtual BKA UMRI. Ada yang bisa saya bantu hari ini?',
            'system_prompt' => '',
        ];

        foreach ($settings as $key => $value) {
            if (in_array($key, ['primary_api_key', 'fallback_api_key'], true) && empty($value)) {
                ChatbotSetting::firstOrCreate(
                    ['key' => $key],
                    ['value' => $value]
                );
                continue;
            }
            ChatbotSetting::updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }
    }
}
