<?php

use App\Models\Client;
use App\Models\Project;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->withoutVite();
});

/**
 * @param  array<string, mixed>  $attributes
 */
function createHomePageProject(array $attributes = []): Project
{
    static $sequence = 0;
    $sequence++;

    return Project::query()->create([
        'slug' => "projekt-{$sequence}",
        'sort_order' => $sequence,
        'is_active' => true,
        'title' => "Projekt {$sequence}",
        'url' => "projekt-{$sequence}.pl",
        'category' => 'Strona firmowa',
        'description' => 'Krótki opis projektu.',
        'full_description' => 'Pełny opis projektu.',
        'thumbnail_image' => null,
        'full_image' => null,
        'tech_stack' => ['Laravel', 'React'],
        'metrics' => [['value' => '+40%', 'label' => 'konwersji']],
        'challenges' => ['Wyzwanie'],
        'solutions' => ['Rozwiązanie'],
        ...$attributes,
    ]);
}

it('renders the home page as an Inertia response', function () {
    $this->get('/')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('home')
            ->has('projects', 0)
            ->has('clients', 0)
            ->has('faq', 11, fn (Assert $item) => $item
                ->whereType('question', 'string')
                ->whereType('answer', 'string'))
        );
});

it('passes only active projects ordered by sort order with camelCase keys', function () {
    createHomePageProject(['slug' => 'trzeci', 'sort_order' => 30]);
    createHomePageProject([
        'slug' => 'pierwszy',
        'sort_order' => 10,
        'url' => 'treepro.pl',
        'thumbnail_image' => 'projects/thumbnails/treepro.webp',
        'full_image' => 'projects/full/treepro.webp',
    ]);
    createHomePageProject(['slug' => 'ukryty', 'sort_order' => 0, 'is_active' => false]);
    createHomePageProject(['slug' => 'drugi', 'sort_order' => 20, 'url' => 'http://example.com']);

    $this->get('/')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('home')
            ->has('projects', 3)
            ->where('projects.0.slug', 'pierwszy')
            ->where('projects.1.slug', 'drugi')
            ->where('projects.2.slug', 'trzeci')
            ->has('projects.0', fn (Assert $project) => $project
                ->where('url', 'treepro.pl')
                ->where('liveUrl', 'https://treepro.pl')
                ->where('thumbnailUrl', asset('storage/projects/thumbnails/treepro.webp'))
                ->where('fullImageUrl', asset('storage/projects/full/treepro.webp'))
                ->where('fullDescription', 'Pełny opis projektu.')
                ->where('techStack', ['Laravel', 'React'])
                ->where('metrics', [['value' => '+40%', 'label' => 'konwersji']])
                ->where('challenges', ['Wyzwanie'])
                ->where('solutions', ['Rozwiązanie'])
                ->hasAll(['id', 'title', 'category', 'description'])
                ->missing('full_description')
                ->missing('tech_stack')
                ->missing('thumbnail_image')
                ->etc())
            ->where('projects.1.liveUrl', 'http://example.com')
            ->where('projects.2.thumbnailUrl', null)
            ->where('projects.2.fullImageUrl', null)
        );
});

it('coerces empty project lists to arrays', function () {
    createHomePageProject(['tech_stack' => [], 'metrics' => [], 'challenges' => [], 'solutions' => []]);

    $this->get('/')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('projects.0.techStack', [])
            ->where('projects.0.metrics', [])
            ->where('projects.0.challenges', [])
            ->where('projects.0.solutions', [])
        );
});

it('passes only active clients ordered by sort order', function () {
    Client::query()->create(['name' => 'Drugi', 'url' => 'https://drugi.pl', 'sort_order' => 2, 'is_active' => true]);
    Client::query()->create(['name' => 'Pierwszy', 'url' => 'pierwszy.pl', 'sort_order' => 1, 'is_active' => true]);
    Client::query()->create(['name' => 'Ukryty', 'url' => null, 'sort_order' => 0, 'is_active' => false]);
    Client::query()->create(['name' => 'Bez strony', 'url' => null, 'sort_order' => 3, 'is_active' => true]);

    $this->get('/')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('clients', 3)
            ->where('clients.0.name', 'Pierwszy')
            ->where('clients.0.url', 'https://pierwszy.pl')
            ->where('clients.1.name', 'Drugi')
            ->where('clients.1.url', 'https://drugi.pl')
            ->where('clients.2.name', 'Bez strony')
            ->where('clients.2.url', null)
        );
});

