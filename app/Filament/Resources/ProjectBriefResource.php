<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ProjectBriefResource\Pages;
use App\Models\ProjectBrief;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Infolists;
use Filament\Infolists\Infolist;

class ProjectBriefResource extends Resource
{
    protected static ?string $model = ProjectBrief::class;

    protected static ?string $navigationIcon = 'heroicon-o-document-text';

    protected static ?string $navigationLabel = 'Briefy';

    protected static ?string $modelLabel = 'Brief';

    protected static ?string $pluralModelLabel = 'Briefy';

    protected static ?string $navigationGroup = 'Kontakt';

    protected static ?int $navigationSort = 2;

    // Mapowania wartości z formularza na czytelne etykiety
    protected static array $typeLabels = [
        'website' => 'Strona WWW',
        'webapp' => 'Aplikacja Web',
        'ecommerce' => 'E-commerce',
        'mobile' => 'Aplikacja Mobilna',
        'redesign' => 'Redesign',
        'other' => 'Inne',
    ];

    protected static array $featureLabels = [
        'auth' => 'Logowanie / Rejestracja',
        'social' => 'Social login',
        'roles' => 'Role i uprawnienia',
        'profiles' => 'Profile użytkowników',
        'payments' => 'Płatności online',
        'subscriptions' => 'Subskrypcje',
        'invoices' => 'Faktury',
        'cart' => 'Koszyk',
        'cms' => 'CMS',
        'admin' => 'Panel admina',
        'analytics' => 'Analityka',
        'reports' => 'Raporty',
        'api' => 'API zewnętrzne',
        'notifications' => 'Powiadomienia',
        'chat' => 'Chat',
        'email' => 'Email marketing',
        'booking' => 'Rezerwacje',
        'search' => 'Wyszukiwarka',
        'multilang' => 'Wielojęzyczność',
        'ai' => 'Funkcje AI',
        'maps' => 'Mapy',
        'upload' => 'Upload plików',
    ];

    protected static array $industryLabels = [
        'ecommerce' => 'E-commerce / Handel',
        'fintech' => 'Fintech / Finanse',
        'healthcare' => 'Healthcare / Medycyna',
        'education' => 'Edukacja / E-learning',
        'realestate' => 'Nieruchomości',
        'travel' => 'Turystyka / HoReCa',
        'logistics' => 'Logistyka / Transport',
        'saas' => 'SaaS / IT',
        'media' => 'Media / Rozrywka',
        'other' => 'Inna',
    ];

    protected static array $audienceLabels = [
        'b2c' => 'B2C - Klienci indywidualni',
        'b2b' => 'B2B - Firmy',
        'both' => 'B2B + B2C',
        'internal' => 'Użytkownicy wewnętrzni',
    ];

    protected static array $designLabels = [
        'yes' => 'Tak, mam (Figma / Sketch / XD)',
        'partial' => 'Częściowo (Szkice / inspiracje)',
        'no' => 'Nie mam (Potrzebuję projektu)',
    ];

    protected static array $timelineLabels = [
        'asap' => 'Pilne (ASAP)',
        '1-2' => '1-2 miesiące',
        '3-6' => '3-6 miesięcy',
        'flexible' => 'Elastyczny',
    ];

    protected static array $techLabels = [
        'react' => 'React',
        'next' => 'Next.js',
        'vue' => 'Vue.js',
        'node' => 'Node.js',
        'laravel' => 'Laravel',
        'python' => 'Python',
        'wordpress' => 'WordPress',
        'shopify' => 'Shopify',
        'nopreference' => 'Bez preferencji',
    ];

    protected static array $securityLabels = [
        'standard' => 'Standardowe (SSL)',
        'high' => 'Wysokie (2FA, szyfrowanie)',
        'enterprise' => 'Enterprise (GDPR, SOC2)',
    ];

    protected static array $hostingLabels = [
        'help' => 'Potrzebuję pomocy',
        'own' => 'Mam własny',
        'cloud' => 'Cloud (AWS/GCP/Azure)',
    ];

    protected static array $budgetLabels = [
        'small' => '1 - 5k PLN',
        'medium' => '5 - 15k PLN',
        'large' => '15 - 50k PLN',
        'enterprise' => '50k+ PLN',
        'unknown' => 'Do ustalenia',
    ];

