<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class IpLocationHelper
{
    /**
     * Get location for a given IP address.
     *
     * @param string $ip
     * @return string
     */
    public static function getLocation(string $ip): string
    {
        if ($ip === '127.0.0.1' || $ip === '::1' || str_starts_with($ip, '192.168.') || str_starts_with($ip, '10.')) {
            return 'Pekanbaru, Indonesia (Localhost)';
        }

        // Mock locations mapping for simulated demo/attack IPs
        $mockMap = [
            '182.253.140.8' => 'Surabaya, Indonesia',
            '198.51.100.75' => 'Frankfurt, Jerman',
            '180.242.234.12' => 'Pekanbaru, Indonesia',
            '36.85.120.44' => 'Jakarta, Indonesia',
            '110.138.89.200' => 'Padang, Indonesia',
            '203.0.113.120' => 'Seoul, Korea Selatan',
            '103.111.45.19' => 'Bandung, Indonesia',
        ];

        if (isset($mockMap[$ip])) {
            return $mockMap[$ip];
        }

        return Cache::remember("ip_loc_{$ip}", 86400, function () use ($ip) {
            try {
                $response = Http::timeout(1.2)->get("http://ip-api.com/json/{$ip}");
                if ($response->successful()) {
                    $data = $response->json();
                    if (isset($data['city']) && isset($data['country'])) {
                        return $data['city'] . ', ' . $data['country'];
                    }
                }
            } catch (\Exception $e) {
                // Silently ignore connection issues / timeouts
            }
            return 'Pekanbaru, Indonesia'; // Safe fallback
        });
    }
}
