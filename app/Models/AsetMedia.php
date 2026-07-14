<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class AsetMedia extends Model implements HasMedia
{
    use InteractsWithMedia, LogsActivity;

    protected $table = 'aset_medias';

    protected $fillable = [
        'nama',
        'tipe',
        'ekstensi',
        'ukuran',
        'ukuran_asli',
        'is_visible',
    ];

    protected $casts = [
        'is_visible' => 'boolean',
        'ukuran' => 'integer',
        'ukuran_asli' => 'integer',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->useLogName('aset_media');
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('berkas')
            ->singleFile();
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('thumb')
            ->width(400)
            ->height(225)
            ->fit(\Spatie\Image\Enums\Fit::Crop, 400, 225)
            ->format('webp')
            ->quality(80)
            ->nonQueued();
    }
}
