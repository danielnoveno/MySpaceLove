<?php

namespace App\Filament\Resources\SurpriseNoteResource\Pages;

use App\Filament\Resources\SurpriseNoteResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditSurpriseNote extends EditRecord
{
    protected static string $resource = SurpriseNoteResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
