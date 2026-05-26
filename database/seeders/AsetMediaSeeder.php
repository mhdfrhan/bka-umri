<?php

namespace Database\Seeders;

use App\Models\AsetMedia;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;

class AsetMediaSeeder extends Seeder
{
    public function run(): void
    {
        // Clean existing
        AsetMedia::query()->delete();

        $tempDir = storage_path('app/temp_seeders');
        if (!File::exists($tempDir)) {
            File::makeDirectory($tempDir, 0755, true);
        }

        // 1. Create a dummy image
        $imagePath1 = $tempDir . '/kampus_bka.jpg';
        if (function_exists('imagecreatetruecolor')) {
            $img1 = imagecreatetruecolor(800, 600);
            $bg = imagecolorallocate($img1, 5, 150, 105); // emerald color
            imagefill($img1, 0, 0, $bg);
            imagejpeg($img1, $imagePath1, 80);
            imagedestroy($img1);
        } else {
            File::put($imagePath1, 'fake image data');
        }

        // 2. Create another dummy image
        $imagePath2 = $tempDir . '/logo_umri.png';
        if (function_exists('imagecreatetruecolor')) {
            $img2 = imagecreatetruecolor(200, 200);
            $bg = imagecolorallocate($img2, 217, 119, 6); // amber color
            imagefill($img2, 0, 0, $bg);
            imagepng($img2, $imagePath2);
            imagedestroy($img2);
        } else {
            File::put($imagePath2, 'fake png data');
        }

        // 3. Create a dummy PDF
        $pdfPath = $tempDir . '/panduan_akademik.pdf';
        File::put($pdfPath, "%PDF-1.4\n%...\n%%EOF");

        // Seed Kampus BKA
        $aset1 = AsetMedia::create([
            'nama' => 'kampus_bka.jpg',
            'tipe' => 'image',
            'ekstensi' => 'jpg',
            'ukuran' => File::size($imagePath1),
            'ukuran_asli' => File::size($imagePath1) * 2, // simulated compression
            'is_visible' => true,
        ]);
        $aset1->addMedia($imagePath1)->toMediaCollection('berkas');

        // Seed Logo UMRI
        $aset2 = AsetMedia::create([
            'nama' => 'logo_umri.png',
            'tipe' => 'image',
            'ekstensi' => 'png',
            'ukuran' => File::size($imagePath2),
            'ukuran_asli' => File::size($imagePath2) * 3, // simulated compression
            'is_visible' => true,
        ]);
        $aset2->addMedia($imagePath2)->toMediaCollection('berkas');

        // Seed Panduan Akademik PDF
        $aset3 = AsetMedia::create([
            'nama' => 'panduan_akademik.pdf',
            'tipe' => 'file',
            'ekstensi' => 'pdf',
            'ukuran' => File::size($pdfPath),
            'ukuran_asli' => File::size($pdfPath), // no compression for files
            'is_visible' => true,
        ]);
        $aset3->addMedia($pdfPath)->toMediaCollection('berkas');

        // Clean temp dir
        File::deleteDirectory($tempDir);
    }
}
