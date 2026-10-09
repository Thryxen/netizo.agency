<?php

namespace App\Http\Controllers;

use App\Services\LocalizedRoutes;
use Artesaos\SEOTools\Facades\JsonLdMulti;
use Artesaos\SEOTools\Facades\OpenGraph;
use Artesaos\SEOTools\Facades\SEOMeta;
use Artesaos\SEOTools\Facades\TwitterCard;
use Inertia\Inertia;
use Inertia\Response;

class PartnerProgramController extends Controller
{
    public function index(): Response
    {
        $title = __('partners.seo.title');
        $description = __('partners.seo.description');
        $imageUrl = asset(__('partners.seo.image'));

        SEOMeta::setTitle($title);
        SEOMeta::setDescription($description);
        SEOMeta::addKeyword(__('partners.seo.keywords'));

        OpenGraph::setTitle($title)
            ->setDescription($description)
            ->setType('website')
            ->setSiteName('Netizo')
            ->addImage($imageUrl, ['width' => 1200, 'height' => 630]);

        TwitterCard::setTitle($title)
            ->setDescription($description)
            ->setType('summary_large_image')
            ->setImage($imageUrl);

        $this->localizedSeo('partners');

        JsonLdMulti::setTitle(__('partners.seo.name'))
            ->setDescription($description)
            ->setType('WebPage')
            ->setUrl(LocalizedRoutes::url('partners'))
            ->setImage($imageUrl)
            ->addValue('inLanguage', app()->getLocale());

        $faq = $this->faq();

        return Inertia::render('partners', [
            'faq' => $faq,
        ])->withViewData([
            'faqSchema' => $this->faqSchema($faq),
        ]);
    }

    /**
     * Questions about the partner programme in the current language (lang/{pl,en}/partners.php) — the single source
     * for the page's FAQ and its JSON-LD.
     *
     * @return list<array{question: string, answer: string}>
     */
    private function faq(): array
    {
        return __('partners.faq');
    }
}
