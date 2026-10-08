# Panel administracyjny na shadcn: plan implementacji

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Usunąć Filament i Livewire oraz zastąpić panel `/admin` panelem Inertia + React + shadcn (sidebar, tabele, formularze, przeciąganie kolejności) z zachowaniem dotychczasowych funkcji.

**Architecture:** Kontrolery w `App\Http\Controllers\Admin` zwracają strony Inertia z `resources/js/pages/admin/*`. Listy leadów filtrowane i sortowane po stronie serwera przez query string, listy projektów i klientów w całości z przeciąganiem (`@dnd-kit`). Obrazy przechodzą przez `App\Services\ImageOptimizer` (Intervention, WebP). Panel ma własny root view bez trackerów i bez SSR.

**Tech Stack:** Laravel 12, PHP 8.4, Inertia v3, React 19, TypeScript, shadcn/ui (new-york, neutral), Tailwind 4, `@dnd-kit/*`, `intervention/image` 2.7, Pest 4.

**Spec:** `docs/superpowers/specs/2026-10-08-admin-shadcn-panel-design.md`

## Global Constraints

- Tylko jedna nowa zależność npm: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`. Zakaz: `sonner`, `react-day-picker`, `date-fns`, TanStack Table, `motion.*`/`animate()`.
- Composer: usunąć `filament/filament`, `livewire/livewire`, `joshembling/image-optimizer`; dodać `intervention/image:^2.7` bezpośrednio.
- Polskie teksty zdaniem (sentence case), bez etykiet-nadtytułów, bez strzałek doklejanych do tekstu przycisków. Monochromatyczny wygląd (bez koloru akcentu); kolor tylko semantyczny (destructive).
- Komponenty bezpieczne dla SSR: żadnego `window`/`document` podczas renderu (tylko w efektach i handlerach).
- Nowe pliki PHP przez `php artisan make:… --no-interaction`; PHP: klamry przy każdej instrukcji sterującej, jawne typy zwracane, constructor promotion, PHPDoc zamiast komentarzy inline, `Model::query()` zamiast `DB::`.
- Form Requesty z regułami i polskimi komunikatami/atrybutami; testy w Pest (`tests/Feature`), asercje statusów metodami (`assertForbidden` itd.).
- Kolejność w bazie: `challenges` i `solutions` zapisywane jako `[['challenge' => '…']]` / `[['solution' => '…']]` (jak dotąd); odczyt akceptuje też zwykłe stringi.
- Każdy commit kończy się akapitem `Claude-Session: https://claude.ai/code/session_013ymSrGVKpfUzjAgpNZaxhz` (drugi argument `-m`). Praca na gałęzi `admin-shadcn-panel`; bez push i bez merge.
- Przed końcem każdego zadania: `vendor/bin/pint --dirty --format agent` dla PHP, `npx tsc --noEmit` dla TS.
- Inertia w testach ma `ensure_pages_exist = true`: plik strony TSX musi istnieć, zanim test wyrenderuje komponent. W testach stron używaj `$this->withoutVite()`.

## Review Focus

Wejścia, o których spec milczy, a które najłatwiej zepsuć (każde ma test w zadaniu wskazanym w nawiasie):

1. Nieprawidłowe `sort`/`direction` w query stringu (np. `sort=password`) nie może dać błędu SQL ani 500; ma wrócić do sortowania domyślnego (Zadanie 7).
2. `reorder` z obcymi, zduplikowanymi lub pustymi id nie zmienia niczego i zwraca błąd walidacji (Zadanie 5).
3. Edycja projektu zapisanego w starszym formacie (zwykłe stringi w `challenges`) oraz podmiana obrazu, którego pliku już nie ma na dysku, nie mogą się wywrócić (Zadanie 6).
4. Strona poza zakresem paginacji (`page=99`) i wyszukiwanie ciągu `%` zwracają 200, nie błąd (Zadanie 7).
5. Nieuwierzytelnione żądania destrukcyjne (`DELETE /admin/projects`, `POST …/reorder`) są przekierowane na logowanie i niczego nie kasują (Zadania 5–7).

---

## Struktura plików

**Backend (tworzone):**
- `app/Services/ImageOptimizer.php`: zapis obrazu jako WebP, usuwanie pliku
- `routes/admin.php`: trasy panelu
- `resources/views/admin.blade.php`: root view panelu
- `app/Http/Controllers/Admin/Auth/LoginController.php`, `app/Http/Requests/Admin/LoginRequest.php`
- `app/Http/Controllers/Admin/{Project,Client,ContactMessage,ProjectBrief,CallbackRequest}Controller.php`
- `app/Http/Controllers/Admin/Concerns/ReordersRecords.php`
- `app/Http/Requests/Admin/{SaveProjectRequest,SaveClientRequest,DestroyManyRequest,ReorderRequest,LeadIndexRequest,BriefIndexRequest}.php`
- `database/factories/{Project,Client,ContactMessage,ProjectBrief,CallbackRequest}Factory.php`

**Backend (zmieniane):** `bootstrap/app.php`, `bootstrap/providers.php`, `app/Http/Middleware/HandleInertiaRequests.php`, `app/Http/Middleware/SecurityHeaders.php`, `app/Models/{User,Project,Client,ContactMessage,ProjectBrief,CallbackRequest}.php`, `composer.json`, `CLAUDE.md`.

**Backend (usuwane):** `app/Filament/`, `app/Providers/Filament/`, `config/livewire.php`, `public/css/filament`, `public/js/filament`.

**Frontend (tworzone):**
- `resources/js/types/admin.ts`, `resources/js/lib/admin-routes.ts`
- `resources/js/hooks/{use-selection,use-record-list,use-list-filters}.ts`
- `resources/js/components/admin/`: `admin-layout`, `admin-sidebar`, `nav-user`, `flash-notice`, `confirm-delete-dialog`, `form-field`, `sortable`, `list-toolbar`, `pagination`, `sort-header`, `bulk-bar`, `detail`, `image-field`, `tags-input`, `repeater-list`, `project-form`, `client-form`, `brief-labels` (`.tsx`, a `brief-labels.ts` dla helperów)
- `resources/js/pages/admin/`: `login`, `projects/{index,create,edit}`, `clients/{index,create,edit}`, `messages/{index,show}`, `briefs/{index,show}`, `callbacks/index`
- `resources/js/components/ui/*` generowane przez shadcn (sidebar, table, dropdown-menu, breadcrumb, separator, avatar, tooltip, switch, alert-dialog i zależności)

**Frontend (zmieniane):** `resources/css/app.css` (tokeny sidebara, `@source` dla `admin.blade.php`), `package.json`.

**Testy:** `tests/Feature/ProjectImageUploadTest.php` (przepisany), `tests/Feature/CreateAdminUserTest.php`, `tests/Feature/SecurityHeadersTest.php`, `tests/Feature/Admin/{AdminAuthTest,ClientTest,ProjectTest,ContactMessageTest,ProjectBriefTest,CallbackRequestTest}.php`.

---

### Task 1: ImageOptimizer i przepisanie testu uploadu

**Files:**
- Create: `app/Services/ImageOptimizer.php`
- Modify: `tests/Feature/ProjectImageUploadTest.php` (pełne przepisanie)
- Modify: `composer.json` (dodanie `intervention/image`)

**Interfaces:**
- Produces: `App\Services\ImageOptimizer::store(UploadedFile $file, string $directory, int $maxWidth, int $quality = 95, string $disk = 'public'): string` (zwraca ścieżkę względną na dysku), `::delete(?string $path, string $disk = 'public'): void`.

- [ ] **Step 1: Zadeklaruj `intervention/image` bezpośrednio**

Run: `composer require intervention/image:^2.7 --no-interaction`
Expected: pakiet już zainstalowany (2.7.2), w `composer.json` pojawia się wpis `"intervention/image": "^2.7"`; brak zmian wersji w `composer.lock` poza `content-hash`/listą wymagań.

- [ ] **Step 2: Napisz test, który nie przejdzie (usługa nie istnieje)**

Nadpisz `tests/Feature/ProjectImageUploadTest.php`:

```php
<?php

use App\Services\ImageOptimizer;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

beforeEach(function () {
    Storage::fake('public');
});

it('converts an uploaded image to webp under the given directory', function () {
    $path = app(ImageOptimizer::class)->store(
        UploadedFile::fake()->image('thumbnail.jpg', 800, 450)->size(20000),
        'projects/thumbnails',
        1600,
    );

    expect($path)->toStartWith('projects/thumbnails/')->toEndWith('.webp');

    Storage::disk('public')->assertExists($path);

    expect(Storage::disk('public')->mimeType($path))->toBe('image/webp');
});

it('never enlarges an image that is narrower than the limit', function () {
    $path = app(ImageOptimizer::class)->store(
        UploadedFile::fake()->image('small.png', 800, 450),
        'projects/full',
        1920,
    );

    expect(getimagesize(Storage::disk('public')->path($path))[0])->toBe(800);
});

it('names every stored file with a fresh ulid', function () {
    $optimizer = app(ImageOptimizer::class);
    $file = UploadedFile::fake()->image('a.jpg', 100, 100);

    $first = $optimizer->store($file, 'projects/full', 1920);
    $second = $optimizer->store($file, 'projects/full', 1920);

    expect($first)->not->toBe($second)
        ->and(Str::isUlid(pathinfo($first, PATHINFO_FILENAME)))->toBeTrue();
});

it('shrinks tall screenshots to the width limit without exhausting php memory', function () {
    if (! extension_loaded('imagick')) {
        $this->markTestSkipped('Imagick is required to process very large screenshots safely.');
    }

    $sourcePath = sys_get_temp_dir().'/project-screenshot-'.Str::uuid().'.png';

    $image = new Imagick;
    $image->newImage(2400, 8000, new ImagickPixel('white'), 'png');
    $image->writeImage($sourcePath);
    $image->clear();
    $image->destroy();

    $content = file_get_contents($sourcePath);

    @unlink($sourcePath);

    $optimizer = app(ImageOptimizer::class);

    $thumbnail = $optimizer->store(UploadedFile::fake()->createWithContent('thumbnail.png', $content), 'projects/thumbnails', 1600);
    $full = $optimizer->store(UploadedFile::fake()->createWithContent('full.png', $content), 'projects/full', 1920);

    expect(getimagesize(Storage::disk('public')->path($thumbnail))[0])->toBe(1600)
        ->and(getimagesize(Storage::disk('public')->path($full))[0])->toBe(1920);
});

it('deletes a stored image and ignores empty or missing paths', function () {
    $optimizer = app(ImageOptimizer::class);
    $path = $optimizer->store(UploadedFile::fake()->image('a.jpg', 100, 100), 'projects/full', 1920);

    $optimizer->delete($path);
    $optimizer->delete(null);
    $optimizer->delete('');
    $optimizer->delete('projects/full/does-not-exist.webp');

    Storage::disk('public')->assertMissing($path);
});
```

- [ ] **Step 3: Uruchom test i potwierdź, że nie przechodzi**

Run: `php artisan test --compact tests/Feature/ProjectImageUploadTest.php`
Expected: FAIL (`Target class [App\Services\ImageOptimizer] does not exist`).

- [ ] **Step 4: Zaimplementuj usługę**

Run: `php artisan make:class Services/ImageOptimizer --no-interaction`, następnie nadpisz `app/Services/ImageOptimizer.php`:

```php
<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Constraint;
use Intervention\Image\ImageManager;

/**
 * Stores uploaded images as WebP no wider than a given limit and removes them again.
 */
class ImageOptimizer
{
    /**
     * Resize (never enlarging, aspect ratio kept), encode as WebP and store under a fresh ULID name.
     *
     * @return string Path relative to the disk root.
     */
    public function store(UploadedFile $file, string $directory, int $maxWidth, int $quality = 95, string $disk = 'public'): string
    {
        $manager = new ImageManager([
            'driver' => extension_loaded('imagick') ? 'imagick' : 'gd',
        ]);

        $image = $manager->make($file->getRealPath());

        $image->resize($maxWidth, null, function (Constraint $constraint): void {
            $constraint->aspectRatio();
            $constraint->upsize();
        });

        $path = trim($directory, '/').'/'.Str::ulid().'.webp';

        Storage::disk($disk)->put($path, $image->encode('webp', $quality)->getEncoded());

        return $path;
    }

    /**
     * Remove a stored image; an empty or already missing path is ignored.
     */
    public function delete(?string $path, string $disk = 'public'): void
    {
        if ($path === null || $path === '') {
            return;
        }

        Storage::disk($disk)->delete($path);
    }
}
```

- [ ] **Step 5: Uruchom test i potwierdź, że przechodzi**

Run: `php artisan test --compact tests/Feature/ProjectImageUploadTest.php`
Expected: PASS (5 testów; test z Imagick pominięty, jeśli rozszerzenia brak).

- [ ] **Step 6: Pint i commit**

```bash
vendor/bin/pint --dirty --format agent
git add app/Services/ImageOptimizer.php tests/Feature/ProjectImageUploadTest.php composer.json composer.lock
git commit -m "Extract image conversion into ImageOptimizer and declare intervention/image directly" -m "Claude-Session: https://claude.ai/code/session_013ymSrGVKpfUzjAgpNZaxhz"
```

---

### Task 2: Usunięcie Filament, Livewire i image-optimizer

**Files:**
- Delete: `app/Filament/`, `app/Providers/Filament/`, `config/livewire.php`, `public/css/filament`, `public/js/filament`
- Modify: `bootstrap/providers.php`, `composer.json`, `composer.lock`, `app/Models/User.php`, `app/Http/Middleware/SecurityHeaders.php`, `tests/Feature/CreateAdminUserTest.php`

**Interfaces:**
- Produces: aplikacja bez Filament/Livewire; `/admin` zwraca 404 do czasu Zadania 4.

Kolejność ma znaczenie: skrypty composera i `package:discover` uruchamiają artisan, więc klasy i skrypt Filament muszą zniknąć przed `composer remove`.

- [ ] **Step 1: Usuń skrypt `filament:upgrade` z `composer.json`**

W sekcji `scripts` → `post-autoload-dump` usuń linię `"@php artisan filament:upgrade"` (zostaw `Illuminate\\Foundation\\ComposerScripts::postAutoloadDump` i `@php artisan package:discover --ansi`; popraw przecinki, aby JSON był poprawny).

Run: `composer validate --no-check-publish`
Expected: `./composer.json is valid`.

- [ ] **Step 2: Usuń pliki Filament i wpis providera**

```bash
git rm -r -q app/Filament app/Providers/Filament config/livewire.php public/css/filament public/js/filament
```

W `bootstrap/providers.php` usuń linię `App\Providers\Filament\AdminPanelProvider::class,`.

- [ ] **Step 3: Oczyść `User`, `SecurityHeaders` i test `admin:create`**

`app/Models/User.php`: usuń `use Filament\Models\Contracts\FilamentUser;`, `use Filament\Panel;`, `implements FilamentUser` oraz metodę `canAccessPanel`.

`app/Http/Middleware/SecurityHeaders.php`: usuń blok

```php
        // Skip for Filament admin panel (may have compatibility issues)
        if ($request->is('panel/*') || $request->is('livewire/*')) {
            return $response;
        }

```

i zmień komentarze oraz dyrektywę: `// Styles - allow inline for Tailwind/Livewire and Google Fonts` → `// Styles - allow inline for Tailwind and Google Fonts`; `// Trusted Types policy - allow default policy for GTM, Clarity, and Livewire` → `// Trusted Types policy - allow default policy for GTM and Clarity`; `'trusted-types default dompurify livewire gtm clarity'` → `'trusted-types default dompurify gtm clarity'`.

`tests/Feature/CreateAdminUserTest.php`: usuń `use Filament\Facades\Filament;` i w pierwszym teście zamień końcówkę

```php
    expect(Hash::check('super-secret', $user->password))->toBeTrue()
        ->and($user->canAccessPanel(Filament::getPanel('admin')))->toBeTrue();
```

na

```php
    expect(Hash::check('super-secret', $user->password))->toBeTrue();
```

i nazwę testu na `'creates an admin user with a hashed password'`. (Test logowania na `/admin/login` dojdzie w Zadaniu 4.)

- [ ] **Step 4: Usuń pakiety**

```bash
composer remove filament/filament livewire/livewire joshembling/image-optimizer --no-interaction
git diff --stat composer.json
```

Expected: `composer.json` bez trzech pakietów, `intervention/image` dalej obecne; `composer.lock` traci pakiety Filament i zależności. Jeśli `composer remove` zmieni wersje niezwiązanych pakietów (`laravel/framework`, `inertiajs/inertia-laravel` itd.), sprawdź `git diff composer.lock | grep -E '^[-+]\s+"version"'` i cofnij zmiany wersji, ograniczając się do usunięć (`git checkout composer.lock && composer remove … --no-update && composer update <usuwane pakiety> --with-dependencies` lub równoważnie).

- [ ] **Step 5: Sprawdź, czy nie zostały odwołania**

Run: `grep -rniE "filament|livewire" --include='*.php' --include='*.json' --include='*.ts' --include='*.tsx' --include='*.css' --include='*.blade.php' app bootstrap config routes resources database tests lang composer.json package.json | grep -v node_modules`
Expected: brak trafień poza komentarzem w `app/Http/Middleware/HandleInertiaRequests.php`/`Pest.php` (jeśli są, usuń je). `CLAUDE.md` i `docs/` pomijamy (Zadanie 8).

Run: `php artisan optimize:clear && php artisan route:list --except-vendor | head -20`
Expected: lista tras bez `admin`/`livewire`.

- [ ] **Step 6: Uruchom pełny zestaw testów**

Run: `php artisan test --compact`
Expected: wszystkie testy PASS (strona główna i formularze bez zmian).

- [ ] **Step 7: Commit**

```bash
vendor/bin/pint --dirty --format agent
git add -A
git commit -m "Remove Filament, Livewire and the Filament image optimizer plugin" -m "Claude-Session: https://claude.ai/code/session_013ymSrGVKpfUzjAgpNZaxhz"
```

---

### Task 3: Fundament frontendu (zależności, shadcn, powłoka, wspólne komponenty)

**Files:**
- Modify: `package.json`, `package-lock.json`, `resources/css/app.css`
- Create: `resources/js/types/admin.ts`, `resources/js/lib/admin-routes.ts`
- Create: `resources/js/hooks/{use-selection,use-record-list,use-list-filters}.ts`
- Create: `resources/js/components/admin/{admin-layout,admin-sidebar,nav-user,flash-notice,confirm-delete-dialog,form-field,sortable,list-toolbar,pagination,sort-header,bulk-bar,detail}.tsx`
- Generated: `resources/js/components/ui/*`, `resources/js/hooks/use-mobile.ts`

**Interfaces:**
- Produces (używane przez Zadania 4–7):
  - `adminRoutes` (`lib/admin-routes.ts`), typy z `types/admin.ts`
  - `AdminLayout({ title, breadcrumbs?, actions?, children })`
  - `FormField({ label, htmlFor, error?, hint?, className?, children })`
  - `ConfirmDeleteDialog({ open, onOpenChange, title, description, onConfirm, processing? })`
  - `SortableArea({ ids, onMove, children })`, `SortableTableRow({ id, disabled?, className?, children })`, `SortableListItem({ id, disabled?, className?, children })`
  - `useSelection()`, `useRecordList(options)`, `useListFilters(path, filters)`
  - `ListToolbar`, `Pagination`, `SortHeader`, `BulkBar`, `DetailList`, `DetailItem`, `CopyButton`

- [ ] **Step 1: Zainstaluj `@dnd-kit`**

Run: `npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`
Expected: trzy pakiety w `dependencies`, bez innych zmian.

- [ ] **Step 2: Wygeneruj komponenty shadcn**

Run: `npx shadcn@latest add sidebar table dropdown-menu breadcrumb separator avatar tooltip switch alert-dialog --yes`

Potem sprawdź:

```bash
git status --short resources/js resources/css package.json
git diff resources/js/components/ui/button.tsx resources/js/components/ui/input.tsx resources/js/components/ui/dialog.tsx resources/js/components/ui/sheet.tsx resources/js/components/ui/select.tsx resources/js/components/ui/badge.tsx resources/css/app.css | head -80
```

Zasady po generowaniu:
- Istniejące komponenty (`button`, `input`, `dialog`, `sheet`, `select`, `badge`, `tabs`, `checkbox`, `label`, `alert`, `textarea`, `progress`, `accordion`) mają zostać bez zmian: jeśli CLI je nadpisało, przywróć `git checkout -- <plik>`.
- W każdym nowym pliku importy `cn` muszą wskazywać `@/lib/utils`; hook mobilny ma być w `resources/js/hooks/use-mobile.ts` i importowany jako `@/hooks/use-mobile`.
- Jeśli CLI zmieniło `resources/css/app.css`, zachowaj tylko tokeny z kroku 3 (monochromatyczne); resztę cofnij.
- Jeśli CLI nie działa (brak sieci), skopiuj odpowiednie pliki z `/Users/thryxen/PhpstormProjects/voxbit-center/resources/js/components/ui/` (`sidebar.tsx`, `table.tsx`, `dropdown-menu.tsx`, `breadcrumb.tsx`, `separator.tsx`, `avatar.tsx`, `tooltip.tsx`, `switch.tsx`, `alert-dialog.tsx`, `skeleton.tsx`) i `resources/js/hooks/use-mobile.ts` (jeśli tam jest), a potem popraw importy.

- [ ] **Step 3: Tokeny sidebara i `@source` w `app.css`**

W bloku `@theme inline` po `--color-rivet: var(--rivet);` dodaj:

```css
    --color-sidebar: var(--sidebar);
    --color-sidebar-foreground: var(--sidebar-foreground);
    --color-sidebar-primary: var(--sidebar-primary);
    --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
    --color-sidebar-accent: var(--sidebar-accent);
    --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
    --color-sidebar-border: var(--sidebar-border);
    --color-sidebar-ring: var(--sidebar-ring);
```

W `:root` po `--rivet: oklch(0.8 0 0);` dodaj:

```css
    --sidebar: oklch(0.985 0 0);
    --sidebar-foreground: oklch(0.145 0 0);
    --sidebar-primary: oklch(0.205 0 0);
    --sidebar-primary-foreground: oklch(0.985 0 0);
    --sidebar-accent: oklch(0.97 0 0);
    --sidebar-accent-foreground: oklch(0.205 0 0);
    --sidebar-border: oklch(0.922 0 0);
    --sidebar-ring: oklch(0.145 0 0);
```

