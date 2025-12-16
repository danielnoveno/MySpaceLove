<?php

namespace App\Filament\Resources\SpotifySurpriseDropResource\Pages;

use App\Filament\Resources\SpotifySurpriseDropResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListSpotifySurpriseDrops extends ListRecords
{
    protected static string $resource = SpotifySurpriseDropResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
