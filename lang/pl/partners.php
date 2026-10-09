<?php

/*
 * Server-side copy of the partner programme page (PartnerProgramController): meta tags and the FAQ, the single source
 * for the page's FAQ and its JSON-LD. English twin: lang/en/partners.php (same keys).
 * Numbers keep their unit on the same line: a no-break space (U+00A0) before it.
 */
return [
    'seo' => [
        'title' => 'Program partnerski: 15% prowizji za polecenie | Netizo',
        'description' => 'Polecaj Netizo firmom, które potrzebują strony, sklepu lub aplikacji, i dostawaj 15% netto od każdej opłaconej faktury klienta przez 12 miesięcy. Bez opłat i bez limitu poleceń.',
        'name' => 'Program partnerski Netizo',
        'image' => 'assets/images/og-netizo-partnerzy.png',
        'keywords' => [
            'program partnerski', 'program poleceń', 'prowizja za polecenie', 'polecanie klientów',
            'współpraca partnerska', 'prowizja 15%', 'netizo', 'tworzenie stron internetowych',
        ],
    ],

    'faq' => [
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
    ],
];
