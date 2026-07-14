<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Sluggable\HasSlug;
use Spatie\Sluggable\SlugOptions;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class KategoriLampiran extends Model
{
    use SoftDeletes, HasSlug, LogsActivity;

    protected $table = 'kategori_lampirans';

    protected $fillable = [
        'nama',
        'slug',
        'deskripsi',
        'urutan',
        'parent_id',
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
            ->useLogName('kategori_lampiran');
    }

    /**
     * Get the parent category.
     */
    public function parent()
    {
        return $this->belongsTo(KategoriLampiran::class, 'parent_id');
    }

    /**
     * Get the subcategories.
     */
    public function children()
    {
        return $this->hasMany(KategoriLampiran::class, 'parent_id')->orderBy('urutan', 'asc');
    }

    /**
     * Get the lampirans (documents) belonging to this category.
     */
    public function lampirans()
    {
        return $this->hasMany(Lampiran::class, 'kategori_lampiran_id');
    }
}
