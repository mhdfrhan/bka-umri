<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Kunjungan;
use Symfony\Component\HttpFoundation\Response;

class LogVisitorVisit
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
        $response = $next($request);

        // Track only GET requests to public pages for non-authenticated visitors (guests)
        if ($request->isMethod('GET')
            && !auth()->check()
            && !$request->is('admin*')
            && !$request->is('api*')
            && !$request->routeIs('login')
            && !$request->routeIs('logout')
            && !$request->expectsJson()
        ) {
            try {
                $ip = $request->ip();
                $today = now()->toDateString();

                // Uses firstOrCreate to ensure that the combination of IP + Date remains unique without throwing integrity errors
                Kunjungan::firstOrCreate([
                    'ip_address' => $ip,
                    'tanggal' => $today,
                ], [
                    'user_agent' => $request->userAgent(),
                ]);
            } catch (\Exception $e) {
                // Silently log and ignore integrity violations / race conditions
                logger()->error('Failed to log visitor: ' . $e->getMessage());
            }
        }

        return $response;
    }
}
