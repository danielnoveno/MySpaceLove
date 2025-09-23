<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Doc extends Model
{
    use HasFactory;
    protected $fillable = [
        'space_id',
        'user_id',
        'title',
        'file_path',
        'notes'
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
