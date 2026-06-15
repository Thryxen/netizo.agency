<?php

namespace App\Livewire;

use App\Models\Project;
use Livewire\Component;

class CaseStudyModal extends Component
{
    public bool $isOpen = false;
    public ?Project $project = null;
    public int $projectPosition = 1;

    protected $listeners = ['openCaseStudy' => 'open'];

    public function open(string $projectSlug)
    {
        $this->project = Project::where('slug', $projectSlug)
            ->where('is_active', true)
            ->first();

        if ($this->project) {
            // Calculate position in the ordered list
            $orderedProjects = Project::where('is_active', true)
                ->orderBy('sort_order')
                ->orderBy('id')
                ->pluck('id')
                ->toArray();

            $this->projectPosition = array_search($this->project->id, $orderedProjects) + 1;
            $this->isOpen = true;
        }
    }

    public function close()
    {
        $this->isOpen = false;
        $this->project = null;
        $this->projectPosition = 1;
    }

    public function render()
    {
        return view('livewire.case-study-modal');
    }
}
