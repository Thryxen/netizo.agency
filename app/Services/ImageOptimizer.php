<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Constraint;
use Intervention\Image\ImageManager;

/**
 * Stores uploaded images as WebP no wider than a given limit and removes them again.
 */
class ImageOptimizer
{
    /**
     * Resize (never enlarging, aspect ratio kept), encode as WebP and store under a fresh ULID name.
     *
     * @return string Path relative to the disk root.
     */
    public function store(UploadedFile $file, string $directory, int $maxWidth, int $quality = 95, string $disk = 'public'): string
    {
        $manager = new ImageManager([
            'driver' => extension_loaded('imagick') ? 'imagick' : 'gd',
        ]);

        $image = $manager->make($file->getRealPath());

        $image->resize($maxWidth, null, function (Constraint $constraint): void {
            $constraint->aspectRatio();
            $constraint->upsize();
        });

        $path = trim($directory, '/').'/'.Str::ulid().'.webp';

        Storage::disk($disk)->put($path, $image->encode('webp', $quality)->getEncoded());

        return $path;
    }

    /**
     * Remove a stored image; an empty or already missing path is ignored.
     */
    public function delete(?string $path, string $disk = 'public'): void
    {
        if ($path === null || $path === '') {
            return;
        }

        Storage::disk($disk)->delete($path);
    }
}
