<?php

namespace Database\Seeders;

use App\Models\Space;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SpaceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Get the first user
        $user = User::first();

        if ($user) {
            // Create a space for the user
            Space::create([
                'slug' => 'my-space',
                'title' => 'My Space',
                'user_one_id' => 1,
                'user_two_id' => 2,
                'is_public' => false,
                'bio' => 'This is my personal space.',
            ]);
        }
    }
}
