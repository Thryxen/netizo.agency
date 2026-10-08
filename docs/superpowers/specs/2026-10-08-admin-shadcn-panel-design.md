# Panel administracyjny na shadcn zamiast Filament

Data: 2026-10-08

## Cel

Usunąć `filament/filament` (oraz `livewire/livewire`, który zostawał tylko dla Filament) i zastąpić panel pod `/admin` panelem w Inertia v3 + React 19 + shadcn/ui, w układzie znanym z voxbit-center (zwijany `Sidebar`, nagłówek z breadcrumbem, własna strona logowania).

Panel zachowuje dotychczasową funkcjonalność i nie dostaje nowych funkcji (brak dashboardu, ról, powiadomień).

## Zakres

Zasoby, w nawiasach to, co dziś robi Filament:

| Zasób | Funkcje |
|---|---|
| Projekty | lista, tworzenie, edycja, usuwanie, usuwanie zbiorcze, zmiana kolejności, filtr aktywności, upload dwóch obrazów do WebP, tagi technologii, 1–3 metryki, 1–6 wyzwań i rozwiązań |
| Klienci | lista, tworzenie, edycja, usuwanie, usuwanie zbiorcze, zmiana kolejności, filtr aktywności |
| Wiadomości (`ContactMessage`) | lista (wyszukiwanie, zakres dat), podgląd, usuwanie, usuwanie zbiorcze |
| Briefy (`ProjectBrief`) | jak wiadomości, podgląd w zakładkach z czytelnymi etykietami |
| Prośby o kontakt (`CallbackRequest`) | lista (wyszukiwanie, zakres dat), usuwanie, usuwanie zbiorcze |

Poza zakresem: zmiany strony głównej (poza tokenami sidebara w `app.css` i ewentualnymi mapami etykiet), role i uprawnienia, newsletter w panelu (nie ma go dziś), nowe tabele i migracje.

## Decyzje

- Architektura: kontrolery + strony Inertia (jak voxbit-center). Bez generycznego CRUD sterowanego konfiguracją, bez API JSON.
- Kolejność: przeciąganie z `@dnd-kit` (`core`, `sortable`, `utilities`) – nowa zależność zatwierdzona przez użytkownika.
- Dostęp: każdy użytkownik z tabeli `users` ma dostęp, tak jak dziś (`canAccessPanel` zwracał `true`). URL `/admin` bez zmian.
- Komunikaty po akcjach: `flash` pokazywany istniejącym `Alert`, bez `sonner`.
- Filtr dat: natywne `<input type="date">`, bez `react-day-picker` i `date-fns`.
- `intervention/image` 2.7 dotąd był zależnością tranzytywną wtyczki `joshembling/image-optimizer` (wtyczka Filament). Po jej usunięciu deklarujemy `intervention/image:^2.7` bezpośrednio i zachowujemy obecne API.

## Backend

### Routing i logowanie

- `routes/admin.php`, ładowany w `bootstrap/app.php` przez `then:` z middleware `web`, prefix `admin`, nazwy `admin.*`.
- `App\Http\Controllers\Admin\Auth\LoginController`: `GET /admin/login`, `POST /admin/login`, `POST /admin/logout`.
- `App\Http\Requests\Admin\LoginRequest` ogranicza próby do 5 na parę e-mail + IP (`RateLimiter`), z polskim komunikatem.
- `redirectGuestsTo` kieruje gości na `admin.login`, `redirectUsersTo` zalogowanych na `admin.projects.index`. Strona główna panelu (`/admin`) przekierowuje na listę projektów.
- `User` traci `FilamentUser` i `canAccessPanel`. Komenda `admin:create` zostaje bez zmian.

### Kontrolery (`App\Http\Controllers\Admin`)

- `ProjectController`, `ClientController`: `index`, `create`, `store`, `edit`, `update`, `destroy`, `destroyMany`, `reorder`. `reorder` przyjmuje uporządkowaną listę `ids`, zapisuje `sort_order` w transakcji (wspólny trait `ReordersRecords`) i odrzuca id spoza tabeli.
- `ContactMessageController`, `ProjectBriefController`: `index`, `show`, `destroy`, `destroyMany`.
- `CallbackRequestController`: `index`, `destroy`, `destroyMany`.
- Listy leadów: paginacja 25 na stronę, `search`, `from`, `until`, `sort`, `direction` w query string; domyślnie `created_at desc`.
- Projekty i klienci: wszystkie rekordy posortowane po `sort_order`, filtr aktywności po stronie klienta.
- Nazwy klas kontrolerów w przestrzeni `Admin` mogą powtarzać nazwy publicznych kontrolerów formularzy; importy aliasują.

### Form Requesty (`App\Http\Requests\Admin`)

`SaveProjectRequest` i `SaveClientRequest` (zapis i edycja), `DestroyManyRequest` i `ReorderRequest` (`ids` – tablica unikalnych liczb całkowitych), `LoginRequest`, `LeadIndexRequest` i `BriefIndexRequest` (listy leadów; bez reguł, bo wartości spoza dozwolonego zbioru są ignorowane, nie odrzucane). Reguły przeniesione z Filament:

