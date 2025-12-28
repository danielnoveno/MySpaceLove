<?php

namespace App\Filament\Resources;

use App\Filament\Resources\SpaceResource\Pages;
use App\Models\Space;
use Filament\Forms;
use Filament\Tables;
use Filament\Resources\Resource;
use Filament\Forms\Form;
use Filament\Tables\Table;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Toggle;
use Filament\Tables\Columns\TextColumn;

class SpaceResource extends Resource
{
    protected static ?string $model = Space::class;
    protected static ?string $navigationIcon = 'heroicon-o-map';
    protected static ?string $navigationLabel = 'Spaces';
    protected static ?string $navigationGroup = 'LoveSpace';

    public static function form(\Filament\Forms\Form $form): \Filament\Forms\Form
    {
        return $form->schema([
            TextInput::make('title')->required()->maxLength(255),
            TextInput::make('slug')->required()->maxLength(255)->unique(ignoreRecord: true),
            Select::make('user_one_id')->relationship('userOne', 'name')->label('Owner 1')->searchable()->required(),
            Select::make('user_two_id')->relationship('userTwo', 'name')->label('Owner 2')->searchable()->nullable(),
            Toggle::make('is_public')->label('Public?'),
            Select::make('theme_id')->relationship('theme', 'name')->nullable(),
            Textarea::make('bio')->rows(4),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table->columns([
            TextColumn::make('id')->label('ID')->sortable(),
            TextColumn::make('title')->searchable()->sortable(),
            TextColumn::make('slug')->sortable(),
            TextColumn::make('userOne.name')->label('Owner 1')->sortable(),
            TextColumn::make('userTwo.name')->label('Owner 2')->sortable(),
            TextColumn::make('is_public')->label('Public')->formatStateUsing(fn($state) => $state ? 'Yes' : 'No'),
            TextColumn::make('created_at')->since()->label('Created'),
        ])->filters([
            //
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
            'index' => Pages\ListSpaces::route('/'),
            'create' => Pages\CreateSpace::route('/create'),
            'edit' => Pages\EditSpace::route('/{record}/edit'),
        ];
    }
}
