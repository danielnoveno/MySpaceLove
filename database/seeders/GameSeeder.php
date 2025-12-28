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
                'supports_multiplayer' => true,
            ],
            [
                'slug' => 'slither',
                'name' => 'Slither Sprint',
                'description' => 'Collect glowing orbs, grow longer, and avoid crashing.',
                'supports_multiplayer' => true,
            ],
            [
                'slug' => 'pong-duet',
                'name' => 'Pong Duet',
                'description' => 'Team up or battle it out in a fast-paced paddle rally.',
                'supports_multiplayer' => true,
            ],
            [
                'slug' => 'connect-four',
                'name' => 'Connect Four',
                'description' => 'Drop discs, take turns, and lock in four-in-a-row.',
                'supports_multiplayer' => true,
            ],
            [
                'slug' => 'memory-match',
                'name' => 'Memory Match',
                'description' => 'Flip cards, find pairs, and race the clock together.',
                'supports_multiplayer' => true,
            ],
            [
                'slug' => 'maze-escape',
                'name' => 'Co-op Maze Escape',
                'description' => 'Navigate the maze with your partner and reach the exit.',
                'supports_multiplayer' => true,
            ],
            [
                'slug' => 'couple-quiz',
                'name' => 'Couple Quiz',
                'description' => 'Ask, answer, and see how well you know each other.',
                'supports_multiplayer' => true,
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
