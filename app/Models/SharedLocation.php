<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SharedLocation extends Model
{
    use HasFactory;

    public const CATEGORIES = ['restaurant', 'cafe', 'park', 'activity', 'travel', 'other'];

    protected $fillable = [
        'space_id',
        'user_id',
        'name',
        'address',
        'city',
        'category',
        'notes',
        'rating',
        'saved_at',
        'latitude',
        'longitude',
    ];

    protected $casts = [
        'rating' => 'integer',
        'saved_at' => 'date',
        'latitude' => 'float',
        'longitude' => 'float',
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
