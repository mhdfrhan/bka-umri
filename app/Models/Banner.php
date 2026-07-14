<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

use Spatie\Image\Enums\Fit;

class Banner extends Model implements HasMedia
{
    use InteractsWithMedia, LogsActivity;

    protected $fillable = [
        'judul',
        'deskripsi',
        'teks_tombol',
        'tautan_tombol',
        'urutan',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'urutan' => 'integer',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->useLogName('banner');
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('gambar')
            ->singleFile();
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('display')
            ->width(1920)
            ->height(1080)
            ->fit(Fit::Fill, 1920, 1080)
            ->format('webp')
            ->quality(80)
            ->nonQueued();
    }
}
