<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePartnerApplicationRequest extends FormRequest
{
    /**
     * Allowed values of "Kim jesteś" (resources/js/components/partners/partner-options.ts uses the same values).
     *
     * @var list<string>
     */
    public const PARTNER_TYPES = ['accounting', 'marketing', 'creative', 'consultant', 'client', 'other'];

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:2', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'min:9', 'max:255'],
            'partner_type' => ['required', 'string', Rule::in(self::PARTNER_TYPES)],
            'message' => ['nullable', 'string', 'max:2000'],
        ];
    }

    /**
     * Get the custom validation messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Imię i nazwisko jest wymagane.',
            'name.string' => 'Podaj poprawne imię i nazwisko.',
            'name.min' => 'Imię i nazwisko musi mieć co najmniej 2 znaki.',
            'name.max' => 'Imię i nazwisko może mieć maksymalnie 255 znaków.',
            'email.required' => 'Adres e-mail jest wymagany.',
            'email.email' => 'Podaj poprawny adres e-mail.',
            'email.max' => 'Adres e-mail może mieć maksymalnie 255 znaków.',
            'phone.string' => 'Podaj poprawny numer telefonu.',
            'phone.min' => 'Podaj poprawny numer telefonu.',
            'phone.max' => 'Podaj poprawny numer telefonu.',
            'partner_type.required' => 'Wybierz, kim jesteś.',
            'partner_type.string' => 'Wybierz, kim jesteś.',
            'partner_type.in' => 'Wybierz, kim jesteś.',
            'message.string' => 'Podaj poprawną treść.',
            'message.max' => 'Wiadomość może mieć maksymalnie 2000 znaków.',
        ];
    }
}
