<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Lampiran extends Model implements HasMedia
{
    use SoftDeletes, InteractsWithMedia, LogsActivity;

    protected $table = 'lampirans';

    protected $fillable = [
        'nama_tampilan',
        'deskripsi',
        'kategori_lampiran_id',
        'urutan',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->useLogName('lampiran');
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('berkas')
            ->singleFile();
    }

    /**
     * Get the category of the document.
     */
    public function kategori()
    {
        return $this->belongsTo(KategoriLampiran::class, 'kategori_lampiran_id');
    }
}
