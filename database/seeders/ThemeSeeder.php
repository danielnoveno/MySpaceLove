<?php
// database/seeders/ThemeSeeder.php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Theme;

class ThemeSeeder extends Seeder
{
    public function run(): void
    {
        $themes = [
            [
                'name' => 'Classic Love',
                'primary_color' => '#E63946',
                'secondary_color' => '#F1FAEE',
                'background_color' => '#FFF0F3',
                'font_family' => 'Georgia',
            ],
            [
                'name' => 'Ocean Breeze',
                'primary_color' => '#1D3557',
                'secondary_color' => '#A8DADC',
                'background_color' => '#F1FAEE',
                'font_family' => 'Montserrat',
            ],
            [
                'name' => 'Forest Harmony',
                'primary_color' => '#2A9D8F',
                'secondary_color' => '#E9C46A',
                'background_color' => '#F4F1DE',
                'font_family' => 'Roboto',
            ],
            [
                'name' => 'Minimal White',
                'primary_color' => '#222222',
                'secondary_color' => '#555555',
                'background_color' => '#FFFFFF',
                'font_family' => 'Helvetica',
            ],
            [
                'name' => 'Romantic Pastel',
                'primary_color' => '#FFB6B9',
                'secondary_color' => '#FAE3D9',
                'background_color' => '#FFF5E1',
                'font_family' => 'Poppins',
            ],
        ];

        foreach ($themes as $theme) {
            Theme::create($theme);
        }
    }
}
