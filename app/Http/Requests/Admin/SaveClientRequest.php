<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class SaveClientRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'url' => ['nullable', 'url', 'max:255'],
            'sort_order' => ['required', 'integer', 'min:0', 'max:100000'],
            'is_active' => ['required', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => 'nazwa klienta',
            'url' => 'link',
            'sort_order' => 'kolejność',
            'is_active' => 'aktywność',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'url.url' => 'Podaj poprawny adres, np. https://example.com.',
        ];
    }

    /**
     * @return array{name: string, url: string|null, sort_order: int, is_active: bool}
     */
    public function clientAttributes(): array
    {
        $data = $this->validated();

        return [
            'name' => $data['name'],
            'url' => $data['url'] ?? null,
            'sort_order' => (int) $data['sort_order'],
            'is_active' => $this->boolean('is_active'),
        ];
    }
}