- Projekt: `title` (wymagane, max 255), `slug` (wymagane, max 255, unikalne z ignorowaniem rekordu), `url` i `category` (wymagane, max 255), `sort_order` (liczba całkowita, domyślnie 0), `is_active` (boolean), `description` i `full_description` (wymagane), `tech_stack` (wymagane, min 1), `metrics` (1–3 pozycje `value` + `label`), `challenges` i `solutions` (1–6 pozycji tekstowych), `thumbnail_image` i `full_image` (opcjonalne, obraz, do 50 MB).
- Klient: `name` (wymagane, max 255), `url` (opcjonalny, poprawny URL, max 255), `sort_order`, `is_active`.
- Komunikaty błędów po polsku, w stylu pozostałych Form Requestów.

Struktura `challenges` / `solutions` w bazie zostaje taka jak dziś: tablica `['challenge' => '…']` / `['solution' => '…']`; kontroler mapuje z prostych list tekstowych z formularza.

### Obrazy

- `App\Services\ImageOptimizer`: `store(UploadedFile $file, string $directory, int $maxWidth, int $quality = 95): string` – WebP, `aspectRatio`, bez powiększania, nazwa ULID, dysk `public`, sterownik Imagick (jeśli dostępny) lub GD. Logika przeniesiona z `OptimizedImageUpload`.
- Miniaturka: `projects/thumbnails`, 1600 px; pełne zdjęcie: `projects/full`, 1920 px.
- Podmiana albo usunięcie obrazu w formularzu kasuje stary plik. Usunięcie rekordu plików nie rusza (jak dotąd).

### Wspólne dane Inertia

`HandleInertiaRequests`:

- `rootView()` zwraca `admin` dla `admin*`, w przeciwnym razie `app`.
- `$withoutSsr = ['admin', 'admin/*']`.
- `share()` dodaje `auth.user` (`id`, `name`, `email`), `sidebarOpen` (cookie `sidebar_state`) i `flash` (`success`).
- `bootstrap/app.php`: `sidebar_state` dopisany do wyjątków `encryptCookies` obok `appearance`.

### Root view `admin.blade.php`

Dedykowany widok: skrypt motywu przed malowaniem (jak w `app.blade.php`), `@viteReactRefresh`, `@vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])`, `@inertiaHead`, `@inertia`. Bez GTM, gtag, Clarity, cookie banera i `SEO::generate()`. `<meta name="robots" content="noindex, nofollow">`.

### Bezpieczeństwo

`SecurityHeaders`: usunięcie martwego wyjątku `panel/*` i `livewire/*` oraz `livewire` z `trusted-types`. Panel dostaje to samo CSP z Trusted Types co strona; weryfikacja w przeglądarce, że nic nie jest blokowane.

## Frontend

### Powłoka

- `components/admin/admin-layout.tsx`: `SidebarProvider` (`defaultOpen={sidebarOpen}`), `AdminSidebar`, `SidebarInset` z nagłówkiem (`SidebarTrigger`, `Separator`, `Breadcrumb`, slot akcji strony) i `FlashNotice`.
- `components/admin/admin-sidebar.tsx`: logo netizo (`LogoMark` po zwinięciu), grupy **Treści** (Projekty, Klienci) i **Kontakt** (Wiadomości, Briefy, Prośby o kontakt), `NavUser` w stopce (przełącznik motywu z `use-appearance`, „Wyloguj”).
- Nowe komponenty shadcn przez `npx shadcn add`: `sidebar`, `table`, `dropdown-menu`, `breadcrumb`, `separator`, `avatar`, `tooltip`, `skeleton`, `switch`, `field`, `alert-dialog`, `scroll-area`. Po wygenerowaniu sprawdzić import `cn` (`@/lib/utils`) i hook `use-mobile`.
- `resources/css/app.css`: tokeny `--sidebar-*` w `:root` i `.dark` (paleta neutral, bez akcentu) oraz mapowanie w `@theme inline`.

### Strony (`resources/js/pages/admin/`)

`login`, `projects/{index,create,edit}`, `clients/{index,create,edit}`, `messages/{index,show}`, `briefs/{index,show}`, `callbacks/index`. `lib/pages.ts` rozpoznaje je bez zmian (glob `../pages/**/*.tsx`). Typy w `types/admin.ts`.

### Listy

- Projekty i klienci: tabela z uchwytem przeciągania (`SortableRows`), przełącznikiem aktywności w filtrze, zaznaczaniem wierszy i usuwaniem zbiorcznym. Zmiana kolejności jest optymistyczna i wysyła `POST …/reorder`; błąd cofa układ i pokazuje komunikat. Przeciąganie jest wyłączone, gdy aktywny jest filtr.
- Leady: `ListToolbar` (szukaj, od, do), nagłówki sortowalne, `Pagination` na podstawie linków paginatora. Zmiany filtrów idą przez `router.get` z `preserveState` i `replace`.
- Usuwanie (pojedyncze i zbiorcze) zawsze przez `AlertDialog`.

### Formularze

