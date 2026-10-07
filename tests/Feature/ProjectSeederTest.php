<?php

use App\Models\Project;
use Database\Seeders\ProjectSeeder;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    Storage::fake('public');
});

it('seeds four active sample projects with webp screenshots on the public disk', function () {
    $this->seed(ProjectSeeder::class);

    $projects = Project::query()->active()->ordered()->get();

    expect($projects)->toHaveCount(4)
        ->and($projects->pluck('slug')->all())->toBe(['zloty-klos', 'mebloteka', 'flotapro', 'fizjo-studio']);

    $projects->each(function (Project $project): void {
        expect($project->full_image)->toBe("projects/full/{$project->slug}.webp")
            ->and($project->thumbnail_image)->toBe("projects/thumbnails/{$project->slug}.webp")
            ->and($project->metrics)->toHaveCount(3)
            ->and($project->challenges[0])->toHaveKey('challenge')
            ->and($project->solutions[0])->toHaveKey('solution');

        Storage::disk('public')->assertExists([$project->full_image, $project->thumbnail_image]);

        expect(Storage::disk('public')->mimeType($project->full_image))->toBe('image/webp')
            ->and(Storage::disk('public')->mimeType($project->thumbnail_image))->toBe('image/webp');
    });
});

it('updates the sample projects instead of duplicating them when run again', function () {
    $this->seed(ProjectSeeder::class);
    Project::query()->where('slug', 'mebloteka')->update(['title' => 'Zmieniony tytuł', 'is_active' => false]);

    $this->seed(ProjectSeeder::class);

    expect(Project::query()->count())->toBe(4)
        ->and(Project::query()->where('slug', 'mebloteka')->first())
        ->title->toBe('Mebloteka')
        ->is_active->toBeTrue();
});

it('shows the seeded projects on the home page with flattened challenges and solutions', function () {
    $this->withoutVite();
    $this->seed(ProjectSeeder::class);

    $this->get('/')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('projects', 4)
            ->where('projects.0.slug', 'zloty-klos')
            ->where('projects.0.liveUrl', 'https://zlotyklos-leszno.pl')
            ->where('projects.0.fullImageUrl', asset('storage/projects/full/zloty-klos.webp'))
            ->where('projects.0.challenges.0', 'Zamówienia z telefonu, Messengera i kartek trzeba było co wieczór przepisywać do jednej listy.')
            ->where('projects.0.solutions', fn ($solutions): bool => count($solutions) === 3)
        );
});
