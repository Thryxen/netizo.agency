# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Netizo (netizo.pl) is a Polish web agency website built with Laravel 12. The public homepage is a single-page Inertia v3 + React 19 + TypeScript app (shadcn/ui, server-side rendered). The admin panel at `/admin` is an Inertia + React + shadcn app (client-rendered, behind a login) for managing projects, clients and the leads collected by the homepage forms.

## Commands

### Development
```bash
composer dev          # Server, queue, pail (logs) and Vite dev server (HMR, Inertia SSR via the Vite plugin)
composer dev:ssr      # Production build, then server, queue, pail and the Node SSR server
```
The site is served by Laravel Herd at https://netizo.agency.test, so `php artisan serve` is not needed.

### Build & Assets
```bash
npm run build         # Client bundle (public/build) + SSR bundle (bootstrap/ssr/ssr.js)
npm run dev           # Vite dev server with HMR
npm run types         # TypeScript check (tsc --noEmit)
php artisan inertia:start-ssr   # Run the SSR server for the built bundle (stop: inertia:stop-ssr)
```
Without a running SSR server, Inertia falls back to client-side rendering.

### Testing
```bash
composer test         # Runs Pest tests (clears config first)
./vendor/bin/pest     # Direct Pest execution
```

### Code Quality
```bash
./vendor/bin/pint     # Laravel Pint code style fixer
npx tsc --noEmit      # Type-check the React/TypeScript frontend
```

### Database
```bash
php artisan migrate   # Run migrations (uses SQLite in database/database.sqlite)
```

## Architecture

### Stack
- **Backend**: Laravel 12, PHP 8.2+ (8.4 locally)
- **Homepage**: Inertia v3 (`inertiajs/inertia-laravel`, `@inertiajs/react`), React 19, TypeScript, SSR on
- **UI**: shadcn/ui (new-york, neutral, CSS variables) on Radix (`radix-ui`), `lucide-react` icons, Tailwind CSS 4, `tw-animate-css`
- **Fonts**: self-hosted Geist / Geist Mono (`@fontsource-variable/*`); no Google Fonts on the homepage
- **Motion**: `motion` (motion.dev), used only for `MotionConfig` and scroll-linked values (`useScroll` + `useTransform`); entrances are CSS/canvas primitives in `components/motion/`
- **Admin Panel**: Inertia + React + shadcn `Sidebar` layout at `/admin` (no Filament, no Livewire); drag-and-drop ordering with `@dnd-kit/*`; images converted to WebP by `intervention/image` 2.7
- **Build**: Vite 7 (`vite.config.ts`, `laravel-vite-plugin`, `@inertiajs/vite`, `@vitejs/plugin-react`)
- **Database**: SQLite (development)
- **Testing**: Pest 4

### Request flow
- `GET /` → `HomeController@index` sets the SEOTools meta and returns `Inertia::render('home', ['projects', 'clients', 'faq'])`. FAQ items have one source (`HomeController::faq()`) used for both the prop and the FAQ JSON-LD passed to the root view as `faqSchema` (built by `Controller::faqSchema()`).
- `GET /partnerzy` → `PartnerProgramController@index` (route `partners`): the partner programme page (15% net of every paid invoice of a referred client for 12 months, payout within 14 days), `Inertia::render('partners', ['faq'])` with its own SEO meta, WebPage JSON-LD and FAQ JSON-LD (`PartnerProgramController::faq()`). A separate page with its own header (`PartnerHeader`); linked from the home page's "Poleć nas i zyskaj 15%" band (`components/home/partner-cta-section.tsx`, between FAQ and Newsletter), the footer and the mobile menu (`infoLinks` in `lib/site.ts`).
- Root view `resources/views/app.blade.php`: Trusted Types default policy, gtag, theme-before-paint script, `SEO::generate()`, FAQ JSON-LD, favicons, `@vite`, `@inertiaHead`, `@cookieconsentscripts`; body has the GTM noscript, `@inertia`, then `@cookieconsentview` and Microsoft Clarity outside the Inertia root.
- Middleware (`bootstrap/app.php`, web group): `HandleAppearance` (reads the `appearance` cookie: light/dark/system; the cookie is not encrypted), `HandleInertiaRequests`, `AddLinkHeadersForPreloadedAssets`, `SecurityHeaders` (CSP with Trusted Types; adds the Vite dev origin only while `public/hot` exists). `HandleInertiaRequests` also picks the root view (`admin` for `/admin*`, `app` otherwise), skips SSR for `/admin*` (`$withoutSsr`) and shares `auth`, `sidebarOpen` (cookie `sidebar_state`, not encrypted) and `flash.success` on admin requests only.

