<?php

namespace App\Http\Middleware;

use App\Services\LocalizedRoutes;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * The admin panel is a client-rendered app behind a login: no server-side rendering for it.
     *
     * @var list<string>
     */
    protected $withoutSsr = ['admin', 'admin/*'];

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $shared = parent::share($request);

        if (! $this->isAdminRequest($request)) {
            return [
                ...$shared,
                'locale' => app()->getLocale(),
                'alternates' => LocalizedRoutes::alternates($request->route()?->getName()),
            ];
        }

        return [
            ...$shared,
            'auth' => [
                'user' => fn () => $request->user()?->only('id', 'name', 'email'),
            ],
            'sidebarOpen' => $request->cookie('sidebar_state') !== 'false',
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
            ],
        ];
    }

    /**
     * The panel has its own root view, without the tracking scripts and cookie banner of the public site.
     */
    public function rootView(Request $request): string
    {
        return $this->isAdminRequest($request) ? 'admin' : 'app';
    }

    private function isAdminRequest(Request $request): bool
    {
        return $request->is('admin', 'admin/*');
    }
}
