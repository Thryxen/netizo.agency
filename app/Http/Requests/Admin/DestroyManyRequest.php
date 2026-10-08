<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class DestroyManyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'ids' => ['required', 'array', 'min:1', 'max:200'],
            'ids.*' => ['integer', 'distinct'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'ids.required' => 'Zaznacz co najmniej jeden element.',
            'ids.min' => 'Zaznacz co najmniej jeden element.',
            'ids.max' => 'Zaznaczono zbyt wiele elementów naraz.',
            'ids.*.integer' => 'Lista zawiera niepoprawny identyfikator.',
            'ids.*.distinct' => 'Lista zawiera powtórzony identyfikator.',
        ];
    }

    /**
     * @return list<int>
     */
    public function ids(): array
    {
        return array_map('intval', array_values($this->validated('ids')));
    }
}
