<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\Sluggable\HasSlug;
use Spatie\Sluggable\SlugOptions;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Pengumuman extends Model implements HasMedia
{
    use SoftDeletes, HasSlug, InteractsWithMedia, LogsActivity;

    protected $table = 'pengumumans';

    protected $fillable = [
        'judul',
        'slug',
        'isi',
        'is_penting',
        'status',
        'tanggal_publikasi',
        'user_id',
    ];

    protected $casts = [
        'is_penting' => 'boolean',
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
            ->useLogName('pengumuman');
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('thumbnail')
            ->singleFile();
            
        $this->addMediaCollection('lampirans');
    }

    /**
     * Scope to only include published announcements.
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
     * Scope to order by is_penting first then latest publication or creation date.
     */
    public function scopePentingFirst($query)
    {
        return $query->orderByDesc('is_penting')
            ->orderByDesc('tanggal_publikasi')
            ->orderByDesc('created_at');
    }

    /**
     * Get the author of the announcement.
     */
    public function penulis()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
