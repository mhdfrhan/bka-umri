<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;
use Illuminate\Support\Facades\Cache;

class Pengaturan extends Model
{
    use LogsActivity;

    protected $table = 'pengaturans';

    protected $fillable = [
        'key',
        'value',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->useLogName('pengaturan');
    }

    /**
     * Get all settings from cache as an array.
     *
     * @return array<string, mixed>
     */
    public static function getAllCached(): array
    {
        return Cache::remember('pengaturan', 3600, function () {
            return static::pluck('value', 'key')->toArray();
        });
    }

    /**
     * Get a setting value by key.
     *
     * @param string $key
     * @param mixed $default
     * @return mixed
     */
    public static function getValue(string $key, $default = null)
    {
        $settings = static::getAllCached();

        return $settings[$key] ?? $default;
    }

    /**
     * Set a setting value.
     *
     * @param string $key
     * @param mixed $value
     * @return void
     */
    public static function setValue(string $key, $value): void
    {
        static::updateOrCreate(['key' => $key], ['value' => $value]);
        Cache::forget('pengaturan');
    }
}