### Admin panel (`/admin`)
- Routes in `routes/admin.php` (loaded by `bootstrap/app.php` through `then:`), names `admin.*`; `/admin` redirects to the project list. Guests go to `admin.login`; every user in the `users` table may log in (create one with `php artisan admin:create`). Login is limited to 5 failed attempts per email + IP.
- Root view `resources/views/admin.blade.php`: theme-before-paint script, Trusted Types policy, `noindex`, no GTM/Clarity/cookie banner.
- Partner applications (`/admin/partners`, `Admin\PartnerApplicationController`): list, details and delete like the other leads.
- Projects and clients: whole list loaded, client-side search and status filter, drag-and-drop order saved through `POST /admin/{projects,clients}/reorder` (`ReordersRecords` trait), bulk delete through `DELETE /admin/{resource}` with `ids[]`. Messages, briefs and callback requests: server-side lists (25 per page) filtered through the query string (`LeadIndexRequest` / `BriefIndexRequest` ignore anything outside the allowed sort columns and dates).
- Project images go through `App\Services\ImageOptimizer` (WebP, 1600 px thumbnail / 1920 px full image, ULID names on the `public` disk); replacing or removing an image deletes the old file. `challenges` / `solutions` are stored as `[['challenge' => …]]` / `[['solution' => …]]` and read back from plain strings too.
- Brief labels in the panel come from `resources/js/components/home/brief/brief-options.ts` (`components/admin/brief-labels.ts`).

### Form endpoints
All in `routes/web.php` inside a `throttle:forms` group (10 req/min per IP, defined in `AppServiceProvider`; when exceeded it redirects back with an `errors.form` message instead of a 429 page). Each controller validates with a Form Request, saves the model, calls `DiscordWebhookService` where noted, and returns `back()`.

| Method/URI | Route name | Controller | Form Request | Model | Webhook |
|---|---|---|---|---|---|
| POST /kontakt | contact-messages.store | ContactMessageController | StoreContactMessageRequest | ContactMessage | sendContactMessage |
| POST /brief | project-briefs.store | ProjectBriefController | StoreProjectBriefRequest | ProjectBrief | sendBrief |
| POST /oddzwonimy | callback-requests.store | CallbackRequestController | StoreCallbackRequestRequest | CallbackRequest | sendCallbackRequest |
| POST /newsletter | newsletter-subscriptions.store | NewsletterSubscriptionController | StoreNewsletterSubscriptionRequest | NewsletterSubscriber | none |
| POST /partnerzy | partner-applications.store | PartnerApplicationController | StorePartnerApplicationRequest | PartnerApplication | sendPartnerApplication |

Brief option values live as constants on `StoreProjectBriefRequest` (and `StoreContactMessageRequest::SUBJECTS`); `resources/js/components/home/brief/brief-options.ts` must use the same values. Partner types: `StorePartnerApplicationRequest::PARTNER_TYPES` = `components/partners/partner-options.ts` (a test checks they match). The partner webhook is `DISCORD_WEBHOOK_PARTNER`, falling back to `DISCORD_WEBHOOK_CONTACT`. The frontend URLs are in `resources/js/lib/endpoints.ts` and forms post with Inertia `useForm`.

### Directory Structure

