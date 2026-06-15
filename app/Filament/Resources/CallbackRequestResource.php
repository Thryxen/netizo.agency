<?php

namespace App\Filament\Resources;

use App\Filament\Resources\CallbackRequestResource\Pages;
use App\Models\CallbackRequest;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class CallbackRequestResource extends Resource
{
    protected static ?string $model = CallbackRequest::class;

    protected static ?string $navigationIcon = 'heroicon-o-phone';

    protected static ?string $navigationLabel = 'Prosba o kontakt';

    protected static ?string $modelLabel = 'Prosba o kontakt';

    protected static ?string $pluralModelLabel = 'Prosby o kontakt';

    protected static ?string $navigationGroup = 'Kontakt';

    protected static ?int $navigationSort = 3;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Dane kontaktowe')
                    ->schema([
                        Forms\Components\TextInput::make('phone')
                            ->label('Numer telefonu')
                            ->disabled(),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('phone')
                    ->label('Numer telefonu')
                    ->searchable()
                    ->copyable()
                    ->icon('heroicon-o-phone'),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Data zgloszenia')
                    ->dateTime('d.m.Y H:i')
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\Filter::make('created_at')
                    ->form([
                        Forms\Components\DatePicker::make('from')
                            ->label('Od'),
                        Forms\Components\DatePicker::make('until')
                            ->label('Do'),
                    ])
                    ->query(function ($query, array $data) {
                        return $query
                            ->when($data['from'], fn ($q) => $q->whereDate('created_at', '>=', $data['from']))
                            ->when($data['until'], fn ($q) => $q->whereDate('created_at', '<=', $data['until']));
                    }),
            ])
            ->actions([
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
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListCallbackRequests::route('/'),
        ];
    }
}
