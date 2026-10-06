<?php

use App\Models\ProjectBrief;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;

use function Pest\Laravel\assertDatabaseCount;

const BRIEF_WEBHOOK_URL = 'https://discord.test/webhooks/brief';

/**
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function validProjectBriefPayload(array $overrides = []): array
{
    return array_merge([
        'types' => ['website', 'ecommerce'],
        'features' => ['auth', 'payments', 'cms'],
        'industry' => 'fintech',
        'audience' => 'b2b',
        'design' => 'partial',
        'timeline' => '1-2',
        'tech' => ['laravel', 'react'],
        'security' => 'high',
        'hosting' => 'cloud',
        'integrations' => 'Integracja z systemem ERP i bramką płatności.',
        'budget' => 'medium',
        'cooperation_model' => 'fixed',
        'notes' => 'Chcemy wystartować przed sezonem.',
        'name' => 'Anna Nowak',
        'email' => 'anna@firma.pl',
        'phone' => '+48 600 700 800',
        'company' => 'Firma Sp. z o.o.',
        'position' => 'CEO',
        'website' => 'https://firma.pl',
        'source' => 'referral',
        'contact_pref' => ['email', 'video'],
        'privacy' => true,
    ], $overrides);
}

/**
 * @return array<string, mixed>
 */
function minimalProjectBriefPayload(): array
{
    return [
        'types' => ['webapp'],
        'name' => 'Anna Nowak',
        'email' => 'anna@firma.pl',
        'privacy' => true,
    ];
}

beforeEach(function () {
    config([
        'services.discord.webhook_brief' => BRIEF_WEBHOOK_URL,
        'services.discord.role_id' => null,
    ]);

    $this->discordResponseStatus = 204;

    Http::preventStrayRequests();
    Http::fake(fn () => Http::response(status: $this->discordResponseStatus));
});

it('stores the full brief, notifies Discord and redirects back', function () {
    $this->from('/')
        ->post(route('project-briefs.store'), validProjectBriefPayload())
        ->assertRedirect('/')
        ->assertSessionHasNoErrors();

    $brief = ProjectBrief::sole();

    expect($brief->only([
        'types', 'features', 'industry', 'audience', 'design', 'timeline',
        'tech', 'security', 'hosting', 'integrations', 'budget', 'cooperation_model', 'notes',
        'name', 'email', 'phone', 'company', 'position', 'website', 'source', 'contact_pref',
    ]))->toBe([
        'types' => ['website', 'ecommerce'],
        'features' => ['auth', 'payments', 'cms'],
        'industry' => 'fintech',
        'audience' => 'b2b',
        'design' => 'partial',
        'timeline' => '1-2',
        'tech' => ['laravel', 'react'],
        'security' => 'high',
        'hosting' => 'cloud',
        'integrations' => 'Integracja z systemem ERP i bramką płatności.',
        'budget' => 'medium',
        'cooperation_model' => 'fixed',
        'notes' => 'Chcemy wystartować przed sezonem.',
        'name' => 'Anna Nowak',
        'email' => 'anna@firma.pl',
        'phone' => '+48 600 700 800',
        'company' => 'Firma Sp. z o.o.',
        'position' => 'CEO',
        'website' => 'https://firma.pl',
        'source' => 'referral',
        'contact_pref' => ['email', 'video'],
    ]);

    Http::assertSentCount(1);
    Http::assertSent(function (Request $request): bool {
        $embed = $request['embeds'][0];
        $fields = collect($embed['fields'])->pluck('value', 'name');

        return $request->url() === BRIEF_WEBHOOK_URL
            && $embed['title'] === 'Nowy Brief Projektu'
            && $fields['Imię i nazwisko'] === 'Anna Nowak'
            && $fields['Email'] === 'anna@firma.pl'
            && $fields['Typ projektu'] === 'Strona WWW, E-commerce'
            && $fields['Funkcjonalności'] === 'Logowanie / Rejestracja, Płatności online, CMS'
            && $fields['Branża'] === 'Fintech / Finanse'
            && $fields['Termin realizacji'] === '1-2 miesiące (Standardowy)'
            && $fields['Technologie'] === 'Laravel, React'
            && $fields['Budżet'] === '5 - 15k PLN'
            && $fields['Preferowany kontakt'] === 'Email, Video call'
            && $fields['Skąd o nas'] === 'Polecenie';
    });
});

it('does not persist the privacy consent', function () {
    $this->from('/')
        ->post(route('project-briefs.store'), validProjectBriefPayload())
        ->assertSessionHasNoErrors();

    expect(ProjectBrief::sole()->getAttributes())->not->toHaveKey('privacy');
});

it('stores a minimal brief with empty optional fields', function () {
    $this->from('/')
        ->post(route('project-briefs.store'), minimalProjectBriefPayload())
        ->assertRedirect('/')
        ->assertSessionHasNoErrors();

    $brief = ProjectBrief::sole();

    expect($brief->types)->toBe(['webapp'])
        ->and($brief->features)->toBe([])
        ->and($brief->tech)->toBe([])
        ->and($brief->contact_pref)->toBe([])
        ->and($brief->industry)->toBe('')
        ->and($brief->notes)->toBe('')
        ->and($brief->phone)->toBe('');

    Http::assertSent(function (Request $request): bool {
        $fields = collect($request['embeds'][0]['fields'])->pluck('value', 'name');

        return $fields['Typ projektu'] === 'Aplikacja Web'
            && $fields['Funkcjonalności'] === '-'
            && $fields['Branża'] === '-'
            && $fields['Telefon'] === '-';
    });
});

