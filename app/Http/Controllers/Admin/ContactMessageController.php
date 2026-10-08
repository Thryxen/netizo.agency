<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\RedirectsToList;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\DestroyManyRequest;
use App\Http\Requests\Admin\LeadIndexRequest;
use App\Models\ContactMessage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ContactMessageController extends Controller
{
    use RedirectsToList;

    private const SEARCHABLE = ['name', 'email', 'subject', 'message'];

    private const SORTABLE = ['name', 'email', 'subject', 'created_at'];

    public function index(LeadIndexRequest $request): Response
    {
        $messages = $request->applyTo(ContactMessage::query(), self::SEARCHABLE, self::SORTABLE)
            ->paginate(25)
            ->withQueryString()
            ->through(fn (ContactMessage $message): array => $this->rowProps($message));

        return Inertia::render('admin/messages/index', [
            'messages' => $messages,
            'filters' => $request->filters(self::SORTABLE),
        ]);
    }

    public function show(ContactMessage $message): Response
    {
        return Inertia::render('admin/messages/show', [
            'message' => [...$this->rowProps($message), 'message' => $message->message],
        ]);
    }

    public function destroy(ContactMessage $message): RedirectResponse
    {
        $message->delete();

        return $this->redirectToList('admin.messages.index', 'Usunięto wiadomość.');
    }

    public function destroyMany(DestroyManyRequest $request): RedirectResponse
    {
        $count = ContactMessage::query()->whereKey($request->ids())->delete();

        return back()->with('success', "Usunięto wiadomości: {$count}.");
    }

    /**
     * @return array{id: int, name: string, email: string, subject: string|null, excerpt: string, createdAt: string}
     */
    private function rowProps(ContactMessage $message): array
    {
        return [
            'id' => $message->id,
            'name' => $message->name,
            'email' => $message->email,
            'subject' => $message->subject,
            'excerpt' => Str::limit((string) $message->message, 90),
            'createdAt' => $message->created_at?->format('d.m.Y H:i') ?? '',
        ];
    }
}
