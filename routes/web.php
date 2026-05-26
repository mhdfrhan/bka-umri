<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Public\HomeController;
use App\Http\Controllers\Public\ProfilController;
use App\Http\Controllers\Public\BidangController;
use App\Http\Controllers\Public\BeritaController;
use App\Http\Controllers\Public\PengumumanController;
use App\Http\Controllers\Public\DokumentasiController;
use App\Http\Controllers\Public\LampiranController;
use App\Http\Controllers\Public\KontakController;

// ──────────────────────────────────────────────────────────────
// Route Publik — Tanpa Auth
// ──────────────────────────────────────────────────────────────
Route::get('/', [HomeController::class, 'index'])->name('public.home');
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/profil/tentang-kami', [ProfilController::class, 'tentang'])->name('public.profil.tentang');
Route::get('/profil/visi-misi', [ProfilController::class, 'visiMisi'])->name('public.profil.visi-misi');
Route::get('/profil/struktur-organisasi', [ProfilController::class, 'struktur'])->name('public.profil.struktur');

Route::get('/bidang/{slug}', [BidangController::class, 'show'])->name('public.bidang.show');
Route::get('/berita', [BeritaController::class, 'index'])->name('public.berita.index');
Route::get('/berita/{slug}', [BeritaController::class, 'show'])->name('public.berita.show');
Route::get('/pengumuman', [PengumumanController::class, 'index'])->name('public.pengumuman.index');
Route::get('/pengumuman/{slug}', [PengumumanController::class, 'show'])->name('public.pengumuman.show');
Route::get('/dokumentasi', [DokumentasiController::class, 'index'])->name('public.dokumentasi.index');
Route::get('/dokumentasi/{slug}', [DokumentasiController::class, 'show'])->name('public.dokumentasi.show');
Route::get('/lampiran', [LampiranController::class, 'index'])->name('public.lampiran.index');
Route::get('/lampiran/download/{id}', [LampiranController::class, 'download'])->name('public.lampiran.download')->middleware('throttle:download');
Route::get('/lampiran/{slug}', [LampiranController::class, 'show'])->name('public.lampiran.kategori');
Route::get('/kontak', [KontakController::class, 'index'])->name('public.kontak.index');
Route::post('/kontak', [KontakController::class, 'store'])->name('public.kontak.store')->middleware('throttle:kontak');

// Pemeliharaan Sistem / Maintenance Page (503)
Route::inertia('/maintenance', 'error/generic', ['status' => 503])->name('public.maintenance');

// ──────────────────────────────────────────────────────────────
// Route Admin & Super Admin
// ──────────────────────────────────────────────────────────────
require __DIR__.'/admin.php';
require __DIR__.'/superadmin.php';

require __DIR__.'/settings.php';
