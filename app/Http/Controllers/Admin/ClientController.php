<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\ReordersRecords;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\DestroyManyRequest;
use App\Http\Requests\Admin\ReorderRequest;
use App\Http\Requests\Admin\SaveClientRequest;
use App\Models\Client;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ClientController extends Controller
{
    use ReordersRecords;

    public function index(): Response
    {
        return Inertia::render('admin/clients/index', [
            'clients' => Client::query()->ordered()->orderBy('id')->get()
                ->map(fn (Client $client): array => $this->props($client))
                ->all(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/clients/create', [
            'nextSortOrder' => (int) Client::query()->max('sort_order') + 1,
        ]);
    }

    public function store(SaveClientRequest $request): RedirectResponse
    {
        $client = Client::query()->create($request->clientAttributes());

        return to_route('admin.clients.index')->with('success', "Dodano klienta „{$client->name}”.");
    }

    public function edit(Client $client): Response
    {
        return Inertia::render('admin/clients/edit', [
            'client' => $this->props($client),
        ]);
    }

    public function update(SaveClientRequest $request, Client $client): RedirectResponse
    {
        $client->update($request->clientAttributes());

        return to_route('admin.clients.index')->with('success', "Zapisano klienta „{$client->name}”.");
    }

    public function destroy(Client $client): RedirectResponse
    {
        $client->delete();

        return to_route('admin.clients.index')->with('success', "Usunięto klienta „{$client->name}”.");
    }

    public function destroyMany(DestroyManyRequest $request): RedirectResponse
    {
        $count = Client::query()->whereKey($request->ids())->delete();

        return back()->with('success', "Usunięto klientów: {$count}.");
    }

    public function reorder(ReorderRequest $request): RedirectResponse
    {
        $this->applyOrder(Client::query(), $request->ids());

        return back();
    }

    /**
     * @return array{id: int, name: string, url: string|null, sortOrder: int, isActive: bool, updatedAt: string}
     */
    private function props(Client $client): array
    {
        return [
            'id' => $client->id,
            'name' => $client->name,
            'url' => $client->url,
            'sortOrder' => (int) $client->sort_order,
            'isActive' => (bool) $client->is_active,
            'updatedAt' => $client->updated_at?->format('d.m.Y H:i') ?? '',
        ];
    }
}