W `.dark` po `--rivet: oklch(0.38 0 0);` dodaj:

```css
    --sidebar: oklch(0.205 0 0);
    --sidebar-foreground: oklch(0.985 0 0);
    --sidebar-primary: oklch(0.922 0 0);
    --sidebar-primary-foreground: oklch(0.205 0 0);
    --sidebar-accent: oklch(0.269 0 0);
    --sidebar-accent-foreground: oklch(0.985 0 0);
    --sidebar-border: oklch(1 0 0 / 10%);
    --sidebar-ring: oklch(0.985 0 0);
```

Pod `@source '../views/app.blade.php';` dodaj `@source '../views/admin.blade.php';`.

- [ ] **Step 4: Typy i trasy**

`resources/js/types/admin.ts`:

```ts
export type AdminUser = { id: number; name: string; email: string };

export type AdminSharedProps = {
    auth: { user: AdminUser | null };
    sidebarOpen: boolean;
    flash: { success: string | null };
    errors: Record<string, string>;
};

export type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    from: number | null;
    to: number | null;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
};

export type LeadFilters = {
    search: string;
    from: string;
    until: string;
    sort: string;
    direction: 'asc' | 'desc';
};

export type AdminProjectRow = {
    id: number;
    title: string;
    slug: string;
    url: string;
    category: string;
    sortOrder: number;
    isActive: boolean;
    thumbnailUrl: string | null;
    updatedAt: string;
};

export type AdminProject = AdminProjectRow & {
    description: string;
    fullDescription: string;
    fullImageUrl: string | null;
    techStack: string[];
    metrics: { value: string; label: string }[];
    challenges: string[];
    solutions: string[];
};

export type AdminClient = {
    id: number;
    name: string;
    url: string | null;
    sortOrder: number;
    isActive: boolean;
    updatedAt: string;
};

export type AdminMessageRow = {
    id: number;
    name: string;
    email: string;
    subject: string | null;
    excerpt: string;
    createdAt: string;
};

export type AdminMessage = AdminMessageRow & { message: string };

export type AdminBriefRow = {
    id: number;
    name: string;
    email: string;
    company: string | null;
    types: string[];
    budget: string | null;
    timeline: string | null;
    createdAt: string;
};

export type AdminBrief = AdminBriefRow & {
    phone: string | null;
    position: string | null;
    website: string | null;
    source: string | null;
    contactPref: string[];
    features: string[];
    industry: string | null;
    audience: string | null;
    design: string | null;
    tech: string[];
    security: string | null;
    hosting: string | null;
    integrations: string | null;
    cooperationModel: string | null;
    notes: string | null;
};

export type AdminCallbackRow = { id: number; phone: string; createdAt: string };
```

`resources/js/lib/admin-routes.ts`:

```ts
const base = '/admin';

export const adminRoutes = {
    login: `${base}/login`,
    logout: `${base}/logout`,
    projects: {
        index: `${base}/projects`,
        create: `${base}/projects/create`,
        edit: (id: number): string => `${base}/projects/${id}/edit`,
        update: (id: number): string => `${base}/projects/${id}`,
        destroy: (id: number): string => `${base}/projects/${id}`,
        reorder: `${base}/projects/reorder`,
    },
    clients: {
        index: `${base}/clients`,
        create: `${base}/clients/create`,
        edit: (id: number): string => `${base}/clients/${id}/edit`,
        update: (id: number): string => `${base}/clients/${id}`,
        destroy: (id: number): string => `${base}/clients/${id}`,
        reorder: `${base}/clients/reorder`,
    },
    messages: {
        index: `${base}/messages`,
        show: (id: number): string => `${base}/messages/${id}`,
        destroy: (id: number): string => `${base}/messages/${id}`,
    },
    briefs: {
        index: `${base}/briefs`,
        show: (id: number): string => `${base}/briefs/${id}`,
        destroy: (id: number): string => `${base}/briefs/${id}`,
    },
    callbacks: {
        index: `${base}/callbacks`,
        destroy: (id: number): string => `${base}/callbacks/${id}`,
    },
} as const;
```

- [ ] **Step 5: Hooki**

`resources/js/hooks/use-selection.ts`:

```ts
import { useCallback, useState } from 'react';

export function useSelection() {
    const [selected, setSelected] = useState<number[]>([]);

    const toggle = useCallback((id: number): void => {
        setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
    }, []);

    /** Selects every given id, or clears them when all of them are already selected. */
    const toggleAll = useCallback((ids: number[]): void => {
        setSelected((current) =>
            ids.length > 0 && ids.every((id) => current.includes(id))
                ? current.filter((id) => !ids.includes(id))
                : Array.from(new Set([...current, ...ids])),
        );
    }, []);

    const clear = useCallback((): void => setSelected([]), []);

    return { selected, toggle, toggleAll, clear };
}
```

`resources/js/hooks/use-list-filters.ts`:

```ts
import { router } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Filters of a server-side list. The state is the source of truth after mount; every change reloads the list
 * through the query string (search is debounced), keeping the scroll position and replacing the history entry.
 */
export function useListFilters<T extends Record<string, string>>(path: string, initial: T) {
    const [values, setValues] = useState<T>(initial);
    const timer = useRef<number | undefined>(undefined);

    useEffect(() => () => window.clearTimeout(timer.current), []);

    const visit = useCallback(
        (next: T): void => {
            const query = Object.fromEntries(Object.entries(next).filter(([, value]) => value !== ''));

            router.get(path, query, { preserveState: true, preserveScroll: true, replace: true });
        },
        [path],
    );

    const update = useCallback(
        (patch: Partial<T>, debounce = false): void => {
            const next = { ...values, ...patch };

            setValues(next);
            window.clearTimeout(timer.current);

            if (debounce) {
                timer.current = window.setTimeout(() => visit(next), 300);

                return;
            }

            visit(next);
        },
        [values, visit],
    );

    /** Clicking the active column flips the direction; a new column starts ascending (dates start descending). */
    const toggleSort = useCallback(
        (column: string): void => {
            if (values.sort === column) {
                update({ direction: values.direction === 'asc' ? 'desc' : 'asc' } as unknown as Partial<T>);

                return;
            }

            update({ sort: column, direction: column === 'created_at' ? 'desc' : 'asc' } as unknown as Partial<T>);
        },
        [update, values.direction, values.sort],
    );

    return { values, update, toggleSort };
}
```

`resources/js/hooks/use-record-list.ts`:

```ts
import { arrayMove } from '@dnd-kit/sortable';
import { router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

import { useSelection } from '@/hooks/use-selection';

type Record = { id: number; isActive: boolean };

export type StatusFilter = 'all' | 'active' | 'inactive';

type Options<T extends Record> = {
    records: T[];
    reorderUrl: string;
    searchText: (record: T) => string;
};

/**
 * State of a short, fully loaded, manually ordered list (projects, clients): client-side search and status
 * filter, selection, and optimistic drag-and-drop ordering saved through the reorder endpoint.
 */
export function useRecordList<T extends Record>({ records, reorderUrl, searchText }: Options<T>) {
    const [rows, setRows] = useState(records);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<StatusFilter>('all');
    const selection = useSelection();

    useEffect(() => setRows(records), [records]);

    const visibleRows = useMemo(() => {
        const needle = search.trim().toLowerCase();

        return rows.filter((row) => {
            if (status === 'active' && !row.isActive) {
                return false;
            }

            if (status === 'inactive' && row.isActive) {
                return false;
            }

            return needle === '' || searchText(row).toLowerCase().includes(needle);
        });
    }, [rows, search, status, searchText]);

    const canReorder = search.trim() === '' && status === 'all';

    const move = (activeId: number | string, overId: number | string): void => {
        const from = rows.findIndex((row) => row.id === activeId);
        const to = rows.findIndex((row) => row.id === overId);

        if (from === -1 || to === -1 || from === to) {
            return;
        }

        const previous = rows;
        const next = arrayMove(rows, from, to);

        setRows(next);

        router.post(
            reorderUrl,
            { ids: next.map((row) => row.id) },
            { preserveScroll: true, preserveState: true, onError: () => setRows(previous) },
        );
    };

    return { rows, visibleRows, search, setSearch, status, setStatus, canReorder, move, selection };
}
```

(Uwaga: nazwa typu `Record` przesłania globalny `Record`; zmień ją na `Orderable` w obu miejscach pliku, jeśli `tsc` zgłosi konflikt.)

- [ ] **Step 6: Powłoka panelu**

`resources/js/components/admin/flash-notice.tsx`:

```tsx
import { usePage } from '@inertiajs/react';
import { CircleAlertIcon, CircleCheckIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import type { AdminSharedProps } from '@/types/admin';

/** Shows the one-off success message of the last action, and a form-level error (expired session, server error). */
export function FlashNotice() {
    const { flash, errors } = usePage<AdminSharedProps>().props;
    const success = flash?.success ?? null;
    const formError = errors?.form ?? null;
    const [visible, setVisible] = useState(Boolean(success));

    useEffect(() => {
        setVisible(Boolean(success));

        if (!success) {
            return;
        }

        const timer = window.setTimeout(() => setVisible(false), 6000);

        return () => window.clearTimeout(timer);
    }, [flash, success]);

    return (
        <>
            {visible && success ? (
                <Alert role="status">
                    <CircleCheckIcon />
                    <AlertDescription>{success}</AlertDescription>
                </Alert>
            ) : null}
            {formError ? (
                <Alert variant="destructive">
                    <CircleAlertIcon />
                    <AlertDescription>{formError}</AlertDescription>
                </Alert>
            ) : null}
        </>
    );
}
```

`resources/js/components/admin/nav-user.tsx`:

```tsx
import { router } from '@inertiajs/react';
import { ChevronsUpDownIcon, LogOutIcon, MoonIcon, SunIcon } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { useAppearance } from '@/hooks/use-appearance';
import { adminRoutes } from '@/lib/admin-routes';
import type { AdminUser } from '@/types/admin';

function initials(name: string): string {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('');
}

function UserInfo({ user }: { user: AdminUser }) {
    return (
        <>
            <Avatar className="size-8 rounded-lg">
                <AvatarFallback className="rounded-lg">{initials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
            </div>
        </>
    );
}

export function NavUser({ user }: { user: AdminUser }) {
    const { isMobile } = useSidebar();
    const { appearance, toggleAppearance } = useAppearance();

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                            <UserInfo user={user} />
                            <ChevronsUpDownIcon className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="min-w-56 rounded-lg" side={isMobile ? 'bottom' : 'right'} align="end" sideOffset={4}>
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <UserInfo user={user} />
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={toggleAppearance}>
                            {appearance === 'dark' ? <SunIcon /> : <MoonIcon />}
                            {appearance === 'dark' ? 'Jasny motyw' : 'Ciemny motyw'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => router.post(adminRoutes.logout)}>
                            <LogOutIcon />
                            Wyloguj
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
```

`resources/js/components/admin/admin-sidebar.tsx`:

```tsx
import { Link, usePage } from '@inertiajs/react';
import { BriefcaseIcon, Building2Icon, FileTextIcon, MailIcon, PhoneIcon, type LucideIcon } from 'lucide-react';
import type { ComponentProps } from 'react';

import { NavUser } from '@/components/admin/nav-user';
import { Logo, LogoMark } from '@/components/home/logo';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from '@/components/ui/sidebar';
import { adminRoutes } from '@/lib/admin-routes';
import type { AdminSharedProps } from '@/types/admin';

type NavItem = { title: string; href: string; icon: LucideIcon };

const groups: { label: string; items: NavItem[] }[] = [
    {
        label: 'Treści',
        items: [
            { title: 'Projekty', href: adminRoutes.projects.index, icon: BriefcaseIcon },
            { title: 'Klienci', href: adminRoutes.clients.index, icon: Building2Icon },
        ],
    },
    {
        label: 'Kontakt',
        items: [
            { title: 'Wiadomości', href: adminRoutes.messages.index, icon: MailIcon },
            { title: 'Briefy', href: adminRoutes.briefs.index, icon: FileTextIcon },
            { title: 'Prośby o kontakt', href: adminRoutes.callbacks.index, icon: PhoneIcon },
        ],
    },
];

export function AdminSidebar(props: ComponentProps<typeof Sidebar>) {
    const { auth } = usePage<AdminSharedProps>().props;
    const path = usePage().url.split('?')[0];

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild size="lg" tooltip="Panel Netizo" className="h-auto py-2 group-data-[collapsible=icon]:justify-center">
                            <Link href={adminRoutes.projects.index}>
                                <LogoMark className="hidden h-5 w-auto group-data-[collapsible=icon]:block" aria-hidden />
                                <span className="flex flex-col gap-1 group-data-[collapsible=icon]:hidden">
                                    <Logo className="h-6 w-auto self-start" title="Netizo" />
                                    <span className="text-xs text-sidebar-foreground/70">Panel administracyjny</span>
                                </span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                {groups.map((group) => (
                    <SidebarGroup key={group.label}>
                        <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                        <SidebarMenu>
                            {group.items.map((item) => (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton asChild isActive={path === item.href || path.startsWith(`${item.href}/`)} tooltip={item.title}>
                                        <Link href={item.href}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>
                ))}
            </SidebarContent>
            <SidebarFooter>{auth.user ? <NavUser user={auth.user} /> : null}</SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
```

`resources/js/components/admin/admin-layout.tsx`:

```tsx
import { Head, Link } from '@inertiajs/react';
import { Fragment, type ReactNode } from 'react';

import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { FlashNotice } from '@/components/admin/flash-notice';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { usePage } from '@inertiajs/react';
import type { AdminSharedProps } from '@/types/admin';

type AdminLayoutProps = {
    title: string;
    /** Parent pages shown before the title, e.g. the list above an edit form. */
    breadcrumbs?: { title: string; href: string }[];
    /** Page actions shown on the right of the top bar. */
    actions?: ReactNode;
    children: ReactNode;
};

export function AdminLayout({ title, breadcrumbs = [], actions, children }: AdminLayoutProps) {
    const { sidebarOpen } = usePage<AdminSharedProps>().props;

    return (
        <SidebarProvider defaultOpen={sidebarOpen}>
            <Head title={`${title} – Panel Netizo`} />

            <AdminSidebar />

            <SidebarInset className="min-w-0">
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                {breadcrumbs.map((crumb) => (
                                    <Fragment key={crumb.href}>
                                        <BreadcrumbItem className="hidden md:block">
                                            <BreadcrumbLink asChild>
                                                <Link href={crumb.href}>{crumb.title}</Link>
                                            </BreadcrumbLink>
                                        </BreadcrumbItem>
                                        <BreadcrumbSeparator className="hidden md:block" />
                                    </Fragment>
                                ))}
                                <BreadcrumbItem>
                                    <BreadcrumbPage>{title}</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    <div className="ml-auto flex items-center gap-2 px-4">{actions}</div>
                </header>

                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <FlashNotice />
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
```

(Połącz dwa importy z `@inertiajs/react` w jeden: `import { Head, Link, usePage } from '@inertiajs/react';`.)

- [ ] **Step 7: Wspólne komponenty list i formularzy**

`resources/js/components/admin/form-field.tsx`:

```tsx
import type { ReactNode } from 'react';

import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type FormFieldProps = {
    label: string;
    htmlFor?: string;
    error?: string;
    hint?: string;
    className?: string;
    children: ReactNode;
};

export function FormField({ label, htmlFor, error, hint, className, children }: FormFieldProps) {
    return (
        <div className={cn('grid gap-2', className)}>
            <Label htmlFor={htmlFor}>{label}</Label>
            {children}
            {error ? (
                <p className="text-sm text-destructive" role="alert">
                    {error}
                </p>
            ) : hint ? (
                <p className="text-sm text-muted-foreground">{hint}</p>
            ) : null}
        </div>
    );
}
```

`resources/js/components/admin/confirm-delete-dialog.tsx`:

```tsx
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type ConfirmDeleteDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    onConfirm: () => void;
    processing?: boolean;
};

export function ConfirmDeleteDialog({ open, onOpenChange, title, description, onConfirm, processing = false }: ConfirmDeleteDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={processing}>Anuluj</AlertDialogCancel>
                    <AlertDialogAction
                        disabled={processing}
                        className="bg-destructive text-white hover:bg-destructive/90"
                        onClick={(event) => {
                            event.preventDefault();
                            onConfirm();
                        }}
                    >
                        Usuń
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
```

`resources/js/components/admin/sortable.tsx`:

```tsx
import {
    DndContext,
    KeyboardSensor,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
    type DragEndEvent,
    type UniqueIdentifier,
} from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVerticalIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

type SortableAreaProps = {
    ids: UniqueIdentifier[];
    onMove: (activeId: UniqueIdentifier, overId: UniqueIdentifier) => void;
    children: ReactNode;
};

/** Drag-and-drop context for a vertical list; the pointer needs a few pixels of movement so clicks still work. */
export function SortableArea({ ids, onMove, children }: SortableAreaProps) {
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const handleDragEnd = ({ active, over }: DragEndEvent): void => {
        if (over && active.id !== over.id) {
            onMove(active.id, over.id);
        }
    };

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={ids} strategy={verticalListSortingStrategy}>
                {children}
            </SortableContext>
        </DndContext>
    );
}

type HandleProps = {
    setActivatorNodeRef: (element: HTMLElement | null) => void;
    attributes: Record<string, unknown>;
    listeners: Record<string, unknown> | undefined;
    disabled: boolean;
};

function DragHandle({ setActivatorNodeRef, attributes, listeners, disabled }: HandleProps) {
    return (
        <Button
            ref={setActivatorNodeRef}
            type="button"
            variant="ghost"
            size="icon-sm"
            className="cursor-grab touch-none active:cursor-grabbing"
            disabled={disabled}
            aria-label="Przeciągnij, aby zmienić kolejność"
            {...attributes}
            {...listeners}
        >
            <GripVerticalIcon />
        </Button>
    );
}

type SortableItemProps = {
    id: UniqueIdentifier;
    disabled?: boolean;
    className?: string;
    children: ReactNode;
};

/** A table row with a drag handle in its first cell. */
export function SortableTableRow({ id, disabled = false, className, children }: SortableItemProps) {
    const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id, disabled });

    return (
        <TableRow
            ref={setNodeRef}
            style={{ transform: CSS.Translate.toString(transform), transition }}
            className={cn(isDragging && 'relative z-10 bg-muted shadow-sm', className)}
        >
            <TableCell className="w-10">
                <DragHandle setActivatorNodeRef={setActivatorNodeRef} attributes={attributes} listeners={listeners} disabled={disabled} />
            </TableCell>
            {children}
        </TableRow>
    );
}

/** A block in a list (repeater item) with a drag handle on the left. */
export function SortableListItem({ id, disabled = false, className, children }: SortableItemProps) {
    const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id, disabled });

    return (
        <div
            ref={setNodeRef}
            style={{ transform: CSS.Translate.toString(transform), transition }}
            className={cn('flex items-start gap-2 rounded-md border bg-background p-2', isDragging && 'relative z-10 shadow-sm', className)}
        >
            <DragHandle setActivatorNodeRef={setActivatorNodeRef} attributes={attributes} listeners={listeners} disabled={disabled} />
            {children}
        </div>
    );
}
```

`resources/js/components/admin/bulk-bar.tsx`:

```tsx
import { Trash2Icon } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function BulkBar({ count, onDelete }: { count: number; onDelete: () => void }) {
    if (count === 0) {
        return null;
    }

    return (
        <div className="flex items-center justify-between gap-3 rounded-md border bg-muted/50 px-3 py-2 text-sm">
            <span>Zaznaczono: {count}</span>
            <Button type="button" variant="destructive" size="sm" onClick={onDelete}>
                <Trash2Icon />
                Usuń zaznaczone
            </Button>
        </div>
    );
}
```

`resources/js/components/admin/sort-header.tsx`:

```tsx
import { ChevronDownIcon, ChevronUpIcon, ChevronsUpDownIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { TableHead } from '@/components/ui/table';
import type { LeadFilters } from '@/types/admin';

type SortHeaderProps = {
    column: string;
    label: string;
    filters: Pick<LeadFilters, 'sort' | 'direction'>;
    onSort: (column: string) => void;
};

export function SortHeader({ column, label, filters, onSort }: SortHeaderProps) {
    const active = filters.sort === column;
    const Icon = !active ? ChevronsUpDownIcon : filters.direction === 'asc' ? ChevronUpIcon : ChevronDownIcon;

    return (
        <TableHead aria-sort={active ? (filters.direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
            <Button type="button" variant="ghost" size="sm" className="-ml-3" onClick={() => onSort(column)}>
                {label}
                <Icon className="opacity-70" />
            </Button>
        </TableHead>
    );
}
```

`resources/js/components/admin/list-toolbar.tsx`:

```tsx
import { SearchIcon, XIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { LeadFilters } from '@/types/admin';

type ListToolbarProps = {
    values: LeadFilters;
    onChange: (patch: Partial<LeadFilters>, debounce?: boolean) => void;
    searchLabel: string;
    /** Extra filters shown after the date range (e.g. selects). */
    children?: ReactNode;
    onReset: () => void;
    hasActiveFilters: boolean;
};

export function ListToolbar({ values, onChange, searchLabel, children, onReset, hasActiveFilters }: ListToolbarProps) {
    return (
        <div className="flex flex-wrap items-end gap-3">
            <div className="grid min-w-56 flex-1 gap-1.5">
                <Label htmlFor="list-search">{searchLabel}</Label>
                <div className="relative">
                    <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        id="list-search"
                        type="search"
                        className="pl-9"
                        value={values.search}
                        onChange={(event) => onChange({ search: event.target.value }, true)}
                    />
                </div>
            </div>
            <div className="grid gap-1.5">
                <Label htmlFor="list-from">Od</Label>
                <Input id="list-from" type="date" value={values.from} max={values.until || undefined} onChange={(event) => onChange({ from: event.target.value })} />
            </div>
            <div className="grid gap-1.5">
                <Label htmlFor="list-until">Do</Label>
                <Input id="list-until" type="date" value={values.until} min={values.from || undefined} onChange={(event) => onChange({ until: event.target.value })} />
            </div>
            {children}
            {hasActiveFilters ? (
                <Button type="button" variant="ghost" onClick={onReset}>
                    <XIcon />
                    Wyczyść filtry
                </Button>
            ) : null}
        </div>
    );
}
```

