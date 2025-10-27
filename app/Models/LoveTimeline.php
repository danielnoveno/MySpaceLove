<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LoveTimeline extends Model
{
    use HasFactory;

    protected $fillable = [
        'space_id',
        'title',
        'description',
        'date',
        'media_paths',
        'thumbnail_path',
    ];

    protected $casts = [
        'media_paths' => 'array',
        'date' => 'date',
    ];
}
