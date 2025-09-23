<?php

namespace App\Filament\Resources;

use App\Filament\Resources\DocResource\Pages;
use App\Models\Doc;
use Filament\Forms;
use Filament\Tables;
use Filament\Resources\Resource;
use Filament\Forms\Form;
use Filament\Tables\Table;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\BelongsToSelect;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Tables\Columns\TextColumn;

class DocResource extends Resource
{
    protected static ?string $model = Doc::class;
    protected static ?string $navigationIcon = 'heroicon-o-document';
    protected static ?string $navigationLabel = 'Docs';
    protected static ?string $navigationGroup = 'Content';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Select::make('space_id')->relationship('space', 'title')->required(),
            Select::make('user_id')->relationship('user', 'name')->required()->label('Uploader'),
            TextInput::make('title')->nullable()->maxLength(255),
            FileUpload::make('file_path')->directory('docs')->required(),
            Textarea::make('notes')->rows(3)->nullable(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table->columns([
            TextColumn::make('title')->limit(40),
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
            'index' => Pages\ListDocs::route('/'),
            'create' => Pages\CreateDoc::route('/create'),
            'edit' => Pages\EditDoc::route('/{record}/edit'),
        ];
    }
}
