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
        $imageUrl = asset('assets/images/voxbit.png');

        // Meta tags
        SEOMeta::setTitle('Tworzymy Strony WWW dla Ambitnych Firm | Voxbit');
        SEOMeta::setDescription('Profesjonalne tworzenie stron internetowych i aplikacji webowych dla firm. Nowoczesny design, szybkość i SEO w standardzie. React, Next.js, Laravel. 150+ projektów, 8 lat doświadczenia. Bezpłatna wycena!');
        SEOMeta::setCanonical(url('/'));
        SEOMeta::addKeyword([
            // Główne frazy
            'tworzenie stron internetowych', 'strony WWW dla firm', 'profesjonalne strony internetowe',
            'projektowanie stron WWW', 'responsywne strony internetowe', 'nowoczesne strony WWW',
            'agencja interaktywna', 'software house', 'aplikacje webowe', 'sklepy internetowe',
            // Technologie
            'React', 'Next.js', 'Node.js', 'Laravel', 'web development', 'Polska', 'voxbit', 'Wielkopolska',
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
        OpenGraph::setTitle('Tworzymy Strony WWW dla Ambitnych Firm | Voxbit')
            ->setDescription('Profesjonalne strony internetowe i aplikacje webowe. Nowoczesny design, szybkość, SEO. 150+ projektów. Bezpłatna wycena!')
            ->setType('website')
            ->setSiteName('Voxbit')
            ->setUrl(url('/'))
            ->addImage($imageUrl, ['width' => 1200, 'height' => 630]);

        // Twitter Card
        TwitterCard::setTitle('Tworzymy Strony WWW dla Ambitnych Firm | Voxbit')
            ->setDescription('Profesjonalne strony internetowe i aplikacje webowe. Nowoczesny design, szybkość, SEO. 150+ projektów. Bezpłatna wycena!')
            ->setType('summary_large_image')
            ->setImage($imageUrl);

        // JSON-LD Structured Data - Organization (SEO::generate() renders the JsonLdMulti instance, not JsonLd)
        JsonLdMulti::setTitle('Tworzymy Strony WWW dla Ambitnych Firm | Voxbit')
            ->setDescription('Profesjonalne tworzenie stron internetowych i aplikacji webowych dla firm. Nowoczesny design, szybkość i SEO w standardzie. 150+ projektów, 8 lat doświadczenia.')
            ->setType('ProfessionalService')
            ->setUrl(url('/'))
            ->setImage($imageUrl)
            ->addValue('sameAs', [
                'https://facebook.com/voxbitpl',
                'https://instagram.com/voxbitpl',
                'https://linkedin.com/company/voxbitpl',
                'https://github.com/voxbit-pl',
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
     *
     * @return list<array{question: string, answer: string}>
     */
    private function faq(): array
    {
        return [
            [
                'question' => 'Ile kosztuje strona lub aplikacja?',
                'answer' => 'To zależy od zakresu. Prosta strona to zwykle 1–5 tys. zł, rozbudowana strona lub mały sklep 5–15 tys. zł, aplikacja webowa 15–50 tys. zł, a duże systemy od 50 tys. zł. Dokładną wycenę dostajesz po briefie.',
            ],
            [
                'question' => 'Jak długo trwa realizacja projektu?',
                'answer' => 'Landing page to 2–3 tygodnie, strona firmowa 4–6 tygodni, aplikacja webowa 2–4 miesiące. Dokładny czas ustalamy po określeniu zakresu. Pracujemy w dwutygodniowych etapach i po każdym pokazujemy postępy.',
            ],
            [
                'question' => 'Czy zapewniacie wsparcie po wdrożeniu?',
                'answer' => 'Tak. Po starcie zostajemy z Tobą: hosting, aktualizacje bezpieczeństwa, kopie zapasowe i rozwój strony, a poprawki zgłaszasz jako zadania w panelu klienta. Większość klientów zostaje z nami na stałe.',
            ],
            [
                'question' => 'Jakie technologie wykorzystujecie?',
                'answer' => 'Frontend: React, Next.js, Vue.js, Tailwind CSS. Backend: Node.js, Go, Laravel, Python. Bazy danych: PostgreSQL, MongoDB, Redis. Cloud: AWS, GCP, Vercel. Dobieramy stack do potrzeb projektu.',
            ],
            [
                'question' => 'Czy mogę zobaczyć postępy w trakcie pracy?',
                'answer' => 'Tak. Od pierwszego dnia masz dostęp do panelu klienta: widzisz zadania i ich etap, czas pracy, dokumenty i czat z zespołem. Co dwa tygodnie pokazujemy postępy na wersji testowej.',
            ],
            [
                'question' => 'Czy pomagacie z designem, jeśli go nie mam?',
                'answer' => 'Tak, mamy w zespole doświadczonych UI/UX designerów. Możemy stworzyć kompletny projekt graficzny od zera lub pracować na Twoich szkicach i wytycznych brandingowych. Design jest zawsze dostarczany w Figmie.',
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
