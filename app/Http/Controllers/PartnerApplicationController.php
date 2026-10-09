<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePartnerApplicationRequest;
use App\Models\PartnerApplication;
use App\Services\DiscordWebhookService;
use Illuminate\Http\RedirectResponse;

class PartnerApplicationController extends Controller
{
    /**
     * Store an application to the partner programme and notify the team on Discord.
     */
    public function store(StorePartnerApplicationRequest $request, DiscordWebhookService $discord): RedirectResponse
    {
        $data = [
            'locale' => app()->getLocale(),
            ...$request->validated(),
        ];

        PartnerApplication::create($data);

        $discord->sendPartnerApplication($data);

        return back();
    }
}
