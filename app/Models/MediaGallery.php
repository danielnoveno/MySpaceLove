<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MediaGallery extends Model
{
    use HasFactory;
    protected $fillable = [
        'space_id',
        'user_id',
        'title',
        'file_path',
        'type',
        'collection_key',
        'collection_index',
    ];

    protected $casts = [
        'collection_index' => 'integer',
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
