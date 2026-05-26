<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Layanan extends Model
{
    use LogsActivity;

    protected $table = 'layanans';

    protected $fillable = [
        'judul',
        'deskripsi',
        'ikon',
        'urutan',
    ];

    protected $casts = [
        'urutan' => 'integer',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->useLogName('layanan');
    }
}
