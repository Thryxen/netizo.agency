<?php

use App\Http\Controllers\CallbackRequestController;
use App\Http\Controllers\ContactMessageController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\NewsletterSubscriptionController;
use App\Http\Controllers\PartnerApplicationController;
use App\Http\Controllers\PartnerProgramController;
use App\Http\Controllers\ProjectBriefController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index']);
Route::get('/partnerzy', [PartnerProgramController::class, 'index'])->name('partners');

Route::middleware('throttle:forms')->group(function () {
    Route::post('/kontakt', [ContactMessageController::class, 'store'])->name('contact-messages.store');
    Route::post('/brief', [ProjectBriefController::class, 'store'])->name('project-briefs.store');
    Route::post('/oddzwonimy', [CallbackRequestController::class, 'store'])->name('callback-requests.store');
    Route::post('/newsletter', [NewsletterSubscriptionController::class, 'store'])->name('newsletter-subscriptions.store');
    Route::post('/partnerzy', [PartnerApplicationController::class, 'store'])->name('partner-applications.store');
});
