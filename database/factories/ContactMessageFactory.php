<?php

namespace Database\Factories;

use App\Models\ContactMessage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ContactMessage>
 */
class ContactMessageFactory extends Factory
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
            'name' => fake()->name(),
            'email' => fake()->safeEmail(),
            'subject' => fake()->randomElement(['project', 'quote', 'other']),
            'message' => fake()->paragraph(),
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
