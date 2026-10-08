<?php

use App\Http\Controllers\Admin\Auth\LoginController;
use App\Http\Controllers\Admin\CallbackRequestController;
use App\Http\Controllers\Admin\ClientController;
use App\Http\Controllers\Admin\ContactMessageController;
use App\Http\Controllers\Admin\ProjectBriefController;
use App\Http\Controllers\Admin\ProjectController;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')->name('admin.')->group(function () {
    Route::middleware('guest')->group(function () {
        Route::get('login', [LoginController::class, 'create'])->name('login');
        Route::post('login', [LoginController::class, 'store'])->name('login.store');
    });

    Route::middleware('auth')->group(function () {
        Route::get('/', fn () => to_route('admin.projects.index'))->name('home');
        Route::post('logout', [LoginController::class, 'destroy'])->name('logout');

        Route::post('projects/reorder', [ProjectController::class, 'reorder'])->name('projects.reorder');
        Route::delete('projects', [ProjectController::class, 'destroyMany'])->name('projects.destroy-many');
        Route::resource('projects', ProjectController::class)->except('show');

        Route::post('clients/reorder', [ClientController::class, 'reorder'])->name('clients.reorder');
        Route::delete('clients', [ClientController::class, 'destroyMany'])->name('clients.destroy-many');
        Route::resource('clients', ClientController::class)->except('show');

        Route::delete('messages', [ContactMessageController::class, 'destroyMany'])->name('messages.destroy-many');
        Route::resource('messages', ContactMessageController::class)->only(['index', 'show', 'destroy']);

        Route::delete('briefs', [ProjectBriefController::class, 'destroyMany'])->name('briefs.destroy-many');
        Route::resource('briefs', ProjectBriefController::class)->only(['index', 'show', 'destroy']);

        Route::delete('callbacks', [CallbackRequestController::class, 'destroyMany'])->name('callbacks.destroy-many');
        Route::resource('callbacks', CallbackRequestController::class)->only(['index', 'destroy']);
    });
});
