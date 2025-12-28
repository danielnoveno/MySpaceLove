<?php

namespace App\Filament\Resources;

use App\Filament\Resources\SpotifySurpriseDropResource\Pages;
use App\Filament\Resources\SpotifySurpriseDropResource\RelationManagers;
use App\Models\SpotifySurpriseDrop;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class SpotifySurpriseDropResource extends Resource
{
    protected static ?string $model = SpotifySurpriseDrop::class;

    protected static ?string $navigationIcon = 'heroicon-o-gift';
    protected static ?string $navigationLabel = 'Surprise Song Drops';
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
                    ->label('Curator'),
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
                Forms\Components\DateTimePicker::make('scheduled_for')
                    ->required(),
                Forms\Components\Textarea::make('note')
                    ->columnSpanFull()
                    ->nullable(),
                Forms\Components\TextInput::make('curator_name')
                    ->maxLength(255)
                    ->nullable()
                    ->label('Curator Name (Optional)'),
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
                    ->label('Curator')
                    ->sortable(),
                Tables\Columns\TextColumn::make('track_name')
                    ->searchable()
                    ->limit(30),
                Tables\Columns\TextColumn::make('artists')
                    ->searchable()
                    ->limit(30),
                Tables\Columns\TextColumn::make('scheduled_for')
                    ->dateTime()
                    ->sortable(),
                Tables\Columns\TextColumn::make('curator_name')
                    ->searchable()
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('spotify_track_id')
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
            'index' => Pages\ListSpotifySurpriseDrops::route('/'),
            'create' => Pages\CreateSpotifySurpriseDrop::route('/create'),
            'edit' => Pages\EditSpotifySurpriseDrop::route('/{record}/edit'),
        ];
    }
}
