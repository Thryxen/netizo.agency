<?php

namespace App\Filament\Resources\ProjectBriefResource\Pages;

use App\Filament\Resources\ProjectBriefResource;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;

class ViewProjectBrief extends ViewRecord
{
    protected static string $resource = ProjectBriefResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