- Projekt i klient używają Inertia `useForm` z `forceFormData` (obrazy). Edycja projektu to `PUT` przez `_method` w formularzu multipart.
- Projekt: zakładki (`tabs`) Podstawowe, Zdjęcia, Technologie, Metryki, Wyzwania i rozwiązania; automatyczny slug z tytułu, dopóki użytkownik go nie zmienił ręcznie.
- Własne komponenty w `components/admin/`: `ImageField` (podgląd, usuń, podmień), `TagsInput` (Enter dodaje, podpowiedzi technologii), `ListField` (pozycje dodawane, usuwane i przeciągane; wariant parowy `value` + `label` dla metryk i tekstowy dla wyzwań i rozwiązań), `SortableList` / `SortableRows` (dnd-kit, obsługa klawiatury), `ConfirmDeleteDialog`, `FlashNotice`, `ListToolbar`, `Pagination`.

### Brief

Etykiety wartości z `components/home/brief/brief-options.ts`, jedno źródło wartości, które i tak musi zgadzać się z `StoreProjectBriefRequest`. Plik zawiera wszystkie grupy, więc `components/admin/brief-labels.ts` to tylko helpery wyszukujące etykietę. Nieznana wartość wyświetla się surowo.

### Zasady

Komponenty muszą być bezpieczne dla SSR (żadnego `window`/`document` podczas renderu), choć strony admina nie są renderowane po stronie serwera. Ciemny i jasny motyw, układ responsywny (sidebar jako `Sheet` na mobile), monochromatyczny wygląd zgodny z resztą strony.

## Usuwanie Filament i Livewire

- `composer.json`: usunąć `filament/filament`, `livewire/livewire`, `joshembling/image-optimizer`; dodać `intervention/image:^2.7`; usunąć `@php artisan filament:upgrade` z `post-autoload-dump`; `composer update` czyści pakiety tranzytywne.
- Usunąć: `app/Filament/`, `app/Providers/Filament/` i wpis w `bootstrap/providers.php`, `config/livewire.php`, `public/css/filament`, `public/js/filament`.
- Sprawdzić i usunąć ewentualne publikacje Filament/Livewire w `lang/vendor` i `resources/views/vendor`.
- Zaktualizować `CLAUDE.md` (stack, struktura katalogów, integracje, opis panelu `/admin`).
- Migracji ani przenoszenia danych nie ma. Sesje i URL `/admin` zostają.

## Testy

Pest, `tests/Feature` (i jeden `tests/Unit`).

- **Logowanie:** gość przekierowany na `/admin/login`; poprawne logowanie; błędne hasło; limit 5 prób; wylogowanie; zalogowany nie widzi logowania; strony admina nie zawierają GTM ani Clarity i mają `noindex`.
- **Projekty:** lista w kolejności; zapis z obrazami do WebP 1600/1920 px; wysoki screenshot przy Imagick; walidacja (zbiór danych: duplikat `slug`, ponad 3 metryki, brak `tech_stack`, plik niebędący obrazem); aktualizacja podmienia obraz i kasuje stary plik; usunięcie obrazu; `destroy`; `destroyMany`; `reorder` zapisuje `sort_order` i odrzuca obce id; gość dostaje przekierowanie.
- **Klienci:** CRUD, kolejność, usuwanie zbiorcze, walidacja `url`.
- **Wiadomości, briefy, prośby o kontakt:** lista z wyszukiwaniem, filtrem dat i paginacją; `show`; `destroy`; `destroyMany`.
- **`ImageOptimizer`:** test jednostkowy (WebP, bez powiększania, nazwa ULID).
- **Przepisane:** `ProjectImageUploadTest` z Livewire na test `ImageOptimizer` z zachowaniem obu scenariuszy (upload przez HTTP pokrywa `tests/Feature/Admin/ProjectTest.php`); `CreateAdminUserTest` sprawdza logowanie utworzonego konta na `/admin/login` zamiast `canAccessPanel`; `SecurityHeadersTest` dostaje sprawdzenie CSP na ścieżce admina.
- **Frontend:** brak runnera JS i brak jego dodawania. Weryfikacja: `npm run types`, `npm run build`, przegląd w przeglądarce (motyw jasny i ciemny, zwijanie sidebara, przeciąganie, upload, mobile, brak naruszeń CSP w konsoli).
- Przed zakończeniem: `vendor/bin/pint --dirty --format agent`, testy z filtrem po kolei i pełny zestaw na końcu.

## Ryzyka

- Trusted Types: biblioteki UI (np. dnd-kit, Radix) nie powinny używać `innerHTML`, ale panel trzeba sprawdzić w przeglądarce z włączonym CSP.
- Cookie `sidebar_state` musi być wyłączone z szyfrowania, inaczej `sidebarOpen` zawsze wraca do domyślnego.
- `composer update` po usunięciu Filament może zmienić wersje innych pakietów; ograniczyć do `composer remove` + `composer require` i sprawdzić diff `composer.lock`.
- `joshembling/image-optimizer` mógł rejestrować własnego providera lub konfigurację – sprawdzić przed usunięciem.
