<?php

namespace Database\Seeders;

use App\Models\Project;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

/**
 * Sample portfolio projects with generated full-page screenshots. Safe to run again: projects are
 * matched by slug and their images are copied over the previous ones on the public disk.
 */
class ProjectSeeder extends Seeder
{
    public const IMAGES_PATH = 'seeders/images/projects';

    public function run(): void
    {
        foreach ($this->projects() as $project) {
            Project::query()->updateOrCreate(
                ['slug' => $project['slug']],
                [
                    ...$project,
                    'is_active' => true,
                    'thumbnail_image' => $this->storeImage("{$project['slug']}-thumbnail.webp", "projects/thumbnails/{$project['slug']}.webp"),
                    'full_image' => $this->storeImage("{$project['slug']}.webp", "projects/full/{$project['slug']}.webp"),
                    'challenges' => collect($project['challenges'])->map(fn (string $challenge): array => ['challenge' => $challenge])->all(),
                    'solutions' => collect($project['solutions'])->map(fn (string $solution): array => ['solution' => $solution])->all(),
                    'challenges_en' => collect($project['challenges_en'])->map(fn (string $challenge): array => ['challenge' => $challenge])->all(),
                    'solutions_en' => collect($project['solutions_en'])->map(fn (string $solution): array => ['solution' => $solution])->all(),
                ],
            );
        }
    }

    private function storeImage(string $sourceName, string $targetPath): string
    {
        Storage::disk('public')->put($targetPath, File::get(database_path(self::IMAGES_PATH."/{$sourceName}")));

        return $targetPath;
    }

