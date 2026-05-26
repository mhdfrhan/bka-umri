<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

use Illuminate\Support\Facades\Schedule;
use App\Services\SystemCleanupService;

Artisan::command('system:clean', function () {
    $this->info('Starting system cleanup & performance optimization...');
    $result = SystemCleanupService::run();
    foreach ($result['logs'] as $log) {
        $this->line($log);
    }
    $this->info('System cleanup completed!');
})->purpose('Clean cache, temp files, and optimize database tables');

Schedule::command('system:clean')->dailyAt('00:00');
