<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Message extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'space_id',
        'sender_user_id',
        'type',
        'body',
        'meta_json',
    ];

    protected $casts = [
        'meta_json' => 'array',
    ];

    public function space()
    {
        return $this->belongsTo(Space::class);
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_user_id');
    }

    public function reads()
    {
        return $this->hasMany(MessageRead::class);
    }
}
