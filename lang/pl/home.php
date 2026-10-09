<?php

/*
 * Server-side copy of the home page (HomeController): meta tags and the FAQ, the single source for the FAQ section and
 * its JSON-LD. English twin: lang/en/home.php (same keys).
 * Ranges keep together: a word joiner (U+2060) after the dash, a no-break space (U+00A0) before the unit.
 */
return [
    'seo' => [
        'title' => 'Tworzymy Strony WWW dla Ambitnych Firm | Netizo',
        'description' => 'Profesjonalne tworzenie stron internetowych i aplikacji webowych dla firm. Nowoczesny design, szybkość i SEO w standardzie. React, Next.js, Laravel. 150+ projektów, 8 lat doświadczenia. Bezpłatna wycena!',
        'share_description' => 'Profesjonalne strony internetowe i aplikacje webowe. Nowoczesny design, szybkość, SEO. 150+ projektów. Bezpłatna wycena!',
        'organization_description' => 'Profesjonalne tworzenie stron internetowych i aplikacji webowych dla firm. Nowoczesny design, szybkość i SEO w standardzie. 150+ projektów, 8 lat doświadczenia.',
        'country' => 'Polska',
        'image' => 'assets/images/og-netizo-2.png',
        'keywords' => [
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
        ],
    ],

    'faq' => [
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
    ],
];
