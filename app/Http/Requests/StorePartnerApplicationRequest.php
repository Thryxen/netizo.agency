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
     * Get the custom validation messages, in the language of the page the form was sent from (lang/{pl,en}/forms.php).
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return __('forms.partner');
    }
}
