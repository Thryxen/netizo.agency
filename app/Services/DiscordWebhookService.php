<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DiscordWebhookService
{
    protected ?string $webhookContact;

    protected ?string $webhookBrief;

    protected ?string $webhookCallback;

    protected ?string $webhookPartner;

    protected ?string $roleId;

    public function __construct()
    {
        $this->webhookContact = config('services.discord.webhook_contact');
        $this->webhookBrief = config('services.discord.webhook_brief');
        $this->webhookCallback = config('services.discord.webhook_callback');
        $this->webhookPartner = config('services.discord.webhook_partner');
        $this->roleId = config('services.discord.role_id');
    }

    protected function send(string $webhookUrl, string $title, array $fields, int $color = 0x5865F2): bool
    {
        if (empty($webhookUrl)) {
            Log::warning('Discord webhook URL is not configured');

            return false;
        }

        $embed = [
            'title' => $title,
            'color' => $color,
            'fields' => $fields,
            'timestamp' => now()->toIso8601String(),
            'footer' => [
                'text' => 'Netizo',
            ],
        ];

        $payload = [
            'embeds' => [$embed],
        ];

        if ($this->roleId) {
            $payload['content'] = "<@&{$this->roleId}>";
        }

        try {
            $response = Http::post($webhookUrl, $payload);

            if ($response->failed()) {
                Log::error('Discord webhook failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return false;
            }

            return true;
        } catch (\Exception $e) {
            Log::error('Discord webhook exception', [
                'message' => $e->getMessage(),
            ]);

            return false;
        }
    }

    public function sendBrief(array $data): bool
    {
        $typeLabels = [
            'website' => 'Strona WWW',
            'webapp' => 'Aplikacja Web',
            'ecommerce' => 'E-commerce',
            'mobile' => 'Aplikacja Mobilna',
            'redesign' => 'Redesign',
            'other' => 'Inne',
        ];

        $featureLabels = [
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

        $industryLabels = [
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

        $audienceLabels = [
            'b2c' => 'B2C - Klienci indywidualni',
            'b2b' => 'B2B - Firmy',
            'both' => 'B2B + B2C',
            'internal' => 'Użytkownicy wewnętrzni',
        ];

        $designLabels = [
            'yes' => 'Tak, mam (Figma / Sketch / XD)',
            'partial' => 'Częściowo (Szkice / inspiracje)',
            'no' => 'Nie mam (Potrzebuję projektu)',
        ];

        $timelineLabels = [
            'asap' => 'Pilne (ASAP)',
            '1-2' => '1-2 miesiące (Standardowy)',
            '3-6' => '3-6 miesięcy (Większy projekt)',
            'flexible' => 'Elastyczny (Do ustalenia)',
        ];

        $techLabels = [
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

        $securityLabels = [
            'standard' => 'Standardowe (SSL)',
            'high' => 'Wysokie (2FA, szyfrowanie)',
            'enterprise' => 'Enterprise (GDPR, SOC2)',
        ];

        $hostingLabels = [
            'help' => 'Potrzebuję pomocy',
            'own' => 'Mam własny',
            'cloud' => 'Cloud (AWS/GCP/Azure)',
        ];

        $budgetLabels = [
            'small' => '1 - 5k PLN',
            'medium' => '5 - 15k PLN',
            'large' => '15 - 50k PLN',
            'enterprise' => '50k+ PLN',
            'unknown' => 'Do ustalenia',
        ];

        $cooperationLabels = [
            'fixed' => 'Fixed Price (Stała cena)',
            'hourly' => 'Time & Material (Godzinowo)',
            'dedicated' => 'Dedicated Team (Zespół)',
        ];

        $sourceLabels = [
            'google' => 'Google',
            'social' => 'Social media',
            'referral' => 'Polecenie',
            'clutch' => 'Clutch',
            'other' => 'Inne',
        ];

        $contactPrefLabels = [
            'email' => 'Email',
            'phone' => 'Telefon',
            'video' => 'Video call',
        ];

        $types = $this->mapArray($data['types'] ?? [], $typeLabels);
        $features = $this->mapArray($data['features'] ?? [], $featureLabels);
        $tech = $this->mapArray($data['tech'] ?? [], $techLabels);
        $contactPref = $this->mapArray($data['contact_pref'] ?? [], $contactPrefLabels);

        $fields = [
            ['name' => 'Imię i nazwisko', 'value' => $data['name'] ?: '-', 'inline' => true],
            ['name' => 'Email', 'value' => $data['email'] ?: '-', 'inline' => true],
            ['name' => 'Telefon', 'value' => $data['phone'] ?: '-', 'inline' => true],
            ['name' => 'Firma', 'value' => $data['company'] ?: '-', 'inline' => true],
            ['name' => 'Stanowisko', 'value' => $data['position'] ?: '-', 'inline' => true],
            ['name' => 'Strona WWW', 'value' => $data['website'] ?: '-', 'inline' => true],
            ['name' => 'Typ projektu', 'value' => $types ?: '-', 'inline' => false],
            ['name' => 'Funkcjonalności', 'value' => $features ?: '-', 'inline' => false],
            ['name' => 'Branża', 'value' => $industryLabels[$data['industry']] ?? $data['industry'] ?: '-', 'inline' => true],
            ['name' => 'Grupa docelowa', 'value' => $audienceLabels[$data['audience']] ?? $data['audience'] ?: '-', 'inline' => true],
            ['name' => 'Projekt graficzny', 'value' => $designLabels[$data['design']] ?? $data['design'] ?: '-', 'inline' => false],
            ['name' => 'Termin realizacji', 'value' => $timelineLabels[$data['timeline']] ?? $data['timeline'] ?: '-', 'inline' => true],
            ['name' => 'Technologie', 'value' => $tech ?: '-', 'inline' => false],
            ['name' => 'Bezpieczeństwo', 'value' => $securityLabels[$data['security']] ?? $data['security'] ?: '-', 'inline' => true],
            ['name' => 'Hosting', 'value' => $hostingLabels[$data['hosting']] ?? $data['hosting'] ?: '-', 'inline' => true],
            ['name' => 'Integracje', 'value' => $data['integrations'] ?: '-', 'inline' => false],
            ['name' => 'Budżet', 'value' => $budgetLabels[$data['budget']] ?? $data['budget'] ?: '-', 'inline' => true],
            ['name' => 'Model współpracy', 'value' => $cooperationLabels[$data['cooperation_model']] ?? $data['cooperation_model'] ?: '-', 'inline' => true],
            ['name' => 'Preferowany kontakt', 'value' => $contactPref ?: '-', 'inline' => true],
            ['name' => 'Skąd o nas', 'value' => $sourceLabels[$data['source']] ?? $data['source'] ?: '-', 'inline' => true],
            ['name' => 'Uwagi', 'value' => $data['notes'] ?: '-', 'inline' => false],
        ];

        return $this->send($this->webhookBrief, 'Nowy Brief Projektu', $fields, 0x10B981);
    }

    protected function mapArray(array $values, array $labels): string
    {
        $mapped = array_map(fn ($v) => $labels[$v] ?? $v, $values);

        return implode(', ', $mapped);
    }

    public function sendContactMessage(array $data): bool
    {
        $subjectLabels = [
            'project' => 'Nowy projekt',
            'cooperation' => 'Współpraca',
            'career' => 'Kariera',
            'other' => 'Inne',
        ];

        $subject = $data['subject'] ? ($subjectLabels[$data['subject']] ?? $data['subject']) : '-';

        $fields = [
            ['name' => 'Imię i nazwisko', 'value' => $data['name'], 'inline' => true],
            ['name' => 'Email', 'value' => $data['email'], 'inline' => true],
            ['name' => 'Temat', 'value' => $subject, 'inline' => true],
            ['name' => 'Wiadomość', 'value' => $data['message'], 'inline' => false],
        ];

        return $this->send($this->webhookContact, 'Nowa wiadomość kontaktowa', $fields, 0x3B82F6);
    }

    public function sendCallbackRequest(string $phone): bool
    {
        $fields = [
            ['name' => 'Numer telefonu', 'value' => $phone, 'inline' => false],
        ];

        return $this->send($this->webhookCallback, 'Prośba o telefon', $fields, 0xF59E0B);
    }

    public function sendPartnerApplication(array $data): bool
    {
        $typeLabels = [
            'accounting' => 'Biuro rachunkowe',
            'marketing' => 'Agencja marketingowa',
            'creative' => 'Grafik, fotograf, copywriter',
            'consultant' => 'Doradca, konsultant',
            'client' => 'Klient Netizo',
            'other' => 'Inne',
        ];

        $fields = [
            ['name' => 'Imię i nazwisko', 'value' => $data['name'], 'inline' => true],
            ['name' => 'Email', 'value' => $data['email'], 'inline' => true],
            ['name' => 'Telefon', 'value' => ($data['phone'] ?? null) ?: '-', 'inline' => true],
            ['name' => 'Kim jest', 'value' => $typeLabels[$data['partner_type']] ?? $data['partner_type'], 'inline' => true],
            ['name' => 'Kogo chce polecać', 'value' => ($data['message'] ?? null) ?: '-', 'inline' => false],
        ];

        return $this->send($this->webhookPartner ?? '', 'Nowe zgłoszenie do programu partnerskiego', $fields, 0x8B5CF6);
    }
}