it('renders the FAQ JSON-LD and SEO tags in the root view', function () {
    $response = $this->get('/')->assertOk();

    $response
        ->assertSee('<script type="application/ld+json">', false)
        ->assertSee('"@type":"FAQPage"', false)
        ->assertSee('"name":"Ile kosztuje strona internetowa lub aplikacja?"', false)
        ->assertSee('"name":"Czy strona będzie widoczna w Google?"', false)
        ->assertSee('<title>Tworzymy Strony WWW dla Ambitnych Firm | Netizo</title>', false)
        ->assertSee('<script data-page="app" type="application/json">', false)
        ->assertSee('<div id="app"', false)
        ->assertDontSee('livewire', false);

    preg_match_all('/<script type="application\/ld\+json">(.*?)<\/script>/s', $response->getContent(), $matches);

    $faqSchema = collect($matches[1])
        ->map(fn (string $json): mixed => json_decode(trim($json), true))
        ->firstWhere('@type', 'FAQPage');

    expect($faqSchema)->not->toBeNull()
        ->and($faqSchema['mainEntity'])->toHaveCount(11)
        ->and(collect($faqSchema['mainEntity'])->pluck('name'))->toContain('Czy strona będzie widoczna w Google?')
        ->and($faqSchema['mainEntity'][0]['acceptedAnswer']['@type'])->toBe('Answer');
});

it('renders the organization JSON-LD built in the controller', function () {
    config(['socials' => ['facebook' => null, 'instagram' => '', 'tiktok' => null, 'discord' => null]]);

    $response = $this->get('/')->assertOk();

    preg_match_all('/<script type="application\/ld\+json">(.*?)<\/script>/s', $response->getContent(), $matches);

    $schemas = collect($matches[1])->map(fn (string $json): mixed => json_decode(trim($json), true));
    $organization = $schemas->firstWhere('@type', 'ProfessionalService');

    expect($organization)->not->toBeNull()
        ->and($organization['name'])->toBe('Netizo')
        ->and($organization)->not->toHaveKey('sameAs')
        ->and($organization['address'])->toBe(['@type' => 'PostalAddress', 'addressLocality' => 'Leszno', 'addressRegion' => 'wielkopolskie', 'addressCountry' => 'PL'])
        ->and($organization['image'])->toBe(asset('assets/images/og-netizo-2.png'))
        ->and($organization['areaServed'])->toBe(['@type' => 'Country', 'name' => 'Polska'])
        ->and($organization['priceRange'])->toBe('$$')
        ->and($schemas->firstWhere('@type', 'WebPage'))->toBeNull();
});

it('lists the configured social profiles as sameAs in the organization JSON-LD', function (string $path) {
    config(['socials' => [
        'facebook' => 'https://www.facebook.com/netizo',
        'instagram' => null,
        'tiktok' => 'https://www.tiktok.com/@netizo',
        'discord' => 'https://discord.gg/netizo',
    ]]);

    $response = $this->get($path)->assertOk();

    preg_match_all('/<script type="application\/ld\+json">(.*?)<\/script>/s', $response->getContent(), $matches);

    $organization = collect($matches[1])
        ->map(fn (string $json): mixed => json_decode(trim($json), true))
        ->firstWhere('@type', 'ProfessionalService');

    expect($organization['sameAs'])->toBe([
        'https://www.facebook.com/netizo',
        'https://www.tiktok.com/@netizo',
        'https://discord.gg/netizo',
    ]);
})->with(['polish' => '/', 'english' => '/en']);

it('shares the configured social profiles in config order without the empty ones', function (string $path) {
    config(['socials' => [
        'facebook' => 'https://www.facebook.com/netizo',
        'instagram' => '',
        'tiktok' => 'https://www.tiktok.com/@netizo',
        'discord' => null,
    ]]);

    $this->get($path)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('socials', [
            ['network' => 'facebook', 'url' => 'https://www.facebook.com/netizo'],
            ['network' => 'tiktok', 'url' => 'https://www.tiktok.com/@netizo'],
        ]));
})->with(['polish' => '/', 'english' => '/en']);

it('shares no social profiles when none is configured', function () {
    config(['socials' => ['facebook' => null, 'instagram' => null, 'tiktok' => null, 'discord' => null]]);

    $this->get('/')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('socials', []));
});

