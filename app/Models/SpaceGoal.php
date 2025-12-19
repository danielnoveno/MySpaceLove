<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SpaceGoal extends Model
{
    use HasFactory;

    protected $fillable = [
        'space_id',
        'title',
        'description',
        'target_points',
        'current_points',
        'is_active',
        'meta',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'meta' => 'array',
    ];

    public function space()
    {
        return $this->belongsTo(Space::class);
    }
}
