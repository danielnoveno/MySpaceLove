<?php

namespace App\Filament\Resources;

use App\Filament\Resources\WishlistItemResource\Pages;
use App\Models\WishlistItem;
use Filament\Forms;
use Filament\Tables;
use Filament\Resources\Resource;
use Filament\Forms\Form;
use Filament\Tables\Table;
use Filament\Forms\Components\BelongsToSelect;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Select;
use Filament\Tables\Columns\BadgeColumn;
use Filament\Tables\Columns\TextColumn;

class WishlistItemResource extends Resource
{
    protected static ?string $model = WishlistItem::class;
    protected static ?string $navigationIcon = 'heroicon-o-star';
    protected static ?string $navigationLabel = 'Wishlist';
    protected static ?string $navigationGroup = 'Content';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Select::make('space_id')->relationship('space', 'title')->required(),
            TextInput::make('title')->required()->maxLength(255),
            TextInput::make('location')->nullable()->maxLength(255),
            Textarea::make('description')->rows(3),
            Select::make('status')->options(['pending' => 'Pending', 'done' => 'Done'])->default('pending'),
            Textarea::make('notes')->rows(3)->nullable(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table->columns([
            TextColumn::make('title')->searchable()->sortable(),
            TextColumn::make('space.title')->label('Space'),
            TextColumn::make('location')->label('Location'),
            BadgeColumn::make('status')->enum(['pending' => 'Pending', 'done' => 'Done'])->colors(['secondary', 'success' => 'done']),
            TextColumn::make('created_at')->since(),
        ])->actions([
            Tables\Actions\EditAction::make(),
            Tables\Actions\DeleteAction::make(),
        ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListWishlistItems::route('/'),
            'create' => Pages\CreateWishlistItem::route('/create'),
            'edit' => Pages\EditWishlistItem::route('/{record}/edit'),
        ];
    }
}
