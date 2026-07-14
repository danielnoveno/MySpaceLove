<?php

use App\Models\User;

$user = User::first();
if (!$user) {
    echo "No user found.\n";
    exit;
}

echo "User ID: " . $user->id . "\n";
echo "Name: " . $user->name . "\n";
echo "Tour Completed At: " . ($user->tour_completed_at ?? 'NULL') . "\n";

// Simulate completion
echo "Simulating completion...\n";
$user->tour_completed_at = now();
$user->save();

$user->refresh();
echo "Tour Completed At (after update): " . ($user->tour_completed_at ?? 'NULL') . "\n";
