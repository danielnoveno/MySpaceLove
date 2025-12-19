<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GameSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'game_id',
        'space_id',
        'session_id',
        'created_by_user_id',
        'current_turn_user_id',
        'status',
        'state',
    ];

    protected $casts = [
        'state' => 'array',
    ];

    public function game()
    {
        return $this->belongsTo(Game::class);
    }

    public function space()
    {
        return $this->belongsTo(Space::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function currentTurnUser()
    {
        return $this->belongsTo(User::class, 'current_turn_user_id');
    }
}
