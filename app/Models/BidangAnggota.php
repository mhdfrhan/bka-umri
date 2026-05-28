<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\Image\Enums\Fit;

class BidangAnggota extends Model implements HasMedia
{
    use LogsActivity, InteractsWithMedia;

    protected $table = 'bidang_anggotas';

    protected $fillable = [
        'bidang_id',
        'nama',
        'jabatan',
        'urutan',
        'media_sosial',
    ];

    protected $casts = [
        'urutan' => 'integer',
        'media_sosial' => 'array',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->useLogName('bidang_anggota');
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('foto')
            ->singleFile();
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('display')
            ->width(300)
            ->height(300)
            ->fit(Fit::Crop, 300, 300)
            ->nonQueued();
    }

    /**
     * Get the division that owns this member.
     */
    public function bidang()
    {
        return $this->belongsTo(Bidang::class, 'bidang_id');
    }
}