    protected static array $cooperationLabels = [
        'fixed' => 'Fixed Price (Stała cena)',
        'hourly' => 'Time & Material (Godzinowo)',
        'dedicated' => 'Dedicated Team (Zespół)',
    ];

    protected static array $sourceLabels = [
        'google' => 'Google',
        'social' => 'Social media',
        'referral' => 'Polecenie',
        'clutch' => 'Clutch',
        'other' => 'Inne',
    ];

    protected static array $contactPrefLabels = [
        'email' => 'Email',
        'phone' => 'Telefon',
        'video' => 'Video call',
    ];

    public static function mapArrayLabels(array $values, array $labels): string
    {
        return collect($values)
            ->map(fn ($value) => $labels[$value] ?? $value)
            ->implode(', ');
    }

    public static function mapLabel(string $value, array $labels): string
    {
        return $labels[$value] ?? $value;
    }

    public static function infolist(Infolist $infolist): Infolist
    {
        return $infolist
            ->schema([
                Infolists\Components\Tabs::make('Brief')
                    ->tabs([
                        Infolists\Components\Tabs\Tab::make('Dane kontaktowe')
                            ->icon('heroicon-o-user')
                            ->schema([
                                Infolists\Components\Grid::make(2)
                                    ->schema([
                                        Infolists\Components\TextEntry::make('name')
                                            ->label('Imię i nazwisko'),
                                        Infolists\Components\TextEntry::make('email')
                                            ->label('Email')
                                            ->copyable(),
                                        Infolists\Components\TextEntry::make('phone')
                                            ->label('Telefon')
                                            ->copyable()
                                            ->placeholder('Nie podano'),
                                        Infolists\Components\TextEntry::make('company')
                                            ->label('Firma')
                                            ->placeholder('Nie podano'),
                                        Infolists\Components\TextEntry::make('position')
                                            ->label('Stanowisko')
                                            ->placeholder('Nie podano'),
                                        Infolists\Components\TextEntry::make('website')
                                            ->label('Strona WWW')
                                            ->url(fn ($state) => $state ? (str_starts_with($state, 'http') ? $state : 'https://'.$state) : null)
                                            ->openUrlInNewTab()
                                            ->placeholder('Nie podano'),
                                        Infolists\Components\TextEntry::make('source')
                                            ->label('Skąd o nas')
                                            ->formatStateUsing(fn ($state) => $state ? self::mapLabel($state, self::$sourceLabels) : null)
                                            ->placeholder('Nie podano'),
                                        Infolists\Components\TextEntry::make('contact_pref')
                                            ->label('Preferowany kontakt')
                                            ->getStateUsing(fn ($record) => $record->contact_pref && count($record->contact_pref) > 0 ? self::mapArrayLabels($record->contact_pref, self::$contactPrefLabels) : null)
                                            ->placeholder('Nie podano'),
                                    ]),
                                Infolists\Components\TextEntry::make('created_at')
                                    ->label('Data wysłania')
                                    ->dateTime('d.m.Y H:i'),
                            ]),
                        Infolists\Components\Tabs\Tab::make('Projekt')
                            ->icon('heroicon-o-briefcase')
                            ->schema([
                                Infolists\Components\Grid::make(2)
                                    ->schema([
                                        Infolists\Components\TextEntry::make('types')
                                            ->label('Typy projektu')
                                            ->getStateUsing(fn ($record) => $record->types && count($record->types) > 0 ? self::mapArrayLabels($record->types, self::$typeLabels) : null)
                                            ->placeholder('Nie wybrano'),
                                        Infolists\Components\TextEntry::make('features')
                                            ->label('Funkcjonalności')
                                            ->getStateUsing(fn ($record) => $record->features && count($record->features) > 0 ? self::mapArrayLabels($record->features, self::$featureLabels) : null)
                                            ->placeholder('Nie wybrano'),
                                        Infolists\Components\TextEntry::make('industry')
                                            ->label('Branża')
                                            ->formatStateUsing(fn ($state) => $state ? self::mapLabel($state, self::$industryLabels) : null)
                                            ->placeholder('Nie podano'),
                                        Infolists\Components\TextEntry::make('audience')
                                            ->label('Grupa docelowa')
                                            ->formatStateUsing(fn ($state) => $state ? self::mapLabel($state, self::$audienceLabels) : null)
                                            ->placeholder('Nie podano'),
                                        Infolists\Components\TextEntry::make('design')
                                            ->label('Projekt graficzny')
                                            ->formatStateUsing(fn ($state) => $state ? self::mapLabel($state, self::$designLabels) : null)
                                            ->placeholder('Nie podano'),
                                        Infolists\Components\TextEntry::make('timeline')
                                            ->label('Termin realizacji')
                                            ->formatStateUsing(fn ($state) => $state ? self::mapLabel($state, self::$timelineLabels) : null)
                                            ->placeholder('Nie podano'),
                                    ]),
                            ]),
                        Infolists\Components\Tabs\Tab::make('Technologia')
                            ->icon('heroicon-o-code-bracket')
                            ->schema([
                                Infolists\Components\Grid::make(2)
                                    ->schema([
                                        Infolists\Components\TextEntry::make('tech')
                                            ->label('Technologie')
                                            ->getStateUsing(fn ($record) => $record->tech && count($record->tech) > 0 ? self::mapArrayLabels($record->tech, self::$techLabels) : null)
                                            ->placeholder('Nie wybrano'),
                                        Infolists\Components\TextEntry::make('security')
                                            ->label('Bezpieczeństwo')
                                            ->formatStateUsing(fn ($state) => $state ? self::mapLabel($state, self::$securityLabels) : null)
                                            ->placeholder('Nie podano'),
                                        Infolists\Components\TextEntry::make('hosting')
                                            ->label('Hosting')
                                            ->formatStateUsing(fn ($state) => $state ? self::mapLabel($state, self::$hostingLabels) : null)
                                            ->placeholder('Nie podano'),
                                        Infolists\Components\TextEntry::make('integrations')
                                            ->label('Integracje')
                                            ->placeholder('Nie podano'),
                                    ]),
                            ]),
                        Infolists\Components\Tabs\Tab::make('Budżet')
                            ->icon('heroicon-o-currency-dollar')
                            ->schema([
                                Infolists\Components\Grid::make(2)
                                    ->schema([
                                        Infolists\Components\TextEntry::make('budget')
                                            ->label('Budżet')
                                            ->formatStateUsing(fn ($state) => $state ? self::mapLabel($state, self::$budgetLabels) : null)
                                            ->placeholder('Nie podano'),
                                        Infolists\Components\TextEntry::make('cooperation_model')
                                            ->label('Model współpracy')
                                            ->formatStateUsing(fn ($state) => $state ? self::mapLabel($state, self::$cooperationLabels) : null)
                                            ->placeholder('Nie podano'),
                                    ]),
                                Infolists\Components\TextEntry::make('notes')
                                    ->label('Dodatkowe uwagi')
                                    ->prose()
                                    ->placeholder('Brak uwag')
                                    ->columnSpanFull(),
                            ]),
                    ])
                    ->columnSpanFull(),
            ]);
    }

