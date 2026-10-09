<?php

namespace App\Rules;

use App\Services\Turnstile;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Translation\PotentiallyTranslatedString;

/**
 * The Cloudflare Turnstile token sent with the form must pass siteverify.
 */
class TurnstileToken implements ValidationRule
{
    public function __construct(private ?string $ip = null) {}

    /**
     * @param  Closure(string, ?string=): PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value) || ! app(Turnstile::class)->verify($value, $this->ip)) {
            $fail('Weryfikacja nie powiodła się. Spróbuj ponownie.');
        }
    }
}
