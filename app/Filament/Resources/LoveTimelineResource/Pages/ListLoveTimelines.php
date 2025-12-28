<?php

namespace App\Filament\Resources\LoveTimelineResource\Pages;

use App\Filament\Resources\LoveTimelineResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListLoveTimelines extends ListRecords
{
    protected static string $resource = LoveTimelineResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
