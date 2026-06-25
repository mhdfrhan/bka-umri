<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            AdminUserSeeder::class,
            HalamanStatisSeeder::class,
            PengaturanSeeder::class,
            KategoriDokumentasiSeeder::class,
            BerandaSeeder::class,
            BidangSeeder::class,
            BeritaSeeder::class,
            PengumumanSeeder::class,
            AlbumSeeder::class,
            AsetMediaSeeder::class,
            LampiranSeeder::class,
            ChatbotFaqSeeder::class,
            ChatbotSettingSeeder::class,
        ]);
    }
}
