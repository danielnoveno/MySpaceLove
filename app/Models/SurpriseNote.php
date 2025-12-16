<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SurpriseNote extends Model
{
    use HasFactory;
    protected $fillable = [
        'space_id',
        'user_id',
        'title',
        'message',
        'unlock_date'
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
