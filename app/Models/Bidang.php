<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Sluggable\HasSlug;
use Spatie\Sluggable\SlugOptions;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\Image\Enums\Fit;

class Bidang extends Model implements HasMedia
{
    use SoftDeletes, HasSlug, LogsActivity, InteractsWithMedia;

    protected $fillable = [
        'nama',
        'slug',
        'deskripsi_singkat',
        'deskripsi_lengkap',
        'urutan',
        'cta_heading',
        'cta_sub',
        'cta_teks_tombol',
        'cta_tautan',
    ];

    protected $casts = [
        'urutan' => 'integer',
    ];

    public function getSlugOptions(): SlugOptions
    {
        return SlugOptions::create()
            ->generateSlugsFrom('nama')
            ->saveSlugsTo('slug');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->useLogName('bidang');
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('banner')
            ->singleFile();
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('display')
            ->width(1920)
            ->height(600)
            ->fit(Fit::Fill, 1920, 600)
            ->nonQueued();
    }

    /**
     * Get the head of division (kepala bagian).
     */
    public function kepalaBagian()
    {
        return $this->hasOne(BidangKepalaBagian::class, 'bidang_id');
    }

    /**
     * Get the division members (anggotas).
     */
    public function anggotas()
    {
        return $this->hasMany(BidangAnggota::class, 'bidang_id')->orderBy('urutan');
    }
}

