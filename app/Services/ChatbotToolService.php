<?php

namespace App\Services;

use App\Models\Berita;
use App\Models\Bidang;
use App\Models\KepalaBiro;
use App\Models\Lampiran;
use App\Models\Misi;
use App\Models\Pengaturan;
use App\Models\Pengumuman;
use App\Models\StrukturAnggota;
use Illuminate\Support\Str;

class ChatbotToolService
{
    /**
     * Return OpenAI-compatible function tool definitions for agentic database querying.
     */
    public static function getToolDefinitions(): array
    {
        return [
            [
                'type' => 'function',
                'function' => [
                    'name' => 'search_berita_pengumuman',
                    'description' => 'Cari artikel berita atau pengumuman resmi BKA UMRI di database berdasarkan kata kunci atau ambil yang terbaru.',
                    'parameters' => [
                        'type' => 'object',
                        'properties' => [
                            'query' => [
                                'type' => 'string',
                                'description' => 'Kata kunci pencarian (misal: "KKN", "pembayaran UKT", "jadwal cicilan", "wisuda", atau kosongkan untuk mengambil berita/pengumuman terbaru).',
                            ],
                            'tipe' => [
                                'type' => 'string',
                                'enum' => ['semua', 'berita', 'pengumuman'],
                                'description' => 'Jenis informasi yang dicari: "semua", "berita", atau "pengumuman".',
                            ],
                        ],
                        'required' => ['query'],
                    ],
                ],
            ],
            [
                'type' => 'function',
                'function' => [
                    'name' => 'get_detail_berita_pengumuman',
                    'description' => 'Baca isi lengkap (100% penuh tanpa dipotong) beserta tautan dan lampiran dari suatu berita atau pengumuman berdasarkan slug atau judulnya.',
                    'parameters' => [
                        'type' => 'object',
                        'properties' => [
                            'slug' => [
                                'type' => 'string',
                                'description' => 'Slug URL atau judul berita/pengumuman yang ingin dibaca secara lengkap.',
                            ],
                        ],
                        'required' => ['slug'],
                    ],
                ],
            ],
            [
                'type' => 'function',
                'function' => [
                    'name' => 'get_daftar_lampiran',
                    'description' => 'Cari dan ambil daftar dokumen/lampiran resmi BKA UMRI (SK, panduan pembayaran, SOP, formulir) beserta link unduhan langsung.',
                    'parameters' => [
                        'type' => 'object',
                        'properties' => [
                            'keyword' => [
                                'type' => 'string',
                                'description' => 'Kata kunci dokumen (misal: "panduan", "SK", "tarif", "SOP", atau kosongkan untuk menampilkan semua dokumen resmi).',
                            ],
                        ],
                        'required' => [],
                    ],
                ],
            ],
            [
                'type' => 'function',
                'function' => [
                    'name' => 'get_profil_struktur_bidang',
                    'description' => 'Ambil data lengkap profil BKA UMRI, Visi & Misi, Kepala Biro, bidang-bidang kerja, pejabat, staf, dan tupoksi/jobdesk.',
                    'parameters' => [
                        'type' => 'object',
                        'properties' => (object) [],
                        'required' => [],
                    ],
                ],
            ],
        ];
    }

    /**
     * Execute a tool call requested by the LLM and return a string result.
     */
    public static function executeTool(string $name, array $arguments): string
    {
        try {
            return match ($name) {
                'search_berita_pengumuman' => self::searchBeritaPengumuman(
                    (string) ($arguments['query'] ?? ''),
                    (string) ($arguments['tipe'] ?? 'semua')
                ),
                'get_detail_berita_pengumuman' => self::getDetailBeritaPengumuman(
                    (string) ($arguments['slug'] ?? '')
                ),
                'get_daftar_lampiran' => self::getDaftarLampiran(
                    (string) ($arguments['keyword'] ?? '')
                ),
                'get_profil_struktur_bidang' => self::getProfilStrukturBidang(),
                default => "Tool '{$name}' tidak dikenali.",
            };
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning("ChatbotToolService error in {$name}: " . $e->getMessage());
            return "Gagal menjalankan tool {$name}: " . $e->getMessage();
        }
    }

