<?php

use App\Services\ImageOptimizer;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

beforeEach(function () {
    Storage::fake('public');
});

it('converts an uploaded image to webp under the given directory', function () {
    $path = app(ImageOptimizer::class)->store(
        UploadedFile::fake()->image('thumbnail.jpg', 800, 450)->size(20000),
        'projects/thumbnails',
        1600,
    );

    expect($path)->toStartWith('projects/thumbnails/')->toEndWith('.webp');

    Storage::disk('public')->assertExists($path);

    expect(Storage::disk('public')->mimeType($path))->toBe('image/webp');
});

it('never enlarges an image that is narrower than the limit', function () {
    $path = app(ImageOptimizer::class)->store(
        UploadedFile::fake()->image('small.png', 800, 450),
        'projects/full',
        1920,
    );

    expect(getimagesize(Storage::disk('public')->path($path))[0])->toBe(800);
});

it('names every stored file with a fresh ulid', function () {
    $optimizer = app(ImageOptimizer::class);
    $file = UploadedFile::fake()->image('a.jpg', 100, 100);

    $first = $optimizer->store($file, 'projects/full', 1920);
    $second = $optimizer->store($file, 'projects/full', 1920);

    expect($first)->not->toBe($second)
        ->and(Str::isUlid(pathinfo($first, PATHINFO_FILENAME)))->toBeTrue();
});

it('shrinks tall screenshots to the width limit without exhausting php memory', function () {
    if (! extension_loaded('imagick')) {
        $this->markTestSkipped('Imagick is required to process very large screenshots safely.');
    }

    $sourcePath = sys_get_temp_dir().'/project-screenshot-'.Str::uuid().'.png';

    $image = new Imagick;
    $image->newImage(2400, 8000, new ImagickPixel('white'), 'png');
    $image->writeImage($sourcePath);
    $image->clear();
    $image->destroy();

    $content = file_get_contents($sourcePath);

    @unlink($sourcePath);

    $optimizer = app(ImageOptimizer::class);

    $thumbnail = $optimizer->store(UploadedFile::fake()->createWithContent('thumbnail.png', $content), 'projects/thumbnails', 1600);
    $full = $optimizer->store(UploadedFile::fake()->createWithContent('full.png', $content), 'projects/full', 1920);

    expect(getimagesize(Storage::disk('public')->path($thumbnail))[0])->toBe(1600)
        ->and(getimagesize(Storage::disk('public')->path($full))[0])->toBe(1920);
});

it('deletes a stored image and ignores empty or missing paths', function () {
    $optimizer = app(ImageOptimizer::class);
    $path = $optimizer->store(UploadedFile::fake()->image('a.jpg', 100, 100), 'projects/full', 1920);

    $optimizer->delete($path);
    $optimizer->delete(null);
    $optimizer->delete('');
    $optimizer->delete('projects/full/does-not-exist.webp');

    Storage::disk('public')->assertMissing($path);
});
