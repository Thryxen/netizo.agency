<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCallbackRequestRequest;
use App\Models\CallbackRequest;
use App\Services\DiscordWebhookService;
use Illuminate\Http\RedirectResponse;

class CallbackRequestController extends Controller
{
    /**
     * Store a callback request and notify the team on Discord.
     */
    public function store(StoreCallbackRequestRequest $request, DiscordWebhookService $discord): RedirectResponse
    {
        $phone = $request->validated('phone');
        $locale = app()->getLocale();

        CallbackRequest::create([
            'locale' => $locale,
            'phone' => $phone,
        ]);

        $discord->sendCallbackRequest($phone, $locale);

        return back();
    }
}
