<?php

namespace App\Filament\Resources\DailyMessageResource\Pages;

use App\Filament\Resources\DailyMessageResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditDailyMessage extends EditRecord
{
    protected static string $resource = DailyMessageResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