`resources/js/components/admin/pagination.tsx`:

```tsx
import { Link } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import type { Paginated } from '@/types/admin';

/** Laravel paginator links: the first entry is "previous", the last "next", the rest are pages or an ellipsis. */
export function Pagination({ paginator }: { paginator: Paginated<unknown> }) {
    if (paginator.total === 0) {
        return null;
    }

    const previous = paginator.links[0];
    const next = paginator.links[paginator.links.length - 1];
    const pages = paginator.links.slice(1, -1);

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
            <span>
                {paginator.from}–{paginator.to} z {paginator.total}
            </span>
            {paginator.last_page > 1 ? (
                <nav className="flex items-center gap-1" aria-label="Paginacja">
                    <Button asChild variant="outline" size="sm" disabled={!previous?.url}>
                        {previous?.url ? <Link href={previous.url} preserveScroll>Poprzednia</Link> : <span>Poprzednia</span>}
                    </Button>
                    {pages.map((page, index) =>
                        page.url ? (
                            <Button key={`${page.label}-${index}`} asChild variant={page.active ? 'default' : 'outline'} size="sm">
                                <Link href={page.url} preserveScroll aria-current={page.active ? 'page' : undefined}>
                                    {page.label}
                                </Link>
                            </Button>
                        ) : (
                            <span key={`${page.label}-${index}`} className="px-2">
                                …
                            </span>
                        ),
                    )}
                    <Button asChild variant="outline" size="sm" disabled={!next?.url}>
                        {next?.url ? <Link href={next.url} preserveScroll>Następna</Link> : <span>Następna</span>}
                    </Button>
                </nav>
            ) : null}
        </div>
    );
}
```

`resources/js/components/admin/detail.tsx`:

```tsx
import { CheckIcon, CopyIcon } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';

import { Button } from '@/components/ui/button';

export function DetailList({ children }: { children: ReactNode }) {
    return <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">{children}</dl>;
}

type DetailItemProps = {
    label: string;
    children?: ReactNode;
    empty?: string;
    className?: string;
};

export function DetailItem({ label, children, empty = 'Nie podano', className }: DetailItemProps) {
    const isEmpty = children === null || children === undefined || children === '' || (Array.isArray(children) && children.length === 0);

    return (
        <div className={className}>
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="mt-1 text-sm break-words whitespace-pre-line">
                {isEmpty ? <span className="text-muted-foreground">{empty}</span> : children}
            </dd>
        </div>
    );
}

/** Copies a value to the clipboard on click and briefly confirms it. */
export function CopyButton({ value, label }: { value: string; label: string }) {
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!copied) {
            return;
        }

        const timer = window.setTimeout(() => setCopied(false), 1500);

        return () => window.clearTimeout(timer);
    }, [copied]);

    return (
        <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label={copied ? 'Skopiowano' : `Kopiuj: ${label}`}
            onClick={() => {
                void navigator.clipboard.writeText(value).then(() => setCopied(true));
            }}
        >
            {copied ? <CheckIcon /> : <CopyIcon />}
        </Button>
    );
}
```

- [ ] **Step 8: Sprawdź typy i zbuduj**

Run: `npx tsc --noEmit`
Expected: brak błędów. Napraw ewentualne rozbieżności typów (np. generyk `usePage<AdminSharedProps>()` – jeśli Inertia v3 wymaga ograniczenia `PageProps`, dopisz `& Record<string, unknown>` do `AdminSharedProps`; nazwa `Record` w `use-record-list.ts` – patrz uwaga w kroku 5).

Run: `npm run build`
Expected: build klienta i SSR przechodzi (strony admina jeszcze nie istnieją, więc nie są w bundlu).

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "Add the admin panel shell, shared list and form components and sidebar tokens" -m "Claude-Session: https://claude.ai/code/session_013ymSrGVKpfUzjAgpNZaxhz"
```

---

### Task 4: Logowanie, root view i wspólne dane Inertia

**Files:**
- Create: `routes/admin.php`, `resources/views/admin.blade.php`
- Create: `app/Http/Controllers/Admin/Auth/LoginController.php`, `app/Http/Requests/Admin/LoginRequest.php`
- Create: `resources/js/pages/admin/login.tsx`
- Create: `tests/Feature/Admin/AdminAuthTest.php`
- Modify: `bootstrap/app.php`, `app/Http/Middleware/HandleInertiaRequests.php`, `tests/Feature/CreateAdminUserTest.php`, `tests/Feature/SecurityHeadersTest.php`

**Interfaces:**
- Consumes: `adminRoutes.login`, `adminRoutes.logout`, `AdminSharedProps` (Zadanie 3).
- Produces: trasy `admin.login` (GET), `admin.login.store` (POST), `admin.logout` (POST), `admin.home` (GET `/admin`, przekierowanie na `admin.projects.index`); współdzielone propsy `auth.user`, `sidebarOpen`, `flash.success` dla ścieżek `admin*`; root view `admin` bez SSR.

- [ ] **Step 1: Napisz testy logowania (jeszcze nie przejdą)**

Run: `php artisan make:test --pest Admin/AdminAuthTest --no-interaction`, następnie nadpisz `tests/Feature/Admin/AdminAuthTest.php`:

```php
<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->withoutVite();
});

it('redirects guests from the panel home to the login page', function () {
    $this->get('/admin')->assertRedirect(route('admin.login'));
});

it('renders the login page without tracking scripts and marked noindex', function () {
    $this->get(route('admin.login'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('admin/login'))
        ->assertSee('noindex', false)
        ->assertDontSee('googletagmanager', false)
        ->assertDontSee('clarity.ms', false);
});

it('logs a user in and sends them to the panel', function () {
    $user = User::factory()->create();

    $this->post(route('admin.login.store'), ['email' => $user->email, 'password' => 'password'])
        ->assertRedirect(route('admin.home'));

    $this->assertAuthenticatedAs($user);
});

it('rejects a wrong password and an unknown email with the same message', function () {
    $user = User::factory()->create();

    $this->post(route('admin.login.store'), ['email' => $user->email, 'password' => 'zle-haslo'])
        ->assertSessionHasErrors(['email' => 'Nieprawidłowy adres e-mail lub hasło.']);

    $this->post(route('admin.login.store'), ['email' => 'nikt@netizo.pl', 'password' => 'password'])
        ->assertSessionHasErrors(['email' => 'Nieprawidłowy adres e-mail lub hasło.']);

    $this->assertGuest();
});

it('requires an email and a password', function () {
    $this->post(route('admin.login.store'), [])->assertSessionHasErrors(['email', 'password']);
});

it('locks the login after five failed attempts, even for the right password', function () {
    $user = User::factory()->create();

    foreach (range(1, 5) as $attempt) {
        $this->post(route('admin.login.store'), ['email' => $user->email, 'password' => 'zle-haslo']);
    }

    $this->post(route('admin.login.store'), ['email' => $user->email, 'password' => 'password'])
        ->assertSessionHasErrors('email');

    $this->assertGuest();
});

it('counts attempts per email regardless of letter case', function () {
    $user = User::factory()->create(['email' => 'admin@netizo.pl']);

    foreach (range(1, 5) as $attempt) {
        $this->post(route('admin.login.store'), ['email' => 'ADMIN@netizo.pl', 'password' => 'zle-haslo']);
    }

    $this->post(route('admin.login.store'), ['email' => 'admin@netizo.pl', 'password' => 'password'])
        ->assertSessionHasErrors('email');

    $this->assertGuest();
});

it('logs out and redirects to the login page', function () {
    $this->actingAs(User::factory()->create())
        ->post(route('admin.logout'))
        ->assertRedirect(route('admin.login'));

    $this->assertGuest();
});

it('keeps logged in users away from the login page', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('admin.login'))
        ->assertRedirect(route('admin.home'));
});

it('shares the user, the sidebar state and no tracking on admin pages only', function () {
    $this->get(route('admin.login'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('auth.user', null)
            ->where('sidebarOpen', true));

    $this->withUnencryptedCookie('sidebar_state', 'false')
        ->get(route('admin.login'))
        ->assertInertia(fn (Assert $page) => $page->where('sidebarOpen', false));

    $this->get('/')->assertInertia(fn (Assert $page) => $page->missing('auth')->missing('sidebarOpen'));
});
```

Uzupełnij `tests/Feature/CreateAdminUserTest.php` o test logowania na końcu pliku:

```php
it('creates an account that can log in to the panel', function () {
    $this->artisan('admin:create', [
        '--name' => 'Dawid Idzik',
        '--email' => 'admin@netizo.pl',
        '--password' => 'super-secret',
    ])->assertSuccessful();

    $this->withoutVite()
        ->post(route('admin.login.store'), ['email' => 'admin@netizo.pl', 'password' => 'super-secret'])
        ->assertRedirect(route('admin.home'));

    $this->assertAuthenticated();
});
```

Dodaj do `tests/Feature/SecurityHeadersTest.php` (na końcu):

```php
it('sends the strict content security policy on admin pages too', function () {
    $response = $this->withoutVite()->get('/admin/login')->assertOk();

    expect($response->headers->get('Content-Security-Policy'))
        ->toContain("require-trusted-types-for 'script'")
        ->not->toContain('livewire');
});
```

Run: `php artisan test --compact tests/Feature/Admin/AdminAuthTest.php`
Expected: FAIL (trasa `admin.login` nie istnieje).

- [ ] **Step 2: Żądanie logowania i kontroler**

Run:
```bash
php artisan make:request Admin/LoginRequest --no-interaction
php artisan make:controller Admin/Auth/LoginController --no-interaction
```

`app/Http/Requests/Admin/LoginRequest.php`:

```php
<?php

namespace App\Http\Requests\Admin;

use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    private const MAX_ATTEMPTS = 5;

    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
            'remember' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'email.required' => 'Podaj adres e-mail.',
            'email.email' => 'Podaj poprawny adres e-mail.',
            'password.required' => 'Podaj hasło.',
        ];
    }

    /**
     * Try to log in; five failures per email and IP lock further attempts for a while.
     *
     * @throws ValidationException
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        if (! Auth::attempt($this->only('email', 'password'), $this->boolean('remember'))) {
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'email' => 'Nieprawidłowy adres e-mail lub hasło.',
            ]);
        }

        RateLimiter::clear($this->throttleKey());
    }

    /**
     * @throws ValidationException
     */
    protected function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), self::MAX_ATTEMPTS)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'email' => "Zbyt wiele prób logowania. Spróbuj ponownie za {$seconds} s.",
        ]);
    }

    public function throttleKey(): string
    {
        return Str::transliterate(Str::lower($this->string('email')->toString()).'|'.$this->ip());
    }
}
```

`app/Http/Controllers/Admin/Auth/LoginController.php`:

```php
<?php

namespace App\Http\Controllers\Admin\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class LoginController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('admin/login');
    }

    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        return redirect()->intended(route('admin.home', absolute: false));
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return to_route('admin.login');
    }
}
```

- [ ] **Step 3: Trasy panelu**

`routes/admin.php`:

```php
<?php

use App\Http\Controllers\Admin\Auth\LoginController;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')->name('admin.')->group(function () {
    Route::middleware('guest')->group(function () {
        Route::get('login', [LoginController::class, 'create'])->name('login');
        Route::post('login', [LoginController::class, 'store'])->name('login.store');
    });

    Route::middleware('auth')->group(function () {
        Route::get('/', fn () => to_route('admin.projects.index'))->name('home');
        Route::post('logout', [LoginController::class, 'destroy'])->name('logout');
    });
});
```

`bootstrap/app.php`: dodaj `use Illuminate\Support\Facades\Route;`, w `withRouting(...)` dodaj argument

```php
        then: function (): void {
            Route::middleware('web')->group(base_path('routes/admin.php'));
        },
```

a w `withMiddleware` po linii `$middleware->encryptCookies(except: ['appearance']);` zmień na

```php
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->redirectGuestsTo(fn (Request $request): string => route('admin.login'));
        $middleware->redirectUsersTo(fn (Request $request): string => route('admin.home'));
```

- [ ] **Step 4: Middleware Inertia**

Sprawdź sygnaturę: `grep -n "function rootView" -B2 -A4 vendor/inertiajs/inertia-laravel/src/Middleware.php`.

`app/Http/Middleware/HandleInertiaRequests.php`: dodaj

```php
    /**
     * The admin panel is a client-rendered app behind a login: no server-side rendering for it.
     *
     * @var list<string>
     */
    protected $withoutSsr = ['admin', 'admin/*'];

    /**
     * The panel has its own root view, without the tracking scripts and cookie banner of the public site.
     */
    public function rootView(Request $request): string
    {
        return $this->isAdminRequest($request) ? 'admin' : 'app';
    }
```

(Jeśli odziedziczona sygnatura różni się, np. brak typu zwracanego, dostosuj ją do rodzica.) Zamień `share()` na:

```php
    public function share(Request $request): array
    {
        $shared = parent::share($request);

        if (! $this->isAdminRequest($request)) {
            return $shared;
        }

        return [
            ...$shared,
            'auth' => [
                'user' => fn () => $request->user()?->only('id', 'name', 'email'),
            ],
            'sidebarOpen' => $request->cookie('sidebar_state') !== 'false',
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
            ],
        ];
    }

    private function isAdminRequest(Request $request): bool
    {
        return $request->is('admin', 'admin/*');
    }
```

Usuń `protected $rootView = 'app';` tylko jeśli rodzic go nie wymaga; w przeciwnym razie zostaw (metoda `rootView()` ma pierwszeństwo).

- [ ] **Step 5: Root view panelu**

`resources/views/admin.blade.php`:

```blade
<!DOCTYPE html>
<html lang="pl" @class(['dark' => ($appearance ?? 'light') === 'dark'])>
<head>
    {{-- Trusted Types default policy, as on the public site (the CSP requires it for scripts). --}}
    <script>
        if (window.trustedTypes && trustedTypes.createPolicy) {
            trustedTypes.createPolicy('default', {
                createHTML: (string) => string,
                createScriptURL: (string) => string,
                createScript: (string) => string,
            });
        }
    </script>

    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow">
    <meta name="theme-color" content="{{ ($appearance ?? 'light') === 'dark' ? '#0a0a0a' : '#ffffff' }}">
    <title inertia>Panel Netizo</title>

    {{-- Theme before first paint (no flash): cookie first, its localStorage copy when the cookie is gone. --}}
    <script>
        (function () {
            var dark = @json(($appearance ?? 'light') === 'dark');
            if (!@json($appearanceFromCookie ?? false)) {
                try {
                    dark = window.localStorage.getItem('appearance') === 'dark';
                } catch (e) {}
            }
            document.documentElement.classList.toggle('dark', dark);
            document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
        })();
    </script>
    <style>
        html { background-color: oklch(1 0 0); }
        html.dark { background-color: oklch(0.145 0 0); }
    </style>

    <link rel="icon" href="{{ asset('favicon.ico') }}?v=3" sizes="any" />
    <link rel="icon" type="image/svg+xml" href="{{ asset('favicon.svg') }}?v=3" />
    <link rel="apple-touch-icon" href="{{ asset('apple-touch-icon.png') }}?v=3" />

    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
    @inertiaHead
</head>
<body>
    @inertia
</body>
</html>
```

- [ ] **Step 6: Strona logowania**

`resources/js/pages/admin/login.tsx`:

```tsx
import { Head, useForm, usePage } from '@inertiajs/react';
import type { FormEvent } from 'react';

import { FormField } from '@/components/admin/form-field';
import { Logo } from '@/components/home/logo';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { adminRoutes } from '@/lib/admin-routes';

export default function Login() {
    const { errors: pageErrors } = usePage<{ errors: Record<string, string> }>().props;
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        post(adminRoutes.login, { onFinish: () => reset('password') });
    };

    return (
        <main className="flex min-h-svh items-center justify-center p-6 md:p-10">
            <Head title="Logowanie – Panel Netizo" />

            <form onSubmit={submit} className="flex w-full max-w-sm flex-col gap-6" noValidate>
                <div className="flex flex-col items-center gap-2 text-center">
                    <Logo className="mb-2 h-10 w-auto" title="Netizo" />
                    <h1 className="text-xl font-semibold">Panel administracyjny</h1>
                    <p className="text-sm text-muted-foreground">Zaloguj się, aby zarządzać treściami i zgłoszeniami.</p>
                </div>

                {pageErrors?.form ? (
                    <Alert variant="destructive">
                        <AlertDescription>{pageErrors.form}</AlertDescription>
                    </Alert>
                ) : null}

                <FormField label="Adres e-mail" htmlFor="email" error={errors.email}>
                    <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        autoFocus
                        required
                        value={data.email}
                        aria-invalid={Boolean(errors.email)}
                        onChange={(event) => setData('email', event.target.value)}
                    />
                </FormField>

                <FormField label="Hasło" htmlFor="password" error={errors.password}>
                    <Input
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={data.password}
                        aria-invalid={Boolean(errors.password)}
                        onChange={(event) => setData('password', event.target.value)}
                    />
                </FormField>

                <div className="flex items-center gap-2">
                    <Checkbox id="remember" checked={data.remember} onCheckedChange={(checked) => setData('remember', checked === true)} />
                    <Label htmlFor="remember" className="font-normal">
                        Zapamiętaj mnie
                    </Label>
                </div>

                <Button type="submit" disabled={processing}>
                    Zaloguj się
                </Button>
            </form>
        </main>
    );
}
```

- [ ] **Step 7: Uruchom testy**

Run: `php artisan test --compact tests/Feature/Admin/AdminAuthTest.php tests/Feature/CreateAdminUserTest.php tests/Feature/SecurityHeadersTest.php`
Expected: PASS. Jeśli `withUnencryptedCookie` nie istnieje w tej wersji Laravela, użyj `$this->call('GET', route('admin.login'), cookies: ['sidebar_state' => 'false'])` i `->assertInertia(...)` na zwróconej odpowiedzi.

Run: `npx tsc --noEmit`
Expected: bez błędów.

- [ ] **Step 8: Commit**

```bash
vendor/bin/pint --dirty --format agent
git add -A
git commit -m "Add the admin login, root view and shared Inertia data" -m "Claude-Session: https://claude.ai/code/session_013ymSrGVKpfUzjAgpNZaxhz"
```

### Task 5: Klienci (pełny wycinek: backend, strony, testy) i wspólne żądania list

**Files:**
- Create: `app/Http/Controllers/Admin/ClientController.php`, `app/Http/Controllers/Admin/Concerns/ReordersRecords.php`
- Create: `app/Http/Requests/Admin/{SaveClientRequest,DestroyManyRequest,ReorderRequest}.php`
- Create: `database/factories/ClientFactory.php`
- Create: `resources/js/components/admin/{client-form,record-toolbar}.tsx`
- Create: `resources/js/pages/admin/clients/{index,create,edit}.tsx`
- Create: `tests/Feature/Admin/ClientTest.php`
- Modify: `routes/admin.php`, `app/Models/Client.php` (`HasFactory`)

**Interfaces:**
- Consumes: wszystko z Zadań 3–4.
- Produces: `ReordersRecords::applyOrder(Builder $query, array $ids): void`; `DestroyManyRequest::ids(): array<int>`, `ReorderRequest::ids(): array<int>` (używane też w Zadaniu 6/7); trasy `admin.clients.{index,create,store,edit,update,destroy,reorder,destroy-many}`; `RecordToolbar` (używany też w Zadaniu 6).

- [ ] **Step 1: Fabryka i `HasFactory`**

Run: `php artisan make:factory ClientFactory --model=Client --no-interaction`

`database/factories/ClientFactory.php`:

```php
<?php

namespace Database\Factories;

use App\Models\Client;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Client>
 */
class ClientFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->company(),
            'url' => fake()->boolean() ? fake()->url() : null,
            'sort_order' => fake()->numberBetween(1, 100),
            'is_active' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes): array => ['is_active' => false]);
    }
}
```

W `app/Models/Client.php` dodaj `use Illuminate\Database\Eloquent\Factories\HasFactory;` i w klasie `/** @use HasFactory<\Database\Factories\ClientFactory> */ use HasFactory;`.

- [ ] **Step 2: Napisz testy klientów (nie przejdą)**

Run: `php artisan make:test --pest Admin/ClientTest --no-interaction`, następnie nadpisz `tests/Feature/Admin/ClientTest.php`:

```php
<?php

use App\Models\Client;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Inertia\Testing\AssertableInertia as Assert;

use function Pest\Laravel\assertDatabaseCount;
use function Pest\Laravel\assertDatabaseHas;
use function Pest\Laravel\assertDatabaseMissing;

beforeEach(function () {
    $this->withoutVite();
    $this->actingAs(User::factory()->create());
});

