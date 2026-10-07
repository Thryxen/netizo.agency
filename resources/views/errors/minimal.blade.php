{{--
    Shared layout of every error page, ours and Laravel's own (401, 402, ... extend errors::minimal with the sections
    title, code and message). Self-contained: inline styles with the homepage tokens, fonts from the Vite manifest when
    it exists (system-ui otherwise), no external requests and no JavaScript, so it also renders without a build and as
    the prerendered maintenance page (php artisan down --render="errors::503").

    Optional sections: description (the paragraph under the title, raw HTML so it can bind one-letter words with
    &nbsp;), actions (replaces the two default buttons), visual (shown under the status code, usually the
    errors::partials.window browser) and maintenance (any value: leaves the header with just the logo, since the
    section links would only lead back to the maintenance page).
--}}
@php
    $isDark = rescue(fn (): bool => request()->cookie('appearance') === 'dark', false, false);
    $isMaintenance = $__env->hasSection('maintenance');

    /*
     * Root-relative outside the Vite dev server: fonts are fetched in CORS mode, so an absolute APP_URL baked into the
     * prerendered maintenance page would fail on any other host or scheme the site is served from.
     */
    $fontUrl = fn (string $path): ?string => rescue(
        fn (): ?string => Vite::isRunningHot() ? Vite::asset($path) : (parse_url(Vite::asset($path), PHP_URL_PATH) ?: null),
        null,
        false,
    );
    $geistLatin = $fontUrl('node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2');
    $geistLatinExt = $fontUrl('node_modules/@fontsource-variable/geist/files/geist-latin-ext-wght-normal.woff2');
    $geistMonoLatin = $fontUrl('node_modules/@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2');
    $geistMonoLatinExt = $fontUrl('node_modules/@fontsource-variable/geist-mono/files/geist-mono-latin-ext-wght-normal.woff2');
    $geistPixel = $fontUrl('resources/fonts/GeistPixel-Square.woff2');

    $code = trim($__env->yieldContent('code'));
    $rawTitle = trim($__env->yieldContent('title'));
    $title = Str::ucfirst(Str::lower($rawTitle));
    $message = trim($__env->yieldContent('message'));
    $description = match (true) {
        $__env->hasSection('description') => trim($__env->yieldContent('description')),
        $message !== '' && Str::lower($message) !== Str::lower($rawTitle) => $message,
        default => 'Nie udało się wyświetlić tej strony.',
    };
