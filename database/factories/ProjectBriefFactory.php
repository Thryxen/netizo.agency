<?php

namespace Database\Factories;

use App\Models\ProjectBrief;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProjectBrief>
 */
class ProjectBriefFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'locale' => 'pl',
            'types' => ['website'],
            'features' => ['auth', 'cms'],
            'industry' => 'saas',
            'audience' => 'b2b',
            'design' => 'partial',
            'timeline' => '1-2',
            'tech' => ['laravel'],
            'security' => 'standard',
            'hosting' => 'help',
            'integrations' => fake()->sentence(),
            'budget' => 'medium',
            'cooperation_model' => 'fixed',
            'notes' => fake()->paragraph(),
            'name' => fake()->name(),
            'email' => fake()->safeEmail(),
            'phone' => fake()->numerify('+48 ### ### ###'),
            'company' => fake()->company(),
            'position' => 'CTO',
            'website' => fake()->domainName(),
            'source' => 'google',
            'contact_pref' => ['email'],
        ];
    }

    /**
     * A lead sent from the English site (/en).
     */
    public function english(): static
    {
        return $this->state(fn (array $attributes): array => ['locale' => 'en']);
    }
}
