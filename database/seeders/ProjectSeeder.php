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
     * @return list<array{slug: string, sort_order: int, title: string, url: string, category: string, description: string, full_description: string, tech_stack: list<string>, metrics: list<array{value: string, label: string}>, challenges: list<string>, solutions: list<string>}>
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
            ],
        ];
    }
}
