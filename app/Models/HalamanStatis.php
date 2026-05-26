<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class HalamanStatis extends Model
{
    use LogsActivity;

    protected $table = 'halaman_statis';

    protected $fillable = [
        'slug',
        'judul',
        'konten',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->useLogName('halaman_statis');
    }
}
