<?php

namespace App\Filament\Resources\LoveJournalResource\Pages;

use App\Filament\Resources\LoveJournalResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListLoveJournals extends ListRecords
{
    protected static string $resource = LoveJournalResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
