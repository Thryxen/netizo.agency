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