/**
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function validClientPayload(array $overrides = []): array
{
    return array_merge([
        'name' => 'CloudInc',
        'url' => 'https://cloudinc.pl',
        'sort_order' => 3,
        'is_active' => true,
    ], $overrides);
}

it('lists the clients in manual order', function () {
    Client::factory()->create(['name' => 'Beta', 'sort_order' => 2]);
    Client::factory()->create(['name' => 'Alfa', 'sort_order' => 1]);

    $this->get(route('admin.clients.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/clients/index')
            ->has('clients', 2)
            ->where('clients.0.name', 'Alfa')
            ->where('clients.1.name', 'Beta'));
});

it('offers the next free sort order on the create form', function () {
    Client::factory()->create(['sort_order' => 7]);

    $this->get(route('admin.clients.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('admin/clients/create')->where('nextSortOrder', 8));
});

it('creates a client', function () {
    $this->post(route('admin.clients.store'), validClientPayload())
        ->assertRedirect(route('admin.clients.index'))
        ->assertSessionHas('success');

    assertDatabaseHas('clients', ['name' => 'CloudInc', 'url' => 'https://cloudinc.pl', 'sort_order' => 3, 'is_active' => true]);
});

it('creates a client without a link', function () {
    $this->post(route('admin.clients.store'), validClientPayload(['url' => '']))
        ->assertSessionHasNoErrors();

    assertDatabaseHas('clients', ['name' => 'CloudInc', 'url' => null]);
});

it('validates the client form', function (array $overrides, string $field) {
    $this->post(route('admin.clients.store'), validClientPayload($overrides))->assertSessionHasErrors($field);

    assertDatabaseCount('clients', 0);
})->with([
    'missing name' => [['name' => ''], 'name'],
    'name too long' => [['name' => str_repeat('a', 256)], 'name'],
    'invalid link' => [['url' => 'nie-adres'], 'url'],
    'negative sort order' => [['sort_order' => -1], 'sort_order'],
    'sort order not a number' => [['sort_order' => 'abc'], 'sort_order'],
]);

it('shows the edit form with the client', function () {
    $client = Client::factory()->create(['name' => 'Alfa']);

    $this->get(route('admin.clients.edit', $client))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/clients/edit')
            ->where('client.id', $client->id)
            ->where('client.name', 'Alfa'));
});

it('updates a client', function () {
    $client = Client::factory()->create();

    $this->put(route('admin.clients.update', $client), validClientPayload(['name' => 'Nowa nazwa', 'is_active' => false]))
        ->assertRedirect(route('admin.clients.index'));

    assertDatabaseHas('clients', ['id' => $client->id, 'name' => 'Nowa nazwa', 'is_active' => false]);
});

it('deletes a client', function () {
    $client = Client::factory()->create();

    $this->delete(route('admin.clients.destroy', $client))
        ->assertRedirect(route('admin.clients.index'));

    assertDatabaseMissing('clients', ['id' => $client->id]);
});

it('deletes many clients at once and leaves the others', function () {
    [$first, $second, $kept] = Client::factory()->count(3)->create();

    $this->delete(route('admin.clients.destroy-many'), ['ids' => [$first->id, $second->id]])
        ->assertRedirect()
        ->assertSessionHas('success');

    assertDatabaseCount('clients', 1);
    assertDatabaseHas('clients', ['id' => $kept->id]);
});

it('validates the ids when deleting many clients', function (mixed $ids) {
    Client::factory()->create();

    $this->delete(route('admin.clients.destroy-many'), ['ids' => $ids])->assertSessionHasErrors('ids');

    assertDatabaseCount('clients', 1);
})->with([
    'missing' => [null],
    'empty' => [[]],
    'not numbers' => [['abc']],
    'duplicates' => [[1, 1]],
]);

it('saves a new manual order', function () {
    [$first, $second, $third] = Client::factory()->count(3)->sequence(
        ['sort_order' => 1],
        ['sort_order' => 2],
        ['sort_order' => 3],
    )->create();

    $this->post(route('admin.clients.reorder'), ['ids' => [$third->id, $first->id, $second->id]])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    expect($third->fresh()->sort_order)->toBe(1)
        ->and($first->fresh()->sort_order)->toBe(2)
        ->and($second->fresh()->sort_order)->toBe(3);
});

it('refuses an order that contains unknown or repeated ids and changes nothing', function (array $ids) {
    $client = Client::factory()->create(['sort_order' => 5]);

    $this->post(route('admin.clients.reorder'), ['ids' => [...array_map(fn ($id) => $id === 'self' ? $client->id : $id, $ids)]])
        ->assertSessionHasErrors('ids');

    expect($client->fresh()->sort_order)->toBe(5);
})->with([
    'unknown id' => [['self', 999999]],
    'repeated id' => [['self', 'self']],
    'empty' => [[]],
    'not a number' => [['abc']],
]);

it('redirects guests away from the clients area and changes nothing', function () {
    $client = Client::factory()->create(['sort_order' => 5]);

    Auth::logout();

    $this->get(route('admin.clients.index'))->assertRedirect(route('admin.login'));
    $this->delete(route('admin.clients.destroy-many'), ['ids' => [$client->id]])->assertRedirect(route('admin.login'));
    $this->post(route('admin.clients.reorder'), ['ids' => [$client->id]])->assertRedirect(route('admin.login'));

    assertDatabaseHas('clients', ['id' => $client->id, 'sort_order' => 5]);
});
```

Run: `php artisan test --compact tests/Feature/Admin/ClientTest.php`
Expected: FAIL (brak tras `admin.clients.*`).

- [ ] **Step 3: Żądania i trait**

Run:
```bash
php artisan make:request Admin/SaveClientRequest --no-interaction
php artisan make:request Admin/DestroyManyRequest --no-interaction
php artisan make:request Admin/ReorderRequest --no-interaction
php artisan make:trait Http/Controllers/Admin/Concerns/ReordersRecords --no-interaction
```
(Jeśli `make:trait` nie istnieje, utwórz plik ręcznie.)

`app/Http/Requests/Admin/SaveClientRequest.php`:

```php
<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class SaveClientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'url' => ['nullable', 'url', 'max:255'],
            'sort_order' => ['required', 'integer', 'min:0', 'max:100000'],
            'is_active' => ['required', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => 'nazwa klienta',
            'url' => 'link',
            'sort_order' => 'kolejność',
            'is_active' => 'aktywność',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'url.url' => 'Podaj poprawny adres, np. https://example.com.',
        ];
    }

    /**
     * @return array{name: string, url: string|null, sort_order: int, is_active: bool}
     */
    public function clientAttributes(): array
    {
        $data = $this->validated();

        return [
            'name' => $data['name'],
            'url' => $data['url'] ?? null,
            'sort_order' => (int) $data['sort_order'],
            'is_active' => $this->boolean('is_active'),
        ];
    }
}
```

`app/Http/Requests/Admin/DestroyManyRequest.php`:

```php
<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class DestroyManyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'ids' => ['required', 'array', 'min:1', 'max:200'],
            'ids.*' => ['integer', 'distinct'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'ids.required' => 'Zaznacz co najmniej jeden element.',
            'ids.min' => 'Zaznacz co najmniej jeden element.',
            'ids.max' => 'Zaznaczono zbyt wiele elementów naraz.',
            'ids.*.integer' => 'Lista zawiera niepoprawny identyfikator.',
            'ids.*.distinct' => 'Lista zawiera powtórzony identyfikator.',
        ];
    }

    /**
     * @return list<int>
     */
    public function ids(): array
    {
        return array_map('intval', array_values($this->validated('ids')));
    }
}
```

`app/Http/Requests/Admin/ReorderRequest.php`: ten sam kod z nazwą klasy `ReorderRequest`, regułą `'ids' => ['required', 'array', 'min:1', 'max:500']` i komunikatami `'ids.required' => 'Brak listy do zapisania.'`, `'ids.min' => 'Brak listy do zapisania.'`, `'ids.max' => 'Lista jest zbyt długa.'`, `'ids.*.integer' => 'Lista zawiera niepoprawny identyfikator.'`, `'ids.*.distinct' => 'Lista zawiera powtórzony identyfikator.'`.

`app/Http/Controllers/Admin/Concerns/ReordersRecords.php`:

```php
<?php

namespace App\Http\Controllers\Admin\Concerns;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\ValidationException;

trait ReordersRecords
{
    /**
     * Give the listed records positions 1..n in the given order; nothing changes when any id is unknown.
     *
     * @param  Builder<Model>  $query
     * @param  list<int>  $ids
     *
     * @throws ValidationException
     */
    protected function applyOrder(Builder $query, array $ids): void
    {
        if ((clone $query)->whereKey($ids)->count() !== count($ids)) {
            throw ValidationException::withMessages(['ids' => 'Lista zawiera nieistniejące elementy.']);
        }

        $query->getModel()->getConnection()->transaction(function () use ($query, $ids): void {
            foreach ($ids as $position => $id) {
                (clone $query)->whereKey($id)->update(['sort_order' => $position + 1]);
            }
        });
    }
}
```

- [ ] **Step 4: Kontroler i trasy**

Run: `php artisan make:controller Admin/ClientController --no-interaction`

`app/Http/Controllers/Admin/ClientController.php`:

```php
<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\ReordersRecords;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\DestroyManyRequest;
use App\Http\Requests\Admin\ReorderRequest;
use App\Http\Requests\Admin\SaveClientRequest;
use App\Models\Client;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ClientController extends Controller
{
    use ReordersRecords;

    public function index(): Response
    {
        return Inertia::render('admin/clients/index', [
            'clients' => Client::query()->ordered()->orderBy('id')->get()
                ->map(fn (Client $client): array => $this->props($client))
                ->all(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/clients/create', [
            'nextSortOrder' => (int) Client::query()->max('sort_order') + 1,
        ]);
    }

    public function store(SaveClientRequest $request): RedirectResponse
    {
        $client = Client::query()->create($request->clientAttributes());

        return to_route('admin.clients.index')->with('success', "Dodano klienta „{$client->name}”.");
    }

    public function edit(Client $client): Response
    {
        return Inertia::render('admin/clients/edit', [
            'client' => $this->props($client),
        ]);
    }

    public function update(SaveClientRequest $request, Client $client): RedirectResponse
    {
        $client->update($request->clientAttributes());

        return to_route('admin.clients.index')->with('success', "Zapisano klienta „{$client->name}”.");
    }

    public function destroy(Client $client): RedirectResponse
    {
        $client->delete();

        return to_route('admin.clients.index')->with('success', "Usunięto klienta „{$client->name}”.");
    }

    public function destroyMany(DestroyManyRequest $request): RedirectResponse
    {
        $count = Client::query()->whereKey($request->ids())->delete();

        return back()->with('success', "Usunięto klientów: {$count}.");
    }

    public function reorder(ReorderRequest $request): RedirectResponse
    {
        $this->applyOrder(Client::query(), $request->ids());

        return back();
    }

    /**
     * @return array{id: int, name: string, url: string|null, sortOrder: int, isActive: bool, updatedAt: string}
     */
    private function props(Client $client): array
    {
        return [
            'id' => $client->id,
            'name' => $client->name,
            'url' => $client->url,
            'sortOrder' => (int) $client->sort_order,
            'isActive' => (bool) $client->is_active,
            'updatedAt' => $client->updated_at?->format('d.m.Y H:i') ?? '',
        ];
    }
}
```

`routes/admin.php`: dodaj import `use App\Http\Controllers\Admin\ClientController;` i w grupie `auth` (po `logout`):

```php
        Route::post('clients/reorder', [ClientController::class, 'reorder'])->name('clients.reorder');
        Route::delete('clients', [ClientController::class, 'destroyMany'])->name('clients.destroy-many');
        Route::resource('clients', ClientController::class)->except('show');
```

- [ ] **Step 5: Wspólny pasek narzędzi i formularz klienta**

`resources/js/components/admin/record-toolbar.tsx`:

```tsx
import { SearchIcon } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { StatusFilter } from '@/hooks/use-record-list';

type RecordToolbarProps = {
    search: string;
    onSearch: (value: string) => void;
    status: StatusFilter;
    onStatus: (value: StatusFilter) => void;
    searchLabel: string;
    canReorder: boolean;
};

/** Search and status filter of a fully loaded, manually ordered list; dragging is only available without filters. */
export function RecordToolbar({ search, onSearch, status, onStatus, searchLabel, canReorder }: RecordToolbarProps) {
    return (
        <div className="flex flex-wrap items-end gap-3">
            <div className="grid min-w-56 flex-1 gap-1.5">
                <Label htmlFor="record-search">{searchLabel}</Label>
                <div className="relative">
                    <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="record-search" type="search" className="pl-9" value={search} onChange={(event) => onSearch(event.target.value)} />
                </div>
            </div>
            <div className="grid gap-1.5">
                <Label htmlFor="record-status">Status</Label>
                <Select value={status} onValueChange={(value) => onStatus(value as StatusFilter)}>
                    <SelectTrigger id="record-status" className="w-44">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Wszystkie</SelectItem>
                        <SelectItem value="active">Aktywne</SelectItem>
                        <SelectItem value="inactive">Nieaktywne</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            {!canReorder ? <p className="basis-full text-sm text-muted-foreground">Przeciąganie działa, gdy nie ma wyszukiwania ani filtra.</p> : null}
        </div>
    );
}
```

`resources/js/components/admin/client-form.tsx`:

```tsx
import { Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

import { FormField } from '@/components/admin/form-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { adminRoutes } from '@/lib/admin-routes';
import type { AdminClient } from '@/types/admin';

type ClientFormProps = {
    client?: AdminClient;
    nextSortOrder?: number;
};

export function ClientForm({ client, nextSortOrder = 1 }: ClientFormProps) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: client?.name ?? '',
        url: client?.url ?? '',
        sort_order: client?.sortOrder ?? nextSortOrder,
        is_active: client?.isActive ?? true,
    });

    const submit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        if (client) {
            put(adminRoutes.clients.update(client.id));

            return;
        }

        post(adminRoutes.clients.index);
    };

    return (
        <form onSubmit={submit} className="grid max-w-2xl gap-6" noValidate>
            <FormField label="Nazwa klienta" htmlFor="name" error={errors.name}>
                <Input id="name" required value={data.name} aria-invalid={Boolean(errors.name)} onChange={(event) => setData('name', event.target.value)} />
            </FormField>

            <FormField label="Link (opcjonalnie)" htmlFor="url" error={errors.url} hint="Gdy pusty, nazwa klienta na stronie nie jest linkiem.">
                <Input
                    id="url"
                    type="url"
                    placeholder="https://example.com"
                    value={data.url}
                    aria-invalid={Boolean(errors.url)}
                    onChange={(event) => setData('url', event.target.value)}
                />
            </FormField>

            <FormField label="Kolejność" htmlFor="sort_order" error={errors.sort_order} hint="Mniejsza liczba oznacza wyższą pozycję na liście.">
                <Input
                    id="sort_order"
                    type="number"
                    min={0}
                    className="max-w-40"
                    value={data.sort_order}
                    aria-invalid={Boolean(errors.sort_order)}
                    onChange={(event) => setData('sort_order', Number(event.target.value))}
                />
            </FormField>

            <div className="flex items-center gap-3">
                <Switch id="is_active" checked={data.is_active} onCheckedChange={(checked) => setData('is_active', checked)} />
                <Label htmlFor="is_active">Widoczny na stronie</Label>
            </div>

            <div className="flex items-center gap-3">
                <Button type="submit" disabled={processing}>
                    {client ? 'Zapisz zmiany' : 'Dodaj klienta'}
                </Button>
                <Button asChild variant="ghost">
                    <Link href={adminRoutes.clients.index}>Anuluj</Link>
                </Button>
            </div>
        </form>
    );
}
```

- [ ] **Step 6: Strony klientów**

`resources/js/pages/admin/clients/create.tsx`:

```tsx
import { AdminLayout } from '@/components/admin/admin-layout';
import { ClientForm } from '@/components/admin/client-form';
import { adminRoutes } from '@/lib/admin-routes';

export default function ClientCreate({ nextSortOrder }: { nextSortOrder: number }) {
    return (
        <AdminLayout title="Nowy klient" breadcrumbs={[{ title: 'Klienci', href: adminRoutes.clients.index }]}>
            <ClientForm nextSortOrder={nextSortOrder} />
        </AdminLayout>
    );
}
```

`resources/js/pages/admin/clients/edit.tsx`:

```tsx
import { AdminLayout } from '@/components/admin/admin-layout';
import { ClientForm } from '@/components/admin/client-form';
import { adminRoutes } from '@/lib/admin-routes';
import type { AdminClient } from '@/types/admin';

export default function ClientEdit({ client }: { client: AdminClient }) {
    return (
        <AdminLayout title={client.name} breadcrumbs={[{ title: 'Klienci', href: adminRoutes.clients.index }]}>
            <ClientForm client={client} />
        </AdminLayout>
    );
}
```

`resources/js/pages/admin/clients/index.tsx`:

```tsx
import { Link, router } from '@inertiajs/react';
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { useState } from 'react';

import { AdminLayout } from '@/components/admin/admin-layout';
import { BulkBar } from '@/components/admin/bulk-bar';
import { ConfirmDeleteDialog } from '@/components/admin/confirm-delete-dialog';
import { RecordToolbar } from '@/components/admin/record-toolbar';
import { SortableArea, SortableTableRow } from '@/components/admin/sortable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useRecordList } from '@/hooks/use-record-list';
import { adminRoutes } from '@/lib/admin-routes';
import type { AdminClient } from '@/types/admin';

const searchText = (client: AdminClient): string => `${client.name} ${client.url ?? ''}`;

export default function ClientsIndex({ clients }: { clients: AdminClient[] }) {
    const list = useRecordList({ records: clients, reorderUrl: adminRoutes.clients.reorder, searchText });
    const { selected, toggle, toggleAll, clear } = list.selection;
    const [deleting, setDeleting] = useState<AdminClient | null>(null);
    const [bulkOpen, setBulkOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    const rowIds = list.visibleRows.map((client) => client.id);
    const allSelected = rowIds.length > 0 && rowIds.every((id) => selected.includes(id));
    const someSelected = rowIds.some((id) => selected.includes(id));

    const deleteOne = (): void => {
        if (!deleting) {
            return;
        }

        router.delete(adminRoutes.clients.destroy(deleting.id), {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onFinish: () => {
                setProcessing(false);
                setDeleting(null);
            },
        });
    };

    const deleteSelected = (): void => {
        router.delete(adminRoutes.clients.index, {
            data: { ids: selected },
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onSuccess: clear,
            onFinish: () => {
                setProcessing(false);
                setBulkOpen(false);
            },
        });
    };

    return (
        <AdminLayout
            title="Klienci"
            actions={
                <Button asChild>
                    <Link href={adminRoutes.clients.create}>
                        <PlusIcon />
                        Nowy klient
                    </Link>
                </Button>
            }
        >
            <RecordToolbar
                search={list.search}
                onSearch={list.setSearch}
                status={list.status}
                onStatus={list.setStatus}
                searchLabel="Szukaj klienta"
                canReorder={list.canReorder}
            />

            <BulkBar count={selected.length} onDelete={() => setBulkOpen(true)} />

            <div className="overflow-x-auto rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-10" />
                            <TableHead className="w-10">
                                <Checkbox
                                    aria-label="Zaznacz wszystkich klientów"
                                    checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                                    onCheckedChange={() => toggleAll(rowIds)}
                                />
                            </TableHead>
                            <TableHead className="w-14">#</TableHead>
                            <TableHead>Nazwa</TableHead>
                            <TableHead>Link</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Aktualizacja</TableHead>
                            <TableHead className="w-24" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <SortableArea ids={rowIds} onMove={list.move}>
                            {list.visibleRows.map((client) => (
                                <SortableTableRow key={client.id} id={client.id} disabled={!list.canReorder}>
                                    <TableCell className="w-10">
                                        <Checkbox
                                            aria-label={`Zaznacz: ${client.name}`}
                                            checked={selected.includes(client.id)}
                                            onCheckedChange={() => toggle(client.id)}
                                        />
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{client.sortOrder}</TableCell>
                                    <TableCell className="font-medium">
                                        <Link href={adminRoutes.clients.edit(client.id)} className="hover:underline">
                                            {client.name}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="max-w-64 truncate text-muted-foreground">{client.url ?? 'Brak linku'}</TableCell>
                                    <TableCell>
                                        <Badge variant={client.isActive ? 'secondary' : 'outline'}>{client.isActive ? 'Aktywny' : 'Nieaktywny'}</Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{client.updatedAt}</TableCell>
                                    <TableCell>
                                        <div className="flex justify-end gap-1">
                                            <Button asChild variant="ghost" size="icon-sm">
                                                <Link href={adminRoutes.clients.edit(client.id)} aria-label={`Edytuj: ${client.name}`}>
                                                    <PencilIcon />
                                                </Link>
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon-sm"
                                                aria-label={`Usuń: ${client.name}`}
                                                onClick={() => setDeleting(client)}
                                            >
                                                <Trash2Icon />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </SortableTableRow>
                            ))}
                        </SortableArea>
                        {list.visibleRows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                                    Brak klientów do wyświetlenia.
                                </TableCell>
                            </TableRow>
                        ) : null}
                    </TableBody>
                </Table>
            </div>

            <ConfirmDeleteDialog
                open={deleting !== null}
                onOpenChange={(open) => !open && setDeleting(null)}
                title="Usunąć klienta?"
                description={deleting ? `Klient „${deleting.name}” zniknie z listy i ze strony głównej. Tej operacji nie można cofnąć.` : ''}
                onConfirm={deleteOne}
                processing={processing}
            />
            <ConfirmDeleteDialog
                open={bulkOpen}
                onOpenChange={setBulkOpen}
                title="Usunąć zaznaczonych klientów?"
                description={`Zostanie usuniętych klientów: ${selected.length}. Tej operacji nie można cofnąć.`}
                onConfirm={deleteSelected}
                processing={processing}
            />
        </AdminLayout>
    );
}
```

- [ ] **Step 7: Testy, typy, commit**

Run: `php artisan test --compact tests/Feature/Admin/ClientTest.php`
Expected: PASS.

Run: `npx tsc --noEmit`
Expected: bez błędów (napraw typy `Select`/`Checkbox` jeśli zgłoszone).

```bash
vendor/bin/pint --dirty --format agent
git add -A
git commit -m "Add client management to the admin panel with drag-and-drop ordering" -m "Claude-Session: https://claude.ai/code/session_013ymSrGVKpfUzjAgpNZaxhz"
```

---

### Task 6: Projekty (pełny wycinek)

**Files:**
- Create: `app/Http/Controllers/Admin/ProjectController.php`, `app/Http/Requests/Admin/SaveProjectRequest.php`, `database/factories/ProjectFactory.php`
- Create: `resources/js/components/admin/{image-field,tags-input,repeater-list,project-form}.tsx`
- Create: `resources/js/pages/admin/projects/{index,create,edit}.tsx`
- Create: `tests/Feature/Admin/ProjectTest.php`
- Modify: `routes/admin.php`, `app/Models/Project.php` (`HasFactory`)

**Interfaces:**
- Consumes: `ImageOptimizer` (Zad. 1), `ReordersRecords`, `DestroyManyRequest`, `ReorderRequest` (Zad. 5), `RecordToolbar`, `useRecordList`, `SortableArea`, `SortableTableRow`, `SortableListItem` (Zad. 3/5).
- Produces: trasy `admin.projects.{index,create,store,edit,update,destroy,reorder,destroy-many}`; komponenty `ImageField`, `TagsInput`, `RepeaterList<T>`.

- [ ] **Step 1: Fabryka i `HasFactory`**

Run: `php artisan make:factory ProjectFactory --model=Project --no-interaction`

```php
<?php

namespace Database\Factories;

use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Project>
 */
class ProjectFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'slug' => fake()->unique()->slug(2),
            'sort_order' => fake()->numberBetween(1, 100),
            'is_active' => true,
            'title' => fake()->unique()->words(3, true),
            'url' => fake()->domainName(),
            'category' => 'Strona firmowa',
            'description' => fake()->sentence(),
            'full_description' => fake()->paragraph(),
            'thumbnail_image' => null,
            'full_image' => null,
            'tech_stack' => ['Laravel', 'React'],
            'metrics' => [['value' => '+40%', 'label' => 'konwersji']],
            'challenges' => [['challenge' => fake()->sentence()]],
            'solutions' => [['solution' => fake()->sentence()]],
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes): array => ['is_active' => false]);
    }
}
```

W `app/Models/Project.php` dodaj `HasFactory` tak jak w `Client`.

- [ ] **Step 2: Napisz testy projektów (nie przejdą)**

Run: `php artisan make:test --pest Admin/ProjectTest --no-interaction`, następnie nadpisz `tests/Feature/Admin/ProjectTest.php`:

```php
<?php

use App\Models\Project;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

use function Pest\Laravel\assertDatabaseCount;
use function Pest\Laravel\assertDatabaseHas;
use function Pest\Laravel\assertDatabaseMissing;

beforeEach(function () {
    $this->withoutVite();
    Storage::fake('public');
    $this->actingAs(User::factory()->create());
});

/**
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function validProjectPayload(array $overrides = []): array
{
    return array_merge([
        'title' => 'Netizo Case Study',
        'slug' => 'netizo-case-study',
        'url' => 'netizo.pl',
        'category' => 'Web app',
        'sort_order' => 1,
        'is_active' => true,
        'description' => 'Krótki opis projektu.',
        'full_description' => 'Pełny opis projektu.',
        'tech_stack' => ['Laravel', 'React'],
        'metrics' => [['value' => '+40%', 'label' => 'Konwersja']],
        'challenges' => ['Integracja z systemem klienta'],
        'solutions' => ['Dedykowane API'],
    ], $overrides);
}

it('sends a logged in user from the panel home to the projects', function () {
    $this->get('/admin')->assertRedirect(route('admin.projects.index'));
});

it('lists the projects in manual order', function () {
    Project::factory()->create(['title' => 'Drugi', 'sort_order' => 2]);
    Project::factory()->create(['title' => 'Pierwszy', 'sort_order' => 1]);

    $this->get(route('admin.projects.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/projects/index')
            ->has('projects', 2)
            ->where('projects.0.title', 'Pierwszy')
            ->where('projects.1.title', 'Drugi'));
});

it('offers the next free sort order on the create form', function () {
    Project::factory()->create(['sort_order' => 4]);

    $this->get(route('admin.projects.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('admin/projects/create')->where('nextSortOrder', 5));
});

it('creates a project and converts both images to webp', function () {
    $this->post(route('admin.projects.store'), validProjectPayload([
        'thumbnail_image' => UploadedFile::fake()->image('thumbnail.jpg', 800, 450)->size(20000),
        'full_image' => UploadedFile::fake()->image('full.png', 1600, 900)->size(20000),
    ]))
        ->assertRedirect(route('admin.projects.index'))
        ->assertSessionHasNoErrors();

    $project = Project::query()->where('slug', 'netizo-case-study')->firstOrFail();

    expect($project->thumbnail_image)->toStartWith('projects/thumbnails/')->toEndWith('.webp')
        ->and($project->full_image)->toStartWith('projects/full/')->toEndWith('.webp')
        ->and($project->tech_stack)->toBe(['Laravel', 'React'])
        ->and($project->metrics)->toBe([['value' => '+40%', 'label' => 'Konwersja']])
        ->and($project->challenges)->toBe([['challenge' => 'Integracja z systemem klienta']])
        ->and($project->solutions)->toBe([['solution' => 'Dedykowane API']])
        ->and($project->is_active)->toBeTrue();

    Storage::disk('public')->assertExists([$project->thumbnail_image, $project->full_image]);
    expect(Storage::disk('public')->mimeType($project->thumbnail_image))->toBe('image/webp');
});

it('creates a project without images', function () {
    $this->post(route('admin.projects.store'), validProjectPayload())->assertSessionHasNoErrors();

    assertDatabaseHas('projects', ['slug' => 'netizo-case-study', 'thumbnail_image' => null, 'full_image' => null]);
});

it('validates the project form', function (array $overrides, string $field) {
    $this->post(route('admin.projects.store'), validProjectPayload($overrides))->assertSessionHasErrors($field);

    assertDatabaseCount('projects', 0);
})->with([
    'missing title' => [['title' => ''], 'title'],
    'title too long' => [['title' => str_repeat('a', 256)], 'title'],
    'slug with spaces' => [['slug' => 'dwa slowa'], 'slug'],
    'missing url' => [['url' => ''], 'url'],
    'missing category' => [['category' => ''], 'category'],
    'negative sort order' => [['sort_order' => -1], 'sort_order'],
    'missing description' => [['description' => ''], 'description'],
    'missing full description' => [['full_description' => ''], 'full_description'],
    'no technologies' => [['tech_stack' => []], 'tech_stack'],
    'blank technology' => [['tech_stack' => ['Laravel', '']], 'tech_stack.1'],
    'no metrics' => [['metrics' => []], 'metrics'],
    'four metrics' => [['metrics' => array_fill(0, 4, ['value' => '1', 'label' => 'a'])], 'metrics'],
    'metric without label' => [['metrics' => [['value' => '1', 'label' => '']]], 'metrics.0.label'],
    'no challenges' => [['challenges' => []], 'challenges'],
    'seven challenges' => [['challenges' => array_fill(0, 7, 'x')], 'challenges'],
    'blank challenge' => [['challenges' => ['']], 'challenges.0'],
    'no solutions' => [['solutions' => []], 'solutions'],
]);

it('refuses a duplicate slug', function () {
    Project::factory()->create(['slug' => 'netizo-case-study']);

    $this->post(route('admin.projects.store'), validProjectPayload())->assertSessionHasErrors('slug');

    assertDatabaseCount('projects', 1);
});

it('refuses a file that is not an image', function () {
    $this->post(route('admin.projects.store'), validProjectPayload([
        'thumbnail_image' => UploadedFile::fake()->create('plan.pdf', 10, 'application/pdf'),
    ]))->assertSessionHasErrors('thumbnail_image');

    assertDatabaseCount('projects', 0);
});

it('shows the edit form, also for a project that stores plain string challenges', function () {
    $project = Project::factory()->create([
        'challenges' => ['Wyzwanie A', 'Wyzwanie B'],
        'solutions' => [['solution' => 'Rozwiązanie A']],
    ]);

    $this->get(route('admin.projects.edit', $project))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/projects/edit')
            ->where('project.id', $project->id)
            ->where('project.challenges', ['Wyzwanie A', 'Wyzwanie B'])
            ->where('project.solutions', ['Rozwiązanie A']));
});

it('updates a project and keeps its own slug and images', function () {
    Storage::disk('public')->put('projects/full/keep.webp', 'x');
    $project = Project::factory()->create(['slug' => 'netizo-case-study', 'full_image' => 'projects/full/keep.webp']);

    $this->put(route('admin.projects.update', $project), validProjectPayload(['title' => 'Nowy tytuł']))
        ->assertRedirect(route('admin.projects.index'))
        ->assertSessionHasNoErrors();

    expect($project->fresh()->title)->toBe('Nowy tytuł')
        ->and($project->fresh()->full_image)->toBe('projects/full/keep.webp');

    Storage::disk('public')->assertExists('projects/full/keep.webp');
});

it('replaces an image and deletes the previous file', function () {
    Storage::disk('public')->put('projects/full/old.webp', 'x');
    $project = Project::factory()->create(['slug' => 'netizo-case-study', 'full_image' => 'projects/full/old.webp']);

    $this->put(route('admin.projects.update', $project), validProjectPayload([
        'full_image' => UploadedFile::fake()->image('new.png', 1000, 500),
    ]))->assertSessionHasNoErrors();

    $project->refresh();

    expect($project->full_image)->not->toBe('projects/full/old.webp')->toStartWith('projects/full/');

    Storage::disk('public')->assertMissing('projects/full/old.webp');
    Storage::disk('public')->assertExists($project->full_image);
});

it('removes an image when asked, even if its file is already gone', function () {
    $project = Project::factory()->create([
        'slug' => 'netizo-case-study',
        'thumbnail_image' => 'projects/thumbnails/missing.webp',
    ]);

    $this->put(route('admin.projects.update', $project), validProjectPayload(['remove_thumbnail_image' => true]))
        ->assertRedirect(route('admin.projects.index'))
        ->assertSessionHasNoErrors();

    expect($project->fresh()->thumbnail_image)->toBeNull();
});

it('replaces an image whose previous file is already gone', function () {
    $project = Project::factory()->create([
        'slug' => 'netizo-case-study',
        'thumbnail_image' => 'projects/thumbnails/missing.webp',
    ]);

    $this->put(route('admin.projects.update', $project), validProjectPayload([
        'thumbnail_image' => UploadedFile::fake()->image('new.png', 400, 300),
    ]))->assertSessionHasNoErrors();

    expect($project->fresh()->thumbnail_image)->toStartWith('projects/thumbnails/');
});

it('deletes a project', function () {
    $project = Project::factory()->create();

    $this->delete(route('admin.projects.destroy', $project))->assertRedirect(route('admin.projects.index'));

    assertDatabaseMissing('projects', ['id' => $project->id]);
});

it('deletes many projects at once', function () {
    [$first, $second, $kept] = Project::factory()->count(3)->create();

    $this->delete(route('admin.projects.destroy-many'), ['ids' => [$first->id, $second->id]])->assertRedirect();

    assertDatabaseCount('projects', 1);
    assertDatabaseHas('projects', ['id' => $kept->id]);
});

it('saves a new manual order', function () {
    [$first, $second] = Project::factory()->count(2)->sequence(['sort_order' => 1], ['sort_order' => 2])->create();

    $this->post(route('admin.projects.reorder'), ['ids' => [$second->id, $first->id]])->assertSessionHasNoErrors();

    expect($second->fresh()->sort_order)->toBe(1)->and($first->fresh()->sort_order)->toBe(2);
});

it('refuses an order with unknown or repeated ids and changes nothing', function (array $ids) {
    $project = Project::factory()->create(['sort_order' => 5]);

    $this->post(route('admin.projects.reorder'), ['ids' => array_map(fn ($id) => $id === 'self' ? $project->id : $id, $ids)])
        ->assertSessionHasErrors('ids');

    expect($project->fresh()->sort_order)->toBe(5);
})->with([
    'unknown id' => [['self', 999999]],
    'repeated id' => [['self', 'self']],
    'empty' => [[]],
]);

it('redirects guests away from the projects area and changes nothing', function () {
    $project = Project::factory()->create(['sort_order' => 5]);

    Auth::logout();

    $this->get(route('admin.projects.index'))->assertRedirect(route('admin.login'));
    $this->delete(route('admin.projects.destroy-many'), ['ids' => [$project->id]])->assertRedirect(route('admin.login'));
    $this->post(route('admin.projects.reorder'), ['ids' => [$project->id]])->assertRedirect(route('admin.login'));
    $this->post(route('admin.projects.store'), validProjectPayload())->assertRedirect(route('admin.login'));

    assertDatabaseHas('projects', ['id' => $project->id, 'sort_order' => 5]);
    assertDatabaseCount('projects', 1);
});
```

Run: `php artisan test --compact tests/Feature/Admin/ProjectTest.php`
Expected: FAIL (brak tras).

- [ ] **Step 3: Żądanie zapisu projektu**

Run: `php artisan make:request Admin/SaveProjectRequest --no-interaction`

```php
<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'alpha_dash:ascii', Rule::unique('projects', 'slug')->ignore($this->route('project'))],
            'url' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:255'],
            'sort_order' => ['required', 'integer', 'min:0', 'max:100000'],
            'is_active' => ['required', 'boolean'],
            'description' => ['required', 'string', 'max:2000'],
            'full_description' => ['required', 'string', 'max:20000'],
            'thumbnail_image' => ['nullable', 'image', 'max:51200'],
            'full_image' => ['nullable', 'image', 'max:51200'],
            'remove_thumbnail_image' => ['sometimes', 'boolean'],
            'remove_full_image' => ['sometimes', 'boolean'],
            'tech_stack' => ['required', 'array', 'min:1', 'max:30'],
            'tech_stack.*' => ['required', 'string', 'max:50'],
            'metrics' => ['required', 'array', 'min:1', 'max:3'],
            'metrics.*.value' => ['required', 'string', 'max:50'],
            'metrics.*.label' => ['required', 'string', 'max:100'],
            'challenges' => ['required', 'array', 'min:1', 'max:6'],
            'challenges.*' => ['required', 'string', 'max:1000'],
            'solutions' => ['required', 'array', 'min:1', 'max:6'],
            'solutions.*' => ['required', 'string', 'max:1000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'title' => 'nazwa projektu',
            'slug' => 'slug',
            'url' => 'adres URL projektu',
            'category' => 'kategoria',
            'sort_order' => 'kolejność',
            'is_active' => 'aktywność',
            'description' => 'krótki opis',
            'full_description' => 'pełny opis',
            'thumbnail_image' => 'miniaturka',
            'full_image' => 'pełne zdjęcie',
            'tech_stack' => 'technologie',
            'tech_stack.*' => 'technologia',
            'metrics' => 'metryki',
            'metrics.*.value' => 'wartość metryki',
            'metrics.*.label' => 'etykieta metryki',
            'challenges' => 'wyzwania',
            'challenges.*' => 'wyzwanie',
            'solutions' => 'rozwiązania',
            'solutions.*' => 'rozwiązanie',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'slug.alpha_dash' => 'Slug może zawierać tylko małe litery, cyfry, myślniki i podkreślenia.',
            'slug.unique' => 'Projekt z takim slugiem już istnieje.',
            'thumbnail_image.image' => 'Miniaturka musi być obrazem.',
            'full_image.image' => 'Pełne zdjęcie musi być obrazem.',
            'thumbnail_image.max' => 'Miniaturka może mieć najwyżej 50 MB.',
            'full_image.max' => 'Pełne zdjęcie może mieć najwyżej 50 MB.',
            'metrics.max' => 'Możesz dodać najwyżej 3 metryki.',
            'challenges.max' => 'Możesz dodać najwyżej 6 wyzwań.',
            'solutions.max' => 'Możesz dodać najwyżej 6 rozwiązań.',
        ];
    }

    /**
     * Columns of the project except the images, with challenges and solutions in the stored repeater-row format.
     *
     * @return array<string, mixed>
     */
    public function projectAttributes(): array
    {
        $data = $this->validated();

        return [
            'title' => $data['title'],
            'slug' => $data['slug'],
            'url' => $data['url'],
            'category' => $data['category'],
            'sort_order' => (int) $data['sort_order'],
            'is_active' => $this->boolean('is_active'),
            'description' => $data['description'],
            'full_description' => $data['full_description'],
            'tech_stack' => array_values($data['tech_stack']),
            'metrics' => array_values(array_map(
                fn (array $metric): array => ['value' => $metric['value'], 'label' => $metric['label']],
                $data['metrics'],
            )),
            'challenges' => array_map(fn (string $text): array => ['challenge' => $text], array_values($data['challenges'])),
            'solutions' => array_map(fn (string $text): array => ['solution' => $text], array_values($data['solutions'])),
        ];
    }
}
```

- [ ] **Step 4: Kontroler i trasy**

Run: `php artisan make:controller Admin/ProjectController --no-interaction`

```php
<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\ReordersRecords;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\DestroyManyRequest;
use App\Http\Requests\Admin\ReorderRequest;
use App\Http\Requests\Admin\SaveProjectRequest;
use App\Models\Project;
use App\Services\ImageOptimizer;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    use ReordersRecords;

    /**
     * Upload field => storage directory and maximum width of the stored WebP.
     *
     * @var array<string, array{directory: string, width: int}>
     */
    private const IMAGES = [
        'thumbnail_image' => ['directory' => 'projects/thumbnails', 'width' => 1600],
        'full_image' => ['directory' => 'projects/full', 'width' => 1920],
    ];

    public function __construct(private ImageOptimizer $images) {}

    public function index(): Response
    {
        return Inertia::render('admin/projects/index', [
            'projects' => Project::query()->ordered()->orderBy('id')->get()
                ->map(fn (Project $project): array => $this->rowProps($project))
                ->all(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/projects/create', [
            'nextSortOrder' => (int) Project::query()->max('sort_order') + 1,
        ]);
    }

    public function store(SaveProjectRequest $request): RedirectResponse
    {
        [$images] = $this->imageChanges($request, null);

        $project = Project::query()->create([...$request->projectAttributes(), ...$images]);

        return to_route('admin.projects.index')->with('success', "Dodano projekt „{$project->title}”.");
    }

    public function edit(Project $project): Response
    {
        return Inertia::render('admin/projects/edit', [
            'project' => $this->formProps($project),
        ]);
    }

    public function update(SaveProjectRequest $request, Project $project): RedirectResponse
    {
        [$images, $obsolete] = $this->imageChanges($request, $project);

        $project->update([...$request->projectAttributes(), ...$images]);

        foreach ($obsolete as $path) {
            $this->images->delete($path);
        }

        return to_route('admin.projects.index')->with('success', "Zapisano projekt „{$project->title}”.");
    }

    public function destroy(Project $project): RedirectResponse
    {
        $project->delete();

        return to_route('admin.projects.index')->with('success', "Usunięto projekt „{$project->title}”.");
    }

    public function destroyMany(DestroyManyRequest $request): RedirectResponse
    {
        $count = Project::query()->whereKey($request->ids())->delete();

        return back()->with('success', "Usunięto projektów: {$count}.");
    }

    public function reorder(ReorderRequest $request): RedirectResponse
    {
        $this->applyOrder(Project::query(), $request->ids());

        return back();
    }

    /**
     * Store uploaded images and note the files that become obsolete (replaced or removed ones).
     *
     * @return array{0: array<string, string|null>, 1: list<string>}
     */
    private function imageChanges(SaveProjectRequest $request, ?Project $project): array
    {
        $attributes = [];
        $obsolete = [];

        foreach (self::IMAGES as $field => $config) {
            $current = $project?->{$field};
            $file = $request->file($field);

            if ($file !== null) {
                $attributes[$field] = $this->images->store($file, $config['directory'], $config['width']);
                $obsolete[] = $current;
            } elseif ($request->boolean("remove_{$field}")) {
                $attributes[$field] = null;
                $obsolete[] = $current;
            }
        }

        return [$attributes, array_values(array_filter($obsolete))];
    }

    /**
     * @return array{id: int, title: string, slug: string, url: string, category: string, sortOrder: int, isActive: bool, thumbnailUrl: string|null, updatedAt: string}
     */
    private function rowProps(Project $project): array
    {
        return [
            'id' => $project->id,
            'title' => $project->title,
            'slug' => $project->slug,
            'url' => (string) $project->url,
            'category' => (string) $project->category,
            'sortOrder' => (int) $project->sort_order,
            'isActive' => (bool) $project->is_active,
            'thumbnailUrl' => $project->thumbnail_image ? asset('storage/'.$project->thumbnail_image) : null,
            'updatedAt' => $project->updated_at?->format('d.m.Y H:i') ?? '',
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function formProps(Project $project): array
    {
        return [
            ...$this->rowProps($project),
            'description' => (string) $project->description,
            'fullDescription' => (string) $project->full_description,
            'fullImageUrl' => $project->full_image ? asset('storage/'.$project->full_image) : null,
            'techStack' => $this->stringList($project->tech_stack, null),
            'metrics' => collect(is_array($project->metrics) ? $project->metrics : [])
                ->filter(fn (mixed $metric): bool => is_array($metric))
                ->map(fn (array $metric): array => [
                    'value' => (string) ($metric['value'] ?? ''),
                    'label' => (string) ($metric['label'] ?? ''),
                ])
                ->values()
                ->all(),
            'challenges' => $this->stringList($project->challenges, 'challenge'),
            'solutions' => $this->stringList($project->solutions, 'solution'),
        ];
    }

    /**
     * Repeater rows are stored as ['challenge' => '…'], but older data may hold plain strings.
     *
     * @return list<string>
     */
    private function stringList(mixed $value, ?string $key): array
    {
        return collect(is_array($value) ? $value : [])
            ->map(function (mixed $item) use ($key): string {
                if (is_array($item)) {
                    return (string) ($item[$key] ?? '');
                }

                return is_scalar($item) ? (string) $item : '';
            })
            ->filter(fn (string $item): bool => $item !== '')
            ->values()
            ->all();
    }
}
```

`routes/admin.php`: import `ProjectController` i dodaj (przed klientami):

```php
        Route::post('projects/reorder', [ProjectController::class, 'reorder'])->name('projects.reorder');
        Route::delete('projects', [ProjectController::class, 'destroyMany'])->name('projects.destroy-many');
        Route::resource('projects', ProjectController::class)->except('show');
```

- [ ] **Step 5: Komponenty pól**

`resources/js/components/admin/image-field.tsx`:

```tsx
import { ImageIcon, RotateCcwIcon, Trash2Icon, UploadIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';

type ImageFieldProps = {
    id: string;
    currentUrl: string | null;
    file: File | null;
    removed: boolean;
    onFileChange: (file: File | null) => void;
    onRemovedChange: (removed: boolean) => void;
    invalid?: boolean;
};

/** Upload field with a preview: a newly chosen file, the current image, or the removal of the current image. */
export function ImageField({ id, currentUrl, file, removed, onFileChange, onRemovedChange, invalid = false }: ImageFieldProps) {
    const input = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        if (!file) {
            setPreview(null);

            return;
        }

        const url = URL.createObjectURL(file);

        setPreview(url);

        return () => URL.revokeObjectURL(url);
    }, [file]);

    const shown = preview ?? (removed ? null : currentUrl);

    return (
        <div className="grid gap-3">
            <div
                className="flex aspect-video w-full max-w-md items-center justify-center overflow-hidden rounded-md border bg-muted data-[invalid=true]:border-destructive"
                data-invalid={invalid}
            >
                {shown ? (
                    <img src={shown} alt="" className="size-full object-cover object-top" />
                ) : (
                    <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                        <ImageIcon className="size-6" />
                        {removed ? 'Zdjęcie zostanie usunięte po zapisaniu' : 'Brak zdjęcia'}
                    </div>
                )}
            </div>

            <input
                ref={input}
                id={id}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => {
                    const chosen = event.target.files?.[0] ?? null;

                    onFileChange(chosen);

                    if (chosen) {
                        onRemovedChange(false);
                    }

                    event.target.value = '';
                }}
            />

            <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => input.current?.click()}>
                    <UploadIcon />
                    {file || currentUrl ? 'Zmień plik' : 'Wybierz plik'}
                </Button>
                {file ? (
                    <Button type="button" variant="ghost" size="sm" onClick={() => onFileChange(null)}>
                        <RotateCcwIcon />
                        Cofnij wybór
                    </Button>
                ) : currentUrl && !removed ? (
                    <Button type="button" variant="ghost" size="sm" onClick={() => onRemovedChange(true)}>
                        <Trash2Icon />
                        Usuń zdjęcie
                    </Button>
                ) : null}
                {removed && !file ? (
                    <Button type="button" variant="ghost" size="sm" onClick={() => onRemovedChange(false)}>
                        <RotateCcwIcon />
                        Przywróć zdjęcie
                    </Button>
                ) : null}
            </div>
        </div>
    );
}
```

`resources/js/components/admin/tags-input.tsx`:

```tsx
import { XIcon } from 'lucide-react';
import { useState, type KeyboardEvent } from 'react';

