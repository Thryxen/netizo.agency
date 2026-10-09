<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\ReordersRecords;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\DestroyManyRequest;
use App\Http\Requests\Admin\ReorderRequest;
use App\Http\Requests\Admin\SaveProjectRequest;
use App\Models\Project;
use App\Services\ImageOptimizer;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    use ReordersRecords;

    /**
     * Upload field => storage directory and maximum width of the stored WebP.
     *
     * @var array<string, array{directory: string, width: int}>
     */
    private const IMAGES = [
        'thumbnail_image' => ['directory' => 'projects/thumbnails', 'width' => 1600],
        'full_image' => ['directory' => 'projects/full', 'width' => 1920],
    ];

    public function __construct(private ImageOptimizer $images) {}

    public function index(): Response
    {
        return Inertia::render('admin/projects/index', [
            'projects' => Project::query()->ordered()->orderBy('id')->get()
                ->map(fn (Project $project): array => $this->rowProps($project))
                ->all(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/projects/create', [
            'nextSortOrder' => (int) Project::query()->max('sort_order') + 1,
        ]);
    }

    public function store(SaveProjectRequest $request): RedirectResponse
    {
        [$images] = $this->imageChanges($request, null);

        $project = Project::query()->create([...$request->projectAttributes(), ...$images]);

        return to_route('admin.projects.index')->with('success', "Dodano projekt „{$project->title}”.");
    }

    public function edit(Project $project): Response
    {
        return Inertia::render('admin/projects/edit', [
            'project' => $this->formProps($project),
        ]);
    }

    public function update(SaveProjectRequest $request, Project $project): RedirectResponse
    {
        [$images, $obsolete] = $this->imageChanges($request, $project);

        $project->update([...$request->projectAttributes(), ...$images]);

        foreach ($obsolete as $path) {
            $this->images->delete($path);
        }

        return to_route('admin.projects.index')->with('success', "Zapisano projekt „{$project->title}”.");
    }

    public function destroy(Project $project): RedirectResponse
    {
        $project->delete();

        return to_route('admin.projects.index')->with('success', "Usunięto projekt „{$project->title}”.");
    }

    public function destroyMany(DestroyManyRequest $request): RedirectResponse
    {
        $count = Project::query()->whereKey($request->ids())->delete();

        return back()->with('success', "Usunięto projektów: {$count}.");
    }

    public function reorder(ReorderRequest $request): RedirectResponse
    {
        $this->applyOrder(Project::query(), $request->ids());

        return back();
    }

    /**
     * Store uploaded images and note the files that become obsolete (replaced or removed ones).
     *
     * @return array{0: array<string, string|null>, 1: list<string>}
     */
    private function imageChanges(SaveProjectRequest $request, ?Project $project): array
    {
        $attributes = [];
        $obsolete = [];

        foreach (self::IMAGES as $field => $config) {
            $current = $project?->{$field};
            $file = $request->file($field);

            if ($file !== null) {
                $attributes[$field] = $this->images->store($file, $config['directory'], $config['width']);
                $obsolete[] = $current;
            } elseif ($request->boolean("remove_{$field}")) {
                $attributes[$field] = null;
                $obsolete[] = $current;
            }
        }

        return [$attributes, array_values(array_filter($obsolete))];
    }

    /**
     * @return array{id: int, title: string, slug: string, url: string, category: string, sortOrder: int, isActive: bool, thumbnailUrl: string|null, updatedAt: string}
     */
    private function rowProps(Project $project): array
    {
        return [
            'id' => $project->id,
            'title' => $project->title,
            'slug' => $project->slug,
            'url' => (string) $project->url,
            'category' => (string) $project->category,
            'sortOrder' => (int) $project->sort_order,
            'isActive' => (bool) $project->is_active,
            'thumbnailUrl' => $project->thumbnail_image ? asset('storage/'.$project->thumbnail_image) : null,
            'updatedAt' => $project->updated_at?->format('d.m.Y H:i') ?? '',
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function formProps(Project $project): array
    {
        return [
            ...$this->rowProps($project),
            'description' => (string) $project->description,
            'fullDescription' => (string) $project->full_description,
            'fullImageUrl' => $project->full_image ? asset('storage/'.$project->full_image) : null,
            'techStack' => $this->stringList($project->tech_stack, null),
            'metrics' => $this->metricList($project->metrics),
            'challenges' => $this->stringList($project->challenges, 'challenge'),
            'solutions' => $this->stringList($project->solutions, 'solution'),
            'categoryEn' => (string) $project->category_en,
            'descriptionEn' => (string) $project->description_en,
            'fullDescriptionEn' => (string) $project->full_description_en,
            'metricsEn' => $this->metricList($project->metrics_en),
            'challengesEn' => $this->stringList($project->challenges_en, 'challenge'),
            'solutionsEn' => $this->stringList($project->solutions_en, 'solution'),
        ];
    }

    /**
     * @return list<array{value: string, label: string}>
     */
    private function metricList(mixed $value): array
    {
        return collect(is_array($value) ? $value : [])
            ->filter(fn (mixed $metric): bool => is_array($metric))
            ->map(fn (array $metric): array => [
                'value' => (string) ($metric['value'] ?? ''),
                'label' => (string) ($metric['label'] ?? ''),
            ])
            ->values()
            ->all();
    }

    /**
     * Repeater rows are stored as ['challenge' => '…'], but older data may hold plain strings.
     *
     * @return list<string>
     */
    private function stringList(mixed $value, ?string $key): array
    {
        return collect(is_array($value) ? $value : [])
            ->map(function (mixed $item) use ($key): string {
                if (is_array($item)) {
                    return (string) ($item[$key] ?? '');
                }

                return is_scalar($item) ? (string) $item : '';
            })
            ->filter(fn (string $item): bool => $item !== '')
            ->values()
            ->all();
    }
}
