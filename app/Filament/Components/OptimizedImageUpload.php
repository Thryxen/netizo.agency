<?php

namespace App\Filament\Components;

use Filament\Forms\Components\FileUpload;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Constraint;
use Intervention\Image\ImageManager;
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

            $manager = new ImageManager([
                'driver' => extension_loaded('imagick') ? 'imagick' : 'gd',
            ]);

            $image = $manager->make($file->getRealPath());

            $maxW = $component->getImageMaxWidth();
            $maxH = $component->getImageMaxHeight();

            if ($maxW || $maxH) {
                $image->resize($maxW, $maxH, function (Constraint $constraint): void {
                    $constraint->aspectRatio();
                    $constraint->upsize();
                });
            }

            $encoded = $image->encode($component->getOutputFormat(), $component->getImageQuality());

            $filename = Str::ulid().'.'.$component->getOutputExtension();
            $path = $component->getDirectory().'/'.$filename;

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
        return strtolower($this->outputFormat);
    }

    public function getOutputExtension(): string
    {
        return match ($this->getOutputFormat()) {
            'jpeg' => 'jpg',
            default => $this->getOutputFormat(),
        };
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