    /**
     * Search Berita and/or Pengumuman in the database.
     */
    private static function searchBeritaPengumuman(string $query, string $tipe = 'semua'): string
    {
        $appUrl = rtrim(url('/'), '/');
        $keywords = ContextBuilder::extractKeywords($query);
        $output = [];

        if ($tipe === 'semua' || $tipe === 'pengumuman') {
            $pengumumanQuery = Pengumuman::with('lampirans')
                ->where('status_publikasi', 'published');

            if (!empty($keywords)) {
                $pengumumanQuery->where(function ($q) use ($keywords) {
                    foreach ($keywords as $kw) {
                        $q->orWhere('judul', 'LIKE', "%{$kw}%")
                            ->orWhere('isi_pengumuman', 'LIKE', "%{$kw}%");
                    }
                });
            }

            $candidates = $pengumumanQuery->orderBy('tanggal_terbit', 'desc')
                ->limit(15)
                ->get(['id', 'judul', 'slug', 'isi_pengumuman', 'tanggal_terbit']);

            if ($candidates->isEmpty() && !empty($keywords)) {
                // Fallback to latest 5 announcements if keyword had no exact match
                $candidates = Pengumuman::with('lampirans')
                    ->where('status_publikasi', 'published')
                    ->orderBy('tanggal_terbit', 'desc')
                    ->limit(5)
                    ->get(['id', 'judul', 'slug', 'isi_pengumuman', 'tanggal_terbit']);
            }

            if ($candidates->isNotEmpty()) {
                if (!empty($keywords)) {
                    $candidates = $candidates->sortByDesc(function ($item) use ($keywords) {
                        $score = 0;
                        $titleLower = mb_strtolower($item->judul ?? '');
                        $bodyLower = mb_strtolower(strip_tags($item->isi_pengumuman ?? ''));
                        foreach ($keywords as $kw) {
                            if (str_contains($titleLower, $kw)) {
                                $score += 3;
                            }
                            if (str_contains($bodyLower, $kw)) {
                                $score += 1;
                            }
                        }
                        return $score;
                    })->take(5);
                } else {
                    $candidates = $candidates->take(5);
                }

                $lines = ["HASIL PENCARIAN PENGUMUMAN RESMI:"];
                foreach ($candidates as $item) {
                    $date = $item->tanggal_terbit ? $item->tanggal_terbit->format('d M Y') : '-';
                    $url = "{$appUrl}/pengumuman/{$item->slug}";
                    $content = Str::limit(ContextBuilder::cleanHtmlKeepLinks($item->isi_pengumuman), 900);
                    $line = "- Judul: **{$item->judul}** (Tanggal: {$date})\n  Slug: `{$item->slug}`\n  Tautan: [Baca Pengumuman]({$url})\n  Isi Ringkas: {$content}";

                    if ($item->relationLoaded('lampirans') && $item->lampirans->isNotEmpty()) {
                        $att = [];
                        foreach ($item->lampirans as $l) {
                            $attUrl = $l->url_eksternal ?: ($l->path_file ? asset('storage/' . $l->path_file) : '');
                            if ($attUrl) {
                                $att[] = "[{$l->nama_lampiran}]({$attUrl})";
                            }
                        }
                        if (!empty($att)) {
                            $line .= "\n  Lampiran: " . implode(', ', $att);
                        }
                    }
                    $lines[] = $line;
                }
                $output[] = implode("\n\n", $lines);
            }
        }

        if ($tipe === 'semua' || $tipe === 'berita') {
            $beritaQuery = Berita::with('lampirans')
                ->where('status_publikasi', 'published');

            if (!empty($keywords)) {
                $beritaQuery->where(function ($q) use ($keywords) {
                    foreach ($keywords as $kw) {
                        $q->orWhere('judul', 'LIKE', "%{$kw}%")
                            ->orWhere('isi_berita', 'LIKE', "%{$kw}%");
                    }
                });
            }

            $candidates = $beritaQuery->orderBy('tanggal_terbit', 'desc')
                ->limit(15)
                ->get(['id', 'judul', 'slug', 'isi_berita', 'tanggal_terbit', 'penulis']);

            if ($candidates->isEmpty() && !empty($keywords)) {
                $candidates = Berita::with('lampirans')
                    ->where('status_publikasi', 'published')
                    ->orderBy('tanggal_terbit', 'desc')
                    ->limit(5)
                    ->get(['id', 'judul', 'slug', 'isi_berita', 'tanggal_terbit', 'penulis']);
            }

            if ($candidates->isNotEmpty()) {
                if (!empty($keywords)) {
                    $candidates = $candidates->sortByDesc(function ($item) use ($keywords) {
                        $score = 0;
                        $titleLower = mb_strtolower($item->judul ?? '');
                        $bodyLower = mb_strtolower(strip_tags($item->isi_berita ?? ''));
                        foreach ($keywords as $kw) {
                            if (str_contains($titleLower, $kw)) {
                                $score += 3;
                            }
                            if (str_contains($bodyLower, $kw)) {
                                $score += 1;
                            }
                        }
                        return $score;
                    })->take(5);
                } else {
                    $candidates = $candidates->take(5);
                }

                $lines = ["HASIL PENCARIAN BERITA & ARTIKEL:"];
                foreach ($candidates as $item) {
                    $date = $item->tanggal_terbit ? $item->tanggal_terbit->format('d M Y') : '-';
                    $url = "{$appUrl}/berita/{$item->slug}";
                    $content = Str::limit(ContextBuilder::cleanHtmlKeepLinks($item->isi_berita), 900);
                    $line = "- Judul: **{$item->judul}** (Tanggal: {$date})\n  Slug: `{$item->slug}`\n  Tautan: [Baca Berita]({$url})\n  Isi Ringkas: {$content}";

                    if ($item->relationLoaded('lampirans') && $item->lampirans->isNotEmpty()) {
                        $att = [];
                        foreach ($item->lampirans as $l) {
                            $attUrl = $l->url_eksternal ?: ($l->path_file ? asset('storage/' . $l->path_file) : '');
                            if ($attUrl) {
                                $att[] = "[{$l->nama_lampiran}]({$attUrl})";
                            }
                        }
                        if (!empty($att)) {
                            $line .= "\n  Lampiran: " . implode(', ', $att);
                        }
                    }
                    $lines[] = $line;
                }
                $output[] = implode("\n\n", $lines);
            }
        }

        if (empty($output)) {
            return "Tidak ditemukan berita atau pengumuman untuk kata kunci '{$query}'.";
        }

        return implode("\n\n---\n\n", $output);
    }

