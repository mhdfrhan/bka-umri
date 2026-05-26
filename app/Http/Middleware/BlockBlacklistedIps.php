<?php

namespace App\Http\Middleware;

use App\Models\BlockedIp;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class BlockBlacklistedIps
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next): Response
    {
        $ip = $request->ip();

        if (BlockedIp::where('ip_address', $ip)->exists()) {
            abort(Response::HTTP_FORBIDDEN, 'Akses Ditolak: Alamat IP Anda (' . $ip . ') telah diblokir oleh sistem keamanan BKA UMRI.');
        }

        return $next($request);
    }
}
