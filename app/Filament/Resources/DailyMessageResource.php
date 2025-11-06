<?php

namespace App\Filament\Resources;

use App\Filament\Resources\DailyMessageResource\Pages;
use App\Models\DailyMessage;
use Filament\Forms;
use Filament\Tables;
use Filament\Resources\Resource;
use Filament\Forms\Form;
use Filament\Tables\Table;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\BelongsToSelect;
use Filament\Forms\Components\Select;
use Filament\Tables\Columns\TextColumn;

class DailyMessageResource extends Resource
{
    protected static ?string $model = DailyMessage::class;
    protected static ?string $navigationIcon = 'heroicon-o-sparkles';
    protected static ?string $navigationLabel = 'Daily Messages';
    protected static ?string $navigationGroup = 'Content';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Select::make('space_id')->relationship('space', 'title')->required(),
            DatePicker::make('date')
                ->required()
                ->disabled(fn (string $operation): bool => $operation === 'create'),
            Textarea::make('message')->rows(4)->required(),
            // generated_by managed by backend normally
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table->columns([
            TextColumn::make('space.title')->label('Space'),
            TextColumn::make('date')->date()->sortable(),
            TextColumn::make('message')->limit(50),
            TextColumn::make('generated_by')->label('Source'),
            TextColumn::make('created_at')->since(),
        ])->actions([
            Tables\Actions\EditAction::make(),
            Tables\Actions\DeleteAction::make(),
        ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListDailyMessages::route('/'),
            'create' => Pages\CreateDailyMessage::route('/create'),
            'edit' => Pages\EditDailyMessage::route('/{record}/edit'),
        ];
    }
}
