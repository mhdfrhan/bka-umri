<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuthLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'username',
        'ip_address',
        'user_agent',
        'browser',
        'platform',
        'location',
        'status',
        'reason',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}
