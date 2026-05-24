<?php

use Illuminate\Support\Facades\Route;

// ──────────────────────────────────────────────────────────────
// Route Super Admin — Admin routes + role:super_admin
// ──────────────────────────────────────────────────────────────
Route::middleware(['auth', 'verified', 'check_active', 'admin', 'role:super_admin'])
    ->prefix('admin')
    ->group(function () {
        Route::inertia('/users', 'admin/users/index')->name('admin.users.index');
        Route::inertia('/users/create', 'admin/users/create')->name('admin.users.create');
        Route::inertia('/users/{id}/edit', 'admin/users/edit')->name('admin.users.edit');

        // Log Aktivitas Sistem
        Route::inertia('/logs', 'admin/logs/index')->name('admin.logs.index');

        // Audit Keamanan Akses Autentikasi
        Route::inertia('/security-audit', 'admin/security-audit/index')->name('admin.security-audit.index');

        // Monitoring Performa Server & Database
        Route::inertia('/monitoring', 'admin/monitoring/index')->name('admin.monitoring.index');
    });