**app/Http/Controllers/Admin/** and **app/Http/Requests/Admin/** - Admin panel backend:
- `ProjectController`, `ClientController` - CRUD, reorder, bulk delete (`SaveProjectRequest`, `SaveClientRequest`, `ReorderRequest`, `DestroyManyRequest`)
- `ContactMessageController`, `ProjectBriefController`, `CallbackRequestController`, `PartnerApplicationController` - Lead lists, details, delete (`LeadIndexRequest`, `BriefIndexRequest`)
- `Auth/LoginController` + `LoginRequest` - Panel login

**app/Http/** - Homepage backend:
- `Controllers/HomeController.php` - Page props, SEO, FAQ; `Controllers/PartnerProgramController.php` - partner programme page
- `Controllers/{ContactMessage,ProjectBrief,CallbackRequest,NewsletterSubscription,PartnerApplication}Controller.php` + `Requests/Store*Request.php` - Form endpoints
- `Middleware/HandleInertiaRequests.php`, `HandleAppearance.php`, `SecurityHeaders.php`

**app/Models/** - Eloquent models:
- `Project`, `Client` - Content entities
- `ContactMessage`, `CallbackRequest`, `ProjectBrief`, `NewsletterSubscriber`, `PartnerApplication` - Lead capture

**app/Services/** - `DiscordWebhookService.php` (Discord notifications for new leads), `ImageOptimizer.php` (WebP conversion of uploaded images)

**resources/js/** - Inertia React app:
- `app.tsx` (client entry), `ssr.tsx` (SSR entry); both resolve pages through `lib/pages.ts`
- `pages/home.tsx` - Page assembly (`HomeUiProvider`, header, sections, footer, callback FAB and dialog, skip link)
- `components/home/` - Homepage sections and shared primitives: `section.tsx` (`Section`, `SectionHeading` (heading reveal built in), `Container`, `Rivet`, gutter/bleed class helpers), `photo.tsx` (`Photo`: a photo in a clipping frame, lazy `<img>`), `logo.tsx` (netizo `Logo`/`LogoMark`), `theme-toggle.tsx`, `tech-tag.tsx`, `external-link.tsx`, `home-ui-context.tsx` (`useHomeUi()`: callback dialog state, contact tab, `openContact()`), one file per section, `bento/` (services bento: one file per live tile, `bento-tile.tsx` shell, scoped `bento-styles.tsx`), `brief/` (6-step brief wizard, options, form field helpers)
- `components/motion/` - Motion primitives, import from `@/components/motion`: `Reveal`, `SplitLines` (hero H1), `CountUp`, `Marquee`, `Spotlight`/`useSpotlight`, `useLiveLoop`/`useInViewLoop` (in-view gated loops), `useMotionStyle` (bind `useScroll`/`useTransform` values to a plain element), `MotionRoot` (wraps the page). Don't use `motion.*`/`m.*`/`animate()` (they pull in the animation engine, ~+27 KB gz); gate scroll-linked styles with `useReducedMotionPreference()`.
- `components/ui/` - shadcn components (add new ones with `npx shadcn add`, answer "no" to overwriting existing ones, then check the generated `cn` import points at `@/lib/utils`, not the `cn` npm package, and that sidebar tokens stay monochrome)
- `pages/partners.tsx` + `components/partners/` - Partner programme page: `partner-data.ts` (terms, steps, calculator presets, copy), `partner-header`, `partner-hero` + `referral-scene` (live loop over the `partner-referral` photo: order with the partner's code → its 15% slice fills → payout notification), `steps-section` (scroll-drawn rail: `useScroll` → `--rail`), `commission-calculator` (firms as columns with a 15% cap, tweened total), `audience-section`, `rules-section`, `partner-faq-section`, `join-section` (partner card mirroring the typed name) + `partner-application-form`, `partner-options.ts`, `commission-bar` (the 85/15 split bar, shared with the home page band)
- `pages/admin/` + `components/admin/` - Admin panel: `AdminLayout` (sidebar, breadcrumb, flash notice), forms (`project-form`, `client-form`, `image-field`, `tags-input`, `repeater-list`), lists (`list-toolbar`, `sort-header`, `pagination`, `bulk-bar`, `sortable`, `record-toolbar`), `detail`, `brief-labels`; hooks `use-selection`, `use-record-list`, `use-list-filters`; URLs in `lib/admin-routes.ts`; types in `types/admin.ts`
- `hooks/use-appearance.tsx` - Light/dark/system theme (cookie + localStorage)
- `lib/` - `utils.ts` (`cn`), `endpoints.ts`, `pages.ts`, `photos.ts` (`photo(name)` → `src`/`srcSet`/size for the photo series), `site.ts`, `in-page-navigation.ts`
- `types/home.ts` - Page prop types (`Project`, `Client`, `FaqItem`, `HomePageProps`)

**resources/css/app.css** - Tailwind 4 entry: shadcn tokens on `:root` / `.dark`, fonts, base styles, `ease-expo-out`, motion primitive states/keyframes (gated by `html.js`), `mask-fade-x`

**resources/views/** - Blade templates:
- `app.blade.php` - Inertia root view of the public site; `admin.blade.php` - root view of the admin panel
- `vendor/cookie-consent/` - Cookie banner, styled with the site tokens
- `errors/` - Custom error pages (403, 404, 419, 429, 500, 503), self-contained

**public/assets/images/photos/** - Generated photo series (WebP, `{name}.webp` at native width + `{name}-768.webp`): `hero-studio`, `bento-mobile`, `bento-ecommerce`, `mission-workshop`, `process-{discovery,design,development,launch}`, `contact-desk`, `partner-referral` (partner page hero), `partner-question` (partner FAQ chat scene, the home `FaqScene` with its own photo and lines). Reference them through `photo()` in `lib/photos.ts`.

**public/assets/images/illustrations/** - Light/dark WebP project placeholder (shown when a project has no screenshot)

**public/assets/images/og-netizo-2.png** - 1200×630 share image (`og:image`, `twitter:image`, JSON-LD), generated from `netizo/og-image/szablon.html` by `netizo/og-image/generuj.cjs` (`npx -y -p playwright@1.58.0 node netizo/og-image/generuj.cjs`; logo, sygnet and fonts are shared with `netizo/wizytowki/`). Keep it under 300 KB (WhatsApp). When the design changes, use a new file name (it busts the Facebook/Discord/Cloudflare preview caches) and update `HomeController`, `config/seotools.php` and `HomePageTest`.

**public/assets/images/og-netizo-partnerzy.png** - Share image of `/partnerzy`, generated by the same script from `netizo/og-image/szablon-partnerzy.html` (same frame, split like the partner hero: the hero headline on the left, the 18 000 zł → 2 700 zł worked example with the 85/15 bar on the right; figures must match `partner-data.ts`). Used by `PartnerProgramController`, checked in `PartnerProgramPageTest`.

### Frontend Patterns
- Monochrome shadcn neutral look with no accent colour (no yellow anywhere, error pages included); colour comes only from photos and project screenshots.
- Rails and rivets mark the structure; grids use shared borders, not floating shadowed cards. No pixel/"bit" motifs (the old Voxbit brand): no square markers, no pixel font, photos are plain images.
- Sentence case Polish copy; no eyebrow labels, no arrows appended to button text.
- Motion: heading reveals (`SectionHeading` only, never on cards), hero load sequence, counters, client marquee, live bento tiles, scroll-linked parallax and process rail. Animate transform/opacity only. Every effect needs a complete static state: the inline head script adds `js` to `<html>` and hidden entrance states are styled only under `.js` + `prefers-reduced-motion: no-preference`, so SSR/no-JS and reduced motion show the finished page.
- Section anchors: `#uslugi`, `#projekty`, `#misja`, `#klienci`, `#proces`, `#faq`, `#newsletter`, `#kontakt`.
- Components must stay SSR-safe: no `window`/`document` access during render.

### Key Integrations
- **artesaos/seotools** - SEO meta tags management (config in `config/seotools.php`)
- **intervention/image** (2.7) - WebP conversion and resizing of uploaded project images (`ImageOptimizer`)
- **@dnd-kit/core, sortable, utilities** - Drag-and-drop ordering in the admin panel
- **whitecube/laravel-cookie-consent** - GDPR cookie consent
- **laravel-lang** - Multi-language support (Polish primary)

===

<laravel-boost-guidelines>
=== foundation rules ===

# Laravel Boost Guidelines

The Laravel Boost guidelines are specifically curated by Laravel maintainers for this application. These guidelines should be followed closely to enhance the user's satisfaction building Laravel applications.

## Foundational Context
This application is a Laravel application and its main Laravel ecosystems package & versions are below. You are an expert with them all. Ensure you abide by these specific packages & versions.

- php - 8.4.22
- laravel/framework (LARAVEL) - v12
- laravel/prompts (PROMPTS) - v0
- laravel/mcp (MCP) - v0
- laravel/pint (PINT) - v1
- laravel/sail (SAIL) - v1
- pestphp/pest (PEST) - v4
- phpunit/phpunit (PHPUNIT) - v12
- tailwindcss (TAILWINDCSS) - v4

## Conventions
- You must follow all existing code conventions used in this application. When creating or editing a file, check sibling files for the correct structure, approach, and naming.
- Use descriptive names for variables and methods. For example, `isRegisteredForDiscounts`, not `discount()`.
- Check for existing components to reuse before writing a new one.

## Verification Scripts
- Do not create verification scripts or tinker when tests cover that functionality and prove it works. Unit and feature tests are more important.

## Application Structure & Architecture
- Stick to existing directory structure; don't create new base folders without approval.
- Do not change the application's dependencies without approval.

## Frontend Bundling
- If the user doesn't see a frontend change reflected in the UI, it could mean they need to run `npm run build`, `npm run dev`, or `composer run dev`. Ask them.

## Replies
- Be concise in your explanations - focus on what's important rather than explaining obvious details.

## Documentation Files
- You must only create documentation files if explicitly requested by the user.

=== boost rules ===

## Laravel Boost
- Laravel Boost is an MCP server that comes with powerful tools designed specifically for this application. Use them.

## Artisan
- Use the `list-artisan-commands` tool when you need to call an Artisan command to double-check the available parameters.

## URLs
- Whenever you share a project URL with the user, you should use the `get-absolute-url` tool to ensure you're using the correct scheme, domain/IP, and port.

## Tinker / Debugging
- You should use the `tinker` tool when you need to execute PHP to debug code or query Eloquent models directly.
- Use the `database-query` tool when you only need to read from the database.

## Reading Browser Logs With the `browser-logs` Tool
- You can read browser logs, errors, and exceptions using the `browser-logs` tool from Boost.
- Only recent browser logs will be useful - ignore old logs.

## Searching Documentation (Critically Important)
- Boost comes with a powerful `search-docs` tool you should use before any other approaches when dealing with Laravel or Laravel ecosystem packages. This tool automatically passes a list of installed packages and their versions to the remote Boost API, so it returns only version-specific documentation for the user's circumstance. You should pass an array of packages to filter on if you know you need docs for particular packages.
- The `search-docs` tool is perfect for all Laravel-related packages, including Laravel, Inertia, Livewire, Filament, Tailwind, Pest, Nova, Nightwatch, etc.
- You must use this tool to search for Laravel ecosystem documentation before falling back to other approaches.
- Search the documentation before making code changes to ensure we are taking the correct approach.
- Use multiple, broad, simple, topic-based queries to start. For example: `['rate limiting', 'routing rate limiting', 'routing']`.
- Do not add package names to queries; package information is already shared. For example, use `test resource table`, not `filament 4 test resource table`.

### Available Search Syntax
- You can and should pass multiple queries at once. The most relevant results will be returned first.

1. Simple Word Searches with auto-stemming - query=authentication - finds 'authenticate' and 'auth'.
2. Multiple Words (AND Logic) - query=rate limit - finds knowledge containing both "rate" AND "limit".
3. Quoted Phrases (Exact Position) - query="infinite scroll" - words must be adjacent and in that order.
4. Mixed Queries - query=middleware "rate limit" - "middleware" AND exact phrase "rate limit".
5. Multiple Queries - queries=["authentication", "middleware"] - ANY of these terms.

=== php rules ===

## PHP

- Always use curly braces for control structures, even if it has one line.

### Constructors
- Use PHP 8 constructor property promotion in `__construct()`.
    - <code-snippet>public function __construct(public GitHub $github) { }</code-snippet>
- Do not allow empty `__construct()` methods with zero parameters unless the constructor is private.

### Type Declarations
- Always use explicit return type declarations for methods and functions.
- Use appropriate PHP type hints for method parameters.

<code-snippet name="Explicit Return Types and Method Params" lang="php">
protected function isAccessible(User $user, ?string $path = null): bool
{
    ...
}
</code-snippet>

## Comments
- Prefer PHPDoc blocks over inline comments. Never use comments within the code itself unless there is something very complex going on.

## PHPDoc Blocks
- Add useful array shape type definitions for arrays when appropriate.

## Enums
- Typically, keys in an Enum should be TitleCase. For example: `FavoritePerson`, `BestLake`, `Monthly`.

=== herd rules ===

## Laravel Herd

- The application is served by Laravel Herd and will be available at: `https?://[kebab-case-project-dir].test`. Use the `get-absolute-url` tool to generate URLs for the user to ensure valid URLs.
- You must not run any commands to make the site available via HTTP(S). It is always available through Laravel Herd.

=== laravel/core rules ===

## Do Things the Laravel Way

- Use `php artisan make:` commands to create new files (i.e. migrations, controllers, models, etc.). You can list available Artisan commands using the `list-artisan-commands` tool.
- If you're creating a generic PHP class, use `php artisan make:class`.
- Pass `--no-interaction` to all Artisan commands to ensure they work without user input. You should also pass the correct `--options` to ensure correct behavior.

### Database
- Always use proper Eloquent relationship methods with return type hints. Prefer relationship methods over raw queries or manual joins.
- Use Eloquent models and relationships before suggesting raw database queries.
- Avoid `DB::`; prefer `Model::query()`. Generate code that leverages Laravel's ORM capabilities rather than bypassing them.
- Generate code that prevents N+1 query problems by using eager loading.
- Use Laravel's query builder for very complex database operations.

### Model Creation
- When creating new models, create useful factories and seeders for them too. Ask the user if they need any other things, using `list-artisan-commands` to check the available options to `php artisan make:model`.

### APIs & Eloquent Resources
- For APIs, default to using Eloquent API Resources and API versioning unless existing API routes do not, then you should follow existing application convention.

### Controllers & Validation
- Always create Form Request classes for validation rather than inline validation in controllers. Include both validation rules and custom error messages.
- Check sibling Form Requests to see if the application uses array or string based validation rules.

### Queues
- Use queued jobs for time-consuming operations with the `ShouldQueue` interface.

### Authentication & Authorization
- Use Laravel's built-in authentication and authorization features (gates, policies, Sanctum, etc.).

### URL Generation
- When generating links to other pages, prefer named routes and the `route()` function.

### Configuration
- Use environment variables only in configuration files - never use the `env()` function directly outside of config files. Always use `config('app.name')`, not `env('APP_NAME')`.

### Testing
- When creating models for tests, use the factories for the models. Check if the factory has custom states that can be used before manually setting up the model.
- Faker: Use methods such as `$this->faker->word()` or `fake()->randomDigit()`. Follow existing conventions whether to use `$this->faker` or `fake()`.
- When creating tests, make use of `php artisan make:test [options] {name}` to create a feature test, and pass `--unit` to create a unit test. Most tests should be feature tests.

### Vite Error
- If you receive an "Illuminate\Foundation\ViteException: Unable to locate file in Vite manifest" error, you can run `npm run build` or ask the user to run `npm run dev` or `composer run dev`.

=== laravel/v12 rules ===

## Laravel 12

- Use the `search-docs` tool to get version-specific documentation.
- Since Laravel 11, Laravel has a new streamlined file structure which this project uses.

### Laravel 12 Structure
- In Laravel 12, middleware are no longer registered in `app/Http/Kernel.php`.
- Middleware are configured declaratively in `bootstrap/app.php` using `Application::configure()->withMiddleware()`.
- `bootstrap/app.php` is the file to register middleware, exceptions, and routing files.
- `bootstrap/providers.php` contains application specific service providers.
- The `app\Console\Kernel.php` file no longer exists; use `bootstrap/app.php` or `routes/console.php` for console configuration.
- Console commands in `app/Console/Commands/` are automatically available and do not require manual registration.

### Database
- When modifying a column, the migration must include all of the attributes that were previously defined on the column. Otherwise, they will be dropped and lost.
- Laravel 12 allows limiting eagerly loaded records natively, without external packages: `$query->latest()->limit(10);`.

### Models
- Casts can and likely should be set in a `casts()` method on a model rather than the `$casts` property. Follow existing conventions from other models.

=== pint/core rules ===

## Laravel Pint Code Formatter

- You must run `vendor/bin/pint --dirty --format agent` before finalizing changes to ensure your code matches the project's expected style.
- Do not run `vendor/bin/pint --test --format agent`, simply run `vendor/bin/pint --format agent` to fix any formatting issues.

=== pest/core rules ===

## Pest
### Testing
- If you need to verify a feature is working, write or update a Unit / Feature test.

### Pest Tests
- All tests must be written using Pest. Use `php artisan make:test --pest {name}`.
- You must not remove any tests or test files from the tests directory without approval. These are not temporary or helper files - these are core to the application.
- Tests should test all of the happy paths, failure paths, and weird paths.
- Tests live in the `tests/Feature` and `tests/Unit` directories.
- Pest tests look and behave like this:
<code-snippet name="Basic Pest Test Example" lang="php">
it('is true', function () {
    expect(true)->toBeTrue();
});
</code-snippet>

### Running Tests
- Run the minimal number of tests using an appropriate filter before finalizing code edits.
- To run all tests: `php artisan test --compact`.
- To run all tests in a file: `php artisan test --compact tests/Feature/ExampleTest.php`.
- To filter on a particular test name: `php artisan test --compact --filter=testName` (recommended after making a change to a related file).
- When the tests relating to your changes are passing, ask the user if they would like to run the entire test suite to ensure everything is still passing.

### Pest Assertions
- When asserting status codes on a response, use the specific method like `assertForbidden` and `assertNotFound` instead of using `assertStatus(403)` or similar, e.g.:
<code-snippet name="Pest Example Asserting postJson Response" lang="php">
it('returns all', function () {
    $response = $this->postJson('/api/docs', []);

    $response->assertSuccessful();
});
</code-snippet>

### Mocking
- Mocking can be very helpful when appropriate.
- When mocking, you can use the `Pest\Laravel\mock` Pest function, but always import it via `use function Pest\Laravel\mock;` before using it. Alternatively, you can use `$this->mock()` if existing tests do.
- You can also create partial mocks using the same import or self method.

### Datasets
- Use datasets in Pest to simplify tests that have a lot of duplicated data. This is often the case when testing validation rules, so consider this solution when writing tests for validation rules.

<code-snippet name="Pest Dataset Example" lang="php">
it('has emails', function (string $email) {
    expect($email)->not->toBeEmpty();
})->with([
    'james' => 'james@laravel.com',
    'taylor' => 'taylor@laravel.com',
]);
</code-snippet>

=== pest/v4 rules ===

## Pest 4

- Pest 4 is a huge upgrade to Pest and offers: browser testing, smoke testing, visual regression testing, test sharding, and faster type coverage.
- Browser testing is incredibly powerful and useful for this project.
- Browser tests should live in `tests/Browser/`.
- Use the `search-docs` tool for detailed guidance on utilizing these features.

### Browser Testing
- You can use Laravel features like `Event::fake()`, `assertAuthenticated()`, and model factories within Pest 4 browser tests, as well as `RefreshDatabase` (when needed) to ensure a clean state for each test.
- Interact with the page (click, type, scroll, select, submit, drag-and-drop, touch gestures, etc.) when appropriate to complete the test.
- If requested, test on multiple browsers (Chrome, Firefox, Safari).
- If requested, test on different devices and viewports (like iPhone 14 Pro, tablets, or custom breakpoints).
- Switch color schemes (light/dark mode) when appropriate.
- Take screenshots or pause tests for debugging when appropriate.

### Example Tests

<code-snippet name="Pest Browser Test Example" lang="php">
it('may reset the password', function () {
    Notification::fake();

    $this->actingAs(User::factory()->create());

    $page = visit('/sign-in'); // Visit on a real browser...

    $page->assertSee('Sign In')
        ->assertNoJavascriptErrors() // or ->assertNoConsoleLogs()
        ->click('Forgot Password?')
        ->fill('email', 'nuno@laravel.com')
        ->click('Send Reset Link')
        ->assertSee('We have emailed your password reset link!')

    Notification::assertSent(ResetPassword::class);
});
</code-snippet>

<code-snippet name="Pest Smoke Testing Example" lang="php">
$pages = visit(['/', '/about', '/contact']);

$pages->assertNoJavascriptErrors()->assertNoConsoleLogs();
</code-snippet>

=== tailwindcss/core rules ===

## Tailwind CSS

- Use Tailwind CSS classes to style HTML; check and use existing Tailwind conventions within the project before writing your own.
- Offer to extract repeated patterns into components that match the project's conventions (i.e. Blade, JSX, Vue, etc.).
- Think through class placement, order, priority, and defaults. Remove redundant classes, add classes to parent or child carefully to limit repetition, and group elements logically.
- You can use the `search-docs` tool to get exact examples from the official documentation when needed.

### Spacing
- When listing items, use gap utilities for spacing; don't use margins.

<code-snippet name="Valid Flex Gap Spacing Example" lang="html">
    <div class="flex gap-8">
        <div>Superior</div>
        <div>Michigan</div>
        <div>Erie</div>
    </div>
</code-snippet>

### Dark Mode
- If existing pages and components support dark mode, new pages and components must support dark mode in a similar way, typically using `dark:`.

=== tailwindcss/v4 rules ===

## Tailwind CSS 4

- Always use Tailwind CSS v4; do not use the deprecated utilities.
- `corePlugins` is not supported in Tailwind v4.
- In Tailwind v4, configuration is CSS-first using the `@theme` directive — no separate `tailwind.config.js` file is needed.

<code-snippet name="Extending Theme in CSS" lang="css">
@theme {
  --color-brand: oklch(0.72 0.11 178);
}
</code-snippet>

- In Tailwind v4, you import Tailwind using a regular CSS `@import` statement, not using the `@tailwind` directives used in v3:

<code-snippet name="Tailwind v4 Import Tailwind Diff" lang="diff">
   - @tailwind base;
   - @tailwind components;
   - @tailwind utilities;
   + @import "tailwindcss";
</code-snippet>

### Replaced Utilities
- Tailwind v4 removed deprecated utilities. Do not use the deprecated option; use the replacement.
- Opacity values are still numeric.

| Deprecated |	Replacement |
|------------+--------------|
| bg-opacity-* | bg-black/* |
| text-opacity-* | text-black/* |
| border-opacity-* | border-black/* |
| divide-opacity-* | divide-black/* |
| ring-opacity-* | ring-black/* |
| placeholder-opacity-* | placeholder-black/* |
| flex-shrink-* | shrink-* |
| flex-grow-* | grow-* |
| overflow-ellipsis | text-ellipsis |
| decoration-slice | box-decoration-slice |
| decoration-clone | box-decoration-clone |


</laravel-boost-guidelines>
