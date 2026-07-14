<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class StrukturAnggota extends Model implements HasMedia
{
    use InteractsWithMedia, LogsActivity;

    protected $table = 'struktur_anggotas';

    protected $fillable = [
        'nama',
        'jabatan',
        'tugas_pokok',
        'jobdesk',
        'urutan',
    ];

    protected $casts = [
        'urutan' => 'integer',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->useLogName('struktur_anggota');
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('foto')
            ->singleFile();
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('display')
            ->width(200)
            ->height(200)
            ->fit(\Spatie\Image\Enums\Fit::Crop, 200, 200)
            ->format('webp')
            ->quality(80)
            ->nonQueued();
    }
}
