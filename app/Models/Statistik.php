<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Statistik extends Model
{
    use LogsActivity;

    protected $table = 'statistiks';

    protected $fillable = [
        'angka',
        'label',
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
            ->useLogName('statistik');
    }
}
