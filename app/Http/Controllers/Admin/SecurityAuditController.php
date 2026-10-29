<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuthLog;
use App\Models\BlockedIp;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SecurityAuditController extends Controller
{
    /**
     * Display the security audit dashboard.
     *
     * @param Request $request
     * @return Response
     */
    public function index(Request $request): Response
    {
        // 1. Fetch authentication logs
        $logs = AuthLog::orderBy('id', 'desc')
            ->take(200)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'time' => $item->created_at->toIso8601String(),
                    'username' => $item->username,
                    'ipAddress' => $item->ip_address,
                    'browser' => $item->browser ?? 'Unknown Browser',
                    'platform' => $item->platform ?? 'Unknown OS',
                    'location' => $item->location ?? 'Pekanbaru, Indonesia',
                    'status' => $item->status === 'logout' ? 'sukses' : $item->status, // Map logout to sukses for UI filter simplicity
                    'reason' => $item->reason,
                ];
            })
            ->toArray();

        // 2. Fetch active sessions from database session table
        $activeSessions = DB::table('sessions')
            ->whereNotNull('user_id')
            ->get()
            ->map(function ($sess) use ($request) {
                $user = User::find($sess->user_id);
                $username = $user ? $user->email : 'Unknown Admin';

                $uaParsed = \App\Helpers\UserAgentParser::parse($sess->user_agent);
                $location = \App\Helpers\IpLocationHelper::getLocation($sess->ip_address ?? '127.0.0.1');

                // Try to find the actual login time from logs
                $latestLogin = AuthLog::where('username', $username)
                    ->where('ip_address', $sess->ip_address)
                    ->where('status', 'sukses')
                    ->latest()
                    ->first();

                $loginTime = $latestLogin 
                    ? $latestLogin->created_at->toIso8601String() 
                    : \Carbon\Carbon::createFromTimestamp($sess->last_activity)->toIso8601String();

                return [
                    'id' => $sess->id,
                    'ipAddress' => $sess->ip_address ?? '127.0.0.1',
                    'browser' => $uaParsed['browser'],
                    'platform' => $uaParsed['platform'],
                    'location' => $sess->id === $request->session()->getId() 
                        ? $location . ' (Sesi Anda)' 
                        : $location,
                    'loginTime' => $loginTime,
                    'lastActive' => \Carbon\Carbon::createFromTimestamp($sess->last_activity)->toIso8601String(),
                    'isCurrent' => $sess->id === $request->session()->getId(),
                ];
            })
            ->toArray();

        // 3. Fetch blacklisted IPs
        $blacklistedIps = BlockedIp::pluck('ip_address')->toArray();

        return Inertia::render('admin/security-audit/index', [
            'dbLogs' => $logs,
            'dbSessions' => $activeSessions,
            'dbBlacklistedIps' => $blacklistedIps,
        ]);
    }

    /**
     * Clear all authentication logs.
     *
     * @return RedirectResponse
     */
    public function clearLogs(): RedirectResponse
    {
        AuthLog::truncate();

        // Record this audit trail action
        activity('system')
            ->causedBy(auth()->user())
            ->log('Membersihkan log audit autentikasi keamanan.');

        return redirect()->route('admin.security-audit.index')->with('success', 'Seluruh data rekapitulasi login berhasil dikosongkan.');
    }

    /**
     * Terminate / delete an active session.
     *
     * @param string $id
     * @return RedirectResponse
     */
    public function terminateSession($id): RedirectResponse
    {
        $session = DB::table('sessions')->where('id', $id)->first();
        if ($session) {
            $ip = $session->ip_address;
            DB::table('sessions')->where('id', $id)->delete();

            // Record this audit trail action
            activity('system')
                ->causedBy(auth()->user())
                ->log("Memutus paksa sesi masuk aktif untuk IP: {$ip}");
        }

        return redirect()->route('admin.security-audit.index')->with('success', 'Sesi masuk berhasil diputus paksa.');
    }

    /**
     * Toggle IP blacklist state.
     *
     * @param Request $request
     * @return RedirectResponse
     */
    public function toggleBlacklist(Request $request): RedirectResponse
    {
        $request->validate([
            'ip' => 'required|string',
        ]);

        $ip = $request->input('ip');
        $blocked = BlockedIp::where('ip_address', $ip)->first();

        if ($blocked) {
            $blocked->delete();
            $message = "IP Address {$ip} berhasil dihapus dari daftar blokir.";

            activity('system')
                ->causedBy(auth()->user())
                ->log("Membuka blokir alamat IP: {$ip}");
        } else {
            BlockedIp::create([
                'ip_address' => $ip,
                'reason' => 'Diblokir oleh administrator via panel audit keamanan',
            ]);
            $message = "IP Address {$ip} berhasil dimasukkan ke daftar blokir sistem.";

            activity('system')
                ->causedBy(auth()->user())
                ->log("Memblokir alamat IP: {$ip}");
        }

        return redirect()->route('admin.security-audit.index')->with('success', $message);
    }
}
