<?php

namespace Database\Factories;

use App\Models\CallbackRequest;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CallbackRequest>
 */
class CallbackRequestFactory extends Factory
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
            'phone' => fake()->numerify('+48 ### ### ###'),
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
