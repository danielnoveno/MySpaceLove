<?php

namespace Database\Seeders;

use App\Models\Game;
use Illuminate\Database\Seeder;

class GameSeeder extends Seeder
{
    public function run(): void
    {
        $games = [
            [
                'slug' => 'tetris',
                'name' => 'Tetris',
                'description' => 'Stack the falling blocks, clear lines, and chase your shared high score.',
            ],
            [
                'slug' => 'slither',
                'name' => 'Slither Sprint',
                'description' => 'Collect glowing orbs, grow longer, and avoid crashing.',
            ],
        ];

        foreach ($games as $game) {
            Game::updateOrCreate(
                ['slug' => $game['slug']],
                $game,
            );
        }
    }
}