it('points the share image tags at a 1200x630 file under the size link previews accept', function () {
    $response = $this->get('/')->assertOk();
    $imageUrl = asset('assets/images/og-netizo-2.png');
    $imagePath = public_path('assets/images/og-netizo-2.png');

    $response
        ->assertSee('<meta property="og:image" content="'.$imageUrl.'">', false)
        ->assertSee('<meta property="og:image:width" content="1200">', false)
        ->assertSee('<meta property="og:image:height" content="630">', false)
        ->assertSee('<meta name="twitter:image" content="'.$imageUrl.'">', false);

    expect($imagePath)->toBeFile()
        ->and(array_slice(getimagesize($imagePath), 0, 2))->toBe([1200, 630])
        ->and(getimagesize($imagePath)['mime'])->toBe('image/png')
        ->and(filesize($imagePath))->toBeLessThan(300 * 1024)
        ->and(public_path('assets/images/og-image.jpg'))->not->toBeFile();
});

it('sets the dark class on the root element from the appearance cookie', function () {
    $this->withUnencryptedCookie('appearance', 'dark')
        ->get('/')
        ->assertOk()
        ->assertSee('<html lang="pl" class="dark">', false)
        ->assertSee('<meta name="theme-color" content="#0a0a0a">', false);

    $this->withUnencryptedCookie('appearance', 'nonsense')
        ->get('/')
        ->assertOk()
        ->assertSee('<html lang="pl" class="">', false);
});

it('uses a single light theme color for the light appearance', function () {
    $this->withUnencryptedCookie('appearance', 'light')
        ->get('/')
        ->assertOk()
        ->assertSee('<html lang="pl" class="">', false)
        ->assertSee('<meta name="theme-color" content="#ffffff">', false)
        ->assertDontSee('prefers-color-scheme', false);
});

it('re-issues a valid appearance cookie from the server', function () {
    $response = $this->withUnencryptedCookie('appearance', 'dark')->get('/')->assertOk();

    $cookie = collect($response->headers->getCookies())->first(fn ($cookie): bool => $cookie->getName() === 'appearance');

    expect($cookie)->not->toBeNull()
        ->and($cookie->getValue())->toBe('dark')
        ->and($cookie->isHttpOnly())->toBeFalse()
        ->and($cookie->getPath())->toBe('/')
        ->and($cookie->getSameSite())->toBe('lax')
        ->and($cookie->getExpiresTime())->toBeGreaterThan(now()->addDays(364)->getTimestamp());

    $response->assertSee('if (!true) {', false);
});

it('sets no appearance cookie for a visitor who never chose one', function (?string $cookie) {
    $request = $cookie === null ? $this : $this->withUnencryptedCookie('appearance', $cookie);

    $response = $request->get('/')->assertOk();

    expect(collect($response->headers->getCookies())->map->getName())->not->toContain('appearance');

    $response->assertSee('if (!false) {', false);
})->with([
    'no cookie' => [null],
    'legacy system value' => ['system'],
]);

it('is light by default, whatever the operating system prefers', function (?string $cookie) {
    $request = $cookie === null ? $this : $this->withUnencryptedCookie('appearance', $cookie);

    $request->get('/')
        ->assertOk()
        ->assertSee('<html lang="pl" class="">', false)
        ->assertSee('<meta name="theme-color" content="#ffffff">', false)
        ->assertSee('var dark = false;', false)
        ->assertDontSee('prefers-color-scheme', false);
})->with([
    'no cookie' => [null],
    'legacy system value' => ['system'],
]);

it('serves the english home page at /en with the english FAQ', function () {
    expect(route('en.home', absolute: false))->toBe('/en');

    $polishFaq = $this->get('/')->viewData('page')['props']['faq'];

    $this->get('/en')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('home')
            ->where('locale', 'en')
            ->where('alternates', ['pl' => url('/'), 'en' => url('/en')])
            ->has('faq', count($polishFaq), fn (Assert $item) => $item
                ->whereType('question', 'string')
                ->whereType('answer', 'string'))
            ->where('faq.0.question', 'How much does a website or an app cost?'));
});

it('shares the language and the page in both languages with the polish home page', function () {
    $this->get('/')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('locale', 'pl')
            ->where('alternates', ['pl' => url('/'), 'en' => url('/en')]));
});

