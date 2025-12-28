<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DailyMessage extends Model
{
    use HasFactory;
    protected $fillable = [
        'space_id',
        'date',
        'message',
        'generated_by'
    ];

    public function space()
    {
        return $this->belongsTo(Space::class);
    }
}