    /**
     * Polish copy, then its English twin for /en (the `_en` columns).
     *
     * @return list<array{slug: string, sort_order: int, title: string, url: string, category: string, description: string, full_description: string, tech_stack: list<string>, metrics: list<array{value: string, label: string}>, challenges: list<string>, solutions: list<string>, category_en: string, description_en: string, full_description_en: string, metrics_en: list<array{value: string, label: string}>, challenges_en: list<string>, solutions_en: list<string>}>
     */
    private function projects(): array
    {
        return [
            [
                'slug' => 'zloty-klos',
                'sort_order' => 10,
                'title' => 'Piekarnia Złoty Kłos',
                'url' => 'zlotyklos-leszno.pl',
                'category' => 'Strona firmowa / Zamówienia online',
                'description' => 'Strona rzemieślniczej piekarni z Leszna z zamówieniami na następny dzień i odbiorem w jednym z trzech punktów.',
                'full_description' => 'Złoty Kłos przyjmował zamówienia telefonicznie i w wiadomościach na Facebooku, a listę na kolejny dzień ktoś składał ręcznie późnym wieczorem. Zaprojektowaliśmy stronę, która pokazuje ofertę jak witryna piekarni, i dodaliśmy prosty system zamówień z wyborem punktu odbioru. Piekarze dostają rano gotowe zestawienie wypieków, a klienci płacą online albo przy odbiorze.',
                'tech_stack' => ['Laravel', 'React', 'Inertia.js', 'Tailwind CSS', 'Przelewy24'],
                'metrics' => [
                    ['value' => '38%', 'label' => 'zamówień przez stronę'],
                    ['value' => '2 h', 'label' => 'mniej pracy dziennie'],
                    ['value' => '0,9 s', 'label' => 'LCP na telefonie'],
                ],
                'challenges' => [
                    'Zamówienia z telefonu, Messengera i kartek trzeba było co wieczór przepisywać do jednej listy.',
                    'Oferta zmienia się codziennie, a część wypieków jest dostępna tylko w weekendy.',
                    'Większość klientów wchodzi na stronę z telefonu, często w drodze do pracy.',
                ],
                'solutions' => [
                    'Zamówienia trafiają do panelu, który o 21:00 tworzy zestawienie dla piekarni z podziałem na punkty odbioru.',
                    'Kalendarz dostępności produktów, który obsługa ustawia w kilka sekund.',
                    'Lekki frontend z obrazami WebP i koszykiem, który działa płynnie nawet przy słabym zasięgu.',
                ],
                'category_en' => 'Company website / Online orders',
                'description_en' => 'Website of an artisan bakery in Leszno with next-day orders and pickup at one of three locations.',
                'full_description_en' => 'Złoty Kłos took orders by phone and in Facebook messages, and late every evening someone put together the list for the next day by hand. We designed a website that presents the range like a bakery shop window and added a simple ordering system with a choice of pickup point. The bakers get a ready summary of the bakes every morning, and customers pay online or on pickup.',
                'metrics_en' => [
                    ['value' => '38%', 'label' => 'of orders via the website'],
                    ['value' => '2 h', 'label' => 'less work every day'],
                    ['value' => '0.9 s', 'label' => 'LCP on mobile'],
                ],
                'challenges_en' => [
                    'Orders from the phone, Messenger and paper notes had to be copied into one list every evening.',
                    'The range changes every day, and some bakes are only available on weekends.',
                    'Most customers visit the website on their phones, often on the way to work.',
                ],
                'solutions_en' => [
                    'Orders go to a dashboard that builds the bakery’s summary at 9 p.m., split by pickup point.',
                    'A product availability calendar the staff can set in a few seconds.',
                    'A lightweight front end with WebP images and a cart that runs smoothly even on a weak signal.',
                ],
            ],
            [
                'slug' => 'mebloteka',
                'sort_order' => 20,
                'title' => 'Mebloteka',
                'url' => 'mebloteka-sklep.pl',
                'category' => 'E-commerce / Headless',
                'description' => 'Sklep z meblami w stylu skandynawskim: szybki frontend, warianty tkanin i drewna oraz synchronizacja stanów z hurtownią.',
                'full_description' => 'Mebloteka sprzedawała wyłącznie przez marketplace i potrzebowała własnego kanału sprzedaży, który nie będzie wolniejszy od konkurencji. Zbudowaliśmy sklep w architekturze headless: katalog i zamówienia obsługuje backend w Laravelu, a frontend w Next.js renderuje karty produktów z wariantami tkanin i drewna. Stany magazynowe synchronizują się z hurtownią co 15 minut.',
                'tech_stack' => ['Next.js', 'TypeScript', 'Laravel', 'PostgreSQL', 'Stripe'],
                'metrics' => [
                    ['value' => '+41%', 'label' => 'współczynnika konwersji'],
                    ['value' => '1,2 s', 'label' => 'średni czas ładowania'],
                    ['value' => '3,4 tys.', 'label' => 'produktów w katalogu'],
                ],
                'challenges' => [
                    'Ponad 3 tysiące produktów z wariantami koloru, tkaniny i wymiarów.',
                    'Stany magazynowe zmieniały się w hurtowni kilka razy dziennie.',
                    'Duże zdjęcia aranżacji spowalniały karty produktów.',
                ],
                'solutions' => [
                    'Model wariantów, w którym klient zmienia tkaninę i od razu widzi zdjęcie, cenę i czas dostawy.',
                    'Synchronizacja z API hurtowni co 15 minut przez kolejkę, z powiadomieniem przy błędach.',
                    'Responsywne obrazy AVIF i WebP oraz wyszukiwarka z podpowiedziami bez przeładowania strony.',
                ],
                'category_en' => 'E-commerce / Headless',
                'description_en' => 'An online store with Scandinavian-style furniture: a fast front end, fabric and wood variants, and stock synced with the wholesaler.',
                'full_description_en' => 'Mebloteka sold only through a marketplace and needed its own sales channel that would be no slower than the competition. We built a headless store: a Laravel back end handles the catalog and orders, and a Next.js front end renders product pages with fabric and wood variants. Stock levels sync with the wholesaler every 15 minutes.',
                'metrics_en' => [
                    ['value' => '+41%', 'label' => 'conversion rate'],
                    ['value' => '1.2 s', 'label' => 'average load time'],
                    ['value' => '3.4k', 'label' => 'products in the catalog'],
                ],
                'challenges_en' => [
                    'More than 3,000 products with color, fabric and size variants.',
                    'Stock levels at the wholesaler changed several times a day.',
                    'Large room-setting photos slowed down the product pages.',
                ],
                'solutions_en' => [
                    'A variant model where customers switch the fabric and instantly see the photo, price and delivery time.',
                    'Sync with the wholesaler’s API every 15 minutes through a queue, with an alert on errors.',
                    'Responsive AVIF and WebP images and a search with suggestions that never reloads the page.',
                ],
            ],
            [
                'slug' => 'flotapro',
                'sort_order' => 30,
                'title' => 'FlotaPro',
                'url' => 'flotapro.app',
                'category' => 'Aplikacja webowa / SaaS',
                'description' => 'Panel do zarządzania flotą firmową: pozycje pojazdów na żywo, koszty paliwa, przeglądy i raporty dla księgowości.',
                'full_description' => 'FlotaPro to produkt dla firm transportowych i serwisowych z flotą od 10 do 300 pojazdów. Zaprojektowaliśmy i zbudowaliśmy go od zera: od strony z cennikiem, przez onboarding, po panel z mapą, alertami i raportami. Dane z lokalizatorów GPS trafiają do systemu w czasie rzeczywistym, a kierownik floty widzi koszty każdego auta w jednym miejscu.',
                'tech_stack' => ['Laravel', 'React', 'TypeScript', 'PostgreSQL', 'Redis', 'WebSocket'],
                'metrics' => [
                    ['value' => '120+', 'label' => 'firm w abonamencie'],
                    ['value' => '< 5 s', 'label' => 'odświeżanie pozycji'],
                    ['value' => '−18%', 'label' => 'kosztów paliwa u klientów'],
                ],
                'challenges' => [
                    'Tysiące odczytów GPS na minutę z urządzeń różnych producentów.',
                    'Kierownicy flot pracowali w arkuszach i nie chcieli uczyć się skomplikowanego systemu.',
                    'Abonamenty, faktury i okresy próbne musiały działać bez ręcznej obsługi.',
                ],
                'solutions' => [
                    'Kolejka odczytów na Redisie i WebSockety, które odświeżają mapę bez przeładowania strony.',
                    'Onboarding z importem pojazdów z pliku CSV i pierwszym raportem gotowym w kilka minut.',
                    'Płatności cykliczne z automatycznymi fakturami i przypomnieniami o końcu okresu próbnego.',
                ],
                'category_en' => 'Web application / SaaS',
                'description_en' => 'A dashboard for managing company fleets: live vehicle positions, fuel costs, inspections and reports for accounting.',
                'full_description_en' => 'FlotaPro is a product for transport and service companies with fleets of 10 to 300 vehicles. We designed and built it from scratch: from the pricing page, through onboarding, to the dashboard with a map, alerts and reports. Data from GPS trackers reaches the system in real time, and the fleet manager sees the costs of every vehicle in one place.',
                'metrics_en' => [
                    ['value' => '120+', 'label' => 'companies subscribed'],
                    ['value' => '< 5 s', 'label' => 'position refresh'],
                    ['value' => '−18%', 'label' => 'fuel costs for clients'],
                ],
                'challenges_en' => [
                    'Thousands of GPS readings a minute from devices made by different manufacturers.',
                    'Fleet managers worked in spreadsheets and didn’t want to learn a complicated system.',
                    'Subscriptions, invoices and free trials had to run without manual work.',
                ],
                'solutions_en' => [
                    'A Redis queue for the readings and WebSockets that refresh the map without reloading the page.',
                    'Onboarding with vehicle import from a CSV file and the first report ready in a few minutes.',
                    'Recurring payments with automatic invoices and reminders before a trial ends.',
                ],
            ],
            [
                'slug' => 'fizjo-studio',
                'sort_order' => 40,
                'title' => 'Fizjo Studio',
                'url' => 'fizjostudio-poznan.pl',
                'category' => 'Strona usługowa / Rezerwacje online',
                'description' => 'Strona gabinetu fizjoterapii z Poznania z rezerwacją wizyt online, przypomnieniami SMS i profilami specjalistów.',
                'full_description' => 'Fizjo Studio traciło pacjentów, bo do recepcji trudno było się dodzwonić, a wolne terminy znała tylko jedna osoba. Przygotowaliśmy nową stronę z opisami zabiegów i cennikiem oraz system rezerwacji połączony z grafikami fizjoterapeutów. Pacjent wybiera zabieg, specjalistę i godzinę, a dzień przed wizytą dostaje SMS z przypomnieniem.',
                'tech_stack' => ['Laravel', 'React', 'Tailwind CSS', 'Google Calendar API', 'SMSAPI'],
                'metrics' => [
                    ['value' => '70%', 'label' => 'wizyt umawianych online'],
                    ['value' => '−45%', 'label' => 'nieodwołanych wizyt'],
                    ['value' => '4,9/5', 'label' => 'ocena w Google'],
                ],
                'challenges' => [
                    'Recepcja odbierała kilkadziesiąt telefonów dziennie, głównie w sprawie wolnych terminów.',
                    'Każdy fizjoterapeuta prowadził grafik w innym kalendarzu.',
                    'Pacjenci zapominali o wizytach, a puste okienka trudno było zapełnić.',
                ],
                'solutions' => [
                    'Rezerwacja online w trzech krokach, z wolnymi terminami liczonymi według długości zabiegu.',
                    'Dwukierunkowa synchronizacja z kalendarzami Google wszystkich specjalistów.',
                    'Przypomnienia SMS z linkiem do odwołania wizyty, który od razu zwalnia termin dla innych.',
                ],
                'category_en' => 'Service website / Online booking',
                'description_en' => 'Website of a physiotherapy clinic in Poznań with online booking, SMS reminders and specialist profiles.',
                'full_description_en' => 'Fizjo Studio was losing patients because the front desk was hard to reach by phone and only one person knew the free slots. We built a new website with treatment descriptions and a price list, plus a booking system connected to the physiotherapists’ schedules. Patients choose the treatment, the specialist and the time, and get an SMS reminder the day before the visit.',
                'metrics_en' => [
                    ['value' => '70%', 'label' => 'of visits booked online'],
                    ['value' => '−45%', 'label' => 'no-shows'],
                    ['value' => '4.9/5', 'label' => 'Google rating'],
                ],
                'challenges_en' => [
                    'The front desk took dozens of calls a day, mostly about free slots.',
                    'Each physiotherapist kept their schedule in a different calendar.',
                    'Patients forgot about their visits, and empty slots were hard to fill.',
                ],
                'solutions_en' => [
                    'Online booking in three steps, with free slots calculated from the length of the treatment.',
                    'Two-way sync with the Google Calendars of all the specialists.',
                    'SMS reminders with a link to cancel the visit, which frees the slot for others right away.',
                ],
            ],
        ];
    }
}
