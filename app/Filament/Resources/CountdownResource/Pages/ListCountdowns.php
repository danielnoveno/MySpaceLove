<?php

namespace App\Filament\Resources\CountdownResource\Pages;

use App\Filament\Resources\CountdownResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListCountdowns extends ListRecords
{
    protected static string $resource = CountdownResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
