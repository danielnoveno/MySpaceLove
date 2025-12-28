<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NobarParticipant extends Model
{
    use HasFactory;

    protected $fillable = [
        'space_id',
        'user_id',
        'display_name',
        'is_host',
        'audio_enabled',
        'video_enabled',
        'screen_sharing',
        'status',
        'last_seen_at',
    ];

    protected $casts = [
        'is_host' => 'boolean',
        'audio_enabled' => 'boolean',
        'video_enabled' => 'boolean',
        'screen_sharing' => 'boolean',
        'last_seen_at' => 'datetime',
    ];

    public function space()
    {
        return $this->belongsTo(Space::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
