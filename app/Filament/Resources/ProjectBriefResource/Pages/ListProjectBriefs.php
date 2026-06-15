<?php

namespace App\Filament\Resources\ProjectBriefResource\Pages;

use App\Filament\Resources\ProjectBriefResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListProjectBriefs extends ListRecords
{
    protected static string $resource = ProjectBriefResource::class;

    protected function getHeaderActions(): array
    {
        return [];
    }
}
