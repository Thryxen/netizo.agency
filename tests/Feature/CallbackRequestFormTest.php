<?php

use App\Models\CallbackRequest;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;

use function Pest\Laravel\assertDatabaseCount;
use function Pest\Laravel\assertDatabaseHas;

const CALLBACK_WEBHOOK_URL = 'https://discord.test/webhooks/callback';

beforeEach(function () {
    config([
        'services.discord.webhook_callback' => CALLBACK_WEBHOOK_URL,
        'services.discord.role_id' => null,
    ]);

    $this->discordResponseStatus = 204;

    Http::preventStrayRequests();
    Http::fake(fn () => Http::response(status: $this->discordResponseStatus));
});

it('stores the callback request, notifies Discord and redirects back', function () {
    $this->from('/')
        ->post(route('callback-requests.store'), ['phone' => '+48 884 343 924'])
        ->assertRedirect('/')
        ->assertSessionHasNoErrors();

    assertDatabaseHas('callback_requests', ['phone' => '+48 884 343 924']);

    Http::assertSentCount(1);
    Http::assertSent(function (Request $request): bool {
        $embed = $request['embeds'][0];

        return $request->url() === CALLBACK_WEBHOOK_URL
            && $embed['title'] === 'Prośba o telefon'
            && $embed['fields'][0]['value'] === '+48 884 343 924';
    });
});

it('mentions the configured Discord role', function () {
    config(['services.discord.role_id' => '123456789']);

    $this->from('/')
        ->post(route('callback-requests.store'), ['phone' => '884343924'])
        ->assertSessionHasNoErrors();

    Http::assertSent(fn (Request $request): bool => $request['content'] === '<@&123456789>');
});

it('trims surrounding whitespace before storing the number', function () {
    $this->from('/')
        ->post(route('callback-requests.store'), ['phone' => '  884343924  '])
        ->assertSessionHasNoErrors();

    expect(CallbackRequest::sole()->phone)->toBe('884343924');
});

it('rejects invalid input with a Polish message', function (array $payload, string $message) {
    $this->from('/')
        ->post(route('callback-requests.store'), $payload)
        ->assertRedirect('/')
        ->assertSessionHasErrors(['phone' => $message]);

    assertDatabaseCount('callback_requests', 0);
    Http::assertNothingSent();
})->with([
    'missing phone' => [[], 'Numer telefonu jest wymagany.'],
    'empty phone' => [['phone' => ''], 'Numer telefonu jest wymagany.'],
    'whitespace only' => [['phone' => '      '], 'Numer telefonu jest wymagany.'],
    'too short phone' => [['phone' => '12345678'], 'Podaj poprawny numer telefonu.'],
    'too long phone' => [['phone' => str_repeat('1', 256)], 'Podaj poprawny numer telefonu.'],
    'phone as array' => [['phone' => ['884', '343', '924']], 'Podaj poprawny numer telefonu.'],
]);

it('still stores the request when the Discord webhook fails', function () {
    $this->discordResponseStatus = 500;

    $this->from('/')
        ->post(route('callback-requests.store'), ['phone' => '884343924'])
        ->assertRedirect('/')
        ->assertSessionHasNoErrors();

    assertDatabaseCount('callback_requests', 1);
});

it('rate limits submissions to 10 per minute per IP', function () {
    foreach (range(1, 10) as $attempt) {
        $this->from('/')
            ->post(route('callback-requests.store'), ['phone' => '884343924'])
            ->assertSessionHasNoErrors();
    }

    $this->from('/')
        ->post(route('callback-requests.store'), ['phone' => '884343924'])
        ->assertRedirect('/')
        ->assertSessionHasErrors(['form' => 'Zbyt wiele prób. Spróbuj ponownie za minutę.']);

    assertDatabaseCount('callback_requests', 10);
    Http::assertSentCount(10);
});

it('stores a callback request sent from the English site with its language', function () {
    $this->from('/en')
        ->post(route('en.callback-requests.store'), ['phone' => '+44 20 7946 0958'])
        ->assertRedirect('/en')
        ->assertSessionHasNoErrors();

    expect(route('en.callback-requests.store'))->toEndWith('/en/callback');

    assertDatabaseHas('callback_requests', ['phone' => '+44 20 7946 0958', 'locale' => 'en']);

    Http::assertSent(function (Request $request): bool {
        $fields = $request['embeds'][0]['fields'];

        return $fields[0]['value'] === '+44 20 7946 0958' && $fields[1]['name'] === 'Język' && $fields[1]['value'] === 'angielski';
    });
});

it('stores the language of a callback request sent from the Polish site', function () {
    $this->from('/')
        ->post(route('callback-requests.store'), ['phone' => '884343924'])
        ->assertSessionHasNoErrors();

    expect(CallbackRequest::sole()->locale)->toBe('pl');

    Http::assertSent(fn (Request $request): bool => $request['embeds'][0]['fields'][1]['value'] === 'polski');
});

it('rejects invalid input on the English site with an English message', function (array $payload, string $message) {
    $this->from('/en')
        ->post(route('en.callback-requests.store'), $payload)
        ->assertRedirect('/en')
        ->assertSessionHasErrors(['phone' => $message]);

    assertDatabaseCount('callback_requests', 0);
    Http::assertNothingSent();
})->with([
    'missing phone' => [[], 'Please enter your phone number.'],
    'too short phone' => [['phone' => '12345678'], 'Please enter a valid phone number.'],
]);
