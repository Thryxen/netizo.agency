<?php

use App\Models\Project;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

use function Pest\Laravel\assertDatabaseCount;
use function Pest\Laravel\assertDatabaseHas;
use function Pest\Laravel\assertDatabaseMissing;

beforeEach(function () {
    $this->withoutVite();
    Storage::fake('public');
    $this->actingAs(User::factory()->create());
});

/**
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function validProjectPayload(array $overrides = []): array
{
    return array_merge([
        'title' => 'Netizo Case Study',
        'slug' => 'netizo-case-study',
        'url' => 'netizo.pl',
        'category' => 'Web app',
        'sort_order' => 1,
        'is_active' => true,
        'description' => 'Krótki opis projektu.',
        'full_description' => 'Pełny opis projektu.',
        'tech_stack' => ['Laravel', 'React'],
        'metrics' => [['value' => '+40%', 'label' => 'Konwersja']],
        'challenges' => ['Integracja z systemem klienta'],
        'solutions' => ['Dedykowane API'],
    ], $overrides);
}

it('sends a logged in user from the panel home to the projects', function () {
    $this->get('/admin')->assertRedirect(route('admin.projects.index'));
});

it('lists the projects in manual order', function () {
    Project::factory()->create(['title' => 'Drugi', 'sort_order' => 2]);
    Project::factory()->create(['title' => 'Pierwszy', 'sort_order' => 1]);

    $this->get(route('admin.projects.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/projects/index')
            ->has('projects', 2)
            ->where('projects.0.title', 'Pierwszy')
            ->where('projects.1.title', 'Drugi'));
});

it('offers the next free sort order on the create form', function () {
    Project::factory()->create(['sort_order' => 4]);

    $this->get(route('admin.projects.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('admin/projects/create')->where('nextSortOrder', 5));
});

it('creates a project and converts both images to webp', function () {
    $this->post(route('admin.projects.store'), validProjectPayload([
        'thumbnail_image' => UploadedFile::fake()->image('thumbnail.jpg', 800, 450)->size(20000),
        'full_image' => UploadedFile::fake()->image('full.png', 1600, 900)->size(20000),
    ]))
        ->assertRedirect(route('admin.projects.index'))
        ->assertSessionHasNoErrors();

    $project = Project::query()->where('slug', 'netizo-case-study')->firstOrFail();

    expect($project->thumbnail_image)->toStartWith('projects/thumbnails/')->toEndWith('.webp')
        ->and($project->full_image)->toStartWith('projects/full/')->toEndWith('.webp')
        ->and($project->tech_stack)->toBe(['Laravel', 'React'])
        ->and($project->metrics)->toBe([['value' => '+40%', 'label' => 'Konwersja']])
        ->and($project->challenges)->toBe([['challenge' => 'Integracja z systemem klienta']])
        ->and($project->solutions)->toBe([['solution' => 'Dedykowane API']])
        ->and($project->is_active)->toBeTrue();

    Storage::disk('public')->assertExists([$project->thumbnail_image, $project->full_image]);
    expect(Storage::disk('public')->mimeType($project->thumbnail_image))->toBe('image/webp');
});

it('creates a project without images', function () {
    $this->post(route('admin.projects.store'), validProjectPayload())->assertSessionHasNoErrors();

    assertDatabaseHas('projects', ['slug' => 'netizo-case-study', 'thumbnail_image' => null, 'full_image' => null]);
});

it('validates the project form', function (array $overrides, string $field) {
    $this->post(route('admin.projects.store'), validProjectPayload($overrides))->assertSessionHasErrors($field);

    assertDatabaseCount('projects', 0);
})->with([
    'missing title' => [['title' => ''], 'title'],
    'title too long' => [['title' => str_repeat('a', 256)], 'title'],
    'slug with spaces' => [['slug' => 'dwa slowa'], 'slug'],
    'missing url' => [['url' => ''], 'url'],
    'missing category' => [['category' => ''], 'category'],
    'negative sort order' => [['sort_order' => -1], 'sort_order'],
    'missing description' => [['description' => ''], 'description'],
    'missing full description' => [['full_description' => ''], 'full_description'],
    'no technologies' => [['tech_stack' => []], 'tech_stack'],
    'blank technology' => [['tech_stack' => ['Laravel', '']], 'tech_stack.1'],
    'no metrics' => [['metrics' => []], 'metrics'],
    'four metrics' => [['metrics' => array_fill(0, 4, ['value' => '1', 'label' => 'a'])], 'metrics'],
    'metric without label' => [['metrics' => [['value' => '1', 'label' => '']]], 'metrics.0.label'],
    'no challenges' => [['challenges' => []], 'challenges'],
    'seven challenges' => [['challenges' => array_fill(0, 7, 'x')], 'challenges'],
    'blank challenge' => [['challenges' => ['']], 'challenges.0'],
    'no solutions' => [['solutions' => []], 'solutions'],
]);

it('refuses a duplicate slug', function () {
    Project::factory()->create(['slug' => 'netizo-case-study']);

    $this->post(route('admin.projects.store'), validProjectPayload())->assertSessionHasErrors('slug');

    assertDatabaseCount('projects', 1);
});

it('refuses a file that is not an image', function () {
    $this->post(route('admin.projects.store'), validProjectPayload([
        'thumbnail_image' => UploadedFile::fake()->create('plan.pdf', 10, 'application/pdf'),
    ]))->assertSessionHasErrors('thumbnail_image');

    assertDatabaseCount('projects', 0);
});

it('shows the edit form, also for a project that stores plain string challenges', function () {
    $project = Project::factory()->create([
        'challenges' => ['Wyzwanie A', 'Wyzwanie B'],
        'solutions' => [['solution' => 'Rozwiązanie A']],
    ]);

    $this->get(route('admin.projects.edit', $project))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/projects/edit')
            ->where('project.id', $project->id)
            ->where('project.challenges', ['Wyzwanie A', 'Wyzwanie B'])
            ->where('project.solutions', ['Rozwiązanie A']));
});

it('updates a project and keeps its own slug and images', function () {
    Storage::disk('public')->put('projects/full/keep.webp', 'x');
    $project = Project::factory()->create(['slug' => 'netizo-case-study', 'full_image' => 'projects/full/keep.webp']);

    $this->put(route('admin.projects.update', $project), validProjectPayload(['title' => 'Nowy tytuł']))
        ->assertRedirect(route('admin.projects.index'))
        ->assertSessionHasNoErrors();

    expect($project->fresh()->title)->toBe('Nowy tytuł')
        ->and($project->fresh()->full_image)->toBe('projects/full/keep.webp');

    Storage::disk('public')->assertExists('projects/full/keep.webp');
});

it('replaces an image and deletes the previous file', function () {
    Storage::disk('public')->put('projects/full/old.webp', 'x');
    $project = Project::factory()->create(['slug' => 'netizo-case-study', 'full_image' => 'projects/full/old.webp']);

    $this->put(route('admin.projects.update', $project), validProjectPayload([
        'full_image' => UploadedFile::fake()->image('new.png', 1000, 500),
    ]))->assertSessionHasNoErrors();

    $project->refresh();

    expect($project->full_image)->not->toBe('projects/full/old.webp')->toStartWith('projects/full/');

    Storage::disk('public')->assertMissing('projects/full/old.webp');
    Storage::disk('public')->assertExists($project->full_image);
});

it('removes an image when asked, even if its file is already gone', function () {
    $project = Project::factory()->create([
        'slug' => 'netizo-case-study',
        'thumbnail_image' => 'projects/thumbnails/missing.webp',
    ]);

    $this->put(route('admin.projects.update', $project), validProjectPayload(['remove_thumbnail_image' => true]))
        ->assertRedirect(route('admin.projects.index'))
        ->assertSessionHasNoErrors();

    expect($project->fresh()->thumbnail_image)->toBeNull();
});

it('replaces an image whose previous file is already gone', function () {
    $project = Project::factory()->create([
        'slug' => 'netizo-case-study',
        'thumbnail_image' => 'projects/thumbnails/missing.webp',
    ]);

    $this->put(route('admin.projects.update', $project), validProjectPayload([
        'thumbnail_image' => UploadedFile::fake()->image('new.png', 400, 300),
    ]))->assertSessionHasNoErrors();

    expect($project->fresh()->thumbnail_image)->toStartWith('projects/thumbnails/');
});

it('deletes a project', function () {
    $project = Project::factory()->create();

    $this->delete(route('admin.projects.destroy', $project))->assertRedirect(route('admin.projects.index'));

    assertDatabaseMissing('projects', ['id' => $project->id]);
});

it('deletes many projects at once', function () {
    [$first, $second, $kept] = Project::factory()->count(3)->create();

    $this->delete(route('admin.projects.destroy-many'), ['ids' => [$first->id, $second->id]])->assertRedirect();

    assertDatabaseCount('projects', 1);
    assertDatabaseHas('projects', ['id' => $kept->id]);
});

it('saves a new manual order', function () {
    [$first, $second] = Project::factory()->count(2)->sequence(['sort_order' => 1], ['sort_order' => 2])->create();

    $this->post(route('admin.projects.reorder'), ['ids' => [$second->id, $first->id]])->assertSessionHasNoErrors();

    expect($second->fresh()->sort_order)->toBe(1)->and($first->fresh()->sort_order)->toBe(2);
});

it('refuses an order with unknown or repeated ids and changes nothing', function (array $ids, string $errorKey) {
    $project = Project::factory()->create(['sort_order' => 5]);

    $this->post(route('admin.projects.reorder'), ['ids' => array_map(fn ($id) => $id === 'self' ? $project->id : $id, $ids)])
        ->assertSessionHasErrors($errorKey);

    expect($project->fresh()->sort_order)->toBe(5);
})->with([
    'unknown id' => [['self', 999999], 'ids'],
    'repeated id' => [['self', 'self'], 'ids.0'],
    'empty' => [[], 'ids'],
]);

it('redirects guests away from the projects area and changes nothing', function () {
    $project = Project::factory()->create(['sort_order' => 5]);

    Auth::logout();

    $this->get(route('admin.projects.index'))->assertRedirect(route('admin.login'));
    $this->delete(route('admin.projects.destroy-many'), ['ids' => [$project->id]])->assertRedirect(route('admin.login'));
    $this->post(route('admin.projects.reorder'), ['ids' => [$project->id]])->assertRedirect(route('admin.login'));
    $this->post(route('admin.projects.store'), validProjectPayload())->assertRedirect(route('admin.login'));

    assertDatabaseHas('projects', ['id' => $project->id, 'sort_order' => 5]);
    assertDatabaseCount('projects', 1);
});
