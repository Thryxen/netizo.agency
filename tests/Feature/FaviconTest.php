<?php

it('links the client panel icons in the page head', function () {
    $this->get('/')
        ->assertOk()
        ->assertSee('<link rel="icon" href="'.asset('favicon.ico').'?v=3" sizes="any" />', false)
        ->assertSee('<link rel="icon" type="image/svg+xml" href="'.asset('favicon.svg').'?v=3" />', false)
        ->assertSee('<link rel="apple-touch-icon" href="'.asset('apple-touch-icon.png').'?v=3" />', false)
        ->assertSee('<link rel="manifest" href="'.asset('manifest.webmanifest').'?v=3" />', false)
        ->assertDontSee('favicon-96x96.png', false)
        ->assertDontSee('site.webmanifest', false);
});

it('ships every icon the head and the manifest reference', function (string $path) {
    expect(public_path($path))->toBeFile();
})->with([
    'favicon.ico',
    'favicon.svg',
    'apple-touch-icon.png',
    'manifest.webmanifest',
    'images/icons/icon-192.png',
    'images/icons/icon-512.png',
    'images/icons/icon-512-maskable.png',
]);

it('has a valid web manifest whose icons exist', function () {
    $manifest = json_decode(file_get_contents(public_path('manifest.webmanifest')), true, flags: JSON_THROW_ON_ERROR);

    expect($manifest['start_url'])->toBe('/')
        ->and($manifest['short_name'])->toBe('Netizo')
        ->and($manifest['icons'])->not->toBeEmpty();

    foreach ($manifest['icons'] as $icon) {
        expect(public_path(ltrim($icon['src'], '/')))->toBeFile();
    }
});

it('uses the same icons on the error pages', function () {
    $this->get('/this-page-does-not-exist')
        ->assertNotFound()
        ->assertSee('<link rel="icon" type="image/svg+xml" href="'.asset('favicon.svg').'?v=3" />', false)
        ->assertDontSee('favicon-96x96.png', false);
});
