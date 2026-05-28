<?php

namespace Database\Seeders;

use App\Models\ChatbotFaq;
use Illuminate\Database\Seeder;

class ChatbotFaqSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function up(): void
    {
        ChatbotFaq::truncate();

        ChatbotFaq::create([
            'label' => 'Cara Bayar UKT / VA',
            'question' => 'Bagaimana cara melakukan pembayaran Virtual Account UKT?',
            'answer' => 'Tata cara pembayaran via Virtual Account dapat diakses langsung pada akun SIAM (Sistem Informasi Akademik Mahasiswa) Anda di [www.siam.umri.ac.id](https://www.siam.umri.ac.id). Kami mendukung bank mitra seperti BRKSyariah, Bank Mandiri, Bank Muamalat, dan BSI.',
            'is_popular' => true,
            'urutan' => 1,
        ]);

        ChatbotFaq::create([
            'label' => 'Unduh Lampiran Resmi',
            'question' => 'Di mana saya bisa mengunduh dokumen lampiran resmi BKA?',
            'answer' => 'Seluruh lampiran resmi, surat keputusan, edaran, dan format dokumen BKA dapat Anda akses dan unduh secara bebas melalui menu "Lampiran" di website utama kami.',
            'is_popular' => true,
            'urutan' => 2,
        ]);

        ChatbotFaq::create([
            'label' => 'Hubungi Admin BKA',
            'question' => 'Bagaimana cara menghubungi Admin BKA via WhatsApp?',
            'answer' => 'Anda dapat menghubungi Admin BKA UMRI via WhatsApp langsung untuk pertanyaan mendesak terkait keuangan.',
            'is_popular' => true,
            'urutan' => 3,
        ]);
    }

    /**
     * Standard run method
     */
    public function run(): void
    {
        $this->up();
    }
}
