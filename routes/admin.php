<?php

use Illuminate\Support\Facades\Route;

// ──────────────────────────────────────────────────────────────
// Route Admin — Auth + Verified + Active + Admin Role
// ──────────────────────────────────────────────────────────────
Route::middleware(['auth', 'verified', 'check_active', 'admin'])
    ->prefix('admin')
    ->group(function () {
        // Dashboard
        Route::inertia('/', 'admin/dashboard')->name('admin.dashboard');

        // Kelola Beranda
        Route::inertia('/beranda', 'admin/beranda/edit')->name('admin.beranda.edit');

        // Kelola Bidang
        Route::inertia('/bidang', 'admin/bidang/index')->name('admin.bidang.index');
        Route::inertia('/bidang/create', 'admin/bidang/create')->name('admin.bidang.create');
        Route::inertia('/bidang/{id}/edit', 'admin/bidang/edit')->name('admin.bidang.edit');

        // Kelola Profil
        Route::inertia('/profil/tentang', 'admin/profil/tentang-edit')->name('admin.profil.tentang.edit');
        Route::inertia('/profil/visi-misi', 'admin/profil/visi-misi-edit')->name('admin.profil.visiMisi.edit');
        Route::inertia('/profil/struktur', 'admin/profil/struktur-edit')->name('admin.profil.struktur.edit');

        // Kelola Berita
        Route::inertia('/berita', 'admin/berita/index')->name('admin.berita.index');
        Route::inertia('/berita/create', 'admin/berita/create')->name('admin.berita.create');
        Route::inertia('/berita/{id}/edit', 'admin/berita/edit')->name('admin.berita.edit');

        // Kelola Pengumuman
        Route::inertia('/pengumuman', 'admin/pengumuman/index')->name('admin.pengumuman.index');
        Route::inertia('/pengumuman/create', 'admin/pengumuman/create')->name('admin.pengumuman.create');
        Route::inertia('/pengumuman/{id}/edit', 'admin/pengumuman/edit')->name('admin.pengumuman.edit');

        // Kelola Dokumentasi
        Route::inertia('/dokumentasi', 'admin/dokumentasi/index')->name('admin.dokumentasi.index');
        Route::inertia('/dokumentasi/create', 'admin/dokumentasi/create')->name('admin.dokumentasi.create');
        Route::inertia('/dokumentasi/{id}/edit', 'admin/dokumentasi/edit')->name('admin.dokumentasi.edit');

        // Kelola Aset Media 
        Route::inertia('/aset', 'admin/aset/index')->name('admin.aset.index');

        // Kelola Dokumen Penting / Lampiran
        Route::inertia('/dokumen', 'admin/dokumen/index')->name('admin.dokumen.index');

        // Pengaturan Web & Inbox
        Route::inertia('/settings', 'admin/settings/index')->name('admin.settings.index');
    });
