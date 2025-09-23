<?php

namespace App\Filament\Resources\LoveTimelineResource\Pages;

use App\Filament\Resources\LoveTimelineResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditLoveTimeline extends EditRecord
{
    protected static string $resource = LoveTimelineResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
