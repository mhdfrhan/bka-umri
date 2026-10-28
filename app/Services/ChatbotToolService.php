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
     * Return OpenAI-compatible function tool definitions for agentic database and web querying.
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
            [
                'type' => 'function',
                'function' => [
                    'name' => 'search_web',
                    'description' => 'Cari informasi terbaru di internet (web search) jika informasi yang ditanyakan tidak ditemukan di database internal BKA UMRI (misal: informasi umum UMRI, fakultas, prodi, PMB, akreditasi, beasiswa, berita kampus, atau referensi eksternal terkait).',
                    'parameters' => [
                        'type' => 'object',
                        'properties' => [
                            'query' => [
                                'type' => 'string',
                                'description' => 'Kata kunci pencarian internet yang spesifik (misal: "fakultas dan prodi Universitas Muhammadiyah Riau", "jadwal PMB UMRI", "akreditasi UMRI").',
                            ],
                        ],
                        'required' => ['query'],
                    ],
                ],
            ],
            [
                'type' => 'function',
                'function' => [
                    'name' => 'read_web_page',
                    'description' => 'Baca isi teks lengkap dari suatu URL halaman web eksternal (misal halaman dari hasil search_web atau situs resmi umri.ac.id).',
                    'parameters' => [
                        'type' => 'object',
                        'properties' => [
                            'url' => [
                                'type' => 'string',
                                'description' => 'URL lengkap halaman web (harus diawali https:// atau http://).',
                            ],
                        ],
                        'required' => ['url'],
                    ],
                ],
            ],
        ];
    }

    /**
     * Build a human-friendly real-time status message describing what tool is currently running.
     */
    public static function getToolStatusMessage(string $name, array $arguments): string
    {
        return match ($name) {
            'search_web' => !empty($arguments['query'])
                ? 'Sedang mencari di internet: "' . Str::limit(trim((string) $arguments['query']), 45) . '"...'
                : 'Sedang mencari informasi di internet...',
            'read_web_page' => !empty($arguments['url'])
                ? 'Sedang membaca halaman web ' . (parse_url((string) $arguments['url'], PHP_URL_HOST) ?: 'eksternal') . '...'
                : 'Sedang membaca isi halaman web...',
            'search_berita_pengumuman' => !empty($arguments['query'])
                ? 'Sedang mencari di database BKA: "' . Str::limit(trim((string) $arguments['query']), 40) . '"...'
                : 'Sedang memeriksa berita & pengumuman terbaru BKA...',
            'get_detail_berita_pengumuman' => 'Sedang membaca isi lengkap artikel di database BKA...',
            'get_daftar_lampiran' => 'Sedang mencari dokumen & lampiran resmi BKA...',
            'get_profil_struktur_bidang' => 'Sedang memuat data profil & struktur organisasi BKA...',
            default => 'Sedang memproses data...',
        };
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
                'search_web' => self::searchWeb(
                    (string) ($arguments['query'] ?? '')
                ),
                'read_web_page' => self::readWebPage(
                    (string) ($arguments['url'] ?? '')
                ),
                default => "Tool '{$name}' tidak dikenali.",
            };
        } catch (\Throwable $e) {
            if (class_exists(\Illuminate\Support\Facades\Log::class)) {
                try {
                    \Illuminate\Support\Facades\Log::warning("ChatbotToolService error in {$name}: " . $e->getMessage());
                } catch (\Throwable) {
                    // Ignore if facade root is not booted in unit test
                }
            }
            return "Gagal menjalankan tool {$name}: " . $e->getMessage();
        }
    }

    /**
     * Keyless multi-source internet search (DuckDuckGo HTML + Bing/Google News RSS + Wikipedia ID fallback).
     */
    public static function searchWeb(string $query): string
    {
        $cleanQuery = trim($query);
        if ($cleanQuery === '') {
            return 'Kata kunci pencarian web tidak boleh kosong.';
        }

        $results = [];

        // 1. Primary: DuckDuckGo HTML Search
        $ddgResults = self::searchDuckDuckGoHtml($cleanQuery);
        foreach ($ddgResults as $item) {
            $results[$item['url']] = $item;
        }

        // 2. Supplement: Wikipedia Bahasa Indonesia API (encyclopedic & institutional facts)
        if (count($results) < 5) {
            $wikiResults = self::searchWikipediaId($cleanQuery);
            foreach ($wikiResults as $item) {
                if (!isset($results[$item['url']])) {
                    $results[$item['url']] = $item;
                }
            }
        }

        // 3. Supplement / Fallback: Google News Indonesia RSS for latest news
        if (count($results) < 5) {
            $gnewsResults = self::searchGoogleNewsRss($cleanQuery);
            foreach ($gnewsResults as $item) {
                if (!isset($results[$item['url']])) {
                    $results[$item['url']] = $item;
                }
            }
        }

        // 4. Fallback: Bing Web RSS (filtered by keyword match)
        if (count($results) < 4) {
            $bingResults = self::searchBingRss($cleanQuery);
            foreach ($bingResults as $item) {
                if (!isset($results[$item['url']])) {
                    $results[$item['url']] = $item;
                }
            }
        }

        if (empty($results)) {
            return "Tidak ditemukan hasil pencarian internet untuk kata kunci '{$cleanQuery}'.";
        }

        $topResults = array_slice(array_values($results), 0, 6);
        $lines = ["HASIL PENCARIAN INTERNET UNTUK \"{$cleanQuery}\":"];

        foreach ($topResults as $idx => $item) {
            $num = $idx + 1;
            $title = $item['title'];
            $url = $item['url'];
            $snippet = $item['snippet'] ?: '-';
            $source = !empty($item['source']) ? " ({$item['source']})" : '';
            $lines[] = "{$num}. **{$title}**{$source}\n   URL: [{$title}]({$url})\n   Ringkasan: {$snippet}";
        }

        $lines[] = "\nCatatan: Saat menjawab pengguna berdasarkan data di atas, selalu cantumkan link sumber dalam format markdown `[Judul Sumber](URL)`.";

        return implode("\n\n", $lines);
    }

    /**
     * Scrape organic web results from DuckDuckGo HTML endpoint.
     *
     * @return array<int, array{title: string, url: string, snippet: string, source: string}>
     */
    private static function searchDuckDuckGoHtml(string $query): array
    {
        $url = 'https://html.duckduckgo.com/html/?q=' . rawurlencode($query) . '&kl=id-id';
        $html = self::httpGet($url, 8);
        if ($html === '' || str_contains($html, 'anomaly-modal')) {
            return [];
        }

        $results = [];
        // Match result blocks in DuckDuckGo HTML
        if (preg_match_all('/<a[^>]+class="[^"]*result__a[^"]*"[^>]+href="([^"]+)"[^>]*>(.*?)<\/a>/si', $html, $titleMatches, PREG_SET_ORDER)) {
            preg_match_all('/<a[^>]+class="[^"]*result__snippet[^"]*"[^>]*>(.*?)<\/a>/si', $html, $snippetMatches);
            $snippets = $snippetMatches[1] ?? [];

            foreach ($titleMatches as $idx => $match) {
                $rawHref = html_entity_decode($match[1], ENT_QUOTES | ENT_HTML5, 'UTF-8');
                $realUrl = self::extractDuckDuckGoTargetUrl($rawHref);

                if ($realUrl === '' || str_contains($realUrl, 'duckduckgo.com/y.js') || str_contains($realUrl, 'ad_provider')) {
                    continue;
                }

                $title = trim(html_entity_decode(strip_tags($match[2]), ENT_QUOTES | ENT_HTML5, 'UTF-8'));
                $snippetRaw = $snippets[$idx] ?? '';
                $snippet = trim(html_entity_decode(strip_tags($snippetRaw), ENT_QUOTES | ENT_HTML5, 'UTF-8'));
                $snippet = preg_replace('/\s+/', ' ', $snippet) ?? $snippet;

                if ($title !== '' && filter_var($realUrl, FILTER_VALIDATE_URL)) {
                    $results[] = [
                        'title' => $title,
                        'url' => $realUrl,
                        'snippet' => Str::limit($snippet, 350),
                        'source' => parse_url($realUrl, PHP_URL_HOST) ?: 'Web',
                    ];
                }

                if (count($results) >= 6) {
                    break;
                }
            }
        }

        return $results;
    }

    /**
     * Decode DuckDuckGo redirect URL (e.g. //duckduckgo.com/l/?uddg=https%3A%2F%2F...).
     */
    private static function extractDuckDuckGoTargetUrl(string $href): string
    {
        if (str_starts_with($href, '//')) {
            $href = 'https:' . $href;
        }
        $queryStr = parse_url($href, PHP_URL_QUERY);
        if (is_string($queryStr)) {
            parse_str($queryStr, $params);
            if (!empty($params['uddg']) && is_string($params['uddg'])) {
                return $params['uddg'];
            }
        }
        return $href;
    }

    /**
     * Search via Bing RSS feed (fast XML fallback).
     *
     * @return array<int, array{title: string, url: string, snippet: string, source: string}>
     */
    private static function searchBingRss(string $query): array
    {
        $url = 'https://www.bing.com/search?q=' . rawurlencode($query) . '&setlang=id&cc=ID&format=rss';
        $xmlStr = self::httpGet($url, 7);
        if ($xmlStr === '' || !str_contains($xmlStr, '<rss')) {
            return [];
        }

        $xml = @simplexml_load_string($xmlStr);
        if (!$xml || !isset($xml->channel->item)) {
            return [];
        }

        $keywords = ContextBuilder::extractKeywords($query);
        $results = [];
        foreach ($xml->channel->item as $item) {
            $title = trim((string) $item->title);
            $link = trim((string) $item->link);
            $desc = trim(html_entity_decode(strip_tags((string) $item->description), ENT_QUOTES | ENT_HTML5, 'UTF-8'));

            // Ensure result matches at least one query keyword to avoid irrelevant global RSS noise
            if (!empty($keywords)) {
                $combinedLower = mb_strtolower($title . ' ' . $desc . ' ' . $link);
                $matched = false;
                foreach ($keywords as $kw) {
                    if (str_contains($combinedLower, $kw)) {
                        $matched = true;
                        break;
                    }
                }
                if (!$matched) {
                    continue;
                }
            }

            if ($title !== '' && filter_var($link, FILTER_VALIDATE_URL)) {
                $results[] = [
                    'title' => $title,
                    'url' => $link,
                    'snippet' => Str::limit($desc, 350),
                    'source' => parse_url($link, PHP_URL_HOST) ?: 'Web',
                ];
            }
            if (count($results) >= 5) {
                break;
            }
        }

        return $results;
    }

    /**
     * Search via Google News Indonesia RSS feed.
     *
     * @return array<int, array{title: string, url: string, snippet: string, source: string}>
     */
    private static function searchGoogleNewsRss(string $query): array
    {
        $url = 'https://news.google.com/rss/search?q=' . rawurlencode($query) . '&hl=id&gl=ID&ceid=ID:id';
        $xmlStr = self::httpGet($url, 7);
        if ($xmlStr === '' || !str_contains($xmlStr, '<rss')) {
            return [];
        }

        $xml = @simplexml_load_string($xmlStr);
        if (!$xml || !isset($xml->channel->item)) {
            return [];
        }

        $results = [];
        foreach ($xml->channel->item as $item) {
            $title = trim((string) $item->title);
            $link = trim((string) $item->link);
            $pubDate = trim((string) $item->pubDate);
            $sourceName = isset($item->source) ? trim((string) $item->source) : 'Google News';
            $desc = trim(html_entity_decode(strip_tags((string) $item->description), ENT_QUOTES | ENT_HTML5, 'UTF-8'));
            $snippet = ($pubDate ? "[{$pubDate}] " : '') . $desc;

            if ($title !== '' && filter_var($link, FILTER_VALIDATE_URL)) {
                $results[] = [
                    'title' => $title,
                    'url' => $link,
                    'snippet' => Str::limit($snippet, 350),
                    'source' => $sourceName,
                ];
            }
            if (count($results) >= 4) {
                break;
            }
        }

        return $results;
    }

    /**
     * Search via Wikipedia Bahasa Indonesia API (with full intro extract).
     *
     * @return array<int, array{title: string, url: string, snippet: string, source: string}>
     */
    private static function searchWikipediaId(string $query): array
    {
        $results = [];
        $qLower = mb_strtolower($query);

        // If query is related to UMRI, fetch the authoritative Universitas_Muhammadiyah_Riau summary directly
        if (str_contains($qLower, 'umri') || str_contains($qLower, 'muhammadiyah riau')) {
            $summaryJson = self::httpGet('https://id.wikipedia.org/api/rest_v1/page/summary/Universitas_Muhammadiyah_Riau', 6);
            if ($summaryJson !== '') {
                $sData = json_decode($summaryJson, true);
                if (!empty($sData['extract'])) {
                    $results[] = [
                        'title' => ($sData['title'] ?? 'Universitas Muhammadiyah Riau') . ' — Wikipedia Bahasa Indonesia',
                        'url' => 'https://id.wikipedia.org/wiki/Universitas_Muhammadiyah_Riau',
                        'snippet' => Str::limit(trim((string) $sData['extract']), 600),
                        'source' => 'id.wikipedia.org',
                    ];
                }
            }
        }

        $url = 'https://id.wikipedia.org/w/api.php?action=query&list=search&srsearch='
            . rawurlencode($query)
            . '&utf8=1&format=json&srlimit=3';

        $jsonStr = self::httpGet($url, 6);
        if ($jsonStr === '') {
            return $results;
        }

        $data = json_decode($jsonStr, true);
        $items = $data['query']['search'] ?? [];
        if (empty($items) || !is_array($items)) {
            return $results;
        }

        foreach ($items as $item) {
            $title = trim((string) ($item['title'] ?? ''));
            $snippet = trim(html_entity_decode(strip_tags((string) ($item['snippet'] ?? '')), ENT_QUOTES | ENT_HTML5, 'UTF-8'));
            if ($title !== '') {
                $slug = str_replace(' ', '_', $title);
                $wikiUrl = 'https://id.wikipedia.org/wiki/' . $slug;

                // Try fetching fuller summary extract for the top result
                if (count($results) === 0) {
                    $sumJson = self::httpGet('https://id.wikipedia.org/api/rest_v1/page/summary/' . rawurlencode($slug), 5);
                    if ($sumJson !== '') {
                        $sumData = json_decode($sumJson, true);
                        if (!empty($sumData['extract'])) {
                            $snippet = trim((string) $sumData['extract']);
                        }
                    }
                }

                $results[] = [
                    'title' => $title . ' — Wikipedia Bahasa Indonesia',
                    'url' => $wikiUrl,
                    'snippet' => Str::limit($snippet, 550),
                    'source' => 'id.wikipedia.org',
                ];
            }
        }

        return $results;
    }

    /**
     * Read and clean content from a public web page URL with Anti-SSRF protection.
     */
    public static function readWebPage(string $url): string
    {
        $cleanUrl = trim($url);
        if (!self::isSafePublicUrl($cleanUrl)) {
            return "URL '{$cleanUrl}' tidak valid atau tidak diizinkan (hanya URL publik http/https yang diizinkan).";
        }

        // 1. Try Jina Reader for clean Markdown extraction
        $jinaUrl = 'https://r.jina.ai/' . $cleanUrl;
        $jinaContent = self::httpGet($jinaUrl, 10, [
            'Accept: text/plain',
            'X-Return-Format: markdown',
        ]);

        if ($jinaContent !== '' && mb_strlen($jinaContent) > 80 && !str_contains($jinaContent, 'SecurityCompromiseError')) {
            $trimmed = Str::limit(trim($jinaContent), 2800);
            return "ISI HALAMAN WEB ({$cleanUrl}):\n\n{$trimmed}";
        }

        // 2. Fallback: Direct HTML fetch & local cleaning
        $rawHtml = self::httpGet($cleanUrl, 10);
        if ($rawHtml === '') {
            return "Gagal mengambil isi halaman dari URL '{$cleanUrl}'.";
        }

        // Strip scripts, styles, nav, footer, svg before cleaning
        $cleanedHtml = preg_replace('/<(script|style|noscript|svg|nav|footer|header)[^>]*>.*?<\/\1>/si', '', $rawHtml) ?? $rawHtml;
        $text = ContextBuilder::cleanHtmlKeepLinks($cleanedHtml, 2800);

        if ($text === '') {
            return "Halaman '{$cleanUrl}' tidak memiliki konten teks yang dapat dibaca.";
        }

        return "ISI HALAMAN WEB ({$cleanUrl}):\n\n{$text}";
    }

    /**
     * Validate that a URL is a safe public HTTP/HTTPS address (prevents SSRF to localhost / private IPs).
     */
    public static function isSafePublicUrl(string $url): bool
    {
        if (!filter_var($url, FILTER_VALIDATE_URL)) {
            return false;
        }

        $parts = parse_url($url);
        $scheme = strtolower((string) ($parts['scheme'] ?? ''));
        $host = strtolower((string) ($parts['host'] ?? ''));

        if (!in_array($scheme, ['http', 'https'], true) || $host === '') {
            return false;
        }

        // Block localhost & internal hostnames
        $blockedHosts = ['localhost', '127.0.0.1', '0.0.0.0', '::1', '[::1]'];
        if (in_array($host, $blockedHosts, true)
            || str_ends_with($host, '.local')
            || str_ends_with($host, '.internal')
            || str_ends_with($host, '.localhost')
            || str_ends_with($host, '.test')
        ) {
            return false;
        }

        // If host is already an IP literal, validate it is public
        if (filter_var($host, FILTER_VALIDATE_IP)) {
            return filter_var(
                $host,
                FILTER_VALIDATE_IP,
                FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE
            ) !== false;
        }

        // Resolve DNS and verify IP is not private/reserved
        $resolvedIp = @gethostbyname($host);
        if ($resolvedIp && $resolvedIp !== $host) {
            if (filter_var(
                $resolvedIp,
                FILTER_VALIDATE_IP,
                FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE
            ) === false) {
                return false;
            }
        }

        return true;
    }

    /**
     * Perform a safe HTTP GET request using cURL.
     */
    private static function httpGet(string $url, int $timeoutSeconds = 8, array $extraHeaders = []): string
    {
        if (!function_exists('curl_init')) {
            return '';
        }

        $headers = array_merge([
            'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language: id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        ], $extraHeaders);

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_MAXREDIRS => 3,
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_TIMEOUT => $timeoutSeconds,
            CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_SSL_VERIFYPEER => true,
        ]);

        if (defined('CURLPROTO_HTTP') && defined('CURLPROTO_HTTPS')) {
            curl_setopt($ch, CURLOPT_PROTOCOLS, CURLPROTO_HTTP | CURLPROTO_HTTPS);
            curl_setopt($ch, CURLOPT_REDIR_PROTOCOLS, CURLPROTO_HTTP | CURLPROTO_HTTPS);
        }

        $body = curl_exec($ch);
        $httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if (!is_string($body) || $httpCode < 200 || $httpCode >= 400) {
            return '';
        }

        return $body;
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
