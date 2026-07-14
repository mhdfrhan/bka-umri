<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\StrukturAnggota;

class StrukturAnggotaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $anggota = [
            [
                'nama' => 'Rika Septiani',
                'jabatan' => 'Bagian Pengadaan & Penerimaan Aset',
                'tugas_pokok' => '<ul><li>Perencanaan dan Persiapan Pengadaan</li><li>Proses Permintaan dan Pemilihan Vendor</li><li>Penyusunan Dokumen dan Proses Kontrak</li><li>Penerimaan dan Serah Terima Barang</li><li>Pelaporan dan Evaluasi Pengadaan</li><li>Koordinasi Internal dan Eksternal</li></ul>',
                'jobdesk' => '<ul><li>Membantu merekap usulan kebutuhan barang/jasa dari seluruh unit kerja berdasarkan RKA tahunan.</li><li>Mempersiapkan dokumen pendukung untuk proses pengadaan, seperti spesifikasi teknis dan RAB awal.</li><li>Berkoordinasi dengan unit pemohon/yang membutuhkan untuk klarifikasi kebutuhan pengadaan.</li><li>Membuat dan mengarsipkan dokumen permintaan pengadaan (PR – Purchase Request).</li><li>Membantu proses permintaan penawaran harga dari beberapa vendor.</li></ul>',
                'urutan' => 1,
            ],
            [
                'nama' => 'Syauqi Nazwar',
                'jabatan' => 'Bagian -',
                'tugas_pokok' => '<ul><li>Tugas Pokok 1</li><li>Tugas Pokok 2</li></ul>',
                'jobdesk' => '<ul><li>Jobdesk 1</li><li>Jobdesk 2</li></ul>',
                'urutan' => 2,
            ],
            [
                'nama' => 'Rahmiati',
                'jabatan' => 'Bagian -',
                'tugas_pokok' => '<ul><li>Tugas Pokok 1</li><li>Tugas Pokok 2</li></ul>',
                'jobdesk' => '<ul><li>Jobdesk 1</li><li>Jobdesk 2</li></ul>',
                'urutan' => 3,
            ],
            [
                'nama' => 'Herni',
                'jabatan' => 'Bagian -',
                'tugas_pokok' => '<ul><li>Tugas Pokok 1</li><li>Tugas Pokok 2</li></ul>',
                'jobdesk' => '<ul><li>Jobdesk 1</li><li>Jobdesk 2</li></ul>',
                'urutan' => 4,
            ],
            [
                'nama' => 'Riza Elsanda',
                'jabatan' => 'Bagian -',
                'tugas_pokok' => '<ul><li>Tugas Pokok 1</li><li>Tugas Pokok 2</li></ul>',
                'jobdesk' => '<ul><li>Jobdesk 1</li><li>Jobdesk 2</li></ul>',
                'urutan' => 5,
            ],
            [
                'nama' => 'Musa Nurwahid Kifli',
                'jabatan' => 'Bagian -',
                'tugas_pokok' => '<ul><li>Tugas Pokok 1</li><li>Tugas Pokok 2</li></ul>',
                'jobdesk' => '<ul><li>Jobdesk 1</li><li>Jobdesk 2</li></ul>',
                'urutan' => 6,
            ],
            [
                'nama' => 'Amak Imai',
                'jabatan' => 'Bagian -',
                'tugas_pokok' => '<ul><li>Tugas Pokok 1</li><li>Tugas Pokok 2</li></ul>',
                'jobdesk' => '<ul><li>Jobdesk 1</li><li>Jobdesk 2</li></ul>',
                'urutan' => 7,
            ],
            [
                'nama' => 'Wira Kurniawan',
                'jabatan' => 'Bagian -',
                'tugas_pokok' => '<ul><li>Tugas Pokok 1</li><li>Tugas Pokok 2</li></ul>',
                'jobdesk' => '<ul><li>Jobdesk 1</li><li>Jobdesk 2</li></ul>',
                'urutan' => 8,
            ],
            [
                'nama' => 'Delvien Oktalisa',
                'jabatan' => 'Bagian -',
                'tugas_pokok' => '<ul><li>Tugas Pokok 1</li><li>Tugas Pokok 2</li></ul>',
                'jobdesk' => '<ul><li>Jobdesk 1</li><li>Jobdesk 2</li></ul>',
                'urutan' => 9,
            ]
        ];

        StrukturAnggota::truncate(); // Clear existing data to avoid duplicates

        foreach ($anggota as $item) {
            StrukturAnggota::create($item);
        }
    }
}
