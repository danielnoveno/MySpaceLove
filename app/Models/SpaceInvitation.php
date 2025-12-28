<?php

namespace App\Models;

use Illuminate\Support\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SpaceInvitation extends Model
{
    use HasFactory;

    protected $fillable = [
        'space_id',
        'inviter_id',
        'invitee_id',
        'invitee_email',
        'token',
        'status',
        'accepted_at',
    ];

    protected $casts = [
        'accepted_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    public function space()
    {
        return $this->belongsTo(Space::class);
    }

    public function inviter()
    {
        return $this->belongsTo(User::class, 'inviter_id');
    }

    public function invitee()
    {
        return $this->belongsTo(User::class, 'invitee_id');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public static function statusLabel(?string $status): string
    {
        $statusKey = strtolower((string) $status);

        return match ($statusKey) {
            'pending' => 'Menunggu konfirmasi',
            'accepted' => 'Diterima',
            'declined', 'rejected' => 'Ditolak',
            'cancelled', 'canceled' => 'Dibatalkan',
            'expired' => 'Kedaluwarsa',
            default => $status ? ucfirst($status) : 'Tidak diketahui',
        };
    }

    public static function formatTimestamp(?Carbon $timestamp): ?string
    {
        if (!$timestamp) {
            return null;
        }

        $timezone = config('app.timezone', 'UTC');

        return $timestamp->copy()->setTimezone($timezone)->format('d M Y H:i');
    }
}
