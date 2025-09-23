<?php

namespace App\Filament\Resources;

use App\Filament\Resources\SurpriseNoteResource\Pages;
use App\Models\SurpriseNote;
use Filament\Forms;
use Filament\Tables;
use Filament\Resources\Resource;
use Filament\Forms\Form;
use Filament\Tables\Table;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\BelongsToSelect;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Tables\Columns\TextColumn;

class SurpriseNoteResource extends Resource
{
    protected static ?string $model = SurpriseNote::class;
    protected static ?string $navigationIcon = 'heroicon-o-chat-bubble-left-right';
    protected static ?string $navigationLabel = 'Surprise Notes';
    protected static ?string $navigationGroup = 'Content';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Select::make('space_id')->relationship('space', 'title')->required(),
            Select::make('user_id')->relationship('user', 'name')->label('Author')->required(),
            TextInput::make('title')->nullable()->maxLength(255),
            Textarea::make('message')->rows(4)->required(),
            DatePicker::make('unlock_date')->required(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table->columns([
            TextColumn::make('title')->limit(30),
            TextColumn::make('space.title')->label('Space'),
            TextColumn::make('user.name')->label('Author'),
            TextColumn::make('unlock_date')->date(),
            TextColumn::make('created_at')->since(),
        ])->actions([
            Tables\Actions\EditAction::make(),
            Tables\Actions\DeleteAction::make(),
        ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListSurpriseNotes::route('/'),
            'create' => Pages\CreateSurpriseNote::route('/create'),
            'edit' => Pages\EditSurpriseNote::route('/{record}/edit'),
        ];
    }
}
