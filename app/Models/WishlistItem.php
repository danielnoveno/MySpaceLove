<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WishlistItem extends Model
{
    use HasFactory;
    protected $fillable = [
        'space_id',
        'title',
        'description',
        'location',
        'status',
        'notes'
    ];
    public function space()
    {
        return $this->belongsTo(Space::class);
    }
}
