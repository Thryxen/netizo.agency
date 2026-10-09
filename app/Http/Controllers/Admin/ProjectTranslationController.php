<?php

namespace App\Http\Controllers\Admin;

use App\Ai\Agents\ProjectTranslator;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\TranslateProjectRequest;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use Laravel\Ai\Exceptions\AiException;

class ProjectTranslationController extends Controller
{
    /**
     * Translate the Polish copy from the project form into English and return it as the form's English fields. Nothing
     * is saved: the editor reviews the translation and saves the project as usual.
     */
    public function __invoke(TranslateProjectRequest $request): JsonResponse
    {
        $source = $request->source();

        try {
            $translation = (new ProjectTranslator)
                ->prompt(json_encode($source, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR))
                ->toArray();
        } catch (AiException|RequestException|ConnectionException $exception) {
            report($exception);

            return response()->json(['message' => 'Nie udało się przetłumaczyć. Spróbuj ponownie za chwilę.'], 502);
        }

        return response()->json($this->englishFields($source, $translation));
    }

    /**
     * The translation as the English fields of the project form: within the same limits as SaveProjectRequest, an
     * empty Polish field stays empty, and the lists keep the Polish row count (a missing translated row stays blank).
     *
     * @param  array{category: string, description: string, full_description: string, metrics: list<array{value: string, label: string}>, challenges: list<string>, solutions: list<string>}  $source
     * @param  array<string, mixed>  $translation
     * @return array{category_en: string, description_en: string, full_description_en: string, metrics_en: list<array{value: string, label: string}>, challenges_en: list<string>, solutions_en: list<string>}
     */
    private function englishFields(array $source, array $translation): array
    {
        $text = fn (string $field, int $limit): string => $source[$field] === ''
            ? ''
            : Str::limit(trim((string) ($translation[$field] ?? '')), $limit, '');

        $translatedMetrics = array_values(is_array($translation['metrics'] ?? null) ? $translation['metrics'] : []);

        return [
            'category_en' => $text('category', 255),
            'description_en' => $text('description', 2000),
            'full_description_en' => $text('full_description', 20000),
            'metrics_en' => array_map(fn (int $index): array => [
                'value' => Str::limit(trim((string) ($translatedMetrics[$index]['value'] ?? '')), 50, ''),
                'label' => Str::limit(trim((string) ($translatedMetrics[$index]['label'] ?? '')), 100, ''),
            ], array_keys($source['metrics'])),
            'challenges_en' => $this->rows($source['challenges'], $translation['challenges'] ?? []),
            'solutions_en' => $this->rows($source['solutions'], $translation['solutions'] ?? []),
        ];
    }

    /**
     * @param  list<string>  $sourceRows
     * @return list<string>
     */
    private function rows(array $sourceRows, mixed $translatedRows): array
    {
        $translatedRows = array_values(is_array($translatedRows) ? $translatedRows : []);

        return array_map(
            fn (int $index): string => Str::limit(trim((string) ($translatedRows[$index] ?? '')), 1000, ''),
            array_keys($sourceRows),
        );
    }
}
