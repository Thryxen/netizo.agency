<?php

namespace App\Models;

use Database\Factories\ProjectBriefFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProjectBrief extends Model
{
    /** @use HasFactory<ProjectBriefFactory> */
    use HasFactory;

    protected $fillable = [
        'types',
        'features',
        'industry',
        'audience',
        'design',
        'timeline',
        'tech',
        'security',
        'hosting',
        'integrations',
        'budget',
        'cooperation_model',
        'notes',
        'name',
        'email',
        'phone',
        'company',
        'position',
        'website',
        'source',
        'contact_pref',
    ];

    protected $casts = [
        'types' => 'array',
        'features' => 'array',
        'tech' => 'array',
        'contact_pref' => 'array',
    ];
}