    public static function form(Form $form): Form
    {
        return $form->schema([]);
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
                Tables\Columns\TextColumn::make('company')
                    ->label('Firma')
                    ->searchable()
                    ->placeholder('—'),
                Tables\Columns\TextColumn::make('types')
                    ->label('Typ projektu')
                    ->getStateUsing(fn ($record) => $record->types && count($record->types) > 0 ? self::mapArrayLabels(array_slice($record->types, 0, 2), self::$typeLabels) . (count($record->types) > 2 ? '...' : '') : null)
                    ->wrap()
                    ->limit(50),
                Tables\Columns\TextColumn::make('budget')
                    ->label('Budżet')
                    ->formatStateUsing(fn ($state) => $state ? self::mapLabel($state, self::$budgetLabels) : null)
                    ->badge()
                    ->color('success')
                    ->placeholder('—'),
                Tables\Columns\TextColumn::make('timeline')
                    ->label('Termin')
                    ->formatStateUsing(fn ($state) => $state ? self::mapLabel($state, self::$timelineLabels) : null)
                    ->placeholder('—'),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Data')
                    ->dateTime('d.m.Y H:i')
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('budget')
                    ->label('Budżet')
                    ->options(self::$budgetLabels),
                Tables\Filters\SelectFilter::make('timeline')
                    ->label('Termin')
                    ->options(self::$timelineLabels),
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
            'index' => Pages\ListProjectBriefs::route('/'),
            'view' => Pages\ViewProjectBrief::route('/{record}'),
        ];
    }
}
