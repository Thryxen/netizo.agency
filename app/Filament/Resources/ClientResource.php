<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ClientResource\Pages;
use App\Models\Client;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class ClientResource extends Resource
{
    protected static ?string $model = Client::class;

    protected static ?string $navigationIcon = 'heroicon-o-building-office';

    protected static ?string $navigationLabel = 'Klienci';

    protected static ?string $modelLabel = 'Klient';

    protected static ?string $pluralModelLabel = 'Klienci';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Informacje o kliencie')
                    ->schema([
                        Forms\Components\TextInput::make('name')
                            ->label('Nazwa klienta')
                            ->required()
                            ->maxLength(255)
                            ->placeholder('np. CloudInc'),
                        Forms\Components\TextInput::make('url')
                            ->label('Link (opcjonalnie)')
                            ->url()
                            ->maxLength(255)
                            ->placeholder('https://example.com')
                            ->helperText('Jezeli pusty, nazwa klienta nie bedzie linkiem'),
                        Forms\Components\Grid::make(2)
                            ->schema([
                                Forms\Components\TextInput::make('sort_order')
                                    ->label('Kolejnosc')
                                    ->numeric()
                                    ->default(0)
                                    ->helperText('Mniejsza liczba = wyzej na liscie'),
                                Forms\Components\Toggle::make('is_active')
                                    ->label('Aktywny')
                                    ->default(true)
                                    ->helperText('Czy klient jest widoczny na stronie'),
                            ]),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('sort_order')
                    ->label('#')
                    ->sortable()
                    ->width(50),
                Tables\Columns\TextColumn::make('name')
                    ->label('Nazwa')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('url')
                    ->label('Link')
                    ->searchable()
                    ->copyable()
                    ->limit(40)
                    ->placeholder('Brak linku'),
                Tables\Columns\IconColumn::make('is_active')
                    ->label('Aktywny')
                    ->boolean()
                    ->trueIcon('heroicon-o-check-circle')
                    ->falseIcon('heroicon-o-x-circle'),
                Tables\Columns\TextColumn::make('updated_at')
                    ->label('Aktualizacja')
                    ->dateTime('d.m.Y H:i')
                    ->sortable(),
            ])
            ->defaultSort('sort_order')
            ->reorderable('sort_order')
            ->filters([
                Tables\Filters\TernaryFilter::make('is_active')
                    ->label('Aktywny')
                    ->boolean()
                    ->trueLabel('Aktywni')
                    ->falseLabel('Nieaktywni')
                    ->native(false),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
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
            'index' => Pages\ListClients::route('/'),
            'create' => Pages\CreateClient::route('/create'),
            'edit' => Pages\EditClient::route('/{record}/edit'),
        ];
    }
}