@endphp
<!DOCTYPE html>
<html lang="pl"{!! $isDark ? ' class="dark"' : '' !!}>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex">
    <meta name="theme-color" content="{{ $isDark ? '#0a0a0a' : '#ffffff' }}">
    <title>{!! $code !!} – {!! $title !!} | Voxbit</title>
    {{-- Same icons as the client panel: the SVG follows the system light/dark theme; ?v busts old cached icons. --}}
    <link rel="icon" href="{{ asset('favicon.ico') }}?v=2" sizes="any" />
    <link rel="icon" type="image/svg+xml" href="{{ asset('favicon.svg') }}?v=2" />
    <link rel="apple-touch-icon" href="{{ asset('apple-touch-icon.png') }}?v=2" />
    <meta name="apple-mobile-web-app-title" content="Voxbit.pl" />
    <link rel="manifest" href="{{ asset('manifest.webmanifest') }}?v=2" />

    @foreach (array_filter([$geistLatin, $geistLatinExt, $geistPixel]) as $preloadUrl)
        <link rel="preload" as="font" type="font/woff2" crossorigin href="{{ $preloadUrl }}">
    @endforeach

    <style>
        @if ($geistLatinExt)
            @font-face {
                font-family: 'Geist Variable';
                font-style: normal;
                font-display: swap;
                font-weight: 100 900;
                src: url('{{ $geistLatinExt }}') format('woff2');
                unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF;
            }
        @endif
        @if ($geistLatin)
            @font-face {
                font-family: 'Geist Variable';
                font-style: normal;
                font-display: swap;
                font-weight: 100 900;
                src: url('{{ $geistLatin }}') format('woff2');
                unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
            }
        @endif
        @if ($geistMonoLatinExt)
            @font-face {
                font-family: 'Geist Mono Variable';
                font-style: normal;
                font-display: swap;
                font-weight: 100 900;
                src: url('{{ $geistMonoLatinExt }}') format('woff2');
                unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF;
            }
        @endif
        @if ($geistMonoLatin)
            @font-face {
                font-family: 'Geist Mono Variable';
                font-style: normal;
                font-display: swap;
                font-weight: 100 900;
                src: url('{{ $geistMonoLatin }}') format('woff2');
                unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
            }
        @endif
        @if ($geistPixel)
            @font-face {
                font-family: 'Geist Pixel Square';
                font-style: normal;
                font-display: swap;
                font-weight: 100 900;
                src: url('{{ $geistPixel }}') format('woff2');
            }
        @endif

        :root {
            --radius: 0.625rem;
            --header-height: 4rem;
            --font-sans: 'Geist Variable', ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji';
            --font-mono: 'Geist Mono Variable', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            --font-pixel: 'Geist Pixel Square', 'Geist Variable', ui-sans-serif, system-ui, sans-serif;
            --ease-expo-out: cubic-bezier(0.22, 1, 0.36, 1);

            --background: oklch(1 0 0);
            --foreground: oklch(0.145 0 0);
            --primary: oklch(0.205 0 0);
            --primary-foreground: oklch(0.985 0 0);
            --muted: oklch(0.97 0 0);
            --muted-foreground: oklch(0.556 0 0);
            --accent: oklch(0.97 0 0);
            --accent-foreground: oklch(0.205 0 0);
            --border: oklch(0.922 0 0);
            --input: oklch(0.65 0 0);
            --ring: oklch(0.145 0 0);
            --rivet: oklch(0.8 0 0);

            --rail: var(--border);
            --stage: color-mix(in oklab, var(--muted) 55%, var(--background));
            --outline-border: var(--border);
            --outline-background: var(--background);
            --outline-hover: var(--accent);
            --ghost-hover: var(--accent);
            --float-shadow: 0 1px 2px rgb(0 0 0 / 0.05), 0 12px 28px -12px rgb(0 0 0 / 0.4);
            --window-shadow: 0 3px 8px rgb(0 0 0 / 0.05), 0 38px 76px -26px rgb(0 0 0 / 0.28);

            color-scheme: light;
        }

        .dark {
            --background: oklch(0.145 0 0);
            --foreground: oklch(0.985 0 0);
            --primary: oklch(0.922 0 0);
            --primary-foreground: oklch(0.205 0 0);
            --muted: oklch(0.269 0 0);
            --muted-foreground: oklch(0.708 0 0);
            --accent: oklch(0.269 0 0);
            --accent-foreground: oklch(0.985 0 0);
            --border: oklch(1 0 0 / 10%);
            --input: oklch(1 0 0 / 38%);
            --ring: oklch(0.985 0 0);
            --rivet: oklch(0.38 0 0);

            --rail: color-mix(in oklab, var(--foreground) 18%, transparent);
            --stage: color-mix(in oklab, var(--foreground) 2.5%, var(--background));
            --outline-border: color-mix(in oklab, var(--input) 40%, transparent);
            --outline-background: color-mix(in oklab, var(--input) 12%, transparent);
            --outline-hover: color-mix(in oklab, var(--input) 20%, transparent);
            --ghost-hover: color-mix(in oklab, var(--accent) 50%, transparent);
            --float-shadow: none;
            --window-shadow: none;

            color-scheme: dark;
        }

        *,
        ::before,
        ::after {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            border: 0 solid var(--border);
        }

        html {
            background-color: var(--background);
            -webkit-text-size-adjust: 100%;
        }

        body {
            display: flex;
            flex-direction: column;
            min-height: 100vh;
            min-height: 100svh;
            background-color: var(--background);
            color: var(--foreground);
            font-family: var(--font-sans);
            font-size: 1rem;
            line-height: 1.5;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            text-rendering: optimizeLegibility;
        }

        ::selection {
            background-color: color-mix(in oklab, var(--foreground) 14%, transparent);
            color: var(--foreground);
        }

        a {
            color: inherit;
            text-decoration: none;
        }

        svg {
            display: block;
        }

        /* The transparent outline is what forced-colors mode (which drops box-shadow) repaints as the focus ring. */
        :focus-visible {
            outline: 2px solid transparent;
            outline-offset: 2px;
            box-shadow: 0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent);
        }

        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border-width: 0;
        }

        .skip-link {
            position: fixed;
            top: 0.75rem;
            left: 0.75rem;
            z-index: 100;
            padding: 0.5rem 1rem;
            border: 1px solid var(--border);
            border-radius: calc(var(--radius) - 2px);
            background-color: var(--background);
            font-size: 0.875rem;
            font-weight: 500;
            transform: translateY(calc(-100% - 1rem));
        }

        .skip-link:focus {
            transform: none;
        }

        /* Page grid: a centred 1200px column framed (md+) by two dashed rails, as on the homepage. */
        .container {
            position: relative;
            width: 100%;
            max-width: 1200px;
            margin-inline: auto;
            padding-inline: 1rem;
        }

        .rivet {
            position: absolute;
            z-index: 1;
            display: none;
            width: 7px;
            height: 7px;
            background-color: var(--rivet);
            pointer-events: none;
        }

        .rivet--left {
            left: -4px;
        }

        .rivet--right {
            right: -4px;
        }

        .rivet--top {
            top: -4px;
        }

        .rivet--bottom {
            bottom: -4px;
        }

        .button {
            display: inline-flex;
            flex-shrink: 0;
            align-items: center;
            justify-content: center;
            height: 2.75rem;
            padding-inline: 1.5rem;
            border: 1px solid transparent;
            border-radius: calc(var(--radius) - 2px);
            font-size: 0.875rem;
            font-weight: 500;
            line-height: 1.25rem;
            white-space: nowrap;
            cursor: pointer;
            transition: color 150ms, background-color 150ms, border-color 150ms, box-shadow 150ms;
        }

        .button:focus-visible {
            border-color: var(--ring);
        }

        .button--primary {
            background-color: var(--primary);
            color: var(--primary-foreground);
        }

        .button--primary:hover {
            background-color: color-mix(in oklab, var(--primary) 90%, transparent);
        }

        .button--outline {
            border-color: var(--outline-border);
            background-color: var(--outline-background);
            box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
        }

        .dark .button--outline {
            box-shadow: none;
        }

        .button--outline:hover {
            background-color: var(--outline-hover);
            color: var(--accent-foreground);
        }

        .button--outline:focus-visible {
            border-color: var(--ring);
            box-shadow: 0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent);
        }

        .button--ghost {
            padding-inline: 0.75rem;
        }

        .button--ghost:hover {
            background-color: var(--ghost-hover);
            color: var(--accent-foreground);
        }

        /* Header */
        .site-header {
            border-bottom-width: 1px;
        }

        .site-header__row {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            height: var(--header-height);
        }

        .logo-link {
            display: inline-flex;
            align-items: center;
            min-height: 2.75rem;
            margin-left: -0.25rem;
            padding: 0.25rem;
            border-radius: calc(var(--radius) - 4px);
        }

        .logo {
            width: auto;
            height: 1.75rem;
        }

        /* The homepage's desktop nav (lg+) and its ghost client panel link; below lg the header is just the logo. */
        .site-nav {
            display: none;
            margin-left: 2rem;
        }

        .site-nav ul {
            display: flex;
            align-items: center;
            gap: 0.25rem;
            list-style: none;
        }

        .site-nav a {
            display: inline-flex;
            align-items: center;
            height: 2.25rem;
            padding-inline: 0.625rem;
            border-radius: calc(var(--radius) - 2px);
            color: color-mix(in oklab, var(--foreground) 70%, transparent);
            font-size: 0.875rem;
            font-weight: 500;
            line-height: 1.25rem;
            transition: color 150ms;
        }

        .site-nav a:hover {
            color: var(--foreground);
        }

        .site-header__panel {
            display: none;
            margin-left: auto;
            margin-right: -0.75rem;
        }

        /* Main: the copy, then the status code on a stage (a band under it on phones, the right 7/12 from lg), like the hero. */
        .site-main {
            display: flex;
            flex: 1;
            flex-direction: column;
        }

        .site-main:focus,
        .site-main:focus-visible {
            outline: none;
            box-shadow: none;
        }

        .site-main > .container {
            display: flex;
            flex: 1;
            flex-direction: column;
        }

        .error {
            display: flex;
            flex: 1;
            flex-direction: column;
        }

        .error__stage {
            position: relative;
            display: flex;
            flex: 1 0 auto;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 2rem;
            margin-inline: -1rem;
            padding: 2.5rem 1rem;
            border-top-width: 1px;
            background-color: var(--stage);
        }

        /* Where the stage's hairline crosses the rails: its top edge below lg, the footer line from lg. */
        .error__stage > .rivet {
            top: -4px;
        }

        .error__code {
            font-family: var(--font-pixel);
            font-size: clamp(6rem, 33vw, 10rem);
            font-weight: 400;
            line-height: 0.8;
            letter-spacing: -0.02em;
            white-space: nowrap;
        }

        .error__copy {
            padding-block: 2.5rem 3.5rem;
        }

        .error__title {
            max-width: 40rem;
            font-size: clamp(2.25rem, 10vw, 3.25rem);
            font-weight: 600;
            line-height: 1.04;
            letter-spacing: -0.04em;
            text-wrap: balance;
        }

        .error__lead {
            max-width: 36rem;
            margin-top: 1.25rem;
            color: var(--muted-foreground);
            font-size: 1.125rem;
            line-height: 1.625;
            text-wrap: pretty;
        }

        .error__actions {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 0.75rem;
            margin-top: 2rem;
        }

        /* On phones the buttons share the row (or each take a full one once wrapped) instead of leaving ragged edges. */
        .error__actions .button {
            flex: 1 1 auto;
        }

        .error__contact {
            max-width: 36rem;
            margin-top: 1.75rem;
            color: var(--muted-foreground);
            font-size: 0.875rem;
            line-height: 1.6;
            text-wrap: pretty;
        }

        .error__contact a {
            border-radius: 2px;
            color: var(--foreground);
            text-decoration: underline;
            text-decoration-color: color-mix(in oklab, var(--foreground) 30%, transparent);
            text-underline-offset: 3px;
            transition: text-decoration-color 150ms;
        }

        .error__contact a:hover {
            text-decoration-color: currentColor;
        }

        .nowrap {
            white-space: nowrap;
        }

        /* Footer */
        .site-footer {
            border-top-width: 1px;
        }

        .site-footer__row {
            padding-block: 1.5rem;
            color: var(--muted-foreground);
            font-size: 0.875rem;
        }

        /* Browser window (errors::partials.window): the homepage's live-UI vocabulary, i.e. chrome with an address bar, a wireframe page, a chip. */
        .window {
            width: min(100%, 25rem);
            overflow: hidden;
            border-width: 1px;
            border-radius: 0.75rem;
            background-color: var(--background);
            box-shadow: var(--window-shadow);
        }

        .window__bar {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            height: 2.5rem;
            padding-inline: 0.875rem;
            border-bottom-width: 1px;
            background-color: color-mix(in oklab, var(--muted) 60%, var(--background));
        }

        .window__dots {
            display: flex;
            flex-shrink: 0;
            gap: 0.375rem;
        }

        .window__dots span {
            width: 0.375rem;
            height: 0.375rem;
            background-color: color-mix(in oklab, var(--foreground) 20%, transparent);
        }

        .window__address {
            display: flex;
            flex: 1;
            align-items: center;
            min-width: 0;
            height: 1.5rem;
            padding-inline: 0.625rem;
            border-width: 1px;
            border-radius: 0.375rem;
            background-color: var(--background);
            color: var(--muted-foreground);
            font-family: var(--font-mono);
            font-size: 0.75rem;
            line-height: 1rem;
        }

        .window__url {
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .window__path {
            color: var(--foreground);
        }

        .window__page {
            display: flex;
            flex-direction: column;
            gap: 0.625rem;
            padding: 1.25rem;
        }

        .wf-bar {
            display: block;
            height: 0.5rem;
            border-radius: 999px;
            background-color: color-mix(in oklab, var(--foreground) 10%, transparent);
        }

        .wf-bar--short {
            width: 38%;
        }

        .wf-bar--long {
            width: 64%;
        }

        /* The part of the page the chip is about; the chip sits centred over it. */
        .wf-area {
            position: relative;
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 0.625rem;
            min-height: 6.5rem;
            margin-top: 0.5rem;
        }

        .wf-area__chip {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0.5rem;
        }

        .wf-slot {
            padding: 1rem;
            border: 1px dashed color-mix(in oklab, var(--foreground) 28%, transparent);
            border-radius: 0.5rem;
            background-color: color-mix(in oklab, var(--foreground) 2.5%, transparent);
        }

        .wf-slot__cross {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            stroke: color-mix(in oklab, var(--foreground) 12%, transparent);
        }

        .wf-field,
        .wf-request {
            display: flex;
            align-items: center;
            height: 1.75rem;
            padding-inline: 0.625rem;
            border: 1px solid color-mix(in oklab, var(--foreground) 14%, transparent);
            border-radius: 0.375rem;
            background-color: var(--background);
        }

        .wf-request .wf-bar {
            width: 55%;
        }

        .wf-submit {
            display: block;
            width: 38%;
            height: 1.75rem;
            border-radius: 0.375rem;
            background-color: color-mix(in oklab, var(--foreground) 16%, transparent);
        }

        .chip {
            position: relative;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            max-width: 100%;
            padding: 0.625rem 1rem 0.625rem 0.625rem;
            border-width: 1px;
            border-radius: 0.625rem;
            background-color: var(--background);
            box-shadow: var(--float-shadow);
        }

        .chip__icon {
            display: flex;
            flex-shrink: 0;
            align-items: center;
            justify-content: center;
            width: 2rem;
            height: 2rem;
            border-radius: 0.375rem;
            background-color: var(--foreground);
            color: var(--background);
        }

        .chip__text {
            min-width: 0;
            font-size: 0.75rem;
            line-height: 1.375;
        }

        .chip__title,
        .chip__detail {
            display: block;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .chip__title {
            font-weight: 500;
        }

        .chip__detail {
            color: var(--muted-foreground);
        }

        .chip__progress {
            display: block;
            width: 100%;
            min-width: 7rem;
            height: 0.25rem;
            margin-top: 0.375rem;
            overflow: hidden;
            border-radius: 999px;
            background-color: color-mix(in oklab, var(--foreground) 12%, transparent);
        }

        .chip__progress span {
            display: block;
            height: 100%;
            border-radius: inherit;
            background-color: var(--foreground);
            transform: scaleX(0.6);
            transform-origin: left;
        }

        @keyframes chip-in {
            from {
                opacity: 0;
                transform: translateY(0.75rem);
            }
        }

        @keyframes progress {
            from {
                transform: scaleX(0.2);
            }

            to {
                transform: scaleX(0.85);
            }
        }

        @media screen and (prefers-reduced-motion: no-preference) {
            .chip {
                animation: chip-in 0.7s var(--ease-expo-out) 0.3s both;
            }

            .chip__progress span {
                animation: progress 2.4s ease-in-out 1s infinite alternate both;
            }
        }

        @media (prefers-reduced-motion: reduce) {
            *,
            ::before,
            ::after {
                animation: none !important;
                transition: none !important;
            }
        }

        @media (min-width: 40rem) {
            .container {
                padding-inline: 1.5rem;
            }

            .error__stage {
                margin-inline: -1.5rem;
                padding: 3rem 1.5rem;
            }

            .wf-area {
                min-height: 7.5rem;
            }

            .error__copy {
                padding-block: 3rem 4rem;
            }

            .error__actions .button {
                flex: 0 0 auto;
            }
        }

        @media (min-width: 48rem) {
            .container {
                width: calc(100% - 3rem);
                border-inline: 1px dashed var(--rail);
            }

            .rivet {
                display: block;
            }

            .button {
                height: 2.5rem;
            }

            .button--ghost {
                height: 2.25rem;
            }

            .logo-link {
                min-height: 0;
            }
        }

        @media (min-width: 64rem) {
            .container {
                padding-inline: 2.5rem;
            }

            .site-nav {
                display: block;
            }

            .site-header__panel {
                display: inline-flex;
            }

            .error {
                display: grid;
                grid-template-columns: repeat(12, minmax(0, 1fr));
            }

            .error__copy {
                display: flex;
                grid-row: 1;
                grid-column: 1 / span 5;
                flex-direction: column;
                justify-content: center;
                padding: 3.5rem 2rem 3.5rem 0;
            }

            .error__stage {
                grid-row: 1;
                grid-column: 6 / -1;
                gap: 2.5rem;
                margin-inline: 0 -2.5rem;
                padding: 3.5rem 2.5rem;
                border-top-width: 0;
                border-left-width: 1px;
            }

            .error__stage > .rivet {
                top: auto;
                bottom: -4px;
            }

            .error__stage > .rivet--right {
                display: none;
            }

            .error__code {
                font-size: clamp(9rem, 14vw, 13.5rem);
            }

            .error__title {
                font-size: clamp(2.75rem, 4.2vw, 4rem);
            }
        }

        @media (min-width: 80rem) {
            .site-nav {
                margin-left: 3rem;
            }

            .error__copy {
                padding-right: 2.5rem;
            }
        }
    </style>
</head>
<body>
    <a class="skip-link" href="#main">Przejdź do treści</a>

    <header class="site-header">
        <div class="container site-header__row">
            <a class="logo-link" href="/" aria-label="Voxbit – strona główna">
                <svg class="logo" xmlns="http://www.w3.org/2000/svg" viewBox="220 680 1545 610" width="71" height="28" fill="currentColor" aria-hidden="true" focusable="false">
                    <path d="M 952.1 920.218 C 963.606 920.134 1007.06 918.71 1015.47 921.785 C 1018.17 926.734 1017.7 1033.34 1015.57 1043.42 L 1016.43 1042.45 C 1034.06 1023.07 1057.3 1011.97 1083.59 1011.18 C 1112.52 1010.56 1140.54 1021.3 1161.65 1041.09 C 1211.45 1088.42 1211.52 1169.15 1164.2 1218.56 C 1163.07 1219.68 1161.92 1220.77 1160.74 1221.83 C 1138.81 1242.2 1109.59 1252.85 1079.7 1251.38 C 1051.91 1249.96 1033.59 1238.73 1015.23 1218.53 C 1015.31 1227.97 1015.56 1237.41 1015.98 1246.85 C 994.8 1247.33 972.213 1246.98 950.918 1246.98 L 950.914 1019.84 C 950.912 1005.9 949.485 927.357 952.1 920.218 z M 1083.03 1192.84 C 1094.67 1189.86 1104.56 1185.52 1113.34 1177.27 C 1149.76 1143.09 1134.29 1075.35 1080.64 1070.35 C 1075.29 1069.86 1070.91 1069.98 1065.59 1070.18 C 1049.28 1073.59 1035.33 1079.73 1025.89 1094.3 C 1008.28 1121.49 1012.76 1166.26 1041.52 1184.38 C 1053.86 1192.18 1068.63 1195.19 1083.03 1192.84 z" />
                    <path d="M 1573.11 686.129 C 1611.51 687.726 1665.36 687.35 1704.01 686.366 L 1704.06 818.876 L 1621.45 818.973 C 1608.63 818.978 1586.01 819.537 1574.07 818.196 C 1574.09 857.201 1572.61 908.039 1574.53 946.144 C 1615.14 945.866 1661.18 945.036 1701.51 946.236 C 1701.69 950.403 1701.86 972.081 1701.46 975.655 C 1699.95 989.082 1703.74 1069.75 1699.74 1076.11 C 1656.97 1076.1 1614.21 1076.34 1571.44 1076.84 C 1572.34 1048.17 1571.43 1018.43 1572 989.641 C 1572.28 975.236 1571.64 961.126 1572.82 946.674 C 1530.17 947.548 1484.92 946.892 1442 946.955 C 1443.44 937.097 1442.88 912.051 1442.89 901.011 C 1442.98 872.172 1442.9 843.333 1442.67 814.496 C 1481.7 815.378 1534.21 815.955 1573.05 814.568 C 1572.08 796.483 1572.82 771.195 1572.8 752.559 C 1572.76 732.471 1571.99 705.731 1573.11 686.129 z" />
                    <path d="M 594.298 1008.71 C 661.959 1003.56 720.965 1054.28 726.038 1121.94 C 731.111 1189.61 680.326 1248.56 612.653 1253.56 C 545.088 1258.55 486.254 1207.86 481.189 1140.3 C 476.124 1072.74 526.744 1013.85 594.298 1008.71 z M 611.896 1190.62 C 644.355 1186 667.016 1156.07 662.647 1123.58 C 658.279 1091.09 628.518 1068.2 595.993 1072.32 C 563.121 1076.49 539.937 1106.64 544.352 1139.48 C 548.767 1172.32 579.09 1195.28 611.896 1190.62 z" />
                    <path d="M 421.912 1016.87 C 444.412 1017.43 469.993 1017.22 492.524 1016.84 C 485.429 1033.62 478.9 1051.8 471.564 1068.25 C 447.192 1126.55 425.21 1188.08 401.314 1246.9 L 323.223 1247.02 C 306.874 1208.95 289.7 1161.4 274.554 1122.32 L 250.838 1060.48 C 248.262 1053.71 235.264 1022.15 236.674 1017.28 C 256.858 1016.29 287.382 1016.7 307.811 1017.22 C 314.856 1032.56 324.407 1061.88 330.307 1078.57 C 342.104 1110.96 353.594 1143.46 364.777 1176.07 C 368.233 1160.3 381.271 1125.72 387.267 1109.72 C 398.544 1079.62 409.896 1046.56 421.912 1016.87 z" />
                    <path d="M 714.881 1017.34 C 733.313 1016.47 764.251 1016.92 781.999 1017.39 C 788.143 1017.55 818.594 1070.95 823.076 1078.99 C 828.891 1068.53 855.488 1024.56 862.56 1017.02 L 930.809 1017.04 C 926.932 1025.51 910.186 1050.83 903.96 1060.26 C 890.305 1080.96 875.873 1105.77 861.553 1125.49 C 882.417 1157.57 904.376 1188.87 924.938 1221.16 C 930.229 1229.46 936.003 1238.84 942.118 1246.4 C 934.579 1247.03 925.475 1246.86 917.792 1246.91 L 869.233 1246.87 C 854.111 1224.19 836.333 1196.24 822.391 1172.89 C 807.622 1197.8 791.75 1221.95 776.366 1246.46 C 755.011 1247.75 727.232 1246.9 705.461 1246.84 C 709.944 1238.64 725.31 1217.17 731.044 1208.78 C 749.519 1182.31 767.625 1155.58 785.356 1128.61 C 774.438 1111.91 717.715 1028.4 714.881 1017.34 z" />
                    <path d="M 1352.78 961.513 C 1364.38 961.413 1401.13 960.594 1410.94 962.173 C 1411.06 980.511 1411.07 998.849 1410.96 1017.19 C 1431.15 1017.03 1451.35 1016.98 1471.54 1017.04 C 1472.69 1032.66 1472.01 1056.54 1472.02 1072.91 C 1451.93 1073.21 1431.02 1072.97 1410.88 1072.99 C 1411.73 1101.7 1410.52 1131.57 1410.94 1160.41 C 1411.6 1204.79 1436.67 1195.48 1467.65 1184.55 C 1468.48 1197.98 1467.95 1215.51 1467.9 1229.25 C 1467.85 1233.61 1467.72 1237.97 1467.54 1242.33 C 1452.53 1248.53 1436.49 1251.85 1420.25 1252.1 C 1341.07 1252.58 1345.89 1196.02 1345.93 1137.33 C 1345.99 1115.87 1345.93 1094.41 1345.76 1072.95 C 1333.44 1072.91 1321.12 1072.99 1308.81 1073.21 C 1308.99 1054.59 1308.36 1035.62 1309.01 1017.06 L 1346.06 1017.1 C 1346.01 1005.63 1345.15 972.74 1346.41 963.49 C 1348.85 961.306 1348.76 961.994 1352.78 961.513 z" />
                    <path d="M 1623.3 1121.36 C 1637.28 1119.29 1652.71 1123.87 1664.78 1130.9 C 1679.14 1139.25 1689.57 1152.98 1693.76 1169.05 C 1703.82 1207.3 1682.82 1245.19 1643.73 1254.14 C 1622.76 1258.95 1607.45 1254.16 1589.52 1243.12 L 1588.36 1243.6 C 1587.54 1252.37 1588 1265.82 1588.04 1274.94 L 1550.1 1275.19 C 1549.43 1259.25 1549.98 1239.19 1549.99 1223 L 1550.04 1123.11 L 1588.24 1123.06 C 1588.42 1128.33 1588.17 1133.29 1587.96 1138.54 C 1599.18 1127 1607.45 1123.15 1623.3 1121.36 z M 1624.47 1222.96 C 1643.4 1221.22 1657.33 1204.43 1655.53 1185.5 C 1653.73 1166.57 1636.9 1152.7 1617.97 1154.56 C 1599.13 1156.41 1585.34 1173.15 1587.13 1192 C 1588.92 1210.84 1605.62 1224.69 1624.47 1222.96 z" />
                    <path d="M 1220.82 1017.01 L 1286.05 1017.18 C 1287.6 1092.94 1284.72 1170.77 1286.37 1246.83 L 1262.5 1246.92 L 1220.44 1247.07 C 1220.16 1236.56 1220.29 1225.38 1220.41 1214.84 C 1221.16 1149.06 1219.23 1082.72 1220.82 1017.01 z" />
                    <path d="M 1714.21 1083.05 C 1726.14 1083.02 1738.08 1083.1 1750.01 1083.28 C 1750.44 1118.97 1749.82 1155.38 1750.06 1191.16 C 1750.14 1203.72 1751.05 1239.86 1749.61 1249.91 L 1713.47 1249.93 C 1712.84 1241.35 1713.25 1227.19 1713.24 1218.15 L 1713.15 1158.93 C 1713.13 1145.41 1712.21 1094.26 1714.21 1083.05 z" />
                    <path d="M 1246.42 916.824 C 1267.72 913.769 1287.51 928.436 1290.79 949.707 C 1294.07 970.978 1279.61 990.923 1258.38 994.424 C 1244.44 996.721 1230.34 991.356 1221.46 980.373 C 1212.58 969.39 1210.28 954.483 1215.45 941.336 C 1220.61 928.189 1232.44 918.828 1246.42 916.824 z" />
                    <path d="M 1504.77 1196.55 C 1519.74 1195.02 1533.13 1205.89 1534.71 1220.86 C 1536.29 1235.82 1525.47 1249.25 1510.51 1250.88 C 1495.47 1252.53 1481.96 1241.64 1480.37 1226.6 C 1478.78 1211.55 1489.72 1198.08 1504.77 1196.55 z" />
                </svg>
            </a>
            @unless ($isMaintenance)
                <nav class="site-nav" aria-label="Sekcje strony">
                    <ul>
                        <li><a href="/#uslugi">Usługi</a></li>
                        <li><a href="/#projekty">Projekty</a></li>
                        <li><a href="/#proces">Proces</a></li>
                        <li><a href="/#faq">FAQ</a></li>
                        <li><a href="/#kontakt">Kontakt</a></li>
                    </ul>
                </nav>
                <a class="button button--ghost site-header__panel" href="https://panel-klienta.voxbit.pl" target="_blank" rel="noopener">Panel klienta<span class="sr-only"> (otwiera się w nowej karcie)</span></a>
            @endunless
        </div>
    </header>

    <main id="main" class="site-main" tabindex="-1">
        <div class="container">
            <div class="error">
                <div class="error__copy">
                    <h1 class="error__title"><span class="sr-only">Błąd {!! $code !!}. </span>{!! $title !!}</h1>
                    <p class="error__lead">{!! $description !!}</p>
                    <div class="error__actions">
                        @hasSection('actions')
                            @yield('actions')
                        @else
                            <a class="button button--primary" href="/">Strona główna</a>
                            <a class="button button--outline" href="/#kontakt">Napisz do nas</a>
                        @endif
                    </div>
                    <p class="error__contact">
                        Możesz też napisać na <a href="mailto:kontakt@voxbit.pl">kontakt@voxbit.pl</a>
                        lub zadzwonić pod numer <a class="nowrap" href="tel:+48884343924">+48 884 343 924</a>.
                    </p>
                </div>

                <div class="error__stage" aria-hidden="true">
                    <p class="error__code">{!! $code !!}</p>
                    @yield('visual')
                    <span class="rivet rivet--left"></span>
                    <span class="rivet rivet--right"></span>
                </div>
            </div>
        </div>
    </main>

    <footer class="site-footer">
        <div class="container site-footer__row">
            <span class="rivet rivet--left rivet--top" aria-hidden="true"></span>
            <span class="rivet rivet--right rivet--top" aria-hidden="true"></span>
            <p>© {{ date('Y') }} Voxbit. Wszelkie prawa zastrzeżone.</p>
        </div>
    </footer>
</body>
</html>
