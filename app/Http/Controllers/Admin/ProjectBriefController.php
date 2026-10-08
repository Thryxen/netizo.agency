<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\RedirectsToList;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\BriefIndexRequest;
use App\Http\Requests\Admin\DestroyManyRequest;
use App\Models\ProjectBrief;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ProjectBriefController extends Controller
{
    use RedirectsToList;

    private const SEARCHABLE = ['name', 'email', 'company', 'phone', 'integrations', 'notes'];

    private const SORTABLE = ['name', 'email', 'company', 'budget', 'timeline', 'created_at'];

    public function index(BriefIndexRequest $request): Response
    {
        $briefs = $request->applyTo(ProjectBrief::query(), self::SEARCHABLE, self::SORTABLE)
            ->paginate(25)
            ->withQueryString()
            ->through(fn (ProjectBrief $brief): array => $this->rowProps($brief));

        return Inertia::render('admin/briefs/index', [
            'briefs' => $briefs,
            'filters' => $request->briefFilters(self::SORTABLE),
        ]);
    }

    public function show(ProjectBrief $brief): Response
    {
        return Inertia::render('admin/briefs/show', [
            'brief' => [
                ...$this->rowProps($brief),
                'phone' => $brief->phone,
                'position' => $brief->position,
                'website' => $brief->website,
                'source' => $brief->source,
                'contactPref' => $brief->contact_pref ?? [],
                'features' => $brief->features ?? [],
                'industry' => $brief->industry,
                'audience' => $brief->audience,
                'design' => $brief->design,
                'tech' => $brief->tech ?? [],
                'security' => $brief->security,
                'hosting' => $brief->hosting,
                'integrations' => $brief->integrations,
                'cooperationModel' => $brief->cooperation_model,
                'notes' => $brief->notes,
            ],
        ]);
    }

    public function destroy(ProjectBrief $brief): RedirectResponse
    {
        $brief->delete();

        return $this->redirectToList('admin.briefs.index', 'Usunięto brief.');
    }

    public function destroyMany(DestroyManyRequest $request): RedirectResponse
    {
        $count = ProjectBrief::query()->whereKey($request->ids())->delete();

        return back()->with('success', "Usunięto briefy: {$count}.");
    }

    /**
     * @return array{id: int, name: string, email: string, company: string|null, types: list<string>, budget: string|null, timeline: string|null, createdAt: string}
     */
    private function rowProps(ProjectBrief $brief): array
    {
        return [
            'id' => $brief->id,
            'name' => $brief->name,
            'email' => $brief->email,
            'company' => $brief->company,
            'types' => $brief->types ?? [],
            'budget' => $brief->budget,
            'timeline' => $brief->timeline,
            'createdAt' => $brief->created_at?->format('d.m.Y H:i') ?? '',
        ];
    }
}
