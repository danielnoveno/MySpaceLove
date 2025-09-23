<?php

namespace App\Filament\Resources;

use App\Filament\Resources\LoveTimelineResource\Pages;
use App\Models\LoveTimeline;
use App\Models\Space;
use Filament\Forms;
use Filament\Tables;
use Filament\Resources\Resource;
use Filament\Forms\Form;
use Filament\Tables\Table;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\BelongsToSelect;
use Filament\Forms\Components\Select;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ImageColumn;

class LoveTimelineResource extends Resource
{
    protected static ?string $model = LoveTimeline::class;
    protected static ?string $navigationIcon = 'heroicon-o-heart';
    protected static ?string $navigationLabel = 'Timeline';
    protected static ?string $navigationGroup = 'Content';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Select::make('space_id')->relationship('space', 'title')->required(),
            TextInput::make('title')->required()->maxLength(255),
            DatePicker::make('date')->required(),
            Textarea::make('description')->rows(4),
            FileUpload::make('media_path')->label('Media')->directory('timeline')->image()->maxSize(20480),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table->columns([
            ImageColumn::make('media_path')->label('Media')->square(),
            TextColumn::make('title')->searchable()->sortable(),
            TextColumn::make('space.title')->label('Space')->sortable(),
            TextColumn::make('date')->date()->sortable(),
            TextColumn::make('created_at')->since(),
        ])->actions([
            Tables\Actions\EditAction::make(),
            Tables\Actions\DeleteAction::make(),
        ])->bulkActions([
            Tables\Actions\DeleteBulkAction::make(),
        ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListLoveTimelines::route('/'),
            'create' => Pages\CreateLoveTimeline::route('/create'),
            'edit' => Pages\EditLoveTimeline::route('/{record}/edit'),
        ];
    }
}
