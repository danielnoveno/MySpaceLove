<?php

namespace App\Filament\Resources\LoveJournalResource\Pages;

use App\Filament\Resources\LoveJournalResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditLoveJournal extends EditRecord
{
    protected static string $resource = LoveJournalResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
