<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\SecurityHeaders;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Symfony\Component\HttpFoundation\Response;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        then: function (): void {
            Route::middleware('web')->group(base_path('routes/admin.php'));
        },
    )
    ->withMiddleware(function (Middleware $middleware): void {
        /*
         * Production sits behind Cloudflare: trust its edge ranges (https://www.cloudflare.com/ips/) so
         * $request->ip() — and the `forms` rate limiter keyed on it — sees the visitor, not the proxy.
         * Only the client IP and scheme are taken from proxy headers; X-Forwarded-Host is never trusted.
         */
        $middleware->trustProxies(
            at: [
                '173.245.48.0/20', '103.21.244.0/22', '103.22.200.0/22', '103.31.4.0/22', '141.101.64.0/18',
                '108.162.192.0/18', '190.93.240.0/20', '188.114.96.0/20', '197.234.240.0/22', '198.41.128.0/17',
                '162.158.0.0/15', '104.16.0.0/13', '104.24.0.0/14', '172.64.0.0/13', '131.0.72.0/22',
                '2400:cb00::/32', '2606:4700::/32', '2803:f800::/32', '2405:b500::/32', '2405:8100::/32',
                '2a06:98c0::/29', '2c0f:f248::/32',
            ],
            headers: Request::HEADER_X_FORWARDED_FOR | Request::HEADER_X_FORWARDED_PROTO,
        );

        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->redirectGuestsTo(fn (Request $request): string => route('admin.login'));
        $middleware->redirectUsersTo(fn (Request $request): string => route('admin.home'));

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        // Global, so responses produced outside the web group (routing 404/405, CSRF 419, maintenance 503) get the headers too.
        $middleware->append(SecurityHeaders::class);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        /*
         * Inertia shows any non-Inertia error response as a whole page in a modal over the form. For the homepage forms,
         * an expired session (419) or a server error (5xx outside debug mode, except maintenance) goes back to the form
         * with an inline message instead, like the `forms` rate limiter does for 429, so nothing the visitor typed is lost.
         */
        $exceptions->respond(function (Response $response, Throwable $exception, Request $request): Response {
            if (! $request->header('X-Inertia') || $request->isMethod('GET')) {
                return $response;
            }

            $status = $response->getStatusCode();

            if ($status === 419) {
                return back()->withErrors(['form' => 'Formularz wygasł. Wyślij go jeszcze raz.']);
            }

            if ($status >= 500 && $status !== 503 && ! app()->hasDebugModeEnabled()) {
                return back()->withErrors([
                    'form' => 'Nie udało się wysłać formularza. Spróbuj ponownie za chwilę albo napisz na kontakt@netizo.pl.',
                ]);
            }

            return $response;
        });
    })->create();
