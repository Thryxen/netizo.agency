<?php

use App\Filament\Resources\ProjectResource\Pages\CreateProject;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Livewire\Livewire;

it('converts uploaded project images to webp', function () {
    Storage::fake('public');

    $this->actingAs(User::factory()->create());

    Livewire::test(CreateProject::class)
        ->fillForm([
            'title' => 'Voxbit Case Study',
            'slug' => 'voxbit-case-study',
            'url' => 'voxbit.pl',
            'category' => 'Web app',
            'description' => 'Krótki opis projektu.',
            'full_description' => 'Pełny opis projektu.',
            'thumbnail_image' => UploadedFile::fake()->image('thumbnail.jpg', 800, 450)->size(20000),
            'full_image' => UploadedFile::fake()->image('full.png', 1600, 900)->size(20000),
            'tech_stack' => ['Laravel', 'Livewire'],
            'metrics' => [
                ['value' => '+40%', 'label' => 'Konwersja'],
            ],
            'challenges' => [
                ['challenge' => 'Integracja z systemem klienta'],
            ],
            'solutions' => [
                ['solution' => 'Dedykowane API'],
            ],
            'sort_order' => 1,
            'is_active' => true,
        ])
        ->call('create')
        ->assertHasNoFormErrors();

    $project = Project::query()->where('slug', 'voxbit-case-study')->firstOrFail();

    expect($project->thumbnail_image)
        ->toStartWith('projects/thumbnails/')
        ->toEndWith('.webp')
        ->and($project->full_image)
        ->toStartWith('projects/full/')
        ->toEndWith('.webp');

    Storage::disk('public')->assertExists($project->thumbnail_image);
    Storage::disk('public')->assertExists($project->full_image);

    expect(Storage::disk('public')->mimeType($project->thumbnail_image))->toBe('image/webp')
        ->and(Storage::disk('public')->mimeType($project->full_image))->toBe('image/webp');
});

it('converts tall project screenshots without exhausting php memory', function () {
    if (! extension_loaded('imagick')) {
        $this->markTestSkipped('Imagick is required to process very large screenshots safely.');
    }

    Storage::fake('public');

    $this->actingAs(User::factory()->create());

    $sourcePath = sys_get_temp_dir().'/project-screenshot-'.Str::uuid().'.png';

    $image = new Imagick;
    $image->newImage(2400, 8000, new ImagickPixel('white'), 'png');
    $image->writeImage($sourcePath);
    $image->clear();
    $image->destroy();

    $content = file_get_contents($sourcePath);

    try {
        Livewire::test(CreateProject::class)
            ->fillForm([
                'title' => 'Tall Screenshot Case Study',
                'slug' => 'tall-screenshot-case-study',
                'url' => 'treepro.pl',
                'category' => 'Website',
                'description' => 'Krótki opis projektu.',
                'full_description' => 'Pełny opis projektu.',
                'thumbnail_image' => UploadedFile::fake()->createWithContent('thumbnail.png', $content),
                'full_image' => UploadedFile::fake()->createWithContent('full.png', $content),
                'tech_stack' => ['Laravel', 'Livewire'],
                'metrics' => [
                    ['value' => '+40%', 'label' => 'Konwersja'],
                ],
                'challenges' => [
                    ['challenge' => 'Długi screenshot strony'],
                ],
                'solutions' => [
                    ['solution' => 'Konwersja przez Imagick'],
                ],
                'sort_order' => 1,
                'is_active' => true,
            ])
            ->call('create')
            ->assertHasNoFormErrors();
    } finally {
        @unlink($sourcePath);
    }

    $project = Project::query()->where('slug', 'tall-screenshot-case-study')->firstOrFail();

    $thumbnailSize = getimagesize(Storage::disk('public')->path($project->thumbnail_image));
    $fullSize = getimagesize(Storage::disk('public')->path($project->full_image));

    expect($project->thumbnail_image)->toEndWith('.webp')
        ->and($project->full_image)->toEndWith('.webp')
        ->and($thumbnailSize[0])->toBe(1600)
        ->and($fullSize[0])->toBe(1920);
});
