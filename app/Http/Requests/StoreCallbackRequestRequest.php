<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreCallbackRequestRequest extends FormRequest
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
            'phone' => ['required', 'string', 'min:9', 'max:255'],
        ];
    }

    /**
     * Get the custom validation messages, in the language of the page the form was sent from (lang/{pl,en}/forms.php).
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return __('forms.callback');
    }
}
