<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProjectBriefRequest;
use App\Models\ProjectBrief;
use App\Services\DiscordWebhookService;
use Illuminate\Http\RedirectResponse;

class ProjectBriefController extends Controller
{
    /**
     * Fields stored as JSON lists of selected option values.
     *
     * @var list<string>
     */
    private const ARRAY_FIELDS = ['types', 'features', 'tech', 'contact_pref'];

    /**
     * Fields stored as plain text values.
     *
     * @var list<string>
     */
    private const TEXT_FIELDS = [
        'industry', 'audience', 'design', 'timeline',
        'security', 'hosting', 'integrations',
        'budget', 'cooperation_model', 'notes',
        'name', 'email', 'phone', 'company', 'position', 'website', 'source',
    ];

    /**
     * Store a project brief and notify the team on Discord.
     */
    public function store(StoreProjectBriefRequest $request, DiscordWebhookService $discord): RedirectResponse
    {
        $data = [];

        foreach (self::ARRAY_FIELDS as $field) {
            $data[$field] = array_values(array_unique($request->validated($field) ?? []));
        }

        foreach (self::TEXT_FIELDS as $field) {
            $data[$field] = $request->validated($field) ?? '';
        }

        ProjectBrief::create($data);

        $discord->sendBrief($data);

        return back();
    }
}
