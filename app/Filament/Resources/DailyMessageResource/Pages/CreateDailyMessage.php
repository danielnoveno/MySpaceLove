<?php

namespace App\Filament\Resources\DailyMessageResource\Pages;

use App\Filament\Resources\DailyMessageResource;
use Filament\Actions;
use Filament\Resources\Pages\CreateRecord;

class CreateDailyMessage extends CreateRecord
{
    protected static string $resource = DailyMessageResource::class;
}
