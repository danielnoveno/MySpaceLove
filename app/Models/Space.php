<?php

namespace App\Models;

use App\Models\MemoryLaneConfig;
use App\Models\NobarSchedule;
use App\Models\SpaceInvitation;
use App\Models\SpaceSeparationRequest;
use App\Models\Message;
use App\Models\MessageRead;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Space extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug',
        'title',
        'user_one_id',
        'user_two_id',
        'is_public',
        'theme_id',
        'bio'
    ];

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function invitations()
    {
        return $this->hasMany(SpaceInvitation::class);
    }

    public function pendingInvitation()
    {
        return $this->hasOne(SpaceInvitation::class)->where('status', 'pending');
    }

    public function separationRequests()
    {
        return $this->hasMany(SpaceSeparationRequest::class);
    }

    public function pendingSeparationRequest()
    {
        return $this->hasOne(SpaceSeparationRequest::class)->where('status', SpaceSeparationRequest::STATUS_PENDING);
    }

    public function userOne()
    {
        return $this->belongsTo(User::class, 'user_one_id');
    }
    public function userTwo()
    {
        return $this->belongsTo(User::class, 'user_two_id');
    }
    public function theme()
    {
        return $this->belongsTo(Theme::class);
    }

    public function timelines()
    {
        return $this->hasMany(LoveTimeline::class);
    }
    public function dailyMessages()
    {
        return $this->hasMany(DailyMessage::class);
    }
    public function countdowns()
    {
        return $this->hasMany(Countdown::class);
    }
    public function journals()
    {
        return $this->hasMany(LoveJournal::class);
    }
    public function surpriseNotes()
    {
        return $this->hasMany(SurpriseNote::class);
    }
    public function galleries()
    {
        return $this->hasMany(MediaGallery::class);
    }
    public function wishlist()
    {
        return $this->hasMany(WishlistItem::class);
    }
    public function docs()
    {
        return $this->hasMany(Doc::class);
    }

    public function goals()
    {
        return $this->hasMany(SpaceGoal::class);
    }

    public function nobarSchedules()
    {
        return $this->hasMany(NobarSchedule::class);
    }

    public function memoryLaneConfig()
    {
        return $this->hasOne(MemoryLaneConfig::class);
    }

    public function hasMember($userId)
    {
        return $this->user_one_id == $userId || $this->user_two_id == $userId;
    }

    public function partner()
    {
        if ($this->user_one_id === \Illuminate\Support\Facades\Auth::id()) {
            return $this->userTwo;
        }

        return $this->userOne;
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    public function messageReads()
    {
        return $this->hasManyThrough(MessageRead::class, Message::class);
    }
}
