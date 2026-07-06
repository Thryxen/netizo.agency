<?php

namespace App\Filament\Resources;

use App\Filament\Components\OptimizedImageUpload;
use App\Filament\Resources\ProjectResource\Pages;
use App\Models\Project;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Str;

class ProjectResource extends Resource
{
    protected static ?string $model = Project::class;

    protected static ?string $navigationIcon = 'heroicon-o-briefcase';

    protected static ?string $navigationLabel = 'Projekty';

    protected static ?string $modelLabel = 'Projekt';

    protected static ?string $pluralModelLabel = 'Projekty';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Tabs::make('Projekt')
                    ->tabs([
                        Forms\Components\Tabs\Tab::make('Podstawowe')
                            ->icon('heroicon-o-information-circle')
                            ->schema([
                                Forms\Components\Section::make('Informacje podstawowe')
                                    ->schema([
                                        Forms\Components\Grid::make(2)
                                            ->schema([
                                                Forms\Components\TextInput::make('title')
                                                    ->label('Nazwa projektu')
                                                    ->required()
                                                    ->maxLength(255)
                                                    ->live(onBlur: true)
                                                    ->afterStateUpdated(fn ($state, callable $set) => $set('slug', Str::slug($state))),
                                                Forms\Components\TextInput::make('slug')
                                                    ->label('Slug (URL)')
                                                    ->required()
                                                    ->maxLength(255)
                                                    ->unique(ignoreRecord: true),
                                            ]),
                                        Forms\Components\Grid::make(2)
                                            ->schema([
                                                Forms\Components\TextInput::make('url')
                                                    ->label('Adres URL projektu')
                                                    ->required()
                                                    ->maxLength(255)
                                                    ->placeholder('example.com'),
                                                Forms\Components\TextInput::make('category')
                                                    ->label('Kategoria')
                                                    ->required()
                                                    ->maxLength(255)
                                                    ->placeholder('np. E-commerce / Headless CMS'),
                                            ]),
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
                                                    ->helperText('Czy projekt jest widoczny na stronie'),
                                            ]),
                                    ]),
                                Forms\Components\Section::make('Opisy')
                                    ->schema([
                                        Forms\Components\Textarea::make('description')
                                            ->label('Krotki opis')
                                            ->required()
                                            ->rows(3)
                                            ->helperText('Wyswietlany na stronie glownej pod projektem'),
                                        Forms\Components\Textarea::make('full_description')
                                            ->label('Pelny opis')
                                            ->required()
                                            ->rows(5)
                                            ->helperText('Wyswietlany w modalu case study'),
                                    ]),
                            ]),
                        Forms\Components\Tabs\Tab::make('Zdjecia')
                            ->icon('heroicon-o-photo')
                            ->schema([
                                Forms\Components\Section::make('Zdjecia projektu')
                                    ->description('Wgraj dwa zdjecia: miniaturke do strony glownej i pelne zdjecie do modala. Zdjecia sa automatycznie konwertowane do formatu WebP (jakosc 95%) i optymalizowane pod wyswietlanie na stronie.')
                                    ->schema([
                                        OptimizedImageUpload::make('thumbnail_image')
                                            ->label('Miniaturka (strona glowna)')
                                            ->image()
                                            ->maxSize(51200)
                                            ->directory('projects/thumbnails')
                                            ->outputFormat('webp')
                                            ->quality(95)
                                            ->resizeMaxWidth(1600)
                                            ->columnSpanFull(),
                                        OptimizedImageUpload::make('full_image')
                                            ->label('Pelne zdjecie (modal case study)')
                                            ->image()
                                            ->maxSize(51200)
                                            ->directory('projects/full')
                                            ->outputFormat('webp')
                                            ->quality(95)
                                            ->resizeMaxWidth(1920)
                                            ->columnSpanFull(),
                                    ]),
                            ]),
                        Forms\Components\Tabs\Tab::make('Technologie')
                            ->icon('heroicon-o-code-bracket')
                            ->schema([
                                Forms\Components\Section::make('Stack technologiczny')
                                    ->schema([
                                        Forms\Components\TagsInput::make('tech_stack')
                                            ->label('Technologie')
                                            ->required()
                                            ->placeholder('Dodaj technologie...')
                                            ->helperText('Wpisz nazwy technologii i zatwierdz Enterem')
                                            ->suggestions([
                                                'React', 'Vue.js', 'Next.js', 'Nuxt.js', 'Angular',
                                                'Laravel', 'PHP', 'Node.js', 'Python', 'Django',
                                                'PostgreSQL', 'MySQL', 'MongoDB', 'Redis',
                                                'AWS', 'Vercel', 'Docker', 'Kubernetes',
                                                'GraphQL', 'REST API', 'WebSocket',
                                                'Tailwind CSS', 'TypeScript', 'JavaScript',
                                            ]),
                                    ]),
                            ]),
                        Forms\Components\Tabs\Tab::make('Metryki')
                            ->icon('heroicon-o-chart-bar')
                            ->schema([
                                Forms\Components\Section::make('Metryki projektu')
                                    ->description('Dodaj do 3 kluczowych metryk projektu')
                                    ->schema([
                                        Forms\Components\Repeater::make('metrics')
                                            ->label('')
                                            ->schema([
                                                Forms\Components\TextInput::make('value')
                                                    ->label('Wartosc')
                                                    ->required()
                                                    ->placeholder('np. +45%, 99.9%, 10K+'),
                                                Forms\Components\TextInput::make('label')
                                                    ->label('Etykieta')
                                                    ->required()
                                                    ->placeholder('np. Konwersja, Uptime, TPS'),
                                            ])
                                            ->columns(2)
                                            ->minItems(1)
                                            ->maxItems(3)
                                            ->defaultItems(3)
                                            ->reorderable()
                                            ->collapsible(),
                                    ]),
                            ]),
                        Forms\Components\Tabs\Tab::make('Wyzwania i Rozwiazania')
                            ->icon('heroicon-o-light-bulb')
                            ->schema([
                                Forms\Components\Section::make('Wyzwania')
                                    ->schema([
                                        Forms\Components\Repeater::make('challenges')
                                            ->label('')
                                            ->simple(
                                                Forms\Components\TextInput::make('challenge')
                                                    ->required()
                                                    ->placeholder('Opisz wyzwanie...')
                                            )
                                            ->minItems(1)
                                            ->maxItems(6)
                                            ->defaultItems(4)
                                            ->reorderable(),
                                    ]),
                                Forms\Components\Section::make('Rozwiazania')
                                    ->schema([
                                        Forms\Components\Repeater::make('solutions')
                                            ->label('')
                                            ->simple(
                                                Forms\Components\TextInput::make('solution')
                                                    ->required()
                                                    ->placeholder('Opisz rozwiazanie...')
                                            )
                                            ->minItems(1)
                                            ->maxItems(6)
                                            ->defaultItems(4)
                                            ->reorderable(),
                                    ]),
                            ]),
                    ])
                    ->columnSpanFull(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\ImageColumn::make('thumbnail_image')
                    ->label('Miniaturka')
                    ->circular(false)
                    ->width(80)
                    ->height(45),
                Tables\Columns\TextColumn::make('sort_order')
                    ->label('#')
                    ->sortable()
                    ->width(50),
                Tables\Columns\TextColumn::make('title')
                    ->label('Nazwa')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('category')
                    ->label('Kategoria')
                    ->searchable()
                    ->badge()
                    ->color('gray'),
                Tables\Columns\TextColumn::make('url')
                    ->label('URL')
                    ->searchable()
                    ->copyable()
                    ->limit(30),
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
                    ->trueLabel('Aktywne')
                    ->falseLabel('Nieaktywne')
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
            'index' => Pages\ListProjects::route('/'),
            'create' => Pages\CreateProject::route('/create'),
            'edit' => Pages\EditProject::route('/{record}/edit'),
        ];
    }
}
