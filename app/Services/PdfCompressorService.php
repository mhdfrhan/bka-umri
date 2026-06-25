<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class PdfCompressorService
{
    /**
     * Attempts to compress a PDF file using Ghostscript.
     * If Ghostscript is not installed, it silently returns the original file path.
     * 
     * @param string $inputFilePath Absolute path to the original PDF
     * @return string Absolute path to the compressed PDF (or original if failed)
     */
    public static function compress(string $inputFilePath): string
    {
        if (!file_exists($inputFilePath)) {
            return $inputFilePath;
        }

        // Output file in temp directory
        $outputFilePath = sys_get_temp_dir() . '/' . uniqid('compressed_pdf_') . '.pdf';

        // Detect Ghostscript command
        $gsCmd = self::detectGhostscript();

        if (!$gsCmd) {
            Log::warning('Ghostscript is not installed or not in PATH. PDF compression skipped.', [
                'file' => $inputFilePath
            ]);
            return $inputFilePath; // Return original if gs is not available
        }

        // Build Ghostscript command for screen quality (compression)
        // dPDFSETTINGS options: /screen (low), /ebook (medium), /printer (high), /prepress (highest)
        $command = escapeshellcmd($gsCmd) . " -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/screen -dNOPAUSE -dQUIET -dBATCH -sOutputFile=" . escapeshellarg($outputFilePath) . " " . escapeshellarg($inputFilePath);

        exec($command, $output, $returnCode);

        if ($returnCode === 0 && file_exists($outputFilePath) && filesize($outputFilePath) > 0) {
            return $outputFilePath;
        }

        Log::error('Ghostscript compression failed.', [
            'file' => $inputFilePath,
            'output' => $output,
            'code' => $returnCode
        ]);

        return $inputFilePath;
    }

    /**
     * Detects the correct Ghostscript binary.
     */
    private static function detectGhostscript(): ?string
    {
        $binaries = ['gs', 'gswin64c', 'gswin32c'];

        foreach ($binaries as $bin) {
            $return = null;
            $output = null;
            if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
                exec("where $bin 2>nul", $output, $return);
            } else {
                exec("command -v $bin 2>/dev/null", $output, $return);
            }

            if ($return === 0) {
                return $bin;
            }
        }

        return null;
    }
}
