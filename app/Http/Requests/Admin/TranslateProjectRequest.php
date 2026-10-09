<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

/**
 * The Polish copy of a project as it is in the form right now (saved or not), to be translated into English.
 */
class TranslateProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Same limits as the Polish fields of SaveProjectRequest; empty fields and rows are allowed and skipped.
     *
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'category' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'full_description' => ['nullable', 'string', 'max:20000'],
            'metrics' => ['nullable', 'array', 'max:3'],
            'metrics.*' => ['array'],
            'metrics.*.value' => ['nullable', 'string', 'max:50'],
            'metrics.*.label' => ['nullable', 'string', 'max:100'],
            'challenges' => ['nullable', 'array', 'max:6'],
            'challenges.*' => ['nullable', 'string', 'max:1000'],
            'solutions' => ['nullable', 'array', 'max:6'],
            'solutions.*' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'category' => 'kategoria',
            'description' => 'krótki opis',
            'full_description' => 'pełny opis',
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
     * Nothing to translate when every Polish field is empty.
     *
     * @return array<int, callable(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if ($validator->errors()->isEmpty() && ! $this->hasCopy($this->copyFrom($validator->getData()))) {
                    $validator->errors()->add('source', 'Najpierw uzupełnij polską wersję projektu.');
                }
            },
        ];
    }

    /**
     * The Polish copy, trimmed, without empty rows.
     *
     * @return array{category: string, description: string, full_description: string, metrics: list<array{value: string, label: string}>, challenges: list<string>, solutions: list<string>}
     */
    public function source(): array
    {
        return $this->copyFrom($this->validated());
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array{category: string, description: string, full_description: string, metrics: list<array{value: string, label: string}>, challenges: list<string>, solutions: list<string>}
     */
    private function copyFrom(array $data): array
    {
        return [
            'category' => trim((string) ($data['category'] ?? '')),
            'description' => trim((string) ($data['description'] ?? '')),
            'full_description' => trim((string) ($data['full_description'] ?? '')),
            'metrics' => collect($data['metrics'] ?? [])
                ->map(fn (array $metric): array => [
                    'value' => trim((string) ($metric['value'] ?? '')),
                    'label' => trim((string) ($metric['label'] ?? '')),
                ])
                ->filter(fn (array $metric): bool => $metric['value'] !== '' || $metric['label'] !== '')
                ->values()
                ->all(),
            'challenges' => $this->texts($data['challenges'] ?? []),
            'solutions' => $this->texts($data['solutions'] ?? []),
        ];
    }

    /**
     * @param  array<string, string|array<int, mixed>>  $copy
     */
    private function hasCopy(array $copy): bool
    {
        return collect($copy)->contains(fn (string|array $value): bool => $value !== '' && $value !== []);
    }

    /**
     * @param  array<int, string|null>  $texts
     * @return list<string>
     */
    private function texts(array $texts): array
    {
        return collect($texts)
            ->map(fn (?string $text): string => trim((string) $text))
            ->filter(fn (string $text): bool => $text !== '')
            ->values()
            ->all();
    }
}
