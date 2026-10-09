<?php

use App\Models\NewsletterSubscriber;
use Illuminate\Support\Facades\Http;

use function Pest\Laravel\assertDatabaseCount;
use function Pest\Laravel\assertDatabaseHas;

beforeEach(function () {
    Http::preventStrayRequests();
    Http::fake();
});

it('subscribes the email address and redirects back', function () {
    $this->from('/')
        ->post(route('newsletter-subscriptions.store'), ['email' => 'jan@firma.pl'])
        ->assertRedirect('/')
        ->assertSessionHasNoErrors();

    assertDatabaseHas('newsletter_subscribers', ['email' => 'jan@firma.pl']);

    expect(NewsletterSubscriber::sole()->subscribed_at)->not->toBeNull();

    Http::assertNothingSent();
});

it('rejects invalid input with a Polish message', function (array $payload, string $message) {
    $this->from('/')
        ->post(route('newsletter-subscriptions.store'), $payload)
        ->assertRedirect('/')
        ->assertSessionHasErrors(['email' => $message]);

    assertDatabaseCount('newsletter_subscribers', 0);
})->with([
    'missing email' => [[], 'Adres e-mail jest wymagany.'],
    'empty email' => [['email' => ''], 'Adres e-mail jest wymagany.'],
    'invalid email' => [['email' => 'to-nie-email'], 'Podaj poprawny adres e-mail.'],
    'email as array' => [['email' => ['jan@firma.pl']], 'Podaj poprawny adres e-mail.'],
    'too long email' => [['email' => str_repeat('a', 250).'@firma.pl'], 'Adres e-mail może mieć maksymalnie 255 znaków.'],
]);

it('rejects an email that is already subscribed', function () {
    NewsletterSubscriber::create(['email' => 'jan@firma.pl']);

    $this->from('/')
        ->post(route('newsletter-subscriptions.store'), ['email' => 'jan@firma.pl'])
        ->assertRedirect('/')
        ->assertSessionHasErrors(['email' => 'Ten adres jest już zapisany do newslettera.']);

    assertDatabaseCount('newsletter_subscribers', 1);
});

it('treats an address with surrounding whitespace as a duplicate', function () {
    NewsletterSubscriber::create(['email' => 'jan@firma.pl']);

    $this->from('/')
        ->post(route('newsletter-subscriptions.store'), ['email' => '  jan@firma.pl  '])
        ->assertSessionHasErrors(['email' => 'Ten adres jest już zapisany do newslettera.']);

    assertDatabaseCount('newsletter_subscribers', 1);
});

it('rate limits submissions to 10 per minute per IP', function () {
    foreach (range(1, 10) as $attempt) {
        $this->from('/')
            ->post(route('newsletter-subscriptions.store'), ['email' => "osoba{$attempt}@firma.pl"])
            ->assertSessionHasNoErrors();
    }

    $this->from('/')
        ->post(route('newsletter-subscriptions.store'), ['email' => 'osoba11@firma.pl'])
        ->assertRedirect('/')
        ->assertSessionHasErrors(['form' => 'Zbyt wiele prób. Spróbuj ponownie za minutę.']);

    assertDatabaseCount('newsletter_subscribers', 10);
});

it('subscribes an address from the English site with its language', function () {
    $this->from('/en')
        ->post(route('en.newsletter-subscriptions.store'), ['email' => 'john@company.com'])
        ->assertRedirect('/en')
        ->assertSessionHasNoErrors();

    expect(route('en.newsletter-subscriptions.store'))->toEndWith('/en/newsletter');

    assertDatabaseHas('newsletter_subscribers', ['email' => 'john@company.com', 'locale' => 'en']);
});

it('stores the language of an address subscribed on the Polish site', function () {
    $this->from('/')
        ->post(route('newsletter-subscriptions.store'), ['email' => 'jan@firma.pl'])
        ->assertSessionHasNoErrors();

    expect(NewsletterSubscriber::sole()->locale)->toBe('pl');
});

it('rejects invalid input on the English site with an English message', function (array $payload, string $message) {
    $this->from('/en')
        ->post(route('en.newsletter-subscriptions.store'), $payload)
        ->assertRedirect('/en')
        ->assertSessionHasErrors(['email' => $message]);

    assertDatabaseCount('newsletter_subscribers', 0);
})->with([
    'missing email' => [[], 'Please enter your email address.'],
    'invalid email' => [['email' => 'not-an-email'], 'Please enter a valid email address.'],
]);

it('tells an English visitor the address is already subscribed', function () {
    NewsletterSubscriber::create(['email' => 'john@company.com', 'subscribed_at' => now()]);

    $this->from('/en')
        ->post(route('en.newsletter-subscriptions.store'), ['email' => 'john@company.com'])
        ->assertSessionHasErrors(['email' => 'This address is already subscribed to the newsletter.']);
});
