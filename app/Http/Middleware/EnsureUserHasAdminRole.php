<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasAdminRole
{
    /**
     * Handle an incoming request.
     *
     * Ensures the authenticated user has either 'admin' or 'super_admin' role.
     * Returns 403 if the user lacks admin privileges.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user() || ! $request->user()->hasAnyRole(['admin', 'super_admin'])) {
            abort(403, 'Anda tidak memiliki akses ke halaman ini.');
        }

        return $next($request);
    }
}
