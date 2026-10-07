<?php

use Illuminate\Foundation\Exceptions\RegisterErrorViewPaths;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Vite;

beforeEach(function () {
    Route::middleware('web')->get('/_error-probe/{status}', fn (int $status) => abort($status));
});

function errorPageHtmlTag(string $content): string
{
    preg_match('/<html\b[^>]*>/', $content, $matches);

    return $matches[0] ?? '';
}

it('renders the 404 page in the homepage style', function () {
    $response = $this->get('/this-page-does-not-exist')
        ->assertNotFound()
        ->assertSee('<meta name="robots" content="noindex">', false)
        ->assertSee('<title>404 – Nie ma takiej strony | Voxbit</title>', false)
        ->assertSee('Nie ma takiej strony')
        ->assertSee('Adres mógł się zmienić albo strona została usunięta. Sprawdź, czy w&nbsp;adresie nie ma literówki.', false)
        ->assertSee('Pod tym adresem nic nie ma')
        ->assertSee('/this-page-does-not-exist')
        ->assertSee('<a class="button button--primary" href="/">Strona główna</a>', false)
        ->assertSee('<a class="button button--outline" href="/#kontakt">Napisz do nas</a>', false)
        ->assertSee('href="mailto:kontakt@voxbit.pl"', false)
        ->assertSee('href="tel:+48884343924"', false)
        ->assertSee('© '.date('Y').' Voxbit. Wszelkie prawa zastrzeżone.');

    expect(errorPageHtmlTag($response->getContent()))->toBe('<html lang="pl">');
});

it('links the homepage sections and the client panel from the header', function () {
    $this->get('/this-page-does-not-exist')
        ->assertNotFound()
        ->assertSee('<nav class="site-nav" aria-label="Sekcje strony">', false)
        ->assertSeeInOrder(['href="/#uslugi"', 'href="/#projekty"', 'href="/#proces"', 'href="/#faq"', 'href="/#kontakt"'], false)
        ->assertSee('href="https://panel-klienta.voxbit.pl" target="_blank" rel="noopener"', false);
});

it('loads nothing from outside the site and runs no scripts', function () {
    $content = $this->get('/this-page-does-not-exist')->assertNotFound()->getContent();

    expect($content)
        ->not->toContain('fonts.googleapis')
        ->not->toContain('fonts.gstatic')
        ->not->toContain('googletagmanager')
        ->not->toContain('<script')
        ->not->toContain("url('http")
        ->and(strtolower($content))->not->toContain('f7d000');
});

it('shows the requested address escaped', function () {
    $this->get('/<script>alert(1)</script>')
        ->assertNotFound()
        ->assertSee('&lt;script&gt;alert(1)&lt;/script&gt;', false)
        ->assertDontSee('<script>alert(1)</script>', false);
});

it('shows only the cleaned path of the requested address', function () {
    $this->get('/%E2%80%AEgnp.exe%0A?ref=zadzwon-pod-123')
        ->assertNotFound()
        ->assertSee('<span class="window__path">/gnp.exe</span>', false)
        ->assertDontSee("\u{202E}", false)
        ->assertDontSee('zadzwon-pod-123');
});

it('uses the dark theme only when the visitor chose it', function () {
    expect(errorPageHtmlTag($this->get('/this-page-does-not-exist')->getContent()))->toBe('<html lang="pl">');

    expect(errorPageHtmlTag($this->withUnencryptedCookie('appearance', 'light')->get('/this-page-does-not-exist')->getContent()))
        ->toBe('<html lang="pl">');

    expect(errorPageHtmlTag($this->withUnencryptedCookie('appearance', 'dark')->get('/this-page-does-not-exist')->getContent()))
        ->toBe('<html lang="pl" class="dark">');

    expect(errorPageHtmlTag($this->withUnencryptedCookie('appearance', 'dark')->get('/_error-probe/403')->getContent()))
        ->toBe('<html lang="pl" class="dark">');
});

