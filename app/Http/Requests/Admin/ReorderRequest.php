<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ReorderRequest extends FormRequest
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
            'ids' => ['required', 'array', 'min:1', 'max:500'],
            'ids.*' => ['integer', 'distinct'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'ids.required' => 'Brak listy do zapisania.',
            'ids.min' => 'Brak listy do zapisania.',
            'ids.max' => 'Lista jest zbyt długa.',
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
