<?php

use App\Ai\Agents\ProjectTranslator;
use App\Models\User;
use Laravel\Ai\Exceptions\AiException;
use Laravel\Ai\Prompts\AgentPrompt;

/**
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function polishProjectCopy(array $overrides = []): array
{
    return array_merge([
        'category' => 'Strona firmowa / Zamówienia online',
        'description' => 'Strona piekarni z Leszna z zamówieniami na następny dzień.',
        'full_description' => 'Złoty Kłos przyjmował zamówienia telefonicznie.',
        'metrics' => [['value' => '38%', 'label' => 'zamówień przez stronę'], ['value' => '', 'label' => ''], ['value' => '0,9 s', 'label' => 'LCP na telefonie']],
        'challenges' => ['Zamówienia z telefonu i Facebooka', ''],
        'solutions' => ['Prosty system zamówień'],
    ], $overrides);
}

/**
 * @return array<string, mixed>
 */
function englishTranslation(): array
{
    return [
        'category' => 'Company website / Online orders',
        'description' => 'Website of a bakery in Leszno with next-day orders.',
        'full_description' => 'Złoty Kłos took orders by phone.',
        'metrics' => [['value' => '38%', 'label' => 'of orders via the website'], ['value' => '0.9 s', 'label' => 'LCP on mobile']],
        'challenges' => ['Orders by phone and on Facebook'],
        'solutions' => ['A simple ordering system'],
    ];
}

beforeEach(function () {
    $this->actingAs(User::factory()->create());
});

it('translates the polish copy into the english form fields', function () {
    ProjectTranslator::fake([englishTranslation()]);

    $this->postJson('/admin/projects/translate', polishProjectCopy())
        ->assertOk()
        ->assertExactJson([
            'category_en' => 'Company website / Online orders',
            'description_en' => 'Website of a bakery in Leszno with next-day orders.',
            'full_description_en' => 'Złoty Kłos took orders by phone.',
            'metrics_en' => [
                ['value' => '38%', 'label' => 'of orders via the website'],
                ['value' => '0.9 s', 'label' => 'LCP on mobile'],
            ],
            'challenges_en' => ['Orders by phone and on Facebook'],
            'solutions_en' => ['A simple ordering system'],
        ]);
});

it('sends the polish copy without empty rows to the translator', function () {
    ProjectTranslator::fake([englishTranslation()]);

    $this->postJson('/admin/projects/translate', polishProjectCopy())->assertOk();

    ProjectTranslator::assertPrompted(function (AgentPrompt $prompt): bool {
        $copy = json_decode($prompt->prompt, true);

        return $copy['category'] === 'Strona firmowa / Zamówienia online'
            && count($copy['metrics']) === 2
            && $copy['metrics'][1]['value'] === '0,9 s'
            && $copy['challenges'] === ['Zamówienia z telefonu i Facebooka'];
    });
});

it('keeps an empty polish field empty and the polish row counts', function () {
    ProjectTranslator::fake([[
        ...englishTranslation(),
        'description' => 'Invented summary.',
        'challenges' => [],
        'solutions' => ['A simple ordering system', 'An extra row the model made up'],
    ]]);

    $this->postJson('/admin/projects/translate', polishProjectCopy(['description' => '  ']))
        ->assertOk()
        ->assertJsonPath('description_en', '')
        ->assertJsonPath('challenges_en', [''])
        ->assertJsonPath('solutions_en', ['A simple ordering system']);
});

it('cuts the translation to the limits of the project fields', function () {
    ProjectTranslator::fake([[
        ...englishTranslation(),
        'category' => str_repeat('a', 300),
        'metrics' => [['value' => str_repeat('9', 80), 'label' => 'x'], ['value' => '0.9 s', 'label' => 'LCP on mobile']],
    ]]);

    $response = $this->postJson('/admin/projects/translate', polishProjectCopy())->assertOk();

    expect(mb_strlen($response->json('category_en')))->toBe(255)
        ->and(mb_strlen($response->json('metrics_en.0.value')))->toBe(50);
});

it('asks for the polish copy first when every field is empty', function () {
    ProjectTranslator::fake();

    $this->postJson('/admin/projects/translate', [
        'category' => '',
        'description' => '',
        'full_description' => '',
        'metrics' => [['value' => '', 'label' => '']],
        'challenges' => [''],
        'solutions' => [],
    ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['source' => 'Najpierw uzupełnij polską wersję projektu.']);

    ProjectTranslator::assertNeverPrompted();
});

it('validates the polish copy like the project form', function (array $payload, string $field) {
    ProjectTranslator::fake();

    $this->postJson('/admin/projects/translate', polishProjectCopy($payload))
        ->assertUnprocessable()
        ->assertJsonValidationErrors([$field]);

    ProjectTranslator::assertNeverPrompted();
})->with([
    'too long category' => [['category' => str_repeat('a', 256)], 'category'],
    'too many metrics' => [['metrics' => array_fill(0, 4, ['value' => '1', 'label' => 'a'])], 'metrics'],
    'metric that is not a row' => [['metrics' => ['38%']], 'metrics.0'],
    'too many challenges' => [['challenges' => array_fill(0, 7, 'a')], 'challenges'],
]);

it('answers with a message when the provider fails', function () {
    ProjectTranslator::fake(fn () => throw new AiException('Provider unavailable.'));

    $this->postJson('/admin/projects/translate', polishProjectCopy())
        ->assertStatus(502)
        ->assertExactJson(['message' => 'Nie udało się przetłumaczyć. Spróbuj ponownie za chwilę.']);
});

it('is only for logged in users', function () {
    auth()->logout();
    ProjectTranslator::fake();

    $this->postJson('/admin/projects/translate', polishProjectCopy())->assertUnauthorized();

    ProjectTranslator::assertNeverPrompted();
});

it('uses the configured openrouter model', function () {
    config(['services.openrouter.translation_model' => 'anthropic/claude-haiku-5.5']);

    expect((new ProjectTranslator)->model())->toBe('anthropic/claude-haiku-5.5');
});