it('accepts empty strings and empty arrays for optional fields', function () {
    $payload = validProjectBriefPayload([
        'features' => [],
        'tech' => [],
        'contact_pref' => [],
        'industry' => '',
        'audience' => '',
        'design' => '',
        'timeline' => '',
        'security' => '',
        'hosting' => '',
        'integrations' => '',
        'budget' => '',
        'cooperation_model' => '',
        'notes' => '',
        'phone' => '',
        'company' => '',
        'position' => '',
        'website' => '',
        'source' => '',
    ]);

    $this->from('/')
        ->post(route('project-briefs.store'), $payload)
        ->assertSessionHasNoErrors();

    assertDatabaseCount('project_briefs', 1);
});

it('accepts every option value from the brief form', function () {
    $payload = validProjectBriefPayload([
        'types' => ['website', 'webapp', 'ecommerce', 'mobile', 'redesign', 'other'],
        'features' => [
            'auth', 'social', 'roles', 'profiles', 'payments', 'subscriptions', 'invoices', 'cart',
            'cms', 'admin', 'analytics', 'reports', 'api', 'notifications', 'chat', 'email',
            'booking', 'search', 'multilang', 'ai', 'maps', 'upload',
        ],
        'tech' => ['react', 'next', 'vue', 'node', 'laravel', 'python', 'wordpress', 'shopify', 'nopreference'],
        'contact_pref' => ['email', 'phone', 'video'],
    ]);

    $this->from('/')
        ->post(route('project-briefs.store'), $payload)
        ->assertSessionHasNoErrors();

    assertDatabaseCount('project_briefs', 1);
});

it('accepts each single-choice option value', function (string $field, string $value) {
    $this->from('/')
        ->post(route('project-briefs.store'), validProjectBriefPayload([$field => $value]))
        ->assertSessionHasNoErrors();

    expect(ProjectBrief::sole()->{$field})->toBe($value);
})->with(function (): array {
    $options = [
        'industry' => ['ecommerce', 'fintech', 'healthcare', 'education', 'realestate', 'travel', 'logistics', 'saas', 'media', 'other'],
        'audience' => ['b2c', 'b2b', 'both', 'internal'],
        'design' => ['yes', 'partial', 'no'],
        'timeline' => ['asap', '1-2', '3-6', 'flexible'],
        'security' => ['standard', 'high', 'enterprise'],
        'hosting' => ['help', 'own', 'cloud'],
        'budget' => ['small', 'medium', 'large', 'enterprise', 'unknown'],
        'cooperation_model' => ['fixed', 'hourly', 'dedicated'],
        'source' => ['google', 'social', 'referral', 'clutch', 'other'],
    ];

    $cases = [];

    foreach ($options as $field => $values) {
        foreach ($values as $value) {
            $cases["{$field} {$value}"] = [$field, $value];
        }
    }

    return $cases;
});

it('normalizes selected option lists before storing them', function () {
    $this->from('/')
        ->post(route('project-briefs.store'), validProjectBriefPayload([
            'types' => ['first' => 'website', 'second' => 'website', 'third' => 'mobile'],
        ]))
        ->assertSessionHasNoErrors();

    expect(ProjectBrief::sole()->types)->toBe(['website', 'mobile']);
});

