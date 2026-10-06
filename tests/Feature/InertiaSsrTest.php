<?php

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

beforeEach(function () {
    $this->withoutVite();

    config([
        'inertia.ssr.enabled' => true,
        'inertia.ssr.ensure_bundle_exists' => false,
    ]);
});

it('caps how long a request waits for the SSR server', function () {
    expect(config('inertia.ssr.timeout'))->toBeGreaterThan(0)->toBeLessThanOrEqual(5);
});

it('falls back to client-side rendering and logs once when the SSR server is unreachable', function () {
    Http::fake(['*' => Http::failedConnection('Connection refused')]);

    Log::shouldReceive('warning')
        ->once()
        ->withArgs(fn (string $message, array $context): bool => str_contains($message, 'SSR')
            && $context['component'] === 'home'
            && $context['type'] === 'connection');

    $this->get('/')
        ->assertOk()
        ->assertSee('<div id="app"', false);

    $this->get('/')->assertOk();
});
