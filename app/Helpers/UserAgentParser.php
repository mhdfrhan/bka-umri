<?php

namespace App\Helpers;

class UserAgentParser
{
    /**
     * Parse User-Agent string to extract browser and platform.
     *
     * @param string|null $userAgent
     * @return array
     */
    public static function parse(?string $userAgent): array
    {
        if (empty($userAgent)) {
            return [
                'browser' => 'Unknown Browser',
                'platform' => 'Unknown Platform',
            ];
        }

        $browser = 'Unknown Browser';
        $platform = 'Unknown Platform';

        // 1. Browser Detection
        if (preg_match('/Hydra/i', $userAgent)) {
            $browser = 'Hydra Attack Client';
        } elseif (preg_match('/Go-http-client/i', $userAgent)) {
            $browser = 'Go HTTP Client';
        } elseif (preg_match('/python-requests/i', $userAgent)) {
            $browser = 'Python Requests';
        } elseif (preg_match('/MSIE/i', $userAgent) && !preg_match('/Opera/i', $userAgent)) {
            $browser = 'Internet Explorer';
        } elseif (preg_match('/Firefox/i', $userAgent)) {
            $browser = 'Firefox';
        } elseif (preg_match('/Edg/i', $userAgent) || preg_match('/Edge/i', $userAgent)) {
            $browser = 'Microsoft Edge';
        } elseif (preg_match('/Chrome/i', $userAgent)) {
            $browser = 'Chrome';
        } elseif (preg_match('/Safari/i', $userAgent) && !preg_match('/Chrome/i', $userAgent)) {
            $browser = 'Safari';
        } elseif (preg_match('/Opera/i', $userAgent) || preg_match('/OPR/i', $userAgent)) {
            $browser = 'Opera';
        }

        // 2. Platform / OS Detection
        if (preg_match('/windows|win32/i', $userAgent)) {
            $platform = 'Windows';
        } elseif (preg_match('/macintosh|mac os x/i', $userAgent)) {
            $platform = 'macOS';
        } elseif (preg_match('/linux/i', $userAgent)) {
            $platform = 'Linux';
        } elseif (preg_match('/iphone|ipad|ipod/i', $userAgent)) {
            $platform = 'iOS';
        } elseif (preg_match('/android/i', $userAgent)) {
            $platform = 'Android';
        }

        return [
            'browser' => $browser,
            'platform' => $platform,
        ];
    }
}
