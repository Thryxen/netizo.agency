<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->withoutVite();
});

it('redirects guests from the panel home to the login page', function () {
    $this->get('/admin')->assertRedirect(route('admin.login'));
});

it('renders the login page without tracking scripts and marked noindex', function () {
    $this->get(route('admin.login'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('admin/login'))
        ->assertSee('noindex', false)
        ->assertDontSee('googletagmanager', false)
        ->assertDontSee('clarity.ms', false);
});

it('logs a user in and sends them to the panel', function () {
    $user = User::factory()->create();

    $this->post(route('admin.login.store'), ['email' => $user->email, 'password' => 'password'])
        ->assertRedirect(route('admin.home'));

    $this->assertAuthenticatedAs($user);
});

it('rejects a wrong password and an unknown email with the same message', function () {
    $user = User::factory()->create();

    $this->post(route('admin.login.store'), ['email' => $user->email, 'password' => 'zle-haslo'])
        ->assertSessionHasErrors(['email' => 'Nieprawidłowy adres e-mail lub hasło.']);

    $this->post(route('admin.login.store'), ['email' => 'nikt@netizo.pl', 'password' => 'password'])
        ->assertSessionHasErrors(['email' => 'Nieprawidłowy adres e-mail lub hasło.']);

    $this->assertGuest();
});

it('requires an email and a password', function () {
    $this->post(route('admin.login.store'), [])->assertSessionHasErrors(['email', 'password']);
});

it('locks the login after five failed attempts, even for the right password', function () {
    $user = User::factory()->create();

    foreach (range(1, 5) as $attempt) {
        $this->post(route('admin.login.store'), ['email' => $user->email, 'password' => 'zle-haslo']);
    }

    $this->post(route('admin.login.store'), ['email' => $user->email, 'password' => 'password'])
        ->assertSessionHasErrors('email');

    $this->assertGuest();
});

it('counts attempts per email regardless of letter case', function () {
    User::factory()->create(['email' => 'admin@netizo.pl']);

    foreach (range(1, 5) as $attempt) {
        $this->post(route('admin.login.store'), ['email' => 'ADMIN@netizo.pl', 'password' => 'zle-haslo']);
    }

    $this->post(route('admin.login.store'), ['email' => 'admin@netizo.pl', 'password' => 'password'])
        ->assertSessionHasErrors('email');

    $this->assertGuest();
});

it('logs out and redirects to the login page', function () {
    $this->actingAs(User::factory()->create())
        ->post(route('admin.logout'))
        ->assertRedirect(route('admin.login'));

    $this->assertGuest();
});

it('keeps logged in users away from the login page', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('admin.login'))
        ->assertRedirect(route('admin.home'));
});

it('shares the user and the sidebar state on admin pages', function () {
    $this->get(route('admin.login'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('auth.user', null)
            ->where('sidebarOpen', true));

    $this->withUnencryptedCookie('sidebar_state', 'false')
        ->get(route('admin.login'))
        ->assertInertia(fn (Assert $page) => $page->where('sidebarOpen', false));
});

it('does not add the admin props to the public home page', function () {
    $this->get('/')->assertInertia(fn (Assert $page) => $page->missing('auth')->missing('sidebarOpen')->missing('flash'));
});
