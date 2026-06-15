<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Project;
use Artesaos\SEOTools\Facades\SEOMeta;
use Artesaos\SEOTools\Facades\OpenGraph;
use Artesaos\SEOTools\Facades\TwitterCard;
use Artesaos\SEOTools\Facades\JsonLd;
use Illuminate\View\View;

class HomeController extends Controller
{
    public function index(): View
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

        // JSON-LD Structured Data - Organization
        JsonLd::setTitle('Tworzymy Strony WWW dla Ambitnych Firm | Voxbit')
            ->setDescription('Profesjonalne tworzenie stron internetowych i aplikacji webowych dla firm. Nowoczesny design, szybkość i SEO w standardzie. 150+ projektów, 8 lat doświadczenia.')
            ->setType('ProfessionalService')
            ->setUrl(url('/'))
            ->addImage($imageUrl)
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

        // FAQ Schema
        $faqSchema = [
            '@context' => 'https://schema.org',
            '@type' => 'FAQPage',
            'mainEntity' => [
                [
                    '@type' => 'Question',
                    'name' => 'Ile kosztuje stworzenie aplikacji webowej?',
                    'acceptedAnswer' => [
                        '@type' => 'Answer',
                        'text' => 'Koszt zależy od złożoności projektu. Proste strony zaczynają się od 1-5k PLN, rozbudowane strony i małe sklepy od 5-15k PLN, aplikacje webowe od 15-50k PLN, a systemy enterprise od 50k PLN wzwyż. Każdy projekt wyceniamy indywidualnie po analizie wymagań.',
                    ],
                ],
                [
                    '@type' => 'Question',
                    'name' => 'Jak długo trwa realizacja projektu?',
                    'acceptedAnswer' => [
                        '@type' => 'Answer',
                        'text' => 'Landing page to 2-3 tygodnie, strona firmowa 4-6 tygodni, aplikacja webowa 2-4 miesiące. Dokładny czas ustalamy po określeniu zakresu. Pracujemy w metodologii Agile z regularnymi dostawami.',
                    ],
                ],
                [
                    '@type' => 'Question',
                    'name' => 'Czy zapewniacie wsparcie po wdrożeniu?',
                    'acceptedAnswer' => [
                        '@type' => 'Answer',
                        'text' => 'Tak, oferujemy pakiety wsparcia SLA z gwarantowanym czasem reakcji. Zajmujemy się hostingiem, aktualizacjami bezpieczeństwa, backupami i rozwojem funkcjonalności. Większość klientów zostaje z nami na stałe.',
                    ],
                ],
                [
                    '@type' => 'Question',
                    'name' => 'Jakie technologie wykorzystujecie?',
                    'acceptedAnswer' => [
                        '@type' => 'Answer',
                        'text' => 'Frontend: React, Next.js, Vue.js, Tailwind CSS. Backend: Node.js, Go, Laravel, Python. Bazy danych: PostgreSQL, MongoDB, Redis. Cloud: AWS, GCP, Vercel. Dobieramy stack do potrzeb projektu.',
                    ],
                ],
                [
                    '@type' => 'Question',
                    'name' => 'Czy mogę zobaczyć postępy w trakcie pracy?',
                    'acceptedAnswer' => [
                        '@type' => 'Answer',
                        'text' => 'Oczywiście! Pracujemy transparentnie - masz dostęp do repozytorium kodu, środowiska staging i regularnych demo co 1-2 tygodnie. Używamy Slack/Discord do bieżącej komunikacji i Linear do śledzenia zadań.',
                    ],
                ],
                [
                    '@type' => 'Question',
                    'name' => 'Czy pomagacie z designem jeśli go nie mam?',
                    'acceptedAnswer' => [
                        '@type' => 'Answer',
                        'text' => 'Tak, mamy w zespole doświadczonych UI/UX designerów. Możemy stworzyć kompletny projekt graficzny od zera lub pracować na Twoich szkicach i wytycznych brandingowych. Design jest zawsze dostarczany w Figmie.',
                    ],
                ],
            ],
        ];

        return view('home', compact('projects', 'clients', 'faqSchema'));
    }
}
