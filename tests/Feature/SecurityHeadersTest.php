<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Vite;

beforeEach(function () {
    Route::middleware('web')->get('/_security-headers-probe', fn (): string => 'ok');

    $this->hotFile = storage_path('framework/testing/vite-hot-'.uniqid());
    Vite::useHotFile($this->hotFile);
});

afterEach(function () {
    if (is_file($this->hotFile)) {
        unlink($this->hotFile);
    }
});

function contentSecurityPolicy(): string
{
    return (string) test()->get('/_security-headers-probe')
        ->assertOk()
        ->headers->get('Content-Security-Policy');
}

function writeViteHotFile(string $url): void
{
    if (! is_dir(dirname(test()->hotFile))) {
        mkdir(dirname(test()->hotFile), 0755, true);
    }

    file_put_contents(test()->hotFile, $url);
}

it('sends the security headers with a strict content security policy', function () {
    $response = $this->get('/_security-headers-probe')
        ->assertOk()
        ->assertHeader('X-Content-Type-Options', 'nosniff')
        ->assertHeader('X-Frame-Options', 'SAMEORIGIN')
        ->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    expect($response->headers->get('Content-Security-Policy'))
        ->toContain("default-src 'self'")
        ->toContain("script-src 'self'")
        ->toContain("object-src 'none'")
        ->toContain("frame-ancestors 'self'")
        ->toContain("require-trusted-types-for 'script'");
});

it('lets the Cloudflare Turnstile script and its iframe load', function () {
    expect(contentSecurityPolicy())
        ->toMatch("#script-src [^;]*https://challenges\.cloudflare\.com#")
        ->toMatch("#frame-src [^;]*https://challenges\.cloudflare\.com#");
});

it('allows no Vite dev server sources when Vite is not running hot', function () {
    expect(contentSecurityPolicy())
        ->not->toContain(':5173')
        ->not->toContain('ws://')
        ->not->toContain('wss://');
});

it('allows every loopback spelling of a local Vite dev server', function () {
    writeViteHotFile('http://[::1]:5173');

    expect(contentSecurityPolicy())
        ->toContain('http://localhost:5173')
        ->toContain('http://127.0.0.1:5173')
        ->toContain('http://[::1]:5173')
        ->toContain('ws://localhost:5173')
        ->toContain('ws://[::1]:5173')
        ->toContain('wss://127.0.0.1:5173');
});

it('sends the security headers on responses produced outside the web group', function (string $method, string $uri, int $status) {
    $response = $this->call($method, $uri)
        ->assertStatus($status)
        ->assertHeader('X-Content-Type-Options', 'nosniff')
        ->assertHeader('X-Frame-Options', 'SAMEORIGIN');

    expect($response->headers->get('Content-Security-Policy'))->toContain("default-src 'self'");
})->with([
    'unknown route (404)' => ['GET', '/this-page-does-not-exist', 404],
    'wrong method (405)' => ['GET', '/kontakt', 405],
]);

it('allows only the configured host of a remote Vite dev server', function () {
    writeViteHotFile('https://netizo.agency.test:5173');

    expect(contentSecurityPolicy())
        ->toContain('https://netizo.agency.test:5173')
        ->toContain('wss://netizo.agency.test:5173')
        ->not->toContain('localhost');
});

it('sends the strict content security policy on admin pages too', function () {
    $response = $this->withoutVite()->get('/admin/login')->assertOk();

    expect($response->headers->get('Content-Security-Policy'))
        ->toContain("require-trusted-types-for 'script'")
        ->not->toContain('livewire');
});
