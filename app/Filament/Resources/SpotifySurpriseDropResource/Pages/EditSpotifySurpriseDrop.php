<?php

namespace App\Filament\Resources\SpotifySurpriseDropResource\Pages;

use App\Filament\Resources\SpotifySurpriseDropResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditSpotifySurpriseDrop extends EditRecord
{
    protected static string $resource = SpotifySurpriseDropResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
