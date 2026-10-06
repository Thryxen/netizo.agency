<!DOCTYPE html>
<html lang="pl" @class(['dark' => ($appearance ?? 'system') === 'dark'])>
<head>
    {{-- Trusted Types Policy for XSS Protection --}}
    <script>
        if (window.trustedTypes && trustedTypes.createPolicy) {
            trustedTypes.createPolicy('default', {
                createHTML: (string) => string,
                createScriptURL: (string) => string,
                createScript: (string) => string,
            });
        }
    </script>
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-2L7MT88BQT"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', 'G-2L7MT88BQT');
    </script>

    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    @if (($appearance ?? 'system') === 'system')
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">
        <meta name="theme-color" content="#0a0a0a" media="(prefers-color-scheme: dark)">
    @else
        <meta name="theme-color" content="{{ $appearance === 'dark' ? '#0a0a0a' : '#ffffff' }}">
    @endif
    <meta name="author" content="Voxbit">

    {{-- Resolve the "system" appearance before first paint (no theme flash) --}}
    <script>
        (function () {
            var appearance = @json($appearance ?? 'system');
            var dark = appearance === 'dark' || (appearance === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
            document.documentElement.classList.toggle('dark', dark);
            document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
        })();
    </script>
    {{-- Motion gate: CSS hides entrance-animated content only under html.js, so SSR/no-JS output stays visible.
         If the app has not booted in time (blocked or failed bundle), drop the gate so nothing stays hidden. --}}
    <script>
        (function (root) {
            root.classList.add('js');
            window.setTimeout(function () {
                if (!root.hasAttribute('data-motion-ready')) {
                    root.classList.remove('js');
                }
            }, 5000);
        })(document.documentElement);
    </script>
    <style>
        html { background-color: oklch(1 0 0); }
        html.dark { background-color: oklch(0.145 0 0); }
    </style>

    {!! SEO::generate() !!}

    @isset($faqSchema)
        {{-- FAQ Schema --}}
        <script type="application/ld+json">
            {!! json_encode($faqSchema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG) !!}
        </script>
    @endisset

    <link rel="icon" type="image/png" href="{{ asset('favicon-96x96.png') }}" sizes="96x96" />
    <link rel="icon" type="image/svg+xml" href="{{ asset('favicon.svg') }}" />
    <link rel="shortcut icon" href="{{ asset('favicon.ico') }}" />
    <link rel="apple-touch-icon" sizes="180x180" href="{{ asset('apple-touch-icon.png') }}" />
    <meta name="apple-mobile-web-app-title" content="Voxbit.pl" />
    <link rel="manifest" href="{{ asset('site.webmanifest') }}" />

    {{-- Geist (latin + latin-ext for Polish) renders the first screen; fetch it with the CSS instead of after it. --}}
    @foreach (rescue(fn () => [
        Vite::asset('node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2'),
        Vite::asset('node_modules/@fontsource-variable/geist/files/geist-latin-ext-wght-normal.woff2'),
    ], [], false) as $fontUrl)
        <link rel="preload" as="font" type="font/woff2" crossorigin href="{{ $fontUrl }}">
    @endforeach

    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
    @inertiaHead
    @cookieconsentscripts
</head>
<body>
    <!-- Google Tag Manager (noscript) -->
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-K8FQP9D5"
                      height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <!-- End Google Tag Manager (noscript) -->

    @inertia

    @cookieconsentview

    <!-- Microsoft Clarity - loaded last to not block rendering -->
    <script type="text/javascript">
        (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "ugpcvis19x");
    </script>
</body>
</html>
