<?php

namespace Database\Factories;

use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Project>
 */
class ProjectFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'slug' => fake()->unique()->slug(2),
            'sort_order' => fake()->numberBetween(1, 100),
            'is_active' => true,
            'title' => fake()->unique()->words(3, true),
            'url' => fake()->domainName(),
            'category' => 'Strona firmowa',
            'description' => fake()->sentence(),
            'full_description' => fake()->paragraph(),
            'thumbnail_image' => null,
            'full_image' => null,
            'tech_stack' => ['Laravel', 'React'],
            'metrics' => [['value' => '+40%', 'label' => 'konwersji']],
            'challenges' => [['challenge' => fake()->sentence()]],
            'solutions' => [['solution' => fake()->sentence()]],
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes): array => ['is_active' => false]);
    }
}
