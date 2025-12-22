<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('spaces.{spaceId}.chat', function ($user, $spaceId) {
    $space = \App\Models\Space::find($spaceId);
    if (!$space) {
        return false;
    }

    return $space->hasMember($user->id) ? ['id' => $user->id, 'name' => $user->name] : false;
});

Broadcast::channel('spaces.{spaceId}.nobar', function ($user, $spaceId) {
    $space = \App\Models\Space::find($spaceId);
    if (!$space) {
        return false;
    }

    return $space->hasMember($user->id) ? ['id' => $user->id, 'name' => $user->name] : false;
});
