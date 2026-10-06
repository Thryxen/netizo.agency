<?php

use App\Models\ContactMessage;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;

use function Pest\Laravel\assertDatabaseCount;
use function Pest\Laravel\assertDatabaseHas;

const CONTACT_WEBHOOK_URL = 'https://discord.test/webhooks/contact';

/**
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function validContactMessagePayload(array $overrides = []): array
{
    return array_merge([
        'name' => 'Jan Kowalski',
        'email' => 'jan@firma.pl',
        'subject' => 'project',
        'message' => 'Potrzebujemy nowej strony internetowej dla naszej firmy.',
    ], $overrides);
}

beforeEach(function () {
    config([
        'services.discord.webhook_contact' => CONTACT_WEBHOOK_URL,
        'services.discord.role_id' => null,
    ]);

    $this->discordResponseStatus = 204;

    Http::preventStrayRequests();
    Http::fake(fn () => Http::response(status: $this->discordResponseStatus));
});

it('stores the message, notifies Discord and redirects back', function () {
    $this->from('/')
        ->post(route('contact-messages.store'), validContactMessagePayload())
        ->assertRedirect('/')
        ->assertSessionHasNoErrors();

    assertDatabaseHas('contact_messages', [
        'name' => 'Jan Kowalski',
        'email' => 'jan@firma.pl',
        'subject' => 'project',
        'message' => 'Potrzebujemy nowej strony internetowej dla naszej firmy.',
    ]);

    Http::assertSentCount(1);
    Http::assertSent(function (Request $request): bool {
        $embed = $request['embeds'][0];

        return $request->url() === CONTACT_WEBHOOK_URL
            && $embed['title'] === 'Nowa wiadomość kontaktowa'
            && $embed['fields'][0]['value'] === 'Jan Kowalski'
            && $embed['fields'][1]['value'] === 'jan@firma.pl'
            && $embed['fields'][2]['value'] === 'Nowy projekt'
            && $embed['fields'][3]['value'] === 'Potrzebujemy nowej strony internetowej dla naszej firmy.';
    });
});

it('accepts a message without a subject', function () {
    $this->from('/')
        ->post(route('contact-messages.store'), validContactMessagePayload(['subject' => '']))
        ->assertRedirect('/')
        ->assertSessionHasNoErrors();

    expect(ContactMessage::sole()->subject)->toBe('');

    Http::assertSent(fn (Request $request): bool => $request['embeds'][0]['fields'][2]['value'] === '-');
});

it('accepts every subject from the select', function (string $subject) {
    $this->from('/')
        ->post(route('contact-messages.store'), validContactMessagePayload(['subject' => $subject]))
        ->assertSessionHasNoErrors();

    assertDatabaseHas('contact_messages', ['subject' => $subject]);
})->with(['project', 'cooperation', 'career', 'other']);

it('rejects invalid input with a Polish message', function (array $overrides, string $field, string $message) {
    $this->from('/')
        ->post(route('contact-messages.store'), validContactMessagePayload($overrides))
        ->assertRedirect('/')
        ->assertSessionHasErrors([$field => $message]);

    assertDatabaseCount('contact_messages', 0);
    Http::assertNothingSent();
})->with([
    'missing name' => [['name' => ''], 'name', 'Imię i nazwisko jest wymagane.'],
    'too short name' => [['name' => 'J'], 'name', 'Imię i nazwisko musi mieć co najmniej 2 znaki.'],
    'too long name' => [['name' => str_repeat('a', 256)], 'name', 'Imię i nazwisko może mieć maksymalnie 255 znaków.'],
    'name as array' => [['name' => ['Jan', 'Kowalski']], 'name', 'Podaj poprawne imię i nazwisko.'],
    'missing email' => [['email' => ''], 'email', 'Adres e-mail jest wymagany.'],
    'invalid email' => [['email' => 'to-nie-email'], 'email', 'Podaj poprawny adres e-mail.'],
    'too long email' => [['email' => str_repeat('a', 250).'@firma.pl'], 'email', 'Adres e-mail może mieć maksymalnie 255 znaków.'],
    'unknown subject' => [['subject' => 'spam'], 'subject', 'Wybierz temat z listy.'],
    'subject as array' => [['subject' => ['project']], 'subject', 'Wybierz temat z listy.'],
    'missing message' => [['message' => ''], 'message', 'Wiadomość jest wymagana.'],
    'too short message' => [['message' => 'Krótko'], 'message', 'Wiadomość musi mieć co najmniej 10 znaków.'],
    'too long message' => [['message' => str_repeat('a', 5001)], 'message', 'Wiadomość może mieć maksymalnie 5000 znaków.'],
    'message as array' => [['message' => ['Potrzebujemy strony', 'internetowej']], 'message', 'Wiadomość jest wymagana.'],
]);

it('accepts a message of exactly 5000 characters', function () {
    $this->from('/')
        ->post(route('contact-messages.store'), validContactMessagePayload(['message' => str_repeat('a', 5000)]))
        ->assertSessionHasNoErrors();

    assertDatabaseCount('contact_messages', 1);
});

it('still stores the message when the Discord webhook fails', function () {
    $this->discordResponseStatus = 500;

    $this->from('/')
        ->post(route('contact-messages.store'), validContactMessagePayload())
        ->assertRedirect('/')
        ->assertSessionHasNoErrors();

    assertDatabaseCount('contact_messages', 1);
});

it('rate limits submissions to 10 per minute per IP', function () {
    foreach (range(1, 10) as $attempt) {
        $this->from('/')
            ->post(route('contact-messages.store'), validContactMessagePayload())
            ->assertSessionHasNoErrors();
    }

    $this->from('/')
        ->post(route('contact-messages.store'), validContactMessagePayload())
        ->assertRedirect('/')
        ->assertSessionHasErrors(['form' => 'Zbyt wiele prób. Spróbuj ponownie za minutę.']);

    assertDatabaseCount('contact_messages', 10);
    Http::assertSentCount(10);

    $this->withServerVariables(['REMOTE_ADDR' => '10.0.0.2'])
        ->from('/')
        ->post(route('contact-messages.store'), validContactMessagePayload())
        ->assertSessionHasNoErrors();

    assertDatabaseCount('contact_messages', 11);

    $this->travel(61)->seconds();

    $this->withServerVariables(['REMOTE_ADDR' => '127.0.0.1'])
        ->from('/')
        ->post(route('contact-messages.store'), validContactMessagePayload())
        ->assertSessionHasNoErrors();

    assertDatabaseCount('contact_messages', 12);
});
