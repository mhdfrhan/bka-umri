<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Sluggable\HasSlug;
use Spatie\Sluggable\SlugOptions;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class KategoriBerita extends Model
{
    use HasSlug, LogsActivity;

    protected $table = 'kategori_beritas';

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
            ->useLogName('kategori_berita');
    }

    /**
     * Get the news posts belonging to this category.
     */
    public function beritas()
    {
        return $this->hasMany(Berita::class, 'kategori_berita_id');
    }
}
