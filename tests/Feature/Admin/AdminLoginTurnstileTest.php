<?php

use App\Models\User;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

beforeEach(function () {
    $this->withoutVite();

    config([
        'services.turnstile.site_key' => '1x00000000000000000000AA',
        'services.turnstile.secret_key' => 'sekret-turnstile',
    ]);
});

function fakeSiteverify(array $body): void
{
    Http::preventStrayRequests();
    Http::fake([SITEVERIFY_URL => Http::response($body)]);
}

it('gives the login page the site key', function () {
    $this->get(route('admin.login'))
        ->assertInertia(fn (Assert $page) => $page->where('turnstileSiteKey', '1x00000000000000000000AA'));
});

it('hides the widget until both keys are set', function (?string $siteKey, ?string $secretKey) {
    config(['services.turnstile.site_key' => $siteKey, 'services.turnstile.secret_key' => $secretKey]);

    $this->get(route('admin.login'))
        ->assertInertia(fn (Assert $page) => $page->where('turnstileSiteKey', null));
})->with([
    'no keys' => [null, null],
    'site key only' => ['1x00000000000000000000AA', ''],
    'secret key only' => ['', 'sekret-turnstile'],
]);

it('logs in with a token that passes siteverify', function () {
    fakeSiteverify(['success' => true, 'error-codes' => []]);
    $user = User::factory()->create();

    $this->post(route('admin.login.store'), [
        'email' => $user->email,
        'password' => 'password',
        'turnstile_token' => 'token-z-widgetu',
    ])->assertRedirect(route('admin.home'));

    $this->assertAuthenticatedAs($user);

    Http::assertSent(fn (Request $request): bool => $request->url() === SITEVERIFY_URL
        && $request->isForm()
        && $request['secret'] === 'sekret-turnstile'
        && $request['response'] === 'token-z-widgetu'
        && $request['remoteip'] === '127.0.0.1');
});

it('requires a token without asking Cloudflare', function () {
    fakeSiteverify(['success' => true]);
    $user = User::factory()->create();

    $this->post(route('admin.login.store'), ['email' => $user->email, 'password' => 'password'])
        ->assertSessionHasErrors(['turnstile_token' => 'Potwierdź, że nie jesteś robotem.']);

    $this->assertGuest();
    Http::assertNothingSent();
});

it('rejects a token that fails siteverify, even with the right password', function () {
    fakeSiteverify(['success' => false, 'error-codes' => ['timeout-or-duplicate']]);
    $user = User::factory()->create();

    $this->post(route('admin.login.store'), [
        'email' => $user->email,
        'password' => 'password',
        'turnstile_token' => 'zuzyty-token',
    ])->assertSessionHasErrors(['turnstile_token' => 'Weryfikacja nie powiodła się. Spróbuj ponownie.']);

    $this->assertGuest();
});

it('rejects the login when siteverify cannot be reached', function () {
    Http::fake([SITEVERIFY_URL => Http::failedConnection()]);
    $user = User::factory()->create();

    $this->post(route('admin.login.store'), [
        'email' => $user->email,
        'password' => 'password',
        'turnstile_token' => 'token-z-widgetu',
    ])->assertSessionHasErrors('turnstile_token');

    $this->assertGuest();
});

it('does not count a failed bot check as a failed password attempt', function () {
    $rejected = ['success' => false, 'error-codes' => ['invalid-input-response']];
    Http::preventStrayRequests();
    Http::fake([SITEVERIFY_URL => Http::sequence()
        ->push($rejected)->push($rejected)->push($rejected)->push($rejected)->push($rejected)
        ->push(['success' => true])]);
    $user = User::factory()->create();

    foreach (range(1, 5) as $attempt) {
        $this->post(route('admin.login.store'), [
            'email' => $user->email,
            'password' => 'password',
            'turnstile_token' => 'falszywy-token',
        ])->assertSessionHasErrors('turnstile_token');
    }

    $this->post(route('admin.login.store'), [
        'email' => $user->email,
        'password' => 'password',
        'turnstile_token' => 'token-z-widgetu',
    ])->assertRedirect(route('admin.home'));

    $this->assertAuthenticatedAs($user);
});

it('logs in without a token while Turnstile is off', function () {
    config(['services.turnstile.site_key' => null, 'services.turnstile.secret_key' => null]);
    Http::preventStrayRequests();
    $user = User::factory()->create();

    $this->post(route('admin.login.store'), ['email' => $user->email, 'password' => 'password'])
        ->assertRedirect(route('admin.home'));

    $this->assertAuthenticatedAs($user);
});
