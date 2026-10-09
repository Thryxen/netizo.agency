<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Project;
use App\Services\LocalizedRoutes;
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
        $imageUrl = asset(__('home.seo.image'));
        $title = __('home.seo.title');
        $shareDescription = __('home.seo.share_description');

        SEOMeta::setTitle($title);
        SEOMeta::setDescription(__('home.seo.description'));
        SEOMeta::addKeyword(__('home.seo.keywords'));

        OpenGraph::setTitle($title)
            ->setDescription($shareDescription)
            ->setType('website')
            ->setSiteName('Netizo')
            ->addImage($imageUrl, ['width' => 1200, 'height' => 630]);

        TwitterCard::setTitle($title)
            ->setDescription($shareDescription)
            ->setType('summary_large_image')
            ->setImage($imageUrl);

        $this->localizedSeo('home');

        // JSON-LD Structured Data - Organization (SEO::generate() renders the JsonLdMulti instance, not JsonLd)
        JsonLdMulti::setTitle('Netizo')
            ->setDescription(__('home.seo.organization_description'))
            ->setType('ProfessionalService')
            ->setUrl(LocalizedRoutes::url('home'))
            ->setImage($imageUrl)
            ->addValue('address', [
                '@type' => 'PostalAddress',
                'addressLocality' => 'Leszno',
                'addressRegion' => 'wielkopolskie',
                'addressCountry' => 'PL',
            ])
            ->addValue('areaServed', [
                '@type' => 'Country',
                'name' => __('home.seo.country'),
            ])
            ->addValue('knowsLanguage', LocalizedRoutes::LOCALES)
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
     * Frequently asked questions in the current language (lang/{pl,en}/home.php) — the single source for the FAQ
     * section and its JSON-LD.
     *
     * @return list<array{question: string, answer: string}>
     */
    private function faq(): array
    {
        return __('home.faq');
    }

    /**
     * @return array{id: int, slug: string, title: string, url: string, liveUrl: string, category: string, description: string, fullDescription: string, thumbnailUrl: string|null, fullImageUrl: string|null, techStack: list<string>, metrics: list<array{value: string, label: string}>, challenges: list<string>, solutions: list<string>}
     */
    private function projectProps(Project $project): array
    {
        $url = (string) $project->url;
        $metrics = $this->metricList($this->translated($project, 'metrics'));

        return [
            'id' => $project->id,
            'slug' => $project->slug,
            'title' => $project->title,
            'url' => $url,
            'liveUrl' => $this->absoluteUrl($url) ?? '',
            'category' => (string) $this->translated($project, 'category'),
            'description' => (string) $this->translated($project, 'description'),
            'fullDescription' => (string) $this->translated($project, 'full_description'),
            'thumbnailUrl' => $project->thumbnail_image ? asset('storage/'.$project->thumbnail_image) : null,
            'fullImageUrl' => $project->full_image ? asset('storage/'.$project->full_image) : null,
            'techStack' => $this->stringList($project->tech_stack),
            'metrics' => $metrics,
            'challenges' => $this->stringList($this->translated($project, 'challenges')),
            'solutions' => $this->stringList($this->translated($project, 'solutions')),
        ];
    }

    /**
     * A project column in the current language: on the English site its `_en` twin, unless that one is empty (the
     * Polish copy is shown until the English one is filled in the panel).
     */
    private function translated(Project $project, string $column): mixed
    {
        if (app()->getLocale() === 'pl') {
            return $project->{$column};
        }

        $value = $project->{"{$column}_en"};
        $isEmpty = is_array($value) ? $this->stringList($value) === [] && $this->metricList($value) === [] : trim((string) $value) === '';

        return $isEmpty ? $project->{$column} : $value;
    }

    /**
     * @return list<array{value: string, label: string}>
     */
    private function metricList(mixed $value): array
    {
        return collect(is_array($value) ? $value : [])
            ->filter(fn (mixed $metric): bool => is_array($metric) && (filled($metric['value'] ?? null) || filled($metric['label'] ?? null)))
            ->map(fn (array $metric): array => [
                'value' => (string) ($metric['value'] ?? ''),
                'label' => (string) ($metric['label'] ?? ''),
            ])
            ->values()
            ->all();
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
