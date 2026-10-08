<?php

namespace App\Http\Requests\Admin;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class BriefIndexRequest extends LeadIndexRequest
{
    /**
     * @template TModel of Model
     *
     * @param  Builder<TModel>  $query
     * @param  list<string>  $searchable
     * @param  list<string>  $sortable
     * @return Builder<TModel>
     */
    public function applyTo(Builder $query, array $searchable, array $sortable): Builder
    {
        $budget = $this->choice('budget');
        $timeline = $this->choice('timeline');

        return parent::applyTo($query, $searchable, $sortable)
            ->when($budget !== '', fn (Builder $query): Builder => $query->where('budget', $budget))
            ->when($timeline !== '', fn (Builder $query): Builder => $query->where('timeline', $timeline));
    }

    /**
     * @param  list<string>  $sortable
     * @return array{search: string, from: string, until: string, sort: string, direction: 'asc'|'desc', budget: string, timeline: string}
     */
    public function briefFilters(array $sortable): array
    {
        return [
            ...$this->filters($sortable),
            'budget' => $this->choice('budget'),
            'timeline' => $this->choice('timeline'),
        ];
    }

    private function choice(string $key): string
    {
        $value = $this->input($key);

        return is_string($value) ? trim($value) : '';
    }
}
