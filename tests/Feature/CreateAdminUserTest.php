<?php

use App\Models\User;
use Filament\Facades\Filament;
use Illuminate\Support\Facades\Hash;

use function Pest\Laravel\assertDatabaseHas;
use function Pest\Laravel\assertDatabaseMissing;

it('creates an admin user that can access the panel', function () {
    $this->artisan('admin:create', [
        '--name' => 'Dawid Idzik',
        '--email' => 'admin@voxbit.pl',
        '--password' => 'super-secret',
    ])->assertSuccessful();

    assertDatabaseHas('users', [
        'name' => 'Dawid Idzik',
        'email' => 'admin@voxbit.pl',
    ]);

    $user = User::whereEmail('admin@voxbit.pl')->first();

    expect(Hash::check('super-secret', $user->password))->toBeTrue()
        ->and($user->canAccessPanel(Filament::getPanel('admin')))->toBeTrue();
});

it('fails when the email is already taken', function () {
    User::factory()->create(['email' => 'taken@voxbit.pl']);

    $this->artisan('admin:create', [
        '--name' => 'Ktoś',
        '--email' => 'taken@voxbit.pl',
        '--password' => 'super-secret',
    ])->assertFailed();

    expect(User::whereEmail('taken@voxbit.pl')->count())->toBe(1);
});

it('rejects a password shorter than 8 characters', function () {
    $this->artisan('admin:create', [
        '--name' => 'Ktoś',
        '--email' => 'nowy@voxbit.pl',
        '--password' => 'krotkie',
    ])->assertFailed();

    assertDatabaseMissing('users', ['email' => 'nowy@voxbit.pl']);
});

it('rejects an invalid email address', function () {
    $this->artisan('admin:create', [
        '--name' => 'Ktoś',
        '--email' => 'to-nie-email',
        '--password' => 'super-secret',
    ])->assertFailed();

    assertDatabaseMissing('users', ['name' => 'Ktoś']);
});
