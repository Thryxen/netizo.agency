<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Cloudflare Turnstile (bot check on the admin login): the widget's site key for the page and server-side verification
 * of its tokens through siteverify. Switched on only when both keys are set (TURNSTILE_SITE_KEY, TURNSTILE_SECRET_KEY).
 */
class Turnstile
{
    private const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

    public function isEnabled(): bool
    {
        return filled(config('services.turnstile.site_key')) && filled(config('services.turnstile.secret_key'));
    }

    /**
     * The site key for the widget, or null when Turnstile is switched off.
     */
    public function siteKey(): ?string
    {
        return $this->isEnabled() ? config('services.turnstile.site_key') : null;
    }

    /**
     * Ask Cloudflare whether the token is valid. A token passes once; an unreachable siteverify counts as a failure.
     */
    public function verify(string $token, ?string $ip = null): bool
    {
        try {
            $response = Http::asForm()->timeout(5)->post(self::VERIFY_URL, array_filter([
                'secret' => config('services.turnstile.secret_key'),
                'response' => $token,
                'remoteip' => $ip,
            ]));
        } catch (ConnectionException $exception) {
            Log::warning('Turnstile siteverify unreachable', ['message' => $exception->getMessage()]);

            return false;
        }

        if ($response->json('success') !== true) {
            Log::info('Turnstile token rejected', ['error_codes' => $response->json('error-codes')]);

            return false;
        }

        return true;
    }
}
