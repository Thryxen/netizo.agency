<?php

/**
 * The shape of a translation file: its strings keyed by key path, with list positions spelled out, so a missing string,
 * an extra one or a list of a different length (FAQ items, navigation links) shows up as a different path. A list of
 * plain strings (the SEO keywords) is one entry: its length is up to each language.
 *
 * @param  array<array-key, mixed>  $translations
 * @return array<string, mixed>
 */
function translationEntries(array $translations, string $prefix = ''): array
{
    $entries = [];

    foreach ($translations as $key => $value) {
        $path = $prefix === '' ? (string) $key : "{$prefix} › {$key}";
        $isStringList = is_array($value) && array_is_list($value) && collect($value)->every(fn (mixed $item): bool => is_string($item));

        $entries = [...$entries, ...(is_array($value) && ! $isStringList ? translationEntries($value, $path) : [$path => $value])];
    }

    return $entries;
}

it('has an English twin with the same keys for every Polish file of the site', function (string $file) {
    $polish = require lang_path("pl/{$file}.php");
    $english = require lang_path("en/{$file}.php");

    expect(array_keys(translationEntries($english)))->toBe(array_keys(translationEntries($polish)));
})->with(['home', 'partners', 'forms', 'errors']);

it('translates every string of the site into English', function (string $file) {
    $english = require lang_path("en/{$file}.php");

    $blank = collect(translationEntries($english))
        ->filter(fn (mixed $value): bool => is_array($value) ? $value === [] || in_array('', array_map('trim', $value), true) : ! is_string($value) || trim($value) === '');

    expect($blank)->toBeEmpty();
})->with(['home', 'partners', 'forms', 'errors']);

it('serves the Polish file in Polish and the English one in English', function () {
    app()->setLocale('pl');
    expect(__('forms.errors.throttled'))->toBe('Zbyt wiele prób. Spróbuj ponownie za minutę.');

    app()->setLocale('en');
    expect(__('forms.errors.throttled'))->toBe('Too many attempts. Please try again in a minute.');
});
