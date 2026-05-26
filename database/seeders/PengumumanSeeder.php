<?php

namespace Database\Seeders;

use App\Models\Pengumuman;
use App\Models\User;
use App\Enums\ContentStatus;
use Illuminate\Database\Seeder;

class PengumumanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get admin user
        $admin = User::where('email', 'staff@bka.umri.ac.id')->first()
            ?? User::where('email', 'admin@bka.umri.ac.id')->first()
            ?? User::first();

        if (!$admin) {
            return;
        }

        $pengumumanData = [
            [
                'judul' => 'Panduan Registrasi Ulang & Pembayaran SPP Semester Ganjil 2026/2027',
                'slug' => 'panduan-registrasi-ulang-spp-ganjil-2026',
                'isi' => '
                    <p>Diberitahukan kepada seluruh mahasiswa Universitas Muhammadiyah Riau (UMRI), baik mahasiswa baru maupun mahasiswa aktif, mengenai prosedur pembayaran SPP dan Registrasi Ulang Semester Ganjil Tahun Akademik 2026/2027.</p>
                    <p>Pembayaran dapat dilakukan mulai tanggal 1 Juni s.d. 31 Juli 2026 melalui Bank Syariah Indonesia (BSI), Bank Muamalat, atau Bank Riau Kepri Syariah dengan menggunakan NIM masing-masing.</p>
                    <h3>Langkah-langkah Registrasi:</h3>
                    <ol>
                        <li>Melakukan transfer pembayaran tagihan kuliah via Bank Rekanan resmi.</li>
                        <li>Mengunggah bukti transfer pembayaran ke Portal Akademik Mahasiswa.</li>
                        <li>Melakukan pengisian Kartu Rencana Studi (KRS) online setelah divalidasi oleh Biro Keuangan dan Aset (BKA) serta Penasihat Akademik.</li>
                    </ol>
                    <p>Detail tata cara pembayaran dan dispensasi selengkapnya dapat diunduh pada lampiran panduan di bawah ini.</p>
                ',
                'thumbnail' => 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=80',
                'status' => ContentStatus::TERPUBLIKASI,
                'is_penting' => true,
                'tanggal_publikasi' => now()->subDays(1),
                'attachments' => [
                    'Panduan_Registrasi_Ulang_2026.pdf',
                    'Alur_Pembayaran_SPP_Bank_Mitra.pdf'
                ]
            ],
            [
                'judul' => 'Pengumuman Pengajuan Dispensasi Pembayaran Kuliah Semester Genap',
                'slug' => 'pengajuan-dispensasi-pembayaran-kuliah-genap',
                'isi' => '
                    <p>Biro Keuangan dan Aset (BKA) UMRI membuka kesempatan pengajuan dispensasi/keringanan waktu pembayaran kuliah bagi mahasiswa yang memenuhi syarat administrasi.</p>
                    <p>Batas akhir pengajuan berkas fisik dan persetujuan online adalah tanggal 15 Juni 2026. Pengajuan di luar tanggal tersebut tidak akan dilayani.</p>
                    <h3>Persyaratan Utama:</h3>
                    <ul>
                        <li>Surat Keterangan Tidak Mampu (SKTM) dari kelurahan atau Surat Pernyataan Kendala Finansial Orang Tua.</li>
                        <li>Transkrip nilai terakhir dengan IPK minimal 2.75.</li>
                        <li>Formulir pengajuan dispensasi yang telah ditandatangani Dekan Fakultas.</li>
                    </ul>
                ',
                'thumbnail' => 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80',
                'status' => ContentStatus::TERPUBLIKASI,
                'is_penting' => false,
                'tanggal_publikasi' => now()->subDays(3),
                'attachments' => [
                    'Formulir_Pengajuan_Dispensasi_BKA.docx'
                ]
            ],
            [
                'judul' => 'Jadwal Pemeliharaan (Maintenance) Portal Keuangan BKA Online',
                'slug' => 'jadwal-pemeliharaan-portal-keuangan-bka',
                'isi' => '
                    <p>Kami informasikan bahwa Portal Layanan Keuangan BKA akan mengalami downtime berkala untuk pemeliharaan rutin infrastruktur server dan database.</p>
                    <p>Pemeliharaan akan berlangsung pada hari Sabtu, 30 Mei 2026 mulai pukul 22:00 WIB hingga Minggu, 31 Mei 2026 pukul 04:00 WIB.</p>
                    <p>Selama proses pemeliharaan berlangsung, layanan cek tagihan, unggah berkas, dan dispensasi online sementara tidak dapat diakses. Harap maklum.</p>
                ',
                'thumbnail' => 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&q=80',
                'status' => ContentStatus::DRAF,
                'is_penting' => false,
                'tanggal_publikasi' => now()->addDays(5),
                'attachments' => []
            ]
        ];

        foreach ($pengumumanData as $data) {
            $pengumuman = Pengumuman::create([
                'judul' => $data['judul'],
                'slug' => $data['slug'],
                'isi' => $data['isi'],
                'status' => $data['status'],
                'is_penting' => $data['is_penting'],
                'tanggal_publikasi' => $data['tanggal_publikasi'],
                'user_id' => $admin->id,
            ]);

            // Seed thumbnail
            if (!empty($data['thumbnail'])) {
                try {
                    $pengumuman->addMediaFromUrl($data['thumbnail'])
                        ->toMediaCollection('thumbnail');
                } catch (\Exception $e) {
                    // Ignore
                }
            }

            // Seed attachments
            if (!empty($data['attachments'])) {
                foreach ($data['attachments'] as $fileName) {
                    try {
                        $pengumuman->addMediaFromString('Dummy Content for file ' . $fileName)
                            ->usingFileName($fileName)
                            ->toMediaCollection('lampirans');
                    } catch (\Exception $e) {
                        // Ignore
                    }
                }
            }
        }
    }
}
