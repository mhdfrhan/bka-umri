<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\Sluggable\HasSlug;
use Spatie\Sluggable\SlugOptions;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Berita extends Model implements HasMedia
{
    use SoftDeletes, HasSlug, InteractsWithMedia, LogsActivity;

    protected $table = 'beritas';

    protected $fillable = [
        'judul',
        'slug',
        'isi',
        'status',
        'tanggal_publikasi',
        'kategori_berita_id',
        'user_id',
    ];

    protected $casts = [
        'status' => \App\Enums\ContentStatus::class,
        'tanggal_publikasi' => 'datetime',
    ];

    public function getSlugOptions(): SlugOptions
    {
        return SlugOptions::create()
            ->generateSlugsFrom('judul')
            ->saveSlugsTo('slug');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->useLogName('berita');
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('thumbnail')
            ->singleFile();
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('thumb')
            ->width(400)
            ->height(225)
            ->fit(\Spatie\Image\Enums\Fit::Crop, 400, 225)
            ->nonQueued();
    }

    /**
     * Scope to only include published news that are ready to display.
     */
    public function scopeTerpublikasi($query)
    {
        return $query->where('status', \App\Enums\ContentStatus::TERPUBLIKASI)
            ->where(function ($q) {
                $q->whereNull('tanggal_publikasi')
                  ->orWhere('tanggal_publikasi', '<=', now());
            });
    }

    /**
     * Scope to order news by publication date or creation date.
     */
    public function scopeTerbaru($query)
    {
        return $query->orderByDesc('tanggal_publikasi')
                     ->orderByDesc('created_at');
    }

    /**
     * Get the category of the news.
     */
    public function kategori()
    {
        return $this->belongsTo(KategoriBerita::class, 'kategori_berita_id');
    }

    /**
     * Get the author of the news.
     */
    public function penulis()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
