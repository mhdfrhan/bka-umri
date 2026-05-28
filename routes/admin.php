<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\BerandaController;
use App\Http\Controllers\Admin\BidangController;
use App\Http\Controllers\Admin\ProfilController;
use App\Http\Controllers\Admin\BeritaController;
use App\Http\Controllers\Admin\PengumumanController;
use App\Http\Controllers\Admin\DokumentasiController;
use App\Http\Controllers\Admin\AsetController;
use App\Http\Controllers\Admin\DokumenController;
use App\Http\Controllers\Admin\PengaturanController;
use App\Http\Controllers\Admin\DashboardController;

// ──────────────────────────────────────────────────────────────
// Route Admin — Auth + Verified + Active + Admin Role
// ──────────────────────────────────────────────────────────────
Route::middleware(['auth', 'verified', 'check_active', 'admin'])
    ->prefix('admin')
    ->group(function () {
        // Dashboard
        Route::get('/', [DashboardController::class, 'index'])->name('admin.dashboard');
        Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

        // Kelola Beranda
        Route::prefix('beranda')->group(function () {
            Route::get('/', [BerandaController::class, 'edit'])->name('admin.beranda.edit');
            Route::post('/banners', [BerandaController::class, 'storeBanner'])->name('admin.beranda.banner.store');
            Route::put('/banners/{id}', [BerandaController::class, 'updateBanner'])->name('admin.beranda.banner.update');
            Route::delete('/banners/{id}', [BerandaController::class, 'destroyBanner'])->name('admin.beranda.banner.destroy');
            Route::patch('/banners/{id}/toggle', [BerandaController::class, 'toggleBanner'])->name('admin.beranda.banner.toggle');
            Route::post('/banners/reorder', [BerandaController::class, 'reorderBanners'])->name('admin.beranda.banner.reorder');
            Route::put('/kepala-biro', [BerandaController::class, 'updateKepalaBiro'])->name('admin.beranda.kepalaBiro.update');
            Route::put('/statistik', [BerandaController::class, 'updateStatistik'])->name('admin.beranda.statistik.update');
            Route::put('/layanan', [BerandaController::class, 'updateLayanan'])->name('admin.beranda.layanan.update');
        });

        // Kelola Bidang
        Route::post('/bidang/reorder', [BidangController::class, 'reorder'])->name('admin.bidang.reorder');
        Route::resource('bidang', BidangController::class)->names('admin.bidang');

        // Kelola Profil
        Route::prefix('profil')->group(function () {
            Route::get('/tentang', [ProfilController::class, 'editTentang'])->name('admin.profil.tentang.edit');
            Route::put('/tentang', [ProfilController::class, 'updateTentang'])->name('admin.profil.tentang.update');
            Route::get('/visi-misi', [ProfilController::class, 'editVisiMisi'])->name('admin.profil.visiMisi.edit');
            Route::put('/visi-misi', [ProfilController::class, 'updateVisiMisi'])->name('admin.profil.visiMisi.update');
            Route::get('/struktur', [ProfilController::class, 'editStruktur'])->name('admin.profil.struktur.edit');
            Route::put('/struktur', [ProfilController::class, 'updateStruktur'])->name('admin.profil.struktur.update');
        });

        // Kelola Berita
        Route::post('/berita/kategori', [BeritaController::class, 'storeKategori'])->name('admin.berita.kategori.store');
        Route::delete('/berita/kategori/{id}', [BeritaController::class, 'destroyKategori'])->name('admin.berita.kategori.destroy');
        Route::resource('berita', BeritaController::class)->names('admin.berita');

        // Kelola Pengumuman
        Route::resource('pengumuman', PengumumanController::class)->names('admin.pengumuman');

        // Kelola Dokumentasi
        Route::post('/dokumentasi/kategori', [DokumentasiController::class, 'storeKategori'])->name('admin.dokumentasi.kategori.store');
        Route::delete('/dokumentasi/kategori/{id}', [DokumentasiController::class, 'destroyKategori'])->name('admin.dokumentasi.kategori.destroy');
        Route::resource('dokumentasi', DokumentasiController::class)->names('admin.dokumentasi');

        // Kelola Aset Media
        Route::get('/aset/pilihan', [AsetController::class, 'apiList'])->name('admin.aset.apiList');
        Route::post('/editor-upload', [AsetController::class, 'editorUpload'])->name('admin.editorUpload');
        Route::delete('/editor-image', [AsetController::class, 'editorImageDelete'])->name('admin.editorImageDelete');
        Route::resource('aset', AsetController::class)->names('admin.aset');

        // Kelola Dokumen Penting / Lampiran
        Route::prefix('dokumen')->group(function () {
            Route::get('/', [DokumenController::class, 'index'])->name('admin.dokumen.index');
            Route::post('/kategori', [DokumenController::class, 'storeKategori'])->name('admin.dokumen.kategori.store');
            Route::put('/kategori/{id}', [DokumenController::class, 'updateKategori'])->name('admin.dokumen.kategori.update');
            Route::delete('/kategori/{id}', [DokumenController::class, 'destroyKategori'])->name('admin.dokumen.kategori.destroy');
            Route::post('/kategori/reorder', [DokumenController::class, 'reorderKategori'])->name('admin.dokumen.kategori.reorder');
            
            Route::post('/berkas', [DokumenController::class, 'storeBerkas'])->name('admin.dokumen.berkas.store');
            Route::put('/berkas/{id}', [DokumenController::class, 'updateBerkas'])->name('admin.dokumen.berkas.update');
            Route::delete('/berkas/{id}', [DokumenController::class, 'destroyBerkas'])->name('admin.dokumen.berkas.destroy');
        });

        // Pengaturan Web & Inbox
        Route::get('/settings', [PengaturanController::class, 'index'])->name('admin.settings.index');
        Route::post('/settings', [PengaturanController::class, 'updateSettings'])->name('admin.settings.update');
        Route::post('/settings/inbox/{id}/toggle-read', [PengaturanController::class, 'toggleRead'])->name('admin.settings.inbox.toggle-read');
        Route::delete('/settings/inbox/{id}', [PengaturanController::class, 'destroyMessage'])->name('admin.settings.inbox.destroy');

        // Kelola Chatbot AI
        Route::prefix('chatbot')->group(function () {
            Route::get('/', [\App\Http\Controllers\Admin\ChatbotSettingController::class, 'index'])->name('admin.chatbot.index');
            Route::post('/settings', [\App\Http\Controllers\Admin\ChatbotSettingController::class, 'updateSettings'])->name('admin.chatbot.settings.update');
            Route::post('/test', [\App\Http\Controllers\Admin\ChatbotSettingController::class, 'testConnection'])->name('admin.chatbot.test');
            Route::get('/monitoring', [\App\Http\Controllers\Admin\ChatbotMonitoringController::class, 'index'])->name('admin.chatbot.monitoring');
            Route::get('/monitoring/conversations', [\App\Http\Controllers\Admin\ChatbotMonitoringController::class, 'conversations'])->name('admin.chatbot.monitoring.conversations');
            Route::get('/monitoring/conversations/{id}', [\App\Http\Controllers\Admin\ChatbotMonitoringController::class, 'showConversation'])->name('admin.chatbot.monitoring.conversation');
            Route::delete('/monitoring/conversations', [\App\Http\Controllers\Admin\ChatbotMonitoringController::class, 'clearConversations'])->name('admin.chatbot.monitoring.clear');
            Route::get('/monitoring/api/stats', [\App\Http\Controllers\Admin\ChatbotMonitoringController::class, 'apiStats'])->name('admin.chatbot.monitoring.api-stats');

            // FAQ CRUD routes
            Route::get('/faqs', [\App\Http\Controllers\Admin\ChatbotFaqController::class, 'index'])->name('admin.chatbot.faqs.index');
            Route::post('/faqs', [\App\Http\Controllers\Admin\ChatbotFaqController::class, 'store'])->name('admin.chatbot.faqs.store');
            Route::put('/faqs/{id}', [\App\Http\Controllers\Admin\ChatbotFaqController::class, 'update'])->name('admin.chatbot.faqs.update');
            Route::delete('/faqs/{id}', [\App\Http\Controllers\Admin\ChatbotFaqController::class, 'destroy'])->name('admin.chatbot.faqs.destroy');
            Route::post('/faqs/{id}/reorder', [\App\Http\Controllers\Admin\ChatbotFaqController::class, 'reorder'])->name('admin.chatbot.faqs.reorder');
        });
    });
