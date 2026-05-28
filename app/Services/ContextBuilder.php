<?php

namespace App\Services;

use App\Models\Berita;
use App\Models\Pengumuman;
use App\Models\Layanan;
use App\Models\Bidang;
use App\Models\Lampiran;
use App\Models\KategoriLampiran;
use App\Models\HalamanStatis;
use App\Models\Statistik;
use App\Models\Pengaturan;
use App\Models\ChatbotFaq;
use Illuminate\Support\Str;

class ContextBuilder
{
    /**
     * Build context from the database relevant to the user's question.
     */
    public static function build(string $userMessage): string
    {
        $keywords = self::extractKeywords($userMessage);
        $context = [];

        // Always include contact info and basic services
        $context[] = self::getContactInfo();
        $context[] = self::getServiceInfo();
        $context[] = self::getStatistikInfo();

        // Search for relevant custom FAQs
        $faqContext = self::searchChatbotFaqs($keywords);
        if ($faqContext) {
            $context[] = $faqContext;
        }

        // Search for relevant content in database tables
        $beritaContext = self::searchBerita($keywords);
        if ($beritaContext) {
            $context[] = $beritaContext;
        }

        $pengumumanContext = self::searchPengumuman($keywords);
        if ($pengumumanContext) {
            $context[] = $pengumumanContext;
        }

        $bidangContext = self::searchBidang($keywords);
        if ($bidangContext) {
            $context[] = $bidangContext;
        }

        $lampiranContext = self::searchLampiran($keywords);
        if ($lampiranContext) {
            $context[] = $lampiranContext;
        }

        $halamanContext = self::searchHalamanStatis($keywords);
        if ($halamanContext) {
            $context[] = $halamanContext;
        }

        return implode("\n\n", array_filter($context));
    }

    /**
     * Extract meaningful keywords from user message.
     */
    private static function extractKeywords(string $message): array
    {
        $stopwords = [
            'yang', 'dan', 'di', 'dari', 'untuk', 'dengan', 'ke', 'pada', 'ini',
            'itu', 'adalah', 'akan', 'bisa', 'dapat', 'ada', 'tidak', 'juga',
            'saya', 'kami', 'kita', 'anda', 'mereka', 'dia', 'nya', 'bagaimana',
            'kapan', 'dimana', 'apa', 'siapa', 'mengapa', 'kenapa', 'apakah',
            'tolong', 'mohon', 'mau', 'ingin', 'minta', 'beri', 'tahu',
            'tentang', 'mengenai', 'soal', 'perihal', 'gimana', 'caranya',
            'ya', 'dong', 'deh', 'sih', 'nih', 'lah', 'kah', 'tah',
        ];

        $words = preg_split('/\s+/', mb_strtolower($message));
        $keywords = [];

        foreach ($words as $word) {
            $clean = preg_replace('/[^\w\s]/u', '', $word);
            if (mb_strlen($clean) >= 3 && !in_array($clean, $stopwords)) {
                $keywords[] = $clean;
            }
        }

        return array_unique($keywords);
    }

    /**
     * Search Berita (news) table for relevant content.
     */
    private static function searchBerita(array $keywords): ?string
    {
        if (empty($keywords)) {
            // Return latest 5 news titles as general context
            $latest = Berita::terpublikasi()->terbaru()->limit(5)->get(['judul', 'tanggal_publikasi']);
            if ($latest->isEmpty()) return null;

            $lines = $latest->map(fn($b) => "- {$b->judul} ({$b->tanggal_publikasi?->format('d/m/Y')})")->join("\n");
            return "[BERITA TERBARU]\n{$lines}";
        }

        $query = Berita::terpublikasi();
        foreach ($keywords as $kw) {
            $query->where(function ($q) use ($kw) {
                $q->where('judul', 'LIKE', "%{$kw}%")
                  ->orWhere('isi', 'LIKE', "%{$kw}%");
            });
        }

        // Also try OR-based search if AND returns nothing
        $results = $query->limit(3)->get(['judul', 'isi', 'tanggal_publikasi']);

        if ($results->isEmpty()) {
            $orQuery = Berita::terpublikasi();
            $orQuery->where(function ($q) use ($keywords) {
                foreach ($keywords as $kw) {
                    $q->orWhere('judul', 'LIKE', "%{$kw}%");
                }
            });
            $results = $orQuery->limit(3)->get(['judul', 'isi', 'tanggal_publikasi']);
        }

        if ($results->isEmpty()) return null;

        $lines = $results->map(function ($b) {
            $content = Str::limit(strip_tags($b->isi), 300);
            return "- Judul: {$b->judul}\n  Tanggal: {$b->tanggal_publikasi?->format('d/m/Y')}\n  Isi: {$content}";
        })->join("\n\n");

        return "[BERITA RELEVAN]\n{$lines}";
    }

