<?php

namespace App\Http\Controllers\Admin\Concerns;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\ValidationException;

trait ReordersRecords
{
    /**
     * Give the listed records positions 1..n in the given order; nothing changes when any id is unknown.
     *
     * @param  Builder<Model>  $query
     * @param  list<int>  $ids
     *
     * @throws ValidationException
     */
    protected function applyOrder(Builder $query, array $ids): void
    {
        if ((clone $query)->whereKey($ids)->count() !== count($ids)) {
            throw ValidationException::withMessages(['ids' => 'Lista zawiera nieistniejące elementy.']);
        }

        $query->getModel()->getConnection()->transaction(function () use ($query, $ids): void {
            foreach ($ids as $position => $id) {
                (clone $query)->whereKey($id)->update(['sort_order' => $position + 1]);
            }
        });
    }
}
