<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;

/**
 * @property \Illuminate\Notifications\DatabaseNotificationCollection $notifications
 * @property \Illuminate\Notifications\DatabaseNotificationCollection $unreadNotifications
 */
class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'username',
        'partner_code',
        'email_verified_at',
        'auth_provider',
        'provider_id',
        'provider_avatar',
        'profile_image',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'tour_completed_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function location()
    {
        return $this->hasOne(Location::class);
    }

    public function spaces()
    {
        return $this->hasMany(Space::class, 'user_one_id');
    }

    public static function generateUniqueUsername(string $seed): string
    {
        $base = Str::slug($seed, '_');

        if ($base === '' || $base === null) {
            $base = 'user';
        }

        $base = Str::lower($base);
        $username = $base;
        $suffix = 1;

        while (static::where('username', $username)->exists()) {
            $username = $base . '_' . $suffix;
            $suffix++;
        }

        return $username;
    }

    public static function generatePartnerCode(int $length = 8): string
    {
        do {
            $code = Str::upper(Str::random($length));
        } while (static::where('partner_code', $code)->exists());

        return $code;
    }

    public function notifications(): MorphMany
    {
        return $this->morphMany(Notification::class, 'notifiable')->latest();
    }

    public function readNotifications()
    {
        return $this->notifications()->read();
    }

    public function unreadNotifications()
    {
        return $this->notifications()->unread();
    }

    public function messages()
    {
        return $this->hasMany(Message::class, 'sender_user_id');
    }

    public function messageReads()
    {
        return $this->hasMany(MessageRead::class);
    }
}
