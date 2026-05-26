<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\LogController;
use App\Http\Controllers\Admin\SecurityAuditController;
use App\Http\Controllers\Admin\MonitoringController;

// ──────────────────────────────────────────────────────────────
// Route Super Admin — Admin routes + role:super_admin
// ──────────────────────────────────────────────────────────────
Route::middleware(['auth', 'verified', 'check_active', 'admin', 'role:super_admin'])
    ->prefix('admin')
    ->group(function () {
        Route::prefix('users')->group(function () {
            Route::get('/', [UserController::class, 'index'])->name('admin.users.index');
            Route::get('/create', [UserController::class, 'create'])->name('admin.users.create');
            Route::post('/', [UserController::class, 'store'])->name('admin.users.store');
            Route::get('/{id}/edit', [UserController::class, 'edit'])->name('admin.users.edit');
            Route::put('/{id}', [UserController::class, 'update'])->name('admin.users.update');
            Route::delete('/{id}', [UserController::class, 'destroy'])->name('admin.users.destroy');
        });

        // Log Aktivitas Sistem
        Route::prefix('logs')->group(function () {
            Route::get('/', [LogController::class, 'index'])->name('admin.logs.index');
            Route::post('/seed', [LogController::class, 'seed'])->name('admin.logs.seed');
            Route::delete('/', [LogController::class, 'destroyAll'])->name('admin.logs.destroy-all');
        });

        // Audit Keamanan Akses Autentikasi
        Route::prefix('security-audit')->group(function () {
            Route::get('/', [SecurityAuditController::class, 'index'])->name('admin.security-audit.index');
            Route::delete('/logs', [SecurityAuditController::class, 'clearLogs'])->name('admin.security-audit.clear-logs');
            Route::delete('/sessions/{id}', [SecurityAuditController::class, 'terminateSession'])->name('admin.security-audit.terminate-session');
            Route::post('/blacklist', [SecurityAuditController::class, 'toggleBlacklist'])->name('admin.security-audit.toggle-blacklist');
        });

        // Monitoring Performa Server & Database
        Route::get('/monitoring', [MonitoringController::class, 'index'])->name('admin.monitoring.index');
        Route::post('/monitoring/cleanup', [MonitoringController::class, 'cleanup'])->name('admin.monitoring.cleanup');
        Route::get('/monitoring/api/stats', [MonitoringController::class, 'apiStats'])->name('admin.monitoring.api-stats');
    });
