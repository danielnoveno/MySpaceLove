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
            'name' => 'Admin',
            'username' => 'admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
        ]);
        User::create([
            'name' => 'Daniel',
            'username' => 'daniel',
            'email' => 'dnw022003@gmail.com',
            'password' => Hash::make('password'),
        ]);

        $this->call([
            ThemeSeeder::class,
            SpaceSeeder::class,
        ]);
    }
}
