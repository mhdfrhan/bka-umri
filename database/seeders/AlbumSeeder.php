<?php

namespace Database\Seeders;

use App\Models\Album;
use App\Models\Foto;
use App\Models\KategoriDokumentasi;
use Illuminate\Database\Seeder;

class AlbumSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Get Categories
        $keuanganCat = KategoriDokumentasi::where('nama', 'Keuangan')->first();
        $asetCat = KategoriDokumentasi::where('nama', 'Aset')->first();

        // 2. Sample Albums Data
        $albumsData = [
            [
                'judul' => 'Rapat Kerja Tahunan Penyusunan Anggaran BKA 2026',
                'slug' => 'rapat-kerja-anggaran-2026',
                'deskripsi' => 'Pembahasan rancangan anggaran belanja operasional universitas dan pembiayaan program studi BKA UMRI.',
                'tanggal_kegiatan' => '2026-05-10',
                'kategori_id' => $keuanganCat ? $keuanganCat->id : null,
                'cover' => 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80',
                'photos' => [
                    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80',
                    'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&q=80',
                ],
            ],
            [
                'judul' => 'Kunjungan Kerja LLDIKTI Wilayah X Terkait Aset Kampus',
                'slug' => 'kunjungan-lldikti-wilayah-x',
                'deskripsi' => 'Dokumentasi kunjungan kerja evaluasi sarana prasarana dan verifikasi tata kelola aset fisik BKA.',
                'tanggal_kegiatan' => '2026-05-18',
                'kategori_id' => $asetCat ? $asetCat->id : null,
                'cover' => 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&q=80',
                'photos' => [
                    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&q=80',
                    'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&q=80',
                ],
            ],
            [
                'judul' => 'Bakti Sosial Ramadhan 1447H Biro Keuangan & Aset',
                'slug' => 'bakti-sosial-ramadhan-bka',
                'deskripsi' => 'Pemberian santunan dan paket kebutuhan pokok kepada panti asuhan muhammadiyah binaan Universitas Muhammadiyah Riau.',
                'tanggal_kegiatan' => '2026-04-05',
                'kategori_id' => $keuanganCat ? $keuanganCat->id : null,
                'cover' => 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&q=80',
                'photos' => [
                    'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&q=80',
                ],
            ]
        ];

        foreach ($albumsData as $data) {
            $album = Album::create([
                'judul' => $data['judul'],
                'slug' => $data['slug'],
                'deskripsi' => $data['deskripsi'],
                'tanggal_kegiatan' => $data['tanggal_kegiatan'],
                'kategori_dokumentasi_id' => $data['kategori_id'],
            ]);

            // Seed media cover
            if (!empty($data['cover'])) {
                try {
                    $album->addMediaFromUrl($data['cover'])
                        ->toMediaCollection('cover');
                } catch (\Exception $e) {
                    // Ignore download failure
                }
            }

            // Seed photos inside album
            if (!empty($data['photos'])) {
                foreach ($data['photos'] as $idx => $photoUrl) {
                    try {
                        $foto = Foto::create([
                            'album_id' => $album->id,
                            'urutan' => $idx + 1,
                        ]);
                        $foto->addMediaFromUrl($photoUrl)
                            ->toMediaCollection('foto');
                    } catch (\Exception $e) {
                        // Ignore download failure
                    }
                }
            }
        }
    }
}
