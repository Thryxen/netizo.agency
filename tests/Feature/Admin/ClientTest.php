<?php

use App\Models\Client;
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

/**
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function validClientPayload(array $overrides = []): array
{
    return array_merge([
        'name' => 'CloudInc',
        'url' => 'https://cloudinc.pl',
        'sort_order' => 3,
        'is_active' => true,
    ], $overrides);
}

it('lists the clients in manual order', function () {
    Client::factory()->create(['name' => 'Beta', 'sort_order' => 2]);
    Client::factory()->create(['name' => 'Alfa', 'sort_order' => 1]);

    $this->get(route('admin.clients.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/clients/index')
            ->has('clients', 2)
            ->where('clients.0.name', 'Alfa')
            ->where('clients.1.name', 'Beta'));
});

it('offers the next free sort order on the create form', function () {
    Client::factory()->create(['sort_order' => 7]);

    $this->get(route('admin.clients.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('admin/clients/create')->where('nextSortOrder', 8));
});

it('creates a client', function () {
    $this->post(route('admin.clients.store'), validClientPayload())
        ->assertRedirect(route('admin.clients.index'))
        ->assertSessionHas('success');

    assertDatabaseHas('clients', ['name' => 'CloudInc', 'url' => 'https://cloudinc.pl', 'sort_order' => 3, 'is_active' => true]);
});

it('creates a client without a link', function () {
    $this->post(route('admin.clients.store'), validClientPayload(['url' => '']))
        ->assertSessionHasNoErrors();

    assertDatabaseHas('clients', ['name' => 'CloudInc', 'url' => null]);
});

it('validates the client form', function (array $overrides, string $field) {
    $this->post(route('admin.clients.store'), validClientPayload($overrides))->assertSessionHasErrors($field);

    assertDatabaseCount('clients', 0);
})->with([
    'missing name' => [['name' => ''], 'name'],
    'name too long' => [['name' => str_repeat('a', 256)], 'name'],
    'invalid link' => [['url' => 'nie-adres'], 'url'],
    'negative sort order' => [['sort_order' => -1], 'sort_order'],
    'sort order not a number' => [['sort_order' => 'abc'], 'sort_order'],
]);

it('shows the edit form with the client', function () {
    $client = Client::factory()->create(['name' => 'Alfa']);

    $this->get(route('admin.clients.edit', $client))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/clients/edit')
            ->where('client.id', $client->id)
            ->where('client.name', 'Alfa'));
});

it('updates a client', function () {
    $client = Client::factory()->create();

    $this->put(route('admin.clients.update', $client), validClientPayload(['name' => 'Nowa nazwa', 'is_active' => false]))
        ->assertRedirect(route('admin.clients.index'));

    assertDatabaseHas('clients', ['id' => $client->id, 'name' => 'Nowa nazwa', 'is_active' => false]);
});

it('deletes a client', function () {
    $client = Client::factory()->create();

    $this->delete(route('admin.clients.destroy', $client))
        ->assertRedirect(route('admin.clients.index'));

    assertDatabaseMissing('clients', ['id' => $client->id]);
});

it('deletes many clients at once and leaves the others', function () {
    [$first, $second, $kept] = Client::factory()->count(3)->create();

    $this->delete(route('admin.clients.destroy-many'), ['ids' => [$first->id, $second->id]])
        ->assertRedirect()
        ->assertSessionHas('success');

    assertDatabaseCount('clients', 1);
    assertDatabaseHas('clients', ['id' => $kept->id]);
});

it('validates the ids when deleting many clients', function (mixed $ids, string $errorKey) {
    Client::factory()->create();

    $this->delete(route('admin.clients.destroy-many'), ['ids' => $ids])->assertSessionHasErrors($errorKey);

    assertDatabaseCount('clients', 1);
})->with([
    'missing' => [null, 'ids'],
    'empty' => [[], 'ids'],
    'not numbers' => [['abc'], 'ids.0'],
    'duplicates' => [[1, 1], 'ids.0'],
]);

it('saves a new manual order', function () {
    [$first, $second, $third] = Client::factory()->count(3)->sequence(
        ['sort_order' => 1],
        ['sort_order' => 2],
        ['sort_order' => 3],
    )->create();

    $this->post(route('admin.clients.reorder'), ['ids' => [$third->id, $first->id, $second->id]])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    expect($third->fresh()->sort_order)->toBe(1)
        ->and($first->fresh()->sort_order)->toBe(2)
        ->and($second->fresh()->sort_order)->toBe(3);
});

it('refuses an order that contains unknown or repeated ids and changes nothing', function (array $ids, string $errorKey) {
    $client = Client::factory()->create(['sort_order' => 5]);

    $this->post(route('admin.clients.reorder'), ['ids' => array_map(fn ($id) => $id === 'self' ? $client->id : $id, $ids)])
        ->assertSessionHasErrors($errorKey);

    expect($client->fresh()->sort_order)->toBe(5);
})->with([
    'unknown id' => [['self', 999999], 'ids'],
    'repeated id' => [['self', 'self'], 'ids.0'],
    'empty' => [[], 'ids'],
    'not a number' => [['abc'], 'ids.0'],
]);

it('redirects guests away from the clients area and changes nothing', function () {
    $client = Client::factory()->create(['sort_order' => 5]);

    Auth::logout();

    $this->get(route('admin.clients.index'))->assertRedirect(route('admin.login'));
    $this->delete(route('admin.clients.destroy-many'), ['ids' => [$client->id]])->assertRedirect(route('admin.login'));
    $this->post(route('admin.clients.reorder'), ['ids' => [$client->id]])->assertRedirect(route('admin.login'));

    assertDatabaseHas('clients', ['id' => $client->id, 'sort_order' => 5]);
});
