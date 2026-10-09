<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;

/**
 * The public site in two languages: Polish without a prefix (`/`, `/partnerzy`), English under /en (`/en`,
 * `/en/partners`). Every English route is named like its Polish twin with an `en.` prefix (`home` ↔ `en.home`).
 */
class LocalizedRoutes
{
    /** @var list<string> */
    public const LOCALES = ['pl', 'en'];

    /** The language served without a prefix, and the hreflang x-default. */
    public const DEFAULT_LOCALE = 'pl';

    /** @var array<string, string> Open Graph locale of each language. */
    public const OG_LOCALES = ['pl' => 'pl_PL', 'en' => 'en_US'];

    public static function localeFromPath(Request $request): string
    {
        return $request->is('en', 'en/*') ? 'en' : self::DEFAULT_LOCALE;
    }

    /**
     * Name of the route `$name` (a Polish route name such as `partners`) in the current language.
     */
    public static function name(string $name): string
    {
        return app()->getLocale() === self::DEFAULT_LOCALE ? $name : app()->getLocale().'.'.$name;
    }

    /**
     * URL of the page `$name` (a Polish route name such as `home`) in the current language.
     */
    public static function url(string $name): string
    {
        return route(self::name($name));
    }

    /**
     * The current page in every language, keyed by locale, from the name of the matched route. Empty for a route
     * without a name or without a twin in each language.
     *
     * @return array<string, string>
     */
    public static function alternates(?string $routeName): array
    {
        if ($routeName === null) {
            return [];
        }

        $name = Str::startsWith($routeName, 'en.') ? Str::after($routeName, 'en.') : $routeName;
        $urls = [];

        foreach (self::LOCALES as $locale) {
            $localizedName = $locale === self::DEFAULT_LOCALE ? $name : "{$locale}.{$name}";

            if (! Route::has($localizedName)) {
                return [];
            }

            $urls[$locale] = route($localizedName);
        }

        return $urls;
    }
}
