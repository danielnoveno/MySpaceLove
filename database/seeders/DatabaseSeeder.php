<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'User',
            'username' => 'admin',
            'email' => 'user@spacelovee.my.id',
            'password' => Hash::make('password'),
        ]);
        User::create([
            'name' => 'User1',
            'username' => 'daniel',
            'email' => 'user1@spacelovee.my.id',
            'password' => Hash::make('password'),
        ]);

        $this->call([
            ThemeSeeder::class,
            SpaceSeeder::class,
            GameSeeder::class,
        ]);
    }
}
