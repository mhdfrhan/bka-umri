<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;

class ChatbotSetting extends Model
{
    protected $table = 'chatbot_settings';

    protected $fillable = [
        'key',
        'value',
    ];

    /**
     * Keys that should be encrypted/decrypted automatically.
     */
    private static array $encryptedKeys = [
        'primary_api_key',
        'fallback_api_key',
    ];

    /**
     * Get all chatbot settings from cache.
     *
     * @return array<string, mixed>
     */
    public static function getAllCached(): array
    {
        return Cache::remember('chatbot_settings', 3600, function () {
            $settings = static::pluck('value', 'key')->toArray();

            // Decrypt encrypted keys
            foreach (self::$encryptedKeys as $key) {
                if (isset($settings[$key]) && $settings[$key] !== '') {
                    try {
                        $settings[$key] = Crypt::decryptString($settings[$key]);
                    } catch (\Exception $e) {
                        // If decryption fails, the value might be stored in plaintext (first time)
                        $settings[$key] = $settings[$key];
                    }
                }
            }

            return $settings;
        });
    }

    /**
     * Get a single setting value.
     */
    public static function getValue(string $key, mixed $default = null): mixed
    {
        $settings = static::getAllCached();

        return $settings[$key] ?? $default;
    }

    /**
     * Set a setting value (encrypts API keys automatically).
     */
    public static function setValue(string $key, mixed $value): void
    {
        $storeValue = $value;

        if (in_array($key, self::$encryptedKeys) && $value !== '' && $value !== null) {
            $storeValue = Crypt::encryptString($value);
        }

        static::updateOrCreate(['key' => $key], ['value' => $storeValue]);
        Cache::forget('chatbot_settings');
    }

    /**
     * Check if chatbot is enabled.
     */
    public static function isEnabled(): bool
    {
        return static::getValue('chatbot_enabled', '0') === '1';
    }
}
