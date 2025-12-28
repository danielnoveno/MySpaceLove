<?php

namespace App\Filament\Resources\CountdownResource\Pages;

use App\Filament\Resources\CountdownResource;
use Filament\Actions;
use Filament\Resources\Pages\CreateRecord;

class CreateCountdown extends CreateRecord
{
    protected static string $resource = CountdownResource::class;
}
