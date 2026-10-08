<?php

use App\Models\ProjectBrief;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Inertia\Testing\AssertableInertia as Assert;

use function Pest\Laravel\assertDatabaseCount;
use function Pest\Laravel\assertDatabaseHas;
use function Pest\Laravel\assertDatabaseMissing;

beforeEach(function () {
    $this->withoutVite();
    $this->actingAs(User::factory()->create());
});

it('paginates the briefs, 25 per page, newest first', function () {
    ProjectBrief::factory()->count(30)->create();
    $newest = ProjectBrief::factory()->create(['created_at' => now()->addDay()]);

    $this->get(route('admin.briefs.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/briefs/index')
            ->has('briefs.data', 25)
            ->where('briefs.total', 31)
            ->where('briefs.data.0.id', $newest->id)
            ->where('filters.budget', '')
            ->where('filters.timeline', ''));
});

it('returns an empty page past the end of the list', function () {
    ProjectBrief::factory()->count(3)->create();

    $this->get(route('admin.briefs.index', ['page' => 99]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->has('briefs.data', 0));
});

it('searches the name, email, company and notes', function (string $term) {
    ProjectBrief::factory()->create(['name' => 'Jan Kowalski', 'email' => 'jan@firma.pl', 'company' => 'Kowalski Sp. z o.o.', 'notes' => 'Potrzebujemy integracji z ERP']);
    ProjectBrief::factory()->create(['name' => 'Ewa Nowak', 'email' => 'ewa@inna.pl', 'company' => 'Nowak SA', 'notes' => 'Prosta strona']);

    $this->get(route('admin.briefs.index', ['search' => $term]))
        ->assertInertia(fn (Assert $page) => $page->has('briefs.data', 1)->where('briefs.data.0.name', 'Jan Kowalski'));
})->with(['name' => 'Jan', 'email' => 'firma.pl', 'company' => 'Sp. z o.o.', 'notes' => 'ERP']);

it('filters by the date range', function () {
    ProjectBrief::factory()->create(['name' => 'Przed', 'created_at' => '2026-01-31 23:59:00']);
    ProjectBrief::factory()->create(['name' => 'W środku', 'created_at' => '2026-02-15 12:00:00']);
    ProjectBrief::factory()->create(['name' => 'Po', 'created_at' => '2026-03-01 00:00:00']);

    $this->get(route('admin.briefs.index', ['from' => '2026-02-01', 'until' => '2026-02-28']))
        ->assertInertia(fn (Assert $page) => $page->has('briefs.data', 1)->where('briefs.data.0.name', 'W środku'));
});

it('filters by budget and timeline', function () {
    ProjectBrief::factory()->create(['name' => 'Mały', 'budget' => 'small', 'timeline' => 'asap']);
    ProjectBrief::factory()->create(['name' => 'Duży', 'budget' => 'large', 'timeline' => '3-6']);

    $this->get(route('admin.briefs.index', ['budget' => 'large']))
        ->assertInertia(fn (Assert $page) => $page->has('briefs.data', 1)->where('briefs.data.0.name', 'Duży')->where('filters.budget', 'large'));

    $this->get(route('admin.briefs.index', ['timeline' => 'asap']))
        ->assertInertia(fn (Assert $page) => $page->has('briefs.data', 1)->where('briefs.data.0.name', 'Mały'));

    $this->get(route('admin.briefs.index', ['budget' => 'small', 'timeline' => '3-6']))
        ->assertInertia(fn (Assert $page) => $page->has('briefs.data', 0));
});

it('sorts by an allowed column and ignores unknown ones', function () {
    ProjectBrief::factory()->create(['name' => 'Beata']);
    ProjectBrief::factory()->create(['name' => 'Adam']);

    $this->get(route('admin.briefs.index', ['sort' => 'name', 'direction' => 'asc']))
        ->assertInertia(fn (Assert $page) => $page->where('briefs.data.0.name', 'Adam'));

    $this->get(route('admin.briefs.index', ['sort' => 'notes); drop table users; --', 'direction' => 'sideways']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('filters.sort', 'created_at')->where('filters.direction', 'desc'));
});

it('shows every field of a brief', function () {
    $brief = ProjectBrief::factory()->create(['types' => ['website', 'ecommerce'], 'contact_pref' => ['phone'], 'cooperation_model' => 'hourly']);

    $this->get(route('admin.briefs.show', $brief))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/briefs/show')
            ->where('brief.id', $brief->id)
            ->where('brief.types', ['website', 'ecommerce'])
            ->where('brief.contactPref', ['phone'])
            ->where('brief.cooperationModel', 'hourly'));
});

it('shows a brief whose optional list fields are empty', function () {
    $brief = ProjectBrief::factory()->create(['types' => null, 'features' => null, 'tech' => null, 'contact_pref' => null]);

    $this->get(route('admin.briefs.show', $brief))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('brief.types', [])
            ->where('brief.features', [])
            ->where('brief.tech', [])
            ->where('brief.contactPref', []));
});

it('deletes a brief and goes back to the list', function () {
    $brief = ProjectBrief::factory()->create();

    $this->delete(route('admin.briefs.destroy', $brief))->assertRedirect(route('admin.briefs.index'));

    assertDatabaseMissing('project_briefs', ['id' => $brief->id]);
});

it('stays on the filtered list after deleting one brief from it', function () {
    $brief = ProjectBrief::factory()->create(['budget' => 'large']);
    $list = route('admin.briefs.index', ['budget' => 'large', 'sort' => 'name', 'direction' => 'asc']);

    $this->from($list)->delete(route('admin.briefs.destroy', $brief))->assertRedirect($list);

    assertDatabaseMissing('project_briefs', ['id' => $brief->id]);
});

it('goes to the bare list after deleting a brief from its detail page', function () {
    $brief = ProjectBrief::factory()->create();

    $this->from(route('admin.briefs.show', $brief))
        ->delete(route('admin.briefs.destroy', $brief))
        ->assertRedirect(route('admin.briefs.index'));
});

it('deletes many briefs at once and leaves the others', function () {
    [$first, $second, $kept] = ProjectBrief::factory()->count(3)->create();

    $this->delete(route('admin.briefs.destroy-many'), ['ids' => [$first->id, $second->id]])->assertRedirect();

    assertDatabaseCount('project_briefs', 1);
    assertDatabaseHas('project_briefs', ['id' => $kept->id]);
});

it('validates the ids when deleting many briefs', function (mixed $ids, string $errorKey) {
    ProjectBrief::factory()->create();

    $this->delete(route('admin.briefs.destroy-many'), ['ids' => $ids])->assertSessionHasErrors($errorKey);

    assertDatabaseCount('project_briefs', 1);
})->with([
    'missing' => [null, 'ids'],
    'empty' => [[], 'ids'],
    'not numbers' => [['abc'], 'ids.0'],
]);

it('redirects guests away from the briefs and changes nothing', function () {
    $brief = ProjectBrief::factory()->create();

    Auth::logout();

    $this->get(route('admin.briefs.index'))->assertRedirect(route('admin.login'));
    $this->get(route('admin.briefs.show', $brief))->assertRedirect(route('admin.login'));
    $this->delete(route('admin.briefs.destroy-many'), ['ids' => [$brief->id]])->assertRedirect(route('admin.login'));

    assertDatabaseHas('project_briefs', ['id' => $brief->id]);
});
