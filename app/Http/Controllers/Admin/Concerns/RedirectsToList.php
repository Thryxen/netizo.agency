<?php

namespace App\Http\Controllers\Admin\Concerns;

use Illuminate\Http\RedirectResponse;

trait RedirectsToList
{
    /**
     * Back to the list the record was deleted from, with its filters and page intact; to the bare list from
     * anywhere else, e.g. the detail page of the deleted record. Only the path and query of the previous URL
     * are reused, never its host.
     */
    protected function redirectToList(string $indexRoute, string $message): RedirectResponse
    {
        $index = route($indexRoute);
        $previous = url()->previous();

        if (parse_url($previous, PHP_URL_PATH) !== parse_url($index, PHP_URL_PATH)) {
            return to_route($indexRoute)->with('success', $message);
        }

        $query = parse_url($previous, PHP_URL_QUERY);

        return redirect($query ? "{$index}?{$query}" : $index)->with('success', $message);
    }
}
