<?php

use Illuminate\Support\Facades\Route;

beforeEach(function () {
    Route::middleware('web')->post('/_form-probe/expired', fn () => abort(419));
    Route::middleware('web')->post('/_form-probe/broken', fn () => throw new RuntimeException('Boom'));
    Route::middleware('web')->post('/_form-probe/maintenance', fn () => abort(503));
});

it('sends an expired Inertia form back with an inline message instead of the 419 page', function () {
    $this->from('/')
        ->withHeader('X-Inertia', 'true')
        ->post('/_form-probe/expired')
        ->assertRedirect('/')
        ->assertSessionHasErrors(['form' => 'Formularz wygasł. Wyślij go jeszcze raz.']);
});

it('sends an Inertia form back with an inline message when the server fails', function () {
    config(['app.debug' => false]);

    $this->from('/')
        ->withHeader('X-Inertia', 'true')
        ->post('/_form-probe/broken')
        ->assertRedirect('/')
        ->assertSessionHasErrors('form');
});

it('keeps the regular error pages outside Inertia form posts', function () {
    config(['app.debug' => false]);

    $this->post('/_form-probe/expired')->assertStatus(419);
    $this->post('/_form-probe/broken')->assertServerError();
});

it('leaves maintenance responses and debug-mode errors alone', function () {
    $this->withHeader('X-Inertia', 'true')
        ->post('/_form-probe/maintenance')
        ->assertServiceUnavailable();

    config(['app.debug' => true]);

    $this->withHeader('X-Inertia', 'true')
        ->post('/_form-probe/broken')
        ->assertServerError();
});
