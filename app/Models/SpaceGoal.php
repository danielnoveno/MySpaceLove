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
        'completed_at',
        'meta',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'completed_at' => 'datetime',
        'meta' => 'array',
    ];

    public function space()
    {
        return $this->belongsTo(Space::class);
    }

    public function isCompleted(): bool
    {
        return !$this->is_active || $this->completed_at !== null;
    }
}
