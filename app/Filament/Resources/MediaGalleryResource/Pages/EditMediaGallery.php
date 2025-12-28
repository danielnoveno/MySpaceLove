<?php

namespace App\Filament\Resources\MediaGalleryResource\Pages;

use App\Filament\Resources\MediaGalleryResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditMediaGallery extends EditRecord
{
    protected static string $resource = MediaGalleryResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
