<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreContactMessageRequest extends FormRequest
{
    /**
     * Allowed values of the "Temat" select.
     *
     * @var list<string>
     */
    public const SUBJECTS = ['project', 'cooperation', 'career', 'other'];

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
            'subject' => ['nullable', 'string', Rule::in(self::SUBJECTS)],
            'message' => ['required', 'string', 'min:10', 'max:5000'],
        ];
    }

    /**
     * Get the custom validation messages, in the language of the page the form was sent from (lang/{pl,en}/forms.php).
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return __('forms.contact');
    }
}
