<?php

namespace App\Listeners;

use App\Models\AuthLog;
use App\Models\User;
use App\Helpers\UserAgentParser;
use App\Helpers\IpLocationHelper;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Failed;
use Illuminate\Auth\Events\Logout;
use Illuminate\Http\Request;

class LogAuthenticationEvents
{
    /**
     * Handle Login Event.
     *
     * @param Login $event
     * @return void
     */
    public function handleLogin(Login $event): void
    {
        $user = $event->user;
        $request = request();

        $ip = $request->ip() ?? '127.0.0.1';
        $ua = $request->userAgent() ?? '';
        $uaParsed = UserAgentParser::parse($ua);
        $location = IpLocationHelper::getLocation($ip);

        // Update user's last login timestamp
        if ($user instanceof User) {
            $user->last_login_at = now();
            $user->save();
        }

        AuthLog::create([
            'username' => $user->email ?? $user->name ?? 'unknown',
            'ip_address' => $ip,
            'user_agent' => $ua,
            'browser' => $uaParsed['browser'],
            'platform' => $uaParsed['platform'],
            'location' => $location,
            'status' => 'sukses',
            'reason' => null,
        ]);
    }

    /**
     * Handle Failed Login Event.
     *
     * @param Failed $event
     * @return void
     */
    public function handleFailed(Failed $event): void
    {
        $request = request();
        $ip = $request->ip() ?? '127.0.0.1';
        $ua = $request->userAgent() ?? '';
        $uaParsed = UserAgentParser::parse($ua);
        $location = IpLocationHelper::getLocation($ip);

        // Determine username and reason
        $username = $event->credentials['email'] ?? $event->credentials['username'] ?? 'unknown';
        
        $userExists = User::where('email', $username)->exists();
        $reason = $userExists ? 'Kata sandi tidak cocok' : 'Nama pengguna tidak terdaftar';

        AuthLog::create([
            'username' => $username,
            'ip_address' => $ip,
            'user_agent' => $ua,
            'browser' => $uaParsed['browser'],
            'platform' => $uaParsed['platform'],
            'location' => $location,
            'status' => 'gagal',
            'reason' => $reason,
        ]);
    }

    /**
     * Handle Logout Event.
     *
     * @param Logout $event
     * @return void
     */
    public function handleLogout(Logout $event): void
    {
        $user = $event->user;
        $request = request();

        if (!$user) {
            return;
        }

        $ip = $request->ip() ?? '127.0.0.1';
        $ua = $request->userAgent() ?? '';
        $uaParsed = UserAgentParser::parse($ua);
        $location = IpLocationHelper::getLocation($ip);

        AuthLog::create([
            'username' => $user->email ?? $user->name ?? 'unknown',
            'ip_address' => $ip,
            'user_agent' => $ua,
            'browser' => $uaParsed['browser'],
            'platform' => $uaParsed['platform'],
            'location' => $location,
            'status' => 'logout',
            'reason' => 'Pengguna keluar sesi',
        ]);
    }
}
