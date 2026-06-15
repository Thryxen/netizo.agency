<?php

namespace App\Livewire;

use App\Models\ContactMessage;
use App\Services\DiscordWebhookService;
use Livewire\Component;

class QuickContact extends Component
{
    public string $name = '';
    public string $email = '';
    public string $subject = '';
    public string $message = '';
    public bool $submitted = false;

    protected $rules = [
        'name' => 'required|min:2',
        'email' => 'required|email',
        'subject' => 'nullable|string',
        'message' => 'required|min:10',
    ];

    protected $messages = [
        'name.required' => 'Imię i nazwisko jest wymagane.',
        'name.min' => 'Imię musi mieć co najmniej 2 znaki.',
        'email.required' => 'Email jest wymagany.',
        'email.email' => 'Podaj poprawny adres email.',
        'message.required' => 'Wiadomość jest wymagana.',
        'message.min' => 'Wiadomość musi mieć co najmniej 10 znaków.',
    ];

    public function submit()
    {
        $this->validate();

        $data = [
            'name' => $this->name,
            'email' => $this->email,
            'subject' => $this->subject,
            'message' => $this->message,
        ];

        ContactMessage::create($data);

        app(DiscordWebhookService::class)->sendContactMessage($data);

        $this->submitted = true;
        $this->reset(['name', 'email', 'subject', 'message']);
    }

    public function render()
    {
        return view('livewire.quick-contact');
    }
}
