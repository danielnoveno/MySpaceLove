<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ListeningPlan extends Model
{
    use HasFactory;

    protected $fillable = [
        'space_id',
        'user_id',
        'title',
        'description',
        'scheduled_at',
        'spotify_playlist_id',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
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