it('rejects invalid input with a Polish message', function (array $overrides, string $field, string $message) {
    $this->from('/')
        ->post(route('project-briefs.store'), validProjectBriefPayload($overrides))
        ->assertRedirect('/')
        ->assertSessionHasErrors([$field => $message]);

    assertDatabaseCount('project_briefs', 0);
    Http::assertNothingSent();
})->with([
    'no project type' => [['types' => []], 'types', 'Wybierz przynajmniej jeden typ projektu.'],
    'types as string' => [['types' => 'website'], 'types', 'Wybierz przynajmniej jeden typ projektu.'],
    'unknown project type' => [['types' => ['website', 'blog']], 'types', 'Wybierz typ projektu z listy.'],
    'nested project type' => [['types' => [['website']]], 'types', 'Wybierz typ projektu z listy.'],
    'unknown feature' => [['features' => ['auth', 'crypto']], 'features', 'Wybierz funkcjonalności z listy.'],
    'features as string' => [['features' => 'auth'], 'features', 'Wybierz funkcjonalności z listy.'],
    'unknown tech' => [['tech' => ['cobol']], 'tech', 'Wybierz technologie z listy.'],
    'unknown contact preference' => [['contact_pref' => ['fax']], 'contact_pref', 'Wybierz preferowaną formę kontaktu z listy.'],
    'unknown industry' => [['industry' => 'mining'], 'industry', 'Wybierz branżę z listy.'],
    'industry as array' => [['industry' => ['fintech']], 'industry', 'Wybierz branżę z listy.'],
    'unknown audience' => [['audience' => 'c2c'], 'audience', 'Wybierz grupę docelową z listy.'],
    'unknown design' => [['design' => 'maybe'], 'design', 'Wybierz jedną z dostępnych opcji projektu graficznego.'],
    'unknown timeline' => [['timeline' => 'tomorrow'], 'timeline', 'Wybierz termin z listy.'],
    'unknown security' => [['security' => 'none'], 'security', 'Wybierz poziom bezpieczeństwa z listy.'],
    'unknown hosting' => [['hosting' => 'basement'], 'hosting', 'Wybierz opcję hostingu z listy.'],
    'unknown budget' => [['budget' => 'huge'], 'budget', 'Wybierz budżet z listy.'],
    'unknown cooperation model' => [['cooperation_model' => 'free'], 'cooperation_model', 'Wybierz model współpracy z listy.'],
    'unknown source' => [['source' => 'tv'], 'source', 'Wybierz źródło z listy.'],
    'too long integrations' => [['integrations' => str_repeat('a', 5001)], 'integrations', 'Opis integracji może mieć maksymalnie 5000 znaków.'],
    'too long notes' => [['notes' => str_repeat('a', 5001)], 'notes', 'Dodatkowe informacje mogą mieć maksymalnie 5000 znaków.'],
    'missing name' => [['name' => ''], 'name', 'Imię i nazwisko jest wymagane.'],
    'too short name' => [['name' => 'A'], 'name', 'Imię i nazwisko musi mieć co najmniej 2 znaki.'],
    'too long name' => [['name' => str_repeat('a', 256)], 'name', 'Imię i nazwisko może mieć maksymalnie 255 znaków.'],
    'name as array' => [['name' => ['Anna', 'Nowak']], 'name', 'Podaj poprawne imię i nazwisko.'],
    'missing email' => [['email' => ''], 'email', 'Adres e-mail jest wymagany.'],
    'invalid email' => [['email' => 'anna-at-firma'], 'email', 'Podaj poprawny adres e-mail.'],
    'too long email' => [['email' => str_repeat('a', 250).'@firma.pl'], 'email', 'Adres e-mail może mieć maksymalnie 255 znaków.'],
    'too long phone' => [['phone' => str_repeat('1', 256)], 'phone', 'Numer telefonu może mieć maksymalnie 255 znaków.'],
    'too long company' => [['company' => str_repeat('a', 256)], 'company', 'Nazwa firmy może mieć maksymalnie 255 znaków.'],
    'too long position' => [['position' => str_repeat('a', 256)], 'position', 'Stanowisko może mieć maksymalnie 255 znaków.'],
    'too long website' => [['website' => 'https://'.str_repeat('a', 250).'.pl'], 'website', 'Adres strony WWW może mieć maksymalnie 255 znaków.'],
    'privacy not accepted' => [['privacy' => false], 'privacy', 'Musisz zaakceptować politykę prywatności.'],
    'privacy missing' => [['privacy' => null], 'privacy', 'Musisz zaakceptować politykę prywatności.'],
    'privacy as random string' => [['privacy' => 'maybe'], 'privacy', 'Musisz zaakceptować politykę prywatności.'],
]);

it('rejects a brief without privacy consent field at all', function () {
    $payload = validProjectBriefPayload();
    unset($payload['privacy']);

    $this->from('/')
        ->post(route('project-briefs.store'), $payload)
        ->assertSessionHasErrors(['privacy' => 'Musisz zaakceptować politykę prywatności.']);

    assertDatabaseCount('project_briefs', 0);
});

it('rejects a brief without project types at all', function () {
    $payload = validProjectBriefPayload();
    unset($payload['types']);

    $this->from('/')
        ->post(route('project-briefs.store'), $payload)
        ->assertSessionHasErrors(['types' => 'Wybierz przynajmniej jeden typ projektu.']);

    assertDatabaseCount('project_briefs', 0);
});

it('accepts a JSON-encoded payload', function () {
    $this->from('/')
        ->postJson(route('project-briefs.store'), validProjectBriefPayload())
        ->assertRedirect('/');

    assertDatabaseCount('project_briefs', 1);
});

it('still stores the brief when the Discord webhook fails', function () {
    $this->discordResponseStatus = 500;

    $this->from('/')
        ->post(route('project-briefs.store'), validProjectBriefPayload())
        ->assertRedirect('/')
        ->assertSessionHasNoErrors();

    assertDatabaseCount('project_briefs', 1);
});

it('rate limits submissions to 10 per minute per IP', function () {
    foreach (range(1, 10) as $attempt) {
        $this->from('/')
            ->post(route('project-briefs.store'), minimalProjectBriefPayload())
            ->assertSessionHasNoErrors();
    }

    $this->from('/')
        ->post(route('project-briefs.store'), minimalProjectBriefPayload())
        ->assertRedirect('/')
        ->assertSessionHasErrors(['form' => 'Zbyt wiele prób. Spróbuj ponownie za minutę.']);

    assertDatabaseCount('project_briefs', 10);
    Http::assertSentCount(10);
});
