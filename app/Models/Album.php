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

class Album extends Model implements HasMedia
{
    use SoftDeletes, HasSlug, InteractsWithMedia, LogsActivity;

    protected $table = 'albums';

    protected $fillable = [
        'judul',
        'slug',
        'deskripsi',
        'tanggal_kegiatan',
        'kategori_dokumentasi_id',
    ];

    protected $casts = [
        'tanggal_kegiatan' => 'date',
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
            ->useLogName('album');
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('cover')
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
     * Get the category of the album.
     */
    public function kategori()
    {
        return $this->belongsTo(KategoriDokumentasi::class, 'kategori_dokumentasi_id');
    }

    /**
     * Get the photos in this album.
     */
    public function fotos()
    {
        return $this->hasMany(Foto::class, 'album_id')->orderBy('urutan');
    }
}
