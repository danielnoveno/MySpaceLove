<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

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

    protected static function booted(): void
    {
        static::creating(function (LoveTimeline $timeline) {
            if (empty($timeline->uuid)) {
                $timeline->uuid = (string) Str::uuid();
            }
        });
    }

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }
}
