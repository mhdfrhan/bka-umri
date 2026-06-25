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
        Lampiran::query()->forceDelete();
        KategoriLampiran::query()->forceDelete();

        $kategoriName = 'Lampiran & Dokumen Penting';
        
        $kategori = KategoriLampiran::firstOrCreate(
            ['nama' => $kategoriName],
            [
                'slug' => \Illuminate\Support\Str::slug($kategoriName),
                'deskripsi' => 'Berisi dokumen penting seperti Panduan Pembayaran dan Ketetapan Kampus.',
                'urutan' => 1,
            ]
        );

        $pdfDir = public_path('assets/pdf');

        if (!File::exists($pdfDir)) {
            $this->command->warn("Directory $pdfDir does not exist. Skipping Lampiran seeding.");
            return;
        }

        $files = File::files($pdfDir);

        foreach ($files as $file) {
            if (strtolower($file->getExtension()) === 'pdf') {
                $originalName = $file->getFilename();
                $title = pathinfo($originalName, PATHINFO_FILENAME);

                $this->command->info("Processing: $originalName");

                $lampiran = Lampiran::create([
                    'kategori_lampiran_id' => $kategori->id,
                    'nama_tampilan' => $title,
                    'deskripsi' => 'Dokumen contoh dari sistem.',
                ]);

                $lampiran->addMedia($file->getPathname())
                    ->preservingOriginal()
                    ->usingName($title)
                    ->usingFileName($originalName)
                    ->toMediaCollection('berkas');
            }
        }

        $this->command->info("Seeded sample PDFs to '$kategoriName'.");
    }
}