    /**
     * Get the complete untruncated content of a specific Pengumuman or Berita by slug or title.
     */
    private static function getDetailBeritaPengumuman(string $slugOrTitle): string
    {
        $cleanSlug = trim($slugOrTitle);
        if (str_contains($cleanSlug, '/')) {
            $parts = explode('/', rtrim($cleanSlug, '/'));
            $cleanSlug = end($parts) ?: $cleanSlug;
        }

        $appUrl = rtrim(url('/'), '/');

        // 1. Check Pengumuman by exact slug or title LIKE
        $pengumuman = Pengumuman::with('lampirans')
            ->where('status_publikasi', 'published')
            ->where(function ($q) use ($cleanSlug, $slugOrTitle) {
                $q->where('slug', $cleanSlug)
                    ->orWhere('judul', 'LIKE', "%{$slugOrTitle}%");
            })
            ->first();

        if ($pengumuman) {
            $date = $pengumuman->tanggal_terbit ? $pengumuman->tanggal_terbit->format('d M Y') : '-';
            $url = "{$appUrl}/pengumuman/{$pengumuman->slug}";
            $fullContent = ContextBuilder::cleanHtmlKeepLinks($pengumuman->isi_pengumuman);
            $res = "DETAIL LENGKAP PENGUMUMAN:\n"
                . "Judul: {$pengumuman->judul}\n"
                . "Tanggal Terbit: {$date}\n"
                . "Tautan Resmi: [Baca Pengumuman]({$url})\n"
                . "Isi Lengkap:\n{$fullContent}";

            if ($pengumuman->lampirans->isNotEmpty()) {
                $att = [];
                foreach ($pengumuman->lampirans as $l) {
                    $attUrl = $l->url_eksternal ?: ($l->path_file ? asset('storage/' . $l->path_file) : '');
                    if ($attUrl) {
                        $att[] = "- [{$l->nama_lampiran}]({$attUrl})";
                    }
                }
                if (!empty($att)) {
                    $res .= "\n\nLampiran Terkait:\n" . implode("\n", $att);
                }
            }

            return $res;
        }

        // 2. Check Berita by exact slug or title LIKE
        $berita = Berita::with('lampirans')
            ->where('status_publikasi', 'published')
            ->where(function ($q) use ($cleanSlug, $slugOrTitle) {
                $q->where('slug', $cleanSlug)
                    ->orWhere('judul', 'LIKE', "%{$slugOrTitle}%");
            })
            ->first();

        if ($berita) {
            $date = $berita->tanggal_terbit ? $berita->tanggal_terbit->format('d M Y') : '-';
            $url = "{$appUrl}/berita/{$berita->slug}";
            $fullContent = ContextBuilder::cleanHtmlKeepLinks($berita->isi_berita);
            $res = "DETAIL LENGKAP BERITA:\n"
                . "Judul: {$berita->judul}\n"
                . "Tanggal Terbit: {$date}\n"
                . "Penulis: " . ($berita->penulis ?: 'Admin BKA') . "\n"
                . "Tautan Resmi: [Baca Berita]({$url})\n"
                . "Isi Lengkap:\n{$fullContent}";

            if ($berita->lampirans->isNotEmpty()) {
                $att = [];
                foreach ($berita->lampirans as $l) {
                    $attUrl = $l->url_eksternal ?: ($l->path_file ? asset('storage/' . $l->path_file) : '');
                    if ($attUrl) {
                        $att[] = "- [{$l->nama_lampiran}]({$attUrl})";
                    }
                }
                if (!empty($att)) {
                    $res .= "\n\nLampiran Terkait:\n" . implode("\n", $att);
                }
            }

            return $res;
        }

        return "Artikel atau pengumuman dengan slug/judul '{$slugOrTitle}' tidak ditemukan di database.";
    }

