<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatbotFaq extends Model
{
    protected $fillable = [
        'label',
        'question',
        'answer',
        'is_popular',
        'urutan',
    ];

    protected $casts = [
        'is_popular' => 'boolean',
        'urutan' => 'integer',
    ];
}