import { Badge } from '@/components/ui/badge';

type TagsInputProps = {
    id: string;
    value: string[];
    onChange: (value: string[]) => void;
    suggestions?: string[];
    placeholder?: string;
    invalid?: boolean;
};

/** Free-text tags: Enter or a comma adds the typed one, Backspace on an empty field removes the last. */
export function TagsInput({ id, value, onChange, suggestions = [], placeholder, invalid = false }: TagsInputProps) {
    const [draft, setDraft] = useState('');
    const listId = `${id}-suggestions`;

    const add = (raw: string): void => {
        const tag = raw.trim();

        setDraft('');

        if (tag === '' || value.some((item) => item.toLowerCase() === tag.toLowerCase())) {
            return;
        }

        onChange([...value, tag]);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
        if (event.key === 'Enter' || event.key === ',') {
            event.preventDefault();
            add(draft);

            return;
        }

        if (event.key === 'Backspace' && draft === '' && value.length > 0) {
            onChange(value.slice(0, -1));
        }
    };

    return (
        <div
            className="flex flex-wrap items-center gap-1.5 rounded-md border border-input p-1.5 focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 aria-invalid:border-destructive dark:bg-input/12"
            aria-invalid={invalid}
        >
            {value.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                    {tag}
                    <button
                        type="button"
                        className="rounded-sm p-0.5 hover:bg-foreground/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                        aria-label={`Usuń: ${tag}`}
                        onClick={() => onChange(value.filter((item) => item !== tag))}
                    >
                        <XIcon className="size-3" />
                    </button>
                </Badge>
            ))}
            <input
                id={id}
                list={listId}
                className="min-w-40 flex-1 bg-transparent px-1.5 py-1 text-sm outline-none placeholder:text-muted-foreground"
                value={draft}
                placeholder={value.length === 0 ? placeholder : undefined}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={() => add(draft)}
            />
            <datalist id={listId}>
                {suggestions
                    .filter((suggestion) => !value.some((item) => item.toLowerCase() === suggestion.toLowerCase()))
                    .map((suggestion) => (
                        <option key={suggestion} value={suggestion} />
                    ))}
            </datalist>
        </div>
    );
}
```

`resources/js/components/admin/repeater-list.tsx`:

```tsx
import { arrayMove } from '@dnd-kit/sortable';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { useRef, type ReactNode } from 'react';

import { SortableArea, SortableListItem } from '@/components/admin/sortable';
import { Button } from '@/components/ui/button';

type RepeaterListProps<T> = {
    value: T[];
    onChange: (value: T[]) => void;
    createItem: () => T;
    renderItem: (item: T, update: (item: T) => void, index: number) => ReactNode;
    addLabel: string;
    itemLabel: string;
    min?: number;
    max?: number;
    error?: string;
};

/** Stable identities for the items, kept next to the value so that dragging and editing do not remount inputs. */
function useItemKeys(length: number) {
    const next = useRef(0);
    const keys = useRef<number[]>([]);

    while (keys.current.length < length) {
        keys.current.push(next.current++);
    }

    if (keys.current.length > length) {
        keys.current.length = length;
    }

    return { keys, next };
}

/** A list of repeatable inputs that can be added, removed and dragged into a new order. */
export function RepeaterList<T>({ value, onChange, createItem, renderItem, addLabel, itemLabel, min = 0, max = Infinity, error }: RepeaterListProps<T>) {
    const { keys, next } = useItemKeys(value.length);

    const add = (): void => {
        keys.current.push(next.current++);
        onChange([...value, createItem()]);
    };

    const remove = (index: number): void => {
        keys.current.splice(index, 1);
        onChange(value.filter((_, position) => position !== index));
    };

    const update = (index: number, item: T): void => {
        onChange(value.map((current, position) => (position === index ? item : current)));
    };

    const move = (activeId: string | number, overId: string | number): void => {
        const from = keys.current.indexOf(Number(activeId));
        const to = keys.current.indexOf(Number(overId));

        if (from === -1 || to === -1) {
            return;
        }

        keys.current = arrayMove(keys.current, from, to);
        onChange(arrayMove(value, from, to));
    };

    return (
        <div className="grid gap-2">
            <SortableArea ids={keys.current} onMove={move}>
                {value.map((item, index) => (
                    <SortableListItem key={keys.current[index]} id={keys.current[index]}>
                        <div className="min-w-0 flex-1">{renderItem(item, (updated) => update(index, updated), index)}</div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`${itemLabel}: usuń pozycję ${index + 1}`}
                            disabled={value.length <= min}
                            onClick={() => remove(index)}
                        >
                            <Trash2Icon />
                        </Button>
                    </SortableListItem>
                ))}
            </SortableArea>
            {error ? (
                <p className="text-sm text-destructive" role="alert">
                    {error}
                </p>
            ) : null}
            <div>
                <Button type="button" variant="outline" size="sm" disabled={value.length >= max} onClick={add}>
                    <PlusIcon />
                    {addLabel}
                </Button>
            </div>
        </div>
    );
}
```

- [ ] **Step 6: Formularz projektu**

`resources/js/components/admin/project-form.tsx`:

```tsx
import { Link, useForm } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';

import { FormField } from '@/components/admin/form-field';
import { ImageField } from '@/components/admin/image-field';
import { RepeaterList } from '@/components/admin/repeater-list';
import { TagsInput } from '@/components/admin/tags-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { adminRoutes } from '@/lib/admin-routes';
import { cn } from '@/lib/utils';
import type { AdminProject } from '@/types/admin';

const TECH_SUGGESTIONS = [
    'React', 'Vue.js', 'Next.js', 'Nuxt.js', 'Angular', 'Laravel', 'PHP', 'Node.js', 'Python', 'Django',
    'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'AWS', 'Vercel', 'Docker', 'Kubernetes', 'GraphQL',
    'REST API', 'WebSocket', 'Tailwind CSS', 'TypeScript', 'JavaScript',
];

type TabKey = 'basic' | 'images' | 'tech' | 'metrics' | 'story';

const TABS: { key: TabKey; label: string; fields: string[] }[] = [
    { key: 'basic', label: 'Podstawowe', fields: ['title', 'slug', 'url', 'category', 'sort_order', 'is_active', 'description', 'full_description'] },
    { key: 'images', label: 'Zdjęcia', fields: ['thumbnail_image', 'full_image'] },
    { key: 'tech', label: 'Technologie', fields: ['tech_stack'] },
    { key: 'metrics', label: 'Metryki', fields: ['metrics'] },
    { key: 'story', label: 'Wyzwania i rozwiązania', fields: ['challenges', 'solutions'] },
];

type Metric = { value: string; label: string };

type ProjectFormData = {
    title: string;
    slug: string;
    url: string;
    category: string;
    sort_order: number;
    is_active: boolean;
    description: string;
    full_description: string;
    thumbnail_image: File | null;
    full_image: File | null;
    remove_thumbnail_image: boolean;
    remove_full_image: boolean;
    tech_stack: string[];
    metrics: Metric[];
    challenges: string[];
    solutions: string[];
};

const blankMetrics = (count: number): Metric[] => Array.from({ length: count }, () => ({ value: '', label: '' }));
const blankTexts = (count: number): string[] => Array.from({ length: count }, () => '');

/** Lower-case ASCII slug; "ł" has no decomposition, so it is mapped by hand. */
function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/ł/g, 'l')
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

const hasError = (errors: Record<string, string>, fields: string[]): boolean =>
    Object.keys(errors).some((key) => fields.some((field) => key === field || key.startsWith(`${field}.`)));

const firstError = (errors: Record<string, string>, field: string): string | undefined => {
    const key = Object.keys(errors).find((name) => name === field || name.startsWith(`${field}.`));

    return key ? errors[key] : undefined;
};

type ProjectFormProps = {
    project?: AdminProject;
    nextSortOrder?: number;
};

export function ProjectForm({ project, nextSortOrder = 1 }: ProjectFormProps) {
    const [tab, setTab] = useState<TabKey>('basic');
    const [slugEdited, setSlugEdited] = useState(Boolean(project));

    const { data, setData, post, put, processing, errors, transform } = useForm<ProjectFormData>({
        title: project?.title ?? '',
        slug: project?.slug ?? '',
        url: project?.url ?? '',
        category: project?.category ?? '',
        sort_order: project?.sortOrder ?? nextSortOrder,
        is_active: project?.isActive ?? true,
        description: project?.description ?? '',
        full_description: project?.fullDescription ?? '',
        thumbnail_image: null,
        full_image: null,
        remove_thumbnail_image: false,
        remove_full_image: false,
        tech_stack: project?.techStack ?? [],
        metrics: project?.metrics ?? blankMetrics(3),
        challenges: project?.challenges ?? blankTexts(4),
        solutions: project?.solutions ?? blankTexts(4),
    });

    // Rows the user left blank are dropped, so the default empty rows do not block saving.
    transform((form) => ({
        ...form,
        tech_stack: form.tech_stack.filter((tag) => tag.trim() !== ''),
        metrics: form.metrics.filter((metric) => metric.value.trim() !== '' || metric.label.trim() !== ''),
        challenges: form.challenges.filter((text) => text.trim() !== ''),
        solutions: form.solutions.filter((text) => text.trim() !== ''),
    }));

    const submit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        const options = {
            forceFormData: true,
            onError: (formErrors: Record<string, string>) => {
                const failing = TABS.find((candidate) => hasError(formErrors, candidate.fields));

                if (failing) {
                    setTab(failing.key);
                }
            },
        };

        if (project) {
            put(adminRoutes.projects.update(project.id), options);

            return;
        }

        post(adminRoutes.projects.index, options);
    };

    const changeTitle = (title: string): void => {
        setData((current) => ({ ...current, title, slug: slugEdited ? current.slug : slugify(title) }));
    };

    return (
        <form onSubmit={submit} className="grid max-w-4xl gap-6" noValidate>
            <Tabs value={tab} onValueChange={(value) => setTab(value as TabKey)}>
                <TabsList className="h-auto flex-wrap justify-start">
                    {TABS.map((candidate) => (
                        <TabsTrigger key={candidate.key} value={candidate.key} className="gap-2">
                            {candidate.label}
                            {hasError(errors, candidate.fields) ? <span className="size-1.5 rounded-full bg-destructive" aria-label="Są błędy" /> : null}
                        </TabsTrigger>
                    ))}
                </TabsList>

                <TabsContent value="basic" className="grid gap-6 pt-4">
                    <div className="grid gap-6 sm:grid-cols-2">
                        <FormField label="Nazwa projektu" htmlFor="title" error={errors.title}>
                            <Input id="title" required value={data.title} aria-invalid={Boolean(errors.title)} onChange={(event) => changeTitle(event.target.value)} />
                        </FormField>
                        <FormField label="Slug (URL)" htmlFor="slug" error={errors.slug}>
                            <Input
                                id="slug"
                                required
                                value={data.slug}
                                aria-invalid={Boolean(errors.slug)}
                                onChange={(event) => {
                                    setSlugEdited(true);
                                    setData('slug', event.target.value);
                                }}
                            />
                        </FormField>
                        <FormField label="Adres URL projektu" htmlFor="url" error={errors.url}>
                            <Input id="url" required placeholder="example.com" value={data.url} aria-invalid={Boolean(errors.url)} onChange={(event) => setData('url', event.target.value)} />
                        </FormField>
                        <FormField label="Kategoria" htmlFor="category" error={errors.category}>
                            <Input
                                id="category"
                                required
                                placeholder="np. E-commerce / Headless CMS"
                                value={data.category}
                                aria-invalid={Boolean(errors.category)}
                                onChange={(event) => setData('category', event.target.value)}
                            />
                        </FormField>
                        <FormField label="Kolejność" htmlFor="sort_order" error={errors.sort_order} hint="Mniejsza liczba oznacza wyższą pozycję na liście.">
                            <Input
                                id="sort_order"
                                type="number"
                                min={0}
                                value={data.sort_order}
                                aria-invalid={Boolean(errors.sort_order)}
                                onChange={(event) => setData('sort_order', Number(event.target.value))}
                            />
                        </FormField>
                        <div className="flex items-center gap-3 sm:pt-7">
                            <Switch id="is_active" checked={data.is_active} onCheckedChange={(checked) => setData('is_active', checked)} />
                            <Label htmlFor="is_active">Widoczny na stronie</Label>
                        </div>
                    </div>
                    <FormField label="Krótki opis" htmlFor="description" error={errors.description} hint="Wyświetlany na stronie głównej pod projektem.">
                        <Textarea id="description" rows={3} required value={data.description} aria-invalid={Boolean(errors.description)} onChange={(event) => setData('description', event.target.value)} />
                    </FormField>
                    <FormField label="Pełny opis" htmlFor="full_description" error={errors.full_description} hint="Wyświetlany w oknie case study.">
                        <Textarea
                            id="full_description"
                            rows={6}
                            required
                            value={data.full_description}
                            aria-invalid={Boolean(errors.full_description)}
                            onChange={(event) => setData('full_description', event.target.value)}
                        />
                    </FormField>
                </TabsContent>

                <TabsContent value="images" className="grid gap-6 pt-4">
                    <p className="text-sm text-muted-foreground">Zdjęcia są zamieniane na WebP i zmniejszane do 1600 px (miniaturka) i 1920 px (pełne zdjęcie) szerokości.</p>
                    <FormField label="Miniaturka (strona główna)" htmlFor="thumbnail_image" error={errors.thumbnail_image}>
                        <ImageField
                            id="thumbnail_image"
                            currentUrl={project?.thumbnailUrl ?? null}
                            file={data.thumbnail_image}
                            removed={data.remove_thumbnail_image}
                            invalid={Boolean(errors.thumbnail_image)}
                            onFileChange={(file) => setData('thumbnail_image', file)}
                            onRemovedChange={(removed) => setData('remove_thumbnail_image', removed)}
                        />
                    </FormField>
                    <FormField label="Pełne zdjęcie (okno case study)" htmlFor="full_image" error={errors.full_image}>
                        <ImageField
                            id="full_image"
                            currentUrl={project?.fullImageUrl ?? null}
                            file={data.full_image}
                            removed={data.remove_full_image}
                            invalid={Boolean(errors.full_image)}
                            onFileChange={(file) => setData('full_image', file)}
                            onRemovedChange={(removed) => setData('remove_full_image', removed)}
                        />
                    </FormField>
                </TabsContent>

                <TabsContent value="tech" className="grid gap-6 pt-4">
                    <FormField label="Technologie" htmlFor="tech_stack" error={firstError(errors, 'tech_stack')} hint="Wpisz nazwę i zatwierdź Enterem.">
                        <TagsInput
                            id="tech_stack"
                            value={data.tech_stack}
                            onChange={(tags) => setData('tech_stack', tags)}
                            suggestions={TECH_SUGGESTIONS}
                            placeholder="Dodaj technologię"
                            invalid={Boolean(firstError(errors, 'tech_stack'))}
                        />
                    </FormField>
                </TabsContent>

                <TabsContent value="metrics" className="grid gap-4 pt-4">
                    <p className="text-sm text-muted-foreground">Od 1 do 3 kluczowych metryk projektu.</p>
                    <RepeaterList<Metric>
                        value={data.metrics}
                        onChange={(metrics) => setData('metrics', metrics)}
                        createItem={() => ({ value: '', label: '' })}
                        addLabel="Dodaj metrykę"
                        itemLabel="Metryki"
                        min={1}
                        max={3}
                        error={firstError(errors, 'metrics')}
                        renderItem={(metric, update, index) => (
                            <div className="grid gap-2 sm:grid-cols-2">
                                <Input aria-label={`Wartość metryki ${index + 1}`} placeholder="np. +45%, 99.9%, 10K+" value={metric.value} onChange={(event) => update({ ...metric, value: event.target.value })} />
                                <Input aria-label={`Etykieta metryki ${index + 1}`} placeholder="np. Konwersja, Uptime" value={metric.label} onChange={(event) => update({ ...metric, label: event.target.value })} />
                            </div>
                        )}
                    />
                </TabsContent>

                <TabsContent value="story" className="grid gap-8 pt-4">
                    <div className={cn('grid gap-2')}>
                        <h2 className="text-sm font-medium">Wyzwania</h2>
                        <RepeaterList<string>
                            value={data.challenges}
                            onChange={(challenges) => setData('challenges', challenges)}
                            createItem={() => ''}
                            addLabel="Dodaj wyzwanie"
                            itemLabel="Wyzwania"
                            min={1}
                            max={6}
                            error={firstError(errors, 'challenges')}
                            renderItem={(text, update, index) => <Input aria-label={`Wyzwanie ${index + 1}`} placeholder="Opisz wyzwanie" value={text} onChange={(event) => update(event.target.value)} />}
                        />
                    </div>
                    <div className="grid gap-2">
                        <h2 className="text-sm font-medium">Rozwiązania</h2>
                        <RepeaterList<string>
                            value={data.solutions}
                            onChange={(solutions) => setData('solutions', solutions)}
                            createItem={() => ''}
                            addLabel="Dodaj rozwiązanie"
                            itemLabel="Rozwiązania"
                            min={1}
                            max={6}
                            error={firstError(errors, 'solutions')}
                            renderItem={(text, update, index) => <Input aria-label={`Rozwiązanie ${index + 1}`} placeholder="Opisz rozwiązanie" value={text} onChange={(event) => update(event.target.value)} />}
                        />
                    </div>
                </TabsContent>
            </Tabs>

            <div className="flex items-center gap-3">
                <Button type="submit" disabled={processing}>
                    {project ? 'Zapisz zmiany' : 'Dodaj projekt'}
                </Button>
                <Button asChild variant="ghost">
                    <Link href={adminRoutes.projects.index}>Anuluj</Link>
                </Button>
            </div>
        </form>
    );
}
```

(Usuń zbędne `cn` i `className={cn('grid gap-2')}` z pierwszego bloku "Wyzwania": użyj zwykłego `className="grid gap-2"` i usuń import `cn`.)

- [ ] **Step 7: Strony projektów**

`resources/js/pages/admin/projects/create.tsx`:

```tsx
import { AdminLayout } from '@/components/admin/admin-layout';
import { ProjectForm } from '@/components/admin/project-form';
import { adminRoutes } from '@/lib/admin-routes';

export default function ProjectCreate({ nextSortOrder }: { nextSortOrder: number }) {
    return (
        <AdminLayout title="Nowy projekt" breadcrumbs={[{ title: 'Projekty', href: adminRoutes.projects.index }]}>
            <ProjectForm nextSortOrder={nextSortOrder} />
        </AdminLayout>
    );
}
```

`resources/js/pages/admin/projects/edit.tsx`:

```tsx
import { AdminLayout } from '@/components/admin/admin-layout';
import { ProjectForm } from '@/components/admin/project-form';
import { adminRoutes } from '@/lib/admin-routes';
import type { AdminProject } from '@/types/admin';

export default function ProjectEdit({ project }: { project: AdminProject }) {
    return (
        <AdminLayout title={project.title} breadcrumbs={[{ title: 'Projekty', href: adminRoutes.projects.index }]}>
            <ProjectForm project={project} />
        </AdminLayout>
    );
}
```

`resources/js/pages/admin/projects/index.tsx`: skopiuj strukturę `clients/index.tsx` (Zadanie 5, Step 6) z następującymi zmianami:
- typy: `AdminProjectRow`; `searchText = (project) => `${project.title} ${project.category} ${project.url}``
- `useRecordList({ records: projects, reorderUrl: adminRoutes.projects.reorder, searchText })`
- tytuł `Projekty`, przycisk `Nowy projekt` → `adminRoutes.projects.create`, `searchLabel="Szukaj projektu"`, `Checkbox` `aria-label="Zaznacz wszystkie projekty"`
- trasy `adminRoutes.projects.edit/destroy/index`
- kolumny po checkboxie: miniaturka (`<TableCell className="w-24">` z `<img src={project.thumbnailUrl} alt="" className="h-10 w-18 rounded border object-cover object-top" />` albo `<div className="h-10 w-18 rounded border bg-muted" />` gdy `null`), `#` (`sortOrder`), `Nazwa` (link do edycji, pod nią `<span className="block text-xs text-muted-foreground">{project.url}</span>`), `Kategoria` (`<Badge variant="outline">{project.category}</Badge>`), `Status`, `Aktualizacja`, akcje
- `colSpan={9}` w pustym wierszu, teksty: „Brak projektów do wyświetlenia.”, `Usunąć projekt?`, `Projekt „…” zniknie z listy i ze strony głównej. Tej operacji nie można cofnąć.`, `Usunąć zaznaczone projekty?`, `Zostanie usuniętych projektów: N. …`
- nagłówki: `<TableHead className="w-10" />` (uchwyt), `<TableHead className="w-10">` (checkbox), `<TableHead className="w-24">Miniaturka</TableHead>`, `#`, `Nazwa`, `Kategoria`, `Status`, `Aktualizacja`, `<TableHead className="w-24" />`

- [ ] **Step 8: Testy, typy, build, commit**

Run: `php artisan test --compact tests/Feature/Admin/ProjectTest.php`
Expected: PASS.

Run: `npx tsc --noEmit && npm run build`
Expected: bez błędów; build klienta i SSR przechodzi (strony admina trafiają do bundla).

