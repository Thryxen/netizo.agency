<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\RedirectsToList;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\DestroyManyRequest;
use App\Http\Requests\Admin\LeadIndexRequest;
use App\Models\CallbackRequest;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CallbackRequestController extends Controller
{
    use RedirectsToList;

    private const SEARCHABLE = ['phone'];

    private const SORTABLE = ['phone', 'created_at'];

    public function index(LeadIndexRequest $request): Response
    {
        $callbacks = $request->applyTo(CallbackRequest::query(), self::SEARCHABLE, self::SORTABLE)
            ->paginate(25)
            ->withQueryString()
            ->through(fn (CallbackRequest $callback): array => $this->rowProps($callback));

        return Inertia::render('admin/callbacks/index', [
            'callbacks' => $callbacks,
            'filters' => $request->filters(self::SORTABLE),
        ]);
    }

    public function destroy(CallbackRequest $callback): RedirectResponse
    {
        $callback->delete();

        return $this->redirectToList('admin.callbacks.index', 'Usunięto prośbę o kontakt.');
    }

    public function destroyMany(DestroyManyRequest $request): RedirectResponse
    {
        $count = CallbackRequest::query()->whereKey($request->ids())->delete();

        return back()->with('success', "Usunięto próśb o kontakt: {$count}.");
    }

    /**
     * @return array{id: int, phone: string, createdAt: string}
     */
    private function rowProps(CallbackRequest $callback): array
    {
        return [
            'id' => $callback->id,
            'phone' => $callback->phone,
            'createdAt' => $callback->created_at?->format('d.m.Y H:i') ?? '',
        ];
    }
}
