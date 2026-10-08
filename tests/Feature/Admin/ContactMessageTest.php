<?php

use App\Models\ContactMessage;
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

it('paginates the messages, 25 per page, newest first', function () {
    ContactMessage::factory()->count(30)->create();
    $newest = ContactMessage::factory()->create(['created_at' => now()->addDay()]);

    $this->get(route('admin.messages.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/messages/index')
            ->has('messages.data', 25)
            ->where('messages.total', 31)
            ->where('messages.last_page', 2)
            ->where('messages.data.0.id', $newest->id)
            ->where('filters.sort', 'created_at')
            ->where('filters.direction', 'desc'));
});

it('serves the second page and an empty page past the end', function () {
    ContactMessage::factory()->count(30)->create();

    $this->get(route('admin.messages.index', ['page' => 2]))
        ->assertInertia(fn (Assert $page) => $page->has('messages.data', 5));

    $this->get(route('admin.messages.index', ['page' => 99]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->has('messages.data', 0));
});

it('searches the name, email, subject and message', function (string $term) {
    ContactMessage::factory()->create(['name' => 'Jan Kowalski', 'email' => 'jan@firma.pl', 'subject' => 'wycena', 'message' => 'Potrzebujemy sklepu']);
    ContactMessage::factory()->create(['name' => 'Ewa Nowak', 'email' => 'ewa@inna.pl', 'subject' => 'inne', 'message' => 'Dzień dobry']);

    $this->get(route('admin.messages.index', ['search' => $term]))
        ->assertInertia(fn (Assert $page) => $page->has('messages.data', 1)->where('messages.data.0.name', 'Jan Kowalski'));
})->with(['name' => 'Kowalski', 'email' => 'firma.pl', 'subject' => 'wycena', 'message' => 'sklepu']);

it('treats wildcard characters in the search as plain input', function (string $term) {
    ContactMessage::factory()->count(2)->create();

    $this->get(route('admin.messages.index', ['search' => $term]))->assertOk();
})->with(['percent' => '%', 'underscore' => '_', 'quote' => "'; drop table contact_messages; --"]);

it('filters by the date range, inclusive of both days', function () {
    ContactMessage::factory()->create(['name' => 'Przed', 'created_at' => '2026-01-31 23:59:00']);
    ContactMessage::factory()->create(['name' => 'Pierwszy', 'created_at' => '2026-02-01 00:00:00']);
    ContactMessage::factory()->create(['name' => 'Ostatni', 'created_at' => '2026-02-28 23:59:00']);
    ContactMessage::factory()->create(['name' => 'Po', 'created_at' => '2026-03-01 00:00:00']);

    $this->get(route('admin.messages.index', ['from' => '2026-02-01', 'until' => '2026-02-28', 'sort' => 'name', 'direction' => 'asc']))
        ->assertInertia(fn (Assert $page) => $page
            ->has('messages.data', 2)
            ->where('messages.data.0.name', 'Ostatni')
            ->where('messages.data.1.name', 'Pierwszy')
            ->where('filters.from', '2026-02-01')
            ->where('filters.until', '2026-02-28'));
});

it('ignores a malformed date', function () {
    ContactMessage::factory()->count(2)->create();

    $this->get(route('admin.messages.index', ['from' => 'jutro', 'until' => '2026-13-45']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->has('messages.data', 2)->where('filters.from', '')->where('filters.until', ''));
});

it('sorts by an allowed column in both directions', function () {
    ContactMessage::factory()->create(['name' => 'Beata']);
    ContactMessage::factory()->create(['name' => 'Adam']);

    $this->get(route('admin.messages.index', ['sort' => 'name', 'direction' => 'asc']))
        ->assertInertia(fn (Assert $page) => $page->where('messages.data.0.name', 'Adam'));
});

it('sorts descending by an allowed column', function () {
    ContactMessage::factory()->create(['name' => 'Beata']);
    ContactMessage::factory()->create(['name' => 'Adam']);

    $this->get(route('admin.messages.index', ['sort' => 'name', 'direction' => 'desc']))
        ->assertInertia(fn (Assert $page) => $page->where('messages.data.0.name', 'Beata'));
});

it('falls back to the default order for an unknown sort column or direction', function (array $query) {
    ContactMessage::factory()->count(2)->create();

    $this->get(route('admin.messages.index', $query))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('filters.sort', 'created_at')->where('filters.direction', 'desc'));
})->with([
    'unknown column' => [['sort' => 'password', 'direction' => 'sideways']],
    'sql in the column' => [['sort' => 'name); drop table users; --']],
    'array instead of string' => [['sort' => ['name']]],
]);

it('shows a message', function () {
    $message = ContactMessage::factory()->create(['message' => "Pierwsza linia\nDruga linia"]);

    $this->get(route('admin.messages.show', $message))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/messages/show')
            ->where('message.id', $message->id)
            ->where('message.message', "Pierwsza linia\nDruga linia"));
});

it('deletes a message and goes back to the list', function () {
    $message = ContactMessage::factory()->create();

    $this->delete(route('admin.messages.destroy', $message))->assertRedirect(route('admin.messages.index'));

    assertDatabaseMissing('contact_messages', ['id' => $message->id]);
});

it('stays on the filtered list after deleting one message from it', function () {
    $message = ContactMessage::factory()->create(['name' => 'Jan Kowalski']);
    $list = route('admin.messages.index', ['search' => 'Kowalski', 'sort' => 'name', 'direction' => 'asc', 'page' => 2]);

    $this->from($list)->delete(route('admin.messages.destroy', $message))->assertRedirect($list);

    assertDatabaseMissing('contact_messages', ['id' => $message->id]);
});

it('goes to the bare list after deleting a message from its detail page', function () {
    $message = ContactMessage::factory()->create();

    $this->from(route('admin.messages.show', $message))
        ->delete(route('admin.messages.destroy', $message))
        ->assertRedirect(route('admin.messages.index'));
});

it('deletes many messages at once and leaves the others', function () {
    [$first, $second, $kept] = ContactMessage::factory()->count(3)->create();

    $this->delete(route('admin.messages.destroy-many'), ['ids' => [$first->id, $second->id]])->assertRedirect();

    assertDatabaseCount('contact_messages', 1);
    assertDatabaseHas('contact_messages', ['id' => $kept->id]);
});

it('validates the ids when deleting many messages', function (mixed $ids, string $errorKey) {
    ContactMessage::factory()->create();

    $this->delete(route('admin.messages.destroy-many'), ['ids' => $ids])->assertSessionHasErrors($errorKey);

    assertDatabaseCount('contact_messages', 1);
})->with([
    'missing' => [null, 'ids'],
    'empty' => [[], 'ids'],
    'not numbers' => [['abc'], 'ids.0'],
]);

it('redirects guests away from the messages and changes nothing', function () {
    $message = ContactMessage::factory()->create();

    Auth::logout();

    $this->get(route('admin.messages.index'))->assertRedirect(route('admin.login'));
    $this->get(route('admin.messages.show', $message))->assertRedirect(route('admin.login'));
    $this->delete(route('admin.messages.destroy-many'), ['ids' => [$message->id]])->assertRedirect(route('admin.login'));

    assertDatabaseHas('contact_messages', ['id' => $message->id]);
});
