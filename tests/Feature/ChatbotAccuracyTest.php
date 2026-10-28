<?php

namespace Tests\Feature;

use App\Models\Berita;
use App\Models\ChatbotFaq;
use App\Models\ChatbotSetting;
use App\Models\Lampiran;
use App\Models\Misi;
use App\Models\Pengaturan;
use App\Models\Pengumuman;
use App\Models\StrukturAnggota;
use App\Services\ChatbotToolService;
use App\Services\ContextBuilder;
use App\Services\GuardrailService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ChatbotAccuracyTest extends TestCase
{
    use RefreshDatabase;

    public function test_extract_keywords_filters_generic_campus_words_and_keeps_2_char_domain_terms(): void
    {
        $keywords = ContextBuilder::extractKeywords(
            'Saya mau bertanya informasi jadwal pembayaran KKN dan VA SK tahun 2026 di BKA UMRI'
        );

        $this->assertContains('kkn', $keywords);
        $this->assertContains('va', $keywords);
        $this->assertContains('sk', $keywords);
        $this->assertNotContains('umri', $keywords);
        $this->assertNotContains('bka', $keywords);
        $this->assertNotContains('informasi', $keywords);
    }

    public function test_clean_html_keep_links_preserves_markdown_links_and_paragraph_breaks(): void
    {
        $html = '<p>Unduh <a href="https://bka.umri.ac.id/lampiran/download/5">Panduan Pembayaran VA</a> sekarang.</p><p>Hubungi admin jika terkendala.</p>';
        $cleaned = ContextBuilder::cleanHtmlKeepLinks($html);

        $this->assertStringContainsString('[Panduan Pembayaran VA](https://bka.umri.ac.id/lampiran/download/5)', $cleaned);
        $this->assertStringContainsString("sekarang.\nHubungi", $cleaned);
    }

    public function test_guardrail_allows_legitimate_print_questions_and_blocks_coding_requests(): void
    {
        $legit = GuardrailService::validateInput('Apakah saya bisa mencetak bukti pembayaran dua kali?');
        $this->assertTrue($legit['safe']);

        $coding = GuardrailService::validateInput('Tolong buat kode python mencetak angka 10 kali loop');
        $this->assertFalse($coding['safe']);
    }

    public function test_context_builder_and_tool_service_retrieve_full_database_knowledge(): void
    {
        Pengaturan::create(['key' => 'visi', 'value' => 'Menjadi Biro Keuangan Unggul 2030']);
        Misi::create(['urutan' => 1, 'teks_misi' => 'Mewujudkan tata kelola keuangan transparan dan akuntabel']);

        StrukturAnggota::create([
            'nama' => 'Dina Amalia, S.E.',
            'jabatan' => 'Staf Anggaran',
            'level' => 'staf',
            'urutan' => 1,
            'tugas_pokok' => 'Menyusun rencana anggaran semester',
            'jobdesk' => ['Verifikasi anggaran unit', 'Laporan realisasi'],
        ]);

        Pengumuman::create([
            'judul' => 'Informasi Jadwal Pembayaran KKN Tahun 2026',
            'slug' => 'informasi-jadwal-pembayaran-kkn-tahun-2026',
            'isi_pengumuman' => '<p>Pembayaran KKN dibuka mulai 10 Mei hingga 25 Mei 2026 sebesar Rp 1.250.000 melalui Virtual Account Bank Syariah Indonesia.</p>',
            'status_publikasi' => 'published',
            'tanggal_terbit' => now(),
        ]);

        $context = ContextBuilder::build('Berapa biaya pembayaran KKN 2026 dan apa tugas Dina Amalia serta misi BKA?');

        $this->assertStringContainsString('Mewujudkan tata kelola keuangan transparan dan akuntabel', $context);
        $this->assertStringContainsString('Dina Amalia, S.E.', $context);
        $this->assertStringContainsString('Rp 1.250.000', $context);
        $this->assertStringContainsString('/pengumuman/informasi-jadwal-pembayaran-kkn-tahun-2026', $context);

        $detailToolOutput = ChatbotToolService::executeTool('get_detail_berita_pengumuman', [
            'slug' => 'informasi-jadwal-pembayaran-kkn-tahun-2026',
        ]);
        $this->assertStringContainsString('Rp 1.250.000 melalui Virtual Account Bank Syariah Indonesia', $detailToolOutput);
    }
}
