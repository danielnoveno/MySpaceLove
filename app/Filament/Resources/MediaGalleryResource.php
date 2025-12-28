<?php

namespace App\Filament\Resources;

use App\Filament\Resources\MediaGalleryResource\Pages;
use App\Models\MediaGallery;
use Filament\Forms;
use Filament\Tables;
use Filament\Resources\Resource;
use Filament\Forms\Form;
use Filament\Tables\Table;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\BelongsToSelect;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;

class MediaGalleryResource extends Resource
{
    protected static ?string $model = MediaGallery::class;
    protected static ?string $navigationIcon = 'heroicon-o-photo';
    protected static ?string $navigationLabel = 'Media Gallery';
    protected static ?string $navigationGroup = 'Content';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Select::make('space_id')->relationship('space', 'title')->required(),
            Select::make('user_id')->relationship('user', 'name')->required()->label('Uploader'),
            TextInput::make('title')->nullable()->maxLength(255),
            FileUpload::make('file_path')->label('Files')->multiple()->directory('media')->nullable(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table->columns([
            ImageColumn::make('file_path')->label('Preview')->square()->limit(3)->stacked(),
            TextColumn::make('title')->limit(30),
            TextColumn::make('space.title')->label('Space'),
            TextColumn::make('user.name')->label('Uploader'),
            TextColumn::make('created_at')->since(),
        ])->actions([
            Tables\Actions\EditAction::make(),
            Tables\Actions\DeleteAction::make(),
        ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListMediaGalleries::route('/'),
            'create' => Pages\CreateMediaGallery::route('/create'),
            'edit' => Pages\EditMediaGallery::route('/{record}/edit'),
        ];
    }
}
