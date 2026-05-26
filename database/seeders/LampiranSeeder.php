<?php

namespace Database\Seeders;

use App\Models\KategoriLampiran;
use App\Models\Lampiran;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;

class LampiranSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clean existing records to avoid duplicate conflicts
        Lampiran::query()->delete();
        KategoriLampiran::query()->delete();

        // Create temp folder for files
        $tempDir = storage_path('app/temp_seeders');
        if (!File::exists($tempDir)) {
            File::makeDirectory($tempDir, 0755, true);
        }

        // Define categories
        $categoriesData = [
            [
                'nama' => 'Kebijakan Keuangan',
                'slug' => 'kebijakan-keuangan',
                'deskripsi' => 'Surat Keputusan Rektor, Peraturan Pemerintah, dan Ketetapan Keuangan Kampus.',
                'urutan' => 1,
                'files' => [
                    [
                        'nama_tampilan' => 'SK_Rektor_Tata_Kelola_Keuangan.pdf',
                        'deskripsi' => 'Surat Keputusan Rektor tentang standar operasional tata kelola keuangan universitas tahun buku 2026.',
                        'temp_file' => 'sk_keuangan.pdf',
                    ],
                    [
                        'nama_tampilan' => 'Buku_Panduan_Virtual_Account_Mahasiswa.pdf',
                        'deskripsi' => 'Panduan lengkap cara transfer SPP lewat Virtual Account BSI dan Bank Riau Kepri Syariah.',
                        'temp_file' => 'panduan_va.pdf',
                    ],
                ]
            ],
            [
                'nama' => 'Manajemen Aset',
                'slug' => 'manajemen-aset',
                'deskripsi' => 'SOP Pengadaan barang dan aset, inventarisasi, serta pelaporan sarana prasarana.',
                'urutan' => 2,
                'files' => [
                    [
                        'nama_tampilan' => 'SOP_Pengadaan_Aset_Universitas.pdf',
                        'deskripsi' => 'Prosedur operasional baku pengadaan logistik, aset inventaris, dan belanja modal universitas.',
                        'temp_file' => 'sop_pengadaan.pdf',
                    ],
                    [
                        'nama_tampilan' => 'Form_Pelaporan_Kerusakan_Sarpras.docx',
                        'deskripsi' => 'Formulir resmi pelaporan kerusakan sarana prasarana dan inventaris gedung kelas.',
                        'temp_file' => 'form_sarpras.docx',
                    ],
                ]
            ],
            [
                'nama' => 'Formulir Kemahasiswaan',
                'slug' => 'formulir-kemahasiswaan',
                'deskripsi' => 'Formulir dispensasi SPP, template pengajuan dana kegiatan, dan lainnya.',
                'urutan' => 3,
                'files' => [
                    [
                        'nama_tampilan' => 'Formulir_Dispensasi_Keterlambatan_SPP.pdf',
                        'deskripsi' => 'Formulir permohonan penangguhan pembayaran biaya kuliah / keringanan SPP mahasiswa.',
                        'temp_file' => 'dispensasi_spp.pdf',
                    ],
                    [
                        'nama_tampilan' => 'Template_Proposal_Pengajuan_Dana_BEM.docx',
                        'deskripsi' => 'Format standar pengajuan dana anggaran program kerja kemahasiswaan BEM dan HMPS.',
                        'temp_file' => 'proposal_bem.docx',
                    ],
                ]
            ],
            [
                'nama' => 'Panduan & SOP Pelayanan',
                'slug' => 'panduan-dan-sop-pelayanan',
                'deskripsi' => 'Panduan Virtual Account bank rekanan, panduan administrasi staf.',
                'urutan' => 4,
                'files' => [
                    [
                        'nama_tampilan' => 'Buku_Pedoman_Pelayanan_BKA_UMRI.pdf',
                        'deskripsi' => 'Buku panduan standar pelayanan biro keuangan dan aset untuk dosen, mahasiswa, dan staf.',
                        'temp_file' => 'pedoman_bka.pdf',
                    ],
                ]
            ],
        ];

        foreach ($categoriesData as $catData) {
            $category = KategoriLampiran::create([
                'nama' => $catData['nama'],
                'slug' => $catData['slug'],
                'deskripsi' => $catData['deskripsi'],
                'urutan' => $catData['urutan'],
            ]);

            foreach ($catData['files'] as $fileData) {
                $filePath = $tempDir . '/' . $fileData['temp_file'];
                File::put($filePath, "%PDF-1.4\n% Dummy file contents for testing\n%%EOF");

                $lampiran = Lampiran::create([
                    'nama_tampilan' => $fileData['nama_tampilan'],
                    'deskripsi' => $fileData['deskripsi'],
                    'kategori_lampiran_id' => $category->id,
                ]);

                $lampiran->addMedia($filePath)
                    ->usingFileName($fileData['nama_tampilan'])
                    ->toMediaCollection('berkas');
            }
        }

        // Clean temp dir
        File::deleteDirectory($tempDir);
    }
}
