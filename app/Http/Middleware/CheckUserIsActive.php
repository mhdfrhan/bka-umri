<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckUserIsActive
{
    /**
     * Handle an incoming request.
     *
     * Checks if the authenticated user's account is active.
     * If not, logs them out immediately and redirects to login.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check() && ! $request->user()->is_active) {
            Auth::guard('web')->logout();

            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login')->with('status', 'Akun Anda telah dinonaktifkan. Silakan hubungi administrator.');
        }

        return $next($request);
    }
}