```bash
vendor/bin/pint --dirty --format agent
git add -A
git commit -m "Add project management to the admin panel with image upload and ordering" -m "Claude-Session: https://claude.ai/code/session_013ymSrGVKpfUzjAgpNZaxhz"
```

---

### Task 7: Wiadomości, briefy i prośby o kontakt

**Files:**
- Create: `app/Http/Controllers/Admin/{ContactMessageController,ProjectBriefController,CallbackRequestController}.php`
- Create: `app/Http/Requests/Admin/{LeadIndexRequest,BriefIndexRequest}.php`
- Create: `database/factories/{ContactMessage,ProjectBrief,CallbackRequest}Factory.php`
- Create: `resources/js/components/admin/brief-labels.ts`
- Create: `resources/js/pages/admin/messages/{index,show}.tsx`, `resources/js/pages/admin/briefs/{index,show}.tsx`, `resources/js/pages/admin/callbacks/index.tsx`
- Create: `tests/Feature/Admin/{ContactMessageTest,ProjectBriefTest,CallbackRequestTest}.php`
- Modify: `routes/admin.php`, `resources/js/types/admin.ts` (typ `BriefFilters`), modele `ContactMessage`, `ProjectBrief`, `CallbackRequest` (`HasFactory`)

**Interfaces:**
- Consumes: `DestroyManyRequest`, `ListToolbar`, `Pagination`, `SortHeader`, `BulkBar`, `useListFilters`, `useSelection`, `DetailList`, `DetailItem`, `CopyButton`, `ConfirmDeleteDialog` (Zad. 3/5).
- Produces: trasy `admin.messages.{index,show,destroy,destroy-many}`, `admin.briefs.{index,show,destroy,destroy-many}`, `admin.callbacks.{index,destroy,destroy-many}`; `LeadIndexRequest::applyTo()` / `::filters()`.

- [ ] **Step 1: Fabryki i `HasFactory`**

Run:
```bash
php artisan make:factory ContactMessageFactory --model=ContactMessage --no-interaction
php artisan make:factory ProjectBriefFactory --model=ProjectBrief --no-interaction
php artisan make:factory CallbackRequestFactory --model=CallbackRequest --no-interaction
```

W każdym z trzech modeli dodaj `use Illuminate\Database\Eloquent\Factories\HasFactory;` oraz `/** @use HasFactory<\Database\Factories\…Factory> */ use HasFactory;`.

`ContactMessageFactory::definition()`:

```php
        return [
            'name' => fake()->name(),
            'email' => fake()->safeEmail(),
            'subject' => fake()->randomElement(['project', 'quote', 'other']),
            'message' => fake()->paragraph(),
        ];
```

`CallbackRequestFactory::definition()`:

```php
        return [
            'phone' => fake()->numerify('+48 ### ### ###'),
        ];
```

`ProjectBriefFactory::definition()`:

```php
        return [
            'types' => ['website'],
            'features' => ['auth', 'cms'],
            'industry' => 'saas',
            'audience' => 'b2b',
            'design' => 'partial',
            'timeline' => '1-2',
            'tech' => ['laravel'],
            'security' => 'standard',
            'hosting' => 'help',
            'integrations' => fake()->sentence(),
            'budget' => 'medium',
            'cooperation_model' => 'fixed',
            'notes' => fake()->paragraph(),
            'name' => fake()->name(),
            'email' => fake()->safeEmail(),
            'phone' => fake()->numerify('+48 ### ### ###'),
            'company' => fake()->company(),
            'position' => 'CTO',
            'website' => fake()->domainName(),
            'source' => 'google',
            'contact_pref' => ['email'],
        ];
```

(Sprawdź migrację `create_project_briefs_table` – pola `nullable`/typy; jeśli któraś kolumna ma inny typ, dostosuj wartości.)

- [ ] **Step 2: Napisz testy wiadomości (nie przejdą)**

Run: `php artisan make:test --pest Admin/ContactMessageTest --no-interaction`; nadpisz `tests/Feature/Admin/ContactMessageTest.php`:

```php
<?php

use App\Models\ContactMessage;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Inertia\Testing\AssertableInertia as Assert;

use function Pest\Laravel\assertDatabaseCount;
use function Pest\Laravel\assertDatabaseHas;
use function Pest\Laravel\assertDatabaseMissing;

beforeEach(function () {
    $this->withoutVite();
    $this->actingAs(User::factory()->create());
});

it('paginates the messages, 25 per page, newest first', function () {
    ContactMessage::factory()->count(30)->create();
    $newest = ContactMessage::factory()->create(['created_at' => now()->addDay()]);

    $this->get(route('admin.messages.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/messages/index')
            ->has('messages.data', 25)
            ->where('messages.total', 31)
            ->where('messages.last_page', 2)
            ->where('messages.data.0.id', $newest->id)
            ->where('filters.sort', 'created_at')
            ->where('filters.direction', 'desc'));
});

it('serves the second page and an empty page past the end', function () {
    ContactMessage::factory()->count(30)->create();

    $this->get(route('admin.messages.index', ['page' => 2]))
        ->assertInertia(fn (Assert $page) => $page->has('messages.data', 5));

    $this->get(route('admin.messages.index', ['page' => 99]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->has('messages.data', 0));
});

it('searches the name, email, subject and message', function (string $term) {
    ContactMessage::factory()->create(['name' => 'Jan Kowalski', 'email' => 'jan@firma.pl', 'subject' => 'wycena', 'message' => 'Potrzebujemy sklepu']);
    ContactMessage::factory()->create(['name' => 'Ewa Nowak', 'email' => 'ewa@inna.pl', 'subject' => 'inne', 'message' => 'Dzień dobry']);

    $this->get(route('admin.messages.index', ['search' => $term]))
        ->assertInertia(fn (Assert $page) => $page->has('messages.data', 1)->where('messages.data.0.name', 'Jan Kowalski'));
})->with(['name' => 'Kowalski', 'email' => 'firma.pl', 'subject' => 'wycena', 'message' => 'sklepu']);

it('treats wildcard characters in the search as plain input', function (string $term) {
    ContactMessage::factory()->count(2)->create();

    $this->get(route('admin.messages.index', ['search' => $term]))->assertOk();
})->with(['percent' => '%', 'underscore' => '_', 'quote' => "'; drop table contact_messages; --"]);

it('filters by the date range, inclusive of both days', function () {
    ContactMessage::factory()->create(['name' => 'Przed', 'created_at' => '2026-01-31 23:59:00']);
    ContactMessage::factory()->create(['name' => 'Pierwszy', 'created_at' => '2026-02-01 00:00:00']);
    ContactMessage::factory()->create(['name' => 'Ostatni', 'created_at' => '2026-02-28 23:59:00']);
    ContactMessage::factory()->create(['name' => 'Po', 'created_at' => '2026-03-01 00:00:00']);

    $this->get(route('admin.messages.index', ['from' => '2026-02-01', 'until' => '2026-02-28', 'sort' => 'name', 'direction' => 'asc']))
        ->assertInertia(fn (Assert $page) => $page
            ->has('messages.data', 2)
            ->where('messages.data.0.name', 'Ostatni')
            ->where('messages.data.1.name', 'Pierwszy')
            ->where('filters.from', '2026-02-01')
            ->where('filters.until', '2026-02-28'));
});

it('ignores a malformed date', function () {
    ContactMessage::factory()->count(2)->create();

    $this->get(route('admin.messages.index', ['from' => 'jutro', 'until' => '2026-13-45']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->has('messages.data', 2)->where('filters.from', '')->where('filters.until', ''));
});

it('sorts by an allowed column in both directions', function () {
    ContactMessage::factory()->create(['name' => 'Beata']);
    ContactMessage::factory()->create(['name' => 'Adam']);

    $this->get(route('admin.messages.index', ['sort' => 'name', 'direction' => 'asc']))
        ->assertInertia(fn (Assert $page) => $page->where('messages.data.0.name', 'Adam'));

    $this->get(route('admin.messages.index', ['sort' => 'name', 'direction' => 'desc']))
        ->assertInertia(fn (Assert $page) => $page->where('messages.data.0.name', 'Beata'));
});

it('falls back to the default order for an unknown sort column or direction', function (array $query) {
    ContactMessage::factory()->count(2)->create();

    $this->get(route('admin.messages.index', $query))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('filters.sort', 'created_at')->where('filters.direction', 'desc'));
})->with([
    'unknown column' => [['sort' => 'password', 'direction' => 'sideways']],
    'sql in the column' => [['sort' => 'name); drop table users; --']],
    'array instead of string' => [['sort' => ['name']]],
]);

it('shows a message', function () {
    $message = ContactMessage::factory()->create(['message' => "Pierwsza linia\nDruga linia"]);

    $this->get(route('admin.messages.show', $message))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/messages/show')
            ->where('message.id', $message->id)
            ->where('message.message', "Pierwsza linia\nDruga linia"));
});

it('deletes a message and goes back to the list', function () {
    $message = ContactMessage::factory()->create();

    $this->delete(route('admin.messages.destroy', $message))->assertRedirect(route('admin.messages.index'));

    assertDatabaseMissing('contact_messages', ['id' => $message->id]);
});

it('deletes many messages at once and leaves the others', function () {
    [$first, $second, $kept] = ContactMessage::factory()->count(3)->create();

    $this->delete(route('admin.messages.destroy-many'), ['ids' => [$first->id, $second->id]])->assertRedirect();

    assertDatabaseCount('contact_messages', 1);
    assertDatabaseHas('contact_messages', ['id' => $kept->id]);
});

it('validates the ids when deleting many messages', function (mixed $ids) {
    ContactMessage::factory()->create();

    $this->delete(route('admin.messages.destroy-many'), ['ids' => $ids])->assertSessionHasErrors('ids');

    assertDatabaseCount('contact_messages', 1);
})->with(['missing' => [null], 'empty' => [[]], 'not numbers' => [['abc']]]);

it('redirects guests away from the messages and changes nothing', function () {
    $message = ContactMessage::factory()->create();

    Auth::logout();

    $this->get(route('admin.messages.index'))->assertRedirect(route('admin.login'));
    $this->get(route('admin.messages.show', $message))->assertRedirect(route('admin.login'));
    $this->delete(route('admin.messages.destroy-many'), ['ids' => [$message->id]])->assertRedirect(route('admin.login'));

    assertDatabaseHas('contact_messages', ['id' => $message->id]);
});
```

- [ ] **Step 3: Żądania list**

Run:
```bash
php artisan make:request Admin/LeadIndexRequest --no-interaction
php artisan make:request Admin/BriefIndexRequest --no-interaction
```

`app/Http/Requests/Admin/LeadIndexRequest.php`:

```php
<?php

namespace App\Http\Requests\Admin;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

/**
 * Query string of a lead list (search, date range, sorting). Anything outside the allowed values is ignored
 * rather than rejected, so a stale or hand-edited URL never breaks the list.
 */
class LeadIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string'],
            'sort' => ['nullable', 'string'],
            'direction' => ['nullable', 'string'],
        ];
    }

    /**
     * @template TModel of Model
     *
     * @param  Builder<TModel>  $query
     * @param  list<string>  $searchable
     * @param  list<string>  $sortable
     * @return Builder<TModel>
     */
    public function applyTo(Builder $query, array $searchable, array $sortable): Builder
    {
        $search = $this->searchTerm();
        $from = $this->dateInput('from');
        $until = $this->dateInput('until');
        $filters = $this->filters($sortable);

        return $query
            ->when($search !== '', function (Builder $query) use ($search, $searchable): void {
                $query->where(function (Builder $query) use ($search, $searchable): void {
                    foreach ($searchable as $column) {
                        $query->orWhere($column, 'like', "%{$search}%");
                    }
                });
            })
            ->when($from !== null, fn (Builder $query): Builder => $query->whereDate('created_at', '>=', $from))
            ->when($until !== null, fn (Builder $query): Builder => $query->whereDate('created_at', '<=', $until))
            ->orderBy($filters['sort'], $filters['direction'])
            ->orderByDesc('id');
    }

    /**
     * The filters as the list page shows them (also the normalised form of what was asked for).
     *
     * @param  list<string>  $sortable
     * @return array{search: string, from: string, until: string, sort: string, direction: 'asc'|'desc'}
     */
    public function filters(array $sortable): array
    {
        $sort = $this->input('sort');

        return [
            'search' => $this->searchTerm(),
            'from' => $this->dateInput('from') ?? '',
            'until' => $this->dateInput('until') ?? '',
            'sort' => is_string($sort) && in_array($sort, $sortable, true) ? $sort : 'created_at',
            'direction' => $this->input('direction') === 'asc' ? 'asc' : 'desc',
        ];
    }

    protected function searchTerm(): string
    {
        $search = $this->input('search');

        return is_string($search) ? Str::limit(trim($search), 100, '') : '';
    }

    /**
     * A calendar date in Y-m-d, or null for anything else.
     */
    protected function dateInput(string $key): ?string
    {
        $value = $this->input($key);

        if (! is_string($value) || ! preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', $value, $parts)) {
            return null;
        }

        return checkdate((int) $parts[2], (int) $parts[3], (int) $parts[1]) ? $value : null;
    }
}
```

`app/Http/Requests/Admin/BriefIndexRequest.php`:

```php
<?php

namespace App\Http\Requests\Admin;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class BriefIndexRequest extends LeadIndexRequest
{
    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            ...parent::rules(),
            'budget' => ['nullable', 'string'],
            'timeline' => ['nullable', 'string'],
        ];
    }

    /**
     * @template TModel of Model
     *
     * @param  Builder<TModel>  $query
     * @param  list<string>  $searchable
     * @param  list<string>  $sortable
     * @return Builder<TModel>
     */
    public function applyTo(Builder $query, array $searchable, array $sortable): Builder
    {
        $budget = $this->choice('budget');
        $timeline = $this->choice('timeline');

        return parent::applyTo($query, $searchable, $sortable)
            ->when($budget !== '', fn (Builder $query): Builder => $query->where('budget', $budget))
            ->when($timeline !== '', fn (Builder $query): Builder => $query->where('timeline', $timeline));
    }

    /**
     * @param  list<string>  $sortable
     * @return array{search: string, from: string, until: string, sort: string, direction: 'asc'|'desc', budget: string, timeline: string}
     */
    public function briefFilters(array $sortable): array
    {
        return [
            ...$this->filters($sortable),
            'budget' => $this->choice('budget'),
            'timeline' => $this->choice('timeline'),
        ];
    }

    private function choice(string $key): string
    {
        $value = $this->input($key);

        return is_string($value) ? trim($value) : '';
    }
}
```

- [ ] **Step 4: Kontrolery, trasy**

Run:
```bash
php artisan make:controller Admin/ContactMessageController --no-interaction
php artisan make:controller Admin/ProjectBriefController --no-interaction
php artisan make:controller Admin/CallbackRequestController --no-interaction
```

`app/Http/Controllers/Admin/ContactMessageController.php`:

```php
<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\DestroyManyRequest;
use App\Http\Requests\Admin\LeadIndexRequest;
use App\Models\ContactMessage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ContactMessageController extends Controller
{
    private const SEARCHABLE = ['name', 'email', 'subject', 'message'];

    private const SORTABLE = ['name', 'email', 'subject', 'created_at'];

    public function index(LeadIndexRequest $request): Response
    {
        $messages = $request->applyTo(ContactMessage::query(), self::SEARCHABLE, self::SORTABLE)
            ->paginate(25)
            ->withQueryString()
            ->through(fn (ContactMessage $message): array => $this->rowProps($message));

        return Inertia::render('admin/messages/index', [
            'messages' => $messages,
            'filters' => $request->filters(self::SORTABLE),
        ]);
    }

    public function show(ContactMessage $message): Response
    {
        return Inertia::render('admin/messages/show', [
            'message' => [...$this->rowProps($message), 'message' => $message->message],
        ]);
    }

    public function destroy(ContactMessage $message): RedirectResponse
    {
        $message->delete();

        return to_route('admin.messages.index')->with('success', 'Usunięto wiadomość.');
    }

    public function destroyMany(DestroyManyRequest $request): RedirectResponse
    {
        $count = ContactMessage::query()->whereKey($request->ids())->delete();

        return back()->with('success', "Usunięto wiadomości: {$count}.");
    }

    /**
     * @return array{id: int, name: string, email: string, subject: string|null, excerpt: string, createdAt: string}
     */
    private function rowProps(ContactMessage $message): array
    {
        return [
            'id' => $message->id,
            'name' => $message->name,
            'email' => $message->email,
            'subject' => $message->subject,
            'excerpt' => Str::limit((string) $message->message, 90),
            'createdAt' => $message->created_at?->format('d.m.Y H:i') ?? '',
        ];
    }
}
```

`app/Http/Controllers/Admin/CallbackRequestController.php`: analogicznie (bez `show`), `SEARCHABLE = ['phone']`, `SORTABLE = ['phone', 'created_at']`, komponent `admin/callbacks/index` z propsem `callbacks`, `rowProps` zwraca `['id', 'phone', 'createdAt']`, komunikaty `Usunięto prośbę o kontakt.` / `Usunięto próśb o kontakt: {$count}.`, `destroy` przekierowuje na `admin.callbacks.index`.

`app/Http/Controllers/Admin/ProjectBriefController.php`: analogicznie do wiadomości, z `BriefIndexRequest`:
- `SEARCHABLE = ['name', 'email', 'company', 'phone', 'integrations', 'notes']`, `SORTABLE = ['name', 'email', 'company', 'budget', 'timeline', 'created_at']`
- `index` używa `$request->applyTo(ProjectBrief::query(), …)`, `'filters' => $request->briefFilters(self::SORTABLE)`, komponent `admin/briefs/index`, prop `briefs`
- `rowProps(ProjectBrief $brief)`: `id`, `name`, `email`, `company`, `types` (`$brief->types ?? []`), `budget`, `timeline`, `createdAt`
- `show` zwraca `[...rowProps, 'phone', 'position', 'website', 'source', 'contactPref' => $brief->contact_pref ?? [], 'features' => $brief->features ?? [], 'industry', 'audience', 'design', 'tech' => $brief->tech ?? [], 'security', 'hosting', 'integrations', 'cooperationModel' => $brief->cooperation_model, 'notes']` jako prop `brief`, komponent `admin/briefs/show`
- komunikaty `Usunięto brief.` / `Usunięto briefy: {$count}.`

`routes/admin.php`: dodaj importy kontrolerów i w grupie `auth`:

```php
        Route::delete('messages', [ContactMessageController::class, 'destroyMany'])->name('messages.destroy-many');
        Route::resource('messages', ContactMessageController::class)->only(['index', 'show', 'destroy']);

        Route::delete('briefs', [ProjectBriefController::class, 'destroyMany'])->name('briefs.destroy-many');
        Route::resource('briefs', ProjectBriefController::class)->only(['index', 'show', 'destroy']);

        Route::delete('callbacks', [CallbackRequestController::class, 'destroyMany'])->name('callbacks.destroy-many');
        Route::resource('callbacks', CallbackRequestController::class)->only(['index', 'destroy']);
```

- [ ] **Step 5: Testy briefów i próśb (analogiczne)**

`tests/Feature/Admin/CallbackRequestTest.php` (`make:test --pest Admin/CallbackRequestTest`): testy jak dla wiadomości, ale dla `CallbackRequest` i tras `admin.callbacks.*`: paginacja 25/stronę (`callbacks.data`), wyszukiwanie po numerze (`'+48 111'` wśród dwóch rekordów), filtr dat, sortowanie po `phone`, nieznana kolumna sortowania, `destroy` (przekierowanie na `admin.callbacks.index`), `destroyMany` + walidacja ids, gość przekierowany.

`tests/Feature/Admin/ProjectBriefTest.php`: testy jak dla wiadomości (komponent `admin/briefs/index`, prop `briefs`) plus:

```php
it('filters by budget and timeline', function () {
    ProjectBrief::factory()->create(['name' => 'Mały', 'budget' => 'small', 'timeline' => 'asap']);
    ProjectBrief::factory()->create(['name' => 'Duży', 'budget' => 'large', 'timeline' => '3-6']);

    $this->get(route('admin.briefs.index', ['budget' => 'large']))
        ->assertInertia(fn (Assert $page) => $page->has('briefs.data', 1)->where('briefs.data.0.name', 'Duży')->where('filters.budget', 'large'));

    $this->get(route('admin.briefs.index', ['timeline' => 'asap']))
        ->assertInertia(fn (Assert $page) => $page->has('briefs.data', 1)->where('briefs.data.0.name', 'Mały'));

    $this->get(route('admin.briefs.index', ['budget' => 'small', 'timeline' => '3-6']))
        ->assertInertia(fn (Assert $page) => $page->has('briefs.data', 0));
});

it('shows every field of a brief', function () {
    $brief = ProjectBrief::factory()->create(['types' => ['website', 'ecommerce'], 'contact_pref' => ['phone'], 'cooperation_model' => 'hourly']);

    $this->get(route('admin.briefs.show', $brief))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/briefs/show')
            ->where('brief.id', $brief->id)
            ->where('brief.types', ['website', 'ecommerce'])
            ->where('brief.contactPref', ['phone'])
            ->where('brief.cooperationModel', 'hourly'));
});

it('shows a brief whose optional list fields are empty', function () {
    $brief = ProjectBrief::factory()->create(['types' => null, 'features' => null, 'tech' => null, 'contact_pref' => null]);

    $this->get(route('admin.briefs.show', $brief))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('brief.types', [])->where('brief.features', [])->where('brief.tech', [])->where('brief.contactPref', []));
});
```
(jeśli kolumny w migracji nie są `nullable`, pomiń drugi test lub użyj pustych tablic `[]`).

Run: `php artisan test --compact tests/Feature/Admin`
Expected (przed stronami TSX): testy `assertInertia(component…)` padają przez `ensure_pages_exist` – przejdź do kroku 6, potem uruchom ponownie.

- [ ] **Step 6: Etykiety briefu i typ filtrów**

`resources/js/components/admin/brief-labels.ts`:

```ts
import { briefOptions, type BriefOption } from '@/components/home/brief/brief-options';

export type BriefField = keyof typeof briefOptions;

/** Label of a saved brief value; a value the form no longer offers is shown as it was saved. */
export function briefLabel(field: BriefField, value: string | null | undefined): string | null {
    if (!value) {
        return null;
    }

    return (briefOptions[field] as BriefOption[]).find((option) => option.value === value)?.label ?? value;
}

export function briefLabels(field: BriefField, values: string[] | null | undefined): string {
    return (values ?? []).map((value) => briefLabel(field, value) ?? value).join(', ');
}
```