it('renders each error page with its own copy and visual', function (int $status, string $title, string $description, string $primaryAction, string $chipTitle) {
    $this->get("/_error-probe/{$status}")
        ->assertStatus($status)
        ->assertSee("<title>{$status} – {$title} | Voxbit</title>", false)
        ->assertSee($title)
        ->assertSee("<p class=\"error__lead\">{$description}</p>", false)
        ->assertSee(">{$primaryAction}</a>", false)
        ->assertSee("<span class=\"chip__title\">{$chipTitle}</span>", false)
        ->assertSee('kontakt@voxbit.pl')
        ->assertSee('<link rel="icon" type="image/svg+xml" href="'.asset('favicon.svg').'?v=2" />', false)
        ->assertDontSee('fonts.googleapis', false);
})->with([
    '401' => [401, 'Wymagane logowanie', 'Ta strona jest dostępna tylko po zalogowaniu.', 'Strona główna', 'Strona dla zalogowanych'],
    '402' => [402, 'Wymagana płatność', 'Dostęp do tej strony wymaga opłaty. Jeśli to pomyłka, skontaktuj się z&nbsp;nami.', 'Strona główna', 'Treść płatna'],
    '403' => [403, 'Brak dostępu', 'Nie masz uprawnień, żeby zobaczyć tę stronę.', 'Strona główna', 'Dostęp zablokowany'],
    '419' => [419, 'Sesja wygasła', 'Formularz był otwarty zbyt długo i&nbsp;ze względów bezpieczeństwa stracił ważność. Otwórz go ponownie i&nbsp;wyślij jeszcze raz.', 'Wróć do formularza', 'Formularz wygasł'],
    '429' => [429, 'Zbyt wiele prób', 'W&nbsp;krótkim czasie wysłano zbyt wiele zapytań. Odczekaj minutę i&nbsp;spróbuj ponownie.', 'Strona główna', 'Odczekaj minutę'],
    '500' => [500, 'Coś poszło nie tak', 'To błąd na naszym serwerze. Spróbuj ponownie za kilka minut.', 'Strona główna', 'Serwer nie odpowiada'],
    '503' => [503, 'Trwają prace techniczne', 'Aktualizujemy stronę. Wróć za kilka minut.', 'Odśwież stronę', 'Aktualizacja w toku'],
]);

it('shows only the logo, a reload button and the contact line during maintenance', function () {
    $this->get('/_error-probe/503')
        ->assertServiceUnavailable()
        ->assertDontSee('Napisz do nas')
        ->assertDontSee('Sekcje strony')
        ->assertDontSee('Panel klienta')
        ->assertSee('aria-label="Voxbit – strona główna"', false)
        ->assertSee('href="mailto:kontakt@voxbit.pl"', false)
        ->assertSee('<a class="button button--primary" href="">Odśwież stronę</a>', false);
});

it('goes back to the page the expired form was on, never another site', function () {
    $this->withHeader('Referer', url('/oferta'))
        ->get('/_error-probe/419')
        ->assertSee('href="'.url('/oferta').'">Wróć do formularza', false);

    $host = parse_url(url('/'), PHP_URL_HOST);
    $otherOrigins = [
        'https://example.com/formularz',
        'javascript://'.$host.'/%0Aalert(1)',
        'https://evil.example\\@'.$host.'/formularz',
        'https://'.$host.'.evil.example/formularz',
        'https://'.$host.':8443/formularz',
    ];

    foreach ($otherOrigins as $referer) {
        $this->withHeader('Referer', $referer)
            ->get('/_error-probe/419')
            ->assertSee('href="/">Wróć do formularza', false)
            ->assertDontSee('evil.example')
            ->assertDontSee('example.com')
            ->assertDontSee('javascript:', false)
            ->assertDontSee(':8443', false);
    }
});

it('styles client and server errors without their own view', function () {
    $this->get('/kontakt')
        ->assertMethodNotAllowed()
        ->assertSee('<title>405 – Nie udało się otworzyć strony | Voxbit</title>', false)
        ->assertSee('Nie możemy obsłużyć tego zapytania. Sprawdź adres strony.')
        ->assertSee('Zapytanie odrzucone');

    $this->get('/_error-probe/502')
        ->assertStatus(502)
        ->assertSee('<title>502 – Coś poszło nie tak | Voxbit</title>', false)
        ->assertSee('Serwer nie odpowiada');
});

it('renders without the Vite manifest, falling back to system fonts', function () {
    Vite::useBuildDirectory('missing-build-'.uniqid())
        ->useHotFile(storage_path('framework/testing/missing-hot-'.uniqid()));

    $content = $this->get('/this-page-does-not-exist')
        ->assertNotFound()
        ->assertSee('Nie ma takiej strony')
        ->getContent();

    expect($content)
        ->not->toContain('@font-face')
        ->not->toContain('rel="preload"')
        ->toContain('system-ui');
});

it('prerenders the maintenance page outside an HTTP request', function () {
    Vite::useBuildDirectory('missing-build-'.uniqid())
        ->useHotFile(storage_path('framework/testing/missing-hot-'.uniqid()));

    (new RegisterErrorViewPaths)();

    expect(view('errors::503', ['retryAfter' => null])->render())
        ->toContain('<title>503 – Trwają prace techniczne | Voxbit</title>')
        ->toContain('Aktualizujemy stronę. Wróć za kilka minut.')
        ->toContain('Aktualizacja w toku')
        ->not->toContain('Sekcje strony')
        ->not->toContain('@font-face');
});
