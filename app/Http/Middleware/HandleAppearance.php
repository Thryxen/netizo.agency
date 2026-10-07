<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\View;
use Symfony\Component\HttpFoundation\Response;

class HandleAppearance
{
    /**
     * Allowed values of the `appearance` cookie. The site is light unless the visitor switched it to dark.
     *
     * @var list<string>
     */
    private const APPEARANCES = ['light', 'dark'];

    /** Lifetime of the `appearance` cookie in minutes (one year, as the client sets it). */
    private const LIFETIME_MINUTES = 525600;

    /**
     * Share the visitor's colour scheme with the root view, and whether it came from a valid cookie (without one the
     * pre-paint script falls back to localStorage).
     *
     * A valid cookie is re-issued by the server on every response: browsers that cap the lifetime of cookies written
     * from JavaScript (Safari ITP: 7 days) keep a server-set one, so a returning visitor never loses the choice.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $cookie = $request->cookie('appearance');
        $fromCookie = in_array($cookie, self::APPEARANCES, true);

        View::share('appearance', $fromCookie ? $cookie : 'light');
        View::share('appearanceFromCookie', $fromCookie);

        $response = $next($request);

        if ($fromCookie) {
            $response->headers->setCookie(
                Cookie::make('appearance', $cookie, self::LIFETIME_MINUTES, '/', null, $request->isSecure(), false, false, 'lax'),
            );
        }

        return $response;
    }
}
