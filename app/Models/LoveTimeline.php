<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LoveTimeline extends Model
{
    use HasFactory;
    protected $table = 'love_timelines';
    protected $fillable = [
        'space_id',
        'title',
        'description',
        'date',
        'media_path'
    ];

    public function space()
    {
        return $this->belongsTo(Space::class);
    }
}
