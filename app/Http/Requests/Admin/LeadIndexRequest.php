<?php

namespace App\Http\Requests\Admin;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

/**
 * Query string of a lead list (search, date range, sorting). Anything outside the allowed values is ignored
 * rather than rejected, so a stale or hand-edited URL never breaks the list.
 */
class LeadIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * No rules on purpose: values of the wrong type or outside the allowed set are normalised in filters().
     *
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [];
    }

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
        $search = $this->searchTerm();
        $from = $this->dateInput('from');
        $until = $this->dateInput('until');
        $filters = $this->filters($sortable);

        return $query
            ->when($search !== '', function (Builder $query) use ($search, $searchable): void {
                $query->where(function (Builder $query) use ($search, $searchable): void {
                    foreach ($searchable as $column) {
                        $query->orWhere($column, 'like', "%{$search}%");
                    }
                });
            })
            ->when($from !== null, fn (Builder $query): Builder => $query->whereDate('created_at', '>=', $from))
            ->when($until !== null, fn (Builder $query): Builder => $query->whereDate('created_at', '<=', $until))
            ->orderBy($filters['sort'], $filters['direction'])
            ->orderByDesc('id');
    }

    /**
     * The filters as the list page shows them (also the normalised form of what was asked for).
     *
     * @param  list<string>  $sortable
     * @return array{search: string, from: string, until: string, sort: string, direction: 'asc'|'desc'}
     */
    public function filters(array $sortable): array
    {
        $sort = $this->input('sort');

        return [
            'search' => $this->searchTerm(),
            'from' => $this->dateInput('from') ?? '',
            'until' => $this->dateInput('until') ?? '',
            'sort' => is_string($sort) && in_array($sort, $sortable, true) ? $sort : 'created_at',
            'direction' => $this->input('direction') === 'asc' ? 'asc' : 'desc',
        ];
    }

    protected function searchTerm(): string
    {
        $search = $this->input('search');

        return is_string($search) ? Str::limit(trim($search), 100, '') : '';
    }

    /**
     * A calendar date in Y-m-d, or null for anything else.
     */
    protected function dateInput(string $key): ?string
    {
        $value = $this->input($key);

        if (! is_string($value) || ! preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', $value, $parts)) {
            return null;
        }

        return checkdate((int) $parts[2], (int) $parts[3], (int) $parts[1]) ? $value : null;
    }
}
