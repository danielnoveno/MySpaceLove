<?php

namespace App\Filament\Resources\SpotifyCapsuleResource\Pages;

use App\Filament\Resources\SpotifyCapsuleResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListSpotifyCapsules extends ListRecords
{
    protected static string $resource = SpotifyCapsuleResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
