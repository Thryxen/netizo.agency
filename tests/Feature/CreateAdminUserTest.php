<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

use function Pest\Laravel\assertDatabaseHas;
use function Pest\Laravel\assertDatabaseMissing;

it('creates an admin user with a hashed password', function () {
    $this->artisan('admin:create', [
        '--name' => 'Dawid Idzik',
        '--email' => 'admin@netizo.pl',
        '--password' => 'super-secret',
    ])->assertSuccessful();

    assertDatabaseHas('users', [
        'name' => 'Dawid Idzik',
        'email' => 'admin@netizo.pl',
    ]);

    $user = User::whereEmail('admin@netizo.pl')->first();

    expect(Hash::check('super-secret', $user->password))->toBeTrue();
});

it('fails when the email is already taken', function () {
    User::factory()->create(['email' => 'taken@netizo.pl']);

    $this->artisan('admin:create', [
        '--name' => 'Ktoś',
        '--email' => 'taken@netizo.pl',
        '--password' => 'super-secret',
    ])->assertFailed();

    expect(User::whereEmail('taken@netizo.pl')->count())->toBe(1);
});

it('rejects a password shorter than 8 characters', function () {
    $this->artisan('admin:create', [
        '--name' => 'Ktoś',
        '--email' => 'nowy@netizo.pl',
        '--password' => 'krotkie',
    ])->assertFailed();

    assertDatabaseMissing('users', ['email' => 'nowy@netizo.pl']);
});

it('rejects an invalid email address', function () {
    $this->artisan('admin:create', [
        '--name' => 'Ktoś',
        '--email' => 'to-nie-email',
        '--password' => 'super-secret',
    ])->assertFailed();

    assertDatabaseMissing('users', ['name' => 'Ktoś']);
});
