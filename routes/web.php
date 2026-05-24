<?php

use Illuminate\Support\Facades\Route;

// ──────────────────────────────────────────────────────────────
// Route Publik — Tanpa Auth
// ──────────────────────────────────────────────────────────────
Route::inertia('/', 'public/home')->name('public.home');
Route::inertia('/profil/tentang-kami', 'public/profil/tentang')->name('public.profil.tentang');
Route::inertia('/profil/visi-misi', 'public/profil/visi-misi')->name('public.profil.visi-misi');
Route::inertia('/profil/struktur-organisasi', 'public/profil/struktur')->name('public.profil.struktur');

Route::inertia('/bidang/{slug}', 'public/bidang/show')->name('public.bidang.show');
Route::inertia('/berita', 'public/berita/index')->name('public.berita.index');
Route::inertia('/berita/{slug}', 'public/berita/show')->name('public.berita.show');
Route::inertia('/pengumuman', 'public/pengumuman/index')->name('public.pengumuman.index');
Route::inertia('/pengumuman/{slug}', 'public/pengumuman/show')->name('public.pengumuman.show');
Route::inertia('/dokumentasi', 'public/dokumentasi/index')->name('public.dokumentasi.index');
Route::inertia('/dokumentasi/{slug}', 'public/dokumentasi/show')->name('public.dokumentasi.show');
Route::inertia('/lampiran', 'public/lampiran/index')->name('public.lampiran.index');
Route::inertia('/lampiran/{slug}', 'public/lampiran/kategori')->name('public.lampiran.kategori');
Route::inertia('/kontak', 'public/kontak/index')->name('public.kontak.index');

// Pemeliharaan Sistem / Maintenance Page (503)
Route::inertia('/maintenance', 'error/generic', ['status' => 503])->name('public.maintenance');

// ──────────────────────────────────────────────────────────────
// Route Admin & Super Admin
// ──────────────────────────────────────────────────────────────
require __DIR__.'/admin.php';
require __DIR__.'/superadmin.php';

require __DIR__.'/settings.php';
