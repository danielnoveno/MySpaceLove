<?php


namespace App\Filament\Resources;


use App\Filament\Resources\SpaceResource\Pages;
use App\Models\Space;
use Filament\Forms;
use Filament\Forms\Components\Card;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Tables;
use Filament\Tables\Columns\TextColumn;
use Filament\Resources\Resource;
use Filament\Resources\Pages\ListRecords;
use Filament\Resources\Pages\CreateRecord;
use Filament\Resources\Pages\EditRecord;


class SpaceResource extends Resource
{
    protected static ?string $model = Space::class;
    protected static ?string $navigationIcon = 'heroicon-o-users';
    protected static ?string $navigationLabel = 'Spaces';


    public static function form(Forms\Form $form): Forms\Form
    {
        return $form->schema([
            Card::make()->schema([
                TextInput::make('title')->required()->maxLength(255),
                TextInput::make('slug')->required()->unique(ignoreRecord: true),
                Textarea::make('bio')->rows(3),
                TextInput::make('user_one_id')->label('Owner 1 (user id)')->numeric()->required(),
                TextInput::make('user_two_id')->label('Owner 2 (user id)')->numeric()->nullable(),
                Toggle::make('is_public')->label('Public')->default(false),
            ])
        ]);
    }


    public static function table(Tables\Table $table): Tables\Table
    {
        return $table
            ->columns([
                TextColumn::make('id')->label('ID')->sortable(),
                TextColumn::make('title')->searchable()->sortable(),
                TextColumn::make('slug')->sortable(),
                TextColumn::make('userOne.name')->label('Owner 1'),
                TextColumn::make('userTwo.name')->label('Owner 2'),
                TextColumn::make('is_public')->boolean()->label('Public'),
            ])
            ->filters([])
            ->actions([
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
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
