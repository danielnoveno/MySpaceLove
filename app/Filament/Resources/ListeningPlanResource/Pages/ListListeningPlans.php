<?php

namespace App\Filament\Resources\ListeningPlanResource\Pages;

use App\Filament\Resources\ListeningPlanResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListListeningPlans extends ListRecords
{
    protected static string $resource = ListeningPlanResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
