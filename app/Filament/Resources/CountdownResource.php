<?php

namespace App\Filament\Resources;

use App\Filament\Resources\CountdownResource\Pages;
use App\Models\Countdown;
use Filament\Forms;
use Filament\Tables;
use Filament\Resources\Resource;
use Filament\Forms\Form;
use Filament\Tables\Table;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\BelongsToSelect;
use Filament\Forms\Components\Select;
use Filament\Tables\Columns\TextColumn;

class CountdownResource extends Resource
{
    protected static ?string $model = Countdown::class;
    protected static ?string $navigationIcon = 'heroicon-o-clock';
    protected static ?string $navigationLabel = 'Countdowns';
    protected static ?string $navigationGroup = 'Content';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Select::make('space_id')->relationship('space', 'title')->required(),
            TextInput::make('event_name')->required()->maxLength(255),
            DatePicker::make('event_date')->required(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table->columns([
            TextColumn::make('space.title')->label('Space'),
            TextColumn::make('event_name')->searchable()->sortable(),
            TextColumn::make('event_date')->date()->sortable(),
            TextColumn::make('created_at')->since(),
        ])->actions([
            Tables\Actions\EditAction::make(),
            Tables\Actions\DeleteAction::make(),
        ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListCountdowns::route('/'),
            'create' => Pages\CreateCountdown::route('/create'),
            'edit' => Pages\EditCountdown::route('/{record}/edit'),
        ];
    }
}
