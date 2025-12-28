<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Game extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug',
        'name',
        'description',
        'is_enabled',
        'supports_multiplayer',
    ];

    protected $casts = [
        'is_enabled' => 'boolean',
        'supports_multiplayer' => 'boolean',
    ];

    public function scores()
    {
        return $this->hasMany(GameScore::class);
    }
}
