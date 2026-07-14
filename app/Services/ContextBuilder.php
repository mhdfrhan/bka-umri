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
use App\Models\KepalaBiro;
use App\Models\StrukturAnggota;
use App\Models\BidangKepalaBagian;
use App\Models\BidangAnggota;
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

        // Always include contact info, basic services, and kepala biro info
        $context[] = self::getContactInfo();
        $context[] = self::getServiceInfo();
        $context[] = self::getStatistikInfo();
        $context[] = self::getKepalaBiroInfo();

        // Always include latest important announcements and news as baseline context
        $context[] = self::getLatestAnnouncementsAndNews();

        // Search for relevant organizational structure/staff
        $strukturContext = self::searchStrukturOrganisasi($keywords);
        if ($strukturContext) {
            $context[] = $strukturContext;
        }

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

        $words = preg_split('/\s+/u', mb_strtolower($message));
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
     * Always include latest important announcements and news regardless of query.
     */
    private static function getLatestAnnouncementsAndNews(): string
    {
        $sections = [];

        // Latest important/penting announcements (always shown)
        $penting = Pengumuman::terpublikasi()
            ->where('is_penting', true)
            ->pentingFirst()
            ->limit(3)
            ->get(['judul', 'isi', 'tanggal_publikasi']);

        if ($penting->isNotEmpty()) {
            $lines = $penting->map(function ($p) {
                $snippet = Str::limit(strip_tags($p->isi), 200);
                return "- ⚠️ PENTING: {$p->judul} ({$p->tanggal_publikasi?->format('d/m/Y')})\n  {$snippet}";
            })->join("\n\n");
            $sections[] = "[PENGUMUMAN PENTING TERBARU]\n{$lines}";
        }

        // Latest 3 regular announcements
        $latest = Pengumuman::terpublikasi()
            ->pentingFirst()
            ->limit(5)
            ->get(['judul', 'isi', 'tanggal_publikasi', 'is_penting']);

        if ($latest->isNotEmpty()) {
            $lines = $latest->map(function ($p) {
                $prefix = $p->is_penting ? '⚠️ PENTING: ' : '';
                $snippet = Str::limit(strip_tags($p->isi), 150);
                return "- {$prefix}{$p->judul} ({$p->tanggal_publikasi?->format('d/m/Y')})\n  {$snippet}";
            })->join("\n\n");
            $sections[] = "[PENGUMUMAN TERBARU]\n{$lines}";
        }

        // Latest 3 news
        $news = Berita::terpublikasi()->terbaru()->limit(3)->get(['judul', 'isi', 'tanggal_publikasi']);
        if ($news->isNotEmpty()) {
            $lines = $news->map(function ($b) {
                $snippet = Str::limit(strip_tags($b->isi), 150);
                return "- {$b->judul} ({$b->tanggal_publikasi?->format('d/m/Y')})\n  {$snippet}";
            })->join("\n\n");
            $sections[] = "[BERITA TERBARU]\n{$lines}";
        }

        return implode("\n\n", array_filter($sections));
    }

    /**
     * Search Berita (news) table for relevant content.
     */
    private static function searchBerita(array $keywords): ?string
    {
        if (empty($keywords)) return null;

        $query = Berita::terpublikasi();
        $query->where(function ($q) use ($keywords) {
            foreach ($keywords as $kw) {
                $kw = mb_strtolower($kw);
                $q->orWhereRaw('LOWER(judul) LIKE ?', ["%{$kw}%"])
                  ->orWhereRaw('LOWER(isi) LIKE ?', ["%{$kw}%"]);
            }
        });

        $results = $query->terbaru()->limit(3)->get(['judul', 'isi', 'tanggal_publikasi']);

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
        if (empty($keywords)) return null;

        $query = Pengumuman::terpublikasi()->pentingFirst();
        $query->where(function ($q) use ($keywords) {
            foreach ($keywords as $kw) {
                $kw = mb_strtolower($kw);
                $q->orWhereRaw('LOWER(judul) LIKE ?', ["%{$kw}%"])
                  ->orWhereRaw('LOWER(isi) LIKE ?', ["%{$kw}%"]);
            }
        });

        $results = $query->limit(5)->get(['judul', 'isi', 'is_penting', 'tanggal_publikasi']);

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
                $kw = mb_strtolower($kw);
                $q->orWhereRaw('LOWER(nama_tampilan) LIKE ?', ["%{$kw}%"])
                  ->orWhereRaw('LOWER(deskripsi) LIKE ?', ["%{$kw}%"]);
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
                $kw = mb_strtolower($kw);
                $q->orWhereRaw('LOWER(label) LIKE ?', ["%{$kw}%"])
                  ->orWhereRaw('LOWER(question) LIKE ?', ["%{$kw}%"])
                  ->orWhereRaw('LOWER(answer) LIKE ?', ["%{$kw}%"]);
            }
        });

        $results = $query->orderBy('urutan')->limit(4)->get(['question', 'answer']);
        if ($results->isEmpty()) return null;

        $lines = $results->map(fn($f) => "Tanya: {$f->question}\nJawab: {$f->answer}")->join("\n\n");
        return "[TANYA JAWAB / FAQ RELEVAN]\n{$lines}";
    }

    /**
     * Get Kepala Biro (Head of Bureau) information.
     */
    private static function getKepalaBiroInfo(): string
    {
        $kb = KepalaBiro::first();
        if (!$kb) {
            return "[KEPALA BIRO BKA UMRI]\nInformasi Kepala Biro belum diatur.";
        }

        return "[KEPALA BIRO BKA UMRI]\nNama: {$kb->nama}\nJabatan: {$kb->jabatan}\nPeriode: {$kb->periode}";
    }

    /**
     * Search organizational structure and division staff members.
     */
    private static function searchStrukturOrganisasi(array $keywords): ?string
    {
        if (empty($keywords)) {
            return null;
        }

        // Trigger keywords for structure/staff
        $triggerWords = ['struktur', 'anggota', 'staf', 'staff', 'karyawan', 'pegawai', 'pimpinan', 'kepala', 'nama', 'pejabat', 'bagian', 'organisasi', 'tim', 'bagan'];
        $shouldTrigger = false;
        
        foreach ($keywords as $kw) {
            if (in_array($kw, $triggerWords)) {
                $shouldTrigger = true;
                break;
            }
        }

        // Or if any keyword matches a staff name (case insensitive)
        if (!$shouldTrigger) {
            $names = ['rahmawita', 'mailukni', 'musa', 'rahmiati', 'syauqi', 'delvien', 'wira', 'indra'];
            foreach ($keywords as $kw) {
                if (in_array(mb_strtolower($kw), $names)) {
                    $shouldTrigger = true;
                    break;
                }
            }
        }

        if (!$shouldTrigger) {
            return null;
        }

        $lines = [];

        // 1. Kepala Biro
        $kb = KepalaBiro::first();
        if ($kb) {
            $lines[] = "- Kepala Biro: {$kb->nama} ({$kb->periode})";
        }

        // 2. Division Heads & Members (Bidang)
        $bidangs = Bidang::with(['kepalaBagian', 'anggotas'])->orderBy('urutan')->get();
        foreach ($bidangs as $bidang) {
            $lines[] = "\n[Bagian: {$bidang->nama}]";
            if ($bidang->kepalaBagian) {
                $lines[] = "  - Kepala Bagian: {$bidang->kepalaBagian->nama} (Jabatan: {$bidang->kepalaBagian->jabatan})";
            }
            foreach ($bidang->anggotas as $anggota) {
                $lines[] = "  - Anggota/Staf: {$anggota->nama} (Jabatan: {$anggota->jabatan})";
            }
        }

        // 3. General Struktur Anggota (if any, separate from division models)
        $strukturs = StrukturAnggota::orderBy('urutan')->get();
        if ($strukturs->isNotEmpty()) {
            $lines[] = "\n[Daftar Struktur Organisasi Umum]";
            foreach ($strukturs as $sa) {
                $lines[] = "  - {$sa->nama} (Jabatan: {$sa->jabatan})";
            }
        }

        return "[STRUKTUR ORGANISASI & STAF BKA UMRI]\n" . implode("\n", $lines);
    }
}

