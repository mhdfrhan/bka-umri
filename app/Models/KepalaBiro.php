<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class KepalaBiro extends Model implements HasMedia
{
    use InteractsWithMedia, LogsActivity;

    protected $table = 'kepala_biros';

    protected $fillable = [
        'nama',
        'jabatan',
        'periode',
        'sambutan',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->useLogName('kepala_biro');
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('foto')
            ->singleFile();
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('display')
            ->width(400)
            ->height(533)
            ->fit(\Spatie\Image\Enums\Fit::Crop, 400, 533)
            ->format('webp')
            ->quality(80)
            ->nonQueued();
    }
}
