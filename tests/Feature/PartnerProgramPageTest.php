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
    $imageUrl = asset('assets/images/og-netizo-partnerzy.png');

    $this->get('/partnerzy')
        ->assertOk()
        ->assertSee('<title>Program partnerski: 15% prowizji za polecenie | Netizo</title>', false)
        ->assertSee('<link rel="canonical" href="'.url('/partnerzy').'">', false)
        ->assertSee('<meta property="og:url" content="'.url('/partnerzy').'">', false)
        ->assertSee('<meta property="og:image" content="'.$imageUrl.'">', false)
        ->assertSee('<meta property="og:image:width" content="1200">', false)
        ->assertSee('<meta property="og:image:height" content="630">', false)
        ->assertSee('<meta name="twitter:image" content="'.$imageUrl.'">', false)
        ->assertDontSee('og-netizo-2.png', false)
        ->assertDontSee('Tworzymy Strony WWW dla Ambitnych Firm', false);
});

it('uses its share image in the WebPage JSON-LD', function () {
    $response = $this->get('/partnerzy')->assertOk();

    preg_match_all('/<script type="application\/ld\+json">(.*?)<\/script>/s', $response->getContent(), $matches);

    $webPage = collect($matches[1])
        ->map(fn (string $json): mixed => json_decode(trim($json), true))
        ->firstWhere('@type', 'WebPage');

    expect($webPage['image'])->toBe(asset('assets/images/og-netizo-partnerzy.png'));
});

it('ships a 1200x630 share image under the size link previews accept', function () {
    $imagePath = public_path('assets/images/og-netizo-partnerzy.png');

    expect($imagePath)->toBeFile()
        ->and(array_slice(getimagesize($imagePath), 0, 2))->toBe([1200, 630])
        ->and(getimagesize($imagePath)['mime'])->toBe('image/png')
        ->and(filesize($imagePath))->toBeLessThan(300 * 1024);
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

it('serves the english partner program page at /en/partners with the english FAQ', function () {
    expect(route('en.partners', absolute: false))->toBe('/en/partners');

    $polishFaq = $this->get('/partnerzy')->viewData('page')['props']['faq'];

    $this->get('/en/partners')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('partners')
            ->where('locale', 'en')
            ->where('alternates', ['pl' => url('/partnerzy'), 'en' => url('/en/partners')])
            ->has('faq', count($polishFaq), fn (Assert $item) => $item
                ->whereType('question', 'string')
                ->whereType('answer', 'string'))
            ->where('faq.0.question', 'Who can become a partner?'));
});

it('shares the language and the page in both languages with the polish partner page', function () {
    $this->get('/partnerzy')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('locale', 'pl')
            ->where('alternates', ['pl' => url('/partnerzy'), 'en' => url('/en/partners')]));
});

it('links both partner pages to each other for search engines and share previews', function (string $path, string $language, string $ogLocale) {
    $this->get($path)
        ->assertOk()
        ->assertSee('<html lang="'.$language.'" class="">', false)
        ->assertSee('<link rel="canonical" href="'.url($path).'">', false)
        ->assertSee('<link rel="alternate" hreflang="pl" href="'.url('/partnerzy').'">', false)
        ->assertSee('<link rel="alternate" hreflang="en" href="'.url('/en/partners').'">', false)
        ->assertSee('<link rel="alternate" hreflang="x-default" href="'.url('/partnerzy').'">', false)
        ->assertSee('<meta property="og:locale" content="'.$ogLocale.'">', false);
})->with([
    'polish' => ['/partnerzy', 'pl', 'pl_PL'],
    'english' => ['/en/partners', 'en', 'en_US'],
]);

it('renders the english SEO tags, share image and WebPage JSON-LD on /en/partners', function () {
    $response = $this->get('/en/partners')->assertOk();
    $imageUrl = asset('assets/images/og-netizo-partners-en.png');
    $imagePath = public_path('assets/images/og-netizo-partners-en.png');

    $response
        ->assertSee('<title>Partner Program: 15% Commission per Referral | Netizo</title>', false)
        ->assertSee('<meta property="og:url" content="'.url('/en/partners').'">', false)
        ->assertSee('<meta property="og:image" content="'.$imageUrl.'">', false)
        ->assertSee('<meta name="twitter:image" content="'.$imageUrl.'">', false)
        ->assertDontSee('og-netizo-partnerzy.png', false)
        ->assertDontSee('Program partnerski: 15% prowizji za polecenie', false);

    preg_match_all('/<script type="application\/ld\+json">(.*?)<\/script>/s', $response->getContent(), $matches);

    $schemas = collect($matches[1])->map(fn (string $json): mixed => json_decode(trim($json), true));
    $webPage = $schemas->firstWhere('@type', 'WebPage');

    expect($webPage['name'])->toBe('Netizo Partner Program')
        ->and($webPage['url'])->toBe(url('/en/partners'))
        ->and($webPage['image'])->toBe($imageUrl)
        ->and($webPage['inLanguage'])->toBe('en')
        ->and($schemas->firstWhere('@type', 'FAQPage')['inLanguage'])->toBe('en');

    expect($imagePath)->toBeFile()
        ->and(array_slice(getimagesize($imagePath), 0, 2))->toBe([1200, 630])
        ->and(getimagesize($imagePath)['mime'])->toBe('image/png')
        ->and(filesize($imagePath))->toBeLessThan(300 * 1024);
});

it('states the same commission terms in the english answers', function () {
    $answers = collect($this->get('/en/partners')->viewData('page')['props']['faq'])->pluck('answer')->implode(' ');

    expect($answers)
        ->toContain("12\u{00A0}months of their first order")
        ->toContain("Within 14\u{00A0}days")
        ->toContain("you get PLN\u{00A0}1,500")
        ->not->toContain('20%')
        ->not->toContain('10%');
});
