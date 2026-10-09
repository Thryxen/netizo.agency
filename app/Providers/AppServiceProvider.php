<?php

namespace App\Providers;

use App\Services\LocalizedRoutes;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Inertia\Ssr\SsrRenderFailed;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->setLocaleFromPath();
        $this->configureRateLimiting();
        $this->reportSsrFailures();
    }

    /**
     * Pick the page's language already while the app boots (SetLocale does it again for every request): the cookie
     * banner translates its categories and cookie descriptions when they are registered, right after boot.
     */
    protected function setLocaleFromPath(): void
    {
        $this->app->setLocale(LocalizedRoutes::localeFromPath($this->app->make('request')));
    }

    /**
     * Limit public form submissions to 10 per minute per IP. When exceeded,
     * redirect back with a form-level error instead of rendering a 429 page.
     */
    protected function configureRateLimiting(): void
    {
        RateLimiter::for('forms', function (Request $request): Limit {
            return Limit::perMinute(10)
                ->by($request->ip())
                ->response(fn (): RedirectResponse => back()->withErrors([
                    'form' => __('forms.errors.throttled'),
                ]));
        });
    }

    /**
     * Inertia silently falls back to client-side rendering when the SSR server fails, which leaves
     * crawlers without page content. Log it, at most once a minute so a dead server can't flood the log.
     */
    protected function reportSsrFailures(): void
    {
        Event::listen(SsrRenderFailed::class, function (SsrRenderFailed $event): void {
            if (Cache::add('inertia-ssr-failure-logged', true, 60)) {
                Log::warning('Inertia SSR failed; the page was rendered client-side.', $event->toArray());
            }
        });
    }
}
