<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class BidangAnggota extends Model
{
    use LogsActivity;

    protected $table = 'bidang_anggotas';

    protected $fillable = [
        'bidang_id',
        'nama',
        'jabatan',
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
            ->useLogName('bidang_anggota');
    }

    /**
     * Get the division that owns this member.
     */
    public function bidang()
    {
        return $this->belongsTo(Bidang::class, 'bidang_id');
    }
}