W `resources/js/types/admin.ts` dodaj:

```ts
export type BriefFilters = LeadFilters & { budget: string; timeline: string };
```

- [ ] **Step 7: Strony leadów**

`resources/js/pages/admin/messages/index.tsx` (wzorzec dla trzech list):

```tsx
import { Link, router } from '@inertiajs/react';
import { EyeIcon, Trash2Icon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { AdminLayout } from '@/components/admin/admin-layout';
import { BulkBar } from '@/components/admin/bulk-bar';
import { ConfirmDeleteDialog } from '@/components/admin/confirm-delete-dialog';
import { ListToolbar } from '@/components/admin/list-toolbar';
import { Pagination } from '@/components/admin/pagination';
import { SortHeader } from '@/components/admin/sort-header';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useListFilters } from '@/hooks/use-list-filters';
import { useSelection } from '@/hooks/use-selection';
import { adminRoutes } from '@/lib/admin-routes';
import type { AdminMessageRow, LeadFilters, Paginated } from '@/types/admin';

type Props = { messages: Paginated<AdminMessageRow>; filters: LeadFilters };

export default function MessagesIndex({ messages, filters }: Props) {
    const { values, update, toggleSort } = useListFilters<LeadFilters>(adminRoutes.messages.index, filters);
    const { selected, toggle, toggleAll, clear } = useSelection();
    const [deleting, setDeleting] = useState<AdminMessageRow | null>(null);
    const [bulkOpen, setBulkOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    useEffect(clear, [messages.data, clear]);

    const rowIds = messages.data.map((message) => message.id);
    const allSelected = rowIds.length > 0 && rowIds.every((id) => selected.includes(id));
    const someSelected = rowIds.some((id) => selected.includes(id));
    const hasActiveFilters = values.search !== '' || values.from !== '' || values.until !== '';

    const deleteOne = (): void => {
        if (!deleting) {
            return;
        }

        router.delete(adminRoutes.messages.destroy(deleting.id), {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onFinish: () => {
                setProcessing(false);
                setDeleting(null);
            },
        });
    };

    const deleteSelected = (): void => {
        router.delete(adminRoutes.messages.index, {
            data: { ids: selected },
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onSuccess: clear,
            onFinish: () => {
                setProcessing(false);
                setBulkOpen(false);
            },
        });
    };

    return (
        <AdminLayout title="Wiadomości">
            <ListToolbar
                values={values}
                onChange={update}
                searchLabel="Szukaj wiadomości"
                hasActiveFilters={hasActiveFilters}
                onReset={() => update({ search: '', from: '', until: '' })}
            />

            <BulkBar count={selected.length} onDelete={() => setBulkOpen(true)} />

            <div className="overflow-x-auto rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-10">
                                <Checkbox
                                    aria-label="Zaznacz wszystkie wiadomości na stronie"
                                    checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                                    onCheckedChange={() => toggleAll(rowIds)}
                                />
                            </TableHead>
                            <SortHeader column="name" label="Nadawca" filters={values} onSort={toggleSort} />
                            <SortHeader column="email" label="E-mail" filters={values} onSort={toggleSort} />
                            <SortHeader column="subject" label="Temat" filters={values} onSort={toggleSort} />
                            <TableHead>Wiadomość</TableHead>
                            <SortHeader column="created_at" label="Data" filters={values} onSort={toggleSort} />
                            <TableHead className="w-24" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {messages.data.map((message) => (
                            <TableRow key={message.id}>
                                <TableCell>
                                    <Checkbox
                                        aria-label={`Zaznacz: ${message.name}`}
                                        checked={selected.includes(message.id)}
                                        onCheckedChange={() => toggle(message.id)}
                                    />
                                </TableCell>
                                <TableCell className="font-medium">
                                    <Link href={adminRoutes.messages.show(message.id)} className="hover:underline">
                                        {message.name}
                                    </Link>
                                </TableCell>
                                <TableCell>{message.email}</TableCell>
                                <TableCell className="text-muted-foreground">{message.subject ?? 'Brak tematu'}</TableCell>
                                <TableCell className="max-w-72 truncate text-muted-foreground">{message.excerpt}</TableCell>
                                <TableCell className="whitespace-nowrap text-muted-foreground">{message.createdAt}</TableCell>
                                <TableCell>
                                    <div className="flex justify-end gap-1">
                                        <Button asChild variant="ghost" size="icon-sm">
                                            <Link href={adminRoutes.messages.show(message.id)} aria-label={`Zobacz: ${message.name}`}>
                                                <EyeIcon />
                                            </Link>
                                        </Button>
                                        <Button type="button" variant="ghost" size="icon-sm" aria-label={`Usuń: ${message.name}`} onClick={() => setDeleting(message)}>
                                            <Trash2Icon />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {messages.data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                    Brak wiadomości do wyświetlenia.
                                </TableCell>
                            </TableRow>
                        ) : null}
                    </TableBody>
                </Table>
            </div>

            <Pagination paginator={messages} />

            <ConfirmDeleteDialog
                open={deleting !== null}
                onOpenChange={(open) => !open && setDeleting(null)}
                title="Usunąć wiadomość?"
                description={deleting ? `Wiadomość od ${deleting.name} zostanie usunięta. Tej operacji nie można cofnąć.` : ''}
                onConfirm={deleteOne}
                processing={processing}
            />
            <ConfirmDeleteDialog
                open={bulkOpen}
                onOpenChange={setBulkOpen}
                title="Usunąć zaznaczone wiadomości?"
                description={`Zostanie usuniętych wiadomości: ${selected.length}. Tej operacji nie można cofnąć.`}
                onConfirm={deleteSelected}
                processing={processing}
            />
        </AdminLayout>
    );
}
```

`resources/js/pages/admin/messages/show.tsx`:

```tsx
import { Link, router } from '@inertiajs/react';
import { Trash2Icon } from 'lucide-react';
import { useState } from 'react';

import { AdminLayout } from '@/components/admin/admin-layout';
import { ConfirmDeleteDialog } from '@/components/admin/confirm-delete-dialog';
import { CopyButton, DetailItem, DetailList } from '@/components/admin/detail';
import { Button } from '@/components/ui/button';
import { adminRoutes } from '@/lib/admin-routes';
import type { AdminMessage } from '@/types/admin';

export default function MessageShow({ message }: { message: AdminMessage }) {
    const [confirming, setConfirming] = useState(false);
    const [processing, setProcessing] = useState(false);

    return (
        <AdminLayout
            title={message.name}
            breadcrumbs={[{ title: 'Wiadomości', href: adminRoutes.messages.index }]}
            actions={
                <Button type="button" variant="outline" onClick={() => setConfirming(true)}>
                    <Trash2Icon />
                    Usuń
                </Button>
            }
        >
            <div className="grid max-w-3xl gap-8">
                <DetailList>
                    <DetailItem label="Imię i nazwisko">{message.name}</DetailItem>
                    <DetailItem label="E-mail">
                        <span className="inline-flex items-center gap-1">
                            <a href={`mailto:${message.email}`} className="underline-offset-4 hover:underline">
                                {message.email}
                            </a>
                            <CopyButton value={message.email} label="adres e-mail" />
                        </span>
                    </DetailItem>
                    <DetailItem label="Temat" empty="Brak tematu">
                        {message.subject}
                    </DetailItem>
                    <DetailItem label="Data wysłania">{message.createdAt}</DetailItem>
                </DetailList>

                <section className="grid gap-2">
                    <h2 className="text-sm text-muted-foreground">Treść wiadomości</h2>
                    <p className="rounded-md border p-4 text-sm leading-relaxed whitespace-pre-line">{message.message}</p>
                </section>

                <div>
                    <Button asChild variant="ghost">
                        <Link href={adminRoutes.messages.index}>Wróć do listy</Link>
                    </Button>
                </div>
            </div>

            <ConfirmDeleteDialog
                open={confirming}
                onOpenChange={setConfirming}
                title="Usunąć wiadomość?"
                description={`Wiadomość od ${message.name} zostanie usunięta. Tej operacji nie można cofnąć.`}
                processing={processing}
                onConfirm={() =>
                    router.delete(adminRoutes.messages.destroy(message.id), {
                        onStart: () => setProcessing(true),
                        onFinish: () => setProcessing(false),
                    })
                }
            />
        </AdminLayout>
    );
}
```

`resources/js/pages/admin/callbacks/index.tsx`: ta sama struktura co `messages/index.tsx`, ale: prop `callbacks: Paginated<AdminCallbackRow>`, trasy `adminRoutes.callbacks.*`, tytuł `Prośby o kontakt`, `searchLabel="Szukaj numeru"`, kolumny: checkbox, `<SortHeader column="phone" label="Numer telefonu" …>` (komórka: `<span className="inline-flex items-center gap-1"><a href={`tel:${callback.phone.replace(/\s+/g, '')}`} className="font-medium hover:underline">{callback.phone}</a><CopyButton value={callback.phone} label="numer telefonu" /></span>`), `<SortHeader column="created_at" label="Data zgłoszenia" …>`, akcje (tylko przycisk usuń), `colSpan={4}`, pusty stan „Brak próśb o kontakt do wyświetlenia.”, dialogi `Usunąć prośbę o kontakt?` / `Usunąć zaznaczone prośby o kontakt?`.

`resources/js/pages/admin/briefs/index.tsx`: struktura `messages/index.tsx`, ale: prop `briefs: Paginated<AdminBriefRow>`, `filters: BriefFilters`, `useListFilters<BriefFilters>(adminRoutes.briefs.index, filters)`, `hasActiveFilters` uwzględnia `budget`/`timeline`, `onReset={() => update({ search: '', from: '', until: '', budget: '', timeline: '' })}`. W `ListToolbar` jako `children` dwa selecty (wartość `'all'` oznacza brak filtra, bo Radix `Select` nie przyjmuje pustej wartości):

```tsx
<div className="grid gap-1.5">
    <Label htmlFor="brief-budget">Budżet</Label>
    <Select value={values.budget || 'all'} onValueChange={(value) => update({ budget: value === 'all' ? '' : value })}>
        <SelectTrigger id="brief-budget" className="w-44"><SelectValue /></SelectTrigger>
        <SelectContent>
            <SelectItem value="all">Wszystkie</SelectItem>
            {budgetOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
        </SelectContent>
    </Select>
</div>
```
(analogicznie „Termin” z `timelineOptions`; importy `budgetOptions`, `timelineOptions` z `@/components/home/brief/brief-options`). Kolumny: checkbox, `Nadawca` (sort `name`, link do `show`), `E-mail` (sort `email`), `Firma` (sort `company`, `company ?? '—'`), `Typ projektu` (`briefLabels('types', brief.types.slice(0, 2)) + (brief.types.length > 2 ? '…' : '')`, `'—'` gdy pusty), `Budżet` (sort `budget`, `<Badge variant="secondary">{briefLabel('budget', brief.budget)}</Badge>` lub `—`), `Termin` (sort `timeline`, `briefLabel('timeline', brief.timeline) ?? '—'`), `Data` (sort `created_at`), akcje; `colSpan={9}`; teksty „Brak briefów do wyświetlenia.”, `Usunąć brief?`, `Brief od {name} zostanie usunięty…`, `Usunąć zaznaczone briefy?`.

`resources/js/pages/admin/briefs/show.tsx`: nagłówek jak `messages/show.tsx` (breadcrumb „Briefy”, akcja Usuń, `router.delete(adminRoutes.briefs.destroy(brief.id))`). Treść w `Tabs` (`defaultValue="contact"`), cztery `TabsContent` z `DetailList`:
- `contact` („Dane kontaktowe”): Imię i nazwisko, E-mail (mailto + `CopyButton`), Telefon (`tel:` + `CopyButton`, `empty="Nie podano"`), Firma, Stanowisko, Strona WWW (`<a href={/^https?:/.test(w) ? w : `https://${w}`} target="_blank" rel="noopener noreferrer">`), Skąd o nas (`briefLabel('source', brief.source)`), Preferowany kontakt (`briefLabels('contact_pref', brief.contactPref)`), Data wysłania
- `project` („Projekt”): Typy projektu (`briefLabels('types', …)`, `empty="Nie wybrano"`), Funkcjonalności (`briefLabels('features', …)`, `empty="Nie wybrano"`), Branża, Grupa docelowa, Projekt graficzny, Termin realizacji
- `tech` („Technologia”): Technologie (`briefLabels('tech', …)`, `empty="Nie wybrano"`), Bezpieczeństwo, Hosting, Integracje (`brief.integrations`)
- `budget` („Budżet”): Budżet, Model współpracy (`briefLabel('cooperation_model', brief.cooperationModel)`), Dodatkowe uwagi (`className="sm:col-span-2"`, `empty="Brak uwag"`)
Wartości `null` z `briefLabel` trafiają do `DetailItem` jako `children` (komponent pokazuje `empty`).

- [ ] **Step 8: Testy, typy, build, commit**

Run: `php artisan test --compact tests/Feature/Admin`
Expected: PASS (wszystkie testy panelu).

Run: `npx tsc --noEmit && npm run build`
Expected: bez błędów.

```bash
vendor/bin/pint --dirty --format agent
git add -A
git commit -m "Add messages, briefs and callback requests to the admin panel" -m "Claude-Session: https://claude.ai/code/session_013ymSrGVKpfUzjAgpNZaxhz"
```

---

### Task 8: Dokumentacja projektu, weryfikacja i przegląd końcowy

**Files:**
- Modify: `CLAUDE.md`, `docs/superpowers/specs/2026-10-08-admin-shadcn-panel-design.md`

- [ ] **Step 1: Zaktualizuj `CLAUDE.md`**

Zmiany (poza blokiem `<laravel-boost-guidelines>`):
- „Project Overview”: panel `/admin` to Inertia + React + shadcn (zamiast „Filament 3 (Livewire 3)”).
- „Stack”: usuń linię Admin Panel: Filament 3 / Livewire; dodaj „Admin panel: Inertia + React + shadcn (`/admin`), przeciąganie `@dnd-kit`”.
- „Request flow” i „Middleware”: dopisz `routes/admin.php`, root view `admin.blade.php` (bez trackerów i SSR), `HandleInertiaRequests` (`rootView`, `$withoutSsr`, dane współdzielone panelu).
- „Directory Structure”: zamień `app/Filament/Resources/` na `app/Http/Controllers/Admin/` i `app/Http/Requests/Admin/`; dopisz `app/Services/ImageOptimizer.php`; dopisz `resources/js/pages/admin/`, `resources/js/components/admin/`, `resources/js/hooks/{use-selection,use-record-list,use-list-filters}.ts`, `resources/js/lib/admin-routes.ts`, `resources/js/types/admin.ts`.
- Usuń sekcję „Filament Customization” i wpisy `joshembling/image-optimizer` oraz Livewire z „Key Integrations”; dodaj `intervention/image` (konwersja do WebP).
- Dodaj krótką sekcję „Admin panel” (trasy `admin.*`, dostęp dla każdego użytkownika z tabeli `users`, `admin:create`, listy leadów filtrowane po stronie serwera, projekty/klienci z przeciąganiem, wartości briefu z `brief-options.ts`).

Następnie spróbuj odświeżyć blok Boost: `php artisan boost:update --no-interaction` (jeśli polecenie istnieje); sprawdź `git diff CLAUDE.md`: ma się zmienić tylko blok `<laravel-boost-guidelines>` (znikają Filament/Livewire). Jeśli polecenie zmienia coś poza blokiem albo nie istnieje, usuń ręcznie sekcje `filament/filament rules`, `livewire/core rules`, `livewire/v3 rules` oraz wpisy `filament/filament` i `livewire/livewire` z listy pakietów w tym bloku.

- [ ] **Step 2: Uzgodnij spec z zaimplementowanym kształtem**

W `docs/superpowers/specs/2026-10-08-admin-shadcn-panel-design.md`:
- „Form Requesty”: jeden `SaveProjectRequest` i jeden `SaveClientRequest` (zapis i edycja), `DestroyManyRequest`, `ReorderRequest`, `LeadIndexRequest`, `BriefIndexRequest`, `LoginRequest`.
- „Kontrolery”: kolejność (`reorder`) i `destroyMany` są metodami kontrolerów `ProjectController` i `ClientController` (wspólna logika w trait `ReordersRecords`), a nie osobnymi kontrolerami.
- „Brief”: `brief-options.ts` zawiera wszystkie grupy, więc osobna mapa etykiet niepotrzebna; zostaje tylko `brief-labels.ts` z helperami.
- „Testy”: `ProjectImageUploadTest` testuje `ImageOptimizer` (oba scenariusze zachowane), a upload przez HTTP pokrywa `tests/Feature/Admin/ProjectTest.php`.

- [ ] **Step 3: Pełna weryfikacja automatyczna**

```bash
vendor/bin/pint --format agent
php artisan test --compact
npx tsc --noEmit
npm run build
```
Expected: Pint bez zmian po ponownym przebiegu, wszystkie testy PASS, `tsc` bez błędów, build klienta i SSR OK.

- [ ] **Step 4: Weryfikacja w przeglądarce (Herd, `https://netizo.agency.test/admin`)**

Przygotowanie: `ls public/hot` nie może istnieć (inaczej `@vite` celuje w serwer dev); build jest już w `public/build`. Utwórz tymczasowe konto: `php artisan admin:create --name="Weryfikacja" --email="weryfikacja@netizo.test" --password="weryfikacja-123"`. Do testu przeciągania utwórz dwóch tymczasowych klientów (`Client::factory()` w tinkerze lub przez formularz) o nazwach zaczynających się od `ZZ test`.

Sprawdź przez narzędzia przeglądarki (Playwright MCP lub Chrome MCP), zbierając wiadomości konsoli:
1. `/admin` bez sesji → przekierowanie na `/admin/login`; strona logowania bez błędów CSP/Trusted Types w konsoli, `<meta name="robots" content="noindex, nofollow">`, brak skryptów GTM/Clarity (zakładka Network).
2. Błędne hasło → komunikat pod polem e-mail; poprawne logowanie → lista projektów.
3. Sidebar: zwijanie do ikon i rozwijanie (cookie `sidebar_state` ustawione, po przeładowaniu stan zachowany), widok mobilny (≈390 px: sidebar jako panel boczny), motyw jasny i ciemny z menu użytkownika (bez migotania po przeładowaniu).
4. Projekty: lista, wyszukiwanie, filtr statusu, zaznaczanie i dialog usuwania (anuluj), utworzenie projektu z dwoma obrazami (podgląd, tagi Enter/przecinek, metryki, przeciąganie wyzwań, automatyczny slug z „Łódź” → `lodz`), błąd walidacji przenosi na właściwą zakładkę, edycja z podmianą i usunięciem obrazu, usunięcie projektu. Po zapisaniu strona główna `https://netizo.agency.test/` pokazuje projekt.
5. Klienci: przeciągnięcie jednego z `ZZ test` nad drugim myszą i klawiaturą (spacja, strzałki, spacja) zapisuje kolejność po przeładowaniu; z aktywnym wyszukiwaniem uchwyty są wyłączone.
6. Wiadomości/briefy/prośby: pobierz dane do testu z bazy deweloperskiej albo dodaj rekordy z formularzy strony głównej; filtry (szukaj, daty, budżet/termin), sortowanie nagłówków, paginacja (jeśli >25), widok szczegółów briefu w zakładkach z etykietami, kopiowanie, usuwanie zbiorcze.
7. Konsola: brak błędów JS i naruszeń CSP/Trusted Types na żadnej z odwiedzonych stron.

Sprzątanie: usuń tymczasowych klientów i projekty testowe oraz konto `weryfikacja@netizo.test` (`User::where('email', 'weryfikacja@netizo.test')->delete()`), usuń pliki testowych obrazów z `storage/app/public/projects`, które powstały podczas weryfikacji (tylko te utworzone teraz). Nie zmieniaj istniejących danych deweloperskich.

Wyniki (co działa, czego nie sprawdzono) zanotuj do podsumowania końcowego. Błędy znalezione w przeglądarce napraw w osobnym commicie `Fix …` z testem tam, gdzie to możliwe.

- [ ] **Step 5: Przegląd końcowy gałęzi**

Uruchom agenta `code-reviewer` na całej gałęzi (`git diff main...admin-shadcn-panel`) z poleceniem: oceń zgodność ze specem `docs/superpowers/specs/2026-10-08-admin-shadcn-panel-design.md`, szukaj błędów poprawności, luk bezpieczeństwa (autoryzacja tras admina, mass assignment, upload plików, ścieżki obrazów, CSP), regresji strony głównej i niespójności typów PHP/TS. Wprowadź poprawki dla potwierdzonych ustaleń, ponów testy i `tsc`.

- [ ] **Step 6: Commit**

```bash
vendor/bin/pint --dirty --format agent
git add -A
git commit -m "Document the new admin panel and align the spec with the implementation" -m "Claude-Session: https://claude.ai/code/session_013ymSrGVKpfUzjAgpNZaxhz"
```

---

## Self-review planu względem specu

- **Zakres zasobów:** Projekty (Zad. 6), Klienci (Zad. 5), Wiadomości/Briefy/Prośby (Zad. 7), logowanie (Zad. 4), obrazy (Zad. 1). Usuwanie bulk, kolejność, filtry: Zad. 5–7.
- **Backend ze specu:** routing i logowanie (Zad. 4), kontrolery i Form Requesty (Zad. 5–7), `ImageOptimizer` (Zad. 1), współdzielone dane Inertia i root view (Zad. 4), CSP (Zad. 2 i test w Zad. 4).
- **Frontend ze specu:** powłoka, sidebar, tokeny (Zad. 3), strony i komponenty (Zad. 3, 5, 6, 7), brak SSR (Zad. 4), brief (Zad. 7).
- **Usuwanie Filament/Livewire:** Zad. 2; `CLAUDE.md` Zad. 8.
- **Testy:** każdy wycinek ma własne testy; przepisane `ProjectImageUploadTest`, `CreateAdminUserTest`, `SecurityHeadersTest`; weryfikacja frontendu: tsc, build, przeglądarka (Zad. 8).
- **Odchylenia od specu (uzgodnione w Zad. 8, Step 2):** jeden `Save*Request` zamiast `Store*`/`Update*`; `reorder`/`destroyMany` jako metody kontrolerów z trait; brak osobnej mapy etykiet briefu.
