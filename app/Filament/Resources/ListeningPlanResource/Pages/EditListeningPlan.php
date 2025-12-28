<?php

namespace App\Filament\Resources\ListeningPlanResource\Pages;

use App\Filament\Resources\ListeningPlanResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditListeningPlan extends EditRecord
{
    protected static string $resource = ListeningPlanResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
