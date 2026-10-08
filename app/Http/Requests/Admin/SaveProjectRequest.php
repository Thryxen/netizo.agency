<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'alpha_dash:ascii', Rule::unique('projects', 'slug')->ignore($this->route('project'))],
            'url' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:255'],
            'sort_order' => ['required', 'integer', 'min:0', 'max:100000'],
            'is_active' => ['required', 'boolean'],
            'description' => ['required', 'string', 'max:2000'],
            'full_description' => ['required', 'string', 'max:20000'],
            'thumbnail_image' => ['nullable', 'image', 'max:51200'],
            'full_image' => ['nullable', 'image', 'max:51200'],
            'remove_thumbnail_image' => ['sometimes', 'boolean'],
            'remove_full_image' => ['sometimes', 'boolean'],
            'tech_stack' => ['required', 'array', 'min:1', 'max:30'],
            'tech_stack.*' => ['required', 'string', 'max:50'],
            'metrics' => ['required', 'array', 'min:1', 'max:3'],
            'metrics.*.value' => ['required', 'string', 'max:50'],
            'metrics.*.label' => ['required', 'string', 'max:100'],
            'challenges' => ['required', 'array', 'min:1', 'max:6'],
            'challenges.*' => ['required', 'string', 'max:1000'],
            'solutions' => ['required', 'array', 'min:1', 'max:6'],
            'solutions.*' => ['required', 'string', 'max:1000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'title' => 'nazwa projektu',
            'slug' => 'slug',
            'url' => 'adres URL projektu',
            'category' => 'kategoria',
            'sort_order' => 'kolejność',
            'is_active' => 'aktywność',
            'description' => 'krótki opis',
            'full_description' => 'pełny opis',
            'thumbnail_image' => 'miniaturka',
            'full_image' => 'pełne zdjęcie',
            'tech_stack' => 'technologie',
            'tech_stack.*' => 'technologia',
            'metrics' => 'metryki',
            'metrics.*.value' => 'wartość metryki',
            'metrics.*.label' => 'etykieta metryki',
            'challenges' => 'wyzwania',
            'challenges.*' => 'wyzwanie',
            'solutions' => 'rozwiązania',
            'solutions.*' => 'rozwiązanie',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'slug.alpha_dash' => 'Slug może zawierać tylko małe litery, cyfry, myślniki i podkreślenia.',
            'slug.unique' => 'Projekt z takim slugiem już istnieje.',
            'thumbnail_image.image' => 'Miniaturka musi być obrazem.',
            'full_image.image' => 'Pełne zdjęcie musi być obrazem.',
            'thumbnail_image.max' => 'Miniaturka może mieć najwyżej 50 MB.',
            'full_image.max' => 'Pełne zdjęcie może mieć najwyżej 50 MB.',
            'metrics.max' => 'Możesz dodać najwyżej 3 metryki.',
            'challenges.max' => 'Możesz dodać najwyżej 6 wyzwań.',
            'solutions.max' => 'Możesz dodać najwyżej 6 rozwiązań.',
        ];
    }

    /**
     * Columns of the project except the images, with challenges and solutions in the stored repeater-row format.
     *
     * @return array<string, mixed>
     */
    public function projectAttributes(): array
    {
        $data = $this->validated();

        return [
            'title' => $data['title'],
            'slug' => $data['slug'],
            'url' => $data['url'],
            'category' => $data['category'],
            'sort_order' => (int) $data['sort_order'],
            'is_active' => $this->boolean('is_active'),
            'description' => $data['description'],
            'full_description' => $data['full_description'],
            'tech_stack' => array_values($data['tech_stack']),
            'metrics' => array_values(array_map(
                fn (array $metric): array => ['value' => $metric['value'], 'label' => $metric['label']],
                $data['metrics'],
            )),
            'challenges' => array_map(fn (string $text): array => ['challenge' => $text], array_values($data['challenges'])),
            'solutions' => array_map(fn (string $text): array => ['solution' => $text], array_values($data['solutions'])),
        ];
    }
}