    /**
     * Get list of official downloadable Lampiran documents.
     */
    private static function getDaftarLampiran(string $keyword = ''): string
    {
        $appUrl = rtrim(url('/'), '/');
        $keywords = ContextBuilder::extractKeywords($keyword);

        $query = Lampiran::query();
        if (!empty($keywords)) {
            $query->where(function ($q) use ($keywords) {
                foreach ($keywords as $kw) {
                    $q->orWhere('judul', 'LIKE', "%{$kw}%")
                        ->orWhere('deskripsi', 'LIKE', "%{$kw}%");
                }
            });
        }

        $items = $query->orderBy('created_at', 'desc')
            ->limit(15)
            ->get(['id', 'judul', 'deskripsi', 'tipe_file', 'jumlah_unduhan', 'created_at']);

        if ($items->isEmpty() && !empty($keywords)) {
            $items = Lampiran::orderBy('created_at', 'desc')
                ->limit(10)
                ->get(['id', 'judul', 'deskripsi', 'tipe_file', 'jumlah_unduhan', 'created_at']);
        }

        if ($items->isEmpty()) {
            return "Belum ada dokumen lampiran resmi yang tersimpan di database.";
        }

        $lines = ["DAFTAR DOKUMEN / LAMPIRAN RESMI BKA UMRI (Halaman utama: [Semua Lampiran]({$appUrl}/lampiran)):"];
        foreach ($items as $item) {
            $desc = ContextBuilder::cleanHtmlKeepLinks($item->deskripsi ?? '');
            $downloadUrl = "{$appUrl}/lampiran/download/{$item->id}";
            $type = strtoupper($item->tipe_file ?? 'FILE');
            $lines[] = "- **{$item->judul}** ({$type}) — {$desc} | [Unduh Dokumen]({$downloadUrl})";
        }

        return implode("\n", $lines);
    }

