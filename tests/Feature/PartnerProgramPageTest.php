<?php

use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->withoutVite();
});

it('renders the partner programme page as an Inertia response with its FAQ', function () {
    $this->get(route('partners'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('partners')
            ->has('faq', 9, fn (Assert $item) => $item
                ->whereType('question', 'string')
                ->whereType('answer', 'string'))
            ->where('faq.0.question', 'Kto może zostać partnerem?')
            ->missing('projects')
            ->missing('clients'));
});

it('serves the page at /partnerzy', function () {
    expect(route('partners', absolute: false))->toBe('/partnerzy');
});

it('renders its own SEO tags, canonical URL and share image', function () {
    $imageUrl = asset('assets/images/og-netizo-2.png');

    $this->get('/partnerzy')
        ->assertOk()
        ->assertSee('<title>Program partnerski: 15% prowizji za polecenie | Netizo</title>', false)
        ->assertSee('<link rel="canonical" href="'.url('/partnerzy').'">', false)
        ->assertSee('<meta property="og:url" content="'.url('/partnerzy').'">', false)
        ->assertSee('<meta property="og:image" content="'.$imageUrl.'">', false)
        ->assertDontSee('Tworzymy Strony WWW dla Ambitnych Firm', false);
});

it('renders the FAQ and WebPage JSON-LD from the same questions as the page', function () {
    $response = $this->get('/partnerzy')->assertOk();

    preg_match_all('/<script type="application\/ld\+json">(.*?)<\/script>/s', $response->getContent(), $matches);

    $schemas = collect($matches[1])->map(fn (string $json): mixed => json_decode(trim($json), true));
    $faqSchema = $schemas->firstWhere('@type', 'FAQPage');
    $webPage = $schemas->firstWhere('@type', 'WebPage');
    $faq = $response->viewData('page')['props']['faq'];

    expect($faqSchema)->not->toBeNull()
        ->and(collect($faqSchema['mainEntity'])->pluck('name')->all())->toBe(array_column($faq, 'question'))
        ->and($faqSchema['mainEntity'][0]['acceptedAnswer']['text'])->toBe($faq[0]['answer'])
        ->and($webPage['name'])->toBe('Program partnerski Netizo')
        ->and($webPage['url'])->toBe(url('/partnerzy'))
        ->and($schemas->firstWhere('@type', 'ProfessionalService'))->toBeNull();
});

it('states the same commission terms in every answer that mentions them', function () {
    $answers = collect($this->get('/partnerzy')->viewData('page')['props']['faq'])->pluck('answer')->implode(' ');

    expect($answers)
        ->toContain("12\u{00A0}miesięcy od pierwszego zamówienia")
        ->toContain("W ciągu 14\u{00A0}dni")
        ->toContain("dostajesz 1\u{00A0}500\u{00A0}zł")
        ->not->toContain('20%')
        ->not->toContain('10%');
});

it('ships the hero photo in both widths the page requests', function (string $file, int $width) {
    $path = public_path("assets/images/photos/{$file}");

    expect($path)->toBeFile()
        ->and(getimagesize($path)[0])->toBe($width)
        ->and(filesize($path))->toBeLessThan(200 * 1024);
})->with([
    'native' => ['partner-referral.webp', 1536],
    '768w' => ['partner-referral-768.webp', 768],
]);
