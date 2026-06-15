<?php

namespace App\Livewire;

use App\Models\NewsletterSubscriber;
use Livewire\Attributes\Validate;
use Livewire\Component;

class Newsletter extends Component
{
    #[Validate('required|email|unique:newsletter_subscribers,email')]
    public string $email = '';

    public bool $subscribed = false;

    public function subscribe(): void
    {
        $this->validate();

        NewsletterSubscriber::create([
            'email' => $this->email,
        ]);

        $this->subscribed = true;
        $this->email = '';
    }

    public function render()
    {
        return view('livewire.newsletter');
    }
}
