<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\RedirectsToList;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\DestroyManyRequest;
use App\Http\Requests\Admin\LeadIndexRequest;
use App\Models\PartnerApplication;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PartnerApplicationController extends Controller
{
    use RedirectsToList;

    private const SEARCHABLE = ['name', 'email', 'phone', 'message'];

    private const SORTABLE = ['name', 'email', 'partner_type', 'created_at'];

    public function index(LeadIndexRequest $request): Response
    {
        $partners = $request->applyTo(PartnerApplication::query(), self::SEARCHABLE, self::SORTABLE)
            ->paginate(25)
            ->withQueryString()
            ->through(fn (PartnerApplication $partner): array => $this->rowProps($partner));

        return Inertia::render('admin/partners/index', [
            'partners' => $partners,
            'filters' => $request->filters(self::SORTABLE),
        ]);
    }

    public function show(PartnerApplication $partner): Response
    {
        return Inertia::render('admin/partners/show', [
            'partner' => [...$this->rowProps($partner), 'message' => $partner->message],
        ]);
    }

    public function destroy(PartnerApplication $partner): RedirectResponse
    {
        $partner->delete();

        return $this->redirectToList('admin.partners.index', 'Usunięto zgłoszenie partnera.');
    }

    public function destroyMany(DestroyManyRequest $request): RedirectResponse
    {
        $count = PartnerApplication::query()->whereKey($request->ids())->delete();

        return back()->with('success', "Usunięto zgłoszeń partnerów: {$count}.");
    }

    /**
     * @return array{id: int, name: string, email: string, phone: string|null, partnerType: string, createdAt: string}
     */
    private function rowProps(PartnerApplication $partner): array
    {
        return [
            'id' => $partner->id,
            'name' => $partner->name,
            'email' => $partner->email,
            'phone' => $partner->phone,
            'partnerType' => $partner->partner_type,
            'createdAt' => $partner->created_at?->format('d.m.Y H:i') ?? '',
        ];
    }
}
