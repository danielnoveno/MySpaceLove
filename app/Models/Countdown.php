<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Countdown extends Model
{
    use HasFactory;
    protected $fillable = [
        'space_id',
        'event_name',
        'event_date'
    ];
    public function space()
    {
        return $this->belongsTo(Space::class);
    }
}
