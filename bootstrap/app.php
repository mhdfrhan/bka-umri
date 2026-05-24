<?php

use App\Http\Middleware\CheckUserIsActive;
use App\Http\Middleware\EnsureUserHasAdminRole;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'check_active' => CheckUserIsActive::class,
            'admin' => EnsureUserHasAdminRole::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->respond(function ($response, $exception, $request) {
            $status = $response->getStatusCode();
            if (in_array($status, [403, 404, 500, 503])) {
                if ($status === 404) {
                    return inertia('error/not-found')->toResponse($request)->setStatusCode(404);
                }
                if ($status === 403) {
                    return inertia('error/forbidden')->toResponse($request)->setStatusCode(403);
                }
                return inertia('error/generic', ['status' => $status])->toResponse($request)->setStatusCode($status);
            }
            return $response;
        });
    })->create();
