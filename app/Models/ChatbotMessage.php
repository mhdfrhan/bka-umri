<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChatbotMessage extends Model
{
    protected $table = 'chatbot_messages';

    protected $fillable = [
        'chatbot_conversation_id',
        'role',
        'content',
        'token_count',
        'model_used',
        'response_time_ms',
        'was_fallback',
        'was_blocked',
    ];

    protected $casts = [
        'was_fallback' => 'boolean',
        'was_blocked' => 'boolean',
        'token_count' => 'integer',
        'response_time_ms' => 'integer',
    ];

    /**
     * Get the conversation this message belongs to.
     */
    public function conversation(): BelongsTo
    {
        return $this->belongsTo(ChatbotConversation::class, 'chatbot_conversation_id');
    }
}
