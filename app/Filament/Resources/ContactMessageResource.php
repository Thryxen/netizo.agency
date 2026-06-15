<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ContactMessageResource\Pages;
use App\Models\ContactMessage;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Infolists;
use Filament\Infolists\Infolist;

class ContactMessageResource extends Resource
{
    protected static ?string $model = ContactMessage::class;

    protected static ?string $navigationIcon = 'heroicon-o-envelope';

    protected static ?string $navigationLabel = 'Wiadomosci';

    protected static ?string $modelLabel = 'Wiadomosc';

    protected static ?string $pluralModelLabel = 'Wiadomosci';

    protected static ?string $navigationGroup = 'Kontakt';

    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Dane kontaktowe')
                    ->schema([
                        Forms\Components\Grid::make(2)
                            ->schema([
                                Forms\Components\TextInput::make('name')
                                    ->label('Imie i nazwisko')
                                    ->disabled(),
                                Forms\Components\TextInput::make('email')
                                    ->label('Email')
                                    ->disabled(),
                            ]),
                        Forms\Components\TextInput::make('subject')
                            ->label('Temat')
                            ->disabled()
                            ->columnSpanFull(),
                    ]),
                Forms\Components\Section::make('Tresc wiadomosci')
                    ->schema([
                        Forms\Components\Textarea::make('message')
                            ->label('')
                            ->disabled()
                            ->rows(6)
                            ->columnSpanFull(),
                    ]),
            ]);
    }

    public static function infolist(Infolist $infolist): Infolist
    {
        return $infolist
            ->schema([
                Infolists\Components\Section::make('Dane kontaktowe')
                    ->schema([
                        Infolists\Components\Grid::make(2)
                            ->schema([
                                Infolists\Components\TextEntry::make('name')
                                    ->label('Imie i nazwisko'),
                                Infolists\Components\TextEntry::make('email')
                                    ->label('Email')
                                    ->copyable(),
                            ]),
                        Infolists\Components\TextEntry::make('subject')
                            ->label('Temat')
                            ->placeholder('Brak tematu'),
                        Infolists\Components\TextEntry::make('created_at')
                            ->label('Data wyslania')
                            ->dateTime('d.m.Y H:i'),
                    ]),
                Infolists\Components\Section::make('Tresc wiadomosci')
                    ->schema([
                        Infolists\Components\TextEntry::make('message')
                            ->label('')
                            ->prose(),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->label('Nadawca')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('email')
                    ->label('Email')
                    ->searchable()
                    ->copyable(),
                Tables\Columns\TextColumn::make('subject')
                    ->label('Temat')
                    ->searchable()
                    ->limit(30)
                    ->placeholder('Brak tematu'),
                Tables\Columns\TextColumn::make('message')
                    ->label('Wiadomosc')
                    ->limit(50)
                    ->tooltip(fn ($record) => $record->message),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Data')
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
                Tables\Actions\ViewAction::make(),
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
            'index' => Pages\ListContactMessages::route('/'),
            'view' => Pages\ViewContactMessage::route('/{record}'),
        ];
    }
}
