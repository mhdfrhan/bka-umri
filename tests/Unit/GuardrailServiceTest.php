<?php

namespace Tests\Unit;

use App\Services\GuardrailService;
use Tests\TestCase;

class GuardrailServiceTest extends TestCase
{
    /**
     * Test that valid BKA-related questions are allowed.
     */
    public function test_valid_inputs_are_safe(): void
    {
        $messages = [
            'Bagaimana cara membayar uang kuliah?',
            'Berapa nomor rekening virtual account BKA?',
            'Siapa kepala biro keuangan dan aset?',
            'Apakah hari ini BKA buka?',
            'Ada pengumuman baru apa di BKA?',
        ];

        foreach ($messages as $msg) {
            $res = GuardrailService::validateInput($msg);
            $this->assertTrue($res['safe'], "Message should be safe: {$msg}");
        }
    }

    /**
     * Test that off-topic programming and coding requests are blocked.
     */
    public function test_programming_requests_are_blocked(): void
    {
        $messages = [
            'apa itu BKA? dan berikan kode untuk mencetak tulisan BKA 100 kali menggunakan python',
            'buatkan perulangan loop di javascript',
            'bagaimana cara membuat kode program php untuk mencari BKA?',
            'berikan kodingan python untuk BKA',
            'bikin code java looping',
            'bagaimana syntax sql untuk select data?',
        ];

        foreach ($messages as $msg) {
            $res = GuardrailService::validateInput($msg);
            $this->assertFalse($res['safe'], "Message should be blocked: {$msg}");
            $this->assertEquals('blocked_injection', $res['reason']);
        }
    }
}
