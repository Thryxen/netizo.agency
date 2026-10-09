<?php

/*
 * Errors of the public forms: the custom validation messages of each Form Request in app/Http/Requests (one key per
 * form), the `forms` rate limiter and the exception handler in bootstrap/app.php. English twin: lang/en/forms.php
 * (same keys).
 */
return [
    'errors' => [
        'throttled' => 'Zbyt wiele prób. Spróbuj ponownie za minutę.',
        'expired' => 'Formularz wygasł. Wyślij go jeszcze raz.',
        'failed' => 'Nie udało się wysłać formularza. Spróbuj ponownie za chwilę albo napisz na kontakt@netizo.pl.',
    ],

    // StoreContactMessageRequest
    'contact' => [
        'name.required' => 'Imię i nazwisko jest wymagane.',
        'name.string' => 'Podaj poprawne imię i nazwisko.',
        'name.min' => 'Imię i nazwisko musi mieć co najmniej 2 znaki.',
        'name.max' => 'Imię i nazwisko może mieć maksymalnie 255 znaków.',
        'email.required' => 'Adres e-mail jest wymagany.',
        'email.email' => 'Podaj poprawny adres e-mail.',
        'email.max' => 'Adres e-mail może mieć maksymalnie 255 znaków.',
        'subject.string' => 'Wybierz temat z listy.',
        'subject.in' => 'Wybierz temat z listy.',
        'message.required' => 'Wiadomość jest wymagana.',
        'message.string' => 'Wiadomość jest wymagana.',
        'message.min' => 'Wiadomość musi mieć co najmniej 10 znaków.',
        'message.max' => 'Wiadomość może mieć maksymalnie 5000 znaków.',
    ],

    // StoreProjectBriefRequest
    'brief' => [
        'types.required' => 'Wybierz przynajmniej jeden typ projektu.',
        'types.array' => 'Wybierz przynajmniej jeden typ projektu.',
        'types.in' => 'Wybierz typ projektu z listy.',
        'features.array' => 'Wybierz funkcjonalności z listy.',
        'features.in' => 'Wybierz funkcjonalności z listy.',
        'industry.string' => 'Wybierz branżę z listy.',
        'industry.in' => 'Wybierz branżę z listy.',
        'audience.string' => 'Wybierz grupę docelową z listy.',
        'audience.in' => 'Wybierz grupę docelową z listy.',
        'design.string' => 'Wybierz jedną z dostępnych opcji projektu graficznego.',
        'design.in' => 'Wybierz jedną z dostępnych opcji projektu graficznego.',
        'timeline.string' => 'Wybierz termin z listy.',
        'timeline.in' => 'Wybierz termin z listy.',
        'tech.array' => 'Wybierz technologie z listy.',
        'tech.in' => 'Wybierz technologie z listy.',
        'security.string' => 'Wybierz poziom bezpieczeństwa z listy.',
        'security.in' => 'Wybierz poziom bezpieczeństwa z listy.',
        'hosting.string' => 'Wybierz opcję hostingu z listy.',
        'hosting.in' => 'Wybierz opcję hostingu z listy.',
        'integrations.string' => 'Opis integracji musi być tekstem.',
        'integrations.max' => 'Opis integracji może mieć maksymalnie 5000 znaków.',
        'budget.string' => 'Wybierz budżet z listy.',
        'budget.in' => 'Wybierz budżet z listy.',
        'cooperation_model.string' => 'Wybierz model współpracy z listy.',
        'cooperation_model.in' => 'Wybierz model współpracy z listy.',
        'notes.string' => 'Dodatkowe informacje muszą być tekstem.',
        'notes.max' => 'Dodatkowe informacje mogą mieć maksymalnie 5000 znaków.',
        'name.required' => 'Imię i nazwisko jest wymagane.',
        'name.string' => 'Podaj poprawne imię i nazwisko.',
        'name.min' => 'Imię i nazwisko musi mieć co najmniej 2 znaki.',
        'name.max' => 'Imię i nazwisko może mieć maksymalnie 255 znaków.',
        'email.required' => 'Adres e-mail jest wymagany.',
        'email.email' => 'Podaj poprawny adres e-mail.',
        'email.max' => 'Adres e-mail może mieć maksymalnie 255 znaków.',
        'phone.string' => 'Podaj poprawny numer telefonu.',
        'phone.max' => 'Numer telefonu może mieć maksymalnie 255 znaków.',
        'company.string' => 'Podaj poprawną nazwę firmy.',
        'company.max' => 'Nazwa firmy może mieć maksymalnie 255 znaków.',
        'position.string' => 'Podaj poprawne stanowisko.',
        'position.max' => 'Stanowisko może mieć maksymalnie 255 znaków.',
        'website.string' => 'Podaj poprawny adres strony WWW.',
        'website.max' => 'Adres strony WWW może mieć maksymalnie 255 znaków.',
        'source.string' => 'Wybierz źródło z listy.',
        'source.in' => 'Wybierz źródło z listy.',
        'contact_pref.array' => 'Wybierz preferowaną formę kontaktu z listy.',
        'contact_pref.in' => 'Wybierz preferowaną formę kontaktu z listy.',
        'privacy.accepted' => 'Musisz zaakceptować politykę prywatności.',
    ],

    // StoreCallbackRequestRequest
    'callback' => [
        'phone.required' => 'Numer telefonu jest wymagany.',
        'phone.string' => 'Podaj poprawny numer telefonu.',
        'phone.min' => 'Podaj poprawny numer telefonu.',
        'phone.max' => 'Podaj poprawny numer telefonu.',
    ],

    // StoreNewsletterSubscriptionRequest
    'newsletter' => [
        'email.required' => 'Adres e-mail jest wymagany.',
        'email.email' => 'Podaj poprawny adres e-mail.',
        'email.max' => 'Adres e-mail może mieć maksymalnie 255 znaków.',
        'email.unique' => 'Ten adres jest już zapisany do newslettera.',
    ],

    // StorePartnerApplicationRequest
    'partner' => [
        'name.required' => 'Imię i nazwisko jest wymagane.',
        'name.string' => 'Podaj poprawne imię i nazwisko.',
        'name.min' => 'Imię i nazwisko musi mieć co najmniej 2 znaki.',
        'name.max' => 'Imię i nazwisko może mieć maksymalnie 255 znaków.',
        'email.required' => 'Adres e-mail jest wymagany.',
        'email.email' => 'Podaj poprawny adres e-mail.',
        'email.max' => 'Adres e-mail może mieć maksymalnie 255 znaków.',
        'phone.string' => 'Podaj poprawny numer telefonu.',
        'phone.min' => 'Podaj poprawny numer telefonu.',
        'phone.max' => 'Podaj poprawny numer telefonu.',
        'partner_type.required' => 'Wybierz, kim jesteś.',
        'partner_type.string' => 'Wybierz, kim jesteś.',
        'partner_type.in' => 'Wybierz, kim jesteś.',
        'message.string' => 'Podaj poprawną treść.',
        'message.max' => 'Wiadomość może mieć maksymalnie 2000 znaków.',
    ],
];
