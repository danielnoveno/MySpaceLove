<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class MemoryLaneConfig extends Model
{
    use HasFactory;

    protected $fillable = [
        'space_id',
        'level_one_image',
        'level_two_image',
        'level_three_image',
        'level_one_title',
        'level_one_body',
        'level_two_title',
        'level_two_body',
        'level_three_title',
        'level_three_body',
        'active_levels',
        'pin',
        'content_set',
        'custom_rewards',
        'flipbook_pages',
        'flipbook_cover_image',
        'flipbook_cover_title',
    ];

    protected $casts = [
        'custom_rewards' => 'array',
        'flipbook_pages' => 'array',
        'content_set' => 'boolean',
        'active_levels' => 'integer',
    ];

    public function space(): BelongsTo
    {
        return $this->belongsTo(Space::class);
    }

    protected static function booted(): void
    {
        static::deleting(function (MemoryLaneConfig $config): void {
            $imageFields = [
                'level_one_image',
                'level_two_image',
                'level_three_image',
                'flipbook_cover_image'
            ];
            
            foreach ($imageFields as $attribute) {
                $path = $config->getAttribute($attribute);

                if (!empty($path)) {
                    Storage::disk('public')->delete($path);
                }
            }
        });
    }
}
