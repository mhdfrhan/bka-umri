<?php

namespace App\Services;

use App\Models\Album;
use App\Models\Berita;
use App\Models\Bidang;
use App\Models\ChatbotFaq;
use App\Models\HalamanStatis;
use App\Models\KepalaBiro;
use App\Models\Lampiran;
use App\Models\Layanan;
use App\Models\Misi;
use App\Models\Pengaturan;
use App\Models\Pengumuman;
use App\Models\Statistik;
use App\Models\StrukturAnggota;
use Illuminate\Support\Str;

class ContextBuilder
{
    /**
     * Important 2-character domain terms that must not be filtered out.
     */
    private static array $shortAllowedTerms = [
        'va', 'sk', 'fk', 's1', 's2', 'd3', 'd4', 'ai', 'it',
    ];

    /**
     * Build context from the database relevant to the user's question and recent conversation history.
     *
     * @param  string  $userMessage
     * @param  array<int, string>  $recentUserMessages
     */
    public static function build(string $userMessage, array $recentUserMessages = []): string
    {
        $primaryKeywords = self::extractKeywords($userMessage);

        // Merge with recent user messages for multi-turn follow-up questions
        $historyKeywords = [];
        foreach (array_slice($recentUserMessages, -2) as $prevMsg) {
            if ($prevMsg !== $userMessage) {
                $historyKeywords = array_merge($historyKeywords, self::extractKeywords($prevMsg));
            }
        }
        $keywords = array_values(array_unique(array_merge($primaryKeywords, $historyKeywords)));

        $context = [];

        // 1. Always include core identity, contact info, services, stats, kepala biro, and visi-misi
        $context[] = self::getContactInfo();
        $context[] = self::getServiceInfo();
        $context[] = self::getStatistikInfo();
        $context[] = self::getKepalaBiroInfo();
        $context[] = self::getVisiMisiContext();

        // 2. Always include latest important announcements and news with rich snippets & direct URLs
        $context[] = self::getLatestAnnouncementsAndNews();

        // 3. Organizational structure & divisions (always include compact summary, expand when relevant)
        $context[] = self::getStrukturOrganisasiContext($keywords);
        $context[] = self::searchBidang($keywords);

        // 4. Custom FAQs
        $faqContext = self::searchChatbotFaqs($keywords);
        if ($faqContext) {
            $context[] = $faqContext;
        }

        // 5. Relevance-scored search on Pengumuman & Berita
        $pengumumanContext = self::searchPengumuman($keywords);
        if ($pengumumanContext) {
            $context[] = $pengumumanContext;
        }

        $beritaContext = self::searchBerita($keywords);
        if ($beritaContext) {
            $context[] = $beritaContext;
        }

        // 6. Lampiran / Official Documents (with direct download links)
        $lampiranContext = self::searchLampiran($keywords, $userMessage);
        if ($lampiranContext) {
            $context[] = $lampiranContext;
        }

        // 7. Static Pages (Tentang Kami, etc.)
        $halamanContext = self::searchHalamanStatis($keywords);
        if ($halamanContext) {
            $context[] = $halamanContext;
        }

        // 8. Documentation Albums (Galeri / Dokumentasi Kegiatan)
        $dokumentasiContext = self::searchDokumentasi($keywords, $userMessage);
        if ($dokumentasiContext) {
            $context[] = $dokumentasiContext;
        }

        return implode("\n\n", array_filter($context));
    }

