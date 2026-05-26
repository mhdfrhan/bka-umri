<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Sluggable\HasSlug;
use Spatie\Sluggable\SlugOptions;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class KategoriDokumentasi extends Model
{
    use HasSlug, LogsActivity;

    protected $table = 'kategori_dokumentasis';

    protected $fillable = [
        'nama',
        'slug',
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
            ->useLogName('kategori_dokumentasi');
    }

    /**
     * Get the albums in this category.
     */
    public function albums()
    {
        return $this->hasMany(Album::class, 'kategori_dokumentasi_id');
    }
}
