<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $fillable = [
        'slug',
        'sort_order',
        'is_active',
        'title',
        'url',
        'category',
        'description',
        'full_description',
        'thumbnail_image',
        'full_image',
        'tech_stack',
        'metrics',
        'challenges',
        'solutions',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'tech_stack' => 'array',
        'metrics' => 'array',
        'challenges' => 'array',
        'solutions' => 'array',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order');
    }
}