    /**
     * Convert HTML content into clean readable text while preserving <a href="..."> links in Markdown format.
     */
    public static function cleanHtmlKeepLinks(?string $html, int $limit = 800): string
    {
        if (empty($html)) {
            return '';
        }

        // Convert <a href="url">text</a> into Markdown [text](url)
        $processed = preg_replace_callback(
            '/<a\s+[^>]*href=["\']([^"\']+)["\'][^>]*>(.*?)<\/a>/is',
            function ($matches) {
                $url = trim($matches[1]);
                $label = trim(strip_tags($matches[2]));
                if ($url === '' || $url === '#') {
                    return $label;
                }
                return $label !== '' && $label !== $url ? "[{$label}]({$url})" : $url;
            },
            $html
        );

        // Replace block-level closing tags and line breaks with spaces/newlines so words don't stick together
        $processed = preg_replace('/<\/(p|div|li|tr|h[1-6]|blockquote)>|<br\s*\/?>/i', "\n", $processed ?? $html);

        $plain = strip_tags($processed ?? '');
        $plain = html_entity_decode($plain, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $plain = preg_replace('/[ \t]+/', ' ', $plain);
        $plain = preg_replace('/\n\s*\n+/', "\n", $plain);
        $plain = trim($plain);

        return $limit > 0 ? Str::limit($plain, $limit) : $plain;
    }

    /**
     * Extract meaningful domain-specific keywords from user message.
     */
    public static function extractKeywords(string $message): array
    {
        $stopwords = [
            // Indonesian general stopwords
            'yang', 'dan', 'di', 'dari', 'untuk', 'dengan', 'ke', 'pada', 'ini',
            'itu', 'adalah', 'akan', 'bisa', 'dapat', 'ada', 'tidak', 'juga',
            'saya', 'kami', 'kita', 'anda', 'mereka', 'dia', 'nya', 'bagaimana',
            'kapan', 'dimana', 'apa', 'siapa', 'mengapa', 'kenapa', 'apakah',
            'tolong', 'mohon', 'mau', 'ingin', 'minta', 'beri', 'tahu',
            'tentang', 'mengenai', 'soal', 'perihal', 'gimana', 'caranya',
            'cara', 'berapa', 'mana', 'saja', 'oleh', 'atau', 'jika', 'kalau',
            'sudah', 'belum', 'lagi', 'masih', 'lebih', 'paling', 'sangat',
            'ya', 'dong', 'deh', 'sih', 'nih', 'lah', 'kah', 'tah', 'halo',
            'hai', 'assalamualaikum', 'permisi', 'admin', 'kak', 'pak', 'bu',
            // Generic campus words that appear in almost every document and cause false-positive OR matches
            'umri', 'bka', 'universitas', 'muhammadiyah', 'riau', 'pekanbaru',
            'biro', 'informasi', 'info', 'bertanya', 'tanya', 'menanyakan',
            'terbaru', 'resmi', 'kampus', 'mahasiswa', 'tahun', 'jadwal',
        ];

        $words = preg_split('/\s+/u', mb_strtolower($message));
        $keywords = [];

        foreach ($words as $word) {
            $clean = preg_replace('/[^\p{L}\p{N}]/u', '', $word);
            if ($clean === '') {
                continue;
            }

            $isShortAllowed = in_array($clean, self::$shortAllowedTerms, true);
            if (($isShortAllowed || mb_strlen($clean) >= 3) && !in_array($clean, $stopwords, true)) {
                $keywords[] = $clean;
            }
        }

        return array_values(array_unique($keywords));
    }

    /**
     * Always include latest important announcements and news regardless of query.
     */
    private static function getLatestAnnouncementsAndNews(): string
    {
        $sections = [];

        // Latest published announcements (up to 6 so recent schedules are always visible)
        $latest = Pengumuman::terpublikasi()
            ->pentingFirst()
            ->limit(6)
            ->get(['id', 'judul', 'slug', 'isi', 'tanggal_publikasi', 'is_penting']);

        if ($latest->isNotEmpty()) {
            $lines = $latest->map(function ($p) {
                $prefix = $p->is_penting ? '⚠️ PENTING: ' : '';
                $dateStr = $p->tanggal_publikasi ? $p->tanggal_publikasi->format('d/m/Y') : '-';
                $url = url("/pengumuman/{$p->slug}");
                $snippet = self::cleanHtmlKeepLinks($p->isi, 450);

                $attachments = $p->getMedia('lampirans');
                $attLine = '';
                if ($attachments->isNotEmpty()) {
                    $attLinks = $attachments->map(fn ($m) => "[{$m->file_name}]({$m->getUrl()})")->join(', ');
                    $attLine = "\n  Lampiran: {$attLinks}";
                }

                return "- {$prefix}**{$p->judul}** (Tanggal: {$dateStr} | Tautan: [{$p->judul}]({$url}))\n  Ringkasan: {$snippet}{$attLine}";
            })->join("\n\n");
            $sections[] = "[PENGUMUMAN RESMI TERBARU]\n{$lines}";
        }

        // Latest 4 news articles
        $news = Berita::with(['kategori', 'bidang'])
            ->terpublikasi()
            ->terbaru()
            ->limit(4)
            ->get(['id', 'judul', 'slug', 'isi', 'tanggal_publikasi', 'kategori_berita_id', 'bidang_id']);

        if ($news->isNotEmpty()) {
            $lines = $news->map(function ($b) {
                $dateStr = $b->tanggal_publikasi ? $b->tanggal_publikasi->format('d/m/Y') : '-';
                $url = url("/berita/{$b->slug}");
                $kategori = $b->kategori ? $b->kategori->nama : 'Umum';
                $snippet = self::cleanHtmlKeepLinks($b->isi, 400);
                return "- **{$b->judul}** (Tanggal: {$dateStr} | Kategori: {$kategori} | Tautan: [{$b->judul}]({$url}))\n  Ringkasan: {$snippet}";
            })->join("\n\n");
            $sections[] = "[BERITA & KEGIATAN TERBARU]\n{$lines}";
        }

        return implode("\n\n", array_filter($sections));
    }

    /**
     * Search Berita (news) table with relevance scoring.
     */
    private static function searchBerita(array $keywords): ?string
    {
        if (empty($keywords)) {
            return null;
        }

        $candidates = Berita::with(['kategori', 'bidang'])
            ->terpublikasi()
            ->where(function ($q) use ($keywords) {
                foreach ($keywords as $kw) {
                    $kw = mb_strtolower($kw);
                    $q->orWhereRaw('LOWER(judul) LIKE ?', ["%{$kw}%"])
                        ->orWhereRaw('LOWER(isi) LIKE ?', ["%{$kw}%"]);
                }
            })
            ->terbaru()
            ->limit(15)
            ->get();

        if ($candidates->isEmpty()) {
            return null;
        }

        $scored = $candidates->map(function ($b) use ($keywords) {
            $titleLower = mb_strtolower($b->judul);
            $bodyLower = mb_strtolower(strip_tags($b->isi));
            $score = 0;

            foreach ($keywords as $kw) {
                if (Str::contains($titleLower, $kw)) {
                    $score += 3;
                }
                if (Str::contains($bodyLower, $kw)) {
                    $score += 1;
                }
            }

            return ['item' => $b, 'score' => $score];
        })
            ->filter(fn ($row) => $row['score'] > 0)
            ->sortByDesc('score')
            ->take(4);

        if ($scored->isEmpty()) {
            return null;
        }

        $lines = $scored->map(function ($row) {
            $b = $row['item'];
            $content = self::cleanHtmlKeepLinks($b->isi, 1000);
            $url = url("/berita/{$b->slug}");
            $dateStr = $b->tanggal_publikasi ? $b->tanggal_publikasi->format('d/m/Y') : '-';
            $kategori = $b->kategori ? $b->kategori->nama : 'Umum';
            $bidang = $b->bidang ? $b->bidang->nama : 'Umum';

            return "- Judul: **{$b->judul}**\n  Slug: `{$b->slug}`\n  Tanggal: {$dateStr} | Kategori: {$kategori} | Bidang: {$bidang}\n  Tautan Artikel: [{$b->judul}]({$url})\n  Isi Lengkap/Kutipan: {$content}";
        })->join("\n\n");

        return "[HASIL PENCARIAN BERITA RELEVAN]\n{$lines}";
    }

    /**
     * Search Pengumuman (announcements) table with relevance scoring.
     */
    private static function searchPengumuman(array $keywords): ?string
    {
        if (empty($keywords)) {
            return null;
        }

        $candidates = Pengumuman::terpublikasi()
            ->where(function ($q) use ($keywords) {
                foreach ($keywords as $kw) {
                    $kw = mb_strtolower($kw);
                    $q->orWhereRaw('LOWER(judul) LIKE ?', ["%{$kw}%"])
                        ->orWhereRaw('LOWER(isi) LIKE ?', ["%{$kw}%"]);
                }
            })
            ->pentingFirst()
            ->limit(20)
            ->get();

        if ($candidates->isEmpty()) {
            return null;
        }

        $scored = $candidates->map(function ($p) use ($keywords) {
            $titleLower = mb_strtolower($p->judul);
            $bodyLower = mb_strtolower(strip_tags($p->isi));
            $score = $p->is_penting ? 1 : 0;

            foreach ($keywords as $kw) {
                if (Str::contains($titleLower, $kw)) {
                    $score += 3;
                }
                if (Str::contains($bodyLower, $kw)) {
                    $score += 1;
                }
            }

            return ['item' => $p, 'score' => $score];
        })
            ->filter(fn ($row) => $row['score'] > 0)
            ->sortByDesc('score')
            ->take(5);

        if ($scored->isEmpty()) {
            return null;
        }

        $lines = $scored->map(function ($row) {
            $p = $row['item'];
            $content = self::cleanHtmlKeepLinks($p->isi, 1000);
            $url = url("/pengumuman/{$p->slug}");
            $dateStr = $p->tanggal_publikasi ? $p->tanggal_publikasi->format('d/m/Y') : '-';
            $pentingLabel = $p->is_penting ? '⚠️ PENTING | ' : '';

            $attachments = $p->getMedia('lampirans');
            $attLine = '';
            if ($attachments->isNotEmpty()) {
                $attLinks = $attachments->map(fn ($m) => "[{$m->file_name}]({$m->getUrl()})")->join(', ');
                $attLine = "\n  File Lampiran Pengumuman: {$attLinks}";
            }

            return "- Judul: {$pentingLabel}**{$p->judul}**\n  Slug: `{$p->slug}`\n  Tanggal Publikasi: {$dateStr}\n  Tautan Pengumuman: [{$p->judul}]({$url})\n  Isi Lengkap/Kutipan: {$content}{$attLine}";
        })->join("\n\n");

        return "[HASIL PENCARIAN PENGUMUMAN RELEVAN]\n{$lines}";
    }

    /**
     * Get divisions (Bidang) with full description and head of division tasks.
     */
    private static function searchBidang(array $keywords): ?string
    {
        $bidangs = Bidang::with(['kepalaBagian', 'anggotas'])->orderBy('urutan')->get();
        if ($bidangs->isEmpty()) {
            return null;
        }

        $lines = $bidangs->map(function ($b) {
            $url = url("/bidang/{$b->slug}");
            $desc = $b->deskripsi_lengkap ?: $b->deskripsi_singkat;
            $kbInfo = '';
            if ($b->kepalaBagian) {
                $tugas = $b->kepalaBagian->deskripsi_tugas ? " — Tugas: {$b->kepalaBagian->deskripsi_tugas}" : '';
                $kbInfo = "\n  Kepala Bagian: {$b->kepalaBagian->nama} ({$b->kepalaBagian->jabatan}){$tugas}";
            }
            return "- **{$b->nama}** (Tautan: [{$b->nama}]({$url}))\n  Deskripsi: {$desc}{$kbInfo}";
        })->join("\n\n");

        return "[DAFTAR BIDANG & BAGIAN BKA UMRI]\n{$lines}";
    }

    /**
     * Search Lampiran (attachments/documents) with direct download URLs.
     */
    private static function searchLampiran(array $keywords, string $rawMessage = ''): ?string
    {
        $allLampirans = Lampiran::with('kategori')->orderBy('urutan')->latest()->limit(15)->get();
        if ($allLampirans->isEmpty()) {
            return null;
        }

        // Check if user is asking about documents, downloads, fees, SK, PMB, UKT, etc.
        $docTriggerWords = ['lampiran', 'dokumen', 'unduh', 'download', 'berkas', 'file', 'sk', 'biaya', 'pmb', 'panduan', 'ukt', 'spp', 'formulir', 'dispensasi', 'sop', 'tarif'];
        $msgLower = mb_strtolower($rawMessage);
        $isDocQuery = false;

        foreach ($docTriggerWords as $tw) {
            if (Str::contains($msgLower, $tw) || in_array($tw, $keywords, true)) {
                $isDocQuery = true;
                break;
            }
        }

        $matched = collect();
        if (!empty($keywords)) {
            $matched = $allLampirans->filter(function ($l) use ($keywords) {
                $haystack = mb_strtolower($l->nama_tampilan . ' ' . ($l->deskripsi ?? '') . ' ' . ($l->kategori->nama ?? ''));
                foreach ($keywords as $kw) {
                    if (Str::contains($haystack, $kw)) {
                        return true;
                    }
                }
                return false;
            });
        }

        $itemsToShow = $matched->isNotEmpty() ? $matched : ($isDocQuery ? $allLampirans : $allLampirans->take(8));

        $lines = $itemsToShow->map(function ($l) {
            $downloadUrl = url("/lampiran/download/{$l->id}");
            $katInfo = $l->kategori ? " | Kategori: {$l->kategori->nama}" : '';
            $descInfo = $l->deskripsi ? " — {$l->deskripsi}" : '';
            return "- **{$l->nama_tampilan}**{$katInfo}{$descInfo} (Unduh langsung: [Unduh {$l->nama_tampilan}]({$downloadUrl}))";
        })->join("\n");

        $lampiranPageUrl = url('/lampiran');
        return "[DOKUMEN / LAMPIRAN RESMI BKA UMRI]\n{$lines}\nHalaman Katalog Dokumen: [Lampiran BKA UMRI]({$lampiranPageUrl})";
    }

    /**
     * Include Visi & Misi from both HalamanStatis and Misi model.
     */
    private static function getVisiMisiContext(): string
    {
        $sections = [];
        $visiPage = HalamanStatis::where('slug', 'visi-misi')->first();
        if ($visiPage && $visiPage->konten) {
            $sections[] = 'Visi: ' . self::cleanHtmlKeepLinks($visiPage->konten, 600);
        }

        $misis = Misi::orderBy('urutan')->get();
        if ($misis->isNotEmpty()) {
            $misiLines = $misis->map(fn ($m, $idx) => ($idx + 1) . '. ' . trim($m->isi))->join("\n");
            $sections[] = "Misi:\n{$misiLines}";
        }

        if (empty($sections)) {
            return '';
        }

        $url = url('/profil/visi-misi');
        return "[VISI & MISI BKA UMRI (Tautan: [Visi & Misi]({$url}))]\n" . implode("\n", $sections);
    }

    /**
     * Search HalamanStatis (static pages like Tentang Kami).
     */
    private static function searchHalamanStatis(array $keywords): ?string
    {
        $tentang = HalamanStatis::where('slug', 'tentang-kami')->first();
        if (!$tentang) {
            return null;
        }

        $content = self::cleanHtmlKeepLinks($tentang->konten, 800);
        $fullUrl = url('/profil/tentang-kami');

        return "[PROFIL / TENTANG BKA UMRI (Tautan: [Tentang Kami]({$fullUrl}))]\n{$content}";
    }

    /**
     * Search Dokumentasi / Album kegiatan.
     */
    private static function searchDokumentasi(array $keywords, string $rawMessage = ''): ?string
    {
        $albums = Album::with('kategori')->withCount('fotos')->latest()->limit(6)->get();
        if ($albums->isEmpty()) {
            return null;
        }

        $lines = $albums->map(function ($album) {
            $dateStr = $album->tanggal_kegiatan ? $album->tanggal_kegiatan->format('d/m/Y') : '-';
            $kat = $album->kategori ? $album->kategori->nama : 'Umum';
            $url = url("/dokumentasi/{$album->slug}");
            $desc = $album->deskripsi ? ' — ' . Str::limit(strip_tags($album->deskripsi), 150) : '';
            return "- **{$album->judul}** (Tanggal: {$dateStr} | Kategori: {$kat} | {$album->fotos_count} Foto | Tautan: [{$album->judul}]({$url})){$desc}";
        })->join("\n");

        return "[DOKUMENTASI KEGIATAN BKA UMRI (Tautan: [Dokumentasi](" . url('/dokumentasi') . "))]\n{$lines}";
    }

    /**
     * Get contact information from Pengaturan.
     */
    private static function getContactInfo(): string
    {
        $alamat = Pengaturan::getValue('alamat', 'Gedung Rektorat Lt. 1, Jl. T. Tambusai, Pekanbaru');
        $telepon = Pengaturan::getValue('telepon', '(0761) 35008 / +62 898-4336-960');
        $email = Pengaturan::getValue('email', 'bka@umri.ac.id');
        $jamOps = Pengaturan::getValue('jam_operasional', 'Senin-Jumat 08.00-16.00 WIB, Sabtu 08.00-13.00 WIB');

        return "[INFO KONTAK RESMI BKA UMRI]\nAlamat: {$alamat}\nTelepon / Kontak: {$telepon}\nEmail: {$email}\nJam Operasional: {$jamOps}";
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

        $lines = $layanans->map(fn ($l) => "- {$l->judul}: {$l->deskripsi}")->join("\n");
        return "[LAYANAN BKA]\n{$lines}";
    }

    /**
     * Get statistik data.
     */
    private static function getStatistikInfo(): string
    {
        $stats = Statistik::orderBy('urutan')->get(['label', 'angka']);
        if ($stats->isEmpty()) {
            return '';
        }

        $lines = $stats->map(fn ($s) => "- {$s->label}: {$s->angka}")->join("\n");
        return "[STATISTIK BKA]\n{$lines}";
    }

    /**
     * Search Custom Chatbot FAQs for relevant answers.
     */
    private static function searchChatbotFaqs(array $keywords): ?string
    {
        $allFaqs = ChatbotFaq::orderBy('urutan')->get(['label', 'question', 'answer']);
        if ($allFaqs->isEmpty()) {
            return null;
        }

        if (!empty($keywords)) {
            $scored = $allFaqs->map(function ($faq) use ($keywords) {
                $haystack = mb_strtolower($faq->label . ' ' . $faq->question . ' ' . $faq->answer);
                $score = 0;
                foreach ($keywords as $kw) {
                    if (Str::contains($haystack, $kw)) {
                        $score++;
                    }
                }
                return ['faq' => $faq, 'score' => $score];
            })->filter(fn ($r) => $r['score'] > 0)->sortByDesc('score')->take(5);

            if ($scored->isNotEmpty()) {
                $lines = $scored->map(fn ($r) => "Tanya: {$r['faq']->question}\nJawab: {$r['faq']->answer}")->join("\n\n");
                return "[TANYA JAWAB / FAQ RESMI BKA]\n{$lines}";
            }
        }

        $lines = $allFaqs->take(5)->map(fn ($f) => "Tanya: {$f->question}\nJawab: {$f->answer}")->join("\n\n");
        return "[TANYA JAWAB / FAQ RESMI BKA]\n{$lines}";
    }

    /**
     * Get Kepala Biro (Head of Bureau) information including greeting summary.
     */
    private static function getKepalaBiroInfo(): string
    {
        $kb = KepalaBiro::first();
        if (!$kb) {
            return "[KEPALA BIRO BKA UMRI]\nInformasi Kepala Biro belum diatur.";
        }

        $sambutan = $kb->sambutan ? "\nSambutan Kepala Biro: " . self::cleanHtmlKeepLinks($kb->sambutan, 400) : '';
        return "[KEPALA BIRO BKA UMRI]\nNama: {$kb->nama}\nJabatan: {$kb->jabatan}\nPeriode: {$kb->periode}{$sambutan}";
    }

    /**
     * Get organizational structure and division staff members dynamically from database.
     */
    private static function getStrukturOrganisasiContext(array $keywords = []): string
    {
        $lines = [];

        // 1. Kepala Biro
        $kb = KepalaBiro::first();
        if ($kb) {
            $lines[] = "- Kepala Biro: **{$kb->nama}** (Jabatan: {$kb->jabatan}, {$kb->periode})";
        }

        // 2. Division Heads & Members (Bidang)
        $bidangs = Bidang::with(['kepalaBagian', 'anggotas'])->orderBy('urutan')->get();
        foreach ($bidangs as $bidang) {
            $lines[] = "\n[Bagian: {$bidang->nama}]";
            if ($bidang->kepalaBagian) {
                $tugas = $bidang->kepalaBagian->deskripsi_tugas ? " | Tugas: {$bidang->kepalaBagian->deskripsi_tugas}" : '';
                $lines[] = "  - Kepala Bagian: **{$bidang->kepalaBagian->nama}** (Jabatan: {$bidang->kepalaBagian->jabatan}{$tugas})";
            }
            foreach ($bidang->anggotas as $anggota) {
                $lines[] = "  - Anggota/Staf: **{$anggota->nama}** (Jabatan: {$anggota->jabatan})";
            }
        }

        // 3. General Struktur Anggota (including tugas_pokok & jobdesk)
        $strukturs = StrukturAnggota::orderBy('urutan')->get();
        if ($strukturs->isNotEmpty()) {
            $lines[] = "\n[Pejabat & Anggota Struktur Organisasi BKA]";
            foreach ($strukturs as $sa) {
                $details = [];
                if (!empty($sa->tugas_pokok)) {
                    $details[] = "Tugas Pokok: " . self::cleanHtmlKeepLinks($sa->tugas_pokok, 250);
                }
                if (!empty($sa->jobdesk)) {
                    $details[] = "Jobdesk: " . self::cleanHtmlKeepLinks($sa->jobdesk, 250);
                }
                $detailStr = !empty($details) ? ' (' . implode(' | ', $details) . ')' : '';
                $lines[] = "  - **{$sa->nama}** — Jabatan: {$sa->jabatan}{$detailStr}";
            }
        }

        $url = url('/profil/struktur-organisasi');
        return "[STRUKTUR ORGANISASI & STAF BKA UMRI (Tautan: [Struktur Organisasi]({$url}))]\n" . implode("\n", $lines);
    }
}
