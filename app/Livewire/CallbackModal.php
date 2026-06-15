<?php

namespace App\Livewire;

use App\Models\CallbackRequest;
use App\Services\DiscordWebhookService;
use Livewire\Component;

class CallbackModal extends Component
{
    public bool $isOpen = false;
    public bool $submitted = false;
    public string $phone = '';

    protected $listeners = ['openCallbackModal' => 'open'];

    protected $rules = [
        'phone' => 'required|min:9',
    ];

    protected $messages = [
        'phone.required' => 'Numer telefonu jest wymagany.',
        'phone.min' => 'Podaj poprawny numer telefonu.',
    ];

    public function open()
    {
        $this->isOpen = true;
        $this->submitted = false;
        $this->phone = '';
    }

    public function close()
    {
        $this->isOpen = false;
    }

    public function submit()
    {
        $this->validate();

        CallbackRequest::create([
            'phone' => $this->phone,
        ]);

        app(DiscordWebhookService::class)->sendCallbackRequest($this->phone);

        $this->submitted = true;
    }

    public function render()
    {
        return view('livewire.callback-modal');
    }
}
