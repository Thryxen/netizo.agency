<?php

use App\Http\Requests\StorePartnerApplicationRequest;
use App\Models\PartnerApplication;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;

use function Pest\Laravel\assertDatabaseCount;
use function Pest\Laravel\assertDatabaseHas;

const PARTNER_WEBHOOK_URL = 'https://discord.test/webhooks/partner';

/**
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function validPartnerApplicationPayload(array $overrides = []): array
{
    return array_merge([
        'name' => 'Anna Kowalska',
        'email' => 'anna@biuro.pl',
        'phone' => '+48 600 100 200',
        'partner_type' => 'accounting',
        'message' => 'Prowadzę biuro rachunkowe, kilku klientów zakłada teraz firmy.',
    ], $overrides);
}

beforeEach(function () {
    config([
        'services.discord.webhook_partner' => PARTNER_WEBHOOK_URL,
        'services.discord.role_id' => null,
    ]);

    $this->discordResponseStatus = 204;

    Http::preventStrayRequests();
    Http::fake(fn () => Http::response(status: $this->discordResponseStatus));
});

it('stores the application, notifies Discord and redirects back', function () {
    $this->from('/partnerzy')
        ->post(route('partner-applications.store'), validPartnerApplicationPayload())
        ->assertRedirect('/partnerzy')
        ->assertSessionHasNoErrors();

    assertDatabaseHas('partner_applications', [
        'name' => 'Anna Kowalska',
        'email' => 'anna@biuro.pl',
        'phone' => '+48 600 100 200',
        'partner_type' => 'accounting',
        'message' => 'Prowadzę biuro rachunkowe, kilku klientów zakłada teraz firmy.',
    ]);

    Http::assertSentCount(1);
    Http::assertSent(function (Request $request): bool {
        $embed = $request['embeds'][0];

        return $request->url() === PARTNER_WEBHOOK_URL
            && $embed['title'] === 'Nowe zgłoszenie do programu partnerskiego'
            && $embed['fields'][0]['value'] === 'Anna Kowalska'
            && $embed['fields'][1]['value'] === 'anna@biuro.pl'
            && $embed['fields'][2]['value'] === '+48 600 100 200'
            && $embed['fields'][3]['value'] === 'Biuro rachunkowe'
            && $embed['fields'][4]['value'] === 'Prowadzę biuro rachunkowe, kilku klientów zakłada teraz firmy.';
    });
});

it('accepts an application without the optional phone and message', function (array $overrides) {
    $this->from('/partnerzy')
        ->post(route('partner-applications.store'), validPartnerApplicationPayload($overrides))
        ->assertRedirect('/partnerzy')
        ->assertSessionHasNoErrors();

    $application = PartnerApplication::sole();

    expect($application->phone)->toBeNull()
        ->and($application->message)->toBeNull();

    Http::assertSent(fn (Request $request): bool => $request['embeds'][0]['fields'][2]['value'] === '-'
        && $request['embeds'][0]['fields'][4]['value'] === '-');
})->with([
    'empty strings' => [['phone' => '', 'message' => '']],
    'left out' => [['phone' => null, 'message' => null]],
]);

it('accepts every partner type from the form', function (string $type) {
    $this->from('/partnerzy')
        ->post(route('partner-applications.store'), validPartnerApplicationPayload(['partner_type' => $type]))
        ->assertSessionHasNoErrors();

    assertDatabaseHas('partner_applications', ['partner_type' => $type]);
})->with(StorePartnerApplicationRequest::PARTNER_TYPES);

it('keeps the partner types in step with the form options', function () {
    $options = file_get_contents(resource_path('js/components/partners/partner-options.ts'));

    preg_match_all("/value: '([a-z]+)'/", $options, $matches);

    expect($matches[1])->toBe(StorePartnerApplicationRequest::PARTNER_TYPES);
});

it('rejects invalid input with a Polish message', function (array $overrides, string $field, string $message) {
    $this->from('/partnerzy')
        ->post(route('partner-applications.store'), validPartnerApplicationPayload($overrides))
        ->assertRedirect('/partnerzy')
        ->assertSessionHasErrors([$field => $message]);

    assertDatabaseCount('partner_applications', 0);
    Http::assertNothingSent();
})->with([
    'missing name' => [['name' => ''], 'name', 'Imię i nazwisko jest wymagane.'],
    'too short name' => [['name' => 'A'], 'name', 'Imię i nazwisko musi mieć co najmniej 2 znaki.'],
    'too long name' => [['name' => str_repeat('a', 256)], 'name', 'Imię i nazwisko może mieć maksymalnie 255 znaków.'],
    'name as array' => [['name' => ['Anna', 'Kowalska']], 'name', 'Podaj poprawne imię i nazwisko.'],
    'missing email' => [['email' => ''], 'email', 'Adres e-mail jest wymagany.'],
    'invalid email' => [['email' => 'to-nie-email'], 'email', 'Podaj poprawny adres e-mail.'],
    'too long email' => [['email' => str_repeat('a', 250).'@firma.pl'], 'email', 'Adres e-mail może mieć maksymalnie 255 znaków.'],
    'too short phone' => [['phone' => '600'], 'phone', 'Podaj poprawny numer telefonu.'],
    'phone as array' => [['phone' => ['600', '100']], 'phone', 'Podaj poprawny numer telefonu.'],
    'missing partner type' => [['partner_type' => ''], 'partner_type', 'Wybierz, kim jesteś.'],
    'unknown partner type' => [['partner_type' => 'influencer'], 'partner_type', 'Wybierz, kim jesteś.'],
    'partner type as array' => [['partner_type' => ['accounting']], 'partner_type', 'Wybierz, kim jesteś.'],
    'too long message' => [['message' => str_repeat('a', 2001)], 'message', 'Wiadomość może mieć maksymalnie 2000 znaków.'],
    'message as array' => [['message' => ['Znam', 'firmy']], 'message', 'Podaj poprawną treść.'],
]);

it('accepts a message of exactly 2000 characters', function () {
    $this->from('/partnerzy')
        ->post(route('partner-applications.store'), validPartnerApplicationPayload(['message' => str_repeat('a', 2000)]))
        ->assertSessionHasNoErrors();

    assertDatabaseCount('partner_applications', 1);
});

it('ignores fields the form does not send', function () {
    $this->from('/partnerzy')
        ->post(route('partner-applications.store'), validPartnerApplicationPayload(['id' => 999, 'created_at' => '2001-01-01 00:00:00']))
        ->assertSessionHasNoErrors();

    $application = PartnerApplication::sole();

    expect($application->id)->not->toBe(999)
        ->and($application->created_at->year)->toBe(now()->year);
});

it('still stores the application when the Discord webhook fails', function () {
    $this->discordResponseStatus = 500;

    $this->from('/partnerzy')
        ->post(route('partner-applications.store'), validPartnerApplicationPayload())
        ->assertRedirect('/partnerzy')
        ->assertSessionHasNoErrors();

    assertDatabaseCount('partner_applications', 1);
});

it('stores the application when no Discord webhook is configured', function () {
    config(['services.discord.webhook_partner' => null]);

    $this->from('/partnerzy')
        ->post(route('partner-applications.store'), validPartnerApplicationPayload())
        ->assertRedirect('/partnerzy')
        ->assertSessionHasNoErrors();

    assertDatabaseCount('partner_applications', 1);
    Http::assertNothingSent();
});

it('shares the forms rate limit of 10 submissions per minute per IP', function () {
    foreach (range(1, 10) as $attempt) {
        $this->from('/partnerzy')
            ->post(route('partner-applications.store'), validPartnerApplicationPayload())
            ->assertSessionHasNoErrors();
    }

    $this->from('/partnerzy')
        ->post(route('partner-applications.store'), validPartnerApplicationPayload())
        ->assertRedirect('/partnerzy')
        ->assertSessionHasErrors(['form' => 'Zbyt wiele prób. Spróbuj ponownie za minutę.']);

    assertDatabaseCount('partner_applications', 10);
    Http::assertSentCount(10);
});
