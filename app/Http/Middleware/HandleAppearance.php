<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
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

    /**
     * Share the visitor's colour scheme with the root view.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $appearance = $request->cookie('appearance');

        View::share('appearance', in_array($appearance, self::APPEARANCES, true) ? $appearance : 'light');

        return $next($request);
    }
}
