<?php

namespace Database\Seeders;

use App\Models\KategoriDokumentasi;
use Illuminate\Database\Seeder;

class KategoriDokumentasiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['nama' => 'Keuangan', 'slug' => 'keuangan'],
            ['nama' => 'Aset', 'slug' => 'aset'],
        ];

        foreach ($categories as $cat) {
            KategoriDokumentasi::updateOrCreate(
                ['slug' => $cat['slug']],
                ['nama' => $cat['nama']]
            );
        }
    }
}
