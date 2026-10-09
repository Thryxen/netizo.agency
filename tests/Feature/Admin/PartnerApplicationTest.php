<?php

use App\Models\PartnerApplication;
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

it('paginates the applications, 25 per page, newest first', function () {
    PartnerApplication::factory()->count(30)->create();
    $newest = PartnerApplication::factory()->create(['created_at' => now()->addDay()]);

    $this->get(route('admin.partners.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/partners/index')
            ->has('partners.data', 25)
            ->where('partners.total', 31)
            ->where('partners.data.0.id', $newest->id)
            ->has('partners.data.0', fn (Assert $row) => $row->hasAll(['id', 'locale', 'name', 'email', 'phone', 'partnerType', 'createdAt']))
            ->where('filters.sort', 'created_at')
            ->where('filters.direction', 'desc'));
});

it('searches the name, email, phone and message', function (string $term) {
    PartnerApplication::factory()->create(['name' => 'Anna Kowalska', 'email' => 'anna@biuro.pl', 'phone' => '600100200', 'message' => 'Znam firmy budowlane']);
    PartnerApplication::factory()->create(['name' => 'Ewa Nowak', 'email' => 'ewa@inna.pl', 'phone' => '700300400', 'message' => 'Dzień dobry']);

    $this->get(route('admin.partners.index', ['search' => $term]))
        ->assertInertia(fn (Assert $page) => $page->has('partners.data', 1)->where('partners.data.0.name', 'Anna Kowalska'));
})->with(['name' => 'Kowalska', 'email' => 'biuro.pl', 'phone' => '600100', 'message' => 'budowlane']);

it('sorts by the partner type', function () {
    PartnerApplication::factory()->create(['partner_type' => 'marketing']);
    PartnerApplication::factory()->create(['partner_type' => 'accounting']);

    $this->get(route('admin.partners.index', ['sort' => 'partner_type', 'direction' => 'asc']))
        ->assertInertia(fn (Assert $page) => $page->where('partners.data.0.partnerType', 'accounting')->where('filters.sort', 'partner_type'));
});

it('falls back to the default order for a column it cannot sort by', function () {
    PartnerApplication::factory()->count(2)->create();

    $this->get(route('admin.partners.index', ['sort' => 'message']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('filters.sort', 'created_at'));
});

it('shows an application', function () {
    $application = PartnerApplication::factory()->create(['message' => "Pierwsza linia\nDruga linia", 'phone' => null]);

    $this->get(route('admin.partners.show', $application))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/partners/show')
            ->where('partner.id', $application->id)
            ->where('partner.phone', null)
            ->where('partner.message', "Pierwsza linia\nDruga linia"));
});

it('deletes an application and goes back to the list', function () {
    $application = PartnerApplication::factory()->create();

    $this->delete(route('admin.partners.destroy', $application))
        ->assertRedirect(route('admin.partners.index'))
        ->assertSessionHas('success', 'Usunięto zgłoszenie partnera.');

    assertDatabaseMissing('partner_applications', ['id' => $application->id]);
});

it('deletes many applications at once and leaves the others', function () {
    [$first, $second, $kept] = PartnerApplication::factory()->count(3)->create();

    $this->delete(route('admin.partners.destroy-many'), ['ids' => [$first->id, $second->id]])
        ->assertRedirect()
        ->assertSessionHas('success', 'Usunięto zgłoszeń partnerów: 2.');

    assertDatabaseCount('partner_applications', 1);
    assertDatabaseHas('partner_applications', ['id' => $kept->id]);
});

it('validates the ids when deleting many applications', function (mixed $ids, string $errorKey) {
    PartnerApplication::factory()->create();

    $this->delete(route('admin.partners.destroy-many'), ['ids' => $ids])->assertSessionHasErrors($errorKey);

    assertDatabaseCount('partner_applications', 1);
})->with([
    'missing' => [null, 'ids'],
    'empty' => [[], 'ids'],
    'not numbers' => [['abc'], 'ids.0'],
]);

it('redirects guests away from the applications and changes nothing', function () {
    $application = PartnerApplication::factory()->create();

    Auth::logout();

    $this->get(route('admin.partners.index'))->assertRedirect(route('admin.login'));
    $this->get(route('admin.partners.show', $application))->assertRedirect(route('admin.login'));
    $this->delete(route('admin.partners.destroy', $application))->assertRedirect(route('admin.login'));
    $this->delete(route('admin.partners.destroy-many'), ['ids' => [$application->id]])->assertRedirect(route('admin.login'));

    assertDatabaseHas('partner_applications', ['id' => $application->id]);
});

it('shows the language of the site each partner came from', function () {
    $polish = PartnerApplication::factory()->create(['created_at' => now()->subMinute()]);
    $english = PartnerApplication::factory()->english()->create();

    $this->get(route('admin.partners.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('partners.data.0.id', $english->id)
            ->where('partners.data.0.locale', 'en')
            ->where('partners.data.1.id', $polish->id)
            ->where('partners.data.1.locale', 'pl'));

    $this->get(route('admin.partners.show', $english))
        ->assertInertia(fn (Assert $page) => $page->where('partner.locale', 'en'));
});
