<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NobarSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'space_id',
        'room_id',
        'room_name',
        'starts_at',
        'ends_at',
        'host_user_id',
        'timezone',
        'attendees',
        'raw_payload',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'attendees' => 'array',
        'raw_payload' => 'array',
    ];

    public function space()
    {
        return $this->belongsTo(Space::class);
    }
}
