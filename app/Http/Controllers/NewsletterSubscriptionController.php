<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreNewsletterSubscriptionRequest;
use App\Models\NewsletterSubscriber;
use Illuminate\Http\RedirectResponse;

class NewsletterSubscriptionController extends Controller
{
    /**
     * Subscribe an email address to the newsletter.
     */
    public function store(StoreNewsletterSubscriptionRequest $request): RedirectResponse
    {
        NewsletterSubscriber::create([
            'locale' => app()->getLocale(),
            'email' => $request->validated('email'),
        ]);

        return back();
    }
}
