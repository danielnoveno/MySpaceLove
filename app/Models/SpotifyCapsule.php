<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SpotifyCapsule extends Model
{
    use HasFactory;

    protected $fillable = [
        'space_id',
        'user_id',
        'spotify_track_id',
        'track_name',
        'artists',
        'moment',
        'description',
        'saved_at',
        'preview_url',
    ];

    protected $casts = [
        'saved_at' => 'date',
    ];

    public function space(): BelongsTo
    {
        return $this->belongsTo(Space::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
