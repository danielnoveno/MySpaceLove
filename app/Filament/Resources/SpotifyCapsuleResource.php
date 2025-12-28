<?php

namespace App\Filament\Resources;

use App\Filament\Resources\SpotifyCapsuleResource\Pages;
use App\Filament\Resources\SpotifyCapsuleResource\RelationManagers;
use App\Models\SpotifyCapsule;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class SpotifyCapsuleResource extends Resource
{
    protected static ?string $model = SpotifyCapsule::class;

    protected static ?string $navigationIcon = 'heroicon-o-archive-box';
    protected static ?string $navigationLabel = 'Memory Capsules';
    protected static ?string $navigationGroup = 'Content';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('space_id')
                    ->relationship('space', 'title')
                    ->required(),
                Forms\Components\Select::make('user_id')
                    ->relationship('user', 'name')
                    ->required()
                    ->label('Creator'),
                Forms\Components\TextInput::make('spotify_track_id')
                    ->required()
                    ->maxLength(255)
                    ->label('Spotify Track ID'),
                Forms\Components\TextInput::make('track_name')
                    ->required()
                    ->maxLength(255),
                Forms\Components\TextInput::make('artists')
                    ->required()
                    ->maxLength(255),
                Forms\Components\TextInput::make('moment')
                    ->maxLength(255)
                    ->nullable(),
                Forms\Components\Textarea::make('description')
                    ->columnSpanFull(),
                Forms\Components\DatePicker::make('saved_at')
                    ->nullable(),
                Forms\Components\TextInput::make('preview_url')
                    ->maxLength(255)
                    ->nullable(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('space.title')
                    ->label('Space')
                    ->sortable(),
                Tables\Columns\TextColumn::make('user.name')
                    ->label('Creator')
                    ->sortable(),
                Tables\Columns\TextColumn::make('track_name')
                    ->searchable()
                    ->limit(30),
                Tables\Columns\TextColumn::make('artists')
                    ->searchable()
                    ->limit(30),
                Tables\Columns\TextColumn::make('moment')
                    ->searchable()
                    ->limit(30),
                Tables\Columns\TextColumn::make('saved_at')
                    ->date()
                    ->sortable(),
                Tables\Columns\TextColumn::make('spotify_track_id')
                    ->searchable()
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('preview_url')
                    ->searchable()
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                //
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListSpotifyCapsules::route('/'),
            'create' => Pages\CreateSpotifyCapsule::route('/create'),
            'edit' => Pages\EditSpotifyCapsule::route('/{record}/edit'),
        ];
    }
}
