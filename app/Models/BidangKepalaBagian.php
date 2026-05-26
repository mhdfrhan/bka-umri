<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

use Spatie\Image\Enums\Fit;

class BidangKepalaBagian extends Model implements HasMedia
{
    use LogsActivity, InteractsWithMedia;

    protected $table = 'bidang_kepala_bagians';

    protected $fillable = [
        'bidang_id',
        'nama',
        'jabatan',
        'deskripsi_tugas',
        'media_sosial',
    ];

    protected $casts = [
        'media_sosial' => 'array',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->useLogName('bidang_kepala_bagian');
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
            ->fit(Fit::Crop, 400, 533)
            ->nonQueued();
    }

    /**
     * Get the division that owns this head.
     */
    public function bidang()
    {
        return $this->belongsTo(Bidang::class, 'bidang_id');
    }
}

