<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Project;
use Artesaos\SEOTools\Facades\JsonLdMulti;
use Artesaos\SEOTools\Facades\OpenGraph;
use Artesaos\SEOTools\Facades\SEOMeta;
use Artesaos\SEOTools\Facades\TwitterCard;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(): Response
    {
        $projects = Project::active()->ordered()->get();
        $clients = Client::active()->ordered()->get();
        $imageUrl = asset('assets/images/og-image.jpg');

        // Meta tags
        SEOMeta::setTitle('Tworzymy Strony WWW dla Ambitnych Firm | Netizo');
        SEOMeta::setDescription('Profesjonalne tworzenie stron internetowych i aplikacji webowych dla firm. Nowoczesny design, szybkość i SEO w standardzie. React, Next.js, Laravel. 150+ projektów, 8 lat doświadczenia. Bezpłatna wycena!');
        SEOMeta::setCanonical(url('/'));
        SEOMeta::addKeyword([
            // Główne frazy
            'tworzenie stron internetowych', 'strony WWW dla firm', 'profesjonalne strony internetowe',
            'projektowanie stron WWW', 'responsywne strony internetowe', 'nowoczesne strony WWW',
            'agencja interaktywna', 'software house', 'aplikacje webowe', 'sklepy internetowe',
            // Technologie
            'React', 'Next.js', 'Node.js', 'Laravel', 'web development', 'Polska', 'netizo', 'Wielkopolska',
            // Leszno
            'Leszno', 'programista Leszno', 'tworzenie stron Leszno', 'strony internetowe Leszno', 'software house Leszno',
            // Duże miasta
            'Poznań', 'programista Poznań', 'tworzenie stron Poznań', 'strony internetowe Poznań',
            'Wrocław', 'programista Wrocław', 'tworzenie stron Wrocław', 'strony internetowe Wrocław',
            'Kalisz', 'programista Kalisz', 'tworzenie stron Kalisz', 'strony internetowe Kalisz',
            'Głogów', 'programista Głogów', 'tworzenie stron Głogów', 'strony internetowe Głogów',
            // Średnie miasta
            'Rawicz', 'programista Rawicz', 'tworzenie stron Rawicz',
            'Kościan', 'programista Kościan', 'tworzenie stron Kościan',
            'Gostyń', 'programista Gostyń', 'tworzenie stron Gostyń',
            'Śrem', 'programista Śrem', 'tworzenie stron Śrem',
            'Góra', 'programista Góra', 'tworzenie stron Góra',
            'Wschowa', 'programista Wschowa', 'tworzenie stron Wschowa',
            // Mniejsze miejscowości
            'Rydzyna', 'programista Rydzyna', 'tworzenie stron Rydzyna',
            'Osieczna', 'programista Osieczna', 'tworzenie stron Osieczna',
            'Bojanowo', 'programista Bojanowo', 'tworzenie stron Bojanowo',
            'Poniec', 'programista Poniec', 'tworzenie stron Poniec',
            'Krobia', 'programista Krobia', 'tworzenie stron Krobia',
            'Jutrosin', 'programista Jutrosin', 'tworzenie stron Jutrosin',
            'Miejska Górka', 'programista Miejska Górka', 'tworzenie stron Miejska Górka',
        ]);

        // Open Graph
        OpenGraph::setTitle('Tworzymy Strony WWW dla Ambitnych Firm | Netizo')
            ->setDescription('Profesjonalne strony internetowe i aplikacje webowe. Nowoczesny design, szybkość, SEO. 150+ projektów. Bezpłatna wycena!')
            ->setType('website')
            ->setSiteName('Netizo')
            ->setUrl(url('/'))
            ->addImage($imageUrl, ['width' => 1200, 'height' => 630]);

        // Twitter Card
        TwitterCard::setTitle('Tworzymy Strony WWW dla Ambitnych Firm | Netizo')
            ->setDescription('Profesjonalne strony internetowe i aplikacje webowe. Nowoczesny design, szybkość, SEO. 150+ projektów. Bezpłatna wycena!')
            ->setType('summary_large_image')
            ->setImage($imageUrl);

        // JSON-LD Structured Data - Organization (SEO::generate() renders the JsonLdMulti instance, not JsonLd)
        JsonLdMulti::setTitle('Netizo')
            ->setDescription('Profesjonalne tworzenie stron internetowych i aplikacji webowych dla firm. Nowoczesny design, szybkość i SEO w standardzie. 150+ projektów, 8 lat doświadczenia.')
            ->setType('ProfessionalService')
            ->setUrl(url('/'))
            ->setImage($imageUrl)
            ->addValue('address', [
                '@type' => 'PostalAddress',
                'addressLocality' => 'Leszno',
                'addressRegion' => 'wielkopolskie',
                'addressCountry' => 'PL',
            ])
            ->addValue('areaServed', [
                '@type' => 'Country',
                'name' => 'Polska',
            ])
            ->addValue('knowsLanguage', ['pl', 'en'])
            ->addValue('priceRange', '$$');

        $faq = $this->faq();

        return Inertia::render('home', [
            'projects' => $projects->map(fn (Project $project): array => $this->projectProps($project))->values()->all(),
            'clients' => $clients->map(fn (Client $client): array => $this->clientProps($client))->values()->all(),
            'faq' => $faq,
        ])->withViewData([
            'faqSchema' => $this->faqSchema($faq),
        ]);
    }

    /**
     * Frequently asked questions — the single source for the FAQ section and its JSON-LD.
     * Ranges keep together: a word joiner (U+2060) after the dash, a no-break space (U+00A0) before the unit.
     *
     * @return list<array{question: string, answer: string}>
     */
    private function faq(): array
    {
        return [
            [
                'question' => 'Ile kosztuje strona internetowa lub aplikacja?',
                'answer' => "Prosta strona kosztuje zwykle 1–\u{2060}5\u{00A0}tys.\u{00A0}zł, rozbudowana strona lub mały sklep 5–\u{2060}15\u{00A0}tys.\u{00A0}zł, aplikacja webowa 15–\u{2060}50\u{00A0}tys.\u{00A0}zł, a duże systemy od 50\u{00A0}tys.\u{00A0}zł. Ostateczna cena zależy od zakresu, a dokładną wycenę dostajesz bezpłatnie po briefie.",
            ],
            [
                'question' => 'Ile trwa stworzenie strony lub aplikacji?',
                'answer' => "Landing page powstaje zwykle w 2–\u{2060}3\u{00A0}tygodnie, strona firmowa w 4–\u{2060}6\u{00A0}tygodni, a aplikacja webowa w 2–\u{2060}4\u{00A0}miesiące. Dokładny termin ustalamy po briefie, gdy znamy zakres prac.",
            ],
            [
                'question' => 'Czy strona będzie widoczna w Google?',
                'answer' => 'Tak. Każdą stronę budujemy z myślą o wyszukiwarce: szybkie ładowanie, poprawna struktura nagłówków, tytuły i opisy do wyników wyszukiwania, dane strukturalne i mapa witryny. Konkretnej pozycji nikt uczciwie nie zagwarantuje, bo zależy ona też od konkurencji i treści, ale dostajesz solidne podstawy do pozycjonowania, także lokalnego.',
            ],
            [
                'question' => 'Czy mogę samodzielnie zmieniać treści na stronie?',
                'answer' => 'Tak. Jeśli chcesz to robić we własnym zakresie, dodajemy prosty system do zarządzania treścią (CMS): zmienisz w nim teksty, zdjęcia i wpisy, a my pokażemy, jak z niego korzystać. Większe zmiany zgłaszasz nam jako zadanie w panelu klienta.',
            ],
            [
                'question' => 'Czy zaprojektujecie wygląd strony, jeśli nie mam projektu?',
                'answer' => 'Tak. Mamy w zespole projektantów UI/UX: zaprojektujemy wygląd od zera albo oprzemy się na Twoich szkicach, logo i identyfikacji wizualnej. Zanim zaczniemy programować, dostajesz projekt i klikalny prototyp w Figmie do przejrzenia i akceptacji.',
            ],
            [
                'question' => 'Czy możecie odświeżyć moją obecną stronę, zamiast budować nową?',
                'answer' => 'Tak. Zaczynamy od przeglądu obecnej strony: co działa, co ją spowalnia i co zniechęca klientów. Potem proponujemy odświeżenie wyglądu i treści albo przebudowę, jeśli stara technologia ogranicza rozwój. Przy przebudowie przekierowujemy stare adresy na nowe, żeby ograniczyć ryzyko spadków w Google.',
            ],
            [
                'question' => 'Czy zajmiecie się domeną, hostingiem i pocztą firmową?',
                'answer' => 'Tak. Pomagamy wybrać i skonfigurować domenę, hosting i firmową pocztę albo pracujemy na tym, co już masz. Dostępy trzymasz w zaszyfrowanym sejfie w panelu klienta, a zanim minie termin odnowienia domeny lub hostingu, dostajesz tam przypomnienie.',
            ],
            [
                'question' => 'Czy zapewniacie opiekę nad stroną po wdrożeniu?',
                'answer' => 'Tak. Po publikacji zostajemy z Tobą: dbamy o hosting, aktualizacje bezpieczeństwa, kopie zapasowe, monitoring i dalszy rozwój strony. Poprawki zgłaszasz jako zadania w panelu klienta, a przy stałej współpracy co miesiąc dostajesz rozliczenie z rozpisanymi godzinami.',
            ],
            [
                'question' => 'Czy mogę zobaczyć postępy w trakcie pracy?',
                'answer' => 'Tak. Od początku współpracy masz dostęp do panelu klienta: widzisz zadania i etap każdego z nich, czas pracy i dokumenty, a z zespołem piszesz na czacie. Co dwa tygodnie pokazujemy postępy na wersji testowej.',
            ],
            [
                'question' => 'Czy pracujecie tylko z firmami z Leszna?',
                'answer' => 'Nie. Jesteśmy z Leszna w Wielkopolsce, ale realizujemy projekty dla firm z całej Polski. Większość spraw załatwiamy online: na rozmowach wideo i w panelu klienta. Z firmami z Leszna i okolic chętnie spotkamy się na miejscu.',
            ],
            [
                'question' => 'Jakie technologie wykorzystujecie?',
                'answer' => 'Technologie dobieramy do potrzeb projektu. Najczęściej pracujemy na takim zestawie: interfejs – React, Next.js, Vue.js i Tailwind CSS; serwer – Node.js, Go, Laravel i Python; bazy danych – PostgreSQL, MongoDB i Redis; chmura – AWS, GCP i Vercel.',
            ],
        ];
    }

    /**
     * Build the FAQPage JSON-LD document from the FAQ items.
     *
     * @param  list<array{question: string, answer: string}>  $faq
     * @return array<string, mixed>
     */
    private function faqSchema(array $faq): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'FAQPage',
            'mainEntity' => array_map(fn (array $item): array => [
                '@type' => 'Question',
                'name' => $item['question'],
                'acceptedAnswer' => [
                    '@type' => 'Answer',
                    'text' => $item['answer'],
                ],
            ], $faq),
        ];
    }

    /**
     * @return array{id: int, slug: string, title: string, url: string, liveUrl: string, category: string, description: string, fullDescription: string, thumbnailUrl: string|null, fullImageUrl: string|null, techStack: list<string>, metrics: list<array{value: string, label: string}>, challenges: list<string>, solutions: list<string>}
     */
    private function projectProps(Project $project): array
    {
        $url = (string) $project->url;

        return [
            'id' => $project->id,
            'slug' => $project->slug,
            'title' => $project->title,
            'url' => $url,
            'liveUrl' => $this->absoluteUrl($url) ?? '',
            'category' => (string) $project->category,
            'description' => (string) $project->description,
            'fullDescription' => (string) $project->full_description,
            'thumbnailUrl' => $project->thumbnail_image ? asset('storage/'.$project->thumbnail_image) : null,
            'fullImageUrl' => $project->full_image ? asset('storage/'.$project->full_image) : null,
            'techStack' => $this->stringList($project->tech_stack),
            'metrics' => collect(is_array($project->metrics) ? $project->metrics : [])
                ->filter(fn (mixed $metric): bool => is_array($metric))
                ->map(fn (array $metric): array => [
                    'value' => (string) ($metric['value'] ?? ''),
                    'label' => (string) ($metric['label'] ?? ''),
                ])
                ->values()
                ->all(),
            'challenges' => $this->stringList($project->challenges),
            'solutions' => $this->stringList($project->solutions),
        ];
    }

    /**
     * @return array{id: int, name: string, url: string|null}
     */
    private function clientProps(Client $client): array
    {
        return [
            'id' => $client->id,
            'name' => $client->name,
            'url' => $this->absoluteUrl($client->url),
        ];
    }

    /**
     * Prefix a bare domain with https:// so it is safe to use as an external link.
     */
    private function absoluteUrl(?string $url): ?string
    {
        $url = trim((string) $url);

        if ($url === '') {
            return null;
        }

        return Str::startsWith(Str::lower($url), ['https://', 'http://']) ? $url : 'https://'.$url;
    }

    /**
     * Coerce a JSON array cast (which may be null, or hold repeater rows like ['challenge' => '…']) into a list of strings.
     *
     * @return list<string>
     */
    private function stringList(mixed $value): array
    {
        if (! is_array($value)) {
            return [];
        }

        return collect($value)
            ->map(fn (mixed $item): mixed => is_array($item) ? collect($item)->first(fn (mixed $field): bool => is_scalar($field)) : $item)
            ->filter(fn (mixed $item): bool => is_scalar($item) && trim((string) $item) !== '')
            ->map(fn (mixed $item): string => (string) $item)
            ->values()
            ->all();
    }
}
