<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SpaceSeparationRequest extends Model
{
    use HasFactory;

    public const STATUS_PENDING = 'pending';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';
    public const STATUS_CANCELLED = 'cancelled';

    public const CONFIRMATION_PHRASE = 'KITA SUDAH SIAP'; // phrase users must type to confirm

    protected $fillable = [
        'space_id',
        'initiator_id',
        'partner_id',
        'status',
        'initiator_reason',
        'partner_reason',
        'initiator_confirmed_at',
        'partner_confirmed_at',
        'cancelled_at',
    ];

    protected $casts = [
        'initiator_confirmed_at' => 'datetime',
        'partner_confirmed_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    public function space()
    {
        return $this->belongsTo(Space::class);
    }

    public function initiator()
    {
        return $this->belongsTo(User::class, 'initiator_id');
    }

    public function partner()
    {
        return $this->belongsTo(User::class, 'partner_id');
    }

    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }
}
