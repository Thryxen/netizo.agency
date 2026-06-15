<?php

namespace App\Filament\Components;

use Filament\Forms\Components\FileUpload;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\ImageManagerStatic as Image;
use Livewire\Features\SupportFileUploads\TemporaryUploadedFile;

class OptimizedImageUpload extends FileUpload
{
    protected string $outputFormat = 'webp';

    protected int $imageQuality = 85;

    protected ?int $imageMaxWidth = null;

    protected ?int $imageMaxHeight = null;

    protected function setUp(): void
    {
        parent::setUp();

        $this->saveUploadedFileUsing(function (OptimizedImageUpload $component, TemporaryUploadedFile $file): ?string {
            if (! $file->exists()) {
                return null;
            }

            $image = Image::make($file->getRealPath());

            // Resize if needed
            $maxW = $component->getImageMaxWidth();
            $maxH = $component->getImageMaxHeight();

            if ($maxW || $maxH) {
                $image->resize($maxW, $maxH, function ($constraint) {
                    $constraint->aspectRatio();
                    $constraint->upsize();
                });
            }

            // Always encode to JPEG for maximum compatibility
            // WebP encoding with GD is unreliable on some server configurations
            $encoded = $image->encode('jpg', $component->getImageQuality());

            // Generate filename with .jpg extension
            $filename = Str::ulid().'.jpg';
            $path = $component->getDirectory().'/'.$filename;

            // Store the file
            Storage::disk($component->getDiskName())->put($path, $encoded->getEncoded());

            return $path;
        });
    }

    public function outputFormat(string $format): static
    {
        $this->outputFormat = $format;

        return $this;
    }

    public function quality(int $quality): static
    {
        $this->imageQuality = $quality;

        return $this;
    }

    public function resizeMaxWidth(?int $width): static
    {
        $this->imageMaxWidth = $width;

        return $this;
    }

    public function resizeMaxHeight(?int $height): static
    {
        $this->imageMaxHeight = $height;

        return $this;
    }

    public function getOutputFormat(): string
    {
        return $this->outputFormat;
    }

    public function getImageQuality(): int
    {
        return $this->imageQuality;
    }

    public function getImageMaxWidth(): ?int
    {
        return $this->imageMaxWidth;
    }

    public function getImageMaxHeight(): ?int
    {
        return $this->imageMaxHeight;
    }
}
