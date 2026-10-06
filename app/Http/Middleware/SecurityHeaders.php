<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Vite;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Skip for Filament admin panel (may have compatibility issues)
        if ($request->is('panel/*') || $request->is('livewire/*')) {
            return $response;
        }

        // Build CSP with Trusted Types
        $csp = $this->buildContentSecurityPolicy();

        $response->headers->set('Content-Security-Policy', $csp);

        // Additional security headers
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

        return $response;
    }

    /**
     * Build Content Security Policy header value.
     */
    private function buildContentSecurityPolicy(): string
    {
        $devServer = $this->viteDevServerSources();

        $directives = [
            // Default fallback
            "default-src 'self'",

            // Scripts - allow trusted sources
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://www.clarity.ms https://*.clarity.ms https://fonts.googleapis.com".$devServer['http'],

            // Styles - allow inline for Tailwind/Livewire and Google Fonts
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com".$devServer['http'],

            // Images
            "img-src 'self' data: https: blob:".$devServer['http'],

            // Fonts
            "font-src 'self' https://fonts.gstatic.com".$devServer['http'],

            // Connect (XHR, fetch, WebSocket)
            "connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com https://www.clarity.ms https://*.clarity.ms https://region1.google-analytics.com".$devServer['http'].$devServer['ws'],

            // Frames
            "frame-src 'self' https://www.googletagmanager.com",

            // Child/worker
            "child-src 'self' blob:",

            // Object (plugins)
            "object-src 'none'",

            // Base URI
            "base-uri 'self'",

            // Form actions
            "form-action 'self'",

            // Frame ancestors (prevents clickjacking)
            "frame-ancestors 'self'",

            // Trusted Types for DOM XSS protection
            "require-trusted-types-for 'script'",

            // Trusted Types policy - allow default policy for GTM, Clarity, and Livewire
            'trusted-types default dompurify livewire gtm clarity',
        ];

        return implode('; ', $directives);
    }

    /**
     * Extra CSP sources for the Vite dev server (HMR), only while it is running hot.
     *
     * @return array{http: string, ws: string}
     */
    private function viteDevServerSources(): array
    {
        if (! Vite::isRunningHot()) {
            return ['http' => '', 'ws' => ''];
        }

        $hotUrl = trim((string) @file_get_contents(Vite::hotFile()));
        $parts = parse_url($hotUrl);

        if (! is_array($parts) || ! isset($parts['host'])) {
            return ['http' => '', 'ws' => ''];
        }

        $host = $parts['host'];
        $port = isset($parts['port']) ? ':'.$parts['port'] : '';
        $hosts = in_array($host, ['[::1]', '::1', '127.0.0.1', 'localhost'], true)
            ? ['localhost', '127.0.0.1', '[::1]']
            : [$host];

        $http = [];
        $ws = [];

        foreach ($hosts as $candidate) {
            $http[] = "http://{$candidate}{$port}";
            $http[] = "https://{$candidate}{$port}";
            $ws[] = "ws://{$candidate}{$port}";
            $ws[] = "wss://{$candidate}{$port}";
        }

        return [
            'http' => ' '.implode(' ', $http),
            'ws' => ' '.implode(' ', $ws),
        ];
    }
}
