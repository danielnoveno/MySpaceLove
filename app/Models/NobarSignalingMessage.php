<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NobarSignalingMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'space_id',
        'sender_user_id',
        'type',
        'payload',
    ];

    protected $casts = [
        'payload' => 'array',
    ];

    public function space()
    {
        return $this->belongsTo(Space::class);
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_user_id');
    }
}
