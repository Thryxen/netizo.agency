<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/** An address inside Cloudflare's 172.64.0.0/13 edge range. */
const CLOUDFLARE_EDGE_IP = '172.70.1.10';

beforeEach(function () {
    Route::get('/_client-probe', fn (Request $request): array => [
        'ip' => $request->ip(),
        'secure' => $request->secure(),
        'host' => $request->getHost(),
    ]);
});

it('takes the visitor ip and scheme from forwarded headers sent by a Cloudflare edge', function () {
    $isSecureByDefault = $this->getJson('/_client-probe')->json('secure');

    $this->withServerVariables(['REMOTE_ADDR' => CLOUDFLARE_EDGE_IP])
        ->withHeaders(['X-Forwarded-For' => '203.0.113.7', 'X-Forwarded-Proto' => $isSecureByDefault ? 'http' : 'https'])
        ->getJson('/_client-probe')
        ->assertJson(['ip' => '203.0.113.7', 'secure' => ! $isSecureByDefault]);
});

it('ignores forwarded headers from addresses outside Cloudflare', function () {
    $isSecureByDefault = $this->getJson('/_client-probe')->json('secure');

    $this->withServerVariables(['REMOTE_ADDR' => '198.51.100.20'])
        ->withHeaders(['X-Forwarded-For' => '203.0.113.7', 'X-Forwarded-Proto' => $isSecureByDefault ? 'http' : 'https'])
        ->getJson('/_client-probe')
        ->assertJson(['ip' => '198.51.100.20', 'secure' => $isSecureByDefault]);
});

it('never trusts a forwarded host, even from Cloudflare', function () {
    $host = $this->withServerVariables(['REMOTE_ADDR' => CLOUDFLARE_EDGE_IP])
        ->withHeaders(['X-Forwarded-Host' => 'evil.test'])
        ->getJson('/_client-probe')
        ->assertOk()
        ->json('host');

    expect($host)->not->toBe('evil.test');
});

it('gives each visitor behind the same Cloudflare edge their own form rate limit', function () {
    $submitAs = fn (string $visitorIp) => $this->from('/')
        ->withServerVariables(['REMOTE_ADDR' => CLOUDFLARE_EDGE_IP])
        ->withHeaders(['X-Forwarded-For' => $visitorIp])
        ->post(route('newsletter-subscriptions.store'), ['email' => 'to-nie-jest-email']);

    foreach (range(1, 10) as $attempt) {
        $submitAs('203.0.113.7')->assertSessionDoesntHaveErrors('form');
    }

    $submitAs('203.0.113.7')->assertSessionHasErrors(['form' => 'Zbyt wiele prób. Spróbuj ponownie za minutę.']);

    $submitAs('203.0.113.8')
        ->assertSessionHasErrors('email')
        ->assertSessionDoesntHaveErrors('form');
});
