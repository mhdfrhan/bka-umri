<?php

namespace App\Services;

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;

class SystemCleanupService
{
    /**
     * Run system cleanup and performance optimization.
     *
     * @return array
     */
    public static function run(): array
    {
        $logs = [];
        $freedSpace = 0; // in bytes

        $logs[] = "System cleanup started at " . now()->toDateTimeString();

        // 1. Clear application caches and optimized bootstrap files
        try {
            Artisan::call('optimize:clear');
            $logs[] = "Cache & compiled views cleared successfully.";
        } catch (\Exception $e) {
            $logs[] = "Error clearing cache: " . $e->getMessage();
        }

        // 2. Clean temporary directories
        $tempDirs = [
            storage_path('media-library/temp'),
            storage_path('app/public/tmp'),
            storage_path('app/tmp'),
            storage_path('framework/views'), // clean old compiled views as well
        ];

        foreach ($tempDirs as $dir) {
            if (File::exists($dir)) {
                if ($dir === storage_path('framework/views')) {
                    // Only delete .php files in views, do not delete the dir itself
                    $files = File::files($dir);
                } else {
                    $files = File::allFiles($dir);
                }
                
                $count = 0;
                foreach ($files as $file) {
                    $size = $file->getSize();
                    if (File::delete($file->getPathname())) {
                        $freedSpace += $size;
                        $count++;
                    }
                }
                $logs[] = "Cleaned directory " . basename($dir) . ": deleted {$count} temporary/compiled files.";
            } else {
                $logs[] = "Directory " . basename($dir) . " does not exist. Skipping.";
            }
        }

        // 3. Optimize Database Tables
        try {
            $dbDriver = DB::connection()->getDriverName();
            if ($dbDriver === 'mysql') {
                $dbName = DB::connection()->getDatabaseName();
                $tables = DB::select('SHOW TABLES');
                $key = "Tables_in_" . $dbName;
                
                foreach ($tables as $tableTable) {
                    if (isset($tableTable->$key)) {
                        $tableName = $tableTable->$key;
                        DB::statement("OPTIMIZE TABLE `$tableName`");
                        $logs[] = "Optimized MySQL database table: `{$tableName}`";
                    }
                }
                $logs[] = "Database index reindexing and fragmentation cleanup completed.";
            } else {
                $logs[] = "Database driver '{$dbDriver}' is not MySQL. Skipping table optimization.";
            }
        } catch (\Exception $e) {
            $logs[] = "Error optimizing database tables: " . $e->getMessage();
        }

        $logs[] = "System cleanup completed successfully.";
        
        $freedKb = $freedSpace / 1024;
        if ($freedKb > 1024) {
            $freedFormatted = number_format($freedKb / 1024, 2) . " MB";
        } else {
            $freedFormatted = number_format($freedKb, 2) . " KB";
        }
        $logs[] = "Total temporary file space freed: " . $freedFormatted;

        // Log this to Laravel logs
        Log::info("System Cleanup Executed", [
            'logs' => $logs,
            'freed_space_kb' => $freedKb,
        ]);

        return [
            'success' => true,
            'logs' => $logs,
            'freed_space' => $freedSpace,
        ];
    }
}
