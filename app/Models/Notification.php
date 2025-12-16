<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Notifications\DatabaseNotification as BaseDatabaseNotification;

class Notification extends BaseDatabaseNotification
{
    use HasUuids;

    protected $fillable = [
        'id',
        'user_id',
        'type',
        'notifiable_type',
        'notifiable_id',
        'data',
        'read_at',
    ];

    protected $casts = [
        'read_at' => 'datetime',
        'data' => 'array',
    ];

    protected static function booted(): void
    {
        static::creating(function (Notification $notification): void {
            if (
                empty($notification->user_id)
                && is_a($notification->notifiable_type, User::class, true)
                && !empty($notification->notifiable_id)
            ) {
                $notification->user_id = (int) $notification->notifiable_id;
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