it('links both home pages to each other for search engines and share previews', function (string $path, string $language, string $ogLocale, string $ogAlternate) {
    $this->get($path)
        ->assertOk()
        ->assertSee('<html lang="'.$language.'" class="">', false)
        ->assertSee('<link rel="canonical" href="'.url($path).'">', false)
        ->assertSee('<link rel="alternate" hreflang="pl" href="'.url('/').'">', false)
        ->assertSee('<link rel="alternate" hreflang="en" href="'.url('/en').'">', false)
        ->assertSee('<link rel="alternate" hreflang="x-default" href="'.url('/').'">', false)
        ->assertSee('<meta property="og:url" content="'.url($path).'">', false)
        ->assertSee('<meta property="og:locale" content="'.$ogLocale.'">', false)
        ->assertSee('<meta property="og:locale:alternate" content="'.$ogAlternate.'">', false);
})->with([
    'polish' => ['/', 'pl', 'pl_PL', 'en_US'],
    'english' => ['/en', 'en', 'en_US', 'pl_PL'],
]);

it('renders the english SEO tags, share image and JSON-LD on /en', function () {
    $response = $this->get('/en')->assertOk();
    $imageUrl = asset('assets/images/og-netizo-en.png');

    $response
        ->assertSee('<title>Websites and Web Apps for Ambitious Companies | Netizo</title>', false)
        ->assertSee('<meta property="og:image" content="'.$imageUrl.'">', false)
        ->assertSee('<meta name="twitter:image" content="'.$imageUrl.'">', false)
        ->assertDontSee('Tworzymy Strony WWW dla Ambitnych Firm', false)
        ->assertDontSee('og-netizo-2.png', false);

    preg_match_all('/<script type="application\/ld\+json">(.*?)<\/script>/s', $response->getContent(), $matches);

    $schemas = collect($matches[1])->map(fn (string $json): mixed => json_decode(trim($json), true));
    $faqSchema = $schemas->firstWhere('@type', 'FAQPage');
    $organization = $schemas->firstWhere('@type', 'ProfessionalService');

    expect($faqSchema['inLanguage'])->toBe('en')
        ->and(collect($faqSchema['mainEntity'])->pluck('name')->all())->toBe(array_column($response->viewData('page')['props']['faq'], 'question'))
        ->and($organization['url'])->toBe(url('/en'))
        ->and($organization['image'])->toBe($imageUrl)
        ->and($organization['areaServed'])->toBe(['@type' => 'Country', 'name' => 'Poland'])
        ->and($organization['knowsLanguage'])->toBe(['pl', 'en']);

    expect(public_path('assets/images/og-netizo-en.png'))->toBeFile()
        ->and(array_slice(getimagesize(public_path('assets/images/og-netizo-en.png')), 0, 2))->toBe([1200, 630])
        ->and(filesize(public_path('assets/images/og-netizo-en.png')))->toBeLessThan(300 * 1024);
});

it('shows the english copy of a project on /en and falls back to polish field by field', function () {
    createHomePageProject([
        'slug' => 'przetlumaczony',
        'title' => 'Złoty Kłos',
        'category_en' => 'Company website',
        'description_en' => 'Short project description.',
        'full_description_en' => '   ',
        'metrics_en' => [['value' => '+40%', 'label' => 'conversion rate']],
        'challenges_en' => [['challenge' => 'A challenge']],
        'solutions_en' => null,
    ]);

    $this->get('/en')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('projects.0.category', 'Company website')
            ->where('projects.0.description', 'Short project description.')
            ->where('projects.0.fullDescription', 'Pełny opis projektu.')
            ->where('projects.0.metrics', [['value' => '+40%', 'label' => 'conversion rate']])
            ->where('projects.0.challenges', ['A challenge'])
            ->where('projects.0.solutions', ['Rozwiązanie'])
            ->where('projects.0.title', 'Złoty Kłos')
            ->where('projects.0.techStack', ['Laravel', 'React']));

    $this->get('/')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('projects.0.category', 'Strona firmowa')
            ->where('projects.0.description', 'Krótki opis projektu.')
            ->where('projects.0.metrics', [['value' => '+40%', 'label' => 'konwersji']])
            ->where('projects.0.challenges', ['Wyzwanie']));
});

it('shows the polish copy on /en for a project without an english one', function () {
    createHomePageProject();

    $this->get('/en')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('projects.0.category', 'Strona firmowa')
            ->where('projects.0.description', 'Krótki opis projektu.')
            ->where('projects.0.fullDescription', 'Pełny opis projektu.')
            ->where('projects.0.metrics', [['value' => '+40%', 'label' => 'konwersji']])
            ->where('projects.0.challenges', ['Wyzwanie'])
            ->where('projects.0.solutions', ['Rozwiązanie']));
});
