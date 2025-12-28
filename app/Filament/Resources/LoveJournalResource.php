<?php

namespace App\Filament\Resources;

use App\Filament\Resources\LoveJournalResource\Pages;
use App\Models\LoveJournal;
use Filament\Forms;
use Filament\Tables;
use Filament\Resources\Resource;
use Filament\Forms\Form;
use Filament\Tables\Table;
use Filament\Forms\Components\BelongsToSelect;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Select;
use Filament\Tables\Columns\TextColumn;

class LoveJournalResource extends Resource
{
    protected static ?string $model = LoveJournal::class;
    protected static ?string $navigationIcon = 'heroicon-o-pencil';
    protected static ?string $navigationLabel = 'Journals';
    protected static ?string $navigationGroup = 'Content';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Select::make('space_id')->relationship('space', 'title')->required(),
            Select::make('user_id')->relationship('user', 'name')->label('Author')->required(),
            TextInput::make('title')->required()->maxLength(255),
            Textarea::make('content')->required()->rows(6),
            Select::make('mood')->options([
                'happy' => 'Happy',
                'sad' => 'Sad',
                'miss' => 'Miss',
                'excited' => 'Excited'
            ])->nullable(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table->columns([
            TextColumn::make('title')->searchable()->sortable(),
            TextColumn::make('space.title')->label('Space'),
            TextColumn::make('user.name')->label('Author'),
            TextColumn::make('mood')->label('Mood'),
            TextColumn::make('created_at')->since(),
        ])->actions([
            Tables\Actions\EditAction::make(),
            Tables\Actions\DeleteAction::make(),
        ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListLoveJournals::route('/'),
            'create' => Pages\CreateLoveJournal::route('/create'),
            'edit' => Pages\EditLoveJournal::route('/{record}/edit'),
        ];
    }
}