    /**
     * Search Pengumuman (announcements) table.
     */
    private static function searchPengumuman(array $keywords): ?string
    {
        if (empty($keywords)) {
            $latest = Pengumuman::terpublikasi()->pentingFirst()->limit(5)->get(['judul', 'is_penting', 'tanggal_publikasi']);
            if ($latest->isEmpty()) return null;

            $lines = $latest->map(fn($p) => "- " . ($p->is_penting ? '⚠️ PENTING: ' : '') . "{$p->judul} ({$p->tanggal_publikasi?->format('d/m/Y')})")->join("\n");
            return "[PENGUMUMAN TERBARU]\n{$lines}";
        }

        $query = Pengumuman::terpublikasi();
        $query->where(function ($q) use ($keywords) {
            foreach ($keywords as $kw) {
                $q->orWhere('judul', 'LIKE', "%{$kw}%")
                  ->orWhere('isi', 'LIKE', "%{$kw}%");
            }
        });

        $results = $query->limit(3)->get(['judul', 'isi', 'is_penting', 'tanggal_publikasi']);

        if ($results->isEmpty()) return null;

        $lines = $results->map(function ($p) {
            $content = Str::limit(strip_tags($p->isi), 300);
            return "- Judul: " . ($p->is_penting ? '⚠️ PENTING: ' : '') . "{$p->judul}\n  Tanggal: {$p->tanggal_publikasi?->format('d/m/Y')}\n  Isi: {$content}";
        })->join("\n\n");

        return "[PENGUMUMAN RELEVAN]\n{$lines}";
    }

    private static function searchBidang(array $keywords): ?string
    {
        $bidangs = Bidang::orderBy('urutan')->get(['nama', 'deskripsi_singkat', 'slug']);
        if ($bidangs->isEmpty()) return null;

        // If keywords match, provide more detail
        if (!empty($keywords)) {
            $matched = $bidangs->filter(function ($b) use ($keywords) {
                foreach ($keywords as $kw) {
                    if (Str::contains(mb_strtolower($b->nama . ' ' . $b->deskripsi_singkat), $kw)) {
                        return true;
                    }
                }
                return false;
            });

            if ($matched->isNotEmpty()) {
                $lines = $matched->map(fn($b) => "- {$b->nama} (Tautan: " . url("/bidang/{$b->slug}") . "): {$b->deskripsi_singkat}")->join("\n");
                return "[BIDANG RELEVAN]\n{$lines}";
            }
        }

        // Return all divisions as general context
        $lines = $bidangs->map(fn($b) => "- {$b->nama} (Tautan: " . url("/bidang/{$b->slug}") . "): {$b->deskripsi_singkat}")->join("\n");
        return "[DAFTAR BIDANG BKA]\n{$lines}";
    }

    /**
     * Search Lampiran (attachments/documents).
     */
    private static function searchLampiran(array $keywords): ?string
    {
        if (empty($keywords)) return null;

        $query = Lampiran::query()->with('kategori');
        $query->where(function ($q) use ($keywords) {
            foreach ($keywords as $kw) {
                $q->orWhere('nama_tampilan', 'LIKE', "%{$kw}%")
                  ->orWhere('deskripsi', 'LIKE', "%{$kw}%");
            }
        });

        $results = $query->limit(5)->get();

        if ($results->isEmpty()) return null;

        $lines = $results->map(fn($l) =>
            "- {$l->nama_tampilan}" . ($l->kategori ? " (Kategori: {$l->kategori->nama})" : "")
        )->join("\n");

        return "[DOKUMEN/LAMPIRAN YANG TERSEDIA]\n{$lines}\nDokumen dapat diunduh melalui menu Lampiran di website BKA UMRI pada halaman: " . url('/lampiran');
    }

