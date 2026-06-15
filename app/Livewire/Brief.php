<?php

namespace App\Livewire;

use App\Models\ProjectBrief;
use App\Services\DiscordWebhookService;
use Livewire\Component;

class Brief extends Component
{
    public int $currentStep = 1;
    public int $totalSteps = 6;
    public bool $submitted = false;

    // Step 1: Project types
    public array $types = [];

    // Step 2: Features
    public array $features = [];

    // Step 3: Details
    public string $industry = '';
    public string $audience = '';
    public string $design = '';
    public string $timeline = '';

    // Step 4: Tech
    public array $tech = [];
    public string $security = '';
    public string $hosting = '';
    public string $integrations = '';

    // Step 5: Budget
    public string $budget = '';
    public string $cooperation_model = '';
    public string $notes = '';

    // Step 6: Contact
    public string $name = '';
    public string $email = '';
    public string $phone = '';
    public string $company = '';
    public string $position = '';
    public string $website = '';
    public string $source = '';
    public array $contact_pref = [];
    public bool $privacy = false;

    protected $messages = [
        'types.required' => 'Wybierz przynajmniej jeden typ projektu.',
        'name.required' => 'Imię i nazwisko jest wymagane.',
        'name.min' => 'Imię musi mieć co najmniej 2 znaki.',
        'email.required' => 'Email jest wymagany.',
        'email.email' => 'Podaj poprawny adres email.',
        'privacy.accepted' => 'Musisz zaakceptować politykę prywatności.',
    ];

    public function getProgressProperty(): int
    {
        return round(($this->currentStep / $this->totalSteps) * 100);
    }

    public function nextStep()
    {
        if ($this->currentStep === 1 && empty($this->types)) {
            $this->addError('types', 'Wybierz przynajmniej jeden typ projektu.');
            return;
        }

        if ($this->currentStep === 6) {
            $this->validate([
                'name' => 'required|min:2',
                'email' => 'required|email',
                'privacy' => 'accepted',
            ]);
        }

        if ($this->currentStep < $this->totalSteps) {
            $this->currentStep++;
        } else {
            $this->submit();
        }
    }

    public function previousStep()
    {
        if ($this->currentStep > 1) {
            $this->currentStep--;
        }
    }

    public function goToStep(int $step)
    {
        if ($step >= 1 && $step <= $this->totalSteps) {
            $this->currentStep = $step;
        }
    }

    public function submit()
    {
        $data = [
            'types' => $this->types,
            'features' => $this->features,
            'industry' => $this->industry,
            'audience' => $this->audience,
            'design' => $this->design,
            'timeline' => $this->timeline,
            'tech' => $this->tech,
            'security' => $this->security,
            'hosting' => $this->hosting,
            'integrations' => $this->integrations,
            'budget' => $this->budget,
            'cooperation_model' => $this->cooperation_model,
            'notes' => $this->notes,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'company' => $this->company,
            'position' => $this->position,
            'website' => $this->website,
            'source' => $this->source,
            'contact_pref' => $this->contact_pref,
        ];

        ProjectBrief::create($data);

        app(DiscordWebhookService::class)->sendBrief($data);

        $this->submitted = true;
    }

    public function resetForm()
    {
        $this->reset();
        $this->currentStep = 1;
    }

    public function render()
    {
        return view('livewire.brief');
    }
}
