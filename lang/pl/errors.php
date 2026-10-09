<?php

/*
 * Copy of the error pages (resources/views/errors). Descriptions are raw HTML (one-letter words bound with &nbsp;).
 * English twin: lang/en/errors.php (same keys). SetLocale is global, so a missing page under /en is English.
 */
return [
    'skip_link' => 'Przejdź do treści',
    'logo_label' => 'Netizo – strona główna',
    'home_url' => '/',
    'nav_label' => 'Sekcje strony',
    'nav' => [
        ['href' => '/#uslugi', 'label' => 'Usługi'],
        ['href' => '/#projekty', 'label' => 'Projekty'],
        ['href' => '/#proces', 'label' => 'Proces'],
        ['href' => '/#faq', 'label' => 'FAQ'],
        ['href' => '/#kontakt', 'label' => 'Kontakt'],
    ],
    'client_panel' => 'Panel klienta',
    'new_tab' => ' (otwiera się w nowej karcie)',
    'error_code' => 'Błąd :code. ',
    'fallback_description' => 'Nie udało się wyświetlić tej strony.',
    'home' => 'Strona główna',
    'contact' => 'Napisz do nas',
    'contact_url' => '/#kontakt',
    'contact_line' => 'Możesz też napisać na :email lub zadzwonić pod numer :phone.',
    'rights' => 'Wszelkie prawa zastrzeżone.',
    'back_to_form' => 'Wróć do formularza',
    'reload' => 'Odśwież stronę',

    'pages' => [
        '401' => [
            'title' => 'Wymagane logowanie',
            'description' => 'Ta strona jest dostępna tylko po zalogowaniu.',
            'chip' => 'Strona dla zalogowanych',
        ],
        '402' => [
            'title' => 'Wymagana płatność',
            'description' => 'Dostęp do tej strony wymaga opłaty. Jeśli to pomyłka, skontaktuj się z&nbsp;nami.',
            'chip' => 'Treść płatna',
        ],
        '403' => [
            'title' => 'Brak dostępu',
            'description' => 'Nie masz uprawnień, żeby zobaczyć tę stronę.',
            'chip' => 'Dostęp zablokowany',
        ],
        '404' => [
            'title' => 'Nie ma takiej strony',
            'description' => 'Adres mógł się zmienić albo strona została usunięta. Sprawdź, czy w&nbsp;adresie nie ma literówki.',
            'chip' => 'Pod tym adresem nic nie ma',
        ],
        '419' => [
            'title' => 'Sesja wygasła',
            'description' => 'Formularz był otwarty zbyt długo i&nbsp;ze względów bezpieczeństwa stracił ważność. Otwórz go ponownie i&nbsp;wyślij jeszcze raz.',
            'chip' => 'Formularz wygasł',
        ],
        '429' => [
            'title' => 'Zbyt wiele prób',
            'description' => 'W&nbsp;krótkim czasie wysłano zbyt wiele zapytań. Odczekaj minutę i&nbsp;spróbuj ponownie.',
            'chip' => 'Odczekaj minutę',
        ],
        '4xx' => [
            'title' => 'Nie udało się otworzyć strony',
            'description' => 'Nie możemy obsłużyć tego zapytania. Sprawdź adres strony.',
            'chip' => 'Zapytanie odrzucone',
        ],
        '500' => [
            'title' => 'Coś poszło nie tak',
            'description' => 'To błąd na naszym serwerze. Spróbuj ponownie za kilka minut.',
            'chip' => 'Serwer nie odpowiada',
        ],
        '503' => [
            'title' => 'Trwają prace techniczne',
            'description' => 'Aktualizujemy stronę. Wróć za kilka minut.',
            'chip' => 'Aktualizacja w toku',
        ],
        '5xx' => [
            'title' => 'Coś poszło nie tak',
            'description' => 'To błąd na naszym serwerze. Spróbuj ponownie za kilka minut.',
            'chip' => 'Serwer nie odpowiada',
        ],
    ],
];