    /**
     * Get complete BKA profile, Visi & Misi, Kepala Biro, Divisions, and Staff structure.
     */
    private static function getProfilStrukturBidang(): string
    {
        $parts = [];

        $namaBiro = Pengaturan::getValue('nama_biro', 'Biro Keuangan dan Aset (BKA) UMRI');
        $tentang = ContextBuilder::cleanHtmlKeepLinks(Pengaturan::getValue('tentang_kami', ''));
        $visi = ContextBuilder::cleanHtmlKeepLinks(Pengaturan::getValue('visi', ''));
        $alamat = Pengaturan::getValue('alamat', '');
        $email = Pengaturan::getValue('email', '');
        $telepon = Pengaturan::getValue('telepon', '');
        $jamOp = Pengaturan::getValue('jam_operasional', '');

        $info = ["PROFIL RESMI {$namaBiro}:"];
        if ($tentang) {
            $info[] = "Tentang Kami: {$tentang}";
        }
        if ($visi) {
            $info[] = "Visi: {$visi}";
        }
        $misis = Misi::orderBy('urutan')->get(['teks_misi']);
        if ($misis->isNotEmpty()) {
            $info[] = "Misi:";
            foreach ($misis as $idx => $m) {
                $info[] = ($idx + 1) . ". " . ContextBuilder::cleanHtmlKeepLinks($m->teks_misi);
            }
        }
        if ($alamat) {
            $info[] = "Alamat: {$alamat}";
        }
        if ($email) {
            $info[] = "Email: {$email}";
        }
        if ($telepon) {
            $info[] = "Telepon/WA: {$telepon}";
        }
        if ($jamOp) {
            $info[] = "Jam Operasional: {$jamOp}";
        }
        $parts[] = implode("\n", $info);

        $kepalaBiro = KepalaBiro::where('status_aktif', true)->first();
        if ($kepalaBiro) {
            $kb = "KEPALA BIRO: {$kepalaBiro->nama} ({$kepalaBiro->jabatan})";
            if (!empty($kepalaBiro->nik)) {
                $kb .= " — NIK/NIP: {$kepalaBiro->nik}";
            }
            if (!empty($kepalaBiro->sambutan)) {
                $kb .= "\nSambutan: " . Str::limit(ContextBuilder::cleanHtmlKeepLinks($kepalaBiro->sambutan), 500);
            }
            $parts[] = $kb;
        }

        $bidangs = Bidang::with(['kepalaBagian', 'anggotas'])->orderBy('urutan')->get();
        if ($bidangs->isNotEmpty()) {
            $bLines = ["BIDANG-BIDANG DI BKA UMRI:"];
            foreach ($bidangs as $bidang) {
                $desc = ContextBuilder::cleanHtmlKeepLinks($bidang->deskripsi_lengkap ?: $bidang->deskripsi_singkat);
                $line = "- **{$bidang->nama_bidang}**: {$desc}";
                if ($bidang->kepalaBagian) {
                    $kbTugas = ContextBuilder::cleanHtmlKeepLinks($bidang->kepalaBagian->deskripsi_tugas ?? '');
                    $line .= "\n  Kepala Bagian: {$bidang->kepalaBagian->nama} ({$bidang->kepalaBagian->jabatan})"
                        . ($kbTugas ? " — Tugas: {$kbTugas}" : '');
                }
                if ($bidang->anggotas->isNotEmpty()) {
                    $anggotaList = $bidang->anggotas->map(fn($a) => "{$a->nama} ({$a->jabatan})")->implode(', ');
                    $line .= "\n  Staf Bidang: {$anggotaList}";
                }
                $bLines[] = $line;
            }
            $parts[] = implode("\n", $bLines);
        }

        $strukturs = StrukturAnggota::orderBy('level')->orderBy('urutan')->get();
        if ($strukturs->isNotEmpty()) {
            $sLines = ["STRUKTUR ORGANISASI & TUPOKSI PERSONEL:"];
            foreach ($strukturs as $s) {
                $tupoksi = ContextBuilder::cleanHtmlKeepLinks($s->tugas_pokok ?? '');
                $jobdesk = is_array($s->jobdesk) ? implode('; ', array_filter($s->jobdesk)) : '';
                $line = "- **{$s->nama}** — Jabatan: {$s->jabatan}";
                if (!empty($s->nik)) {
                    $line .= " (NIK: {$s->nik})";
                }
                if ($tupoksi) {
                    $line .= " | Tugas Pokok: {$tupoksi}";
                }
                if ($jobdesk) {
                    $line .= " | Jobdesk: {$jobdesk}";
                }
                $sLines[] = $line;
            }
            $parts[] = implode("\n", $sLines);
        }

        return implode("\n\n", $parts);
    }
}
