<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreNewsletterSubscriptionRequest extends FormRequest
{
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
            'email' => ['required', 'email', 'max:255', 'unique:newsletter_subscribers,email'],
        ];
    }

    /**
     * Get the custom validation messages, in the language of the page the form was sent from (lang/{pl,en}/forms.php).
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return __('forms.newsletter');
    }
}
