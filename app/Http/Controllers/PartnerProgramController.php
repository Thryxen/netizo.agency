<?php

namespace App\Http\Controllers;

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
        $title = 'Program partnerski: 15% prowizji za polecenie | Netizo';
        $description = 'Polecaj Netizo firmom, które potrzebują strony, sklepu lub aplikacji, i dostawaj 15% netto od każdej opłaconej faktury klienta przez 12 miesięcy. Bez opłat i bez limitu poleceń.';
        $imageUrl = asset('assets/images/og-netizo-partnerzy.png');

        SEOMeta::setTitle($title);
        SEOMeta::setDescription($description);
        SEOMeta::setCanonical(url('/partnerzy'));
        SEOMeta::addKeyword([
            'program partnerski', 'program poleceń', 'prowizja za polecenie', 'polecanie klientów',
            'współpraca partnerska', 'prowizja 15%', 'netizo', 'tworzenie stron internetowych',
        ]);

        OpenGraph::setTitle($title)
            ->setDescription($description)
            ->setType('website')
            ->setSiteName('Netizo')
            ->setUrl(url('/partnerzy'))
            ->addImage($imageUrl, ['width' => 1200, 'height' => 630]);

        TwitterCard::setTitle($title)
            ->setDescription($description)
            ->setType('summary_large_image')
            ->setImage($imageUrl);

        JsonLdMulti::setTitle('Program partnerski Netizo')
            ->setDescription($description)
            ->setType('WebPage')
            ->setUrl(url('/partnerzy'))
            ->setImage($imageUrl);

        $faq = $this->faq();

        return Inertia::render('partners', [
            'faq' => $faq,
        ])->withViewData([
            'faqSchema' => $this->faqSchema($faq),
        ]);
    }

    /**
     * Questions about the partner programme — the single source for the page's FAQ and its JSON-LD.
     * Numbers keep their unit on the same line: a no-break space (U+00A0) before it.
     *
     * @return list<array{question: string, answer: string}>
     */
    private function faq(): array
    {
        return [
            [
                'question' => 'Kto może zostać partnerem?',
                'answer' => 'Każdy, kto zna właścicieli firm: biuro rachunkowe, agencja marketingowa, grafik, doradca, nasz klient albo osoba prywatna. Nie musisz mieć doświadczenia w sprzedaży ani znać się na stronach internetowych.',
            ],
            [
                'question' => 'Czy muszę prowadzić działalność gospodarczą?',
                'answer' => 'Nie. Z firmą rozliczamy się na podstawie faktury, a z osobą prywatną podpisujemy umowę i wypłacamy prowizję na jej podstawie.',
            ],
            [
                'question' => 'Od czego liczona jest prowizja?',
                'answer' => "Od wartości netto każdej faktury, którą polecony klient opłaci w ciągu 12\u{00A0}miesięcy od pierwszego zamówienia: za projekt, rozbudowę i opiekę techniczną. Jeśli klient zamówi stronę za 10\u{00A0}000\u{00A0}zł netto, dostajesz 1\u{00A0}500\u{00A0}zł.",
            ],
            [
                'question' => 'Kiedy dostanę pieniądze?',
                'answer' => "W ciągu 14\u{00A0}dni od dnia, w którym klient opłaci fakturę. Przy każdej wypłacie dostajesz zestawienie: za jakie zamówienie i od jakiej kwoty.",
            ],
            [
                'question' => 'Skąd będziecie wiedzieć, że klient jest ode mnie?',
                'answer' => 'Klient podaje Twój kod partnera w briefie albo na pierwszej rozmowie. Możesz też sam przekazać nam jego kontakt, za jego zgodą. Każde polecenie potwierdzamy Ci mailem.',
            ],
            [
                'question' => 'Czy polecony klient zapłaci przez to więcej?',
                'answer' => 'Nie. Prowizję płacimy z naszej marży, więc klient dostaje taką samą wycenę jak bez polecenia.',
            ],
            [
                'question' => 'Czy muszę brać udział w rozmowach i wycenie?',
                'answer' => 'Nie. Wystarczy, że przekażesz kontakt. Rozmowy, wycenę, projekt i wdrożenie bierzemy na siebie. Jeśli chcesz, możesz być na pierwszym spotkaniu.',
            ],
            [
                'question' => 'Co, jeśli polecona firma już się z wami kontaktowała?',
                'answer' => "Prowizja dotyczy nowych klientów, czyli firm, z którymi nie rozmawialiśmy o współpracy w ostatnich 12\u{00A0}miesiącach. Jeśli ktoś był już u nas, powiemy Ci o tym zaraz po zgłoszeniu polecenia.",
            ],
            [
                'question' => 'Czy jest limit poleceń albo zarobków?',
                'answer' => 'Nie. Możesz polecić dowolną liczbę firm z całej Polski, a prowizja należy się od każdej z nich.',
            ],
        ];
    }
}
