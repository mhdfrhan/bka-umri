<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class Foto extends Model implements HasMedia
{
    use InteractsWithMedia;

    protected $table = 'fotos';

    protected $fillable = [
        'album_id',
        'urutan',
    ];

    protected $casts = [
        'urutan' => 'integer',
    ];

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('foto')
            ->singleFile();
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('thumb')
            ->width(400)
            ->height(300)
            ->fit(\Spatie\Image\Enums\Fit::Crop, 400, 300)
            ->format('webp')
            ->quality(80)
            ->nonQueued();
    }

    /**
     * Get the album that owns the photo.
     */
    public function album()
    {
        return $this->belongsTo(Album::class, 'album_id');
    }
}
