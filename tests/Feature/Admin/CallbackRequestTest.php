<?php

use App\Models\CallbackRequest;
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

it('paginates the callback requests, 25 per page, newest first', function () {
    CallbackRequest::factory()->count(30)->create();
    $newest = CallbackRequest::factory()->create(['created_at' => now()->addDay()]);

    $this->get(route('admin.callbacks.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/callbacks/index')
            ->has('callbacks.data', 25)
            ->where('callbacks.total', 31)
            ->where('callbacks.data.0.id', $newest->id));
});

it('returns an empty page past the end of the list', function () {
    CallbackRequest::factory()->count(3)->create();

    $this->get(route('admin.callbacks.index', ['page' => 99]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->has('callbacks.data', 0));
});

it('searches by phone number', function () {
    CallbackRequest::factory()->create(['phone' => '+48 111 222 333']);
    CallbackRequest::factory()->create(['phone' => '+48 999 888 777']);

    $this->get(route('admin.callbacks.index', ['search' => '111 222']))
        ->assertInertia(fn (Assert $page) => $page->has('callbacks.data', 1)->where('callbacks.data.0.phone', '+48 111 222 333'));
});

it('filters by the date range and sorts by phone', function () {
    CallbackRequest::factory()->create(['phone' => '222', 'created_at' => '2026-02-10 10:00:00']);
    CallbackRequest::factory()->create(['phone' => '111', 'created_at' => '2026-02-11 10:00:00']);
    CallbackRequest::factory()->create(['phone' => '333', 'created_at' => '2026-03-11 10:00:00']);

    $this->get(route('admin.callbacks.index', ['from' => '2026-02-01', 'until' => '2026-02-28', 'sort' => 'phone', 'direction' => 'asc']))
        ->assertInertia(fn (Assert $page) => $page
            ->has('callbacks.data', 2)
            ->where('callbacks.data.0.phone', '111')
            ->where('callbacks.data.1.phone', '222'));
});

it('falls back to the default order for an unknown sort column', function () {
    CallbackRequest::factory()->count(2)->create();

    $this->get(route('admin.callbacks.index', ['sort' => 'email', 'direction' => 'sideways']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('filters.sort', 'created_at')->where('filters.direction', 'desc'));
});

it('deletes a callback request and goes back to the list', function () {
    $callback = CallbackRequest::factory()->create();

    $this->delete(route('admin.callbacks.destroy', $callback))->assertRedirect(route('admin.callbacks.index'));

    assertDatabaseMissing('callback_requests', ['id' => $callback->id]);
});

it('deletes many callback requests at once and leaves the others', function () {
    [$first, $second, $kept] = CallbackRequest::factory()->count(3)->create();

    $this->delete(route('admin.callbacks.destroy-many'), ['ids' => [$first->id, $second->id]])->assertRedirect();

    assertDatabaseCount('callback_requests', 1);
    assertDatabaseHas('callback_requests', ['id' => $kept->id]);
});

it('validates the ids when deleting many callback requests', function (mixed $ids, string $errorKey) {
    CallbackRequest::factory()->create();

    $this->delete(route('admin.callbacks.destroy-many'), ['ids' => $ids])->assertSessionHasErrors($errorKey);

    assertDatabaseCount('callback_requests', 1);
})->with([
    'missing' => [null, 'ids'],
    'empty' => [[], 'ids'],
    'not numbers' => [['abc'], 'ids.0'],
]);

it('redirects guests away from the callback requests and changes nothing', function () {
    $callback = CallbackRequest::factory()->create();

    Auth::logout();

    $this->get(route('admin.callbacks.index'))->assertRedirect(route('admin.login'));
    $this->delete(route('admin.callbacks.destroy-many'), ['ids' => [$callback->id]])->assertRedirect(route('admin.login'));

    assertDatabaseHas('callback_requests', ['id' => $callback->id]);
});
