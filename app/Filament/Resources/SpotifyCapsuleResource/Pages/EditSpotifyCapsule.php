<?php

namespace App\Filament\Resources\SpotifyCapsuleResource\Pages;

use App\Filament\Resources\SpotifyCapsuleResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditSpotifyCapsule extends EditRecord
{
    protected static string $resource = SpotifyCapsuleResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
