<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreContactMessageRequest;
use App\Models\ContactMessage;
use App\Services\DiscordWebhookService;
use Illuminate\Http\RedirectResponse;

class ContactMessageController extends Controller
{
    /**
     * Store a quick contact message and notify the team on Discord.
     */
    public function store(StoreContactMessageRequest $request, DiscordWebhookService $discord): RedirectResponse
    {
        $data = [
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
            'subject' => $request->validated('subject') ?? '',
            'message' => $request->validated('message'),
        ];

        ContactMessage::create($data);

        $discord->sendContactMessage($data);

        return back();
    }
}