    /**
     * Search HalamanStatis (static pages like Tentang Kami, Visi Misi).
     */
    private static function searchHalamanStatis(array $keywords): ?string
    {
        if (empty($keywords)) return null;

        $pages = HalamanStatis::all();
        $matched = $pages->filter(function ($page) use ($keywords) {
            foreach ($keywords as $kw) {
                if (Str::contains(mb_strtolower($page->judul . ' ' . $page->konten), $kw)) {
                    return true;
                }
            }
            return false;
        });

        if ($matched->isEmpty()) return null;

        $lines = $matched->map(function ($p) {
            $content = Str::limit(strip_tags($p->konten), 500);
            $path = $p->slug === 'tentang-kami' ? '/profil/tentang-kami' : ($p->slug === 'visi-misi' ? '/profil/visi-misi' : "/profil/{$p->slug}");
            $fullUrl = url($path);
            return "- {$p->judul} (Tautan: {$fullUrl}): {$content}";
        })->join("\n\n");

        return "[INFORMASI HALAMAN]\n{$lines}";
    }

    /**
     * Get contact information from Pengaturan.
     */
    private static function getContactInfo(): string
    {
        $alamat = Pengaturan::getValue('alamat', 'Gedung Rektorat Lt. 1, Jl. T. Tambusai, Pekanbaru');
        $telepon = Pengaturan::getValue('telepon', '(0761) 35008');
        $email = Pengaturan::getValue('email', 'bka@umri.ac.id');
        $jamOps = Pengaturan::getValue('jam_operasional', 'Senin-Jumat 08.00-16.00 WIB, Sabtu 08.00-13.00 WIB');

        return "[INFO KONTAK BKA UMRI]\nAlamat: {$alamat}\nTelepon: {$telepon}\nEmail: {$email}\nJam Operasional: {$jamOps}";
    }

    /**
     * Get service/layanan information.
     */
    private static function getServiceInfo(): string
    {
        $layanans = Layanan::orderBy('urutan')->get(['judul', 'deskripsi']);

        if ($layanans->isEmpty()) {
            return "[LAYANAN BKA]\nInformasi layanan belum tersedia.";
        }

        $lines = $layanans->map(fn($l) => "- {$l->judul}: {$l->deskripsi}")->join("\n");
        return "[LAYANAN BKA]\n{$lines}";
    }

    /**
     * Get statistik data.
     */
    private static function getStatistikInfo(): string
    {
        $stats = Statistik::orderBy('urutan')->get(['label', 'angka']);
        if ($stats->isEmpty()) return '';

        $lines = $stats->map(fn($s) => "- {$s->label}: {$s->angka}")->join("\n");
        return "[STATISTIK BKA]\n{$lines}";
    }

    /**
     * Search Custom Chatbot FAQs for relevant answers.
     */
    private static function searchChatbotFaqs(array $keywords): ?string
    {
        if (empty($keywords)) return null;

        $query = ChatbotFaq::query();
        $query->where(function ($q) use ($keywords) {
            foreach ($keywords as $kw) {
                $q->orWhere('label', 'LIKE', "%{$kw}%")
                  ->orWhere('question', 'LIKE', "%{$kw}%")
                  ->orWhere('answer', 'LIKE', "%{$kw}%");
            }
        });

        $results = $query->orderBy('urutan')->limit(4)->get(['question', 'answer']);
        if ($results->isEmpty()) return null;

        $lines = $results->map(fn($f) => "Tanya: {$f->question}\nJawab: {$f->answer}")->join("\n\n");
        return "[TANYA JAWAB / FAQ RELEVAN]\n{$lines}";
    }
}

